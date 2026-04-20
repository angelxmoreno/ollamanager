# Design Feedback Responses

## 1. What does the Operations button do?

We should remove it. The operations surface should always be visible, so a separate `Operations` button is unnecessary.

## 2. What does the Help button do?

Make `Help` a top-level nav/action that opens a docs URL. For now, use a placeholder URL in the prototype.

Decision:

- remove Help from the side
- keep Help as a main nav/header link

## 3. What does Library do?

Remove it. It is not part of the current product.

## 4. What are we putting in Settings?

Approved settings content for the design:

- reset database
- import connections
- export connections
- light mode / dark mode

We can add more later, but this is enough for the current design direction.

## 5. Don’t put random icons for the models.

Agreed. Remove model icons entirely.

## 6. Model list columns

Approved model list columns:

- model name
- digest
- family
- size
- parameter size
- last modified
- capabilities
- actions

`Capabilities` should render as an array-style surface, for example compact chips or inline tokens, but only with real capabilities we can derive from model metadata.

## 7. Actions should always be present.

Agreed. Actions should always be visible. No hover-only action treatment.

## 8. What does Export Catalog do?

Remove it. Not a real feature.

## 9. What does Prune Unused do?

Remove it. Not a current verified feature.

## 10. What does the Pull Model flow look like?

The prototype should show this as an inline workspace flow, not a large modal.

Approved pull flow:

1. user clicks `Pull Model`
2. an inline composer opens near the models toolbar
3. user enters the model name
4. user chooses the target connection if needed
5. submit starts the pull
6. active pull progress appears in the persistent operations area
7. completion or failure is added to recent actions

I prefer this over a blocking modal because it keeps the workspace stable.

### Chrome extension idea

I think the Chrome extension idea is good as a **later convenience path**, not the primary pull flow.

Best version of that idea:

- user browses `https://ollama.com/library`
- extension adds an `Open in OllaManager` or `Pull with OllaManager` action
- that action deep-links into OllaManager and pre-fills the model name
- user then chooses a connection and confirms the pull inside the app

Why I like it:

- it fits your remote-manager workflow
- it avoids forcing users to copy model names manually
- it keeps the authoritative pull action inside OllaManager

Why I would not design around it yet:

- it adds another product surface
- it should not distort the core desktop app UX before the main app is solid

Recommendation:

- design the native in-app pull flow now
- treat the extension as a phase-two integration

## 11. Gear icon vs Settings link

My preference: keep the **gear icon** and remove the `Settings` text link.

Reason:

- settings are not a primary workflow destination
- the gear belongs in utility chrome, not in the main working nav
- it keeps the main nav focused on the actual task surfaces

## 12. Fluent / UI library / colors / fonts

You are right that the standards document points us toward Fluent-style desktop rules. But that does **not** mean:

- we must use the Fluent UI component library
- we must copy Microsoft’s exact colors or typography

What the standards mean is:

- use Fluent-inspired **interaction and layout principles**
- panel-based desktop shell
- dense command surfaces
- inspectors
- restrained motion
- workspace-first behavior

So:

- **Yes:** the design should follow the gist’s Fluent-inspired desktop standards
- **No:** the current Stitch output is not a real Fluent UI implementation
- **No:** the current fonts/colors are not authoritative; they came from Stitch’s generated design system

For implementation, we should use the gist as the behavioral/design source of truth, then choose the actual React/CSS/component approach ourselves.

## Summary of Approved Revisions

Remove:

- Operations button
- Library
- Export Catalog
- Prune Unused
- random model icons
- duplicate settings entry points

Keep or add:

- Help as a top-level docs link
- gear icon as the single settings entry point
- always-visible actions
- model list columns:
  - model name
  - digest
  - family
  - size
  - parameter size
  - last modified
  - capabilities
  - actions
- inline pull-model flow
- persistent operations area

## Next Design Target

The next prototype should show:

- revised three-region workspace
- always-visible operations panel
- updated model table columns
- no invented controls
- inline JS pull flow
