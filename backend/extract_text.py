import os
import PyPDF2
import docx
from bs4 import BeautifulSoup
from pptx import Presentation

def extract_text_from_file(input_path, output_dir):
    """
    Extract text from a given file and save it as a .txt file.

    Args:
        input_path (str): Path to the input file.
        output_dir (str): Directory to save the output .txt file.

    Returns:
        str: Path to the generated .txt file.
    """
    os.makedirs(output_dir, exist_ok=True)

    file_name, file_extension = os.path.splitext(os.path.basename(input_path))
    file_extension = file_extension.lower()

    output_path = os.path.join(output_dir, f"{file_name}.txt")

    if file_extension == ".txt":
        with open(input_path, "r", encoding="utf-8") as file:
            content = file.read()
        with open(output_path, "w", encoding="utf-8") as file:
            file.write(content)
        return output_path

    elif file_extension == ".docx":
        doc = docx.Document(input_path)
        content = "\n".join([para.text for para in doc.paragraphs])
        with open(output_path, "w", encoding="utf-8") as file:
            file.write(content)
        return output_path

    elif file_extension == ".pdf":
        content = []
        with open(input_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                content.append(page.extract_text())
        with open(output_path, "w", encoding="utf-8") as file:
            file.write("\n".join(content))
        return output_path

    elif file_extension == ".pptx":
        presentation = Presentation(input_path)
        content = []
        for slide in presentation.slides:
            for shape in slide.shapes:
                if shape.has_text_frame:
                    content.append(shape.text)
        with open(output_path, "w", encoding="utf-8") as file:
            file.write("\n".join(content))
        return output_path

    elif file_extension == ".html":
        with open(input_path, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")
        text = soup.get_text(separator="\n")
        with open(output_path, "w", encoding="utf-8") as file:
            file.write(text)
        return output_path

    else:
        raise ValueError(f"Unsupported file format: {file_extension}")
