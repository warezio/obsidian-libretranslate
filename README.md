# Obsidian LibreTranslate Plugin

Provides real-time translation in Obsidian using the LibreTranslate API.

## Features

- ✅ Translate the entire current note
- ✅ Translate selected text
- ✅ Support for self-hosted LibreTranslate servers
- ✅ Use the free API (self-hosted)

## Installation

### 1. Build the plugin

```bash
# Install dependencies
npm install obsidian typescript

# Build
npm run build
```

### 2. Copy to Obsidian

Copy the built `main.js` and `manifest.json` to the Obsidian plugins folder:

```
/Users/warezio/Library/Application Support/obsidian/plugins/obsidian-libretranslate/
├── main.js
├── manifest.json
└── styles.css
```

### 3. Enable in Obsidian

Enable `Settings > Community plugins > LibreTranslate for Obsidian`.

## Usage

### Method 1: Translate the current note
```
Cmd/Ctrl + P → "LibreTranslate: Translate current note"
```

### Method 2: Translate selected text
```
텍스트 선택 → Cmd/Ctrl + P → "LibreTranslate: Translate selection"
```

## Settings

| Setting | Description | Default |
|------|--------|--------|
| API URL | LibreTranslate server URL | https://libretranslate.com |
| API Key | Optional API token | empty (public server) |
| Source Language | Language to translate from | auto |
| Target Language | Language to translate to | English |

## Self-hosting

### Option 1: Docker

```bash
docker run -d -p 5000:5000 libretranslate/libretranslate
```

### Option 2: Local install

```bash
pip install libretranslate
libretranslate --load-only argos --port 5000
```

In settings, change the API URL to `http://localhost:5000`.

## API Response Example

```json
{
  "translatedText": "Translated text",
  "detectedLanguage": {
    "confidence": 0.99,
    "language": "ko"
  }
}
```

## Development

```bash
# Development mode
npm run dev

# Build
npm run build
```

## License

MIT License

## References

- [LibreTranslate API Docs](https://libretranslate.com/docs)
- [Obsidian Plugin Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
