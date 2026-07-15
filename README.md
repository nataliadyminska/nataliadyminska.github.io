# nataliadyminska.pl

Strona-wizytówka Natalii Dymińskiej — psychoterapeutki w trakcie szkolenia.
Statyczna strona (HTML/CSS/JS), hostowana na GitHub Pages, domena `nataliadyminska.pl`.

## Podgląd lokalny

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Struktura

```
index.html            # cała strona (jeden ekran, sekcje)
styles/main.css       # style + design tokens
scripts/main.js       # menu mobilne, płynne przewijanie, animacje wejścia
assets/img/           # zdjęcia (webp + jpg)
assets/fonts/         # self-hosted fonty
assets/icons/         # favicon, og-image
CNAME                 # domena (nataliadyminska.pl)
docs/                 # specyfikacja i notatki projektowe
```

## Publikacja

Zmiany na gałęzi `main` publikują się automatycznie przez GitHub Pages.

## Kredyty

- Fonty: [Fraunces](https://fonts.google.com/specimen/Fraunces), [Inter](https://fonts.google.com/specimen/Inter) (SIL Open Font License).
- Zdjęcia tła: [Unsplash](https://unsplash.com/) (Unsplash License).
