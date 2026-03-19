# CODEX START HERE

This file is a compact working guide for Codex in this project.
Its purpose is to reduce unnecessary file reading and make lesson work faster and more consistent.

Use this file as the first entry point before reading the larger instruction files.

## Main Rule

Do not load the whole project by default.
Read only the minimum set of files needed for the current task.

## What This Project Is

This repository runs an English-learning loop:

1. Codex creates lesson JSON files in `data/lessons/`
2. ChatGPT in browser(or Codex app) teaches the lesson and writes a result JSON in `data/results/`
3. Codex processes that result and updates the learning state

The JSON files are the source of truth.
The HTML files are only previews.

## Read Order For Codex

When starting work, use this order:

1. `docs/codex_start_here.md`
2. `docs/profile.md`
3. `data/learning.json`
4. `data/errors.json`
5. `data/grammar.json`
6. only the specific vocabulary files needed for the selected items
7. `docs/instructions.md` only when a rule, format, or workflow detail is unclear
8. `docs/instructionProject.md` only when working on the browser ChatGPT lesson behavior

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
  full Codex workflow rules

- `docs/instructionProject.md`
  full browser ChatGPT teaching rules, it is with rules also for chatGPT or Codex app

### Usually not needed for lesson generation logic

- `README.md`
  human overview of the project

- `html/`
  generated previews only

- `html/index.html`
  generated preview index only

## Fast Workflow By Task

### If the user wants a new lesson

Read:

1. `docs/codex_start_here.md`
2. `docs/profile.md`
3. `data/learning.json`
4. `data/errors.json`
5. `data/grammar.json`
6. only the relevant `data/vocabulary/*.json` files

Then:

1. choose grammar appropriate to level and progression
2. choose review words from `data/learning.json` by oldest `next`
3. choose mistakes from `data/errors.json`
4. choose new vocabulary only if the user asked for a normal lesson, not pure review
5. write the lesson JSON into `data/lessons/`
6. regenerate HTML with `html/script/generate_html.ps1`

### If the user wants a review lesson

Read:

1. `docs/codex_start_here.md`
2. `docs/profile.md`
3. `data/learning.json`
4. `data/errors.json`
5. `data/grammar.json`
6. only the vocabulary files needed to enrich the selected review items

Then:

1. select the oldest due items from `data/learning.json`
2. set all selected lesson items to `"new": "n"`
3. keep `review_errors` based on `data/errors.json`
4. write the lesson JSON into `data/lessons/`
5. regenerate HTML

### If a new result file appears

Read:

1. `docs/codex_start_here.md`
2. matching file in `data/results/`
3. matching file in `data/lessons/`
4. `data/learning.json`
5. `data/errors.json`

Then:

1. merge reviewed and new lesson items into `data/learning.json`
2. update `result`, `reviews`, `last`, and `next`
3. merge concrete errors into `data/errors.json`
4. regenerate HTML immediately

### If the user adds fresh vocabulary

Read:

1. `docs/codex_start_here.md`
2. the relevant `data/vocabulary/*.json` file
3. `docs/profile.md` if level or topic fit matters

Then:

1. check for duplicates or obvious variants first
2. save the new item with usable metadata
3. regenerate HTML
4. optionally offer a priority lesson using those new items

If the user provides a new `.txt` file in the project root or `data/` with fresh expressions, Codex may use a dedicated ingest skill for that workflow:

1. read the new `.txt`
2. classify items into the existing vocabulary JSON files
3. enrich them with usable metadata
4. refresh the related HTML pages
5. prepare a commit

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

Use the `lesson` array format used by the existing files in this repository.

## Context Saving Rules

- Do not open all vocabulary files unless the task really needs that.
- Do not open HTML files unless checking generated output.
- Do not reread `README.md` once the project structure is already known.
- Prefer reading only the newest relevant lesson and result files, not all historical files.
- If the task is only lesson generation, `instructionProject.md` is usually unnecessary.

## Human vs System Files

Files mainly for system operation:

- `docs/profile.md`
- `data/learning.json`
- `data/errors.json`
- `data/grammar.json`
- `data/vocabulary/*.json`
- `data/lessons/*.json`
- `data/results/*.json`
- `html/script/generate_html.ps1`

Files mainly for human orientation:

- `README.md`
- `index.html`
- `html/**`

## Default Assumptions

- learner focus: speaking fluency
- learner native language: Czech
- learner current level: read from `docs/profile.md`
- generated HTML should always be refreshed after JSON changes
- existing project data may already contain manual edits, so never overwrite unrelated changes carelessly

## When To Read The Full Instructions

Open `docs/instructions.md` when:

- lesson selection rules are unclear
- spacing and repetition logic needs exact confirmation
- result processing behavior must be verified
- file naming or automation rules are in doubt

Open `docs/instructionProject.md` when:

- preparing or adjusting browser ChatGPT teaching behavior
- checking the exact lesson flow in chat
- checking result JSON expectations from the teaching side

## Goal

Codex should be able to start useful work in this project after reading only:

- `codex_start_here.md`
- `docs/profile.md`
- `data/learning.json`
- `data/errors.json`
- `data/grammar.json`

Everything else should be loaded only on demand.



