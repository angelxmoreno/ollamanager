# OllaManager Desktop UX Plan

## Recommendation

Yes: use Stitch for the first design pass.

For this project, Stitch is best used to explore **layout, density, hierarchy, and panel relationships**, not final interaction fidelity. That is the right tradeoff for OllaManager because the current gaps are mostly structural:

- the app still reads as stacked web sections instead of one persistent workspace
- details are centered modals instead of inspectors
- the spacing is web-default roomy rather than desktop-tool dense
- command placement is functional but not yet organized as a desktop command surface

My recommendation is:

1. Use Stitch to generate 2-3 desktop workspace directions.
2. Pick one direction and translate it into real React layout and CSS.
3. Add motion later, once panel structure and interaction rules are stable.

That is safer than designing animations first. Motion should reinforce spatial logic that already exists.

## Standards Reference

Use this document as the source of truth while designing:

- https://gist.github.com/angelxmoreno/9e580cfd6f3f59f76ec635fa2c6ef09b#file-desktop-ux-web-app-standards-md

The implementation should explicitly follow these standards:

- workspace shell over page flow
- panel-local scrolling over document scrolling
- inspector/detail panel over blocking detail modals
- persistent selection, filters, sort, and panel state
- keyboard-first interaction and visible focus
- inline operational states

## Current UI Review

### What is already working

- The app already has the right feature split: connections, models, and activity.
- The data model supports a persistent workspace better than the current layout suggests.
- The UI is simple enough to refactor without major architectural risk.

### Main UX problems today

- `src/App.tsx` renders the product as a top header, a connections area, then a second row with models and activity. That feels like separate page sections, not one desktop workspace.
- `ConnectionsPanel` behaves like a sidebar plus a detail page, not a stable navigation pane plus workspace.
- `ModelDetailsModal` and connection dialogs rely on centered overlays, which breaks the “inspect while staying in context” rule.
- `src/styles.css` uses generic web spacing, rounded cards, and page-like section padding rather than tool-density surfaces.
- The app has toast feedback, but long-running or failing work is not yet anchored in a persistent task/status surface.

## Target Layout Direction

Design toward a three-region shell:

- **Left rail / sidebar:** connections, quick actions, status summary
- **Center workspace:** model table, filters, pull form, bulk actions
- **Right inspector:** model details, connection details, logs, metadata

Optional future extension:

- bottom utility panel for activity/task log

The important shift is that the center workspace should remain primary and stable while side surfaces update around it.

## Stitch Design Deliverables

Generate these screens in Stitch:

### 1. Main Workspace

- desktop-only shell
- left connection list
- center model table with search/filter/toolbar
- right inspector open with model details
- bottom or lower-right activity/status treatment

### 2. Empty/Disconnected State

- no active connection selected
- preserve full shell layout
- inline guidance in the center panel

### 3. Background Task State

- model pull in progress
- persistent progress surface visible without modal interruption

### 4. Connection Editing Surface

- explore whether this should be a side inspector, utility sheet, or compact dialog
- preference: keep model workspace visible while editing

## Design Constraints for Stitch

When prompting Stitch, keep these constraints explicit:

- design a **desktop utility**, not a landing page or dashboard
- prioritize density and horizontal workflow
- avoid hero sections, oversized cards, and excessive whitespace
- use a stable shell with persistent chrome
- prefer compact toolbars, tables, side inspectors, and utility panels
- do not depend on animation to make the design understandable

## Implementation Phases

### Phase 1: Layout Refactor

- convert `App.tsx` into a persistent workspace shell
- make left, center, and right regions explicit
- move activity into a durable utility/status region
- switch to panel-local scrolling where needed

### Phase 2: Interaction Refactor

- replace model details modal with right-side inspector
- evaluate whether connection editing should also move out of centered modal treatment
- make selection state explicit in the model list
- introduce a clearer command hierarchy: toolbar, inline actions, inspector actions

### Phase 3: Persistence and Workflow

- persist workspace state such as:
  - active connection
  - search/filter state
  - sort state
  - inspector open/closed
  - panel widths if resizing is added

### Phase 4: Motion Layer

- add motion only after the layout is stable
- focus on:
  - inspector open/close
  - panel resize/transition
  - list updates
  - task/progress state changes
- keep motion short and functional

## Suggested First Build Scope

Do not redesign everything at once.

Start with:

1. workspace shell
2. model inspector replacing the current details modal
3. denser center toolbar/table layout
4. persistent activity/task region

That gives the app a desktop feel quickly without forcing a full system rewrite.

## Final Opinion

Using Stitch here is worthwhile if we treat it as **layout and workflow ideation**, not final truth.

The strongest workflow is:

- Stitch for structural directions
- choose one direction quickly
- implement static layout and interaction rules
- add animation afterward to support the chosen structure

That sequencing fits the gist standards and reduces the risk of ending up with attractive mockups that still behave like a website.
