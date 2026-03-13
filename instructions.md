# ENGLISH LEARNING INSTRUCTIONS (Codex / LLM)

## System Architecture

The system operates as a two-stage workflow between Codex and ChatGPT.

1) CODEX
   - generates lesson JSON
   - selects vocabulary
   - adds grammar
   - includes mistakes from `errors.json`

2) CHATGPT (teaching agent)
   - acts as an AI English tutor
   - loads the lesson JSON
   - runs the lesson
   - records mistakes
   - creates the lesson results JSON

The goal is to systematically improve the student's English up to C1 level through:

- structured lessons
- adaptive practice
- mistake tracking
- a spaced repetition system

3) CODEX
   - loads the results JSON from `results_xxx.json`
   - updates `learning.json`
   - updates `errors.json`
   - updates spaced repetition (`next`)
   - performs these steps automatically immediately after a new result file is created, without asking the user again

## Project Structure

```text
english/

learning.json
errors.json

vocabulary/
  adjectives.json
  nouns.json
  verbs.json
  adverbs.json
  phrases.json
  idioms.json

grammar.json

lessons/
  lesson_YYYY-MM-DD.json
  lesson_YYYY-MM-DD_index.json

results/
  result_YYYY-MM-DD.json
```

## 1. Generating Lesson JSON (Codex)

### Goal

Create a lesson that combines:

- new vocabulary
- spaced repetition review
- one grammar rule
- review of previous mistakes

## 2. Source Data (Codex)

```text
vocabulary/
learning.json
grammar.json
errors.json
```

## 3. Selecting New Words (Codex)

Select items from the dataset from easier to harder, progressing from B1 -> B2 -> C1.
This means covering all words, grammar, idioms, and phrasal verbs at B1 first, then moving on to B2, and finally C1.

Codex should support lesson topics within the current level:

- offer suitable topic suggestions for the student's current level
- the user may also provide a custom topic
- if the user provides a custom topic, Codex should select at least an approximate set of relevant words and phrases for that topic from the existing vocabulary data
- if the user does not want any topic, Codex should simply select the next words in the normal order

Codex should also support user-supplied fresh vocabulary from the current day:

- if the user writes new words, phrases, phrasal verbs, or idioms into the prompt, Codex should offer to turn them into a priority lesson
- if the user confirms, Codex should first save them into the appropriate `vocabulary/*.json` files with the relevant metadata
- the metadata should include the best available type, level, meaning, example, context, and any other useful supporting data such as synonyms when appropriate
- after confirmation, the next generated lesson should prioritize these freshly added items and build the lesson directly around them
- if the user does not confirm, Codex should not force them into the next lesson and should continue with the normal lesson selection logic

Select:

- 10 words of the following types (20 words at B1 level):
  noun
  verb
  adverb
- 2 phrasal verbs
- 2 idioms

### Conditions

- words must exist in the dataset
- words MUST NOT already exist in `learning.json`
- select evenly by level whenever possible
- before Codex writes a new word into the dataset, it must check whether the same word or an obvious variant already exists in the relevant JSON file, so that duplicates are not created
- before using selected words, phrases, phrasal verbs, or idioms, Codex must verify that their records in `vocabulary/*.json` are correct and usable
- if Codex finds an obvious issue in a vocabulary record, it must fix it first and print the correction only as an informational message in the console

### For Each New Word

```json
"new": "y"
```

## 4. Selecting Words for Review (Codex)

From `learning.json` select:

- 20 words with the oldest date in the `next` attribute

### Procedure

1. Sort `learning.json` by `next` in ascending order.
2. Select the first 20 items.

### For Each Word

Find the details in the vocabulary dataset by type.

Add metadata:

- type
- level
- context
- example

Set:

```json
"new": "n"
```

## 5. Selecting Grammar (Codex)

From `grammar.json` select:

- 1 grammar rule appropriate to the student's level

Prefer rules:

- the student has not studied yet
- that are at a lower level
- or that need more practice

## 6. Selecting Mistakes (Codex)

From `errors.json` select:

