from llama_parse import LlamaParse


def parse_pdf(file_path: str, api_key: str):
    parser = LlamaParse(api_key=api_key, result_type="markdown")
    return parser.load_data(file_path)
