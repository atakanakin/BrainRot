import os
import PyPDF2
import docx
from bs4 import BeautifulSoup
from pptx import Presentation

# WORDS_PER_MINUTE = 150  # avg words per minute
# MAX_SPEECH_DURATION_MINUTES = 2
# MAX_WORD_COUNT = WORDS_PER_MINUTE * MAX_SPEECH_DURATION_MINUTES

def extract_text(input_path, output_dir):
    """
    Extract text from a given file and save it as a .txt file.

    Args:
        input_path (str): Path to the input file.
        output_dir (str): Directory to save the output .txt file.

    Returns:
        str: Path to the generated .txt file.
    """

    file_name, file_extension = os.path.splitext(os.path.basename(input_path))
    file_extension = file_extension.lower()

    output_path = os.path.join(output_dir, f"{file_name}.txt")

    def save_text(content):
        with open(output_path, "w", encoding="utf-8") as file:
            file.write(content)
        # get the word count
        word_count = len(content.split(" "))
        return output_path, word_count

    if file_extension == ".txt":
        with open(input_path, "r", encoding="utf-8") as file:
            content = file.read()
        return save_text(content)

    elif file_extension == ".docx":
        doc = docx.Document(input_path)
        content = "\n".join([para.text for para in doc.paragraphs])
        return save_text(content)

    elif file_extension == ".pdf":
        content = []
        with open(input_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                content.append(page.extract_text())
        return save_text("\n".join(content))

    elif file_extension == ".pptx":
        presentation = Presentation(input_path)
        content = []
        for slide in presentation.slides:
            for shape in slide.shapes:
                if shape.has_text_frame:
                    content.append(shape.text)
        return save_text("\n".join(content))

    elif file_extension == ".html":
        with open(input_path, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")
        text = soup.get_text(separator="\n")
        return save_text(text)

    else:
        raise ValueError(f"Unsupported file format: {file_extension}")
