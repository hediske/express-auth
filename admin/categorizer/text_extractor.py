import argparse
import re
import fitz 
import pytesseract
from pdf2image import convert_from_path

def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        text = re.sub(r"\s+", " ", text).strip() 
        if text.startswith("………………………………………………………………………………………………………") or text == "":
            # Perform OCR to extract text
            # text = perform_ocr(pdf_path)
            return text
        return text
    
    except Exception as error:
            print(f"An error occurred: {error}")
            return ""
    
def perform_ocr(pdf_path):
    print("Doing OCR")
    pages = convert_from_path(pdf_path, 600)
    text_data = ''
    for page in pages:
        text = pytesseract.image_to_string(page)
        text_data += text + '\n'
    return text_data


def get_arguments():
    parser = argparse.ArgumentParser(description="Text From Pdf")
    parser.add_argument("pdf_dir", type=str, help="Pdf Path")
    return parser.parse_args()


def main():
    args = get_arguments()
    pdf_dir = args.pdf_dir
    print(extract_text_from_pdf(pdf_dir))

if __name__ == "__main__":
    main()