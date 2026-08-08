# Travel Book UX Foundation

## 1. Product intent

Travel Book is a mobile-first collaborative trip planner that should feel like an interactive travel scrapbook rather than a conventional management dashboard.

The experience must balance two goals:

1. Make group planning fast and understandable.
2. Make the trip feel emotional, playful, and memorable.

A visual effect is useful only when it supports one of those goals.

---

## 2. UX problem statement

Groups planning a trip often spread information across chat messages, maps, notes, spreadsheets, and payment apps. This creates repeated questions, lost decisions, unclear responsibilities, and difficulty understanding the latest plan.

Travel Book should provide one shared place where the group can:

- decide where and when to travel;
- collect places and ideas;
- turn ideas into an itinerary;
- divide responsibilities;
- track shared expenses;
- preserve memories after the trip.

---

## 3. Primary users

### Organizer

Creates the trip, invites friends, keeps decisions moving, and resolves conflicts.

Needs:

- a clear overview of incomplete decisions;
- tools to create votes and deadlines;
- visibility into assignments and unpaid expenses;
- confidence that everyone sees the latest plan.

### Participant

Joins the trip, votes, suggests places, checks the plan, and records expenses or memories.

Needs:

- a very simple onboarding flow;
- obvious next actions;
- minimal form filling;
- notifications only when action is required.

### Memory keeper

Adds photos, captions, highlights, and moments during or after the trip.

Needs:

- fast photo capture;
- lightweight captions;
- a chronological and emotionally engaging scrapbook.

One person may perform all three roles.

---

## 4. Jobs to be done

Users are not primarily trying to “manage records.” They are trying to make progress in a shared trip.

Core jobs:

- When our group has many destination ideas, help us reach a decision without arguing in chat.
- When everyone has different availability, help us identify workable dates quickly.
- When places are scattered across messages, help us collect and organize them.
- When the trip approaches, show each person what they need to do next.
- When someone pays for the group, record it quickly and show who owes whom.
- During and after the trip, help us turn photos and moments into a shared story.

---

## 5. Experience principles

### One clear next action

Every important screen should answer: “What should I do now?”

### Progressive disclosure

Show essential information first. Put advanced settings behind secondary actions or bottom sheets.

### Group state is visible

Users should always know what is proposed, voted, confirmed, changed, or still incomplete.

### Playful, not confusing

Scrapbook visuals may decorate and reinforce meaning, but must not hide navigation or reduce readability.

### Touch-first

Primary controls should be comfortably reachable by thumb and use large touch targets.

### Forgiving interactions

Support undo, confirmation for destructive actions, autosave, and clear recovery from network failure.

### Motion communicates

Animation should explain hierarchy, location, state change, or completion. Avoid motion that exists only to impress.

---

## 6. Trip lifecycle

The product should adapt to the current phase of a trip.

### Dreaming

- create trip;
- invite friends;
- collect destination ideas;
- vote on destination and dates.

### Planning

- collect places;
- build itinerary;
- choose accommodation and food;
- assign tasks;
- estimate budget.

### Traveling

- show today’s plan;
- open maps and booking details quickly;
- add expenses;
- check tasks;
- capture moments.

### Remembering

- organize photos and highlights;
- settle remaining balances;
- generate a shared scrapbook.

The home screen should change priority based on this lifecycle rather than showing the same dashboard forever.

---

## 7. Proposed information architecture

### Global navigation

Use a five-item bottom navigation on mobile:

1. Home
2. Plan
3. Add
4. Activity
5. Members

The center Add action opens a bottom sheet for contextual creation:

- place;
- activity;
- expense;
- photo or memory;
- checklist item;
- vote.

### Main product areas

- Trip cover and onboarding
- Trip home
- Destination and date voting
- Ideas and saved places
- Itinerary
- Map
- Stay and food
- Budget and expenses
- Checklist and assignments
- Members and permissions
- Memory scrapbook
- Notifications and activity history
- Trip settings

---

## 8. Primary user journey

### New organizer

