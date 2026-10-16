# Mood Landscape

Type how you feel and watch a generated landscape change with you: stormy to sunny, still to restless, night to day.

One static HTML file. No build step, no dependencies, nothing leaves your browser.

## How it works

- Three values drive the whole scene: **mood** (stormy to bright), **energy** (still to restless) and **time** (night to day).
- Type a feeling and known words (calm, anxious, happy, tired...) set those values. Several words are averaged. Or just move the sliders.
- Mood sets the palette, the clouds and the rain. Low mood with high energy brings lightning. Energy sets how fast things move. Time brings stars, moon, sun and fireflies.
- Values ease smoothly toward their targets, so the scene transitions instead of jumping.
- **New landscape** reshapes the mountains, trees and clouds. **Save PNG** exports the current frame.
- Respects `prefers-reduced-motion` (the scene stays still) and the system light and dark theme.

## Run it

Open `index.html`, or host it with GitHub Pages (**Settings → Pages → Deploy from a branch → `main` / root**).

## Ideas for later

- Hinglish and Hindi feeling words
- A small "daily landscape" diary that stores one image per day in the browser
- Ambient sound that follows the weather
- Water reflections and seasons
- Replace the keyword map with a real sentiment model
