window.addEventListener('DOMContentLoaded', function() {
  let mainWindowOrigin;
  let paneId;

  function mainWindowOriginUnset() {
    return !mainWindowOrigin;
  }

  window.addEventListener('message', function(event) {
    let origin = event.origin;
    let data = event.data;
    paneId = data.id;

    if (data.name === 'iframe-resizer' && mainWindowOriginUnset()) {
      mainWindowOrigin = origin;
    }

    if (mainWindowOrigin === origin && !data.initial) {
      let payload = {navigation: data.navigation};
      sendResponseToOrigin(payload, origin);
    }
  });

  window.addEventListener('beforeunload', handleUnload);
  function handleUnload(event) {
    sendResponse({navigation: true});
  }

  window.addEventListener('click', handleClick);
  function handleClick(event) {
    sendResponse({clicked: true});
  }

  function generateHeight() {
    let height = 0;
    let children = [].slice.call(document.body.children);
    children.forEach(child => {
      height += generateHeightOfElement(child);
    });
    return height;
  }

  function generateHeightOfElement(element) {
    let styles = window.getComputedStyle(element);
    
    let marginTopHeight = formatPixelString(styles.marginTop),
        marginBottomHeight = formatPixelString(styles.marginBottom),
        borderTopHeight = formatBorderString(styles.borderTop),
        borderBottomHeight = formatBorderString(styles.borderBottom);

    let baseHeight = element.scrollHeight,
        marginHeight = marginTopHeight + marginBottomHeight,
        borderHeight = borderTopHeight + borderBottomHeight;
    
    let totalHeight = baseHeight + marginHeight + borderHeight;

    return totalHeight;
  }

  function formatPixelString(string) {
    return Number(string.replace('px', ''));
  }

  function formatBorderString(string) {
    return formatPixelString(string.split(' ')[0]);
  }

  function sendResponse(payload) {
    let origin = mainWindowOrigin || "*";
    sendResponseToOrigin(payload, origin);
  }

  function sendResponseToOrigin(payload, origin) {
    let defaults = {
      navigation: false,
      clicked: false,
      initial: false,
      id: paneId,
      height: generateHeight(),
      location: location.href,
    };
    payload = Object.assign(defaults, payload);
    try {
      window.parent.postMessage(payload, origin);
    } catch (e) {
      console.error(e);
    }
  }

  setTimeout(function() {
    sendResponse({initial: true})
  }, 0);
});