# Pane Management
### Automatically and dynamically adjusts height of iframe elements based on their contents.

If you found this repo, you have probabaly discovered the pain of dynamically resizing iframes to fit their content when that content comes from a different origin. Fortunately, your search has come to an end! Although you do need to be able to add a script to the target page loaded within the iframe.

Manage your panes (window...panes, get it?) with ease by simply adding the following JS dependencies:
1. In your main HTML document which contains the `iframe` tags:
  ```html
  <script src="https://matthew-r-clark.github.io/pane-management/babel/paneManager.min.js"></script>
  ```
2. In any HTML document that could be potentially loaded within the `iframe` (probably just want to load it globally for that site):
  ```html
  <script src="https://matthew-r-clark.github.io/pane-management/babel/pane.min.js"></script>
  ```

Features:
- Automatically detects any `iframe` in page, assigns an id so the user can navigate to other pages, even if navigating to a different origin (still needs to have `pane.js` included though).
- Automatically resizes `iframe` heights on initial page load, window resize, navigation to new page within `iframe` (scrolls view to top of `iframe`), and if user interaction changes the height of the `iframe` content.
- Any new `iframe` elements added to the page after initial load will dynamically be registered and work as normal, and any removed `iframe` elements will be unregistered.
- Not recommended with `iframe` content that needs to use sessions.