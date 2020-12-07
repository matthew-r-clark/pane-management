# Pane Management
### Automatically and dynamically adjusts height of iframe elements based on their contents.

If you found this repo, you have probabaly discovered the pain of dynamically resizing iframes to fit their content when that content comes from a different origin. Fortunately, your search has come to an end! Although you do need to be able to add a script to the target page loaded within the iframe.

Manage your panes (window...panes, get it?) with ease:
1. Include the `paneManagement` script in your main HTML document which contains the `<iframe>` tags:
  ```html
  <script src="https://cdn.jsdelivr.net/gh/matthew-r-clark/pane-management/babel/paneManager.min.js"></script>
  ```
2. Include the `pane` script in any HTML document that is expected to be loaded within the `<iframe>` (recommended to be added globally if possible):
  ```html
  <script src="https://cdn.jsdelivr.net/gh/matthew-r-clark/pane-management/babel/pane.min.js"></script>
  ```
3. Make sure each target `<iframe>` has the attribute `pane-management="true"`:
  ```html
  <iframe src="https://website.com"
    pane-management="true"  <!-- Without this, the iframe will not be registered! -->
    frameborder="0"
    scrolling="no">
  </iframe>
  ```

Hard coding the height value of a registered `<iframe>` will not affect the dynamic resizing of the element. An example of a time you may want to set this attribute while using Pane Management is if you are dynamically creating the `<iframe>` right before an an animation to toggle visibility. The dynamically set height may not be correct, causing the animation to look awkward.

Features:
- [`window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) is used for safe cross-origin communication between different windows in the browser, allowing the main window to request height updates for `<iframe>` content and for an `<iframe>`'s window to send height updates to the main window.
- Each `<iframe>` is registered upon page load, and any dynamically created/removed `<iframe>` is registered/unregistered upon relevant change to the DOM. An `<iframe>` will only be registered if it has the attribute: `pane-management="true"`
- Registered `<iframe>` elements are assigned a unique id, which is maintained across navigation to different pages within the `<iframe>` (any content loaded in the `<iframe>` must have the `pane` script included as a dependency).
- Registered `<iframe>` heights are automatically sized correctly on initial page load.
- Resizing the main window viewport will adjust the height of any registered `<iframe>` as necessary to fit its content.
- Any click or change to the DOM within a registered `<iframe>` will trigger a check for a height change and only send a message to update the `<iframe>` height if necessary.
- Only with a click or DOM change: if the `<iframe>` height decreases from what it previously was set to, the page will scroll so the top of the `<iframe>` is at the top of the main window viewport (ex. if you select a product at the end of a long product list and there is additional content below that `<iframe>`, you don't want to have to scroll back up to see the now shorter `<iframe>` content).

Notes:
- Not recommended to load sites relying on cookies within registered `<iframe>`s.
- You will potentially experience issues if more than one registered `<iframe>` loads the same URL on initial page load.

Check out the [demo](https://matthew-r-clark.github.io/iframe-resize-demo/), which provides more information.