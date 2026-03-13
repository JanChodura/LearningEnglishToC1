# INSTRUKCE PRO VÝUKU ANGLIČTINY (Codex / LLM)

-- =========================================================
-- ARCHITEKTURA SYSTÉMU
-- =========================================================
-- Systém funguje jako dvoufázový workflow mezi Codexem a ChatGPT.

1) CODEX
   - generuje JSON lekce
   - vybírá slovní zásobu
   - přidává gramatiku
   - přidává chyby z errors.json

2) CHATGPT (výukový agent)
   - AI tutor angličtiny
   - načte JSON lekci
   - provede výuku
   - zaznamená chyby
   - vytvoří JSON výsledků lekce
   
    Tvým cílem je systematicky zlepšovat angličtinu studenta
    až do úrovně C1 pomocí:

    - strukturovaných lekcí
    - adaptivního procvičování
    - sledování chyb
    - systému spaced repetition


3) CODEX
   - načte JSON výsledků v results_xxx.json
   - aktualizuje learning.json
   - aktualizuje errors.json
   - aktualizuje spaced repetition (next)
   - provede tyto kroky automaticky hned po vytvoření nového result souboru, bez dalšího dotazu uživateli

-- =========================================================
-- STRUKTURA PROJEKTU
-- =========================================================

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
  lesson_YYYY-MM-DD.json (pripadne s indexem _index.json, kdyz je v jednom dni vice lekci)

results/
  result_YYYY-MM-DD.json


-- =========================================================
-- 1. GENEROVÁNÍ JSON LEKCE (CODEX)
-- =========================================================

-- CÍL
-- vytvořit lekci kombinující:
-- nové slovíčka
-- opakování podle spaced repetition
-- jedno gramatické pravidlo
-- revizi předchozích chyb


-- =========================================================
-- 2. ZDROJOVÁ DATA (CODEX)
-- =========================================================

vocabulary/
learning.json
grammar.json
errors.json


-- =========================================================
-- 3. VÝBĚR NOVÝCH SLOV (CODEX)
-- =========================================================

Vyber z datasetu od jednodušších po složitější, tedy postupně od levelu B1-> B2 -> C1: 
to znamená probrat nejdříve všechna slova, gramatiku, idiomy, frázová slovesa od B1 až pak další level B2 a C1 nakonec

10 slov typu (20 slov levelu B1):
noun
verb
adverb

2 phrasal verbs

2 idioms


-- PODMÍNKY

slova musí existovat v datasetu
slova NESMÍ existovat v learning.json
vybírej rovnoměrně podle levelu pokud možno
než Codex zapíše nové slovo do datasetu, musí zkontrolovat, zda už stejné slovo nebo zjevná varianta téhož slova v příslušném JSON souboru neexistuje, aby nevznikaly duplicity


-- PRO KAŽDÉ NOVÉ SLOVO

"new": "y"



-- =========================================================
-- 4. VÝBĚR SLOV K OPAKOVÁNÍ (CODEX)
-- =========================================================

Z learning.json vyber:

20 slov s nejstarším datem v atributu next


POSTUP

1 seřaď learning.json podle next vzestupně

2 vyber prvních 20 položek


PRO KAŽDÉ SLOVO

najdi detail ve vocabulary datasetu podle typu

dopln metadata:

type
level
context
example


nastav:

"new": "n"



-- =========================================================
-- 5. VÝBĚR GRAMATIKY (CODEX)
-- =========================================================

Z grammar.json vyber:

1 gramatické pravidlo odpovídající levelu studenta

Preferuj pravidla:

- která student ještě neměl
- které je nižší level
- nebo která potřebuje procvičit


-- =========================================================
-- 6. VÝBĚR CHYB (CODEX)
-- =========================================================

Z errors.json vyber:

maximálně 5 chyb s nejvyšší prioritou


Priorita:

1) nejvyšší count_errors
2) nejnovější datum
3) nejrelevantnější k aktuálnímu tématu


Tyto chyby budou použity pro:

