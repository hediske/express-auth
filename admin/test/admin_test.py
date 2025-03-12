import unittest
import os

from admin.categorizer.text_categorizer import TextCategorizer

class Test(unittest.TestCase):
    def test_categorize(self):
        """Test categorization with dictionary."""
        dict_path = os.path.join(os.path.dirname(__file__), '../dict.json')
        categorizer = TextCategorizer(dict_path)
        self.assertEqual(categorizer.categorize("hello world"), None)
        self.assertEqual(categorizer.categorize("Bac 5éme"), "Bac")
        self.assertEqual(categorizer.categorize("lorem epsum Bac"), "Bac")
        self.assertEqual(categorizer.categorize("3eme-Reo Annee"), "3s")

if __name__ == '__main__':
    unittest.main()


                         