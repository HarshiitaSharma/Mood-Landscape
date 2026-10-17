#!/usr/bin/env bash
# From a fresh folder/repo containing these files. One commit per piece.
set -e
git init -q 2>/dev/null || true
c() { m="$1"; shift; git add "$@" && git commit -q -m "$m"; echo "✓ $m"; }
c "Add .gitignore and MIT license"                .gitignore LICENSE
c "Add feeling vocabulary module"                 words.js
c "Add landscape styles"                          styles.css
c "Add landscape renderer and controls"           script.js
c "Add ambient sound"                             sound.js
c "Add app icon"                                  icon.svg
c "Add page shell"                                index.html
c "Add PWA manifest and offline service worker"   manifest.webmanifest sw.js pwa.js
c "Add GitHub Pages deploy workflow"              .github/workflows/pages.yml
c "Add changelog"                                 CHANGELOG.md
c "Add README"                                    README.md
git log --oneline | head -12
