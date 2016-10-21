/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var globalHook = __webpack_require__(1);
	globalHook(window);
	var websocketConnect = __webpack_require__(39);
	var setupHighlighter = __webpack_require__(40);

	websocketConnect('ws://localhost:8097/');
	window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on('react-devtools', function (agent) {
	  setupHighlighter(agent);
	});

/***/ },

/***/ 1:
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	/**
	 * NOTE: This file cannot `require` any other modules. We `.toString()` the
	 *       function in some places and inject the source into the page.
	 */
	function installGlobalHook(window) {
	  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
	    return;
	  }
	  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
	    value: {
	      _renderers: {},
	      helpers: {},
	      inject: function inject(renderer) {
	        var id = Math.random().toString(16).slice(2);
	        this._renderers[id] = renderer;
	        this.emit('renderer', { id: id, renderer: renderer });
	      },
	      _listeners: {},
	      sub: function sub(evt, fn) {
	        var _this = this;

	        this.on(evt, fn);
	        return function () {
	          return _this.off(evt, fn);
	        };
	      },
	      on: function on(evt, fn) {
	        if (!this._listeners[evt]) {
	          this._listeners[evt] = [];
	        }
	        this._listeners[evt].push(fn);
	      },
	      off: function off(evt, fn) {
	        if (!this._listeners[evt]) {
	          return;
	        }
	        var ix = this._listeners[evt].indexOf(fn);
	        if (ix !== -1) {
	          this._listeners[evt].splice(ix, 1);
	        }
	        if (!this._listeners[evt].length) {
	          this._listeners[evt] = null;
	        }
	      },
	      emit: function emit(evt, data) {
	        if (this._listeners[evt]) {
	          this._listeners[evt].map(function (fn) {
	            return fn(data);
	          });
	        }
	      }
	    }
	  });
	}

	module.exports = installGlobalHook;

/***/ },

/***/ 4:
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },

/***/ 39:
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	function websocketConnect(uri, WebSocket) {
	  WebSocket = WebSocket || window.WebSocket;
	  var messageListeners = [];
	  var closeListeners = [];
	  var ws = new WebSocket(uri);
	  // this is accessed by the eval'd backend code
	  var FOR_BACKEND = { // eslint-disable-line no-unused-vars
	    wall: {
	      listen: function listen(fn) {
	        messageListeners.push(fn);
	      },
	      onClose: function onClose(fn) {
	        closeListeners.push(fn);
	      },
	      send: function send(data) {
	        ws.send(JSON.stringify(data));
	      }
	    }
	  };
	  ws.onclose = function () {
	    console.warn('devtools socket closed');
	    closeListeners.forEach(function (fn) {
	      return fn();
	    });
	  };
	  ws.onerror = function (error) {
	    console.warn('devtools socket errored', error);
	    closeListeners.forEach(function (fn) {
	      return fn();
	    });
	  };
	  ws.onopen = function () {
	    tryToConnect();
	  };

	  function tryToConnect() {
	    ws.onmessage = function (evt) {
	      if (evt.data.indexOf('eval:') === 0) {
	        initialize(evt.data.slice('eval:'.length));
	      }
	    };
	  }

	  function initialize(text) {
	    try {
	      // FOR_BACKEND is used by the eval'd code
	      eval(text); // eslint-disable-line no-eval
	    } catch (e) {
	      console.error('Failed to eval' + e.message + '\n' + e.stack);
	      debugger; // eslint-disable-line no-debugger
	      return;
	    }
	    ws.onmessage = handleMessage;
	  }
	  function handleMessage(evt) {
	    var data;
	    try {
	      data = JSON.parse(evt.data);
	    } catch (e) {
	      console.error('failed to parse json: ' + evt.data);
	      return;
	    }
	    // the devtools closed
	    if (data.$close || data.$error) {
	      closeListeners.forEach(function (fn) {
	        return fn();
	      });
	      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.emit('shutdown');
	      tryToConnect();
	      return;
	    }
	    if (data.$open) {
	      return; // ignore
	    }
	    messageListeners.forEach(function (fn) {
	      try {
	        fn(data);
	      } catch (e) {
	        // jsc doesn't play so well with tracebacks that go into eval'd code,
	        // so the stack trace here will stop at the `eval()` call. Getting the
	        // message that caused the error is the best we can do for now.
	        console.log(data);
	        throw e;
	      }
	    });
	  }
	}

	module.exports = websocketConnect;

