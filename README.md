# Termicolor

Create beautiful terminal color schemes from any image.

![Termicolor](https://img.shields.io/badge/made%20by-haai-8b5cf6)

## Features

- **Image-based color extraction** - Drop any image and get a complete terminal color palette
- **Smart color mapping** - Automatically maps extracted colors to ANSI slots based on hue proximity
- **Grayscale detection** - Generates appropriate grayscale palettes for black & white images
- **Background detection** - Samples image corners to capture background colors that might be missed
- **Live terminal preview** - See your theme in action with realistic bash, code, and swatch views
- **Dark/Light mode** - Toggle between dark and light terminal themes
- **Readability analysis** - WCAG contrast checking with auto-fix options
- **Multiple export formats**:
  - iTerm2 (.itermcolors)
  - Alacritty (.toml)
  - Kitty (.conf)
  - Windows Terminal (.json)
  - Hyper (.js)
  - Terminal.app (.terminal) - experimental
- **Import support** - Load existing .itermcolors files
- **Profile management** - Save and manage your favorite color schemes locally

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Upload an image** - Drag & drop or click to select an image
2. **Preview your theme** - See the generated colors in the terminal preview
3. **Adjust colors** - Click any color swatch to fine-tune with the color picker
4. **Fix contrast issues** - Use the magic wand to auto-fix readability problems
5. **Export** - Download your theme in your preferred terminal format

## Tech Stack

- React + TypeScript
- Vite
- Mantine UI
- ColorThief for color extraction

## License

MIT
