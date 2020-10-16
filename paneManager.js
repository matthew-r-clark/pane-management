window.addEventListener('DOMContentLoaded', function() {
  let iframes = [].slice.call(document.querySelectorAll('iframe'));

  let generateId = (function() {
    let count = 0;

    return function() {
      count += 1;
      return count;
    }
  })();

  function Pane(iframe) {
    this.id = generateId();
    this.element = iframe;
    this.origin = new URL(iframe.src).origin;
    this.previousHeight = 0;
    this.initialized = false;
    this.eligible = !this.element.height || !this.element['height-dynamic'];
  }

  Pane.prototype.getHeight = function() {
    return this.element.height;
  }

  Pane.prototype.setHeight = function(value) {
    let currentHeight = this.getHeight();
    if (this.eligible && currentHeight !== value) {
      this.previousHeight = currentHeight;
      this.element.height = value;
    }
    if (!this.initialized) {
      this.initialized = true;
    }
  }

  Pane.prototype.heightDecreased = function() {
    return Number(this.previousHeight) > Number(this.getHeight());
  }

  Pane.prototype.scrollToTop = function() {
    let element = this.element;
    let offsetHeight = 0;
    while (element !== document.body) {
      offsetHeight += element.offsetTop;
      element = element.offsetParent;
    }
    window.scrollTo(0, offsetHeight);
  }

  Pane.prototype.requestUpdate = function(data) {
    let targetWindow = this.element.contentWindow;
    let payload = Object.assign(data, {id: this.id});
    targetWindow.postMessage(payload, this.origin);
  }

  Pane.prototype.broadcastId = function() {
    this.requestUpdate({initial: true});
  }

  Pane.prototype.setOrigin = function(origin) {
    this.origin = origin;
  }

  let Panes = {
    list: [],

    registerPanes: function(iframeList) {
      iframeList.forEach(this.registerIframe.bind(this));
    },

    registerIframe: function(iframe) {
      let pane = new Pane(iframe);
      this.add(pane);
    },

    unregisterIframe: function(iframe) {
      let pane = this.list.filter(pane => pane.element === iframe)[0];
      this.remove(pane);
    },

    requestUpdates: function(data) {
      this.list.forEach(function(pane) {
        let payload = {
          id: pane.id,
          name: 'iframe-resizer',
        };
        if (data && data.id === pane.id) {
          payload.navigation = data.navigation;
        }
        pane.requestUpdate(payload);
      });
    },

    getById: function(id) {
      return this.list.filter(pane => pane.id === id)[0];
    },

    getByLocation: function(location) {
      location = removeTrailingForwardSlash(location);
      return this.list.filter(pane => {
        return removeTrailingForwardSlash(pane.element.src) === location;
      })[0];
    },

    add: function(pane) {
      this.list.push(pane);
    },

    remove: function(pane) {
      let index = this.list.indexOf(pane);
      this.list.splice(index, 1);
    },

    isTrustedSource: function(origin) {
      return this.list.some(pane => pane.origin === origin);
    },

    empty: function() {
      return this.list.length === 0;
    },

    notInitialized: function() {
      return this.list.some(pane => !pane.initialized);
    },

    init: function(iframes) {
      this.registerPanes(iframes);
    },
  };
  Panes.init(iframes);

  function removeTrailingForwardSlash(url) {
    if (url[url.length - 1] === "/") {
      return url.slice(0, -1);
    }
    return url;
  }

  window.addEventListener('resize', () => Panes.requestUpdates());

  let pendingPaneId = null;
  let interaction = false;
  window.addEventListener('message', function(event) {
    let data = event.data;

    if (Panes.isTrustedSource(event.origin)) {
      if ((data.changeDetected || data.clicked) && data.id) {
        setIframeHeight(data.id, data.height);
        let pane = Panes.getById(data.id);
        if (pane.heightDecreased() && interaction) {
          pane.scrollToTop();
        }
        interaction = true;
      } else if (data.navigation) { // location change
        pendingPaneId = data.id;
      } else if (data.initial && Panes.notInitialized()) { // initial load
        let pane = Panes.getByLocation(data.location);
        setIframeHeight(pane.id, data.height);
        pane.broadcastId();
      } else if (data.initial && pendingPaneId) { // initial load after location change
        let id = pendingPaneId;
        pendingPaneId = null;
        setIframeHeight(id, data.height);
        let pane = Panes.getById(id);
        if (pane.heightDecreased()) {
          pane.scrollToTop();
        }
        pane.setOrigin(event.origin);
        pane.broadcastId();
      } else if (data.id) { // window resized
        setIframeHeight(data.id, data.height);
      }
    }
  });

  function setIframeHeight(id, height) {
    let pane = Panes.getById(id);
    pane.setHeight(height);
  }

  const mutationObserver = new MutationObserver(function(mutations, observer) {
    let updatedIframes = [].slice.call(document.querySelectorAll('iframe'));
    if (updatedIframes.length > iframes.length) {
      findAndRegisterNewFrame(updatedIframes);
    } else if (updatedIframes.length < iframes.length) {
      findAndUnregisterRemovedFrame(updatedIframes);
    }
  });

  function findAndRegisterNewFrame(updatedIframes) {
    let newIframe = updatedIframes.filter(iframe => !iframes.includes(iframe))[0];
    Panes.registerIframe(newIframe);
    iframes = updatedIframes;
  }

  function findAndUnregisterRemovedFrame(updatedIframes) {
    let retiredIframe = iframes.filter(iframe => !updatedIframes.includes(iframe))[0];
    Panes.unregisterIframe(retiredIframe);
    iframes = updatedIframes;
  };

  mutationObserver.observe(document.body, {attributes: true, childList: true, subtree: true})
});