/***/ },

/***/ 40:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var Highlighter = __webpack_require__(41);

	module.exports = function setup(agent) {
	  var hl = new Highlighter(window, function (node) {
	    agent.selectFromDOMNode(node);
	  });
	  agent.on('highlight', function (data) {
	    return hl.highlight(data.node, data.name);
	  });
	  agent.on('highlightMany', function (nodes) {
	    return hl.highlightMany(nodes);
	  });
	  agent.on('hideHighlight', function () {
	    return hl.hideHighlight();
	  });
	  agent.on('refreshMultiOverlay', function () {
	    return hl.refreshMultiOverlay();
	  });
	  agent.on('startInspecting', function () {
	    return hl.startInspecting();
	  });
	  agent.on('stopInspecting', function () {
	    return hl.stopInspecting();
	  });
	  agent.on('shutdown', function () {
	    hl.remove();
	  });
	};

/***/ },

/***/ 41:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Overlay = __webpack_require__(42);
	var MultiOverlay = __webpack_require__(43);

	/**
	 * Manages the highlighting of items on an html page, as well as
	 * hover-to-inspect.
	 */

	var Highlighter = function () {
	  function Highlighter(win, onSelect) {
	    _classCallCheck(this, Highlighter);

	    this._win = win;
	    this._onSelect = onSelect;
	    this._overlay = null;
	    this._multiOverlay = null;
	    this._subs = [];
	  }

	  _createClass(Highlighter, [{
	    key: 'startInspecting',
	    value: function startInspecting() {
	      this._inspecting = true;
	      this._subs = [captureSubscription(this._win, 'mouseover', this.onHover.bind(this)), captureSubscription(this._win, 'mousedown', this.onMouseDown.bind(this)), captureSubscription(this._win, 'click', this.onClick.bind(this))];
	    }
	  }, {
	    key: 'stopInspecting',
	    value: function stopInspecting() {
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      this.hideHighlight();
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      this.stopInspecting();
	      if (this._button && this._button.parentNode) {
	        this._button.parentNode.removeChild(this._button);
	      }
	    }
	  }, {
	    key: 'highlight',
	    value: function highlight(node, name) {
	      this.removeMultiOverlay();
	      if (!this._overlay) {
	        this._overlay = new Overlay(this._win);
	      }
	      this._overlay.inspect(node, name);
	    }
	  }, {
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      this.removeOverlay();
	      if (!this._multiOverlay) {
	        this._multiOverlay = new MultiOverlay(this._win);
	      }
	      this._multiOverlay.highlightMany(nodes);
	    }
	  }, {
	    key: 'hideHighlight',
	    value: function hideHighlight() {
	      this._inspecting = false;
	      this.removeOverlay();
	      this.removeMultiOverlay();
	    }
	  }, {
	    key: 'refreshMultiOverlay',
	    value: function refreshMultiOverlay() {
	      if (!this._multiOverlay) {
	        return;
	      }
	      this._multiOverlay.refresh();
	    }
	  }, {
	    key: 'removeOverlay',
	    value: function removeOverlay() {
	      if (!this._overlay) {
	        return;
	      }
	      this._overlay.remove();
	      this._overlay = null;
	    }
	  }, {
	    key: 'removeMultiOverlay',
	    value: function removeMultiOverlay() {
	      if (!this._multiOverlay) {
	        return;
	      }
	      this._multiOverlay.remove();
	      this._multiOverlay = null;
	    }
	  }, {
	    key: 'onMouseDown',
	    value: function onMouseDown(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this._onSelect(evt.target);
	      return;
	    }
	  }, {
	    key: 'onClick',
	    value: function onClick(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.hideHighlight();
	    }
	  }, {
	    key: 'onHover',
	    value: function onHover(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.highlight(evt.target);
	    }
	  }, {
	    key: 'injectButton',
	    value: function injectButton() {
	      this._button = makeMagnifier();
	      this._button.onclick = this.startInspecting.bind(this);
	      this._win.document.body.appendChild(this._button);
	    }
	  }]);

	  return Highlighter;
	}();

	function captureSubscription(obj, evt, cb) {
	  obj.addEventListener(evt, cb, true);
	  return function () {
	    return obj.removeEventListener(evt, cb, true);
	  };
	}

	function makeMagnifier() {
	  var button = window.document.createElement('button');
	  button.innerHTML = '&#128269;';
	  button.style.backgroundColor = 'transparent';
	  button.style.border = 'none';
	  button.style.outline = 'none';
	  button.style.cursor = 'pointer';
	  button.style.position = 'fixed';
	  button.style.bottom = '10px';
	  button.style.right = '10px';
	  button.style.fontSize = '30px';
	  button.style.zIndex = 10000000;
	  return button;
	}

	module.exports = Highlighter;

