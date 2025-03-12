from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from elasticsearch import Elasticsearch
import os
from admin.utils.es_utils import check
from admin.categorizer.text_extractor import extract_text_from_pdf
from admin.categorizer.text_categorizer import TextCategorizer
from admin.pdf_index import process_pdf, get_elasticsearch_client

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Elasticsearch client
es = get_elasticsearch_client()

# Initialize text categorizer
dictionary_path = os.path.join(os.path.dirname(__file__), 'dict.json')
categorizer = TextCategorizer(dictionary_path)

# Upload directory
UPLOAD_FOLDER = os.getenv('UPLOADS_FILE', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/get', methods=['GET'])
def get_document_by_id():
    id = request.args.get('id')
    result = es.get(index="pdf_index", id=id)
    return jsonify(result["_source"])

@app.route('/api/download', methods=['GET'])
def get_pdf():
    id = request.args.get('id')
    result = es.get(index="pdf_index", id=id)
    path = result["_source"]["path"]
    return send_from_directory(UPLOAD_FOLDER, path)

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('query', '*')
    category = request.args.get('category', None)
    size = int(request.args.get('size', 10))
    from_ = int(request.args.get('from', 0))
    sort = request.args.getlist('sort')
    
    es_query = {
        "query": {
            "query_string": {
                "query": query
            }
        },
        "size": size,
        "from": from_,
        "sort": sort
    }
    
    if category:
        es_query["query"] = {
            "bool": {
                "must": {"query_string": {"query": query}},
                "filter": [{"term": {"category": category}}]
            }
        }
    
    if not es.indices.exists(index="pdf_index"):
        return ({"error": "Index pdf_index does not exist"}, 400)

    results = es.search(index="pdf_index", body=es_query)
    return jsonify({
        "hits": results["hits"]["total"]["value"],
        "results": [{ 
                      "id": hit["_id"],
                      "path": hit["_source"]["path"],
                      "category": hit["_source"].get("category", "None"),
                      "score": hit["_score"],
                      "content":hit["_source"]["content"][:200] + "..." if "content" in hit["_source"] else None
                      } for hit in results["hits"]["hits"]]

    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    with open(dictionary_path, 'r', encoding='utf-8') as f:
        import json
        dictionary = json.load(f)
    return jsonify(list(dictionary.keys()))

@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "File must be a PDF"}), 400
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    # Process the PDF
    text = extract_text_from_pdf(file_path)
    category = categorizer.categorize(text)
    
    # Index to Elasticsearch
    doc = {
        'path': file.filename,
        'content': text,
        'category': category
    }
    
    es.index(index="pdf_index", document=doc)
    
    return jsonify({
        "success": True,
        "filename": file.filename,
        "category": category
    })


@app.route('/api/updatecategory', methods=['POSTpos'])
def update_category():
    id = request.json.get('id')
    category = request.json.get('category')
    
    # Update the category in Elasticsearch
    es.update(index="pdf_index", id=id, body={"doc": {"category": category}})
    
    return jsonify({"success": True})

@app.route('/api/updatesubject', methods=['POST'])
def update_subject():
    id = request.json.get('id')
    subject = request.json.get('subject')
    
    # Update the category in Elasticsearch
    es.update(index="pdf_index", id=id, body={"doc": {"subject": subject}})
    
    return jsonify({"success": True})

@app.route('/api/updatesection', methods=['POST'])
def update_section():
    id = request.json.get('id')
    section = request.json.get('section')
    
    # Update the category in Elasticsearch
    es.update(index="pdf_index", id=id, body={"doc": {"section": section}})
    
    return jsonify({"success": True})



@app.route("/", methods=['GET'])
def check_health():
    if es.ping():
        return jsonify({"status":"UP", "message":" Connected to Elasticsearch"})
    else:
        return jsonify({"status":"DOWN", "message":"Could not connect to Elasticsearch"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)