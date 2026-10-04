# Overleaf bundle

Upload `semantic-validation-gap-overleaf.zip` to Overleaf (New Project → Upload Project).
Set the main document to `main.tex` if Overleaf does not pick it automatically, and leave the
compiler on pdfLaTeX. It builds as is: `IEEEtran.cls` and `IEEEtran.bst` ship with Overleaf, so
nothing else is needed.

## What is here

| File | What it is |
|---|---|
| `main.tex` | the manuscript (IEEEtran, conference mode, 10 pages) |
| `references.bib` | 48 references, all cited, all verified |
| `tables/numbers.tex` | every number used in the prose, as `\R{...}` macros |
| `tables/tab_*.tex` | the six tables |
| `paper-reference.pdf` | the PDF this bundle produced, to compare your build against |

## How the numbers work

No number in the text is typed by hand. The prose writes `\R{h1.rate}` and `tables/numbers.tex`
defines it. That file and the six tables are generated from the raw measurements by
`16_RESULTS/analysis/` in the study repository, so a number can be wrong only if the data is.

**If you edit a number, edit it in `tables/numbers.tex`, not in the sentence.** Changing a figure in
the prose breaks the link to the data and the next regeneration will silently disagree with you. If
you want a number the macros do not have, say so and it can be added to the generator.

Unknown keys are loud: `\R{typo}` prints **??typo** in the PDF and warns at compile time, so a
mistyped key cannot slip through.

## The three switches

`tables/numbers.tex` ends with three flags that control wording which depends on work that was
completed:

```latex
\newif\ifhumanlabels\humanlabelstrue   % the 200-item human annotation exists
\newif\ifreviewed\reviewedtrue         % the reference conditions A and G were reviewed by the author
\newif\ifjudgeweak\judgeweaktrue       % judge-human kappa fell below the pre-registered 0.4
```

All three are correct as set. `\judgeweaktrue` is what makes the paper label judgement-rule results
exploratory; turning it off would overclaim, so leave it on.

## Before you submit

- Author block: the affiliation reads "Independent Researcher" and the e-mail is in `main.tex`.
  Add an ORCID if you have one.
- Keywords: currently free text. Many IEEE venues want terms from the IEEE Thesaurus.
- Venue: the layout is generic IEEEtran conference. Check the specific call for page limit,
  anonymisation and whether references count toward the limit.
- Some conferences require the PDF to pass IEEE PDF eXpress.
- Run a similarity check. The text is original, but venues expect the author to have checked.
- The Acknowledgment carries the repository URL and the AI-use disclosure. Keep the disclosure:
  IEEE requires it, and removing it would misstate how the work was done.

## Page budget

The paper is exactly 10 pages, so almost any addition pushes it to 11. There is a fuller 11-page
version in the study repository at `13_DRAFT/paper_v0.9-before-10page-trim.tex`, which keeps two
extra tables (prompt families, field categories) and the cost-versus-detection figure. If your venue
allows 11 pages or excludes references from the count, that version is the better one to submit.