/***/ },

/***/ 42:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(4);

	var Overlay = function () {
	  function Overlay(window) {
	    _classCallCheck(this, Overlay);

	    var doc = window.document;
	    this.win = window;
	    this.container = doc.createElement('div');
	    this.node = doc.createElement('div');
	    this.border = doc.createElement('div');
	    this.padding = doc.createElement('div');
	    this.content = doc.createElement('div');

	    this.border.style.borderColor = overlayStyles.border;
	    this.padding.style.borderColor = overlayStyles.padding;
	    this.content.style.backgroundColor = overlayStyles.background;

	    assign(this.node.style, {
	      borderColor: overlayStyles.margin,
	      pointerEvents: 'none',
	      position: 'fixed'
	    });

	    this.tip = doc.createElement('div');
	    assign(this.tip.style, {
	      border: '1px solid #aaa',
	      backgroundColor: 'rgb(255, 255, 178)',
	      fontFamily: 'sans-serif',
	      color: 'orange',
	      padding: '3px 5px',
	      position: 'fixed',
	      fontSize: '10px'
	    });

	    this.nameSpan = doc.createElement('span');
	    this.tip.appendChild(this.nameSpan);
	    assign(this.nameSpan.style, {
	      color: 'rgb(136, 18, 128)',
	      marginRight: '5px'
	    });
	    this.dimSpan = doc.createElement('span');
	    this.tip.appendChild(this.dimSpan);
	    assign(this.dimSpan.style, {
	      color: '#888'
	    });

	    this.container.style.zIndex = 10000000;
	    this.node.style.zIndex = 10000000;
	    this.tip.style.zIndex = 10000000;
	    this.container.appendChild(this.node);
	    this.container.appendChild(this.tip);
	    this.node.appendChild(this.border);
	    this.border.appendChild(this.padding);
	    this.padding.appendChild(this.content);
	    doc.body.appendChild(this.container);
	  }

	  _createClass(Overlay, [{
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	      }
	    }
	  }, {
	    key: 'inspect',
	    value: function inspect(node, name) {
	      // We can't get the size of text nodes or comment nodes. React as of v15
	      // heavily uses comment nodes to delimit text.
	      if (node.nodeType !== Node.ELEMENT_NODE) {
	        return;
	      }
	      var box = node.getBoundingClientRect();
	      var dims = getElementDimensions(node);

	      boxWrap(dims, 'margin', this.node);
	      boxWrap(dims, 'border', this.border);
	      boxWrap(dims, 'padding', this.padding);

	      assign(this.content.style, {
	        height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + 'px',
	        width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + 'px'
	      });

	      assign(this.node.style, {
	        top: box.top - dims.marginTop + 'px',
	        left: box.left - dims.marginLeft + 'px'
	      });

	      this.nameSpan.textContent = name || node.nodeName.toLowerCase();
	      this.dimSpan.textContent = box.width + 'px × ' + box.height + 'px';

	      var tipPos = findTipPos({
	        top: box.top - dims.marginTop,
	        left: box.left - dims.marginLeft,
	        height: box.height + dims.marginTop + dims.marginBottom,
	        width: box.width + dims.marginLeft + dims.marginRight
	      }, this.win);
	      assign(this.tip.style, tipPos);
	    }
	  }]);

	  return Overlay;
	}();

	function findTipPos(dims, win) {
	  var tipHeight = 20;
	  var margin = 5;
	  var top;
	  if (dims.top + dims.height + tipHeight <= win.innerHeight) {
	    if (dims.top + dims.height < 0) {
	      top = margin;
	    } else {
	      top = dims.top + dims.height + margin;
	    }
	  } else if (dims.top - tipHeight <= win.innerHeight) {
	    if (dims.top - tipHeight - margin < margin) {
	      top = margin;
	    } else {
	      top = dims.top - tipHeight - margin;
	    }
	  } else {
	    top = win.innerHeight - tipHeight - margin;
	  }

	  top += 'px';

	  if (dims.left < 0) {
	    return { top: top, left: margin };
	  }
	  if (dims.left + 200 > win.innerWidth) {
	    return { top: top, right: margin };
	  }
	  return { top: top, left: dims.left + margin + 'px' };
	}

	function getElementDimensions(element) {
	  var calculatedStyle = window.getComputedStyle(element);

	  return {
	    borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
	    borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
	    borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
	    borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
	    marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
	    marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
	    marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
	    marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
	    paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
	    paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
	    paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
	    paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
	  };
	}

	function boxWrap(dims, what, node) {
	  assign(node.style, {
	    borderTopWidth: dims[what + 'Top'] + 'px',
	    borderLeftWidth: dims[what + 'Left'] + 'px',
	    borderRightWidth: dims[what + 'Right'] + 'px',
	    borderBottomWidth: dims[what + 'Bottom'] + 'px',
	    borderStyle: 'solid'
	  });
	}

	var overlayStyles = {
	  background: 'rgba(120, 170, 210, 0.7)',
	  padding: 'rgba(77, 200, 0, 0.3)',
	  margin: 'rgba(255, 155, 0, 0.3)',
	  border: 'rgba(255, 200, 50, 0.3)'
	};

	module.exports = Overlay;

