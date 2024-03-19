import zlib

def main(request, response):
    if b'content_encoding' in request.GET:
        response.headers.set(b'content-encoding', request.GET.first(b'content_encoding'))
    if b'allow_origin' in request.GET:
        response.headers.set(b'access-control-allow-origin', request.GET.first(b'allow_origin'))