- at most 5 mistakes with the highest priority

Priority:

1. highest `count_errors`
2. most recent date
3. most relevant to the current topic

These mistakes will be used for:

- review at the beginning of the lesson

## 7. Lesson JSON Structure (Codex)

```json
{
  "grammar": {
    "name": "second conditional",
    "level": "B2"
  },
  "review_errors": [
    {
      "type": "collocation",
      "phrase_wrong": "I did a mistake",
      "phrase_correct": "I made a mistake",
      "note": "make + mistake"
    }
  ],
  "vocabulary": [
    {
      "word": "example",
      "type": "noun",
      "level": "B1",
      "new": "y"
    },
    {
      "word": "approach",
      "type": "noun",
      "level": "B2",
      "new": "n"
    }
  ]
}
```

## 8. Lesson Structure (ChatGPT Agent)

ChatGPT must follow this sequence strictly. It loads `lessonxxx.json` and proceeds EXACTLY step by step. It must not output multiple lesson sections at once on its own. If the student asks a question, the lesson may pause, but ChatGPT must continue afterward.

The main purpose is to learn new material and apply it immediately, while also reinforcing older knowledge. Everything is in English. The teaching should happen in full sentences, not only through isolated words.

### Lesson Flow

1. Explain the current point.
2. Give an exercise.
3. Wait for the student's answer.
4. Move to the next lesson point ONLY AFTER the student answers.
5. After the last point in the lesson JSON, ChatGPT creates the results JSON. It gives a verbal evaluation, and that is effectively the end of the ChatGPT thread unless the student asks more questions.

Never:

- skip ahead
- announce later parts of the lesson
- print a list of upcoming steps

### 1) Grammar

Explain the new rule.

### 2) Mistake Review

Practice mistakes from `review_errors`.

ChatGPT must not test the student only by repeating the exact original incorrect sentence.
It should use the stored mistake as a pattern and create a new short task of the same type:

- fill in the correct verb or preposition
- correct a new similar sentence
- complete a short transformation task

It may briefly show the original `phrase_wrong` and `phrase_correct` pair as part of the explanation, but the actual testing must use a new sentence of the same type.

### 3) Vocabulary

New words: 3 rounds in a row; present each full round with all words at once:

- first round: English + meaning + sentence + Czech translation of the words
- second round: English + sentence and I answer in Czech
- third round: Czech with the English meaning and I answer in English

Review:

- again all at once in Czech with the English meaning and I answer in Czech
- if there is a mistake, it repeats
- ChatGPT shows the words used in sentences

### 4) Conversation

A short task that uses the vocabulary.

## 10. Lesson Result JSON (ChatGPT Agent)

File:

`english/results/result_YYYY-MM-DD.json`

If there are multiple results on the same day, add an additional `_index.json`.

### Structure

```json
{
  "lesson_date": "2026-03-11",
  "topic": "developer English vocabulary and phrasal verbs",
  "mistakes_focus": [
    "natural phrasing",
    "prepositions",
    "verb choice"
  ],
  "new_words_count": 14,
  "notes": "Strong technical ideas; needs smoother sentence flow and more natural verb choice.",
  "errors": [
    {
      "type": "collocation",
      "phrase_wrong": "I did a mistake",
      "phrase_correct": "I made a mistake",
      "note": "make + mistake",
      "context": "speaking about a past error",
      "count_errors": 1,
      "count_attempts": 1
    }
  ]
}
```

If no specific mistakes suitable for saving occur during the lesson, then:

```json
"errors": []
```

## 11. Creating errors.json (Codex)

`errors.json` contains a list of the student's language mistakes.

Each entry represents one type of mistake.

During the lesson, ChatGPT must:

1. record the incorrect phrase
2. record the correct form
3. update attempt statistics
4. write these specific mistakes into the `errors` field in the final result JSON as well

### Entry Structure

```json
{
  "date": "2026-03-11",
  "type": "grammar",
  "phrase_wrong": "I did a mistake",
  "phrase_correct": "I made a mistake",
  "count_errors": 1,
  "count_attempts": 1,
  "score": null,
  "note": "collocation"
}
```

