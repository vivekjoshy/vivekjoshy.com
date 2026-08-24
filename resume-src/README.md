# Resume source

LaTeX source for `public/assets/resume.pdf`. `fancy-rover.tex` is the live template.

```bash
pdflatex -interaction=nonstopmode fancy-rover.tex
cp fancy-rover.pdf ../public/assets/resume.pdf
```

Keep this in sync with `app/pages/resume.vue` — the two are maintained by hand.
