# English Learning Workflow

## Why I Built This

I wanted a learning system that would help me:

- learn new words
- learn useful phrases
- learn phrasal verbs
- learn idioms
- repeatedly practice all of them instead of only seeing them once
- track and correct my mistakes over time
- use ChatGPT in the browser as a teaching partner for speaking, not only for reading and writing

The goal is not just to read and type in English, but also to speak in full sentences, upload or enter spoken responses, and use the system as a real practice loop.

This project is a structured English-learning system built around two cooperating agents:

- Codex prepares lessons, processes lesson results, updates repetition data, and maintains project files.
- ChatGPT teaches the lesson interactively, records mistakes, and writes lesson results.

The goal is to improve the student's English step by step from `B1` up to `C1`, with a strong focus on:

- structured lessons
- spaced repetition
- mistake tracking
- sentence-based practice
- gradual vocabulary and grammar progression

## How It Works

The workflow has three stages:

1. Codex creates a lesson JSON in `lessons/`
2. ChatGPT teaches the lesson and writes a result JSON in `results/`
3. Codex automatically processes that result and updates the learning state

This means the project is not just a set of word lists. It is a stateful learning loop.

## Project Structure

Core files:

- `learning.json`  
  Stores learning progress, review history, and next repetition dates.

- `errors.json`  
  Stores recurring mistake patterns such as wrong phrase -> correct phrase.

- `grammar.json`  
  Grammar topics ordered by difficulty level.

- `profile.md`  
  Basic learner profile such as current level, target level, and focus areas.

Vocabulary datasets:

- `vocabulary/nouns.json`
- `vocabulary/verbs.json`
- `vocabulary/adjectives.json`
- `vocabulary/adverbs.json`
- `vocabulary/phrases.json`
- `vocabulary/phrasal_verbs.json`
- `vocabulary/idioms.json`

The vocabulary files currently include Czech equivalents.
If a user wants to use the project with another native language, he needs to translate those equivalents for himself or ask for the dataset to be adapted.

Generated lesson and result data:

- `lessons/lesson_YYYY-MM-DD.json`
- `results/result_YYYY-MM-DD.json`

HTML preview system:

- `generate_html.ps1`
- `html/`
- `index.html`

## Lesson Model

Each lesson combines:

- one grammar topic
- review of selected mistake types from `errors.json`
- new vocabulary
- review vocabulary from `learning.json`

Lessons are saved as JSON so that ChatGPT can follow them exactly.

## Result Model

After a lesson, ChatGPT writes a result file containing:

- lesson date
- topic
- mistake focus summary
- number of new words
- lesson notes
- concrete error records in an `errors` array

Those concrete errors are later merged by Codex into `errors.json`.

## Error Review Philosophy

The system does not test the student by repeating the exact same wrong sentence only.

Instead:

- ChatGPT records the original wrong form and the correct form
- Codex stores that error pattern in `errors.json`
- future lessons include review items based on the same mistake type
- ChatGPT then tests the learner on a fresh example of the same pattern

Example:

- stored error: `I did a mistake` -> `I made a mistake`
- future review: a new sentence that tests the `make a mistake` collocation

## Automatic Processing

When a new result file appears, Codex should automatically:

- find the matching lesson file
- update `learning.json`
- merge concrete errors into `errors.json`
- recalculate spaced repetition
- regenerate HTML previews

This behavior is part of the project rules.

## Instructions

Detailed instructions live in these files:

- [Codex / project workflow instructions](./instructions.md)
- [ChatGPT browser project instructions](./instructionProject.md)

Use them as the source of truth for behavior, file formats, and workflow rules.

## Typical Workflow

1. Generate a lesson in `lessons/`
2. Open the lesson with ChatGPT
3. Complete the lesson
4. Save the result to `results/`
5. Let Codex process the result automatically
6. Regenerate and inspect the HTML views

## Notes

- The system is designed around interactive sentence-based learning, not isolated flashcards only.
- Review is driven by both spaced repetition and repeated mistake patterns.
- The HTML layer is only a viewer; JSON files are the source of truth.
- If the user wants to add new words or phrases, they can simply type them in the console and Codex will handle updating the project files.
