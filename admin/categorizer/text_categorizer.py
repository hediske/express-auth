
import joblib
import json

class TextCategorizer:
    def __init__(self, dictionary_path):
        # self.model = self.load_model(model_path)
        # self.vectorizer = self.load_vectorizer(model_path)
        self.dictionary = self.load_dictionary(dictionary_path)
    
    def load_model(self, model_path):
        """Load the trained ML model."""
        return joblib.load(model_path)

    def load_vectorizer(self, model_path):
        """Load the TF-IDF vectorizer (stored with the model)."""
        return joblib.load(model_path.replace(".pkl", "_vectorizer.pkl"))

    def load_dictionary(self, dictionary_path):
        """Load the keyword dictionary from a JSON file."""
        with open(dictionary_path, "r", encoding="utf-8") as file:
            return json.load(file)
    
    def categorize_with_dictionary(self, text):
        """Categorize text using predefined keywords based on first occurrence."""
        text = text.lower()  # Normalize text
        min_pos = float('inf')  # Store the minimum position found
        best_match = None  # Store the corresponding category
        for value, keywords in self.dictionary.items():
            for keyword in keywords:
                pos = text.find(keyword)  # Find keyword position
                if 0 <= pos < min_pos:  # Check if it appears earlier than previous matches
                    min_pos = pos
                    best_match = value  # Store the corresponding category
        
        return best_match  # Return the category of the first found keyword

    # def categorize_with_ml(self, text):
    #     """Categorize text using the trained ML model."""
    #     vector = self.vectorizer.transform([text])
    #     return self.model.predict(vector)[0]

    def categorize(self, text):
        """Try dictionary-based categorization first, then fallback to ML."""
        category = self.categorize_with_dictionary(text)
        if category:
            return category  # Use dictionary match if found
        return None
        # return self.categorize_with_ml(text)  # Otherwise, use ML prediction