/***/ },

/***/ 43:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(4);

	var MultiOverlay = function () {
	  function MultiOverlay(window) {
	    _classCallCheck(this, MultiOverlay);

	    this.win = window;
	    var doc = window.document;
	    this.container = doc.createElement('div');
	    doc.body.appendChild(this.container);
	    this._currentNodes = null;
	  }

	  _createClass(MultiOverlay, [{
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      var _this = this;

	      this._currentNodes = nodes;
	      this.container.innerHTML = '';

	      nodes.forEach(function (node) {
	        var div = _this.win.document.createElement('div');
	        if (typeof node.getBoundingClientRect !== 'function') {
	          return;
	        }
	        var box = node.getBoundingClientRect();
	        if (box.bottom < 0 || box.top > window.innerHeight) {
	          return;
	        }
	        assign(div.style, {
	          top: box.top + 'px',
	          left: box.left + 'px',
	          width: box.width + 'px',
	          height: box.height + 'px',
	          border: '2px dotted rgba(200, 100, 100, .8)',
	          boxSizing: 'border-box',
	          backgroundColor: 'rgba(200, 100, 100, .2)',
	          position: 'fixed',
	          zIndex: 10000000,
	          pointerEvents: 'none'
	        });
	        _this.container.appendChild(div);
	      });
	    }
	  }, {
	    key: 'refresh',
	    value: function refresh() {
	      if (this._currentNodes) {
	        this.highlightMany(this._currentNodes);
	      }
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	        this._currentNodes = null;
	      }
	    }
	  }]);

	  return MultiOverlay;
	}();

	module.exports = MultiOverlay;

/***/ }

/******/ });