### Update Rules

If the mistake already exists in `errors.json`:

- increase `count_errors`
- increase `count_attempts`

If the student corrects the phrase correctly:

- increase `count_attempts`
- set `score = 1`

If the student makes the mistake again:

- increase `count_errors`

## 12. Processing Results (Codex)

After the lesson is finished:

1. load `result_YYYY-MM-DD.json` (optionally with an index)
2. update `learning.json` (also based on `error.json`)
3. recalculate spaced repetition

Update the attributes:

- `result`:
  `s` = success, `f` = failure, maximum 10 items; if needed trim from the beginning
  `"sss"` = 3x success
  `"sfsssfsssf"` = the last ten results
- `next`:
  set the next review date after 1, 1, 2, 2, 4, 4, 10, 10, 20, 40, 200 days
  after the first time learning an item, the next review is in one day
  if there is a mistake, reset to one
  if there is success after a mistake, set it to 4 and then 40, 200
  if there is another mistake after a mistake, the whole cycle must restart completely from the beginning

### Automatic Rule

As soon as a new file `results/result_YYYY-MM-DD*.json` appears, Codex must immediately, without any further prompt:

- find the corresponding lesson file with the same date and index
- write new and reviewed words into `learning.json`
- recalculate `result`, `reviews`, `last`, and `next`
- transfer the `errors` array from the result file into `errors.json`
- if the `errors` field is missing or empty, Codex must not invent specific mistakes
- when creating the next lesson, Codex should create `review_errors` from `errors.json` for the same type of mistake, not by literally repeating the same sentence
- after every such change it must run HTML regeneration

### Level Completion Celebration

When the student finishes an entire level (for example, completes all planned vocabulary, grammar, idioms, and phrasal verbs for B1 and is ready to move to B2), Codex must print a very visible celebration message to the console.

Requirements:

- the celebration should be large, explicit, and impossible to miss in the console output
- it should clearly state which level has just been completed
- it should clearly state which level comes next
- this celebration is only a console message and does not need to be stored in JSON

## Main Goal of the System

Reach C1 level.

Lessons must combine:

- new vocabulary
- review based on spaced repetition

Result:

- gradual vocabulary expansion
- systematic review
- tracking the student's progress

Above all, the learning should happen through sentence-based conversation.

## 13. Optional history.log

As a simple backup of communication, Codex will maintain the file:

`history.log`

This file is only supplementary and is not a critical part of the workflow.

### Rules

- only USER and ASSISTANT console communication text is written
- file listings, directory listings, and tool output are not written
- file contents are written only if the user explicitly requests it
- each record is written on a separate line
- each line contains a timestamp, role, and message text

### Example

```text
2026-03-13 11:50:12 USER: create a lesson for me
2026-03-13 11:50:20 ASSISTANT: I am loading the instructions and will prepare the lesson JSON based on the available data.
```

## 14. HTML Preview Regeneration

The project contains this script:

`english/generate_html.ps1`

This script regenerates:

- the root `index.html`
- HTML previews in the `html/` directory

### Rules

- after every new file written to `results/`, HTML regeneration must be run
- after every change to `learning.json`, `errors.json`, or `grammar.json`, HTML regeneration must be run
- when Codex adds or edits JSON files in `vocabulary/`, `lessons/`, or `results/`, it must then run HTML regeneration
- when the user enters new words or makes another data change that affects JSON files, Codex must run HTML regeneration after writing those changes
- when Codex adds new words to `vocabulary/*.json`, it must also ensure the daily HTML overview based on the `inserted` field
- if a daily vocabulary HTML file for the given date already exists, the new words should be written into that same daily file after regeneration
- if a daily vocabulary HTML file for the given date does not yet exist, a new one should be created after regeneration
- in `index.html`, the Vocabulary section should contain a `last date` link to the newest daily overview
- in the daily vocabulary overview, there should also be a `previous` link to the previous day, if it exists

### Goal

HTML previews should always match the current JSON files and must not remain outdated after data changes.
