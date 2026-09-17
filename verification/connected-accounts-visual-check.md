# Connected Accounts visual verification

## Desktop
The `/scheduling/connected-accounts` page renders the six provider cards, the Meta activation checklist, the LinkedIn readiness checklist, and the security explanation without overlap. The activation links are visible and the cards keep the existing neutral Lumae layout.

## Mobile
At 390px wide, provider cards stack vertically and remain readable. The Meta and LinkedIn checklists stack below the provider cards, links remain visible, and the security explanation remains within the page flow. No clipping or horizontal overflow was observed in the captured full-page preview.

## Status
The browser preview used the current session, where Instagram appears not connected; this is expected because the database check for the owner account was performed separately and the current browser session is not that owner account. No connection state was modified during visual verification.

