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

  let previousHeight;
  const mutationObserver = new MutationObserver(function(mutations, observer) {
    for (let i = 0; i < 5; i += 1) {
      setTimeout(function() {
        let newHeight = generateHeight();
        if (previousHeight !== newHeight) {
          previousHeight = newHeight;
          sendResponse({changeDetected: true});        }
      }, 500 * i);
    }
  });

  mutationObserver.observe(document.body, {attributes: true, childList: true, subtree: true});

  function generateHeight() {
    let height = generateMarginBorderHeightOfElement(document.body);
    let children = [].slice.call(document.body.children);
    children.forEach(child => {
      height += generateHeightOfElement(child);
    });
    return height;
  }

  function generateHeightOfElement(element) {
    let baseHeight = element.scrollHeight;
    let marginBorderHeight = generateMarginBorderHeightOfElement(element);
    return baseHeight + marginBorderHeight;
  }

  function generateMarginBorderHeightOfElement(element) {
    let style = window.getComputedStyle(element);
    let marginHeight = calculateMarginHeight(style);
    let borderHeight = calculateBorderHeight(style);
    return marginHeight + borderHeight;
  }

  function calculateMarginHeight(style) {
    let marginTopHeight = formatPixelString(style.marginTop),
        marginBottomHeight = formatPixelString(style.marginBottom);
    return marginTopHeight + marginBottomHeight;
  }

  function calculateBorderHeight(style) {
    let borderTopHeight = formatBorderString(style.borderTop),
        borderBottomHeight = formatBorderString(style.borderBottom);
    return borderTopHeight + borderBottomHeight;
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