const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlRoot = path.join(root, "html");
const assetsDir = path.join(htmlRoot, "assets");

const jsonFiles = [
  "errors.json",
  "grammar.json",
  "learning.json",
  "lessons/lesson_2026-03-13.json",
  "results/results_2026_03_13.json",
  "vocabulary/adjectives.json",
  "vocabulary/idioms.json",
  "vocabulary/nouns.json",
  "vocabulary/phrasal_verbs.json",
  "vocabulary/phrases.json",
  "vocabulary/verbs.json",
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pageTitleFromJson(relativePath) {
  return relativePath.replace(/\.json$/i, "");
}

function htmlPathFromJson(relativePath) {
  return path.join(htmlRoot, relativePath.replace(/\.json$/i, ".html"));
}

function relativeAssetPath(htmlPath, assetRelativePath) {
  return path.relative(path.dirname(htmlPath), path.join(htmlRoot, assetRelativePath)).replace(/\\/g, "/");
}

function renderPage(relativeJsonPath) {
  const sourcePath = path.join(root, relativeJsonPath);
  const htmlPath = htmlPathFromJson(relativeJsonPath);
  const rawJson = fs.readFileSync(sourcePath, "utf8");
  const title = pageTitleFromJson(relativeJsonPath);
  const cssPath = relativeAssetPath(htmlPath, "assets/styles.css");
  const jsPath = relativeAssetPath(htmlPath, "assets/json-renderer.js");
  const homePath = path.relative(path.dirname(htmlPath), path.join(root, "index.html")).replace(/\\/g, "/");

  ensureDir(path.dirname(htmlPath));

  const output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>
  <main class="page">
    <a class="back-link" href="${homePath}">Back to index</a>
    <header class="hero">
      <p class="eyebrow">JSON View</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="source">${escapeHtml(relativeJsonPath)}</p>
    </header>
    <section class="panel">
      <div id="json-root" class="json-root"></div>
    </section>
  </main>
  <script id="json-data" type="application/json">
${escapeHtml(rawJson)}
  </script>
  <script src="${jsPath}"></script>
</body>
</html>
`;

  fs.writeFileSync(htmlPath, output);
}

function renderIndex() {
  const groups = {
    root: [],
    lessons: [],
    results: [],
    vocabulary: [],
  };

  for (const relativePath of jsonFiles) {
    const target = relativePath.includes("/")
      ? relativePath.split("/")[0]
      : "root";
    const htmlPath = path.relative(root, htmlPathFromJson(relativePath)).replace(/\\/g, "/");
    groups[target].push({
      json: relativePath,
      html: htmlPath,
      label: relativePath.replace(/\.json$/i, ""),
    });
  }

  const sections = [
    ["root", "Root JSON"],
    ["vocabulary", "Vocabulary"],
    ["lessons", "Lessons"],
    ["results", "Results"],
  ];

  const cards = sections
    .map(([key, title]) => {
      const links = groups[key]
        .map(
          (entry) => `        <li><a href="${entry.html}">${escapeHtml(entry.label)}</a><span>${escapeHtml(entry.json)}</span></li>`
        )
        .join("\n");
      return `    <section class="panel">
      <h2>${title}</h2>
      <ul class="link-list">
${links}
      </ul>
    </section>`;
    })
    .join("\n");

  const cssPath = "html/assets/styles.css";
  const output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>English JSON Index</title>
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Project Index</p>
      <h1>English JSON Views</h1>
      <p class="source">Open any generated HTML page to inspect the matching JSON file.</p>
    </header>
${cards}
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(root, "index.html"), output);
}

ensureDir(assetsDir);
for (const relativePath of jsonFiles) {
  renderPage(relativePath);
}
renderIndex();
