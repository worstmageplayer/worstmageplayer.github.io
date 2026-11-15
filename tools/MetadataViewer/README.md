# Local metadata viewer

Serve the repository with a static HTTP server and open `/tools/MetadataViewer/`.
For example: `python3 -m http.server 8000` from the repository root.
All dependencies are bundled locally. No file data leaves the browser.

Rebuild: `npm ci && node build.mjs` in this directory. Commit the generated
worker.js, its license notice, and vendor directory for static hosting.

Extraction runs in two isolated workers with 45-second deadlines. Images and
PDFs have a 128 MB limit; fonts and ZIP containers have a 32 MB limit.
MediaInfo reads slices for audio/video. ZIP extraction only expands document
metadata, limited to 2 MB, and lists at most 10,000 entries.

Support depends on the parser and file variant. Image EXIF/IPTC/XMP/ICC,
audio/video tracks, PDF properties, ZIP entries and font names are extracted.
Office, OpenDocument and EPUB metadata is shown as raw XML to preserve fields.
WOFF2, SVG, arbitrary text, executable and unsupported RAW formats do not have
dedicated parsers. No previews, remote maps, editing, or persistent file history.

Validation still requires representative real-world fixtures for each advertised
format; parser support does not imply that every variant contains readable tags.
