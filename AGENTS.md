# AGENTS

This file is the primary Codex working guide for this repository.
Use it as the first repo-specific instruction source before reading broader project documentation.

## Purpose

This repository runs an English-learning loop:

1. Codex creates lesson JSON files in `data/lessons/`
2. ChatGPT in the browser or Codex app teaches the lesson and writes a result JSON in `data/results/`
3. Codex processes that result and updates the learning state

The JSON files are the source of truth.
The HTML files in `html/` are generated previews only.

## Core Working Rules

- Do not load the whole project by default.
- Read only the minimum set of files needed for the current task.
- Treat existing JSON data as the source of truth.
- Regenerate HTML after any JSON changes that affect the preview.
- Never overwrite unrelated manual changes carelessly.

## Default Read Order

When starting normal project work, use this order:

1. `AGENTS.md`
2. `docs/profile.md`
3. `data/learning.json`
4. `data/errors.json`
5. `data/grammar.json`
6. only the specific vocabulary files needed for the task
7. `docs/instructions.md` only when a rule, format, or workflow detail is unclear
8. `docs/instructionProject.md` only when working on browser lesson behavior

## File Priority

### Always important

- `docs/profile.md`
  learner level, target, focus, topics, native language

- `data/learning.json`
  current repetition state and what is due for review

- `data/errors.json`
  mistake patterns to review in future lessons

- `data/grammar.json`
  ordered grammar pool for lesson selection

- `data/lessons/`
  current lesson source files

- `data/results/`
  lesson outcomes that must be processed automatically

### Important only when needed

- `data/vocabulary/*.json`
  read only the relevant files for the chosen words or phrases

- `docs/instructions.md`
  full project workflow rules

- `docs/instructionProject.md`
  browser ChatGPT teaching rules

### Usually not needed

- `README.md`
  human overview of the project

- `html/`
  generated previews only

- `html/index.html`
  generated preview index only

## Task Workflows

### If the user wants a new lesson

Read:

1. `docs/profile.md`
2. `data/learning.json`
3. `data/errors.json`
4. `data/grammar.json`
5. only the relevant `data/vocabulary/*.json` files

Then:

1. choose grammar appropriate to level and progression
2. choose review words from `data/learning.json` by oldest `next`
3. choose mistakes from `data/errors.json`
4. choose new vocabulary only if the user asked for a normal lesson, not pure review
5. write the lesson JSON into `data/lessons/`
6. regenerate HTML with `html/script/generate_html.ps1`

### If the user wants a review lesson

Read:

1. `docs/profile.md`
2. `data/learning.json`
3. `data/errors.json`
4. `data/grammar.json`
5. only the vocabulary files needed to enrich the selected review items

Then:

1. select the oldest due items from `data/learning.json`
2. set all selected lesson items to `"new": "n"`
3. keep `review_errors` based on `data/errors.json`
4. write the lesson JSON into `data/lessons/`
5. regenerate HTML

### If a new result file appears

Read:

1. the matching file in `data/results/`
2. the matching file in `data/lessons/`
3. `data/learning.json`
4. `data/errors.json`

Then:

1. merge reviewed and new lesson items into `data/learning.json`
2. update `result`, `reviews`, `last`, and `next`
3. merge concrete errors into `data/errors.json`
4. regenerate HTML immediately

### If the user adds fresh vocabulary

Read:

1. the relevant `data/vocabulary/*.json` file
2. `docs/profile.md` if level or topic fit matters

Then:

1. check for duplicates or obvious variants first
2. save the new item with usable metadata
3. regenerate HTML
4. optionally offer a priority lesson using those new items

If the user provides a new `.txt` file in the project root or `data/` with fresh expressions, use the `ingest-vocabulary-txt` skill.

## Lesson JSON Notes

Current lesson files in this project use this structure:

```json
{
  "grammar": {
    "name": "past continuous",
    "level": "B1"
  },
  "review_errors": [],
  "lesson": [
    {
      "word": "ability",
      "type": "noun",
      "level": "B1",
      "context": "skills, work, education",
      "example": "Her ability to solve problems impressed the team.",
      "new": "n"
    }
  ]
}
```

Use the `lesson` array format already present in the repository.

## Context Saving Rules

- Do not open all vocabulary files unless the task really needs that.
- Do not open HTML files unless checking generated output.
- Do not reread `README.md` once the project structure is already known.
- Prefer reading only the newest relevant lesson and result files, not all historical files.
- If the task is only lesson generation, `docs/instructionProject.md` is usually unnecessary.

## Default Assumptions

- learner focus: speaking fluency
- learner native language: Czech
- learner current level: read from `docs/profile.md`
- generated HTML should always be refreshed after JSON changes
- existing project data may already contain manual edits, so work carefully around unrelated changes

## When To Read Full Instructions

Open `docs/instructions.md` when:

- lesson selection rules are unclear
- spacing and repetition logic needs exact confirmation
- result processing behavior must be verified
- file naming or automation rules are in doubt

Open `docs/instructionProject.md` when:

- preparing or adjusting browser ChatGPT teaching behavior
- checking the exact lesson flow in chat
- checking result JSON expectations from the teaching side

## Minimal Startup Set

Codex should usually be able to start useful work after reading only:

- `AGENTS.md`
- `docs/profile.md`
- `data/learning.json`
- `data/errors.json`
- `data/grammar.json`

Load everything else only on demand.
