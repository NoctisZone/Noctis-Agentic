"""Serve the site locally the way GitHub Pages does: a path with no file behind
it gets 404.html (the same app shell), so deep links such as /agents/GLITCHMOTHER work.

    python tools/serve.py            # http://127.0.0.1:8080
    python tools/serve.py 8090
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class Pages(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_error(self, code, message=None, explain=None):
        if code != 404:
            return super().send_error(code, message, explain)
        body = open(os.path.join(ROOT, '404.html'), 'rb').read()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)


Pages.extensions_map.update({'.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2'})

if __name__ == '__main__':
    print(f'Noctis Agentic on http://127.0.0.1:{PORT}  (root {ROOT})')
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Pages).serve_forever()
