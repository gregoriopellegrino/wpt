
def clean_json_string(input_string):
    cleaned_string = input_string.decode('utf-8').replace("\\", "")
    cleaned_string = cleaned_string.replace("\"{", "{").replace("}\"", "}")
    cleaned_string = cleaned_string.replace("\"[", "[").replace("]\"", "]")
    cleaned_string = cleaned_string.replace("\"\"", "\"")
    return cleaned_string

def main(request, response):
    response.status = (200, b"OK")
    response.headers.set(b"Ad-Auction-Allowed", b"true")
    response.headers.set(b"Content-Type", b"application/json")
    body = request.GET.first(b"body", None)
    return clean_json_string(body)