# biome-json-to-checkstyle

## Installation

Install globally or as a dev dependency using npm:

```bash
npm install -g biome-json-to-checkstyle
# or for local usage
npm install --save-dev biome-json-to-checkstyle
```

## CLI Usage

```bash
biome-json-to-checkstyle <input.json> <output.xml>
```

- `<input.json>`: Path to the Biome JSON report
- `<output.xml>`: Path to write the Checkstyle XML output

**Example:**
```bash
biome-json-to-checkstyle biome_report.json biome_report.xml
```

## Node.js Usage

```js
import biomeJsonToCheckstyle from 'biome-json-to-checkstyle';

await biomeJsonToCheckstyle('biome_report.json', 'biome_report.xml');
```
