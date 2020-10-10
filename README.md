# Pane Management

If you found this repo, you have probabaly discovered the pain of dynamically resizing iframes to fit their content when that content comes from a different origin. Fortunately, your search has come to an end!

Manage your panes (window...panes, get it?) with ease by simply adding the following JS dependencies:
1. In your main HTML document which contains the `iframe` tags:
  ```html
  <script src="https://matthew-r-clark.github.io/pane-management/paneManager.js"></script>
  ```
2. In any HTML document that could be potentially loaded within the `iframe` (probably just want to load it globally for that site):
  ```html
  <script src="https://matthew-r-clark.github.io/pane-management/pane.js"></script>
  ```

Features:
- Automatically detects any `iframe` in page, assigns an id so the user can navigate to other pages, even if navigating to a different origin (still needs to have `pane.js` included though).
- Automatically resizes `iframe` heights on initial page load, window resize, navigation to new page within `iframe`, and if user interaction changes the height of the `iframe` content.