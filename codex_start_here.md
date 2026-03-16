# CODEX START HERE

This file is a compact working guide for Codex in this project.
Its purpose is to reduce unnecessary file reading and make lesson work faster and more consistent.

Use this file as the first entry point before reading the larger instruction files.

## Main Rule

Do not load the whole project by default.
Read only the minimum set of files needed for the current task.

## What This Project Is

This repository runs an English-learning loop:

1. Codex creates lesson JSON files in `lessons/`
2. ChatGPT in browser(or Codex app) teaches the lesson and writes a result JSON in `results/`
3. Codex processes that result and updates the learning state

The JSON files are the source of truth.
The HTML files are only previews.

## Read Order For Codex

When starting work, use this order:

1. `codex_start_here.md`
2. `profile.md`
3. `learning.json`
4. `errors.json`
5. `grammar.json`
6. only the specific vocabulary files needed for the selected items
7. `instructions.md` only when a rule, format, or workflow detail is unclear
8. `instructionProject.md` only when working on the browser ChatGPT lesson behavior

## File Priority

### Always important

- `profile.md`
  learner level, target, focus, topics, native language

- `learning.json`
  current repetition state and what is due for review

- `errors.json`
  mistake patterns to review in future lessons

- `grammar.json`
  ordered grammar pool for lesson selection

- `lessons/`
  current lesson source files

- `results/`
  lesson outcomes that must be processed automatically

### Important only when needed

- `vocabulary/*.json`
  read only the relevant files for the chosen words or phrases

- `instructions.md`
  full Codex workflow rules

- `instructionProject.md`
  full browser ChatGPT teaching rules, it is with rules also for chatGPT or Codex app

### Usually not needed for lesson generation logic

- `README.md`
  human overview of the project

- `html/`
  generated previews only

- `index.html`
  generated preview index only

## Fast Workflow By Task

### If the user wants a new lesson

Read:

1. `codex_start_here.md`
2. `profile.md`
3. `learning.json`
4. `errors.json`
5. `grammar.json`
6. only the relevant `vocabulary/*.json` files

Then:

1. choose grammar appropriate to level and progression
2. choose review words from `learning.json` by oldest `next`
3. choose mistakes from `errors.json`
4. choose new vocabulary only if the user asked for a normal lesson, not pure review
5. write the lesson JSON into `lessons/`
6. regenerate HTML with `generate_html.ps1`

### If the user wants a review lesson

Read:

1. `codex_start_here.md`
2. `profile.md`
3. `learning.json`
4. `errors.json`
5. `grammar.json`
6. only the vocabulary files needed to enrich the selected review items

Then:

1. select the oldest due items from `learning.json`
2. set all selected lesson items to `"new": "n"`
3. keep `review_errors` based on `errors.json`
4. write the lesson JSON into `lessons/`
5. regenerate HTML

### If a new result file appears

Read:

1. `codex_start_here.md`
2. matching file in `results/`
3. matching file in `lessons/`
4. `learning.json`
5. `errors.json`

Then:

1. merge reviewed and new lesson items into `learning.json`
2. update `result`, `reviews`, `last`, and `next`
3. merge concrete errors into `errors.json`
4. regenerate HTML immediately

### If the user adds fresh vocabulary

Read:

1. `codex_start_here.md`
2. the relevant `vocabulary/*.json` file
3. `profile.md` if level or topic fit matters

Then:

1. check for duplicates or obvious variants first
2. save the new item with usable metadata
3. regenerate HTML
4. optionally offer a priority lesson using those new items

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

- `profile.md`
- `learning.json`
- `errors.json`
- `grammar.json`
- `vocabulary/*.json`
- `lessons/*.json`
- `results/*.json`
- `generate_html.ps1`

Files mainly for human orientation:

- `README.md`
- `index.html`
- `html/**`

## Default Assumptions

- learner focus: speaking fluency
- learner native language: Czech
- learner current level: read from `profile.md`
- generated HTML should always be refreshed after JSON changes
- existing project data may already contain manual edits, so never overwrite unrelated changes carelessly

## When To Read The Full Instructions

Open `instructions.md` when:

- lesson selection rules are unclear
- spacing and repetition logic needs exact confirmation
- result processing behavior must be verified
- file naming or automation rules are in doubt

Open `instructionProject.md` when:

- preparing or adjusting browser ChatGPT teaching behavior
- checking the exact lesson flow in chat
- checking result JSON expectations from the teaching side

## Goal

Codex should be able to start useful work in this project after reading only:

- `codex_start_here.md`
- `profile.md`
- `learning.json`
- `errors.json`
- `grammar.json`

Everything else should be loaded only on demand.
