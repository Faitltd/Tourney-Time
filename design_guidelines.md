# Tourney Time - Design Guidelines

## Design Approach

**System-Based Approach**: Drawing from Linear and Notion for clean, information-dense interfaces with strong hierarchy and readability. The app prioritizes research efficiency and decision-making clarity over visual flair.

## Core Design Principles

1. **Information Clarity**: Research content and citations must be immediately scannable
2. **Progress Transparency**: Users always know where they are in the bracket
3. **Decision Focus**: Winner selection is the primary action, never buried
4. **Source Credibility**: Citations are prominent, not afterthoughts

## Typography System

**Font Stack**: 
- Primary: Inter or Source Sans Pro (Google Fonts)
- Monospace: JetBrains Mono for data/stats

**Hierarchy**:
- H1 (Tournament Title): text-4xl font-bold
- H2 (Round Names): text-2xl font-semibold
- H3 (Team Names): text-xl font-medium
- Body (Research): text-base leading-relaxed
- Citations: text-sm
- Stats/Data: text-sm font-mono

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 consistently
- Component padding: p-6 or p-8
- Section spacing: space-y-8 or space-y-12
- Card margins: gap-6

**Container Strategy**:
- Main content: max-w-6xl mx-auto
- Research section: max-w-4xl for optimal reading
- Sidebar elements: w-80 or w-96

## Component Library

### Tournament Setup Form
- Stacked input fields with clear labels above
- Large, prominent "Find Bracket" button (full width on mobile, auto width desktop)
- Loading state with spinner and "Searching for bracket..." text

### Bracket Visualization
- Horizontal rounds layout on desktop (scrollable if needed)
- Vertical stacked on mobile
- Each matchup as a card showing team names and seeds
- Visual indicators for completed (checkmark icon), current (highlighted border), and pending matchups
- Round headers with round name and matchup count

### Current Matchup Display
- Prominent card at top of research area
- Team names large and bold (text-2xl)
- VS centered between teams
- Seeds in smaller text beside team names
- "Research This Matchup" button below (primary action)

### Research Display
- White/neutral background panel
- Generous padding (p-8)
- Research text with comfortable line-height (leading-relaxed)
- Inline citations as superscript links `<sup><a>[1]</a></sup>` with underline on hover
- Citations list at bottom in smaller panel:
  - Each citation as `[1] Source Name - Article Title` with link
  - Subtle divider between citations

### Winner Selection
- Two large buttons side-by-side (50% width each on desktop)
- Button text: "Pick [Team Name]"
- Clear visual hierarchy (primary button styling)
- Appears only after research loads

### Predictions Sidebar/List
- Fixed or sticky sidebar on desktop (right side, w-80)
- Stacked cards on mobile
- Each prediction card shows:
  - Round name (text-xs uppercase tracking-wide)
  - Matchup teams (text-sm)
  - Winner name (font-semibold with checkmark icon)
  - Timestamp (text-xs)
- Scrollable if many predictions

### Progress Indicator
- Horizontal progress bar at top showing rounds completed
- Text showing "Round 1 of 6 - 3/8 matchups complete"

## Navigation & Actions

### Primary Actions
- "Find Bracket" (tournament setup)
- "Research This Matchup" (research trigger)
- "Pick [Team]" (winner selection)

### Secondary Actions
- "Start New Tournament" (reset)
- "Export Bracket" (future feature)

## Layout Composition

### Main Application Layout (Desktop)
```
[Progress Bar across top]
[Tournament Header centered]

[Bracket Visualization - left 2/3]    [Predictions Sidebar - right 1/3]
[Current Matchup Display - centered]
[Research Panel - full width below]
[Winner Selection Buttons - centered]
```

### Mobile Layout
Stack everything vertically:
1. Progress indicator
2. Tournament header
3. Current matchup
4. Research button
5. Research content
6. Winner buttons
7. Predictions list

## Icons

**Library**: Heroicons via CDN

**Key Icons**:
- Trophy (tournament header)
- CheckCircle (completed predictions)
- Clock (pending matchups)
- ExternalLink (citation links)
- ChevronRight (navigation)
- ArrowPath (loading states)

## Loading States

- Skeleton screens for bracket structure (gray rectangles pulsing)
- Spinner with text for research ("Researching matchup...")
- Disabled state for buttons during loading (reduced opacity, no interaction)

## Responsive Breakpoints

- Mobile: base (< 768px) - single column, stacked layout
- Tablet: md (768px+) - maintain stacked but wider components
- Desktop: lg (1024px+) - sidebar layout, horizontal brackets

## Interactive States

- Hover: Slight elevation on cards (shadow-md to shadow-lg)
- Active matchup: Border emphasis and subtle background
- Completed predictions: Checkmark icon, reduced opacity
- Citation links: Underline on hover, external link icon

## Unique Design Elements

### Citation Formatting
Citations are core to this app's value:
- Inline superscript numbers in research text
- Hover shows preview tooltip with source name
- Click opens in new tab
- Reference list at bottom styled as footnotes with dividing line

### Bracket Card States
Three visual states for matchups:
1. Pending: Default card styling
2. Current: Enhanced border, subtle glow effect
3. Complete: Checkmark badge, winner name in bold

## No Images Required

This is a data/research-focused application. Visual content comes from:
- Bracket structure visualization
- Team names and data
- Research text and citations
- No hero images or marketing imagery needed