Fonts
=====

This site loads its typefaces from Google Fonts via a <link> in each page's
<head>, so no font files are required in this folder for the site to work:

  - Cormorant Garamond  (headings / display)
  - Inter               (body / UI)

If you prefer to SELF-HOST the fonts (for full offline use or stricter
privacy), download the two families from https://fonts.google.com, drop the
.woff2 files into this folder, and replace the Google Fonts <link> tags in
each HTML file with an @font-face block pointing at:

  fonts/CormorantGaramond-*.woff2
  fonts/Inter-*.woff2

The site is fully functional as-is using the CDN links.
