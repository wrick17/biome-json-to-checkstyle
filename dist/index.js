#!/usr/bin/env node
import { createRequire } from "node:module";
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// index.ts
import { promises as fs } from "node:fs";
function escapeXml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
async function biomeJsonToCheckstyle(inputFile, outputFile) {
  const biomeRaw = await fs.readFile(inputFile, "utf8");
  const biome = JSON.parse(biomeRaw);
  const files = {};
  for (const diag of biome.diagnostics) {
    const file = diag.location?.path?.file;
    if (!file)
      continue;
    if (!files[file])
      files[file] = [];
    files[file].push(diag);
  }
  let xml = '<?xml version="1.0" encoding="utf-8"?><checkstyle version="4.3">';
  for (const [file, diags] of Object.entries(files)) {
    xml += `<file name="${escapeXml(file)}">`;
    for (const diag of diags) {
      const line = 1;
      const column = 1;
      const severity = escapeXml(diag.severity || "error");
      const message = escapeXml(diag.message?.map((m) => m.content).join(" ") || diag.description || "");
      const source = escapeXml(diag.category || "biome");
      xml += `<error line="${line}" column="${column}" severity="${severity}" message="${message}" source="${source}" />`;
    }
    xml += "</file>";
  }
  xml += "</checkstyle>";
  await fs.writeFile(outputFile, xml, "utf8");
}
var biome_json_to_checkstyle_default = biomeJsonToCheckstyle;
if (__require.main == __require.module || import.meta && __require.main == __require.module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error("Usage: biome-json-to-checkstyle <input.json> <output.xml>");
    process.exit(1);
  }
  const inputFile = args[0];
  const outputFile = args[1];
  if (!inputFile || !outputFile) {
    console.error("Input and output file names are required.");
    process.exit(1);
  }
  biomeJsonToCheckstyle(inputFile, outputFile).then(() => {
    console.log(`${outputFile} written!`);
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
export {
  biome_json_to_checkstyle_default as default
};
