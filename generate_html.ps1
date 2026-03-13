$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlRoot = Join-Path $root "html"
$assetsRoot = Join-Path $htmlRoot "assets"

New-Item -ItemType Directory -Force -Path $htmlRoot | Out-Null
New-Item -ItemType Directory -Force -Path $assetsRoot | Out-Null

$jsonFiles = @()
$jsonFiles += Get-ChildItem -Path $root -File -Filter *.json

foreach ($dir in @("vocabulary", "lessons", "results")) {
  $full = Join-Path $root $dir
  if (Test-Path $full) {
    $jsonFiles += Get-ChildItem -Path $full -File -Filter *.json
  }
}

$jsonFiles = $jsonFiles | Sort-Object FullName

Get-ChildItem -Path $htmlRoot -Recurse -File -Filter *.html -ErrorAction SilentlyContinue |
  Remove-Item -Force

function Escape-Html {
  param([string]$Text)

  if ($null -eq $Text) {
    return ""
  }

  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Get-RelativePath {
  param(
    [string]$FromPath,
    [string]$ToPath
  )

  $fromUri = New-Object System.Uri(($FromPath.TrimEnd('\') + '\'))
  $toUri = New-Object System.Uri($ToPath)
  return $fromUri.MakeRelativeUri($toUri).ToString()
}

function Get-Label {
  param([string]$RelativeJsonPath)

  $base = [System.IO.Path]::GetFileNameWithoutExtension($RelativeJsonPath)
  return ($base -replace "_", " ")
}

function Write-EmbeddedPage {
  param(
    [string]$TargetPath,
    [string]$Title,
    [string]$RawJson,
    [string]$Eyebrow = "JSON View",
    [string]$ExtraLinks = ""
  )

  $targetDir = Split-Path -Parent $TargetPath
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  $cssHref = Get-RelativePath -FromPath $targetDir -ToPath (Join-Path $assetsRoot "styles.css")
  $jsHref = Get-RelativePath -FromPath $targetDir -ToPath (Join-Path $assetsRoot "json-renderer.js")
  $homeHref = Get-RelativePath -FromPath $targetDir -ToPath (Join-Path $root "index.html")

  $page = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$(Escape-Html $title)</title>
  <link rel="stylesheet" href="$cssHref">
</head>
<body>
  <main class="page">
    <div class="top-links">
      <a class="back-link" href="$homeHref">Back to index</a>
$ExtraLinks
    </div>
    <header class="hero">
      <p class="eyebrow">$Eyebrow</p>
      <h1>$(Escape-Html $Title)</h1>
    </header>
    <section class="panel">
      <div id="json-root" class="json-root"></div>
    </section>
  </main>
  <script id="json-data" type="application/json">
$(Escape-Html $RawJson)
  </script>
  <script src="$jsHref"></script>
</body>
</html>
"@

  Set-Content -Path $TargetPath -Value $page -Encoding UTF8
}

function Write-JsonPage {
  param([System.IO.FileInfo]$File)

  $relativeJson = $File.FullName.Substring($root.Length + 1).Replace("\", "/")
  $relativeHtml = [System.IO.Path]::ChangeExtension($relativeJson, ".html")
  $target = Join-Path $htmlRoot ($relativeHtml.Replace("/", "\"))
  $rawJson = Get-Content -Path $File.FullName -Raw -Encoding UTF8
  $title = $relativeJson -replace "\.json$", ""

  Write-EmbeddedPage -TargetPath $target -Title $title -RawJson $rawJson
}

foreach ($file in $jsonFiles) {
  Write-JsonPage -File $file
}

$vocabularyDates = @{}
Get-ChildItem -Path (Join-Path $root "vocabulary") -File -Filter *.json | ForEach-Object {
  $items = Get-Content -Path $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($item in $items) {
    if (-not $item.inserted) {
      continue
    }
    if (-not $vocabularyDates.ContainsKey($item.inserted)) {
      $vocabularyDates[$item.inserted] = New-Object System.Collections.ArrayList
    }
    [void]$vocabularyDates[$item.inserted].Add($item)
  }
}

$sortedVocabularyDates = @($vocabularyDates.Keys | Sort-Object)

for ($i = 0; $i -lt $sortedVocabularyDates.Count; $i++) {
  $date = $sortedVocabularyDates[$i]
  $previousDate = $null
  if ($i -gt 0) {
    $previousDate = $sortedVocabularyDates[$i - 1]
  }

  $target = Join-Path $htmlRoot ("vocabulary\dates\" + $date + ".html")
  $rawJson = $vocabularyDates[$date] | ConvertTo-Json -Depth 10
  $extraLinks = ""
  if ($previousDate) {
    $previousHref = Get-RelativePath -FromPath (Split-Path -Parent $target) -ToPath (Join-Path $htmlRoot ("vocabulary\dates\" + $previousDate + ".html"))
    $extraLinks = "      <a class=""back-link"" href=""$previousHref"">Previous</a>"
  }

  Write-EmbeddedPage -TargetPath $target -Title $date -RawJson $rawJson -Eyebrow "Vocabulary Date" -ExtraLinks $extraLinks
}

$groups = [ordered]@{
  "Root JSON" = @()
  "Vocabulary" = @()
  "Lessons" = @()
  "Results" = @()
}

foreach ($file in $jsonFiles) {
  $relativeJson = $file.FullName.Substring($root.Length + 1).Replace("\", "/")
  $relativeHtml = "html/" + ([System.IO.Path]::ChangeExtension($relativeJson, ".html").Replace("\", "/"))
  $entry = [pscustomobject]@{
    Label = Get-Label -RelativeJsonPath $relativeJson
    Href = $relativeHtml
  }

  if ($relativeJson.StartsWith("vocabulary/")) {
    $groups["Vocabulary"] += $entry
  } elseif ($relativeJson.StartsWith("lessons/")) {
    $groups["Lessons"] += $entry
  } elseif ($relativeJson.StartsWith("results/")) {
    $groups["Results"] += $entry
  } else {
    $groups["Root JSON"] += $entry
  }
}

if ($sortedVocabularyDates.Count -gt 0) {
  $lastDate = $sortedVocabularyDates[-1]
  $groups["Vocabulary"] = ,([pscustomobject]@{
    Label = "last date"
    Href = "html/vocabulary/dates/$lastDate.html"
  }) + $groups["Vocabulary"]
}

$sections = foreach ($group in $groups.GetEnumerator()) {
  if ($group.Value.Count -eq 0) {
    continue
  }

  $items = foreach ($entry in $group.Value) {
    "        <li><a href=""$($entry.Href)"">$([System.Net.WebUtility]::HtmlEncode($entry.Label))</a></li>"
  }

@"
    <section class="panel">
      <h2>$($group.Key)</h2>
      <ul class="link-list">
$(($items -join "`n"))
      </ul>
    </section>
"@
}

$index = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>English JSON Index</title>
  <link rel="stylesheet" href="html/assets/styles.css">
</head>
<body>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Project Index</p>
      <h1>English JSON Views</h1>
    </header>
$(($sections -join "`n"))
  </main>
</body>
</html>
"@

Set-Content -Path (Join-Path $root "index.html") -Value $index -Encoding UTF8

Write-Output "Regenerated $($jsonFiles.Count) JSON view page(s) and index.html"
