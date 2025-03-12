
from concurrent.futures import ThreadPoolExecutor
import os
from admin.categorizer.text_categorizer import TextCategorizer
from admin.categorizer.text_extractor import extract_text_from_pdf
from elasticsearch import Elasticsearch,helpers
import argparse
from tqdm import tqdm 

BATCH_SIZE = 1000
NUM_THREADS = 5 



def get_arguments():
    parser = argparse.ArgumentParser(description="Index PDF files to Elasticsearch")
    parser.add_argument("--batch_size", default=BATCH_SIZE, help="Batch Size for Indexing")
    parser.add_argument("--threads", default=NUM_THREADS, help="Number of threads to use for indexing")
    parser.add_argument("pdf_dir", type=str, help="Directory containing PDF files")
    parser.add_argument("dictionary_path", type=str, help="Path to the dictionary file")

    return parser.parse_args()

def get_elasticsearch_client():
    return Elasticsearch(['http://localhost:9200'])


def process_pdf(pdf_file, pdf_dir,categorizer:TextCategorizer):
    """Extract text from a PDF and return a document for indexing."""
    pdf_path = os.path.join(pdf_dir, pdf_file)
    text = extract_text_from_pdf(pdf_path)
    category = categorizer.categorize(text)
    return {'_index': 'pdf_index', '_source':   {'path': pdf_file , 'content': text ,'category':category}}

def generate_batches(pdf_list, pdf_dir, batch_size,categorizer):
    """Generator that processes PDFs in batches, avoiding memory overload."""
    with ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        future_docs = executor.map(lambda pdf: process_pdf(pdf, pdf_dir,categorizer), pdf_list)
        
        batch = []
        for doc in tqdm(future_docs, total=len(pdf_list), desc="Processing PDFs", unit="pdf"):
            batch.append(doc)
            if len(batch) >= batch_size:
                yield batch
                batch = []  # Reset batch
        
        if batch:  # Yield remaining documents
            yield batch

def get_indexed_pdfs(es_client:Elasticsearch, index_name="pdf_index"):
    """Fetch a set of already indexed PDF paths from Elasticsearch."""

    indices =es_client.indices
    if not indices.exists(index=index_name):
        return set()

    query = {
        "_source": ["path"],
        "query": {"match_all": {}}
    }
    
    indexed_pdfs = set()
    scroll_size = 1000  # Number of results per request
    response = es_client.search(index=index_name, body=query, scroll="2m", size=scroll_size)

    while len(response["hits"]["hits"]) > 0:
        for doc in response["hits"]["hits"]:
            indexed_pdfs.add(doc["_source"]["path"])  # Store path in a set

        scroll_id = response["_scroll_id"]
        response = es_client.scroll(scroll_id=scroll_id, scroll="2m")  # Get next batch

    return indexed_pdfs  # Return set of indexed PDF paths



def main():
    args = get_arguments()
    pdf_dir = args.pdf_dir
    batch_size = int(args.batch_size)
    # model_path = args.model_path
    dictionary_path = args.dictionary_path
    categorizer = TextCategorizer(None, dictionary_path)


    es_client = get_elasticsearch_client()
    pdf_list = [pdf_file for pdf_file in os.listdir(pdf_dir) if pdf_file.endswith(".pdf") and not pdf_file.startswith(".")]  
    print(f"Found {len(pdf_list)} PDF files. Retrieving already indexed files...")

    indexed_pdfs = get_indexed_pdfs(es_client)  # Get already indexed PDFs
    pdf_list = [pdf for pdf in pdf_list if pdf not in indexed_pdfs]  # Remove indexed PDFs

    print(f"Skipping {len(indexed_pdfs)} already indexed PDFs. Processing {len(pdf_list)} new PDFs...")


    for batch in tqdm(generate_batches(pdf_list, pdf_dir, batch_size,categorizer), total=len(pdf_list) // batch_size + 1):
        helpers.bulk(es_client, batch)
        print(f"Indexed {len(batch)} PDFs...")
    
    print("Indexing completed.")

if __name__ == "__main__":
    main()