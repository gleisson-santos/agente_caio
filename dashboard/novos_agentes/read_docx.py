import zipfile
import xml.etree.ElementTree as ET
import os

def get_docx_text(path):
    """Simple docx to text extractor using zipfile/xml."""
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            paragraphs = []
            for p in tree.findall('.//w:p', ns):
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return str(e)

path = r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\Modelos Prontos de Agentes (Alunos Sem Codar).docx"
text = get_docx_text(path)
with open(r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\docx_content.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Done writing to docx_content.txt")
