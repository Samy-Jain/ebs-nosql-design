# ER Diagrams

This folder contains the ER diagrams for the E-Commerce Based System in **Graphviz DOT format** (Chen notation).

| File | Description |
|---|---|
| `er_before_normalization.dot` | ER diagram showing the unnormalised schema — repeating groups (1NF violations) and transitive dependencies highlighted |
| `er_after_bcnf.dot` | ER diagram of the final BCNF-normalised schema — weak entities, self-reference, M:N resolved via junction table, denormalisations noted |

## Generating PNG Images

Install [Graphviz](https://graphviz.org/download/), then run:

```bash
dot -Tpng er_before_normalization.dot -o er_before_normalization.png
dot -Tpng er_after_bcnf.dot           -o er_after_bcnf.png
```

Or generate SVG for better quality:

```bash
dot -Tsvg er_before_normalization.dot -o er_before_normalization.svg
dot -Tsvg er_after_bcnf.dot           -o er_after_bcnf.svg
```

## Viewing Online

You can also paste the `.dot` file contents into [graphviz.online](https://graphviz.online) to render them instantly in the browser without installing anything.

## Legend

### Before Normalization
- **Solid ellipse** — normal attribute
- **Dashed red ellipse** — repeating group (1NF violation)
- **Dashed orange ellipse** — transitive dependency (BCNF violation)

### After BCNF
- **Blue rectangle** — strong entity
- **Double pink rectangle** — weak entity
- **Green rectangle** — junction table (M:N resolved)
- **Green diamond** — relationship
- **Double pink diamond** — identifying relationship (weak entity)
- **Bold ellipse** — key attribute