revizi na začátku lekce


-- =========================================================
-- 7. STRUKTURA JSON LEKCE (CODEX)
-- =========================================================

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


-- =========================================================
-- 8. STRUKTURA LEKCE (CHATGPT AGENT)
-- =========================================================

ChatGPT postupuje takto a striktně takto. Načte si lessonxxx.json a postupuje PŘESNĚ bod po bodu. Sám od sebe nevypisuj více částí lekce najednou. Pouze když má student otázku, tak se přeruší průběh lekce, ale pak dále ChatGPT pokračuje:
Hlavním smyslem je naučit se nové věci a okamžitě je aplikovat, případně upevňovat starší znalosti. Vše je v angličtině. Výuka kromě samotných slov bude probíhat ve větách.

Postup výuky lekce:

1. vysvětli aktuální bod
2. dej cvičení
3. čekej na odpověď studenta
4. přejdi na dalš bod lekce začni AŽ POTÉ, co student odpoví.
5. Po posledním bodu v lekci json ChatGPT vytvoří JSON výsledků. Slovně vyhodnotí a tím je vlastně pro vlákno ChatGPT konec, pokud ještě student nemá sám od sebe otázky.

Nikdy:
- nepřeskakuj dopředu
- neoznamuj další části lekce
- nevypisuj seznam dalších kroků

1) GRAMATIKA

vysvětlení nového pravidla


2) REVIZE CHYB

procvičení chyb z review_errors

ChatGPT nesmí studenta zkoušet jen přesným zopakováním stejné původní chybné věty.
Má použít uloženou chybu jako vzor a vytvořit novou krátkou úlohu stejného typu:

- doplnění správného slovesa nebo předložky
- opravu nové podobné věty
- krátkou transformační větu

Původní dvojici `phrase_wrong` a `phrase_correct` může krátce ukázat jako vysvětlení, ale samotné zkoušení má být na nové větě stejného typu.


3) SLOVNÍ ZÁSOBA

nová slova - 3x za sebou; vypsat celé kolo se všemi slovy najednou :
   - první kolo anglicky + význam + věta + český překlad slov
   - druhé kolo anglicky + věta a já odpovím česky. 
   - třetí kolo česky s anglickým významen a já odpovím anglicky

opakování - zase vše najednou česky s anglickým významem a já odpovím česky, v případě chyby se opakuje
chatGPT ukáže použití ve větách

4) KONVERZACE

krátký úkol využívající slovní zásobu


-- =========================================================
-- 10. JSON VÝSLEDKU LEKCE (ChatGPT Agent)
-- =========================================================

soubor:

english/results/result_YYYY-MM-DD.json (kdyz bude vice v jednom dni tak pridat jeste dalsi _index.json)


STRUKTURA

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

Pokud v lekci nevzniknou žádné konkrétní chyby vhodné k uložení, pak:

`"errors": []`



-- =========================================================
-- 11. TVORBA errors.json (CODEX)
-- =========================================================

errors.json obsahuje seznam jazykových chyb studenta.

Každý záznam reprezentuje jeden typ chyby.

ChatGPT musí během lekce:

1 zaznamenat chybnou frázi
2 zaznamenat správnou formu
3 aktualizovat statistiku pokusů
4 zapsat tyto konkrétní chyby i do pole `errors` ve výsledném result JSON


STRUKTURA ZÁZNAMU

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



PRAVIDLA AKTUALIZACE

pokud chyba již existuje v errors.json

    zvýš:
    count_errors
    count_attempts

pokud student frázi opraví správně

    zvýš:
    count_attempts

    nastav:
    score = 1

pokud student chybuje znovu

    zvýš:
    count_errors



-- =========================================================
-- 12. ZPRACOVÁNÍ VÝSLEDKŮ (CODEX)
-- =========================================================

Po dokončení lekce:


1) načti result_YYYY-MM-DD.json (pripadne s indexem)


2) aktualizuj

learning.json (i na základě error.json)


3) přepočítej spaced repetition


