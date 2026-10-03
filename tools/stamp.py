"""Stamp the site's version on every stylesheet and script it loads, so a new deploy reaches a
visitor on an ordinary refresh.

GitHub Pages serves every file with a ten-minute cache. A refresh asks for the page again, but a
stylesheet or script the browser already holds is used without asking, so for up to ten minutes a
visitor saw the new page drawn by the old CSS and JS. With a version on each URL, a changed site
is a changed page that names files the browser has never seen, and it fetches them.

One version for the whole site: the first ten hex digits of a SHA-256 over the page and every
stylesheet and script, read with their line endings as LF and their own version tags taken out,
so stamping never changes what it stamps. Run it before every commit; nothing else builds the
site, and the files are served exactly as committed.

    python tools/stamp.py           # write the version into index.html, 404.html and the modules
    python tools/stamp.py --check   # exit 1, changing nothing, if a file is not on the version
"""
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAG = re.compile(rb'\?v=[0-9a-f]*')
# The page's stylesheets and scripts: /assets/css/*.css, /assets/fonts/fonts.css, /assets/js/*.js.
PAGE_REF = re.compile(rb'((?:href|src)="/assets/(?:css|fonts|js)/[\w.-]+\.(?:css|js))(?:\?v=[0-9a-f]*)?"')
# A module importing a sibling: from './shared.js'. Every module must name a sibling by the same
# URL, or the browser loads it twice, as two modules with two copies of their state.
IMPORT_REF = re.compile(rb"(from\s+'\./[\w-]+\.js)(?:\?v=[0-9a-f]*)?'")


def sources():
    files = ['index.html', 'assets/fonts/fonts.css']
    for sub, ext in (('assets/css', '.css'), ('assets/js', '.js')):
        files += sorted(f'{sub}/{n}' for n in os.listdir(os.path.join(ROOT, sub)) if n.endswith(ext))
    return files


def read(rel):
    with open(os.path.join(ROOT, rel), 'rb') as f:
        return f.read()


def version():
    h = hashlib.sha256()
    for rel in sources():
        h.update(rel.encode() + b'\0' + TAG.sub(b'', read(rel).replace(b'\r\n', b'\n')) + b'\0')
    return h.hexdigest()[:10]


def stamped(rel, body, v):
    tag = b'?v=' + v.encode()
    if rel.endswith('.html'):
        return PAGE_REF.sub(lambda m: m.group(1) + tag + b'"', body)
    if rel.endswith('.js'):
        return IMPORT_REF.sub(lambda m: m.group(1) + tag + b"'", body)
    return body


def main():
    check = '--check' in sys.argv[1:]
    v = version()
    targets = ['index.html', '404.html'] + [r for r in sources() if r.endswith('.js')]
    stale = []
    for rel in targets:
        body = read(rel)
        new = stamped(rel, body, v)
        if new != body:
            stale.append(rel)
            if not check:
                with open(os.path.join(ROOT, rel), 'wb') as f:
                    f.write(new)
    if read('index.html') != read('404.html'):
        print('404.html differs from index.html; it must be a byte-for-byte copy')
        return 1
    if check:
        print(f'version {v}: ' + ('stale in ' + ', '.join(stale) if stale else 'every file is on it'))
        return 1 if stale else 0
    print(f'version {v}: ' + ('stamped ' + ', '.join(stale) if stale else 'already on it'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
