# Plan: Fix body flip not mirrored correctly (#88)

## Goal

When the user selects a body part with a `side` prop (e.g. `{ slug: "hands", side: "left" }`) on the front view and flips to the back view, the highlight must appear on the same **anatomical** side — i.e. the mirrored screen position. The `onBodyPartPress` callback must also report the anatomical side regardless of which view is active. After this fix, `side` consistently means "anatomical side of the figure" across both views.

**Done means:**
1. Selecting a body part with `side` on the front view and flipping to back view highlights the anatomically correct (screen-mirrored) paths.
2. `onBodyPartPress` reports the anatomical side on both views (mirrored on back view).
3. Existing front-view behavior is unchanged.
4. All existing tests pass; new tests cover the mirroring behavior.
5. TypeScript compiles cleanly (`yarn typecheck`).

## Scope

**In scope:**
- Fix side-mirroring logic in `index.tsx` rendering (lines 200–243)
- Fix `onBodyPartPress` callback side reporting for back view
- Add test coverage for the mirroring behavior

**Out of scope:**
- Changes to SVG asset files (`bodyFront.ts`, `bodyBack.ts`, `bodyFemaleFront.ts`, `bodyFemaleBack.ts`)
- Changes to `SvgMaleWrapper` or `SvgFemaleWrapper`
- README updates

## Root Cause

The SVG asset files use **screen-position** conventions for `left`/`right` path keys — `left` always means "visually left on screen." But anatomical sides flip between views:

| Screen position | Front view (anatomical) | Back view (anatomical) |
|---|---|---|
| Screen-left     | Figure's **right**      | Figure's **left**      |
| Screen-right    | Figure's **left**       | Figure's **right**     |

The rendering logic in `index.tsx` lines 200–243 compares `data[].side` directly against SVG path keys without accounting for the active view. The `onBodyPartPress` callbacks (lines 212, 234) also pass the raw SVG path key — screen-relative, not anatomical.

The `side` values are screen-relative throughout: `onBodyPartPress` reports screen position, and the rendering comparisons use screen position. This is internally consistent for a single view but breaks when flipping views because the same screen-relative value maps to the opposite anatomical side.

## Phase 1: Fix rendering logic in `index.tsx`

**File:** `index.tsx`

### Change 1: Fix `onBodyPartPress` in leftPaths (line 212)

Mirror the reported side when rendering the back view so the callback returns anatomical side:

```ts
// Before:
() => onBodyPartPress?.(bodyPart, "left")
// After:
() => onBodyPartPress?.(bodyPart, side === "back" ? "right" : "left")
```

### Change 2: Fix `onBodyPartPress` in rightPaths (line 234)

```ts
// Before:
() => onBodyPartPress?.(bodyPart, "right")
// After:
() => onBodyPartPress?.(bodyPart, side === "back" ? "left" : "right")
```

### Change 3: Fix `isOnlyRight` comparison (lines 201–202)

When rendering back view, SVG left paths correspond to the anatomical LEFT side, so they should be suppressed when the user selected only the right side. But `data[].side` is stored as a front-view screen-relative value (from `onBodyPartPress`). On back view, `side: "left"` (screen-left on front = anatomical right) should suppress screen-LEFT paths... wait, that's the same. The key insight: `data[].side` says `"left"` meaning "screen-left on front view." On back view, the same anatomical part is at screen-RIGHT. So when rendering back-view LEFT paths, we should suppress them when data says `"right"` (not `"left"`, which maps to the OTHER anatomical side on back).

Concretely — the comparison target must flip on back view:

```ts
// Before:
const isOnlyRight =
  data.find((d) => d.slug === bodyPart.slug)?.side === "right";

// After:
const dataSide = data.find((d) => d.slug === bodyPart.slug)?.side;
const isOnlyRight = dataSide === (side === "back" ? "left" : "right");
```

### Change 4: Fix `isOnlyLeft` comparison (lines 223–224)

```ts
// Before:
const isOnlyLeft =
  data.find((d) => d.slug === bodyPart.slug)?.side === "left";

// After:
const dataSide = data.find((d) => d.slug === bodyPart.slug)?.side;
const isOnlyLeft = dataSide === (side === "back" ? "right" : "left");
```

### Verification

```bash
yarn typecheck   # No type errors
yarn test        # All existing tests pass
```

## Phase 2: Add test coverage

**File:** `__tests__/test.tsx`

Add a new `describe("Side Mirroring")` block following existing test conventions (`UNSAFE_getAllByProps`, `render` from `@testing-library/react-native`):

### Test 1: Front view `side: "left"` highlights only screen-left paths

- Render `<Body data={[{slug: "chest", side: "left", intensity: 1}]} side="front" colors={["#0984e3"]} />`
- Get paths with `id: "chest"` — the chest has both left and right SVG paths
- Verify at least one path has the highlight color (`#0984e3`) and at least one has default fill (`#3f3f3f`)
- This confirms front-view behavior is unchanged

### Test 2: Back view `side: "left"` highlights screen-RIGHT paths (mirrored)

- Render `<Body data={[{slug: "chest", side: "left", intensity: 1}]} side="back" colors={["#0984e3"]} />`
- Note: back view renders `bodyBack` data which uses slug `"upper-back"` not `"chest"`. Use a slug that exists in back data — e.g. `"trapezius"` or `"upper-back"`
- Verify the mirrored paths get the correct fill

### Test 3: `onBodyPartPress` reports mirrored side on back view

- Render with `side="back"` and a jest.fn() for `onBodyPartPress`
- Use `fireEvent.press` on paths — verify callback receives the mirrored side value

### Test 4: Front view `onBodyPartPress` is unchanged

- Render with `side="front"` and a jest.fn() for `onBodyPartPress`
- Verify callback receives the unmirrored side value

### Verification

```bash
yarn test        # All tests pass including new ones
yarn typecheck   # Still clean
```

## Risks

1. **Behavioral change for `onBodyPartPress` on back view:** The callback will now report mirrored side values on back view. Any consumer that stores and re-uses these values (the standard README pattern) will benefit. Consumers that rely on screen-relative side from the callback on back view would see different values — but this is the buggy behavior being fixed.

2. **Test environment SVG rendering:** Existing tests successfully query `Path` components by `id` prop via `UNSAFE_getAllByProps`, confirming this approach works. Distinguishing left vs right paths by fill color is feasible since `side` causes differential coloring.

## Assumptions

1. **`side` means anatomical side.** The issue reporter's expectation and the standard usage pattern (select part → flip view → same highlight) strongly support this. The fix makes `side` behave anatomically.

2. **`onBodyPartPress` should report anatomical side.** Since the callback's `side` is stored and fed back into `data[].side` (per README example), it must be consistent with the rendering interpretation.

3. **No asset file changes needed.** The SVG path coordinates are correct — the fix is purely in the rendering logic's interpretation of `left`/`right` relative to the active view.

4. **Keep using `data.find(...)` for the side lookup** (lines 202, 224) rather than switching to the merged array — matches existing pattern.

## Open Questions

None — all design decisions are resolvable from the codebase and issue context.