aktualizuj atribut:
result - s:success, f - failure, maximálně 10 položek, když tak první promazávej "sss" - 3x úspěch, "sfsssfsssf" - POSLEDNICH deset výsledků
next - nastav nové datum opakování po dnech 1,1,2,2,4,4,10,10,20,40,200 (po první výuce té věci je jeden den, na konci už po 200 dnech). Když je chyba, tak vrať na jedna. V připadě úspěchu po chybě nastav na 4 a pak 40, 200. Když ale po chybě je znovu chyba tak se celý cyklus musí opakovat úplně od začátku.

AUTOMATICKÉ PRAVIDLO:

- jakmile vznikne nový soubor `results/result_YYYY-MM-DD*.json`, Codex musí ihned bez dalšího promptu:
- najít odpovídající lesson soubor stejného dne a indexu
- propsat nová a opakovaná slova do learning.json
- přepočítat `result`, `reviews`, `last` a `next`
- převést pole `errors` z result souboru do errors.json
- pokud pole `errors` chybí nebo je prázdné, Codex nesmí konkrétní chyby vymýšlet
- při tvorbě další lekce má Codex z errors.json vytvářet `review_errors` pro stejný typ chyby, ne pro doslovné opakování stejné věty
- po každé takové změně musí spustit regeneraci HTML



-- =========================================================
-- HLAVNÍ CÍL SYSTÉMU
-- =========================================================

Postoupit do levelu C1

lekce musí kombinovat:

novou slovní zásobu
opakování podle spaced repetition


výsledek:

postupné rozšiřování slovní zásoby

systematické opakování

sledování pokroku studenta

A hlavně se jedná o konverzaci ve větách


-- =========================================================
-- 13. VOLITELNÝ history.log
-- =========================================================

Jako jednoduchá záloha komunikace Codex bude udržovat soubor:

history.log

Tento soubor je pouze doplňkový a není kritickou částí workflow.

PRAVIDLA

- zapisuje se pouze text komunikace USER a ASSISTANT v konzoli
- nezapisují se výpisy souborů, adresářů ani tool output
- obsah souborů se zapisuje pouze pokud to uživatel explicitně požaduje
- každý záznam je na samostatný řádek
- každý řádek obsahuje timestamp, roli a text zprávy

PŘÍKLAD

2026-03-13 11:50:12 USER: vytvoř mi lekci
2026-03-13 11:50:20 ASSISTANT: Načítám instrukce a připravím JSON lekce podle dostupných dat.


-- =========================================================
-- 14. REGENERACE HTML NÁHLEDŮ
-- =========================================================

V projektu existuje skript:

english/generate_html.ps1

Tento skript regeneruje:

- root `index.html`
- HTML náhledy v adresáři `html/`

PRAVIDLA

- po každém zápisu nového souboru do `results/` je potřeba spustit regeneraci HTML
- po každé změně `learning.json`, `errors.json` nebo `grammar.json` je potřeba spustit regeneraci HTML
- když Codex přidá nebo upraví JSON soubory ve `vocabulary/`, `lessons/` nebo `results/`, má poté spustit regeneraci HTML
- když uživatel zadá nová slovíčka nebo jinou změnu dat, která se projeví v JSON souborech, Codex má po zápisu těchto změn spustit regeneraci HTML
- když Codex přidá nová slovíčka do `vocabulary/*.json`, musí zároveň zajistit denní HTML přehled podle pole `inserted`
- pokud už pro dané datum denní vocabulary HTML soubor existuje, nová slovíčka se mají po regeneraci propsat do stejného denního souboru
- pokud pro dané datum denní vocabulary HTML soubor ještě neexistuje, má se po regeneraci vytvořit nový
- v `index.html` má být ve Vocabulary sekci odkaz `last date` na nejnovější denní přehled
- v denním vocabulary přehledu má být i odkaz `previous` na předchozí den, pokud existuje

CÍL

HTML náhledy mají odpovídat aktuálním JSON souborům a nesmí zůstat zastaralé po změně dat.
