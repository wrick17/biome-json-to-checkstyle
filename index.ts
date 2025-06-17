#!/usr/bin/env node
import { promises as fs } from 'node:fs';
// Convert biome_report.json to biome_report.xml in checkstyle format using Bun APIs

// Utility to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Type for Biome diagnostics
interface BiomeDiagnostic {
  category?: string;
  severity?: string;
  description?: string;
  message?: { content: string }[];
  location?: {
    path?: { file?: string };
    span?: [number, number] | null;
    sourceCode?: string;
  };
}

/**
 * Converts a Biome JSON report to Checkstyle XML format and writes to output file.
 * @param inputFile Path to the input Biome JSON file
 * @param outputFile Path to the output Checkstyle XML file
 */
async function biomeJsonToCheckstyle(inputFile: string, outputFile: string): Promise<void> {
  // Read and parse the Biome JSON report
  const biomeRaw = await fs.readFile(inputFile, 'utf8');
  const biome = JSON.parse(biomeRaw);

  // Group diagnostics by file
  const files: Record<string, BiomeDiagnostic[]> = {};
  for (const diag of biome.diagnostics as BiomeDiagnostic[]) {
    const file = diag.location?.path?.file;
    if (!file) continue;
    if (!files[file]) files[file] = [];
    files[file].push(diag);
  }

  // Start XML
  let xml = '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3">';

  for (const [file, diags] of Object.entries(files)) {
    xml += `<file name="${escapeXml(file)}">`;
    for (const diag of diags) {
      // Biome may not have line/column, so default to 1 if missing
      const line = 1;
      const column = 1;
      const severity = escapeXml(diag.severity || 'error');
      const message = escapeXml(
        (diag.message?.map((m) => m.content).join(' ') || diag.description || '')
      );
      const source = escapeXml(diag.category || 'biome');
      xml += `<error line="${line}" column="${column}" severity="${severity}" message="${message}" source="${source}" />`;
    }
    xml += '</file>';
  }

  xml += '</checkstyle>';

  // Write to output XML file
  await fs.writeFile(outputFile, xml, 'utf8');
}

export default biomeJsonToCheckstyle;

// CLI usage
if (require.main === module || (import.meta && import.meta.main)) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: biome-json-to-checkstyle <input.json> <output.xml>');
    process.exit(1);
  }
  const inputFile = args[0];
  const outputFile = args[1];
  if (!inputFile || !outputFile) {
    console.error('Input and output file names are required.');
    process.exit(1);
  }
  biomeJsonToCheckstyle(inputFile, outputFile)
    .then(() => {
      console.log(`${outputFile} written!`);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