1. Create a trip.
2. Enter a temporary trip name; destination and dates may remain undecided.
3. Invite friends using a link.
4. Add destination candidates.
5. Start destination and date votes.
6. Confirm results.
7. Collect places and activities.
8. Arrange items into daily plans.
9. Assign responsibilities and estimate costs.
10. Use the Today view during the trip.
11. Settle balances and complete the scrapbook afterward.

### Invited participant

1. Open invitation link.
2. See trip context before being asked to register.
3. Join using the shortest suitable authentication path.
4. See one prominent pending action, such as voting.
5. Explore confirmed plans and add suggestions.
6. Receive updates when decisions change or an action is assigned.

---

## 9. Home screen hierarchy

The trip home should not be a grid of equal cards. It should prioritize information in this order:

1. Current trip phase and status
2. The user’s next required action
3. Time-sensitive information
4. Today or next itinerary item
5. Group decisions awaiting completion
6. Budget or task warnings
7. Recent group activity
8. Decorative memories and inspiration

Example during planning:

- Hero: “2 people still need to vote on dates”
- Primary button: “Vote now”
- Next section: confirmed destination and tentative date
- Then: saved ideas, itinerary progress, assigned tasks

Example during travel:

- Hero: current time and next activity
- Primary button: directions
- Then: today’s timeline, booking details, weather alert, quick expense action

---

## 10. Interaction model

Recommended mobile interaction patterns:

- horizontal swipe only for clearly grouped content, not as the sole navigation method;
- bottom sheets for quick create and edit flows;
- drag and drop for itinerary ordering with an accessible alternative;
- long press only as a shortcut, never the only way to access an action;
- sticky notes and cards as visual metaphors, while retaining standard labels and controls;
- optimistic updates with visible sync state;
- undo snackbars after reversible actions.

Avoid:

- hidden gesture-only navigation;
- page-turn effects for every screen;
- excessive parallax;
- long intro animations before users can act;
- decorative handwriting fonts for important body text;
- low-contrast paper textures behind small text.

---

## 11. Accessibility baseline

- Minimum touch target: approximately 44 by 44 CSS pixels.
- Do not rely on color alone to communicate status.
- Support reduced-motion preferences.
- Maintain readable text contrast.
- Give icons visible labels when meaning is not universal.
- Ensure keyboard navigation for desktop and assistive technology.
- Provide text alternatives for meaningful images.
- Keep core tasks usable without drag and drop.

---

## 12. Success metrics

Initial UX metrics should focus on completed outcomes rather than page views.

- Trip creation completion rate
- Invitation-to-join conversion rate
- Percentage of invited members who complete a vote
- Time from trip creation to confirmed destination and dates
- Percentage of saved ideas placed into an itinerary
- Percentage of assigned tasks completed before departure
- Expense settlement completion rate
- Number of members contributing at least one memory

Qualitative signals:

- Users understand the next action without instruction.
- Groups ask fewer repeated questions in chat.
- Participants trust that the displayed plan is current.
- The scrapbook feels delightful without slowing task completion.

---

## 13. UX design process for this repository

Each major feature should follow this order:

1. Define the user problem.
2. Identify the user and trip phase.
3. Write the job to be done.
4. Map the happy path.
5. Map empty, loading, error, permission, offline, and conflict states.
6. Create a low-fidelity wireframe.
7. Test whether users can complete the task.
8. Define visual design and motion.
9. Implement.
10. Measure and revise.

Do not begin high-fidelity UI until the primary flows and screen hierarchy are agreed.

---

## 14. First design milestone

The first prototype should cover one complete planning loop:

1. Create trip
2. Invite friend
3. Join trip
4. Add destination candidates
5. Vote
6. Confirm destination
7. See updated trip home

This slice tests the product’s most important collaborative behavior before building maps, budget, or memories.

---

## 15. Open product decisions

These decisions should be validated before implementation:

- Can a guest vote before creating an account?
- Who may confirm a vote result?
- Can multiple organizers exist?
- What happens when confirmed dates or destinations change?
- Which trip information is visible from an invitation link?
- Is the app intended only for private groups, or can trips be shared publicly?
- How should offline edits and simultaneous changes be resolved?
- Which notifications are essential, optional, or muted by default?
