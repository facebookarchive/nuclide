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
/******/ 	__webpack_require__.p = "/Users/most/Code/pythonVSCode_mostafaeweda/src/client/jupyter/browser";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/// <reference path="typings/index.d.ts" />
	const transformime = __webpack_require__(1);
	const MarkdownTransform = __webpack_require__(56);
	const transform = transformime.createTransform([MarkdownTransform]);
	const ResultsContainerId = 'resultsContainer';
	function displayData(data, whiteBg) {
	    const container = document.getElementById(ResultsContainerId);
	    if (typeof data['text/html'] === 'string') {
	        data['text/html'] = data['text/html'].replace(/<\/scripts>/g, '</script>');
	    }
	    return transform(data).then(result => {
	        const div = document.createElement('div');
	        div.style.display = 'block';
	        div.appendChild(result.el);
	        // If dealing with images add them inside a div with white background
	        if (whiteBg === true || Object.keys(data).some(key => key.startsWith('image/'))) {
	            div.style.backgroundColor = 'white';
	        }
	        return container.appendChild(div);
	    });
	}
	window.initializeResults = (rootDirName, port, whiteBg) => {
	    const results = window.JUPYTER_DATA;
	    window.__dirname = rootDirName;
	    try {
	        let color = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('?color=') + 7));
	        color = color.substring(0, color.indexOf('&fontFamily='));
	        if (color.length > 0) {
	            window.document.body.style.color = color;
	        }
	        let fontFamily = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('&fontFamily=') + 12));
	        fontFamily = fontFamily.substring(0, fontFamily.indexOf('&fontSize='));
	        if (fontFamily.length > 0) {
	            window.document.body.style.fontFamily = fontFamily;
	        }
	        const fontSize = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('&fontSize=') + 10));
	        if (fontSize.length > 0) {
	            window.document.body.style.fontSize = fontSize;
	        }
	    }
	    catch (ex) {
	    }
	    document.getElementById('clearResults').addEventListener('click', () => {
	        document.getElementById(ResultsContainerId).innerHTML = '';
	    });
	    try {
	        if (typeof port === 'number' && port > 0) {
	            var socket = window.io.connect('http://localhost:' + port);
	            const displayStyleEle = document.getElementById('displayStyle');
	            displayStyleEle.addEventListener('click', () => {
	                socket.emit('appendResults', { append: displayStyleEle.checked });
	            });
	            socket.on('results', (results) => {
	                if (displayStyleEle.checked !== true) {
	                    document.getElementById(ResultsContainerId).innerHTML = '';
	                }
	                const promises = results.map(data => displayData(data, whiteBg));
	                Promise.all(promises).then(elements => {
	                    // Bring the first item into view
	                    if (elements.length > 0) {
	                        try {
	                            elements[0].scrollIntoView(true);
	                        }
	                        catch (ex) {
	                        }
	                    }
	                });
	            });
	            socket.on('clientExists', (data) => {
	                socket.emit('clientExists', { id: data.id });
	            });
	        }
	    }
	    catch (ex) {
	        document.getElementById('displayStyle').style.display = 'none';
	        const errorDiv = document.createElement('div');
	        errorDiv.innerHTML = 'Initializing live updates for results failed with the following error:\n' + ex.message;
	        errorDiv.style.color = 'red';
	        document.body.appendChild(errorDiv);
	    }
	    const promises = results.map(data => displayData(data, whiteBg));
	    Promise.all(promises).then(elements => {
	        // Bring the first item into view
	        if (elements.length > 1) {
	            try {
	                elements[0].scrollIntoView(true);
	            }
	            catch (ex) { }
	        }
	    });
	};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createTransform = exports.MarkdownTransform = exports.LaTeXTransform = exports.ScriptTransform = exports.PDFTransform = exports.SVGTransform = exports.HTMLTransform = exports.ImageTransform = exports.TextTransform = exports.Transformime = undefined;

	var _createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	  };
	}();

	var _text = __webpack_require__(2);

	var _image = __webpack_require__(25);

	var _html = __webpack_require__(26);

	var _svg = __webpack_require__(27);

	var _pdf = __webpack_require__(28);

	var _script = __webpack_require__(29);

	var _latex = __webpack_require__(30);

	var _commonmark = __webpack_require__(34);

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	/**
	 * Transforms mimetypes into HTMLElements
	 */
	var Transformime = function () {

	  /**
	   * Public constructor
	   * @param  {function[]} transformers - list of transformers, in reverse priority order.
	   */
	  function Transformime(transformers) {
	    var _this = this;

	    _classCallCheck(this, Transformime);

	    // Initialize instance variables.
	    this.transformers = [];
	    this.push(_text.TextTransform);
	    this.push(_image.ImageTransform);
	    this.push(_svg.SVGTransform);
	    this.push(_html.HTMLTransform);
	    this.push(_pdf.PDFTransform);
	    this.push(_script.ScriptTransform);
	    this.push(_commonmark.MarkdownTransform);
	    this.push(_latex.LaTeXTransform);
	    if (transformers) transformers.forEach(function (transformer) {
	      _this.push(transformer);
	    });
	  }
	  /**
	   * Transforms a mime bundle, using the richest available representation,
	   * into an HTMLElement.
	   * @param  {any}      bundle - {mimetype1: data1, mimetype2: data2, ...}
	   * @param  {Document} document - Any of window.document, iframe.contentDocument
	   * @return {Promise<{mimetype: string, el: HTMLElement}>}
	   */

	  _createClass(Transformime, [{
	    key: 'transform',
	    value: function transform(bundle, document) {
	      if (this.transformers.length <= 0) {
	        // Empty transformers
	        return Promise.reject(new Error('No transformers configured'));
	      }

	      if (Object.keys(bundle).length <= 0) {
	        return Promise.reject(new Error('MIME Bundle empty'));
	      }

	      var richMimetype = void 0;
	      var richTransformer = void 0;

	      // Choose the last transformer as the most rich
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = this.transformers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var transformer = _step.value;

	          if (transformer.mimetype) {
	            // Make sure the transformer's mimetype is in array format.
	            var transformer_mimetypes = transformer.mimetype;
	            if (!Array.isArray(transformer_mimetypes)) {
	              transformer_mimetypes = [transformer_mimetypes];
	            }

	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;

	            try {
	              for (var _iterator2 = transformer_mimetypes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                var transformer_mimetype = _step2.value;

	                if (transformer_mimetype in bundle) {
	                  richMimetype = transformer_mimetype;
	                  richTransformer = transformer;
	                }
	              }
	            } catch (err) {
	              _didIteratorError2 = true;
	              _iteratorError2 = err;
	            } finally {
	              try {
	                if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                  _iterator2.return();
	                }
	              } finally {
	                if (_didIteratorError2) {
	                  throw _iteratorError2;
	                }
	              }
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      if (richMimetype && richTransformer) {
	        // Don't assume the transformation will return a promise.  Also
	        // don't assume the transformation will succeed.
	        try {
	          return Promise.resolve(richTransformer.call(richTransformer, richMimetype, bundle[richMimetype], document)).then(function (el) {
	            return { mimetype: richMimetype, el: el };
	          });
	        } catch (e) {
	          return Promise.reject(e);
	        }
	      } else {
	        return Promise.reject(new Error('Transformer(s) for ' + Object.keys(bundle).join(', ') + ' not found.'));
	      }
	    }

	    /**
	     * Deletes all transformers by mimetype.
	     * @param {string|string[]} mimetype - mimetype the data type (e.g. text/plain, text/html, image/png)
	     */

	  }, {
	    key: 'del',
	    value: function del(mimetype) {
	      // Convert mimetype to an array.
	      var mimetypes = mimetype;
	      if (!Array.isArray(mimetypes)) {
	        mimetypes = [mimetypes];
	      }

	      // Remove each mimetype.
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = mimetypes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          mimetype = _step3.value;

	          for (var i = 0; i < this.transformers.length; i++) {
	            var transformer = this.transformers[i];

	            // If the mimetype matches the one we want to remove, remove it.
	            if (mimetype === transformer.mimetype) {
	              this.transformers.splice(i, 1);
	              i--;

	              // If the mimetype we want to remove is in the list of the
	              // mimetypes supported by the transformer, remove it from the list.
	              // If the transformer mimetype list is then empty, remove the
	              // transformer.
	            } else if (Array.isArray(transformer.mimetype) && mimetype in transformer.mimetype) {
	              if (transformer.mimetype.length === 1) {
	                this.transformers.splice(i, 1);
	                i--;
	              } else {
	                transformer.mimetype.splice(transformer.mimetype.indexOf(mimetype), 1);
	              }
	            }
	          }
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	    }

	    /**
	     * Gets a transformer matching the mimetype
	     * @param {string} mimetype - the data type (e.g. text/plain, text/html, image/png)
	     * @return {function} Matching transformer
	     */

	  }, {
	    key: 'get',
	    value: function get(mimetype) {
	      // Loop through the transformers array in reverse.
	      for (var i = this.transformers.length - 1; i >= 0; i--) {
	        var transformer = this.transformers[i];

	        // Get an array of the mimetypes that the transformer supports.
	        var transformer_mimetypes = transformer.mimetype;
	        if (!Array.isArray(transformer_mimetypes)) {
	          transformer_mimetypes = [transformer_mimetypes];
	        }

	        // Check if any of the mimetypes match the one we are looking for.
	        var _iteratorNormalCompletion4 = true;
	        var _didIteratorError4 = false;
	        var _iteratorError4 = undefined;

	        try {
	          for (var _iterator4 = transformer_mimetypes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var transformer_mimetype = _step4.value;

	            if (mimetype === transformer_mimetype) {
	              return transformer;
	            }
	          }
	        } catch (err) {
	          _didIteratorError4 = true;
	          _iteratorError4 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	              _iterator4.return();
	            }
	          } finally {
	            if (_didIteratorError4) {
	              throw _iteratorError4;
	            }
	          }
	        }
	      }
	    }

	    /**
	     * Sets a transformer matching the mimetype
	     * @param {string|string[]} mimetype - the data type (e.g. text/plain, text/html, image/png)
	     * @param {function} transformer
	     * @return {function} inserted transformer function (may be different than arg)
	     */

	  }, {
	    key: 'set',
	    value: function set(mimetype, transformer) {
	      this.del(mimetype);
	      return this.push(transformer, mimetype);
	    }

	    /**
	     * Appends a transformer to the transformer list.
	     * @param  {function} transformer
	     * @param  {string|string[]} mimetype
	     * @return {function} inserted transformer function (may be different than arg)
	     */

	  }, {
	    key: 'push',
	    value: function push(transformer, mimetype) {
	      // If the mimetype specified is different than the mimetype of the
	      // transformer, make a copy of the transformer and set the new mimetype
	      // on the copy.
	      var transform = transformer;
	      if (mimetype && transformer.mimetype !== mimetype) {
	        transform = this._proxy(transformer, mimetype);
	      }

	      // Verify a mimetype is set on the transformer.
	      if (!transform.mimetype) throw Error('Could not infer transformer mimetype');

	      this.transformers.push(transform);
	      return transform;
	    }

	    /**
	     * Create a proxy to a transformer, using another mimetype.
	     * @param  {function} transformer
	     * @param  {string|string[]} mimetype
	     * @return {function} transformer
	     */

	  }, {
	    key: '_proxy',
	    value: function _proxy(transformer, mimetype) {
	      var transform = function transform() {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        return transformer.call.apply(transformer, [this].concat(args));
	      };
	      transform.mimetype = mimetype;
	      return transform;
	    }
	  }]);

	  return Transformime;
	}();

	/**
	* Helper to create a function that transforms a MIME bundle into an HTMLElement
	* using the given document and list of transformers.
	* @param  {function[]} [transformers] List of transformers, in reverse priority order.
	* @param  {Document}   [doc]          E.g. window.document, iframe.contentDocument
	* @return {function}
	*/

	function createTransform(transformers, doc) {
	  var t = new Transformime(transformers);

	  if (!doc) {
	    doc = document;
	  }

	  /**
	   * Transforms a MIME bundle into an HTMLElement.
	   * @param  {object} bundle {mimetype1: data1, mimetype2: data2, ...}
	   * @return {Promise<{mimetype: string, el: HTMLElement}>}
	   */
	  return function transform(bundle) {
	    return t.transform(bundle, doc);
	  };
	}

	exports.Transformime = Transformime;
	exports.TextTransform = _text.TextTransform;
	exports.ImageTransform = _image.ImageTransform;
	exports.HTMLTransform = _html.HTMLTransform;
	exports.SVGTransform = _svg.SVGTransform;
	exports.PDFTransform = _pdf.PDFTransform;
	exports.ScriptTransform = _script.ScriptTransform;
	exports.LaTeXTransform = _latex.LaTeXTransform;
	exports.MarkdownTransform = _commonmark.MarkdownTransform;
	exports.createTransform = createTransform;
	//# sourceMappingURL=transformime.js.map

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.TextTransform = TextTransform;
	var Anser = __webpack_require__(3);
	var escapeCarriageReturn = __webpack_require__(24);

	/**
	 * Converts console text or plaintext to an HTML pre element.
	 *
	 * @param {string} mimetype - The mimetype of the data to be transformed,
	 * it is unused by this function but included for a common API.
	 * @param {string} value - The text data to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an html pre element.
	 * @return {HTMLElement} - A pre element for the given text
	 */
	function TextTransform(mimetype, value, document) {
	  var el = document.createElement('pre');
	  var esc = Anser.escapeForHtml(value);
	  esc = escapeCarriageReturn(esc);
	  el.innerHTML = Anser.ansiToHtml(esc);
	  return el;
	}
	TextTransform.mimetype = ['text/plain', 'jupyter/console-text'];
	//# sourceMappingURL=text.transform.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// This file was originally written by @drudru (https://github.com/drudru/ansi_up), MIT, 2011

	var _classCallCheck2 = __webpack_require__(4);

	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

	var _createClass2 = __webpack_require__(5);

	var _createClass3 = _interopRequireDefault(_createClass2);

	function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : { default: obj };
	}

	var ANSI_COLORS = [[{ color: "0, 0, 0", "class": "ansi-black" }, { color: "187, 0, 0", "class": "ansi-red" }, { color: "0, 187, 0", "class": "ansi-green" }, { color: "187, 187, 0", "class": "ansi-yellow" }, { color: "0, 0, 187", "class": "ansi-blue" }, { color: "187, 0, 187", "class": "ansi-magenta" }, { color: "0, 187, 187", "class": "ansi-cyan" }, { color: "255,255,255", "class": "ansi-white" }], [{ color: "85, 85, 85", "class": "ansi-bright-black" }, { color: "255, 85, 85", "class": "ansi-bright-red" }, { color: "0, 255, 0", "class": "ansi-bright-green" }, { color: "255, 255, 85", "class": "ansi-bright-yellow" }, { color: "85, 85, 255", "class": "ansi-bright-blue" }, { color: "255, 85, 255", "class": "ansi-bright-magenta" }, { color: "85, 255, 255", "class": "ansi-bright-cyan" }, { color: "255, 255, 255", "class": "ansi-bright-white" }]];

	var Anser = function () {
	    (0, _createClass3.default)(Anser, null, [{
	        key: "escapeForHtml",

	        /**
	         * Anser.escapeForHtml
	         * Escape the input HTML.
	         *
	         * This does the minimum escaping of text to make it compliant with HTML.
	         * In particular, the '&','<', and '>' characters are escaped. This should
	         * be run prior to `ansiToHtml`.
	         *
	         * @name Anser.escapeForHtml
	         * @function
	         * @param {String} txt The input text (containing the ANSI snippets).
	         * @returns {String} The escaped html.
	         */
	        value: function escapeForHtml(txt) {
	            return new Anser().escapeForHtml(txt);
	        }

	        /**
	         * Anser.linkify
	         * Adds the links in the HTML.
	         *
	         * This replaces any links in the text with anchor tags that display the
	         * link. The links should have at least one whitespace character
	         * surrounding it. Also, you should apply this after you have run
	         * `ansiToHtml` on the text.
	         *
	         * @name Anser.linkify
	         * @function
	         * @param {String} txt The input text.
	         * @returns {String} The HTML containing the <a> tags (unescaped).
	         */

	    }, {
	        key: "linkify",
	        value: function linkify(txt) {
	            return new Anser().linkify(txt);
	        }

	        /**
	         * Anser.ansiToHtml
	         * This replaces ANSI terminal escape codes with SPAN tags that wrap the
	         * content.
	         *
	         * This function only interprets ANSI SGR (Select Graphic Rendition) codes
	         * that can be represented in HTML.
	         * For example, cursor movement codes are ignored and hidden from output.
	         * The default style uses colors that are very close to the prescribed
	         * standard. The standard assumes that the text will have a black
	         * background. These colors are set as inline styles on the SPAN tags.
	         *
	         * Another option is to set `use_classes: true` in the options argument.
	         * This will instead set classes on the spans so the colors can be set via
	         * CSS. The class names used are of the format `ansi-*-fg/bg` and
	         * `ansi-bright-*-fg/bg` where `*` is the color name,
	         * i.e black/red/green/yellow/blue/magenta/cyan/white.
	         *
	         * @name Anser.ansiToHtml
	         * @function
	         * @param {String} txt The input text.
	         * @param {Object} options The options passed to the ansiToHTML method.
	         * @returns {String} The HTML output.
	         */

	    }, {
	        key: "ansiToHtml",
	        value: function ansiToHtml(txt, options) {
	            return new Anser().ansiToHtml(txt, options);
	        }

	        /**
	         * Anser.ansiToJson
	         * Converts ANSI input into JSON output.
	         *
	         * @name Anser.ansiToJson
	         * @function
	         * @param {String} txt The input text.
	         * @param {Object} options The options passed to the ansiToHTML method.
	         * @returns {String} The HTML output.
	         */

	    }, {
	        key: "ansiToJson",
	        value: function ansiToJson(txt, options) {
	            return new Anser().ansiToJson(txt, options);
	        }

	        /**
	         * Anser.ansiToText
	         * Converts ANSI input into text output.
	         *
	         * @name Anser.ansiToText
	         * @function
	         * @param {String} txt The input text.
	         * @returns {String} The text output.
	         */

	    }, {
	        key: "ansiToText",
	        value: function ansiToText(txt) {
	            return new Anser().ansiToText(txt);
	        }

	        /**
	         * Anser
	         * The `Anser` class.
	         *
	         * @name Anser
	         * @function
	         * @returns {Anser}
	         */

	    }]);

	    function Anser() {
	        (0, _classCallCheck3.default)(this, Anser);

	        this.fg = this.bg = this.fg_truecolor = this.bg_truecolor = null;
	        this.bright = 0;
	    }

	    /**
	     * setupPalette
	     * Sets up the palette.
	     *
	     * @name setupPalette
	     * @function
	     */

	    (0, _createClass3.default)(Anser, [{
	        key: "setupPalette",
	        value: function setupPalette() {
	            this.PALETTE_COLORS = [];

	            // Index 0..15 : System color
	            for (var i = 0; i < 2; ++i) {
	                for (var j = 0; j < 8; ++j) {
	                    this.PALETTE_COLORS.push(ANSI_COLORS[i][j].color);
	                }
	            }

	            // Index 16..231 : RGB 6x6x6
	            // https://gist.github.com/jasonm23/2868981#file-xterm-256color-yaml
	            var levels = [0, 95, 135, 175, 215, 255];
	            var format = function format(r, g, b) {
	                return levels[r] + ", " + levels[g] + ", " + levels[b];
	            };
	            var r = void 0,
	                g = void 0,
	                b = void 0;
	            for (var _r = 0; _r < 6; ++_r) {
	                for (var _g = 0; _g < 6; ++_g) {
	                    for (var _b = 0; _b < 6; ++_b) {
	                        this.PALETTE_COLORS.push(format(_r, _g, _b));
	                    }
	                }
	            }

	            // Index 232..255 : Grayscale
	            var level = 8;
	            for (var _i = 0; _i < 24; ++_i, level += 10) {
	                this.PALETTE_COLORS.push(format(level, level, level));
	            }
	        }

	        /**
	         * escapeForHtml
	         * Escapes the input text.
	         *
	         * @name escapeForHtml
	         * @function
	         * @param {String} txt The input text.
	         * @returns {String} The escpaed HTML output.
	         */

	    }, {
	        key: "escapeForHtml",
	        value: function escapeForHtml(txt) {
	            return txt.replace(/[&<>]/gm, function (str) {
	                return str == "&" ? "&amp;" : str == "<" ? "&lt;" : str == ">" ? "&gt;" : "";
	            });
	        }

	        /**
	         * linkify
	         * Adds HTML link elements.
	         *
	         * @name linkify
	         * @function
	         * @param {String} txt The input text.
	         * @returns {String} The HTML output containing link elements.
	         */

	    }, {
	        key: "linkify",
	        value: function linkify(txt) {
	            return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
	                return "<a href=\"" + str + "\">" + str + "</a>";
	            });
	        }

	        /**
	         * ansiToHtml
	         * Converts ANSI input into HTML output.
	         *
	         * @name ansiToHtml
	         * @function
	         * @param {String} txt The input text.
	         * @param {Object} options The options passed ot the `process` method.
	         * @returns {String} The HTML output.
	         */

	    }, {
	        key: "ansiToHtml",
	        value: function ansiToHtml(txt, options) {
	            return this.process(txt, options, true);
	        }

	        /**
	         * ansiToJson
	         * Converts ANSI input into HTML output.
	         *
	         * @name ansiToJson
	         * @function
	         * @param {String} txt The input text.
	         * @param {Object} options The options passed ot the `process` method.
	         * @returns {String} The JSON output.
	         */

	    }, {
	        key: "ansiToJson",
	        value: function ansiToJson(txt, options) {
	            options = options || {};
	            options.json = true;
	            options.clearLine = false;
	            return this.process(txt, options, true);
	        }

	        /**
	         * ansiToText
	         * Converts ANSI input into HTML output.
	         *
	         * @name ansiToText
	         * @function
	         * @param {String} txt The input text.
	         * @returns {String} The text output.
	         */

	    }, {
	        key: "ansiToText",
	        value: function ansiToText(txt) {
	            return this.process(txt, {}, false);
	        }

	        /**
	         * process
	         * Processes the input.
	         *
	         * @name process
	         * @function
	         * @param {String} txt The input text.
	         * @param {Object} options An object passed to `processChunk` method, extended with:
	         *
	         *  - `json` (Boolean): If `true`, the result will be an object.
	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
	         *
	         * @param {Boolean} markup
	         */

	    }, {
	        key: "process",
	        value: function process(txt, options, markup) {
	            var _this = this;

	            var self = this;
	            var raw_text_chunks = txt.split(/\033\[/);
	            var first_chunk = raw_text_chunks.shift(); // the first chunk is not the result of the split

	            if (options === undefined || options === null) {
	                options = {};
	            }
	            options.clearLine = /\r/.test(txt); // check for Carriage Return
	            var color_chunks = raw_text_chunks.map(function (chunk) {
	                return _this.processChunk(chunk, options, markup);
	            });

	            if (options && options.json) {
	                var first = self.processChunkJson("");
	                first.content = first_chunk;
	                first.clearLine = options.clearLine;
	                color_chunks.unshift(first);
	                if (options.remove_empty) {
	                    color_chunks = color_chunks.filter(function (c) {
	                        return !c.isEmpty();
	                    });
	                }
	                return color_chunks;
	            } else {
	                color_chunks.unshift(first_chunk);
	            }

	            return color_chunks.join("");
	        }

	        /**
	         * processChunkJson
	         * Processes the current chunk into json output.
	         *
	         * @name processChunkJson
	         * @function
	         * @param {String} text The input text.
	         * @param {Object} options An object containing the following fields:
	         *
	         *  - `json` (Boolean): If `true`, the result will be an object.
	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
	         *
	         * @param {Boolean} markup If false, the colors will not be parsed.
	         * @return {Object} The result object:
	         *
	         *  - `content` (String): The text.
	         *  - `fg` (String|null): The foreground color.
	         *  - `bg` (String|null): The background color.
	         *  - `fg_truecolor` (String|null): The foreground true color (if 16m color is enabled).
	         *  - `bg_truecolor` (String|null): The background true color (if 16m color is enabled).
	         *  - `clearLine` (Boolean): `true` if a carriageReturn \r was fount at end of line.
	         *  - `was_processed` (Bolean): `true` if the colors were processed, `false` otherwise.
	         *  - `isEmpty` (Function): A function returning `true` if the content is empty, or `false` otherwise.
	         *
	         */

	    }, {
	        key: "processChunkJson",
	        value: function processChunkJson(text, options, markup) {

	            // Are we using classes or styles?
	            options = typeof options == "undefined" ? {} : options;
	            var use_classes = options.use_classes = typeof options.use_classes != "undefined" && options.use_classes;
	            var key = options.key = use_classes ? "class" : "color";

	            var result = {
	                content: text,
	                fg: null,
	                bg: null,
	                fg_truecolor: null,
	                bg_truecolor: null,
	                clearLine: options.clearLine,
	                decoration: null,
	                was_processed: false,
	                isEmpty: function isEmpty() {
	                    return !result.content;
	                }
	            };

	            // Each "chunk" is the text after the CSI (ESC + "[") and before the next CSI/EOF.
	            //
	            // This regex matches four groups within a chunk.
	            //
	            // The first and third groups match code type.
	            // We supported only SGR command. It has empty first group and "m" in third.
	            //
	            // The second group matches all of the number+semicolon command sequences
	            // before the "m" (or other trailing) character.
	            // These are the graphics or SGR commands.
	            //
	            // The last group is the text (including newlines) that is colored by
	            // the other group"s commands.
	            var matches = text.match(/^([!\x3c-\x3f]*)([\d;]*)([\x20-\x2c]*[\x40-\x7e])([\s\S]*)/m);

	            if (!matches) return result;

	            var orig_txt = result.content = matches[4];
	            var nums = matches[2].split(";");

	            // We currently support only "SGR" (Select Graphic Rendition)
	            // Simply ignore if not a SGR command.
	            if (matches[1] !== "" || matches[3] !== "m") {
	                return result;
	            }

	            if (!markup) {
	                return result;
	            }

	            var self = this;

	            self.decoration = null;

	            while (nums.length > 0) {
	                var num_str = nums.shift();
	                var num = parseInt(num_str);

	                if (isNaN(num) || num === 0) {
	                    self.fg = self.bg = self.decoration = null;
	                } else if (num === 1) {
	                    self.decoration = "bold";
	                } else if (num === 2) {
	                    self.decoration = "dim";
	                    // Enable code 2 to get string
	                } else if (num == 3) {
	                    self.decoration = "italic";
	                } else if (num == 4) {
	                    self.decoration = "underline";
	                } else if (num == 5) {
	                    self.decoration = "blink";
	                } else if (num === 7) {
	                    self.decoration = "reverse";
	                } else if (num === 8) {
	                    self.decoration = "hidden";
	                    // Enable code 9 to get strikethrough
	                } else if (num === 9) {
	                    self.decoration = "strikethrough";
	                } else if (num == 39) {
	                    self.fg = null;
	                } else if (num == 49) {
	                    self.bg = null;
	                    // Foreground color
	                } else if (num >= 30 && num < 38) {
	                    self.fg = ANSI_COLORS[0][num % 10][key];
	                    // Foreground bright color
	                } else if (num >= 90 && num < 98) {
	                    self.fg = ANSI_COLORS[1][num % 10][key];
	                    // Background color
	                } else if (num >= 40 && num < 48) {
	                    self.bg = ANSI_COLORS[0][num % 10][key];
	                    // Background bright color
	                } else if (num >= 100 && num < 108) {
	                    self.bg = ANSI_COLORS[1][num % 10][key];
	                } else if (num === 38 || num === 48) {
	                    // extend color (38=fg, 48=bg)
	                    var is_foreground = num === 38;
	                    if (nums.length >= 1) {
	                        var mode = nums.shift();
	                        if (mode === "5" && nums.length >= 1) {
	                            // palette color
	                            var palette_index = parseInt(nums.shift());
	                            if (palette_index >= 0 && palette_index <= 255) {
	                                if (!use_classes) {
	                                    if (!this.PALETTE_COLORS) {
	                                        self.setupPalette();
	                                    }
	                                    if (is_foreground) {
	                                        self.fg = this.PALETTE_COLORS[palette_index];
	                                    } else {
	                                        self.bg = this.PALETTE_COLORS[palette_index];
	                                    }
	                                } else {
	                                    var klass = palette_index >= 16 ? "ansi-palette-" + palette_index : ANSI_COLORS[palette_index > 7 ? 1 : 0][palette_index % 8]["class"];
	                                    if (is_foreground) {
	                                        self.fg = klass;
	                                    } else {
	                                        self.bg = klass;
	                                    }
	                                }
	                            }
	                        } else if (mode === "2" && nums.length >= 3) {
	                            // true color
	                            var r = parseInt(nums.shift());
	                            var g = parseInt(nums.shift());
	                            var b = parseInt(nums.shift());
	                            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
	                                var color = r + ", " + g + ", " + b;
	                                if (!use_classes) {
	                                    if (is_foreground) {
	                                        self.fg = color;
	                                    } else {
	                                        self.bg = color;
	                                    }
	                                } else {
	                                    if (is_foreground) {
	                                        self.fg = "ansi-truecolor";
	                                        self.fg_truecolor = color;
	                                    } else {
	                                        self.bg = "ansi-truecolor";
	                                        self.bg_truecolor = color;
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }

	            if (self.fg === null && self.bg === null && self.decoration === null) {
	                return result;
	            } else {
	                var styles = [];
	                var classes = [];
	                var data = {};

	                result.fg = self.fg;
	                result.bg = self.bg;
	                result.fg_truecolor = self.fg_truecolor;
	                result.bg_truecolor = self.bg_truecolor;
	                result.decoration = self.decoration;
	                result.was_processed = true;

	                return result;
	            }
	        }

	        /**
	         * processChunk
	         * Processes the current chunk of text.
	         *
	         * @name processChunk
	         * @function
	         * @param {String} text The input text.
	         * @param {Object} options An object containing the following fields:
	         *
	         *  - `json` (Boolean): If `true`, the result will be an object.
	         *  - `use_classes` (Boolean): If `true`, HTML classes will be appended to the HTML output.
	         *
	         * @param {Boolean} markup If false, the colors will not be parsed.
	         * @return {Object|String} The result (object if `json` is wanted back or string otherwise).
	         */

	    }, {
	        key: "processChunk",
	        value: function processChunk(text, options, markup) {
	            var _this2 = this;

	            var self = this;
	            options = options || {};
	            var jsonChunk = this.processChunkJson(text, options, markup);

	            if (options.json) {
	                return jsonChunk;
	            }
	            if (jsonChunk.isEmpty()) {
	                return "";
	            }
	            if (!jsonChunk.was_processed) {
	                return jsonChunk.content;
	            }

	            var use_classes = options.use_classes;

	            var styles = [];
	            var classes = [];
	            var data = {};
	            var render_data = function render_data(data) {
	                var fragments = [];
	                var key = void 0;
	                for (key in data) {
	                    if (data.hasOwnProperty(key)) {
	                        fragments.push("data-" + key + "=\"" + _this2.escapeForHtml(data[key]) + "\"");
	                    }
	                }
	                return fragments.length > 0 ? " " + fragments.join(" ") : "";
	            };

	            if (jsonChunk.fg) {
	                if (use_classes) {
	                    classes.push(jsonChunk.fg + "-fg");
	                    if (jsonChunk.fg_truecolor !== null) {
	                        data["ansi-truecolor-fg"] = jsonChunk.fg_truecolor;
	                        jsonChunk.fg_truecolor = null;
	                    }
	                } else {
	                    styles.push("color:rgb(" + jsonChunk.fg + ")");
	                }
	            }

	            if (jsonChunk.bg) {
	                if (use_classes) {
	                    classes.push(jsonChunk.bg + "-bg");
	                    if (jsonChunk.bg_truecolor !== null) {
	                        data["ansi-truecolor-bg"] = jsonChunk.bg_truecolor;
	                        jsonChunk.bg_truecolor = null;
	                    }
	                } else {
	                    styles.push("background-color:rgb(" + jsonChunk.bg + ")");
	                }
	            }

	            if (jsonChunk.decoration) {
	                if (use_classes) {
	                    classes.push("ansi-" + jsonChunk.decoration);
	                } else if (jsonChunk.decoration === "bold") {
	                    styles.push("font-weight:bold");
	                } else if (jsonChunk.decoration === "dim") {
	                    styles.push("opacity:0.5");
	                } else if (jsonChunk.decoration === "italic") {
	                    styles.push("font-style:italic");
	                    // underline and blink are treated bellow
	                } else if (jsonChunk.decoration === "reverse") {
	                    styles.push("filter:invert(100%)");
	                } else if (jsonChunk.decoration === "hidden") {
	                    styles.push("visibility:hidden");
	                } else if (jsonChunk.decoration === "strikethrough") {
	                    styles.push("text-decoration:line-through");
	                } else {
	                    styles.push("text-decoration:" + jsonChunk.decoration);
	                }
	            }

	            if (use_classes) {
	                return "<span class=\"" + classes.join(" ") + "\"" + render_data(data) + ">" + jsonChunk.content + "</span>";
	            } else {
	                return "<span style=\"" + styles.join(";") + "\"" + render_data(data) + ">" + jsonChunk.content + "</span>";
	            }
	        }
	    }]);
	    return Anser;
	}();

	;

	module.exports = Anser;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(6);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = { "default": __webpack_require__(7), __esModule: true };

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(8);
	var $Object = __webpack_require__(11).Object;
	module.exports = function defineProperty(it, key, desc) {
	  return $Object.defineProperty(it, key, desc);
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var $export = __webpack_require__(9);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(19), 'Object', { defineProperty: __webpack_require__(15).f });

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var global = __webpack_require__(10),
	    core = __webpack_require__(11),
	    ctx = __webpack_require__(12),
	    hide = __webpack_require__(14),
	    PROTOTYPE = 'prototype';

	var $export = function $export(type, name, source) {
	  var IS_FORCED = type & $export.F,
	      IS_GLOBAL = type & $export.G,
	      IS_STATIC = type & $export.S,
	      IS_PROTO = type & $export.P,
	      IS_BIND = type & $export.B,
	      IS_WRAP = type & $export.W,
	      exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
	      expProto = exports[PROTOTYPE],
	      target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE],
	      key,
	      own,
	      out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && key in exports) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global
	    // wrap global constructors for prevent change them in library
	    ) : IS_WRAP && target[key] == out ? function (C) {
	      var F = function F(a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0:
	              return new C();
	            case 1:
	              return new C(a);
	            case 2:
	              return new C(a, b);
	          }return new C(a, b, c);
	        }return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	      // make static versions for prototype methods
	    }(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1; // forced
	$export.G = 2; // global
	$export.S = 4; // static
	$export.P = 8; // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	$export.U = 64; // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	'use strict';

	var core = module.exports = { version: '2.4.0' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// optional / simple context binding
	var aFunction = __webpack_require__(13);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };
	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };
	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }
	  return function () /* ...args */{
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var dP = __webpack_require__(15),
	    createDesc = __webpack_require__(23);
	module.exports = __webpack_require__(19) ? function (object, key, value) {
	  return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var anObject = __webpack_require__(16),
	    IE8_DOM_DEFINE = __webpack_require__(18),
	    toPrimitive = __webpack_require__(22),
	    dP = Object.defineProperty;

	exports.f = __webpack_require__(19) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return dP(O, P, Attributes);
	  } catch (e) {/* empty */}
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isObject = __webpack_require__(17);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	module.exports = function (it) {
	  return (typeof it === 'undefined' ? 'undefined' : _typeof(it)) === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = !__webpack_require__(19) && !__webpack_require__(20)(function () {
	  return Object.defineProperty(__webpack_require__(21)('div'), 'a', { get: function get() {
	      return 7;
	    } }).a != 7;
	});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(20)(function () {
	  return Object.defineProperty({}, 'a', { get: function get() {
	      return 7;
	    } }).a != 7;
	});

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isObject = __webpack_require__(17),
	    document = __webpack_require__(10).document
	// in old IE typeof document.createElement is 'object'
	,
	    is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(17);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
	  if (!isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Escape carrigage returns like a terminal
	 * @param {string} txt - String to escape.
	 * @return {string}    - Escaped string.
	 */
	function escapeCarriageReturn(txt) {
	  if (!txt) return "";
	  if (!/\r/.test(txt)) return txt;
	  txt = txt.replace(/\r+\n/gm, "\n"); // \r followed by \n --> newline
	  while (/\r[^$]/.test(txt)) {
	    var base = /^(.*)\r+/m.exec(txt)[1];
	    var insert = /\r+(.*)$/m.exec(txt)[1];
	    insert = insert + base.slice(insert.length, base.length);
	    txt = txt.replace(/\r+.*$/m, "\r").replace(/^.*\r/m, insert);
	  }
	  return txt;
	}

	function findLongestString(arr) {
	  var longest = 0;
	  for (var i = 0; i < arr.length; i++) {
	    if (arr[longest].length <= arr[i].length) {
	      longest = i;
	    }
	  }
	  return longest;
	}

	function escapeSingleLineSafe(txt) {
	  if (!/\r/.test(txt)) return txt;
	  var arr = txt.split("\r");
	  var res = [];

	  while (arr.length > 0) {
	    var longest = findLongestString(arr);
	    res.push(arr[longest]);
	    arr = arr.slice(longest + 1);
	  }

	  return res.join("\r");
	}

	/**
	 * Safely escape carrigage returns like a terminal.
	 * This allows to escape carrigage returns while allowing future output to be appended
	 * without loosing information.
	 * Use this as a intermediate escape step if your stream hasn't completed yet.
	 * @param {string} txt - String to escape.
	 * @return {string}    - Escaped string.
	 */
	function escapeCarriageReturnSafe(txt) {
	  if (!txt) return "";
	  if (!/\r/.test(txt)) return txt;
	  if (!/\n/.test(txt)) return escapeSingleLineSafe(txt);
	  txt = txt.replace(/\r+\n/gm, "\n"); // \r followed by \n --> newline
	  var idx = txt.lastIndexOf("\n");

	  return escapeCarriageReturn(txt.slice(0, idx)) + "\n" + escapeSingleLineSafe(txt.slice(idx + 1));
	}

	module.exports = escapeCarriageReturn;
	module.exports.escapeCarriageReturn = escapeCarriageReturn;
	module.exports.escapeCarriageReturnSafe = escapeCarriageReturnSafe;

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Converts base64 image mimetype data to an HTML img element.
	 *
	 * @param {string} mimetype - This is the mimetype of the data being
	 * provided, it is used for the the source linking.
	 * @param {string} data - The image data to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an html img element.
	 * @return {HTMLElement} - An html img element for the given image.
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ImageTransform = ImageTransform;
	function ImageTransform(mimetype, data, document) {
	  var img = document.createElement('img');
	  img.src = 'data:' + mimetype + ';base64,' + data;
	  return img;
	}
	ImageTransform.mimetype = ['image/png', 'image/jpeg', 'image/gif'];
	//# sourceMappingURL=image.transform.js.map

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';

	/**
	  * Converts data with an HTML mimetype to an HTML div element with the
	  * appropriate formatting.
	  *
	  * @param {string} mimetype - The mimetype of the data to be transformed,
	  * it is unused by this function but included for a common API.
	  * @param {string} data - The html text to be transformed.
	  * @param {Document} document - A Document Object Model to be used for
	  * creating an html div element.
	  * @return {HTMLElement} - A div element for the containing the transformed
	  * html.
	  */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.HTMLTransform = HTMLTransform;
	function HTMLTransform(mimetype, data, document) {
	  try {
	    var range = document.createRange();
	    return range.createContextualFragment(data);
	  } catch (error) {
	    console.warn('Environment does not support Range ' + 'createContextualFragment, falling back on innerHTML');
	    var div = document.createElement('div');
	    div.innerHTML = data;
	    return div;
	  }
	}
	HTMLTransform.mimetype = 'text/html';
	//# sourceMappingURL=html.transform.js.map

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Converts a Scalable Vector Graphics file to an svgElement for HTML.
	 *
	 * @param {string} mimetype - The mimetype of the data to be transformed,
	 * it is unused by this function but included for a common API.
	 * @param {string} data - The svg data to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an html div element.
	 * @return {HTMLElement} - An html div element containing the
	 * transformed svg.
	 * @throws {Error} - Throws an error if inner html does not have SVG as its
	 * first tag name.
	 */

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.SVGTransform = SVGTransform;
	function SVGTransform(mimetype, value, doc) {
	    var container = doc.createElement('div');
	    container.innerHTML = value;

	    var svgElement = container.getElementsByTagName('svg')[0];
	    if (!svgElement) {
	        throw new Error("SVGTransform: Error: Failed to create <svg> element");
	    }

	    return svgElement;
	}
	SVGTransform.mimetype = 'image/svg+xml';
	//# sourceMappingURL=svg.transform.js.map

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Transforms base 64 encoded PDF --> <a href="data:application/pdf;base64,...">
	 * which is the (current) Jupyter notebook version of the element.
	 * This one returns a little link you can click.
	 *
	 * @param {string} mimetype - The mimetype of the data to be transformed,
	 * it is unused by this function but included for a common API.
	 * @param  {string} base64PDF - A base64 encoded PDF.
	 * @param  {Document} document - A Document Object Model (e.g. window.document)
	 * @return {HTMLElement} - A link element to the given PDF.
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.PDFTransform = PDFTransform;
	function PDFTransform(mimetype, base64PDF, document) {
	  var a = document.createElement('a');
	  a.target = '_blank';
	  a.textContent = "View PDF";
	  a.href = 'data:application/pdf;base64,' + base64PDF;

	  return a;
	}
	PDFTransform.mimetype = 'application/pdf';
	//# sourceMappingURL=pdf.transform.js.map

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Transform a given javascript into a script html element
	 *
	 * @param {string} mimetype - The mimetype of the data to be transformed,
	 * it is used by this element to define the type of the HTML element.
	 * @param {string} value - The script to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an html img element.
	 * @return {HTMLElement} - A scriopt element for the given javascript
	 */

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ScriptTransform = ScriptTransform;
	function ScriptTransform(mimetype, value, document) {
	  var el = document.createElement('script');
	  el.type = mimetype;
	  el.appendChild(document.createTextNode(value));
	  return el;
	}
	ScriptTransform.mimetype = ['text/javascript', 'application/javascript'];
	//# sourceMappingURL=script.transform.js.map

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.LaTeXTransform = LaTeXTransform;
	var mathjaxHelper = __webpack_require__(31);

	/**
	 * Converts data with LaTeX mimetype to its MathJax representation
	 * in an HTML div.
	 *
	 * @param {string} mimetype - The mimetype of the data to be transformed,
	 * it is unused by this function but included for a common API.
	 * @param {string} value - The LateX data to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an html div element.
	 * @return {HTMLElement} - An HTML div element containing the processed MathJax.
	 */
	function LaTeXTransform(mimetype, value, document) {
	  var container = document.createElement('div');
	  container.innerHTML = value;

	  mathjaxHelper.loadAndTypeset(document, container);
	  return container;
	}
	LaTeXTransform.mimetype = 'text/latex';
	//# sourceMappingURL=latex.transform.js.map

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var path = __webpack_require__(32);

	/**
	 * Loads and configures MathJax if necessary.
	 * @param  {Document} document - A Document Object Model.
	 * The MathJax Script is included in the <head> section of the HTML document.
	 * @param  {Callback} callback - A callback to run when MathJax is loaded.
	 */
	function loadMathJax(document) {
	  var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

	  if (typeof MathJax === "undefined" || MathJax === null) {
	    var script = document.createElement("script");

	    script.addEventListener("load", function () {
	      configureMathJax();
	      callback();
	    });
	    script.type = "text/javascript";

	    try {
	      script.src = path.join(__dirname, "..", "resources", "MathJax", "MathJax.js?delayStartupUntil=configured");

	      document.getElementsByTagName("head")[0].appendChild(script);
	    } catch (error) {
	      throw new Error(error.message, "loadMathJax");
	    }
	  } else {
	    callback();
	  }
	};

	/**
	 * Typesets any math elements within the element.
	 * @param  {HTMLElement}  container - The element whose math is to be typeset.
	 * @param  {Callback}     callback  - A callback to run when the typeset
	 * is complete.
	 */
	function typesetMath(container) {
	  var callback = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

	  try {
	    MathJax.Hub.Queue(["Typeset", MathJax.Hub, container], callback);
	  } catch (error) {
	    throw new Error(error.message, "typesetMath");
	  }
	};

	/**
	 * A helper function which loads MathJax if necessary and typesets any math
	 * elements within the container.
	 * @param  {Document}     document  - A Document Object Model.
	 * The MathJax Script is included in the <head> section of the HTML document.
	 * @param  {HTMLElement}  container - The element whose math is to be typeset.
	 * @param  {Callback}     callback  - A callback to run when the typeset
	 * is complete.
	 */
	function loadAndTypeset(document, container) {
	  var callback = arguments.length <= 2 || arguments[2] === undefined ? noop : arguments[2];

	  loadMathJax(document, function () {
	    typesetMath(container, callback);
	  });
	};

	function configureMathJax() {
	  MathJax.Hub.Config({
	    jax: ["input/TeX", "output/SVG"],
	    extensions: ["tex2jax.js"],
	    messageStyle: "none",
	    showMathMenu: false,
	    tex2jax: {
	      inlineMath: [['$', '$'], ["\\(", "\\)"]],
	      displayMath: [['$$', '$$'], ["\\[", "\\]"]],
	      processEscapes: true,
	      processEnvironments: true,
	      preview: "none"
	    },
	    TeX: {
	      extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
	    },
	    SVG: {
	      font: "STIX-Web"
	    }
	  });
	  MathJax.Hub.Configured();
	};

	function noop() {};

	module.exports = {
	  loadMathJax: loadMathJax,
	  typesetMath: typesetMath,
	  loadAndTypeset: loadAndTypeset
	};
	//# sourceMappingURL=mathjax-electron.js.map

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// resolves . and .. elements in a path array with directory names there
	// must be no slashes, empty elements, or device names (c:\) in the array
	// (so also no leading and trailing slashes - it does not distinguish
	// relative and absolute paths)
	function normalizeArray(parts, allowAboveRoot) {
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = parts.length - 1; i >= 0; i--) {
	    var last = parts[i];
	    if (last === '.') {
	      parts.splice(i, 1);
	    } else if (last === '..') {
	      parts.splice(i, 1);
	      up++;
	    } else if (up) {
	      parts.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (allowAboveRoot) {
	    for (; up--; up) {
	      parts.unshift('..');
	    }
	  }

	  return parts;
	}

	// Split a filename into [root, dir, basename, ext], unix version
	// 'root' is just a slash, or nothing.
	var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
	var splitPath = function splitPath(filename) {
	  return splitPathRe.exec(filename).slice(1);
	};

	// path.resolve([from ...], to)
	// posix version
	exports.resolve = function () {
	  var resolvedPath = '',
	      resolvedAbsolute = false;

	  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	    var path = i >= 0 ? arguments[i] : process.cwd();

	    // Skip empty and invalid entries
	    if (typeof path !== 'string') {
	      throw new TypeError('Arguments to path.resolve must be strings');
	    } else if (!path) {
	      continue;
	    }

	    resolvedPath = path + '/' + resolvedPath;
	    resolvedAbsolute = path.charAt(0) === '/';
	  }

	  // At this point the path should be resolved to a full absolute path, but
	  // handle relative paths to be safe (might happen when process.cwd() fails)

	  // Normalize the path
	  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
	    return !!p;
	  }), !resolvedAbsolute).join('/');

	  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
	};

	// path.normalize(path)
	// posix version
	exports.normalize = function (path) {
	  var isAbsolute = exports.isAbsolute(path),
	      trailingSlash = substr(path, -1) === '/';

	  // Normalize the path
	  path = normalizeArray(filter(path.split('/'), function (p) {
	    return !!p;
	  }), !isAbsolute).join('/');

	  if (!path && !isAbsolute) {
	    path = '.';
	  }
	  if (path && trailingSlash) {
	    path += '/';
	  }

	  return (isAbsolute ? '/' : '') + path;
	};

	// posix version
	exports.isAbsolute = function (path) {
	  return path.charAt(0) === '/';
	};

	// posix version
	exports.join = function () {
	  var paths = Array.prototype.slice.call(arguments, 0);
	  return exports.normalize(filter(paths, function (p, index) {
	    if (typeof p !== 'string') {
	      throw new TypeError('Arguments to path.join must be strings');
	    }
	    return p;
	  }).join('/'));
	};

	// path.relative(from, to)
	// posix version
	exports.relative = function (from, to) {
	  from = exports.resolve(from).substr(1);
	  to = exports.resolve(to).substr(1);

	  function trim(arr) {
	    var start = 0;
	    for (; start < arr.length; start++) {
	      if (arr[start] !== '') break;
	    }

	    var end = arr.length - 1;
	    for (; end >= 0; end--) {
	      if (arr[end] !== '') break;
	    }

	    if (start > end) return [];
	    return arr.slice(start, end - start + 1);
	  }

	  var fromParts = trim(from.split('/'));
	  var toParts = trim(to.split('/'));

	  var length = Math.min(fromParts.length, toParts.length);
	  var samePartsLength = length;
	  for (var i = 0; i < length; i++) {
	    if (fromParts[i] !== toParts[i]) {
	      samePartsLength = i;
	      break;
	    }
	  }

	  var outputParts = [];
	  for (var i = samePartsLength; i < fromParts.length; i++) {
	    outputParts.push('..');
	  }

	  outputParts = outputParts.concat(toParts.slice(samePartsLength));

	  return outputParts.join('/');
	};

	exports.sep = '/';
	exports.delimiter = ':';

	exports.dirname = function (path) {
	  var result = splitPath(path),
	      root = result[0],
	      dir = result[1];

	  if (!root && !dir) {
	    // No dirname whatsoever
	    return '.';
	  }

	  if (dir) {
	    // It has a dirname, strip trailing slash
	    dir = dir.substr(0, dir.length - 1);
	  }

	  return root + dir;
	};

	exports.basename = function (path, ext) {
	  var f = splitPath(path)[2];
	  // TODO: make this comparison case-insensitive on windows?
	  if (ext && f.substr(-1 * ext.length) === ext) {
	    f = f.substr(0, f.length - ext.length);
	  }
	  return f;
	};

	exports.extname = function (path) {
	  return splitPath(path)[3];
	};

	function filter(xs, f) {
	  if (xs.filter) return xs.filter(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    if (f(xs[i], i, xs)) res.push(xs[i]);
	  }
	  return res;
	}

	// String.prototype.substr - negative index don't work in IE8
	var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
	  return str.substr(start, len);
	} : function (str, start, len) {
	  if (start < 0) start = str.length + start;
	  return str.substr(start, len);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(33)))

/***/ }),
/* 33 */
/***/ (function(module, exports) {

	'use strict';

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) {
	    return [];
	};

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var commonmark = __webpack_require__(35);

	/**
	 * This is a function expression providing closure such that a reader
	 * and writer is only created once.
	 * @function
	 * @description Converts data with a markdown mimetype to an HTML div element.
	 * @param {string} mimetype -  The mimetype of the data to be transformed,
	 * it is unused by this function but included for a common API.
	 * @param {string} data - The markdown data to be transformed.
	 * @param {Document} document - A Document Object Model to be used for
	 * creating an element.
	 * @return {HTMLElement} - An HTML div containing the transformed markdown.
	 */
	var MarkdownTransform = function () {
	    // Stick reader and writer in a closure so they only get created once.

	    var reader = new commonmark.Parser();
	    var writer = new commonmark.HtmlRenderer({
	        safe: true
	    });

	    return function (mimetype, data, document) {
	        var div = document.createElement("div");

	        var parsed = reader.parse(data);

	        // TODO: Any other transformations on the parsed object
	        // See https://github.com/jgm/commonmark.js#usage

	        div.innerHTML = writer.render(parsed);

	        return div;
	    };
	}();

	MarkdownTransform.mimetype = 'text/markdown';

	exports.MarkdownTransform = MarkdownTransform;
	//# sourceMappingURL=commonmark.transform.js.map

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	// commonmark.js - CommomMark in JavaScript
	// Copyright (C) 2014 John MacFarlane
	// License: BSD3.

	// Basic usage:
	//
	// var commonmark = require('commonmark');
	// var parser = new commonmark.Parser();
	// var renderer = new commonmark.HtmlRenderer();
	// console.log(renderer.render(parser.parse('Hello *world*')));

	module.exports.version = '0.27.0';
	module.exports.Node = __webpack_require__(36);
	module.exports.Parser = __webpack_require__(37);
	// module.exports.HtmlRenderer = require('./html');
	module.exports.HtmlRenderer = __webpack_require__(53);
	module.exports.XmlRenderer = __webpack_require__(55);

/***/ }),
/* 36 */
/***/ (function(module, exports) {

	"use strict";

	function isContainer(node) {
	    switch (node._type) {
	        case 'document':
	        case 'block_quote':
	        case 'list':
	        case 'item':
	        case 'paragraph':
	        case 'heading':
	        case 'emph':
	        case 'strong':
	        case 'link':
	        case 'image':
	        case 'custom_inline':
	        case 'custom_block':
	            return true;
	        default:
	            return false;
	    }
	}

	var resumeAt = function resumeAt(node, entering) {
	    this.current = node;
	    this.entering = entering === true;
	};

	var next = function next() {
	    var cur = this.current;
	    var entering = this.entering;

	    if (cur === null) {
	        return null;
	    }

	    var container = isContainer(cur);

	    if (entering && container) {
	        if (cur._firstChild) {
	            this.current = cur._firstChild;
	            this.entering = true;
	        } else {
	            // stay on node but exit
	            this.entering = false;
	        }
	    } else if (cur === this.root) {
	        this.current = null;
	    } else if (cur._next === null) {
	        this.current = cur._parent;
	        this.entering = false;
	    } else {
	        this.current = cur._next;
	        this.entering = true;
	    }

	    return { entering: entering, node: cur };
	};

	var NodeWalker = function NodeWalker(root) {
	    return { current: root,
	        root: root,
	        entering: true,
	        next: next,
	        resumeAt: resumeAt };
	};

	var Node = function Node(nodeType, sourcepos) {
	    this._type = nodeType;
	    this._parent = null;
	    this._firstChild = null;
	    this._lastChild = null;
	    this._prev = null;
	    this._next = null;
	    this._sourcepos = sourcepos;
	    this._lastLineBlank = false;
	    this._open = true;
	    this._string_content = null;
	    this._literal = null;
	    this._listData = {};
	    this._info = null;
	    this._destination = null;
	    this._title = null;
	    this._isFenced = false;
	    this._fenceChar = null;
	    this._fenceLength = 0;
	    this._fenceOffset = null;
	    this._level = null;
	    this._onEnter = null;
	    this._onExit = null;
	};

	var proto = Node.prototype;

	Object.defineProperty(proto, 'isContainer', {
	    get: function get() {
	        return isContainer(this);
	    }
	});

	Object.defineProperty(proto, 'type', {
	    get: function get() {
	        return this._type;
	    }
	});

	Object.defineProperty(proto, 'firstChild', {
	    get: function get() {
	        return this._firstChild;
	    }
	});

	Object.defineProperty(proto, 'lastChild', {
	    get: function get() {
	        return this._lastChild;
	    }
	});

	Object.defineProperty(proto, 'next', {
	    get: function get() {
	        return this._next;
	    }
	});

	Object.defineProperty(proto, 'prev', {
	    get: function get() {
	        return this._prev;
	    }
	});

	Object.defineProperty(proto, 'parent', {
	    get: function get() {
	        return this._parent;
	    }
	});

	Object.defineProperty(proto, 'sourcepos', {
	    get: function get() {
	        return this._sourcepos;
	    }
	});

	Object.defineProperty(proto, 'literal', {
	    get: function get() {
	        return this._literal;
	    },
	    set: function set(s) {
	        this._literal = s;
	    }
	});

	Object.defineProperty(proto, 'destination', {
	    get: function get() {
	        return this._destination;
	    },
	    set: function set(s) {
	        this._destination = s;
	    }
	});

	Object.defineProperty(proto, 'title', {
	    get: function get() {
	        return this._title;
	    },
	    set: function set(s) {
	        this._title = s;
	    }
	});

	Object.defineProperty(proto, 'info', {
	    get: function get() {
	        return this._info;
	    },
	    set: function set(s) {
	        this._info = s;
	    }
	});

	Object.defineProperty(proto, 'level', {
	    get: function get() {
	        return this._level;
	    },
	    set: function set(s) {
	        this._level = s;
	    }
	});

	Object.defineProperty(proto, 'listType', {
	    get: function get() {
	        return this._listData.type;
	    },
	    set: function set(t) {
	        this._listData.type = t;
	    }
	});

	Object.defineProperty(proto, 'listTight', {
	    get: function get() {
	        return this._listData.tight;
	    },
	    set: function set(t) {
	        this._listData.tight = t;
	    }
	});

	Object.defineProperty(proto, 'listStart', {
	    get: function get() {
	        return this._listData.start;
	    },
	    set: function set(n) {
	        this._listData.start = n;
	    }
	});

	Object.defineProperty(proto, 'listDelimiter', {
	    get: function get() {
	        return this._listData.delimiter;
	    },
	    set: function set(delim) {
	        this._listData.delimiter = delim;
	    }
	});

	Object.defineProperty(proto, 'onEnter', {
	    get: function get() {
	        return this._onEnter;
	    },
	    set: function set(s) {
	        this._onEnter = s;
	    }
	});

	Object.defineProperty(proto, 'onExit', {
	    get: function get() {
	        return this._onExit;
	    },
	    set: function set(s) {
	        this._onExit = s;
	    }
	});

	Node.prototype.appendChild = function (child) {
	    child.unlink();
	    child._parent = this;
	    if (this._lastChild) {
	        this._lastChild._next = child;
	        child._prev = this._lastChild;
	        this._lastChild = child;
	    } else {
	        this._firstChild = child;
	        this._lastChild = child;
	    }
	};

	Node.prototype.prependChild = function (child) {
	    child.unlink();
	    child._parent = this;
	    if (this._firstChild) {
	        this._firstChild._prev = child;
	        child._next = this._firstChild;
	        this._firstChild = child;
	    } else {
	        this._firstChild = child;
	        this._lastChild = child;
	    }
	};

	Node.prototype.unlink = function () {
	    if (this._prev) {
	        this._prev._next = this._next;
	    } else if (this._parent) {
	        this._parent._firstChild = this._next;
	    }
	    if (this._next) {
	        this._next._prev = this._prev;
	    } else if (this._parent) {
	        this._parent._lastChild = this._prev;
	    }
	    this._parent = null;
	    this._next = null;
	    this._prev = null;
	};

	Node.prototype.insertAfter = function (sibling) {
	    sibling.unlink();
	    sibling._next = this._next;
	    if (sibling._next) {
	        sibling._next._prev = sibling;
	    }
	    sibling._prev = this;
	    this._next = sibling;
	    sibling._parent = this._parent;
	    if (!sibling._next) {
	        sibling._parent._lastChild = sibling;
	    }
	};

	Node.prototype.insertBefore = function (sibling) {
	    sibling.unlink();
	    sibling._prev = this._prev;
	    if (sibling._prev) {
	        sibling._prev._next = sibling;
	    }
	    sibling._next = this;
	    this._prev = sibling;
	    sibling._parent = this._parent;
	    if (!sibling._prev) {
	        sibling._parent._firstChild = sibling;
	    }
	};

	Node.prototype.walker = function () {
	    var walker = new NodeWalker(this);
	    return walker;
	};

	module.exports = Node;

	/* Example of use of walker:

	 var walker = w.walker();
	 var event;

	 while (event = walker.next()) {
	 console.log(event.entering, event.node.type);
	 }

	 */

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var Node = __webpack_require__(36);
	var unescapeString = __webpack_require__(38).unescapeString;
	var OPENTAG = __webpack_require__(38).OPENTAG;
	var CLOSETAG = __webpack_require__(38).CLOSETAG;

	var CODE_INDENT = 4;

	var C_TAB = 9;
	var C_NEWLINE = 10;
	var C_GREATERTHAN = 62;
	var C_LESSTHAN = 60;
	var C_SPACE = 32;
	var C_OPEN_BRACKET = 91;

	var InlineParser = __webpack_require__(49);

	var reHtmlBlockOpen = [/./, // dummy for 0
	/^<(?:script|pre|style)(?:\s|>|$)/i, /^<!--/, /^<[?]/, /^<![A-Z]/, /^<!\[CDATA\[/, /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|title|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i, new RegExp('^(?:' + OPENTAG + '|' + CLOSETAG + ')\\s*$', 'i')];

	var reHtmlBlockClose = [/./, // dummy for 0
	/<\/(?:script|pre|style)>/i, /-->/, /\?>/, />/, /\]\]>/];

	var reThematicBreak = /^(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})[ \t]*$/;

	var reMaybeSpecial = /^[#`~*+_=<>0-9-]/;

	var reNonSpace = /[^ \t\f\v\r\n]/;

	var reBulletListMarker = /^[*+-]/;

	var reOrderedListMarker = /^(\d{1,9})([.)])/;

	var reATXHeadingMarker = /^#{1,6}(?:[ \t]+|$)/;

	var reCodeFence = /^`{3,}(?!.*`)|^~{3,}(?!.*~)/;

	var reClosingCodeFence = /^(?:`{3,}|~{3,})(?= *$)/;

	var reSetextHeadingLine = /^(?:=+|-+)[ \t]*$/;

	var reLineEnding = /\r\n|\n|\r/;

	// Returns true if string contains only space characters.
	var isBlank = function isBlank(s) {
	    return !reNonSpace.test(s);
	};

	var isSpaceOrTab = function isSpaceOrTab(c) {
	    return c === C_SPACE || c === C_TAB;
	};

	var peek = function peek(ln, pos) {
	    if (pos < ln.length) {
	        return ln.charCodeAt(pos);
	    } else {
	        return -1;
	    }
	};

	// DOC PARSER

	// These are methods of a Parser object, defined below.

	// Returns true if block ends with a blank line, descending if needed
	// into lists and sublists.
	var endsWithBlankLine = function endsWithBlankLine(block) {
	    while (block) {
	        if (block._lastLineBlank) {
	            return true;
	        }
	        var t = block.type;
	        if (t === 'list' || t === 'item') {
	            block = block._lastChild;
	        } else {
	            break;
	        }
	    }
	    return false;
	};

	// Add a line to the block at the tip.  We assume the tip
	// can accept lines -- that check should be done before calling this.
	var addLine = function addLine() {
	    if (this.partiallyConsumedTab) {
	        this.offset += 1; // skip over tab
	        // add space characters:
	        var charsToTab = 4 - this.column % 4;
	        this.tip._string_content += ' '.repeat(charsToTab);
	    }
	    this.tip._string_content += this.currentLine.slice(this.offset) + '\n';
	};

	// Add block of type tag as a child of the tip.  If the tip can't
	// accept children, close and finalize it and try its parent,
	// and so on til we find a block that can accept children.
	var addChild = function addChild(tag, offset) {
	    while (!this.blocks[this.tip.type].canContain(tag)) {
	        this.finalize(this.tip, this.lineNumber - 1);
	    }

	    var column_number = offset + 1; // offset 0 = column 1
	    var newBlock = new Node(tag, [[this.lineNumber, column_number], [0, 0]]);
	    newBlock._string_content = '';
	    this.tip.appendChild(newBlock);
	    this.tip = newBlock;
	    return newBlock;
	};

	// Parse a list marker and return data on the marker (type,
	// start, delimiter, bullet character, padding) or null.
	var parseListMarker = function parseListMarker(parser, container) {
	    var rest = parser.currentLine.slice(parser.nextNonspace);
	    var match;
	    var nextc;
	    var spacesStartCol;
	    var spacesStartOffset;
	    var data = { type: null,
	        tight: true, // lists are tight by default
	        bulletChar: null,
	        start: null,
	        delimiter: null,
	        padding: null,
	        markerOffset: parser.indent };
	    if (match = rest.match(reBulletListMarker)) {
	        data.type = 'bullet';
	        data.bulletChar = match[0][0];
	    } else if ((match = rest.match(reOrderedListMarker)) && (container.type !== 'paragraph' || match[1] === '1')) {
	        data.type = 'ordered';
	        data.start = parseInt(match[1]);
	        data.delimiter = match[2];
	    } else {
	        return null;
	    }
	    // make sure we have spaces after
	    nextc = peek(parser.currentLine, parser.nextNonspace + match[0].length);
	    if (!(nextc === -1 || nextc === C_TAB || nextc === C_SPACE)) {
	        return null;
	    }

	    // if it interrupts paragraph, make sure first line isn't blank
	    if (container.type === 'paragraph' && !parser.currentLine.slice(parser.nextNonspace + match[0].length).match(reNonSpace)) {
	        return null;
	    }

	    // we've got a match! advance offset and calculate padding
	    parser.advanceNextNonspace(); // to start of marker
	    parser.advanceOffset(match[0].length, true); // to end of marker
	    spacesStartCol = parser.column;
	    spacesStartOffset = parser.offset;
	    do {
	        parser.advanceOffset(1, true);
	        nextc = peek(parser.currentLine, parser.offset);
	    } while (parser.column - spacesStartCol < 5 && isSpaceOrTab(nextc));
	    var blank_item = peek(parser.currentLine, parser.offset) === -1;
	    var spaces_after_marker = parser.column - spacesStartCol;
	    if (spaces_after_marker >= 5 || spaces_after_marker < 1 || blank_item) {
	        data.padding = match[0].length + 1;
	        parser.column = spacesStartCol;
	        parser.offset = spacesStartOffset;
	        if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
	            parser.advanceOffset(1, true);
	        }
	    } else {
	        data.padding = match[0].length + spaces_after_marker;
	    }
	    return data;
	};

	// Returns true if the two list items are of the same type,
	// with the same delimiter and bullet character.  This is used
	// in agglomerating list items into lists.
	var listsMatch = function listsMatch(list_data, item_data) {
	    return list_data.type === item_data.type && list_data.delimiter === item_data.delimiter && list_data.bulletChar === item_data.bulletChar;
	};

	// Finalize and close any unmatched blocks.
	var closeUnmatchedBlocks = function closeUnmatchedBlocks() {
	    if (!this.allClosed) {
	        // finalize any blocks not matched
	        while (this.oldtip !== this.lastMatchedContainer) {
	            var parent = this.oldtip._parent;
	            this.finalize(this.oldtip, this.lineNumber - 1);
	            this.oldtip = parent;
	        }
	        this.allClosed = true;
	    }
	};

	// 'finalize' is run when the block is closed.
	// 'continue' is run to check whether the block is continuing
	// at a certain line and offset (e.g. whether a block quote
	// contains a `>`.  It returns 0 for matched, 1 for not matched,
	// and 2 for "we've dealt with this line completely, go to next."
	var blocks = {
	    document: {
	        continue: function _continue() {
	            return 0;
	        },
	        finalize: function finalize() {
	            return;
	        },
	        canContain: function canContain(t) {
	            return t !== 'item';
	        },
	        acceptsLines: false
	    },
	    list: {
	        continue: function _continue() {
	            return 0;
	        },
	        finalize: function finalize(parser, block) {
	            var item = block._firstChild;
	            while (item) {
	                // check for non-final list item ending with blank line:
	                if (endsWithBlankLine(item) && item._next) {
	                    block._listData.tight = false;
	                    break;
	                }
	                // recurse into children of list item, to see if there are
	                // spaces between any of them:
	                var subitem = item._firstChild;
	                while (subitem) {
	                    if (endsWithBlankLine(subitem) && (item._next || subitem._next)) {
	                        block._listData.tight = false;
	                        break;
	                    }
	                    subitem = subitem._next;
	                }
	                item = item._next;
	            }
	        },
	        canContain: function canContain(t) {
	            return t === 'item';
	        },
	        acceptsLines: false
	    },
	    block_quote: {
	        continue: function _continue(parser) {
	            var ln = parser.currentLine;
	            if (!parser.indented && peek(ln, parser.nextNonspace) === C_GREATERTHAN) {
	                parser.advanceNextNonspace();
	                parser.advanceOffset(1, false);
	                if (isSpaceOrTab(peek(ln, parser.offset))) {
	                    parser.advanceOffset(1, true);
	                }
	            } else {
	                return 1;
	            }
	            return 0;
	        },
	        finalize: function finalize() {
	            return;
	        },
	        canContain: function canContain(t) {
	            return t !== 'item';
	        },
	        acceptsLines: false
	    },
	    item: {
	        continue: function _continue(parser, container) {
	            if (parser.blank) {
	                if (container._firstChild == null) {
	                    // Blank line after empty list item
	                    return 1;
	                } else {
	                    parser.advanceNextNonspace();
	                }
	            } else if (parser.indent >= container._listData.markerOffset + container._listData.padding) {
	                parser.advanceOffset(container._listData.markerOffset + container._listData.padding, true);
	            } else {
	                return 1;
	            }
	            return 0;
	        },
	        finalize: function finalize() {
	            return;
	        },
	        canContain: function canContain(t) {
	            return t !== 'item';
	        },
	        acceptsLines: false
	    },
	    heading: {
	        continue: function _continue() {
	            // a heading can never container > 1 line, so fail to match:
	            return 1;
	        },
	        finalize: function finalize() {
	            return;
	        },
	        canContain: function canContain() {
	            return false;
	        },
	        acceptsLines: false
	    },
	    thematic_break: {
	        continue: function _continue() {
	            // a thematic break can never container > 1 line, so fail to match:
	            return 1;
	        },
	        finalize: function finalize() {
	            return;
	        },
	        canContain: function canContain() {
	            return false;
	        },
	        acceptsLines: false
	    },
	    code_block: {
	        continue: function _continue(parser, container) {
	            var ln = parser.currentLine;
	            var indent = parser.indent;
	            if (container._isFenced) {
	                // fenced
	                var match = indent <= 3 && ln.charAt(parser.nextNonspace) === container._fenceChar && ln.slice(parser.nextNonspace).match(reClosingCodeFence);
	                if (match && match[0].length >= container._fenceLength) {
	                    // closing fence - we're at end of line, so we can return
	                    parser.finalize(container, parser.lineNumber);
	                    return 2;
	                } else {
	                    // skip optional spaces of fence offset
	                    var i = container._fenceOffset;
	                    while (i > 0 && isSpaceOrTab(peek(ln, parser.offset))) {
	                        parser.advanceOffset(1, true);
	                        i--;
	                    }
	                }
	            } else {
	                // indented
	                if (indent >= CODE_INDENT) {
	                    parser.advanceOffset(CODE_INDENT, true);
	                } else if (parser.blank) {
	                    parser.advanceNextNonspace();
	                } else {
	                    return 1;
	                }
	            }
	            return 0;
	        },
	        finalize: function finalize(parser, block) {
	            if (block._isFenced) {
	                // fenced
	                // first line becomes info string
	                var content = block._string_content;
	                var newlinePos = content.indexOf('\n');
	                var firstLine = content.slice(0, newlinePos);
	                var rest = content.slice(newlinePos + 1);
	                block.info = unescapeString(firstLine.trim());
	                block._literal = rest;
	            } else {
	                // indented
	                block._literal = block._string_content.replace(/(\n *)+$/, '\n');
	            }
	            block._string_content = null; // allow GC
	        },
	        canContain: function canContain() {
	            return false;
	        },
	        acceptsLines: true
	    },
	    html_block: {
	        continue: function _continue(parser, container) {
	            return parser.blank && (container._htmlBlockType === 6 || container._htmlBlockType === 7) ? 1 : 0;
	        },
	        finalize: function finalize(parser, block) {
	            block._literal = block._string_content.replace(/(\n *)+$/, '');
	            block._string_content = null; // allow GC
	        },
	        canContain: function canContain() {
	            return false;
	        },
	        acceptsLines: true
	    },
	    paragraph: {
	        continue: function _continue(parser) {
	            return parser.blank ? 1 : 0;
	        },
	        finalize: function finalize(parser, block) {
	            var pos;
	            var hasReferenceDefs = false;

	            // try parsing the beginning as link reference definitions:
	            while (peek(block._string_content, 0) === C_OPEN_BRACKET && (pos = parser.inlineParser.parseReference(block._string_content, parser.refmap))) {
	                block._string_content = block._string_content.slice(pos);
	                hasReferenceDefs = true;
	            }
	            if (hasReferenceDefs && isBlank(block._string_content)) {
	                block.unlink();
	            }
	        },
	        canContain: function canContain() {
	            return false;
	        },
	        acceptsLines: true
	    }
	};

	// block start functions.  Return values:
	// 0 = no match
	// 1 = matched container, keep going
	// 2 = matched leaf, no more block starts
	var blockStarts = [
	// block quote
	function (parser) {
	    if (!parser.indented && peek(parser.currentLine, parser.nextNonspace) === C_GREATERTHAN) {
	        parser.advanceNextNonspace();
	        parser.advanceOffset(1, false);
	        // optional following space
	        if (isSpaceOrTab(peek(parser.currentLine, parser.offset))) {
	            parser.advanceOffset(1, true);
	        }
	        parser.closeUnmatchedBlocks();
	        parser.addChild('block_quote', parser.nextNonspace);
	        return 1;
	    } else {
	        return 0;
	    }
	},

	// ATX heading
	function (parser) {
	    var match;
	    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reATXHeadingMarker))) {
	        parser.advanceNextNonspace();
	        parser.advanceOffset(match[0].length, false);
	        parser.closeUnmatchedBlocks();
	        var container = parser.addChild('heading', parser.nextNonspace);
	        container.level = match[0].trim().length; // number of #s
	        // remove trailing ###s:
	        container._string_content = parser.currentLine.slice(parser.offset).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '');
	        parser.advanceOffset(parser.currentLine.length - parser.offset);
	        return 2;
	    } else {
	        return 0;
	    }
	},

	// Fenced code block
	function (parser) {
	    var match;
	    if (!parser.indented && (match = parser.currentLine.slice(parser.nextNonspace).match(reCodeFence))) {
	        var fenceLength = match[0].length;
	        parser.closeUnmatchedBlocks();
	        var container = parser.addChild('code_block', parser.nextNonspace);
	        container._isFenced = true;
	        container._fenceLength = fenceLength;
	        container._fenceChar = match[0][0];
	        container._fenceOffset = parser.indent;
	        parser.advanceNextNonspace();
	        parser.advanceOffset(fenceLength, false);
	        return 2;
	    } else {
	        return 0;
	    }
	},

	// HTML block
	function (parser, container) {
	    if (!parser.indented && peek(parser.currentLine, parser.nextNonspace) === C_LESSTHAN) {
	        var s = parser.currentLine.slice(parser.nextNonspace);
	        var blockType;

	        for (blockType = 1; blockType <= 7; blockType++) {
	            if (reHtmlBlockOpen[blockType].test(s) && (blockType < 7 || container.type !== 'paragraph')) {
	                parser.closeUnmatchedBlocks();
	                // We don't adjust parser.offset;
	                // spaces are part of the HTML block:
	                var b = parser.addChild('html_block', parser.offset);
	                b._htmlBlockType = blockType;
	                return 2;
	            }
	        }
	    }

	    return 0;
	},

	// Setext heading
	function (parser, container) {
	    var match;
	    if (!parser.indented && container.type === 'paragraph' && (match = parser.currentLine.slice(parser.nextNonspace).match(reSetextHeadingLine))) {
	        parser.closeUnmatchedBlocks();
	        var heading = new Node('heading', container.sourcepos);
	        heading.level = match[0][0] === '=' ? 1 : 2;
	        heading._string_content = container._string_content;
	        container.insertAfter(heading);
	        container.unlink();
	        parser.tip = heading;
	        parser.advanceOffset(parser.currentLine.length - parser.offset, false);
	        return 2;
	    } else {
	        return 0;
	    }
	},

	// thematic break
	function (parser) {
	    if (!parser.indented && reThematicBreak.test(parser.currentLine.slice(parser.nextNonspace))) {
	        parser.closeUnmatchedBlocks();
	        parser.addChild('thematic_break', parser.nextNonspace);
	        parser.advanceOffset(parser.currentLine.length - parser.offset, false);
	        return 2;
	    } else {
	        return 0;
	    }
	},

	// list item
	function (parser, container) {
	    var data;

	    if ((!parser.indented || container.type === 'list') && (data = parseListMarker(parser, container))) {
	        parser.closeUnmatchedBlocks();

	        // add the list if needed
	        if (parser.tip.type !== 'list' || !listsMatch(container._listData, data)) {
	            container = parser.addChild('list', parser.nextNonspace);
	            container._listData = data;
	        }

	        // add the list item
	        container = parser.addChild('item', parser.nextNonspace);
	        container._listData = data;
	        return 1;
	    } else {
	        return 0;
	    }
	},

	// indented code block
	function (parser) {
	    if (parser.indented && parser.tip.type !== 'paragraph' && !parser.blank) {
	        // indented code
	        parser.advanceOffset(CODE_INDENT, true);
	        parser.closeUnmatchedBlocks();
	        parser.addChild('code_block', parser.offset);
	        return 2;
	    } else {
	        return 0;
	    }
	}];

	var advanceOffset = function advanceOffset(count, columns) {
	    var currentLine = this.currentLine;
	    var charsToTab, charsToAdvance;
	    var c;
	    while (count > 0 && (c = currentLine[this.offset])) {
	        if (c === '\t') {
	            charsToTab = 4 - this.column % 4;
	            if (columns) {
	                this.partiallyConsumedTab = charsToTab > count;
	                charsToAdvance = charsToTab > count ? count : charsToTab;
	                this.column += charsToAdvance;
	                this.offset += this.partiallyConsumedTab ? 0 : 1;
	                count -= charsToAdvance;
	            } else {
	                this.partiallyConsumedTab = false;
	                this.column += charsToTab;
	                this.offset += 1;
	                count -= 1;
	            }
	        } else {
	            this.partiallyConsumedTab = false;
	            this.offset += 1;
	            this.column += 1; // assume ascii; block starts are ascii
	            count -= 1;
	        }
	    }
	};

	var advanceNextNonspace = function advanceNextNonspace() {
	    this.offset = this.nextNonspace;
	    this.column = this.nextNonspaceColumn;
	    this.partiallyConsumedTab = false;
	};

	var findNextNonspace = function findNextNonspace() {
	    var currentLine = this.currentLine;
	    var i = this.offset;
	    var cols = this.column;
	    var c;

	    while ((c = currentLine.charAt(i)) !== '') {
	        if (c === ' ') {
	            i++;
	            cols++;
	        } else if (c === '\t') {
	            i++;
	            cols += 4 - cols % 4;
	        } else {
	            break;
	        }
	    }
	    this.blank = c === '\n' || c === '\r' || c === '';
	    this.nextNonspace = i;
	    this.nextNonspaceColumn = cols;
	    this.indent = this.nextNonspaceColumn - this.column;
	    this.indented = this.indent >= CODE_INDENT;
	};

	// Analyze a line of text and update the document appropriately.
	// We parse markdown text by calling this on each line of input,
	// then finalizing the document.
	var incorporateLine = function incorporateLine(ln) {
	    var all_matched = true;
	    var t;

	    var container = this.doc;
	    this.oldtip = this.tip;
	    this.offset = 0;
	    this.column = 0;
	    this.blank = false;
	    this.partiallyConsumedTab = false;
	    this.lineNumber += 1;

	    // replace NUL characters for security
	    if (ln.indexOf('\0') !== -1) {
	        ln = ln.replace(/\0/g, '\uFFFD');
	    }

	    this.currentLine = ln;

	    // For each containing block, try to parse the associated line start.
	    // Bail out on failure: container will point to the last matching block.
	    // Set all_matched to false if not all containers match.
	    var lastChild;
	    while ((lastChild = container._lastChild) && lastChild._open) {
	        container = lastChild;

	        this.findNextNonspace();

	        switch (this.blocks[container.type].continue(this, container)) {
	            case 0:
	                // we've matched, keep going
	                break;
	            case 1:
	                // we've failed to match a block
	                all_matched = false;
	                break;
	            case 2:
	                // we've hit end of line for fenced code close and can return
	                this.lastLineLength = ln.length;
	                return;
	            default:
	                throw 'continue returned illegal value, must be 0, 1, or 2';
	        }
	        if (!all_matched) {
	            container = container._parent; // back up to last matching block
	            break;
	        }
	    }

	    this.allClosed = container === this.oldtip;
	    this.lastMatchedContainer = container;

	    var matchedLeaf = container.type !== 'paragraph' && blocks[container.type].acceptsLines;
	    var starts = this.blockStarts;
	    var startsLen = starts.length;
	    // Unless last matched container is a code block, try new container starts,
	    // adding children to the last matched container:
	    while (!matchedLeaf) {

	        this.findNextNonspace();

	        // this is a little performance optimization:
	        if (!this.indented && !reMaybeSpecial.test(ln.slice(this.nextNonspace))) {
	            this.advanceNextNonspace();
	            break;
	        }

	        var i = 0;
	        while (i < startsLen) {
	            var res = starts[i](this, container);
	            if (res === 1) {
	                container = this.tip;
	                break;
	            } else if (res === 2) {
	                container = this.tip;
	                matchedLeaf = true;
	                break;
	            } else {
	                i++;
	            }
	        }

	        if (i === startsLen) {
	            // nothing matched
	            this.advanceNextNonspace();
	            break;
	        }
	    }

	    // What remains at the offset is a text line.  Add the text to the
	    // appropriate container.

	    // First check for a lazy paragraph continuation:
	    if (!this.allClosed && !this.blank && this.tip.type === 'paragraph') {
	        // lazy paragraph continuation
	        this.addLine();
	    } else {
	        // not a lazy continuation

	        // finalize any blocks not matched
	        this.closeUnmatchedBlocks();
	        if (this.blank && container.lastChild) {
	            container.lastChild._lastLineBlank = true;
	        }

	        t = container.type;

	        // Block quote lines are never blank as they start with >
	        // and we don't count blanks in fenced code for purposes of tight/loose
	        // lists or breaking out of lists.  We also don't set _lastLineBlank
	        // on an empty list item, or if we just closed a fenced block.
	        var lastLineBlank = this.blank && !(t === 'block_quote' || t === 'code_block' && container._isFenced || t === 'item' && !container._firstChild && container.sourcepos[0][0] === this.lineNumber);

	        // propagate lastLineBlank up through parents:
	        var cont = container;
	        while (cont) {
	            cont._lastLineBlank = lastLineBlank;
	            cont = cont._parent;
	        }

	        if (this.blocks[t].acceptsLines) {
	            this.addLine();
	            // if HtmlBlock, check for end condition
	            if (t === 'html_block' && container._htmlBlockType >= 1 && container._htmlBlockType <= 5 && reHtmlBlockClose[container._htmlBlockType].test(this.currentLine.slice(this.offset))) {
	                this.finalize(container, this.lineNumber);
	            }
	        } else if (this.offset < ln.length && !this.blank) {
	            // create paragraph container for line
	            container = this.addChild('paragraph', this.offset);
	            this.advanceNextNonspace();
	            this.addLine();
	        }
	    }
	    this.lastLineLength = ln.length;
	};

	// Finalize a block.  Close it and do any necessary postprocessing,
	// e.g. creating string_content from strings, setting the 'tight'
	// or 'loose' status of a list, and parsing the beginnings
	// of paragraphs for reference definitions.  Reset the tip to the
	// parent of the closed block.
	var finalize = function finalize(block, lineNumber) {
	    var above = block._parent;
	    block._open = false;
	    block.sourcepos[1] = [lineNumber, this.lastLineLength];

	    this.blocks[block.type].finalize(this, block);

	    this.tip = above;
	};

	// Walk through a block & children recursively, parsing string content
	// into inline content where appropriate.
	var processInlines = function processInlines(block) {
	    var node, event, t;
	    var walker = block.walker();
	    this.inlineParser.refmap = this.refmap;
	    this.inlineParser.options = this.options;
	    while (event = walker.next()) {
	        node = event.node;
	        t = node.type;
	        if (!event.entering && (t === 'paragraph' || t === 'heading')) {
	            this.inlineParser.parse(node);
	        }
	    }
	};

	var Document = function Document() {
	    var doc = new Node('document', [[1, 1], [0, 0]]);
	    return doc;
	};

	// The main parsing function.  Returns a parsed document AST.
	var parse = function parse(input) {
	    this.doc = new Document();
	    this.tip = this.doc;
	    this.refmap = {};
	    this.lineNumber = 0;
	    this.lastLineLength = 0;
	    this.offset = 0;
	    this.column = 0;
	    this.lastMatchedContainer = this.doc;
	    this.currentLine = "";
	    if (this.options.time) {
	        console.time("preparing input");
	    }
	    var lines = input.split(reLineEnding);
	    var len = lines.length;
	    if (input.charCodeAt(input.length - 1) === C_NEWLINE) {
	        // ignore last blank line created by final newline
	        len -= 1;
	    }
	    if (this.options.time) {
	        console.timeEnd("preparing input");
	    }
	    if (this.options.time) {
	        console.time("block parsing");
	    }
	    for (var i = 0; i < len; i++) {
	        this.incorporateLine(lines[i]);
	    }
	    while (this.tip) {
	        this.finalize(this.tip, len);
	    }
	    if (this.options.time) {
	        console.timeEnd("block parsing");
	    }
	    if (this.options.time) {
	        console.time("inline parsing");
	    }
	    this.processInlines(this.doc);
	    if (this.options.time) {
	        console.timeEnd("inline parsing");
	    }
	    return this.doc;
	};

	// The Parser object.
	function Parser(options) {
	    return {
	        doc: new Document(),
	        blocks: blocks,
	        blockStarts: blockStarts,
	        tip: this.doc,
	        oldtip: this.doc,
	        currentLine: "",
	        lineNumber: 0,
	        offset: 0,
	        column: 0,
	        nextNonspace: 0,
	        nextNonspaceColumn: 0,
	        indent: 0,
	        indented: false,
	        blank: false,
	        partiallyConsumedTab: false,
	        allClosed: true,
	        lastMatchedContainer: this.doc,
	        refmap: {},
	        lastLineLength: 0,
	        inlineParser: new InlineParser(options),
	        findNextNonspace: findNextNonspace,
	        advanceOffset: advanceOffset,
	        advanceNextNonspace: advanceNextNonspace,
	        addLine: addLine,
	        addChild: addChild,
	        incorporateLine: incorporateLine,
	        finalize: finalize,
	        processInlines: processInlines,
	        closeUnmatchedBlocks: closeUnmatchedBlocks,
	        parse: parse,
	        options: options || {}
	    };
	}

	module.exports = Parser;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var encode = __webpack_require__(39);
	var decode = __webpack_require__(40);

	var C_BACKSLASH = 92;

	var decodeHTML = __webpack_require__(41).decodeHTML;

	var ENTITY = "&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});";

	var TAGNAME = '[A-Za-z][A-Za-z0-9-]*';
	var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
	var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
	var SINGLEQUOTEDVALUE = "'[^']*'";
	var DOUBLEQUOTEDVALUE = '"[^"]*"';
	var ATTRIBUTEVALUE = "(?:" + UNQUOTEDVALUE + "|" + SINGLEQUOTEDVALUE + "|" + DOUBLEQUOTEDVALUE + ")";
	var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
	var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
	var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
	var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
	var HTMLCOMMENT = "<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->";
	var PROCESSINGINSTRUCTION = "[<][?].*?[?][>]";
	var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
	var CDATA = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
	var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" + PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
	var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');

	var reBackslashOrAmp = /[\\&]/;

	var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';

	var reEntityOrEscapedChar = new RegExp('\\\\' + ESCAPABLE + '|' + ENTITY, 'gi');

	var XMLSPECIAL = '[&<>"]';

	var reXmlSpecial = new RegExp(XMLSPECIAL, 'g');

	var reXmlSpecialOrEntity = new RegExp(ENTITY + '|' + XMLSPECIAL, 'gi');

	var unescapeChar = function unescapeChar(s) {
	    if (s.charCodeAt(0) === C_BACKSLASH) {
	        return s.charAt(1);
	    } else {
	        return decodeHTML(s);
	    }
	};

	// Replace entities and backslash escapes with literal characters.
	var unescapeString = function unescapeString(s) {
	    if (reBackslashOrAmp.test(s)) {
	        return s.replace(reEntityOrEscapedChar, unescapeChar);
	    } else {
	        return s;
	    }
	};

	var normalizeURI = function normalizeURI(uri) {
	    try {
	        return encode(decode(uri));
	    } catch (err) {
	        return uri;
	    }
	};

	var replaceUnsafeChar = function replaceUnsafeChar(s) {
	    switch (s) {
	        case '&':
	            return '&amp;';
	        case '<':
	            return '&lt;';
	        case '>':
	            return '&gt;';
	        case '"':
	            return '&quot;';
	        default:
	            return s;
	    }
	};

	var escapeXml = function escapeXml(s, preserve_entities) {
	    if (reXmlSpecial.test(s)) {
	        if (preserve_entities) {
	            return s.replace(reXmlSpecialOrEntity, replaceUnsafeChar);
	        } else {
	            return s.replace(reXmlSpecial, replaceUnsafeChar);
	        }
	    } else {
	        return s;
	    }
	};

	module.exports = { unescapeString: unescapeString,
	    normalizeURI: normalizeURI,
	    escapeXml: escapeXml,
	    reHtmlTag: reHtmlTag,
	    OPENTAG: OPENTAG,
	    CLOSETAG: CLOSETAG,
	    ENTITY: ENTITY,
	    ESCAPABLE: ESCAPABLE
	};

/***/ }),
/* 39 */
/***/ (function(module, exports) {

	
	'use strict';

	var encodeCache = {};

	// Create a lookup array where anything but characters in `chars` string
	// and alphanumeric chars is percent-encoded.
	//
	function getEncodeCache(exclude) {
	  var i,
	      ch,
	      cache = encodeCache[exclude];
	  if (cache) {
	    return cache;
	  }

	  cache = encodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);

	    if (/^[0-9a-z]$/i.test(ch)) {
	      // always allow unencoded alphanumeric characters
	      cache.push(ch);
	    } else {
	      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
	    }
	  }

	  for (i = 0; i < exclude.length; i++) {
	    cache[exclude.charCodeAt(i)] = exclude[i];
	  }

	  return cache;
	}

	// Encode unsafe characters with percent-encoding, skipping already
	// encoded sequences.
	//
	//  - string       - string to encode
	//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
	//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
	//
	function encode(string, exclude, keepEscaped) {
	  var i,
	      l,
	      code,
	      nextCode,
	      cache,
	      result = '';

	  if (typeof exclude !== 'string') {
	    // encode(string, keepEscaped)
	    keepEscaped = exclude;
	    exclude = encode.defaultChars;
	  }

	  if (typeof keepEscaped === 'undefined') {
	    keepEscaped = true;
	  }

	  cache = getEncodeCache(exclude);

	  for (i = 0, l = string.length; i < l; i++) {
	    code = string.charCodeAt(i);

	    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
	      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
	        result += string.slice(i, i + 3);
	        i += 2;
	        continue;
	      }
	    }

	    if (code < 128) {
	      result += cache[code];
	      continue;
	    }

	    if (code >= 0xD800 && code <= 0xDFFF) {
	      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
	        nextCode = string.charCodeAt(i + 1);
	        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
	          result += encodeURIComponent(string[i] + string[i + 1]);
	          i++;
	          continue;
	        }
	      }
	      result += '%EF%BF%BD';
	      continue;
	    }

	    result += encodeURIComponent(string[i]);
	  }

	  return result;
	}

	encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
	encode.componentChars = "-_.!~*'()";

	module.exports = encode;

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	
	'use strict';

	/* eslint-disable no-bitwise */

	var decodeCache = {};

	function getDecodeCache(exclude) {
	  var i,
	      ch,
	      cache = decodeCache[exclude];
	  if (cache) {
	    return cache;
	  }

	  cache = decodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);
	    cache.push(ch);
	  }

	  for (i = 0; i < exclude.length; i++) {
	    ch = exclude.charCodeAt(i);
	    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
	  }

	  return cache;
	}

	// Decode percent-encoded string.
	//
	function decode(string, exclude) {
	  var cache;

	  if (typeof exclude !== 'string') {
	    exclude = decode.defaultChars;
	  }

	  cache = getDecodeCache(exclude);

	  return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
	    var i,
	        l,
	        b1,
	        b2,
	        b3,
	        b4,
	        chr,
	        result = '';

	    for (i = 0, l = seq.length; i < l; i += 3) {
	      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

	      if (b1 < 0x80) {
	        result += cache[b1];
	        continue;
	      }

	      if ((b1 & 0xE0) === 0xC0 && i + 3 < l) {
	        // 110xxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

	        if ((b2 & 0xC0) === 0x80) {
	          chr = b1 << 6 & 0x7C0 | b2 & 0x3F;

	          if (chr < 0x80) {
	            result += '\uFFFD\uFFFD';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 3;
	          continue;
	        }
	      }

	      if ((b1 & 0xF0) === 0xE0 && i + 6 < l) {
	        // 1110xxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
	          chr = b1 << 12 & 0xF000 | b2 << 6 & 0xFC0 | b3 & 0x3F;

	          if (chr < 0x800 || chr >= 0xD800 && chr <= 0xDFFF) {
	            result += '\uFFFD\uFFFD\uFFFD';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 6;
	          continue;
	        }
	      }

	      if ((b1 & 0xF8) === 0xF0 && i + 9 < l) {
	        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
	        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
	          chr = b1 << 18 & 0x1C0000 | b2 << 12 & 0x3F000 | b3 << 6 & 0xFC0 | b4 & 0x3F;

	          if (chr < 0x10000 || chr > 0x10FFFF) {
	            result += '\uFFFD\uFFFD\uFFFD\uFFFD';
	          } else {
	            chr -= 0x10000;
	            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
	          }

	          i += 9;
	          continue;
	        }
	      }

	      result += '\uFFFD';
	    }

	    return result;
	  });
	}

	decode.defaultChars = ';/?:@&=+$,#';
	decode.componentChars = '';

	module.exports = decode;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var encode = __webpack_require__(42),
	    decode = __webpack_require__(45);

	exports.decode = function (data, level) {
		return (!level || level <= 0 ? decode.XML : decode.HTML)(data);
	};

	exports.decodeStrict = function (data, level) {
		return (!level || level <= 0 ? decode.XML : decode.HTMLStrict)(data);
	};

	exports.encode = function (data, level) {
		return (!level || level <= 0 ? encode.XML : encode.HTML)(data);
	};

	exports.encodeXML = encode.XML;

	exports.encodeHTML4 = exports.encodeHTML5 = exports.encodeHTML = encode.HTML;

	exports.decodeXML = exports.decodeXMLStrict = decode.XML;

	exports.decodeHTML4 = exports.decodeHTML5 = exports.decodeHTML = decode.HTML;

	exports.decodeHTML4Strict = exports.decodeHTML5Strict = exports.decodeHTMLStrict = decode.HTMLStrict;

	exports.escape = encode.escape;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var inverseXML = getInverseObj(__webpack_require__(43)),
	    xmlReplacer = getInverseReplacer(inverseXML);

	exports.XML = getInverse(inverseXML, xmlReplacer);

	var inverseHTML = getInverseObj(__webpack_require__(44)),
	    htmlReplacer = getInverseReplacer(inverseHTML);

	exports.HTML = getInverse(inverseHTML, htmlReplacer);

	function getInverseObj(obj) {
		return Object.keys(obj).sort().reduce(function (inverse, name) {
			inverse[obj[name]] = "&" + name + ";";
			return inverse;
		}, {});
	}

	function getInverseReplacer(inverse) {
		var single = [],
		    multiple = [];

		Object.keys(inverse).forEach(function (k) {
			if (k.length === 1) {
				single.push("\\" + k);
			} else {
				multiple.push(k);
			}
		});

		//TODO add ranges
		multiple.unshift("[" + single.join("") + "]");

		return new RegExp(multiple.join("|"), "g");
	}

	var re_nonASCII = /[^\0-\x7F]/g,
	    re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

	function singleCharReplacer(c) {
		return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
	}

	function astralReplacer(c) {
		// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		var high = c.charCodeAt(0);
		var low = c.charCodeAt(1);
		var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
		return "&#x" + codePoint.toString(16).toUpperCase() + ";";
	}

	function getInverse(inverse, re) {
		function func(name) {
			return inverse[name];
		}

		return function (data) {
			return data.replace(re, func).replace(re_astralSymbols, astralReplacer).replace(re_nonASCII, singleCharReplacer);
		};
	}

	var re_xmlChars = getInverseReplacer(inverseXML);

	function escapeXML(data) {
		return data.replace(re_xmlChars, singleCharReplacer).replace(re_astralSymbols, astralReplacer).replace(re_nonASCII, singleCharReplacer);
	}

	exports.escape = escapeXML;

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	

/***/ }),
/* 44 */
/***/ (function(module, exports) {

	

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var entityMap = __webpack_require__(44),
	    legacyMap = __webpack_require__(46),
	    xmlMap = __webpack_require__(43),
	    decodeCodePoint = __webpack_require__(47);

	var decodeXMLStrict = getStrictDecoder(xmlMap),
	    decodeHTMLStrict = getStrictDecoder(entityMap);

	function getStrictDecoder(map) {
		var keys = Object.keys(map).join("|"),
		    replace = getReplacer(map);

		keys += "|#[xX][\\da-fA-F]+|#\\d+";

		var re = new RegExp("&(?:" + keys + ");", "g");

		return function (str) {
			return String(str).replace(re, replace);
		};
	}

	var decodeHTML = function () {
		var legacy = Object.keys(legacyMap).sort(sorter);

		var keys = Object.keys(entityMap).sort(sorter);

		for (var i = 0, j = 0; i < keys.length; i++) {
			if (legacy[j] === keys[i]) {
				keys[i] += ";?";
				j++;
			} else {
				keys[i] += ";";
			}
		}

		var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"),
		    replace = getReplacer(entityMap);

		function replacer(str) {
			if (str.substr(-1) !== ";") str += ";";
			return replace(str);
		}

		//TODO consider creating a merged map
		return function (str) {
			return String(str).replace(re, replacer);
		};
	}();

	function sorter(a, b) {
		return a < b ? 1 : -1;
	}

	function getReplacer(map) {
		return function replace(str) {
			if (str.charAt(1) === "#") {
				if (str.charAt(2) === "X" || str.charAt(2) === "x") {
					return decodeCodePoint(parseInt(str.substr(3), 16));
				}
				return decodeCodePoint(parseInt(str.substr(2), 10));
			}
			return map[str.slice(1, -1)];
		};
	}

	module.exports = {
		XML: decodeXMLStrict,
		HTML: decodeHTML,
		HTMLStrict: decodeHTMLStrict
	};

/***/ }),
/* 46 */
/***/ (function(module, exports) {

	

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var decodeMap = __webpack_require__(48);

	module.exports = decodeCodePoint;

	// modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
	function decodeCodePoint(codePoint) {

		if (codePoint >= 0xD800 && codePoint <= 0xDFFF || codePoint > 0x10FFFF) {
			return "\uFFFD";
		}

		if (codePoint in decodeMap) {
			codePoint = decodeMap[codePoint];
		}

		var output = "";

		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}

		output += String.fromCharCode(codePoint);
		return output;
	}

/***/ }),
/* 48 */
/***/ (function(module, exports) {

	

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var Node = __webpack_require__(36);
	var common = __webpack_require__(38);
	var normalizeReference = __webpack_require__(50);

	var normalizeURI = common.normalizeURI;
	var unescapeString = common.unescapeString;
	var fromCodePoint = __webpack_require__(51);
	var decodeHTML = __webpack_require__(41).decodeHTML;
	__webpack_require__(52); // Polyfill for String.prototype.repeat

	// Constants for character codes:

	var C_NEWLINE = 10;
	var C_ASTERISK = 42;
	var C_UNDERSCORE = 95;
	var C_BACKTICK = 96;
	var C_OPEN_BRACKET = 91;
	var C_CLOSE_BRACKET = 93;
	var C_LESSTHAN = 60;
	var C_BANG = 33;
	var C_BACKSLASH = 92;
	var C_AMPERSAND = 38;
	var C_OPEN_PAREN = 40;
	var C_CLOSE_PAREN = 41;
	var C_COLON = 58;
	var C_SINGLEQUOTE = 39;
	var C_DOUBLEQUOTE = 34;

	// Some regexps used in inline parser:

	var ESCAPABLE = common.ESCAPABLE;
	var ESCAPED_CHAR = '\\\\' + ESCAPABLE;
	var REG_CHAR = '[^\\\\()\\x00-\\x20]';
	var IN_PARENS_NOSP = '\\((' + REG_CHAR + '|' + ESCAPED_CHAR + '|\\\\)*\\)';

	var ENTITY = common.ENTITY;
	var reHtmlTag = common.reHtmlTag;

	var rePunctuation = new RegExp(/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/);

	var reLinkTitle = new RegExp('^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' + '|' + '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' + '|' + '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');

	var reLinkDestinationBraces = new RegExp('^(?:[<](?:[^ <>\\t\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');

	var reLinkDestination = new RegExp('^(?:' + REG_CHAR + '+|' + ESCAPED_CHAR + '|\\\\|' + IN_PARENS_NOSP + ')*');

	var reEscapable = new RegExp('^' + ESCAPABLE);

	var reEntityHere = new RegExp('^' + ENTITY, 'i');

	var reTicks = /`+/;

	var reTicksHere = /^`+/;

	var reEllipses = /\.\.\./g;

	var reDash = /--+/g;

	var reEmailAutolink = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;

	var reAutolink = /^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\x00-\x20]*>/i;

	var reSpnl = /^ *(?:\n *)?/;

	var reWhitespaceChar = /^[ \t\n\x0b\x0c\x0d]/;

	var reWhitespace = /[ \t\n\x0b\x0c\x0d]+/g;

	var reUnicodeWhitespaceChar = /^\s/;

	var reUnicodeWhitespace = /\s+/g;

	var reFinalSpace = / *$/;

	var reInitialSpace = /^ */;

	var reSpaceAtEndOfLine = /^ *(?:\n|$)/;

	var reLinkLabel = new RegExp('^\\[(?:[^\\\\\\[\\]]|' + ESCAPED_CHAR + '|\\\\){0,1000}\\]');

	// Matches a string of non-special characters.
	var reMain = /^[^\n`\[\]\\!<&*_'"]+/m;

	var text = function text(s) {
	    var node = new Node('text');
	    node._literal = s;
	    return node;
	};

	// INLINE PARSER

	// These are methods of an InlineParser object, defined below.
	// An InlineParser keeps track of a subject (a string to be
	// parsed) and a position in that subject.

	// If re matches at current position in the subject, advance
	// position in subject and return the match; otherwise return null.
	var match = function match(re) {
	    var m = re.exec(this.subject.slice(this.pos));
	    if (m === null) {
	        return null;
	    } else {
	        this.pos += m.index + m[0].length;
	        return m[0];
	    }
	};

	// Returns the code for the character at the current subject position, or -1
	// there are no more characters.
	var peek = function peek() {
	    if (this.pos < this.subject.length) {
	        return this.subject.charCodeAt(this.pos);
	    } else {
	        return -1;
	    }
	};

	// Parse zero or more space characters, including at most one newline
	var spnl = function spnl() {
	    this.match(reSpnl);
	    return true;
	};

	// All of the parsers below try to match something at the current position
	// in the subject.  If they succeed in matching anything, they
	// return the inline matched, advancing the subject.

	// Attempt to parse backticks, adding either a backtick code span or a
	// literal sequence of backticks.
	var parseBackticks = function parseBackticks(block) {
	    var ticks = this.match(reTicksHere);
	    if (ticks === null) {
	        return false;
	    }
	    var afterOpenTicks = this.pos;
	    var matched;
	    var node;
	    while ((matched = this.match(reTicks)) !== null) {
	        if (matched === ticks) {
	            node = new Node('code');
	            node._literal = this.subject.slice(afterOpenTicks, this.pos - ticks.length).trim().replace(reWhitespace, ' ');
	            block.appendChild(node);
	            return true;
	        }
	    }
	    // If we got here, we didn't match a closing backtick sequence.
	    this.pos = afterOpenTicks;
	    block.appendChild(text(ticks));
	    return true;
	};

	// Parse a backslash-escaped special character, adding either the escaped
	// character, a hard line break (if the backslash is followed by a newline),
	// or a literal backslash to the block's children.  Assumes current character
	// is a backslash.
	var parseBackslash = function parseBackslash(block) {
	    var subj = this.subject;
	    var node;
	    this.pos += 1;
	    if (this.peek() === C_NEWLINE) {
	        this.pos += 1;
	        node = new Node('linebreak');
	        block.appendChild(node);
	    } else if (reEscapable.test(subj.charAt(this.pos))) {
	        block.appendChild(text(subj.charAt(this.pos)));
	        this.pos += 1;
	    } else {
	        block.appendChild(text('\\'));
	    }
	    return true;
	};

	// Attempt to parse an autolink (URL or email in pointy brackets).
	var parseAutolink = function parseAutolink(block) {
	    var m;
	    var dest;
	    var node;
	    if (m = this.match(reEmailAutolink)) {
	        dest = m.slice(1, m.length - 1);
	        node = new Node('link');
	        node._destination = normalizeURI('mailto:' + dest);
	        node._title = '';
	        node.appendChild(text(dest));
	        block.appendChild(node);
	        return true;
	    } else if (m = this.match(reAutolink)) {
	        dest = m.slice(1, m.length - 1);
	        node = new Node('link');
	        node._destination = normalizeURI(dest);
	        node._title = '';
	        node.appendChild(text(dest));
	        block.appendChild(node);
	        return true;
	    } else {
	        return false;
	    }
	};

	// Attempt to parse a raw HTML tag.
	var parseHtmlTag = function parseHtmlTag(block) {
	    var m = this.match(reHtmlTag);
	    if (m === null) {
	        return false;
	    } else {
	        var node = new Node('html_inline');
	        node._literal = m;
	        block.appendChild(node);
	        return true;
	    }
	};

	// Scan a sequence of characters with code cc, and return information about
	// the number of delimiters and whether they are positioned such that
	// they can open and/or close emphasis or strong emphasis.  A utility
	// function for strong/emph parsing.
	var scanDelims = function scanDelims(cc) {
	    var numdelims = 0;
	    var char_before, char_after, cc_after;
	    var startpos = this.pos;
	    var left_flanking, right_flanking, can_open, can_close;
	    var after_is_whitespace, after_is_punctuation, before_is_whitespace, before_is_punctuation;

	    if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
	        numdelims++;
	        this.pos++;
	    } else {
	        while (this.peek() === cc) {
	            numdelims++;
	            this.pos++;
	        }
	    }

	    if (numdelims === 0) {
	        return null;
	    }

	    char_before = startpos === 0 ? '\n' : this.subject.charAt(startpos - 1);

	    cc_after = this.peek();
	    if (cc_after === -1) {
	        char_after = '\n';
	    } else {
	        char_after = fromCodePoint(cc_after);
	    }

	    after_is_whitespace = reUnicodeWhitespaceChar.test(char_after);
	    after_is_punctuation = rePunctuation.test(char_after);
	    before_is_whitespace = reUnicodeWhitespaceChar.test(char_before);
	    before_is_punctuation = rePunctuation.test(char_before);

	    left_flanking = !after_is_whitespace && !(after_is_punctuation && !before_is_whitespace && !before_is_punctuation);
	    right_flanking = !before_is_whitespace && !(before_is_punctuation && !after_is_whitespace && !after_is_punctuation);
	    if (cc === C_UNDERSCORE) {
	        can_open = left_flanking && (!right_flanking || before_is_punctuation);
	        can_close = right_flanking && (!left_flanking || after_is_punctuation);
	    } else if (cc === C_SINGLEQUOTE || cc === C_DOUBLEQUOTE) {
	        can_open = left_flanking && !right_flanking;
	        can_close = right_flanking;
	    } else {
	        can_open = left_flanking;
	        can_close = right_flanking;
	    }
	    this.pos = startpos;
	    return { numdelims: numdelims,
	        can_open: can_open,
	        can_close: can_close };
	};

	// Handle a delimiter marker for emphasis or a quote.
	var handleDelim = function handleDelim(cc, block) {
	    var res = this.scanDelims(cc);
	    if (!res) {
	        return false;
	    }
	    var numdelims = res.numdelims;
	    var startpos = this.pos;
	    var contents;

	    this.pos += numdelims;
	    if (cc === C_SINGLEQUOTE) {
	        contents = '\u2019';
	    } else if (cc === C_DOUBLEQUOTE) {
	        contents = '\u201C';
	    } else {
	        contents = this.subject.slice(startpos, this.pos);
	    }
	    var node = text(contents);
	    block.appendChild(node);

	    // Add entry to stack for this opener
	    this.delimiters = { cc: cc,
	        numdelims: numdelims,
	        node: node,
	        previous: this.delimiters,
	        next: null,
	        can_open: res.can_open,
	        can_close: res.can_close };
	    if (this.delimiters.previous !== null) {
	        this.delimiters.previous.next = this.delimiters;
	    }

	    return true;
	};

	var removeDelimiter = function removeDelimiter(delim) {
	    if (delim.previous !== null) {
	        delim.previous.next = delim.next;
	    }
	    if (delim.next === null) {
	        // top of stack
	        this.delimiters = delim.previous;
	    } else {
	        delim.next.previous = delim.previous;
	    }
	};

	var removeDelimitersBetween = function removeDelimitersBetween(bottom, top) {
	    if (bottom.next !== top) {
	        bottom.next = top;
	        top.previous = bottom;
	    }
	};

	var processEmphasis = function processEmphasis(stack_bottom) {
	    var opener, closer, old_closer;
	    var opener_inl, closer_inl;
	    var tempstack;
	    var use_delims;
	    var tmp, next;
	    var opener_found;
	    var openers_bottom = [];
	    var odd_match = false;

	    openers_bottom[C_UNDERSCORE] = stack_bottom;
	    openers_bottom[C_ASTERISK] = stack_bottom;
	    openers_bottom[C_SINGLEQUOTE] = stack_bottom;
	    openers_bottom[C_DOUBLEQUOTE] = stack_bottom;

	    // find first closer above stack_bottom:
	    closer = this.delimiters;
	    while (closer !== null && closer.previous !== stack_bottom) {
	        closer = closer.previous;
	    }
	    // move forward, looking for closers, and handling each
	    while (closer !== null) {
	        var closercc = closer.cc;
	        if (!closer.can_close) {
	            closer = closer.next;
	        } else {
	            // found emphasis closer. now look back for first matching opener:
	            opener = closer.previous;
	            opener_found = false;
	            while (opener !== null && opener !== stack_bottom && opener !== openers_bottom[closercc]) {
	                odd_match = (closer.can_open || opener.can_close) && (opener.numdelims + closer.numdelims) % 3 === 0;
	                if (opener.cc === closer.cc && opener.can_open && !odd_match) {
	                    opener_found = true;
	                    break;
	                }
	                opener = opener.previous;
	            }
	            old_closer = closer;

	            if (closercc === C_ASTERISK || closercc === C_UNDERSCORE) {
	                if (!opener_found) {
	                    closer = closer.next;
	                } else {
	                    // calculate actual number of delimiters used from closer
	                    if (closer.numdelims < 3 || opener.numdelims < 3) {
	                        use_delims = closer.numdelims <= opener.numdelims ? closer.numdelims : opener.numdelims;
	                    } else {
	                        use_delims = closer.numdelims % 2 === 0 ? 2 : 1;
	                    }

	                    opener_inl = opener.node;
	                    closer_inl = closer.node;

	                    // remove used delimiters from stack elts and inlines
	                    opener.numdelims -= use_delims;
	                    closer.numdelims -= use_delims;
	                    opener_inl._literal = opener_inl._literal.slice(0, opener_inl._literal.length - use_delims);
	                    closer_inl._literal = closer_inl._literal.slice(0, closer_inl._literal.length - use_delims);

	                    // build contents for new emph element
	                    var emph = new Node(use_delims === 1 ? 'emph' : 'strong');

	                    tmp = opener_inl._next;
	                    while (tmp && tmp !== closer_inl) {
	                        next = tmp._next;
	                        tmp.unlink();
	                        emph.appendChild(tmp);
	                        tmp = next;
	                    }

	                    opener_inl.insertAfter(emph);

	                    // remove elts between opener and closer in delimiters stack
	                    removeDelimitersBetween(opener, closer);

	                    // if opener has 0 delims, remove it and the inline
	                    if (opener.numdelims === 0) {
	                        opener_inl.unlink();
	                        this.removeDelimiter(opener);
	                    }

	                    if (closer.numdelims === 0) {
	                        closer_inl.unlink();
	                        tempstack = closer.next;
	                        this.removeDelimiter(closer);
	                        closer = tempstack;
	                    }
	                }
	            } else if (closercc === C_SINGLEQUOTE) {
	                closer.node._literal = '\u2019';
	                if (opener_found) {
	                    opener.node._literal = '\u2018';
	                }
	                closer = closer.next;
	            } else if (closercc === C_DOUBLEQUOTE) {
	                closer.node._literal = '\u201D';
	                if (opener_found) {
	                    opener.node.literal = '\u201C';
	                }
	                closer = closer.next;
	            }
	            if (!opener_found && !odd_match) {
	                // Set lower bound for future searches for openers:
	                // We don't do this with odd_match because a **
	                // that doesn't match an earlier * might turn into
	                // an opener, and the * might be matched by something
	                // else.
	                openers_bottom[closercc] = old_closer.previous;
	                if (!old_closer.can_open) {
	                    // We can remove a closer that can't be an opener,
	                    // once we've seen there's no matching opener:
	                    this.removeDelimiter(old_closer);
	                }
	            }
	        }
	    }

	    // remove all delimiters
	    while (this.delimiters !== null && this.delimiters !== stack_bottom) {
	        this.removeDelimiter(this.delimiters);
	    }
	};

	// Attempt to parse link title (sans quotes), returning the string
	// or null if no match.
	var parseLinkTitle = function parseLinkTitle() {
	    var title = this.match(reLinkTitle);
	    if (title === null) {
	        return null;
	    } else {
	        // chop off quotes from title and unescape:
	        return unescapeString(title.substr(1, title.length - 2));
	    }
	};

	// Attempt to parse link destination, returning the string or
	// null if no match.
	var parseLinkDestination = function parseLinkDestination() {
	    var res = this.match(reLinkDestinationBraces);
	    if (res === null) {
	        res = this.match(reLinkDestination);
	        if (res === null) {
	            return null;
	        } else {
	            return normalizeURI(unescapeString(res));
	        }
	    } else {
	        // chop off surrounding <..>:
	        return normalizeURI(unescapeString(res.substr(1, res.length - 2)));
	    }
	};

	// Attempt to parse a link label, returning number of characters parsed.
	var parseLinkLabel = function parseLinkLabel() {
	    var m = this.match(reLinkLabel);
	    if (m === null || m.length > 1001) {
	        return 0;
	    } else {
	        return m.length;
	    }
	};

	// Add open bracket to delimiter stack and add a text node to block's children.
	var parseOpenBracket = function parseOpenBracket(block) {
	    var startpos = this.pos;
	    this.pos += 1;

	    var node = text('[');
	    block.appendChild(node);

	    // Add entry to stack for this opener
	    this.addBracket(node, startpos, false);
	    return true;
	};

	// IF next character is [, and ! delimiter to delimiter stack and
	// add a text node to block's children.  Otherwise just add a text node.
	var parseBang = function parseBang(block) {
	    var startpos = this.pos;
	    this.pos += 1;
	    if (this.peek() === C_OPEN_BRACKET) {
	        this.pos += 1;

	        var node = text('![');
	        block.appendChild(node);

	        // Add entry to stack for this opener
	        this.addBracket(node, startpos + 1, true);
	    } else {
	        block.appendChild(text('!'));
	    }
	    return true;
	};

	// Try to match close bracket against an opening in the delimiter
	// stack.  Add either a link or image, or a plain [ character,
	// to block's children.  If there is a matching delimiter,
	// remove it from the delimiter stack.
	var parseCloseBracket = function parseCloseBracket(block) {
	    var startpos;
	    var is_image;
	    var dest;
	    var title;
	    var matched = false;
	    var reflabel;
	    var opener;

	    this.pos += 1;
	    startpos = this.pos;

	    // get last [ or ![
	    opener = this.brackets;

	    if (opener === null) {
	        // no matched opener, just return a literal
	        block.appendChild(text(']'));
	        return true;
	    }

	    if (!opener.active) {
	        // no matched opener, just return a literal
	        block.appendChild(text(']'));
	        // take opener off brackets stack
	        this.removeBracket();
	        return true;
	    }

	    // If we got here, open is a potential opener
	    is_image = opener.image;

	    // Check to see if we have a link/image

	    var savepos = this.pos;

	    // Inline link?
	    if (this.peek() === C_OPEN_PAREN) {
	        this.pos++;
	        if (this.spnl() && (dest = this.parseLinkDestination()) !== null && this.spnl() && (
	        // make sure there's a space before the title:
	        reWhitespaceChar.test(this.subject.charAt(this.pos - 1)) && (title = this.parseLinkTitle()) || true) && this.spnl() && this.peek() === C_CLOSE_PAREN) {
	            this.pos += 1;
	            matched = true;
	        } else {
	            this.pos = savepos;
	        }
	    }

	    if (!matched) {

	        // Next, see if there's a link label
	        var beforelabel = this.pos;
	        var n = this.parseLinkLabel();
	        if (n > 2) {
	            reflabel = this.subject.slice(beforelabel, beforelabel + n);
	        } else if (!opener.bracketAfter) {
	            // Empty or missing second label means to use the first label as the reference.
	            // The reference must not contain a bracket. If we know there's a bracket, we don't even bother checking it.
	            reflabel = this.subject.slice(opener.index, startpos);
	        }
	        if (n === 0) {
	            // If shortcut reference link, rewind before spaces we skipped.
	            this.pos = savepos;
	        }

	        if (reflabel) {
	            // lookup rawlabel in refmap
	            var link = this.refmap[normalizeReference(reflabel)];
	            if (link) {
	                dest = link.destination;
	                title = link.title;
	                matched = true;
	            }
	        }
	    }

	    if (matched) {
	        var node = new Node(is_image ? 'image' : 'link');
	        node._destination = dest;
	        node._title = title || '';

	        var tmp, next;
	        tmp = opener.node._next;
	        while (tmp) {
	            next = tmp._next;
	            tmp.unlink();
	            node.appendChild(tmp);
	            tmp = next;
	        }
	        block.appendChild(node);
	        this.processEmphasis(opener.previousDelimiter);
	        this.removeBracket();
	        opener.node.unlink();

	        // We remove this bracket and processEmphasis will remove later delimiters.
	        // Now, for a link, we also deactivate earlier link openers.
	        // (no links in links)
	        if (!is_image) {
	            opener = this.brackets;
	            while (opener !== null) {
	                if (!opener.image) {
	                    opener.active = false; // deactivate this opener
	                }
	                opener = opener.previous;
	            }
	        }

	        return true;
	    } else {
	        // no match

	        this.removeBracket(); // remove this opener from stack
	        this.pos = startpos;
	        block.appendChild(text(']'));
	        return true;
	    }
	};

	var addBracket = function addBracket(node, index, image) {
	    if (this.brackets !== null) {
	        this.brackets.bracketAfter = true;
	    }
	    this.brackets = { node: node,
	        previous: this.brackets,
	        previousDelimiter: this.delimiters,
	        index: index,
	        image: image,
	        active: true };
	};

	var removeBracket = function removeBracket() {
	    this.brackets = this.brackets.previous;
	};

	// Attempt to parse an entity.
	var parseEntity = function parseEntity(block) {
	    var m;
	    if (m = this.match(reEntityHere)) {
	        block.appendChild(text(decodeHTML(m)));
	        return true;
	    } else {
	        return false;
	    }
	};

	// Parse a run of ordinary characters, or a single character with
	// a special meaning in markdown, as a plain string.
	var parseString = function parseString(block) {
	    var m;
	    if (m = this.match(reMain)) {
	        if (this.options.smart) {
	            block.appendChild(text(m.replace(reEllipses, '\u2026').replace(reDash, function (chars) {
	                var enCount = 0;
	                var emCount = 0;
	                if (chars.length % 3 === 0) {
	                    // If divisible by 3, use all em dashes
	                    emCount = chars.length / 3;
	                } else if (chars.length % 2 === 0) {
	                    // If divisible by 2, use all en dashes
	                    enCount = chars.length / 2;
	                } else if (chars.length % 3 === 2) {
	                    // If 2 extra dashes, use en dash for last 2; em dashes for rest
	                    enCount = 1;
	                    emCount = (chars.length - 2) / 3;
	                } else {
	                    // Use en dashes for last 4 hyphens; em dashes for rest
	                    enCount = 2;
	                    emCount = (chars.length - 4) / 3;
	                }
	                return '\u2014'.repeat(emCount) + '\u2013'.repeat(enCount);
	            })));
	        } else {
	            block.appendChild(text(m));
	        }
	        return true;
	    } else {
	        return false;
	    }
	};

	// Parse a newline.  If it was preceded by two spaces, return a hard
	// line break; otherwise a soft line break.
	var parseNewline = function parseNewline(block) {
	    this.pos += 1; // assume we're at a \n
	    // check previous node for trailing spaces
	    var lastc = block._lastChild;
	    if (lastc && lastc.type === 'text' && lastc._literal[lastc._literal.length - 1] === ' ') {
	        var hardbreak = lastc._literal[lastc._literal.length - 2] === ' ';
	        lastc._literal = lastc._literal.replace(reFinalSpace, '');
	        block.appendChild(new Node(hardbreak ? 'linebreak' : 'softbreak'));
	    } else {
	        block.appendChild(new Node('softbreak'));
	    }
	    this.match(reInitialSpace); // gobble leading spaces in next line
	    return true;
	};

	// Attempt to parse a link reference, modifying refmap.
	var parseReference = function parseReference(s, refmap) {
	    this.subject = s;
	    this.pos = 0;
	    var rawlabel;
	    var dest;
	    var title;
	    var matchChars;
	    var startpos = this.pos;

	    // label:
	    matchChars = this.parseLinkLabel();
	    if (matchChars === 0) {
	        return 0;
	    } else {
	        rawlabel = this.subject.substr(0, matchChars);
	    }

	    // colon:
	    if (this.peek() === C_COLON) {
	        this.pos++;
	    } else {
	        this.pos = startpos;
	        return 0;
	    }

	    //  link url
	    this.spnl();

	    dest = this.parseLinkDestination();
	    if (dest === null || dest.length === 0) {
	        this.pos = startpos;
	        return 0;
	    }

	    var beforetitle = this.pos;
	    this.spnl();
	    title = this.parseLinkTitle();
	    if (title === null) {
	        title = '';
	        // rewind before spaces
	        this.pos = beforetitle;
	    }

	    // make sure we're at line end:
	    var atLineEnd = true;
	    if (this.match(reSpaceAtEndOfLine) === null) {
	        if (title === '') {
	            atLineEnd = false;
	        } else {
	            // the potential title we found is not at the line end,
	            // but it could still be a legal link reference if we
	            // discard the title
	            title = '';
	            // rewind before spaces
	            this.pos = beforetitle;
	            // and instead check if the link URL is at the line end
	            atLineEnd = this.match(reSpaceAtEndOfLine) !== null;
	        }
	    }

	    if (!atLineEnd) {
	        this.pos = startpos;
	        return 0;
	    }

	    var normlabel = normalizeReference(rawlabel);
	    if (normlabel === '') {
	        // label must contain non-whitespace characters
	        this.pos = startpos;
	        return 0;
	    }

	    if (!refmap[normlabel]) {
	        refmap[normlabel] = { destination: dest, title: title };
	    }
	    return this.pos - startpos;
	};

	// Parse the next inline element in subject, advancing subject position.
	// On success, add the result to block's children and return true.
	// On failure, return false.
	var parseInline = function parseInline(block) {
	    var res = false;
	    var c = this.peek();
	    if (c === -1) {
	        return false;
	    }
	    switch (c) {
	        case C_NEWLINE:
	            res = this.parseNewline(block);
	            break;
	        case C_BACKSLASH:
	            res = this.parseBackslash(block);
	            break;
	        case C_BACKTICK:
	            res = this.parseBackticks(block);
	            break;
	        case C_ASTERISK:
	        case C_UNDERSCORE:
	            res = this.handleDelim(c, block);
	            break;
	        case C_SINGLEQUOTE:
	        case C_DOUBLEQUOTE:
	            res = this.options.smart && this.handleDelim(c, block);
	            break;
	        case C_OPEN_BRACKET:
	            res = this.parseOpenBracket(block);
	            break;
	        case C_BANG:
	            res = this.parseBang(block);
	            break;
	        case C_CLOSE_BRACKET:
	            res = this.parseCloseBracket(block);
	            break;
	        case C_LESSTHAN:
	            res = this.parseAutolink(block) || this.parseHtmlTag(block);
	            break;
	        case C_AMPERSAND:
	            res = this.parseEntity(block);
	            break;
	        default:
	            res = this.parseString(block);
	            break;
	    }
	    if (!res) {
	        this.pos += 1;
	        block.appendChild(text(fromCodePoint(c)));
	    }

	    return true;
	};

	// Parse string content in block into inline children,
	// using refmap to resolve references.
	var parseInlines = function parseInlines(block) {
	    this.subject = block._string_content.trim();
	    this.pos = 0;
	    this.delimiters = null;
	    this.brackets = null;
	    while (this.parseInline(block)) {}
	    block._string_content = null; // allow raw string to be garbage collected
	    this.processEmphasis(null);
	};

	// The InlineParser object.
	function InlineParser(options) {
	    return {
	        subject: '',
	        delimiters: null, // used by handleDelim method
	        brackets: null,
	        pos: 0,
	        refmap: {},
	        match: match,
	        peek: peek,
	        spnl: spnl,
	        parseBackticks: parseBackticks,
	        parseBackslash: parseBackslash,
	        parseAutolink: parseAutolink,
	        parseHtmlTag: parseHtmlTag,
	        scanDelims: scanDelims,
	        handleDelim: handleDelim,
	        parseLinkTitle: parseLinkTitle,
	        parseLinkDestination: parseLinkDestination,
	        parseLinkLabel: parseLinkLabel,
	        parseOpenBracket: parseOpenBracket,
	        parseBang: parseBang,
	        parseCloseBracket: parseCloseBracket,
	        addBracket: addBracket,
	        removeBracket: removeBracket,
	        parseEntity: parseEntity,
	        parseString: parseString,
	        parseNewline: parseNewline,
	        parseReference: parseReference,
	        parseInline: parseInline,
	        processEmphasis: processEmphasis,
	        removeDelimiter: removeDelimiter,
	        options: options || {},
	        parse: parseInlines
	    };
	}

	module.exports = InlineParser;

/***/ }),
/* 50 */
/***/ (function(module, exports) {

	"use strict";

	/* The bulk of this code derives from https://github.com/dmoscrop/fold-case
	But in addition to case-folding, we also normalize whitespace.

	fold-case is Copyright Mathias Bynens <https://mathiasbynens.be/>

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	/*eslint-disable  key-spacing, comma-spacing */

	var regex = /[ \t\r\n]+|[A-Z\xB5\xC0-\xD6\xD8-\xDF\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u0149\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u017F\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C5\u01C7\u01C8\u01CA\u01CB\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F0-\u01F2\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0345\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03AB\u03B0\u03C2\u03CF-\u03D1\u03D5\u03D6\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F0\u03F1\u03F4\u03F5\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u0587\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E96-\u1E9B\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F50\u1F52\u1F54\u1F56\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1F80-\u1FAF\u1FB2-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD2\u1FD3\u1FD6-\u1FDB\u1FE2-\u1FE4\u1FE6-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A\u212B\u2132\u2160-\u216F\u2183\u24B6-\u24CF\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0\uA7B1\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27]|\uD806[\uDCA0-\uDCBF]/g;

	var map = { 'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd', 'E': 'e', 'F': 'f', 'G': 'g', 'H': 'h', 'I': 'i', 'J': 'j', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'O': 'o', 'P': 'p', 'Q': 'q', 'R': 'r', 'S': 's', 'T': 't', 'U': 'u', 'V': 'v', 'W': 'w', 'X': 'x', 'Y': 'y', 'Z': 'z', '\xB5': '\u03BC', '\xC0': '\xE0', '\xC1': '\xE1', '\xC2': '\xE2', '\xC3': '\xE3', '\xC4': '\xE4', '\xC5': '\xE5', '\xC6': '\xE6', '\xC7': '\xE7', '\xC8': '\xE8', '\xC9': '\xE9', '\xCA': '\xEA', '\xCB': '\xEB', '\xCC': '\xEC', '\xCD': '\xED', '\xCE': '\xEE', '\xCF': '\xEF', '\xD0': '\xF0', '\xD1': '\xF1', '\xD2': '\xF2', '\xD3': '\xF3', '\xD4': '\xF4', '\xD5': '\xF5', '\xD6': '\xF6', '\xD8': '\xF8', '\xD9': '\xF9', '\xDA': '\xFA', '\xDB': '\xFB', '\xDC': '\xFC', '\xDD': '\xFD', '\xDE': '\xFE', '\u0100': '\u0101', '\u0102': '\u0103', '\u0104': '\u0105', '\u0106': '\u0107', '\u0108': '\u0109', '\u010A': '\u010B', '\u010C': '\u010D', '\u010E': '\u010F', '\u0110': '\u0111', '\u0112': '\u0113', '\u0114': '\u0115', '\u0116': '\u0117', '\u0118': '\u0119', '\u011A': '\u011B', '\u011C': '\u011D', '\u011E': '\u011F', '\u0120': '\u0121', '\u0122': '\u0123', '\u0124': '\u0125', '\u0126': '\u0127', '\u0128': '\u0129', '\u012A': '\u012B', '\u012C': '\u012D', '\u012E': '\u012F', '\u0132': '\u0133', '\u0134': '\u0135', '\u0136': '\u0137', '\u0139': '\u013A', '\u013B': '\u013C', '\u013D': '\u013E', '\u013F': '\u0140', '\u0141': '\u0142', '\u0143': '\u0144', '\u0145': '\u0146', '\u0147': '\u0148', '\u014A': '\u014B', '\u014C': '\u014D', '\u014E': '\u014F', '\u0150': '\u0151', '\u0152': '\u0153', '\u0154': '\u0155', '\u0156': '\u0157', '\u0158': '\u0159', '\u015A': '\u015B', '\u015C': '\u015D', '\u015E': '\u015F', '\u0160': '\u0161', '\u0162': '\u0163', '\u0164': '\u0165', '\u0166': '\u0167', '\u0168': '\u0169', '\u016A': '\u016B', '\u016C': '\u016D', '\u016E': '\u016F', '\u0170': '\u0171', '\u0172': '\u0173', '\u0174': '\u0175', '\u0176': '\u0177', '\u0178': '\xFF', '\u0179': '\u017A', '\u017B': '\u017C', '\u017D': '\u017E', '\u017F': 's', '\u0181': '\u0253', '\u0182': '\u0183', '\u0184': '\u0185', '\u0186': '\u0254', '\u0187': '\u0188', '\u0189': '\u0256', '\u018A': '\u0257', '\u018B': '\u018C', '\u018E': '\u01DD', '\u018F': '\u0259', '\u0190': '\u025B', '\u0191': '\u0192', '\u0193': '\u0260', '\u0194': '\u0263', '\u0196': '\u0269', '\u0197': '\u0268', '\u0198': '\u0199', '\u019C': '\u026F', '\u019D': '\u0272', '\u019F': '\u0275', '\u01A0': '\u01A1', '\u01A2': '\u01A3', '\u01A4': '\u01A5', '\u01A6': '\u0280', '\u01A7': '\u01A8', '\u01A9': '\u0283', '\u01AC': '\u01AD', '\u01AE': '\u0288', '\u01AF': '\u01B0', '\u01B1': '\u028A', '\u01B2': '\u028B', '\u01B3': '\u01B4', '\u01B5': '\u01B6', '\u01B7': '\u0292', '\u01B8': '\u01B9', '\u01BC': '\u01BD', '\u01C4': '\u01C6', '\u01C5': '\u01C6', '\u01C7': '\u01C9', '\u01C8': '\u01C9', '\u01CA': '\u01CC', '\u01CB': '\u01CC', '\u01CD': '\u01CE', '\u01CF': '\u01D0', '\u01D1': '\u01D2', '\u01D3': '\u01D4', '\u01D5': '\u01D6', '\u01D7': '\u01D8', '\u01D9': '\u01DA', '\u01DB': '\u01DC', '\u01DE': '\u01DF', '\u01E0': '\u01E1', '\u01E2': '\u01E3', '\u01E4': '\u01E5', '\u01E6': '\u01E7', '\u01E8': '\u01E9', '\u01EA': '\u01EB', '\u01EC': '\u01ED', '\u01EE': '\u01EF', '\u01F1': '\u01F3', '\u01F2': '\u01F3', '\u01F4': '\u01F5', '\u01F6': '\u0195', '\u01F7': '\u01BF', '\u01F8': '\u01F9', '\u01FA': '\u01FB', '\u01FC': '\u01FD', '\u01FE': '\u01FF', '\u0200': '\u0201', '\u0202': '\u0203', '\u0204': '\u0205', '\u0206': '\u0207', '\u0208': '\u0209', '\u020A': '\u020B', '\u020C': '\u020D', '\u020E': '\u020F', '\u0210': '\u0211', '\u0212': '\u0213', '\u0214': '\u0215', '\u0216': '\u0217', '\u0218': '\u0219', '\u021A': '\u021B', '\u021C': '\u021D', '\u021E': '\u021F', '\u0220': '\u019E', '\u0222': '\u0223', '\u0224': '\u0225', '\u0226': '\u0227', '\u0228': '\u0229', '\u022A': '\u022B', '\u022C': '\u022D', '\u022E': '\u022F', '\u0230': '\u0231', '\u0232': '\u0233', '\u023A': '\u2C65', '\u023B': '\u023C', '\u023D': '\u019A', '\u023E': '\u2C66', '\u0241': '\u0242', '\u0243': '\u0180', '\u0244': '\u0289', '\u0245': '\u028C', '\u0246': '\u0247', '\u0248': '\u0249', '\u024A': '\u024B', '\u024C': '\u024D', '\u024E': '\u024F', '\u0345': '\u03B9', '\u0370': '\u0371', '\u0372': '\u0373', '\u0376': '\u0377', '\u037F': '\u03F3', '\u0386': '\u03AC', '\u0388': '\u03AD', '\u0389': '\u03AE', '\u038A': '\u03AF', '\u038C': '\u03CC', '\u038E': '\u03CD', '\u038F': '\u03CE', '\u0391': '\u03B1', '\u0392': '\u03B2', '\u0393': '\u03B3', '\u0394': '\u03B4', '\u0395': '\u03B5', '\u0396': '\u03B6', '\u0397': '\u03B7', '\u0398': '\u03B8', '\u0399': '\u03B9', '\u039A': '\u03BA', '\u039B': '\u03BB', '\u039C': '\u03BC', '\u039D': '\u03BD', '\u039E': '\u03BE', '\u039F': '\u03BF', '\u03A0': '\u03C0', '\u03A1': '\u03C1', '\u03A3': '\u03C3', '\u03A4': '\u03C4', '\u03A5': '\u03C5', '\u03A6': '\u03C6', '\u03A7': '\u03C7', '\u03A8': '\u03C8', '\u03A9': '\u03C9', '\u03AA': '\u03CA', '\u03AB': '\u03CB', '\u03C2': '\u03C3', '\u03CF': '\u03D7', '\u03D0': '\u03B2', '\u03D1': '\u03B8', '\u03D5': '\u03C6', '\u03D6': '\u03C0', '\u03D8': '\u03D9', '\u03DA': '\u03DB', '\u03DC': '\u03DD', '\u03DE': '\u03DF', '\u03E0': '\u03E1', '\u03E2': '\u03E3', '\u03E4': '\u03E5', '\u03E6': '\u03E7', '\u03E8': '\u03E9', '\u03EA': '\u03EB', '\u03EC': '\u03ED', '\u03EE': '\u03EF', '\u03F0': '\u03BA', '\u03F1': '\u03C1', '\u03F4': '\u03B8', '\u03F5': '\u03B5', '\u03F7': '\u03F8', '\u03F9': '\u03F2', '\u03FA': '\u03FB', '\u03FD': '\u037B', '\u03FE': '\u037C', '\u03FF': '\u037D', '\u0400': '\u0450', '\u0401': '\u0451', '\u0402': '\u0452', '\u0403': '\u0453', '\u0404': '\u0454', '\u0405': '\u0455', '\u0406': '\u0456', '\u0407': '\u0457', '\u0408': '\u0458', '\u0409': '\u0459', '\u040A': '\u045A', '\u040B': '\u045B', '\u040C': '\u045C', '\u040D': '\u045D', '\u040E': '\u045E', '\u040F': '\u045F', '\u0410': '\u0430', '\u0411': '\u0431', '\u0412': '\u0432', '\u0413': '\u0433', '\u0414': '\u0434', '\u0415': '\u0435', '\u0416': '\u0436', '\u0417': '\u0437', '\u0418': '\u0438', '\u0419': '\u0439', '\u041A': '\u043A', '\u041B': '\u043B', '\u041C': '\u043C', '\u041D': '\u043D', '\u041E': '\u043E', '\u041F': '\u043F', '\u0420': '\u0440', '\u0421': '\u0441', '\u0422': '\u0442', '\u0423': '\u0443', '\u0424': '\u0444', '\u0425': '\u0445', '\u0426': '\u0446', '\u0427': '\u0447', '\u0428': '\u0448', '\u0429': '\u0449', '\u042A': '\u044A', '\u042B': '\u044B', '\u042C': '\u044C', '\u042D': '\u044D', '\u042E': '\u044E', '\u042F': '\u044F', '\u0460': '\u0461', '\u0462': '\u0463', '\u0464': '\u0465', '\u0466': '\u0467', '\u0468': '\u0469', '\u046A': '\u046B', '\u046C': '\u046D', '\u046E': '\u046F', '\u0470': '\u0471', '\u0472': '\u0473', '\u0474': '\u0475', '\u0476': '\u0477', '\u0478': '\u0479', '\u047A': '\u047B', '\u047C': '\u047D', '\u047E': '\u047F', '\u0480': '\u0481', '\u048A': '\u048B', '\u048C': '\u048D', '\u048E': '\u048F', '\u0490': '\u0491', '\u0492': '\u0493', '\u0494': '\u0495', '\u0496': '\u0497', '\u0498': '\u0499', '\u049A': '\u049B', '\u049C': '\u049D', '\u049E': '\u049F', '\u04A0': '\u04A1', '\u04A2': '\u04A3', '\u04A4': '\u04A5', '\u04A6': '\u04A7', '\u04A8': '\u04A9', '\u04AA': '\u04AB', '\u04AC': '\u04AD', '\u04AE': '\u04AF', '\u04B0': '\u04B1', '\u04B2': '\u04B3', '\u04B4': '\u04B5', '\u04B6': '\u04B7', '\u04B8': '\u04B9', '\u04BA': '\u04BB', '\u04BC': '\u04BD', '\u04BE': '\u04BF', '\u04C0': '\u04CF', '\u04C1': '\u04C2', '\u04C3': '\u04C4', '\u04C5': '\u04C6', '\u04C7': '\u04C8', '\u04C9': '\u04CA', '\u04CB': '\u04CC', '\u04CD': '\u04CE', '\u04D0': '\u04D1', '\u04D2': '\u04D3', '\u04D4': '\u04D5', '\u04D6': '\u04D7', '\u04D8': '\u04D9', '\u04DA': '\u04DB', '\u04DC': '\u04DD', '\u04DE': '\u04DF', '\u04E0': '\u04E1', '\u04E2': '\u04E3', '\u04E4': '\u04E5', '\u04E6': '\u04E7', '\u04E8': '\u04E9', '\u04EA': '\u04EB', '\u04EC': '\u04ED', '\u04EE': '\u04EF', '\u04F0': '\u04F1', '\u04F2': '\u04F3', '\u04F4': '\u04F5', '\u04F6': '\u04F7', '\u04F8': '\u04F9', '\u04FA': '\u04FB', '\u04FC': '\u04FD', '\u04FE': '\u04FF', '\u0500': '\u0501', '\u0502': '\u0503', '\u0504': '\u0505', '\u0506': '\u0507', '\u0508': '\u0509', '\u050A': '\u050B', '\u050C': '\u050D', '\u050E': '\u050F', '\u0510': '\u0511', '\u0512': '\u0513', '\u0514': '\u0515', '\u0516': '\u0517', '\u0518': '\u0519', '\u051A': '\u051B', '\u051C': '\u051D', '\u051E': '\u051F', '\u0520': '\u0521', '\u0522': '\u0523', '\u0524': '\u0525', '\u0526': '\u0527', '\u0528': '\u0529', '\u052A': '\u052B', '\u052C': '\u052D', '\u052E': '\u052F', '\u0531': '\u0561', '\u0532': '\u0562', '\u0533': '\u0563', '\u0534': '\u0564', '\u0535': '\u0565', '\u0536': '\u0566', '\u0537': '\u0567', '\u0538': '\u0568', '\u0539': '\u0569', '\u053A': '\u056A', '\u053B': '\u056B', '\u053C': '\u056C', '\u053D': '\u056D', '\u053E': '\u056E', '\u053F': '\u056F', '\u0540': '\u0570', '\u0541': '\u0571', '\u0542': '\u0572', '\u0543': '\u0573', '\u0544': '\u0574', '\u0545': '\u0575', '\u0546': '\u0576', '\u0547': '\u0577', '\u0548': '\u0578', '\u0549': '\u0579', '\u054A': '\u057A', '\u054B': '\u057B', '\u054C': '\u057C', '\u054D': '\u057D', '\u054E': '\u057E', '\u054F': '\u057F', '\u0550': '\u0580', '\u0551': '\u0581', '\u0552': '\u0582', '\u0553': '\u0583', '\u0554': '\u0584', '\u0555': '\u0585', '\u0556': '\u0586', '\u10A0': '\u2D00', '\u10A1': '\u2D01', '\u10A2': '\u2D02', '\u10A3': '\u2D03', '\u10A4': '\u2D04', '\u10A5': '\u2D05', '\u10A6': '\u2D06', '\u10A7': '\u2D07', '\u10A8': '\u2D08', '\u10A9': '\u2D09', '\u10AA': '\u2D0A', '\u10AB': '\u2D0B', '\u10AC': '\u2D0C', '\u10AD': '\u2D0D', '\u10AE': '\u2D0E', '\u10AF': '\u2D0F', '\u10B0': '\u2D10', '\u10B1': '\u2D11', '\u10B2': '\u2D12', '\u10B3': '\u2D13', '\u10B4': '\u2D14', '\u10B5': '\u2D15', '\u10B6': '\u2D16', '\u10B7': '\u2D17', '\u10B8': '\u2D18', '\u10B9': '\u2D19', '\u10BA': '\u2D1A', '\u10BB': '\u2D1B', '\u10BC': '\u2D1C', '\u10BD': '\u2D1D', '\u10BE': '\u2D1E', '\u10BF': '\u2D1F', '\u10C0': '\u2D20', '\u10C1': '\u2D21', '\u10C2': '\u2D22', '\u10C3': '\u2D23', '\u10C4': '\u2D24', '\u10C5': '\u2D25', '\u10C7': '\u2D27', '\u10CD': '\u2D2D', '\u1E00': '\u1E01', '\u1E02': '\u1E03', '\u1E04': '\u1E05', '\u1E06': '\u1E07', '\u1E08': '\u1E09', '\u1E0A': '\u1E0B', '\u1E0C': '\u1E0D', '\u1E0E': '\u1E0F', '\u1E10': '\u1E11', '\u1E12': '\u1E13', '\u1E14': '\u1E15', '\u1E16': '\u1E17', '\u1E18': '\u1E19', '\u1E1A': '\u1E1B', '\u1E1C': '\u1E1D', '\u1E1E': '\u1E1F', '\u1E20': '\u1E21', '\u1E22': '\u1E23', '\u1E24': '\u1E25', '\u1E26': '\u1E27', '\u1E28': '\u1E29', '\u1E2A': '\u1E2B', '\u1E2C': '\u1E2D', '\u1E2E': '\u1E2F', '\u1E30': '\u1E31', '\u1E32': '\u1E33', '\u1E34': '\u1E35', '\u1E36': '\u1E37', '\u1E38': '\u1E39', '\u1E3A': '\u1E3B', '\u1E3C': '\u1E3D', '\u1E3E': '\u1E3F', '\u1E40': '\u1E41', '\u1E42': '\u1E43', '\u1E44': '\u1E45', '\u1E46': '\u1E47', '\u1E48': '\u1E49', '\u1E4A': '\u1E4B', '\u1E4C': '\u1E4D', '\u1E4E': '\u1E4F', '\u1E50': '\u1E51', '\u1E52': '\u1E53', '\u1E54': '\u1E55', '\u1E56': '\u1E57', '\u1E58': '\u1E59', '\u1E5A': '\u1E5B', '\u1E5C': '\u1E5D', '\u1E5E': '\u1E5F', '\u1E60': '\u1E61', '\u1E62': '\u1E63', '\u1E64': '\u1E65', '\u1E66': '\u1E67', '\u1E68': '\u1E69', '\u1E6A': '\u1E6B', '\u1E6C': '\u1E6D', '\u1E6E': '\u1E6F', '\u1E70': '\u1E71', '\u1E72': '\u1E73', '\u1E74': '\u1E75', '\u1E76': '\u1E77', '\u1E78': '\u1E79', '\u1E7A': '\u1E7B', '\u1E7C': '\u1E7D', '\u1E7E': '\u1E7F', '\u1E80': '\u1E81', '\u1E82': '\u1E83', '\u1E84': '\u1E85', '\u1E86': '\u1E87', '\u1E88': '\u1E89', '\u1E8A': '\u1E8B', '\u1E8C': '\u1E8D', '\u1E8E': '\u1E8F', '\u1E90': '\u1E91', '\u1E92': '\u1E93', '\u1E94': '\u1E95', '\u1E9B': '\u1E61', '\u1EA0': '\u1EA1', '\u1EA2': '\u1EA3', '\u1EA4': '\u1EA5', '\u1EA6': '\u1EA7', '\u1EA8': '\u1EA9', '\u1EAA': '\u1EAB', '\u1EAC': '\u1EAD', '\u1EAE': '\u1EAF', '\u1EB0': '\u1EB1', '\u1EB2': '\u1EB3', '\u1EB4': '\u1EB5', '\u1EB6': '\u1EB7', '\u1EB8': '\u1EB9', '\u1EBA': '\u1EBB', '\u1EBC': '\u1EBD', '\u1EBE': '\u1EBF', '\u1EC0': '\u1EC1', '\u1EC2': '\u1EC3', '\u1EC4': '\u1EC5', '\u1EC6': '\u1EC7', '\u1EC8': '\u1EC9', '\u1ECA': '\u1ECB', '\u1ECC': '\u1ECD', '\u1ECE': '\u1ECF', '\u1ED0': '\u1ED1', '\u1ED2': '\u1ED3', '\u1ED4': '\u1ED5', '\u1ED6': '\u1ED7', '\u1ED8': '\u1ED9', '\u1EDA': '\u1EDB', '\u1EDC': '\u1EDD', '\u1EDE': '\u1EDF', '\u1EE0': '\u1EE1', '\u1EE2': '\u1EE3', '\u1EE4': '\u1EE5', '\u1EE6': '\u1EE7', '\u1EE8': '\u1EE9', '\u1EEA': '\u1EEB', '\u1EEC': '\u1EED', '\u1EEE': '\u1EEF', '\u1EF0': '\u1EF1', '\u1EF2': '\u1EF3', '\u1EF4': '\u1EF5', '\u1EF6': '\u1EF7', '\u1EF8': '\u1EF9', '\u1EFA': '\u1EFB', '\u1EFC': '\u1EFD', '\u1EFE': '\u1EFF', '\u1F08': '\u1F00', '\u1F09': '\u1F01', '\u1F0A': '\u1F02', '\u1F0B': '\u1F03', '\u1F0C': '\u1F04', '\u1F0D': '\u1F05', '\u1F0E': '\u1F06', '\u1F0F': '\u1F07', '\u1F18': '\u1F10', '\u1F19': '\u1F11', '\u1F1A': '\u1F12', '\u1F1B': '\u1F13', '\u1F1C': '\u1F14', '\u1F1D': '\u1F15', '\u1F28': '\u1F20', '\u1F29': '\u1F21', '\u1F2A': '\u1F22', '\u1F2B': '\u1F23', '\u1F2C': '\u1F24', '\u1F2D': '\u1F25', '\u1F2E': '\u1F26', '\u1F2F': '\u1F27', '\u1F38': '\u1F30', '\u1F39': '\u1F31', '\u1F3A': '\u1F32', '\u1F3B': '\u1F33', '\u1F3C': '\u1F34', '\u1F3D': '\u1F35', '\u1F3E': '\u1F36', '\u1F3F': '\u1F37', '\u1F48': '\u1F40', '\u1F49': '\u1F41', '\u1F4A': '\u1F42', '\u1F4B': '\u1F43', '\u1F4C': '\u1F44', '\u1F4D': '\u1F45', '\u1F59': '\u1F51', '\u1F5B': '\u1F53', '\u1F5D': '\u1F55', '\u1F5F': '\u1F57', '\u1F68': '\u1F60', '\u1F69': '\u1F61', '\u1F6A': '\u1F62', '\u1F6B': '\u1F63', '\u1F6C': '\u1F64', '\u1F6D': '\u1F65', '\u1F6E': '\u1F66', '\u1F6F': '\u1F67', '\u1FB8': '\u1FB0', '\u1FB9': '\u1FB1', '\u1FBA': '\u1F70', '\u1FBB': '\u1F71', '\u1FBE': '\u03B9', '\u1FC8': '\u1F72', '\u1FC9': '\u1F73', '\u1FCA': '\u1F74', '\u1FCB': '\u1F75', '\u1FD8': '\u1FD0', '\u1FD9': '\u1FD1', '\u1FDA': '\u1F76', '\u1FDB': '\u1F77', '\u1FE8': '\u1FE0', '\u1FE9': '\u1FE1', '\u1FEA': '\u1F7A', '\u1FEB': '\u1F7B', '\u1FEC': '\u1FE5', '\u1FF8': '\u1F78', '\u1FF9': '\u1F79', '\u1FFA': '\u1F7C', '\u1FFB': '\u1F7D', '\u2126': '\u03C9', '\u212A': 'k', '\u212B': '\xE5', '\u2132': '\u214E', '\u2160': '\u2170', '\u2161': '\u2171', '\u2162': '\u2172', '\u2163': '\u2173', '\u2164': '\u2174', '\u2165': '\u2175', '\u2166': '\u2176', '\u2167': '\u2177', '\u2168': '\u2178', '\u2169': '\u2179', '\u216A': '\u217A', '\u216B': '\u217B', '\u216C': '\u217C', '\u216D': '\u217D', '\u216E': '\u217E', '\u216F': '\u217F', '\u2183': '\u2184', '\u24B6': '\u24D0', '\u24B7': '\u24D1', '\u24B8': '\u24D2', '\u24B9': '\u24D3', '\u24BA': '\u24D4', '\u24BB': '\u24D5', '\u24BC': '\u24D6', '\u24BD': '\u24D7', '\u24BE': '\u24D8', '\u24BF': '\u24D9', '\u24C0': '\u24DA', '\u24C1': '\u24DB', '\u24C2': '\u24DC', '\u24C3': '\u24DD', '\u24C4': '\u24DE', '\u24C5': '\u24DF', '\u24C6': '\u24E0', '\u24C7': '\u24E1', '\u24C8': '\u24E2', '\u24C9': '\u24E3', '\u24CA': '\u24E4', '\u24CB': '\u24E5', '\u24CC': '\u24E6', '\u24CD': '\u24E7', '\u24CE': '\u24E8', '\u24CF': '\u24E9', '\u2C00': '\u2C30', '\u2C01': '\u2C31', '\u2C02': '\u2C32', '\u2C03': '\u2C33', '\u2C04': '\u2C34', '\u2C05': '\u2C35', '\u2C06': '\u2C36', '\u2C07': '\u2C37', '\u2C08': '\u2C38', '\u2C09': '\u2C39', '\u2C0A': '\u2C3A', '\u2C0B': '\u2C3B', '\u2C0C': '\u2C3C', '\u2C0D': '\u2C3D', '\u2C0E': '\u2C3E', '\u2C0F': '\u2C3F', '\u2C10': '\u2C40', '\u2C11': '\u2C41', '\u2C12': '\u2C42', '\u2C13': '\u2C43', '\u2C14': '\u2C44', '\u2C15': '\u2C45', '\u2C16': '\u2C46', '\u2C17': '\u2C47', '\u2C18': '\u2C48', '\u2C19': '\u2C49', '\u2C1A': '\u2C4A', '\u2C1B': '\u2C4B', '\u2C1C': '\u2C4C', '\u2C1D': '\u2C4D', '\u2C1E': '\u2C4E', '\u2C1F': '\u2C4F', '\u2C20': '\u2C50', '\u2C21': '\u2C51', '\u2C22': '\u2C52', '\u2C23': '\u2C53', '\u2C24': '\u2C54', '\u2C25': '\u2C55', '\u2C26': '\u2C56', '\u2C27': '\u2C57', '\u2C28': '\u2C58', '\u2C29': '\u2C59', '\u2C2A': '\u2C5A', '\u2C2B': '\u2C5B', '\u2C2C': '\u2C5C', '\u2C2D': '\u2C5D', '\u2C2E': '\u2C5E', '\u2C60': '\u2C61', '\u2C62': '\u026B', '\u2C63': '\u1D7D', '\u2C64': '\u027D', '\u2C67': '\u2C68', '\u2C69': '\u2C6A', '\u2C6B': '\u2C6C', '\u2C6D': '\u0251', '\u2C6E': '\u0271', '\u2C6F': '\u0250', '\u2C70': '\u0252', '\u2C72': '\u2C73', '\u2C75': '\u2C76', '\u2C7E': '\u023F', '\u2C7F': '\u0240', '\u2C80': '\u2C81', '\u2C82': '\u2C83', '\u2C84': '\u2C85', '\u2C86': '\u2C87', '\u2C88': '\u2C89', '\u2C8A': '\u2C8B', '\u2C8C': '\u2C8D', '\u2C8E': '\u2C8F', '\u2C90': '\u2C91', '\u2C92': '\u2C93', '\u2C94': '\u2C95', '\u2C96': '\u2C97', '\u2C98': '\u2C99', '\u2C9A': '\u2C9B', '\u2C9C': '\u2C9D', '\u2C9E': '\u2C9F', '\u2CA0': '\u2CA1', '\u2CA2': '\u2CA3', '\u2CA4': '\u2CA5', '\u2CA6': '\u2CA7', '\u2CA8': '\u2CA9', '\u2CAA': '\u2CAB', '\u2CAC': '\u2CAD', '\u2CAE': '\u2CAF', '\u2CB0': '\u2CB1', '\u2CB2': '\u2CB3', '\u2CB4': '\u2CB5', '\u2CB6': '\u2CB7', '\u2CB8': '\u2CB9', '\u2CBA': '\u2CBB', '\u2CBC': '\u2CBD', '\u2CBE': '\u2CBF', '\u2CC0': '\u2CC1', '\u2CC2': '\u2CC3', '\u2CC4': '\u2CC5', '\u2CC6': '\u2CC7', '\u2CC8': '\u2CC9', '\u2CCA': '\u2CCB', '\u2CCC': '\u2CCD', '\u2CCE': '\u2CCF', '\u2CD0': '\u2CD1', '\u2CD2': '\u2CD3', '\u2CD4': '\u2CD5', '\u2CD6': '\u2CD7', '\u2CD8': '\u2CD9', '\u2CDA': '\u2CDB', '\u2CDC': '\u2CDD', '\u2CDE': '\u2CDF', '\u2CE0': '\u2CE1', '\u2CE2': '\u2CE3', '\u2CEB': '\u2CEC', '\u2CED': '\u2CEE', '\u2CF2': '\u2CF3', '\uA640': '\uA641', '\uA642': '\uA643', '\uA644': '\uA645', '\uA646': '\uA647', '\uA648': '\uA649', '\uA64A': '\uA64B', '\uA64C': '\uA64D', '\uA64E': '\uA64F', '\uA650': '\uA651', '\uA652': '\uA653', '\uA654': '\uA655', '\uA656': '\uA657', '\uA658': '\uA659', '\uA65A': '\uA65B', '\uA65C': '\uA65D', '\uA65E': '\uA65F', '\uA660': '\uA661', '\uA662': '\uA663', '\uA664': '\uA665', '\uA666': '\uA667', '\uA668': '\uA669', '\uA66A': '\uA66B', '\uA66C': '\uA66D', '\uA680': '\uA681', '\uA682': '\uA683', '\uA684': '\uA685', '\uA686': '\uA687', '\uA688': '\uA689', '\uA68A': '\uA68B', '\uA68C': '\uA68D', '\uA68E': '\uA68F', '\uA690': '\uA691', '\uA692': '\uA693', '\uA694': '\uA695', '\uA696': '\uA697', '\uA698': '\uA699', '\uA69A': '\uA69B', '\uA722': '\uA723', '\uA724': '\uA725', '\uA726': '\uA727', '\uA728': '\uA729', '\uA72A': '\uA72B', '\uA72C': '\uA72D', '\uA72E': '\uA72F', '\uA732': '\uA733', '\uA734': '\uA735', '\uA736': '\uA737', '\uA738': '\uA739', '\uA73A': '\uA73B', '\uA73C': '\uA73D', '\uA73E': '\uA73F', '\uA740': '\uA741', '\uA742': '\uA743', '\uA744': '\uA745', '\uA746': '\uA747', '\uA748': '\uA749', '\uA74A': '\uA74B', '\uA74C': '\uA74D', '\uA74E': '\uA74F', '\uA750': '\uA751', '\uA752': '\uA753', '\uA754': '\uA755', '\uA756': '\uA757', '\uA758': '\uA759', '\uA75A': '\uA75B', '\uA75C': '\uA75D', '\uA75E': '\uA75F', '\uA760': '\uA761', '\uA762': '\uA763', '\uA764': '\uA765', '\uA766': '\uA767', '\uA768': '\uA769', '\uA76A': '\uA76B', '\uA76C': '\uA76D', '\uA76E': '\uA76F', '\uA779': '\uA77A', '\uA77B': '\uA77C', '\uA77D': '\u1D79', '\uA77E': '\uA77F', '\uA780': '\uA781', '\uA782': '\uA783', '\uA784': '\uA785', '\uA786': '\uA787', '\uA78B': '\uA78C', '\uA78D': '\u0265', '\uA790': '\uA791', '\uA792': '\uA793', '\uA796': '\uA797', '\uA798': '\uA799', '\uA79A': '\uA79B', '\uA79C': '\uA79D', '\uA79E': '\uA79F', '\uA7A0': '\uA7A1', '\uA7A2': '\uA7A3', '\uA7A4': '\uA7A5', '\uA7A6': '\uA7A7', '\uA7A8': '\uA7A9', '\uA7AA': '\u0266', '\uA7AB': '\u025C', '\uA7AC': '\u0261', '\uA7AD': '\u026C', '\uA7B0': '\u029E', '\uA7B1': '\u0287', '\uFF21': '\uFF41', '\uFF22': '\uFF42', '\uFF23': '\uFF43', '\uFF24': '\uFF44', '\uFF25': '\uFF45', '\uFF26': '\uFF46', '\uFF27': '\uFF47', '\uFF28': '\uFF48', '\uFF29': '\uFF49', '\uFF2A': '\uFF4A', '\uFF2B': '\uFF4B', '\uFF2C': '\uFF4C', '\uFF2D': '\uFF4D', '\uFF2E': '\uFF4E', '\uFF2F': '\uFF4F', '\uFF30': '\uFF50', '\uFF31': '\uFF51', '\uFF32': '\uFF52', '\uFF33': '\uFF53', '\uFF34': '\uFF54', '\uFF35': '\uFF55', '\uFF36': '\uFF56', '\uFF37': '\uFF57', '\uFF38': '\uFF58', '\uFF39': '\uFF59', '\uFF3A': '\uFF5A', '\uD801\uDC00': '\uD801\uDC28', '\uD801\uDC01': '\uD801\uDC29', '\uD801\uDC02': '\uD801\uDC2A', '\uD801\uDC03': '\uD801\uDC2B', '\uD801\uDC04': '\uD801\uDC2C', '\uD801\uDC05': '\uD801\uDC2D', '\uD801\uDC06': '\uD801\uDC2E', '\uD801\uDC07': '\uD801\uDC2F', '\uD801\uDC08': '\uD801\uDC30', '\uD801\uDC09': '\uD801\uDC31', '\uD801\uDC0A': '\uD801\uDC32', '\uD801\uDC0B': '\uD801\uDC33', '\uD801\uDC0C': '\uD801\uDC34', '\uD801\uDC0D': '\uD801\uDC35', '\uD801\uDC0E': '\uD801\uDC36', '\uD801\uDC0F': '\uD801\uDC37', '\uD801\uDC10': '\uD801\uDC38', '\uD801\uDC11': '\uD801\uDC39', '\uD801\uDC12': '\uD801\uDC3A', '\uD801\uDC13': '\uD801\uDC3B', '\uD801\uDC14': '\uD801\uDC3C', '\uD801\uDC15': '\uD801\uDC3D', '\uD801\uDC16': '\uD801\uDC3E', '\uD801\uDC17': '\uD801\uDC3F', '\uD801\uDC18': '\uD801\uDC40', '\uD801\uDC19': '\uD801\uDC41', '\uD801\uDC1A': '\uD801\uDC42', '\uD801\uDC1B': '\uD801\uDC43', '\uD801\uDC1C': '\uD801\uDC44', '\uD801\uDC1D': '\uD801\uDC45', '\uD801\uDC1E': '\uD801\uDC46', '\uD801\uDC1F': '\uD801\uDC47', '\uD801\uDC20': '\uD801\uDC48', '\uD801\uDC21': '\uD801\uDC49', '\uD801\uDC22': '\uD801\uDC4A', '\uD801\uDC23': '\uD801\uDC4B', '\uD801\uDC24': '\uD801\uDC4C', '\uD801\uDC25': '\uD801\uDC4D', '\uD801\uDC26': '\uD801\uDC4E', '\uD801\uDC27': '\uD801\uDC4F', '\uD806\uDCA0': '\uD806\uDCC0', '\uD806\uDCA1': '\uD806\uDCC1', '\uD806\uDCA2': '\uD806\uDCC2', '\uD806\uDCA3': '\uD806\uDCC3', '\uD806\uDCA4': '\uD806\uDCC4', '\uD806\uDCA5': '\uD806\uDCC5', '\uD806\uDCA6': '\uD806\uDCC6', '\uD806\uDCA7': '\uD806\uDCC7', '\uD806\uDCA8': '\uD806\uDCC8', '\uD806\uDCA9': '\uD806\uDCC9', '\uD806\uDCAA': '\uD806\uDCCA', '\uD806\uDCAB': '\uD806\uDCCB', '\uD806\uDCAC': '\uD806\uDCCC', '\uD806\uDCAD': '\uD806\uDCCD', '\uD806\uDCAE': '\uD806\uDCCE', '\uD806\uDCAF': '\uD806\uDCCF', '\uD806\uDCB0': '\uD806\uDCD0', '\uD806\uDCB1': '\uD806\uDCD1', '\uD806\uDCB2': '\uD806\uDCD2', '\uD806\uDCB3': '\uD806\uDCD3', '\uD806\uDCB4': '\uD806\uDCD4', '\uD806\uDCB5': '\uD806\uDCD5', '\uD806\uDCB6': '\uD806\uDCD6', '\uD806\uDCB7': '\uD806\uDCD7', '\uD806\uDCB8': '\uD806\uDCD8', '\uD806\uDCB9': '\uD806\uDCD9', '\uD806\uDCBA': '\uD806\uDCDA', '\uD806\uDCBB': '\uD806\uDCDB', '\uD806\uDCBC': '\uD806\uDCDC', '\uD806\uDCBD': '\uD806\uDCDD', '\uD806\uDCBE': '\uD806\uDCDE', '\uD806\uDCBF': '\uD806\uDCDF', '\xDF': 'ss', '\u0130': 'i\u0307', '\u0149': '\u02BCn', '\u01F0': 'j\u030C', '\u0390': '\u03B9\u0308\u0301', '\u03B0': '\u03C5\u0308\u0301', '\u0587': '\u0565\u0582', '\u1E96': 'h\u0331', '\u1E97': 't\u0308', '\u1E98': 'w\u030A', '\u1E99': 'y\u030A', '\u1E9A': 'a\u02BE', '\u1E9E': 'ss', '\u1F50': '\u03C5\u0313', '\u1F52': '\u03C5\u0313\u0300', '\u1F54': '\u03C5\u0313\u0301', '\u1F56': '\u03C5\u0313\u0342', '\u1F80': '\u1F00\u03B9', '\u1F81': '\u1F01\u03B9', '\u1F82': '\u1F02\u03B9', '\u1F83': '\u1F03\u03B9', '\u1F84': '\u1F04\u03B9', '\u1F85': '\u1F05\u03B9', '\u1F86': '\u1F06\u03B9', '\u1F87': '\u1F07\u03B9', '\u1F88': '\u1F00\u03B9', '\u1F89': '\u1F01\u03B9', '\u1F8A': '\u1F02\u03B9', '\u1F8B': '\u1F03\u03B9', '\u1F8C': '\u1F04\u03B9', '\u1F8D': '\u1F05\u03B9', '\u1F8E': '\u1F06\u03B9', '\u1F8F': '\u1F07\u03B9', '\u1F90': '\u1F20\u03B9', '\u1F91': '\u1F21\u03B9', '\u1F92': '\u1F22\u03B9', '\u1F93': '\u1F23\u03B9', '\u1F94': '\u1F24\u03B9', '\u1F95': '\u1F25\u03B9', '\u1F96': '\u1F26\u03B9', '\u1F97': '\u1F27\u03B9', '\u1F98': '\u1F20\u03B9', '\u1F99': '\u1F21\u03B9', '\u1F9A': '\u1F22\u03B9', '\u1F9B': '\u1F23\u03B9', '\u1F9C': '\u1F24\u03B9', '\u1F9D': '\u1F25\u03B9', '\u1F9E': '\u1F26\u03B9', '\u1F9F': '\u1F27\u03B9', '\u1FA0': '\u1F60\u03B9', '\u1FA1': '\u1F61\u03B9', '\u1FA2': '\u1F62\u03B9', '\u1FA3': '\u1F63\u03B9', '\u1FA4': '\u1F64\u03B9', '\u1FA5': '\u1F65\u03B9', '\u1FA6': '\u1F66\u03B9', '\u1FA7': '\u1F67\u03B9', '\u1FA8': '\u1F60\u03B9', '\u1FA9': '\u1F61\u03B9', '\u1FAA': '\u1F62\u03B9', '\u1FAB': '\u1F63\u03B9', '\u1FAC': '\u1F64\u03B9', '\u1FAD': '\u1F65\u03B9', '\u1FAE': '\u1F66\u03B9', '\u1FAF': '\u1F67\u03B9', '\u1FB2': '\u1F70\u03B9', '\u1FB3': '\u03B1\u03B9', '\u1FB4': '\u03AC\u03B9', '\u1FB6': '\u03B1\u0342', '\u1FB7': '\u03B1\u0342\u03B9', '\u1FBC': '\u03B1\u03B9', '\u1FC2': '\u1F74\u03B9', '\u1FC3': '\u03B7\u03B9', '\u1FC4': '\u03AE\u03B9', '\u1FC6': '\u03B7\u0342', '\u1FC7': '\u03B7\u0342\u03B9', '\u1FCC': '\u03B7\u03B9', '\u1FD2': '\u03B9\u0308\u0300', '\u1FD3': '\u03B9\u0308\u0301', '\u1FD6': '\u03B9\u0342', '\u1FD7': '\u03B9\u0308\u0342', '\u1FE2': '\u03C5\u0308\u0300', '\u1FE3': '\u03C5\u0308\u0301', '\u1FE4': '\u03C1\u0313', '\u1FE6': '\u03C5\u0342', '\u1FE7': '\u03C5\u0308\u0342', '\u1FF2': '\u1F7C\u03B9', '\u1FF3': '\u03C9\u03B9', '\u1FF4': '\u03CE\u03B9', '\u1FF6': '\u03C9\u0342', '\u1FF7': '\u03C9\u0342\u03B9', '\u1FFC': '\u03C9\u03B9', '\uFB00': 'ff', '\uFB01': 'fi', '\uFB02': 'fl', '\uFB03': 'ffi', '\uFB04': 'ffl', '\uFB05': 'st', '\uFB06': 'st', '\uFB13': '\u0574\u0576', '\uFB14': '\u0574\u0565', '\uFB15': '\u0574\u056B', '\uFB16': '\u057E\u0576', '\uFB17': '\u0574\u056D' };

	// Normalize reference label: collapse internal whitespace
	// to single space, remove leading/trailing whitespace, case fold.
	module.exports = function (string) {
	    return string.slice(1, string.length - 1).trim().replace(regex, function ($0) {
	        // Note: there is no need to check `hasOwnProperty($0)` here.
	        // If character not found in lookup table, it must be whitespace.
	        return map[$0] || ' ';
	    });
	};

/***/ }),
/* 51 */
/***/ (function(module, exports) {

	"use strict";

	// derived from https://github.com/mathiasbynens/String.fromCodePoint
	/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */

	if (String.fromCodePoint) {
	    module.exports = function (_) {
	        try {
	            return String.fromCodePoint(_);
	        } catch (e) {
	            if (e instanceof RangeError) {
	                return String.fromCharCode(0xFFFD);
	            }
	            throw e;
	        }
	    };
	} else {

	    var stringFromCharCode = String.fromCharCode;
	    var floor = Math.floor;
	    var fromCodePoint = function fromCodePoint() {
	        var MAX_SIZE = 0x4000;
	        var codeUnits = [];
	        var highSurrogate;
	        var lowSurrogate;
	        var index = -1;
	        var length = arguments.length;
	        if (!length) {
	            return '';
	        }
	        var result = '';
	        while (++index < length) {
	            var codePoint = Number(arguments[index]);
	            if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
	            codePoint < 0 || // not a valid Unicode code point
	            codePoint > 0x10FFFF || // not a valid Unicode code point
	            floor(codePoint) !== codePoint // not an integer
	            ) {
	                    return String.fromCharCode(0xFFFD);
	                }
	            if (codePoint <= 0xFFFF) {
	                // BMP code point
	                codeUnits.push(codePoint);
	            } else {
	                // Astral code point; split in surrogate halves
	                // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	                codePoint -= 0x10000;
	                highSurrogate = (codePoint >> 10) + 0xD800;
	                lowSurrogate = codePoint % 0x400 + 0xDC00;
	                codeUnits.push(highSurrogate, lowSurrogate);
	            }
	            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
	                result += stringFromCharCode.apply(null, codeUnits);
	                codeUnits.length = 0;
	            }
	        }
	        return result;
	    };
	    module.exports = fromCodePoint;
	}

/***/ }),
/* 52 */
/***/ (function(module, exports) {

	'use strict';

	/*! http://mths.be/repeat v0.2.0 by @mathias */
	if (!String.prototype.repeat) {
		(function () {
			'use strict'; // needed to support `apply`/`call` with `undefined`/`null`

			var defineProperty = function () {
				// IE 8 only supports `Object.defineProperty` on DOM elements
				try {
					var object = {};
					var $defineProperty = Object.defineProperty;
					var result = $defineProperty(object, object, object) && $defineProperty;
				} catch (error) {}
				return result;
			}();
			var repeat = function repeat(count) {
				if (this == null) {
					throw TypeError();
				}
				var string = String(this);
				// `ToInteger`
				var n = count ? Number(count) : 0;
				if (n != n) {
					// better `isNaN`
					n = 0;
				}
				// Account for out-of-bounds indices
				if (n < 0 || n == Infinity) {
					throw RangeError();
				}
				var result = '';
				while (n) {
					if (n % 2 == 1) {
						result += string;
					}
					if (n > 1) {
						string += string;
					}
					n >>= 1;
				}
				return result;
			};
			if (defineProperty) {
				defineProperty(String.prototype, 'repeat', {
					'value': repeat,
					'configurable': true,
					'writable': true
				});
			} else {
				String.prototype.repeat = repeat;
			}
		})();
	}

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var Renderer = __webpack_require__(54);

	var esc = __webpack_require__(38).escapeXml;

	var reUnsafeProtocol = /^javascript:|vbscript:|file:|data:/i;
	var reSafeDataProtocol = /^data:image\/(?:png|gif|jpeg|webp)/i;

	var potentiallyUnsafe = function potentiallyUnsafe(url) {
	    return reUnsafeProtocol.test(url) && !reSafeDataProtocol.test(url);
	};

	// Helper function to produce an HTML tag.
	function tag(name, attrs, selfclosing) {
	    if (this.disableTags > 0) {
	        return;
	    }
	    this.buffer += '<' + name;
	    if (attrs && attrs.length > 0) {
	        var i = 0;
	        var attrib;
	        while ((attrib = attrs[i]) !== undefined) {
	            this.buffer += ' ' + attrib[0] + '="' + attrib[1] + '"';
	            i++;
	        }
	    }
	    if (selfclosing) {
	        this.buffer += ' /';
	    }
	    this.buffer += '>';
	    this.lastOut = '>';
	}

	function HtmlRenderer(options) {
	    options = options || {};
	    // by default, soft breaks are rendered as newlines in HTML
	    options.softbreak = options.softbreak || '\n';
	    // set to "<br />" to make them hard breaks
	    // set to " " if you want to ignore line wrapping in source

	    this.disableTags = 0;
	    this.lastOut = "\n";
	    this.options = options;
	}

	/* Node methods */

	function text(node) {
	    this.out(node.literal);
	}

	function softbreak() {
	    this.lit(this.options.softbreak);
	}

	function linebreak() {
	    this.tag('br', [], true);
	    this.cr();
	}

	function link(node, entering) {
	    var attrs = this.attrs(node);
	    if (entering) {
	        if (!(this.options.safe && potentiallyUnsafe(node.destination))) {
	            attrs.push(['href', esc(node.destination, true)]);
	        }
	        if (node.title) {
	            attrs.push(['title', esc(node.title, true)]);
	        }
	        this.tag('a', attrs);
	    } else {
	        this.tag('/a');
	    }
	}

	function image(node, entering) {
	    if (entering) {
	        if (this.disableTags === 0) {
	            if (this.options.safe && potentiallyUnsafe(node.destination)) {
	                this.lit('<img src="" alt="');
	            } else {
	                this.lit('<img src="' + esc(node.destination, true) + '" alt="');
	            }
	        }
	        this.disableTags += 1;
	    } else {
	        this.disableTags -= 1;
	        if (this.disableTags === 0) {
	            if (node.title) {
	                this.lit('" title="' + esc(node.title, true));
	            }
	            this.lit('" />');
	        }
	    }
	}

	function emph(node, entering) {
	    this.tag(entering ? 'em' : '/em');
	}

	function strong(node, entering) {
	    this.tag(entering ? 'strong' : '/strong');
	}

	function paragraph(node, entering) {
	    var grandparent = node.parent.parent,
	        attrs = this.attrs(node);
	    if (grandparent !== null && grandparent.type === 'list') {
	        if (grandparent.listTight) {
	            return;
	        }
	    }
	    if (entering) {
	        this.cr();
	        this.tag('p', attrs);
	    } else {
	        this.tag('/p');
	        this.cr();
	    }
	}

	function heading(node, entering) {
	    var tagname = 'h' + node.level,
	        attrs = this.attrs(node);
	    if (entering) {
	        this.cr();
	        this.tag(tagname, attrs);
	    } else {
	        this.tag('/' + tagname);
	        this.cr();
	    }
	}

	function code(node) {
	    this.tag('code');
	    this.out(node.literal);
	    this.tag('/code');
	}

	function code_block(node) {
	    var info_words = node.info ? node.info.split(/\s+/) : [],
	        attrs = this.attrs(node);
	    if (info_words.length > 0 && info_words[0].length > 0) {
	        attrs.push(['class', 'language-' + esc(info_words[0], true)]);
	    }
	    this.cr();
	    this.tag('pre');
	    this.tag('code', attrs);
	    this.out(node.literal);
	    this.tag('/code');
	    this.tag('/pre');
	    this.cr();
	}

	function thematic_break(node) {
	    var attrs = this.attrs(node);
	    this.cr();
	    this.tag('hr', attrs, true);
	    this.cr();
	}

	function block_quote(node, entering) {
	    var attrs = this.attrs(node);
	    if (entering) {
	        this.cr();
	        this.tag('blockquote', attrs);
	        this.cr();
	    } else {
	        this.cr();
	        this.tag('/blockquote');
	        this.cr();
	    }
	}

	function list(node, entering) {
	    var tagname = node.listType === 'bullet' ? 'ul' : 'ol',
	        attrs = this.attrs(node);

	    if (entering) {
	        var start = node.listStart;
	        if (start !== null && start !== 1) {
	            attrs.push(['start', start.toString()]);
	        }
	        this.cr();
	        this.tag(tagname, attrs);
	        this.cr();
	    } else {
	        this.cr();
	        this.tag('/' + tagname);
	        this.cr();
	    }
	}

	function item(node, entering) {
	    var attrs = this.attrs(node);
	    if (entering) {
	        this.tag('li', attrs);
	    } else {
	        this.tag('/li');
	        this.cr();
	    }
	}

	function html_inline(node) {
	    if (this.options.safe) {
	        this.lit('<!-- raw HTML omitted -->');
	    } else {
	        this.lit(node.literal);
	    }
	}

	function html_block(node) {
	    this.cr();
	    if (this.options.safe) {
	        this.lit('<!-- raw HTML omitted -->');
	    } else {
	        this.lit(node.literal);
	    }
	    this.cr();
	}

	function custom_inline(node, entering) {
	    if (entering && node.onEnter) {
	        this.lit(node.onEnter);
	    } else if (!entering && node.onExit) {
	        this.lit(node.onExit);
	    }
	}

	function custom_block(node, entering) {
	    this.cr();
	    if (entering && node.onEnter) {
	        this.lit(node.onEnter);
	    } else if (!entering && node.onExit) {
	        this.lit(node.onExit);
	    }
	    this.cr();
	}

	/* Helper methods */

	function out(s) {
	    this.lit(esc(s, false));
	}

	function attrs(node) {
	    var att = [];
	    if (this.options.sourcepos) {
	        var pos = node.sourcepos;
	        if (pos) {
	            att.push(['data-sourcepos', String(pos[0][0]) + ':' + String(pos[0][1]) + '-' + String(pos[1][0]) + ':' + String(pos[1][1])]);
	        }
	    }
	    return att;
	}

	// quick browser-compatible inheritance
	HtmlRenderer.prototype = Object.create(Renderer.prototype);

	HtmlRenderer.prototype.text = text;
	HtmlRenderer.prototype.html_inline = html_inline;
	HtmlRenderer.prototype.html_block = html_block;
	HtmlRenderer.prototype.softbreak = softbreak;
	HtmlRenderer.prototype.linebreak = linebreak;
	HtmlRenderer.prototype.link = link;
	HtmlRenderer.prototype.image = image;
	HtmlRenderer.prototype.emph = emph;
	HtmlRenderer.prototype.strong = strong;
	HtmlRenderer.prototype.paragraph = paragraph;
	HtmlRenderer.prototype.heading = heading;
	HtmlRenderer.prototype.code = code;
	HtmlRenderer.prototype.code_block = code_block;
	HtmlRenderer.prototype.thematic_break = thematic_break;
	HtmlRenderer.prototype.block_quote = block_quote;
	HtmlRenderer.prototype.list = list;
	HtmlRenderer.prototype.item = item;
	HtmlRenderer.prototype.custom_inline = custom_inline;
	HtmlRenderer.prototype.custom_block = custom_block;

	HtmlRenderer.prototype.out = out;
	HtmlRenderer.prototype.tag = tag;
	HtmlRenderer.prototype.attrs = attrs;

	module.exports = HtmlRenderer;

/***/ }),
/* 54 */
/***/ (function(module, exports) {

	"use strict";

	function Renderer() {}

	/**
	 *  Walks the AST and calls member methods for each Node type.
	 *
	 *  @param ast {Node} The root of the abstract syntax tree.
	 */
	function render(ast) {
	  var walker = ast.walker(),
	      event,
	      type;

	  this.buffer = '';
	  this.lastOut = '\n';

	  while (event = walker.next()) {
	    type = event.node.type;
	    if (this[type]) {
	      this[type](event.node, event.entering);
	    }
	  }
	  return this.buffer;
	}

	/**
	 *  Concatenate a literal string to the buffer.
	 *
	 *  @param str {String} The string to concatenate.
	 */
	function lit(str) {
	  this.buffer += str;
	  this.lastOut = str;
	}

	function cr() {
	  if (this.lastOut !== '\n') {
	    this.lit('\n');
	  }
	}

	/**
	 *  Concatenate a string to the buffer possibly escaping the content.
	 *
	 *  Concrete renderer implementations should override this method.
	 *
	 *  @param str {String} The string to concatenate.
	 */
	function out(str) {
	  this.lit(str);
	}

	Renderer.prototype.render = render;
	Renderer.prototype.out = out;
	Renderer.prototype.lit = lit;
	Renderer.prototype.cr = cr;

	module.exports = Renderer;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var escapeXml = __webpack_require__(38).escapeXml;

	// Helper function to produce an XML tag.
	var tag = function tag(name, attrs, selfclosing) {
	    var result = '<' + name;
	    if (attrs && attrs.length > 0) {
	        var i = 0;
	        var attrib;
	        while ((attrib = attrs[i]) !== undefined) {
	            result += ' ' + attrib[0] + '="' + escapeXml(attrib[1]) + '"';
	            i++;
	        }
	    }
	    if (selfclosing) {
	        result += ' /';
	    }

	    result += '>';
	    return result;
	};

	var reXMLTag = /\<[^>]*\>/;

	var toTagName = function toTagName(s) {
	    return s.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
	};

	var renderNodes = function renderNodes(block) {

	    var attrs;
	    var tagname;
	    var walker = block.walker();
	    var event, node, entering;
	    var buffer = "";
	    var lastOut = "\n";
	    var disableTags = 0;
	    var indentLevel = 0;
	    var indent = '  ';
	    var container;
	    var selfClosing;
	    var nodetype;

	    var out = function out(s) {
	        if (disableTags > 0) {
	            buffer += s.replace(reXMLTag, '');
	        } else {
	            buffer += s;
	        }
	        lastOut = s;
	    };
	    var esc = this.escape;
	    var cr = function cr() {
	        if (lastOut !== '\n') {
	            buffer += '\n';
	            lastOut = '\n';
	            for (var i = indentLevel; i > 0; i--) {
	                buffer += indent;
	            }
	        }
	    };

	    var options = this.options;

	    if (options.time) {
	        console.time("rendering");
	    }

	    buffer += '<?xml version="1.0" encoding="UTF-8"?>\n';
	    buffer += '<!DOCTYPE document SYSTEM "CommonMark.dtd">\n';

	    while (event = walker.next()) {
	        entering = event.entering;
	        node = event.node;
	        nodetype = node.type;

	        container = node.isContainer;
	        selfClosing = nodetype === 'thematic_break' || nodetype === 'linebreak' || nodetype === 'softbreak';
	        tagname = toTagName(nodetype);

	        if (entering) {

	            attrs = [];

	            switch (nodetype) {
	                case 'document':
	                    attrs.push(['xmlns', 'http://commonmark.org/xml/1.0']);
	                    break;
	                case 'list':
	                    if (node.listType !== null) {
	                        attrs.push(['type', node.listType.toLowerCase()]);
	                    }
	                    if (node.listStart !== null) {
	                        attrs.push(['start', String(node.listStart)]);
	                    }
	                    if (node.listTight !== null) {
	                        attrs.push(['tight', node.listTight ? 'true' : 'false']);
	                    }
	                    var delim = node.listDelimiter;
	                    if (delim !== null) {
	                        var delimword = '';
	                        if (delim === '.') {
	                            delimword = 'period';
	                        } else {
	                            delimword = 'paren';
	                        }
	                        attrs.push(['delimiter', delimword]);
	                    }
	                    break;
	                case 'code_block':
	                    if (node.info) {
	                        attrs.push(['info', node.info]);
	                    }
	                    break;
	                case 'heading':
	                    attrs.push(['level', String(node.level)]);
	                    break;
	                case 'link':
	                case 'image':
	                    attrs.push(['destination', node.destination]);
	                    attrs.push(['title', node.title]);
	                    break;
	                case 'custom_inline':
	                case 'custom_block':
	                    attrs.push(['on_enter', node.onEnter]);
	                    attrs.push(['on_exit', node.onExit]);
	                    break;
	                default:
	                    break;
	            }
	            if (options.sourcepos) {
	                var pos = node.sourcepos;
	                if (pos) {
	                    attrs.push(['sourcepos', String(pos[0][0]) + ':' + String(pos[0][1]) + '-' + String(pos[1][0]) + ':' + String(pos[1][1])]);
	                }
	            }

	            cr();
	            out(tag(tagname, attrs, selfClosing));
	            if (container) {
	                indentLevel += 1;
	            } else if (!container && !selfClosing) {
	                var lit = node.literal;
	                if (lit) {
	                    out(esc(lit));
	                }
	                out(tag('/' + tagname));
	            }
	        } else {
	            indentLevel -= 1;
	            cr();
	            out(tag('/' + tagname));
	        }
	    }
	    if (options.time) {
	        console.timeEnd("rendering");
	    }
	    buffer += '\n';
	    return buffer;
	};

	// The XmlRenderer object.
	function XmlRenderer(options) {
	    return {
	        // default options:
	        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
	        // set to "<br />" to make them hard breaks
	        // set to " " if you want to ignore line wrapping in source
	        escape: escapeXml,
	        options: options || {},
	        render: renderNodes
	    };
	}

	module.exports = XmlRenderer;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var marked = __webpack_require__(57);

	var markdownTransform = function () {
	    // Stick reader and writer in a closure so they only get created once.

	    var renderer = new marked.Renderer();

	    marked.setOptions({
	        renderer: renderer,
	        gfm: true,
	        tables: true
	    });

	    return function (mimetype, data, document) {
	        var div = document.createElement("div");

	        div.innerHTML = marked(data);

	        return div;
	    };
	}();

	markdownTransform.mimetype = 'text/markdown';

	exports["default"] = markdownTransform;
	module.exports = exports["default"];
	//# sourceMappingURL=marked.transform.js.map

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function () {

	  /**
	   * Block-Level Grammar
	   */

	  var block = {
	    newline: /^\n+/,
	    code: /^( {4}[^\n]+\n*)+/,
	    fences: noop,
	    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	    heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	    nptable: noop,
	    lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	    blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	    list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	    html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	    table: noop,
	    paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	    text: /^[^\n]+/
	  };

	  block.bullet = /(?:[*+-]|\d+\.)/;
	  block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	  block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

	  block.list = replace(block.list)(/bull/g, block.bullet)('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')('def', '\\n+(?=' + block.def.source + ')')();

	  block.blockquote = replace(block.blockquote)('def', block.def)();

	  block._tag = '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	  block.html = replace(block.html)('comment', /<!--[\s\S]*?-->/)('closed', /<(tag)[\s\S]+?<\/\1>/)('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g, block._tag)();

	  block.paragraph = replace(block.paragraph)('hr', block.hr)('heading', block.heading)('lheading', block.lheading)('blockquote', block.blockquote)('tag', '<' + block._tag)('def', block.def)();

	  /**
	   * Normal Block Grammar
	   */

	  block.normal = merge({}, block);

	  /**
	   * GFM Block Grammar
	   */

	  block.gfm = merge({}, block.normal, {
	    fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
	    paragraph: /^/,
	    heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
	  });

	  block.gfm.paragraph = replace(block.paragraph)('(?!', '(?!' + block.gfm.fences.source.replace('\\1', '\\2') + '|' + block.list.source.replace('\\1', '\\3') + '|')();

	  /**
	   * GFM + Tables Block Grammar
	   */

	  block.tables = merge({}, block.gfm, {
	    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	  });

	  /**
	   * Block Lexer
	   */

	  function Lexer(options) {
	    this.tokens = [];
	    this.tokens.links = {};
	    this.options = options || marked.defaults;
	    this.rules = block.normal;

	    if (this.options.gfm) {
	      if (this.options.tables) {
	        this.rules = block.tables;
	      } else {
	        this.rules = block.gfm;
	      }
	    }
	  }

	  /**
	   * Expose Block Rules
	   */

	  Lexer.rules = block;

	  /**
	   * Static Lex Method
	   */

	  Lexer.lex = function (src, options) {
	    var lexer = new Lexer(options);
	    return lexer.lex(src);
	  };

	  /**
	   * Preprocessing
	   */

	  Lexer.prototype.lex = function (src) {
	    src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ').replace(/\u00a0/g, ' ').replace(/\u2424/g, '\n');

	    return this.token(src, true);
	  };

	  /**
	   * Lexing
	   */

	  Lexer.prototype.token = function (src, top, bq) {
	    var src = src.replace(/^ +$/gm, ''),
	        next,
	        loose,
	        cap,
	        bull,
	        b,
	        item,
	        space,
	        i,
	        l;

	    while (src) {
	      // newline
	      if (cap = this.rules.newline.exec(src)) {
	        src = src.substring(cap[0].length);
	        if (cap[0].length > 1) {
	          this.tokens.push({
	            type: 'space'
	          });
	        }
	      }

	      // code
	      if (cap = this.rules.code.exec(src)) {
	        src = src.substring(cap[0].length);
	        cap = cap[0].replace(/^ {4}/gm, '');
	        this.tokens.push({
	          type: 'code',
	          text: !this.options.pedantic ? cap.replace(/\n+$/, '') : cap
	        });
	        continue;
	      }

	      // fences (gfm)
	      if (cap = this.rules.fences.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'code',
	          lang: cap[2],
	          text: cap[3] || ''
	        });
	        continue;
	      }

	      // heading
	      if (cap = this.rules.heading.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'heading',
	          depth: cap[1].length,
	          text: cap[2]
	        });
	        continue;
	      }

	      // table no leading pipe (gfm)
	      if (top && (cap = this.rules.nptable.exec(src))) {
	        src = src.substring(cap[0].length);

	        item = {
	          type: 'table',
	          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	          cells: cap[3].replace(/\n$/, '').split('\n')
	        };

	        for (i = 0; i < item.align.length; i++) {
	          if (/^ *-+: *$/.test(item.align[i])) {
	            item.align[i] = 'right';
	          } else if (/^ *:-+: *$/.test(item.align[i])) {
	            item.align[i] = 'center';
	          } else if (/^ *:-+ *$/.test(item.align[i])) {
	            item.align[i] = 'left';
	          } else {
	            item.align[i] = null;
	          }
	        }

	        for (i = 0; i < item.cells.length; i++) {
	          item.cells[i] = item.cells[i].split(/ *\| */);
	        }

	        this.tokens.push(item);

	        continue;
	      }

	      // lheading
	      if (cap = this.rules.lheading.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'heading',
	          depth: cap[2] === '=' ? 1 : 2,
	          text: cap[1]
	        });
	        continue;
	      }

	      // hr
	      if (cap = this.rules.hr.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'hr'
	        });
	        continue;
	      }

	      // blockquote
	      if (cap = this.rules.blockquote.exec(src)) {
	        src = src.substring(cap[0].length);

	        this.tokens.push({
	          type: 'blockquote_start'
	        });

	        cap = cap[0].replace(/^ *> ?/gm, '');

	        // Pass `top` to keep the current
	        // "toplevel" state. This is exactly
	        // how markdown.pl works.
	        this.token(cap, top, true);

	        this.tokens.push({
	          type: 'blockquote_end'
	        });

	        continue;
	      }

	      // list
	      if (cap = this.rules.list.exec(src)) {
	        src = src.substring(cap[0].length);
	        bull = cap[2];

	        this.tokens.push({
	          type: 'list_start',
	          ordered: bull.length > 1
	        });

	        // Get each top-level item.
	        cap = cap[0].match(this.rules.item);

	        next = false;
	        l = cap.length;
	        i = 0;

	        for (; i < l; i++) {
	          item = cap[i];

	          // Remove the list item's bullet
	          // so it is seen as the next token.
	          space = item.length;
	          item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	          // Outdent whatever the
	          // list item contains. Hacky.
	          if (~item.indexOf('\n ')) {
	            space -= item.length;
	            item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
	          }

	          // Determine whether the next list item belongs here.
	          // Backpedal if it does not belong in this list.
	          if (this.options.smartLists && i !== l - 1) {
	            b = block.bullet.exec(cap[i + 1])[0];
	            if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	              src = cap.slice(i + 1).join('\n') + src;
	              i = l - 1;
	            }
	          }

	          // Determine whether item is loose or not.
	          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	          // for discount behavior.
	          loose = next || /\n\n(?!\s*$)/.test(item);
	          if (i !== l - 1) {
	            next = item.charAt(item.length - 1) === '\n';
	            if (!loose) loose = next;
	          }

	          this.tokens.push({
	            type: loose ? 'loose_item_start' : 'list_item_start'
	          });

	          // Recurse.
	          this.token(item, false, bq);

	          this.tokens.push({
	            type: 'list_item_end'
	          });
	        }

	        this.tokens.push({
	          type: 'list_end'
	        });

	        continue;
	      }

	      // html
	      if (cap = this.rules.html.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: this.options.sanitize ? 'paragraph' : 'html',
	          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
	          text: cap[0]
	        });
	        continue;
	      }

	      // def
	      if (!bq && top && (cap = this.rules.def.exec(src))) {
	        src = src.substring(cap[0].length);
	        this.tokens.links[cap[1].toLowerCase()] = {
	          href: cap[2],
	          title: cap[3]
	        };
	        continue;
	      }

	      // table (gfm)
	      if (top && (cap = this.rules.table.exec(src))) {
	        src = src.substring(cap[0].length);

	        item = {
	          type: 'table',
	          header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	          cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	        };

	        for (i = 0; i < item.align.length; i++) {
	          if (/^ *-+: *$/.test(item.align[i])) {
	            item.align[i] = 'right';
	          } else if (/^ *:-+: *$/.test(item.align[i])) {
	            item.align[i] = 'center';
	          } else if (/^ *:-+ *$/.test(item.align[i])) {
	            item.align[i] = 'left';
	          } else {
	            item.align[i] = null;
	          }
	        }

	        for (i = 0; i < item.cells.length; i++) {
	          item.cells[i] = item.cells[i].replace(/^ *\| *| *\| *$/g, '').split(/ *\| */);
	        }

	        this.tokens.push(item);

	        continue;
	      }

	      // top-level paragraph
	      if (top && (cap = this.rules.paragraph.exec(src))) {
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'paragraph',
	          text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
	        });
	        continue;
	      }

	      // text
	      if (cap = this.rules.text.exec(src)) {
	        // Top-level should never reach here.
	        src = src.substring(cap[0].length);
	        this.tokens.push({
	          type: 'text',
	          text: cap[0]
	        });
	        continue;
	      }

	      if (src) {
	        throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
	      }
	    }

	    return this.tokens;
	  };

	  /**
	   * Inline-Level Grammar
	   */

	  var inline = {
	    escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	    url: noop,
	    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	    link: /^!?\[(inside)\]\(href\)/,
	    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	    strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	    em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	    code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	    br: /^ {2,}\n(?!\s*$)/,
	    del: noop,
	    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	  };

	  inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	  inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	  inline.link = replace(inline.link)('inside', inline._inside)('href', inline._href)();

	  inline.reflink = replace(inline.reflink)('inside', inline._inside)();

	  /**
	   * Normal Inline Grammar
	   */

	  inline.normal = merge({}, inline);

	  /**
	   * Pedantic Inline Grammar
	   */

	  inline.pedantic = merge({}, inline.normal, {
	    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	  });

	  /**
	   * GFM Inline Grammar
	   */

	  inline.gfm = merge({}, inline.normal, {
	    escape: replace(inline.escape)('])', '~|])')(),
	    url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	    del: /^~~(?=\S)([\s\S]*?\S)~~/,
	    text: replace(inline.text)(']|', '~]|')('|', '|https?://|')()
	  });

	  /**
	   * GFM + Line Breaks Inline Grammar
	   */

	  inline.breaks = merge({}, inline.gfm, {
	    br: replace(inline.br)('{2,}', '*')(),
	    text: replace(inline.gfm.text)('{2,}', '*')()
	  });

	  /**
	   * Inline Lexer & Compiler
	   */

	  function InlineLexer(links, options) {
	    this.options = options || marked.defaults;
	    this.links = links;
	    this.rules = inline.normal;
	    this.renderer = this.options.renderer || new Renderer();
	    this.renderer.options = this.options;

	    if (!this.links) {
	      throw new Error('Tokens array requires a `links` property.');
	    }

	    if (this.options.gfm) {
	      if (this.options.breaks) {
	        this.rules = inline.breaks;
	      } else {
	        this.rules = inline.gfm;
	      }
	    } else if (this.options.pedantic) {
	      this.rules = inline.pedantic;
	    }
	  }

	  /**
	   * Expose Inline Rules
	   */

	  InlineLexer.rules = inline;

	  /**
	   * Static Lexing/Compiling Method
	   */

	  InlineLexer.output = function (src, links, options) {
	    var inline = new InlineLexer(links, options);
	    return inline.output(src);
	  };

	  /**
	   * Lexing/Compiling
	   */

	  InlineLexer.prototype.output = function (src) {
	    var out = '',
	        link,
	        text,
	        href,
	        cap;

	    while (src) {
	      // escape
	      if (cap = this.rules.escape.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += cap[1];
	        continue;
	      }

	      // autolink
	      if (cap = this.rules.autolink.exec(src)) {
	        src = src.substring(cap[0].length);
	        if (cap[2] === '@') {
	          text = cap[1].charAt(6) === ':' ? this.mangle(cap[1].substring(7)) : this.mangle(cap[1]);
	          href = this.mangle('mailto:') + text;
	        } else {
	          text = escape(cap[1]);
	          href = text;
	        }
	        out += this.renderer.link(href, null, text);
	        continue;
	      }

	      // url (gfm)
	      if (!this.inLink && (cap = this.rules.url.exec(src))) {
	        src = src.substring(cap[0].length);
	        text = escape(cap[1]);
	        href = text;
	        out += this.renderer.link(href, null, text);
	        continue;
	      }

	      // tag
	      if (cap = this.rules.tag.exec(src)) {
	        if (!this.inLink && /^<a /i.test(cap[0])) {
	          this.inLink = true;
	        } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	          this.inLink = false;
	        }
	        src = src.substring(cap[0].length);
	        out += this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]) : cap[0];
	        continue;
	      }

	      // link
	      if (cap = this.rules.link.exec(src)) {
	        src = src.substring(cap[0].length);
	        this.inLink = true;
	        out += this.outputLink(cap, {
	          href: cap[2],
	          title: cap[3]
	        });
	        this.inLink = false;
	        continue;
	      }

	      // reflink, nolink
	      if ((cap = this.rules.reflink.exec(src)) || (cap = this.rules.nolink.exec(src))) {
	        src = src.substring(cap[0].length);
	        link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	        link = this.links[link.toLowerCase()];
	        if (!link || !link.href) {
	          out += cap[0].charAt(0);
	          src = cap[0].substring(1) + src;
	          continue;
	        }
	        this.inLink = true;
	        out += this.outputLink(cap, link);
	        this.inLink = false;
	        continue;
	      }

	      // strong
	      if (cap = this.rules.strong.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.strong(this.output(cap[2] || cap[1]));
	        continue;
	      }

	      // em
	      if (cap = this.rules.em.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.em(this.output(cap[2] || cap[1]));
	        continue;
	      }

	      // code
	      if (cap = this.rules.code.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.codespan(escape(cap[2], true));
	        continue;
	      }

	      // br
	      if (cap = this.rules.br.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.br();
	        continue;
	      }

	      // del (gfm)
	      if (cap = this.rules.del.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.del(this.output(cap[1]));
	        continue;
	      }

	      // text
	      if (cap = this.rules.text.exec(src)) {
	        src = src.substring(cap[0].length);
	        out += this.renderer.text(escape(this.smartypants(cap[0])));
	        continue;
	      }

	      if (src) {
	        throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
	      }
	    }

	    return out;
	  };

	  /**
	   * Compile Link
	   */

	  InlineLexer.prototype.outputLink = function (cap, link) {
	    var href = escape(link.href),
	        title = link.title ? escape(link.title) : null;

	    return cap[0].charAt(0) !== '!' ? this.renderer.link(href, title, this.output(cap[1])) : this.renderer.image(href, title, escape(cap[1]));
	  };

	  /**
	   * Smartypants Transformations
	   */

	  InlineLexer.prototype.smartypants = function (text) {
	    if (!this.options.smartypants) return text;
	    return text
	    // em-dashes
	    .replace(/---/g, '\u2014'
	    // en-dashes
	    ).replace(/--/g, '\u2013'
	    // opening singles
	    ).replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018'
	    // closing singles & apostrophes
	    ).replace(/'/g, '\u2019'
	    // opening doubles
	    ).replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201C'
	    // closing doubles
	    ).replace(/"/g, '\u201D'
	    // ellipses
	    ).replace(/\.{3}/g, '\u2026');
	  };

	  /**
	   * Mangle Links
	   */

	  InlineLexer.prototype.mangle = function (text) {
	    if (!this.options.mangle) return text;
	    var out = '',
	        l = text.length,
	        i = 0,
	        ch;

	    for (; i < l; i++) {
	      ch = text.charCodeAt(i);
	      if (Math.random() > 0.5) {
	        ch = 'x' + ch.toString(16);
	      }
	      out += '&#' + ch + ';';
	    }

	    return out;
	  };

	  /**
	   * Renderer
	   */

	  function Renderer(options) {
	    this.options = options || {};
	  }

	  Renderer.prototype.code = function (code, lang, escaped) {
	    if (this.options.highlight) {
	      var out = this.options.highlight(code, lang);
	      if (out != null && out !== code) {
	        escaped = true;
	        code = out;
	      }
	    }

	    if (!lang) {
	      return '<pre><code>' + (escaped ? code : escape(code, true)) + '\n</code></pre>';
	    }

	    return '<pre><code class="' + this.options.langPrefix + escape(lang, true) + '">' + (escaped ? code : escape(code, true)) + '\n</code></pre>\n';
	  };

	  Renderer.prototype.blockquote = function (quote) {
	    return '<blockquote>\n' + quote + '</blockquote>\n';
	  };

	  Renderer.prototype.html = function (html) {
	    return html;
	  };

	  Renderer.prototype.heading = function (text, level, raw) {
	    return '<h' + level + ' id="' + this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-') + '">' + text + '</h' + level + '>\n';
	  };

	  Renderer.prototype.hr = function () {
	    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	  };

	  Renderer.prototype.list = function (body, ordered) {
	    var type = ordered ? 'ol' : 'ul';
	    return '<' + type + '>\n' + body + '</' + type + '>\n';
	  };

	  Renderer.prototype.listitem = function (text) {
	    return '<li>' + text + '</li>\n';
	  };

	  Renderer.prototype.paragraph = function (text) {
	    return '<p>' + text + '</p>\n';
	  };

	  Renderer.prototype.table = function (header, body) {
	    return '<table>\n' + '<thead>\n' + header + '</thead>\n' + '<tbody>\n' + body + '</tbody>\n' + '</table>\n';
	  };

	  Renderer.prototype.tablerow = function (content) {
	    return '<tr>\n' + content + '</tr>\n';
	  };

	  Renderer.prototype.tablecell = function (content, flags) {
	    var type = flags.header ? 'th' : 'td';
	    var tag = flags.align ? '<' + type + ' style="text-align:' + flags.align + '">' : '<' + type + '>';
	    return tag + content + '</' + type + '>\n';
	  };

	  // span level renderer
	  Renderer.prototype.strong = function (text) {
	    return '<strong>' + text + '</strong>';
	  };

	  Renderer.prototype.em = function (text) {
	    return '<em>' + text + '</em>';
	  };

	  Renderer.prototype.codespan = function (text) {
	    return '<code>' + text + '</code>';
	  };

	  Renderer.prototype.br = function () {
	    return this.options.xhtml ? '<br/>' : '<br>';
	  };

	  Renderer.prototype.del = function (text) {
	    return '<del>' + text + '</del>';
	  };

	  Renderer.prototype.link = function (href, title, text) {
	    if (this.options.sanitize) {
	      try {
	        var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, '').toLowerCase();
	      } catch (e) {
	        return '';
	      }
	      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	        return '';
	      }
	    }
	    var out = '<a href="' + href + '"';
	    if (title) {
	      out += ' title="' + title + '"';
	    }
	    out += '>' + text + '</a>';
	    return out;
	  };

	  Renderer.prototype.image = function (href, title, text) {
	    var out = '<img src="' + href + '" alt="' + text + '"';
	    if (title) {
	      out += ' title="' + title + '"';
	    }
	    out += this.options.xhtml ? '/>' : '>';
	    return out;
	  };

	  Renderer.prototype.text = function (text) {
	    return text;
	  };

	  /**
	   * Parsing & Compiling
	   */

	  function Parser(options) {
	    this.tokens = [];
	    this.token = null;
	    this.options = options || marked.defaults;
	    this.options.renderer = this.options.renderer || new Renderer();
	    this.renderer = this.options.renderer;
	    this.renderer.options = this.options;
	  }

	  /**
	   * Static Parse Method
	   */

	  Parser.parse = function (src, options, renderer) {
	    var parser = new Parser(options, renderer);
	    return parser.parse(src);
	  };

	  /**
	   * Parse Loop
	   */

	  Parser.prototype.parse = function (src) {
	    this.inline = new InlineLexer(src.links, this.options, this.renderer);
	    this.tokens = src.reverse();

	    var out = '';
	    while (this.next()) {
	      out += this.tok();
	    }

	    return out;
	  };

	  /**
	   * Next Token
	   */

	  Parser.prototype.next = function () {
	    return this.token = this.tokens.pop();
	  };

	  /**
	   * Preview Next Token
	   */

	  Parser.prototype.peek = function () {
	    return this.tokens[this.tokens.length - 1] || 0;
	  };

	  /**
	   * Parse Text Tokens
	   */

	  Parser.prototype.parseText = function () {
	    var body = this.token.text;

	    while (this.peek().type === 'text') {
	      body += '\n' + this.next().text;
	    }

	    return this.inline.output(body);
	  };

	  /**
	   * Parse Current Token
	   */

	  Parser.prototype.tok = function () {
	    switch (this.token.type) {
	      case 'space':
	        {
	          return '';
	        }
	      case 'hr':
	        {
	          return this.renderer.hr();
	        }
	      case 'heading':
	        {
	          return this.renderer.heading(this.inline.output(this.token.text), this.token.depth, this.token.text);
	        }
	      case 'code':
	        {
	          return this.renderer.code(this.token.text, this.token.lang, this.token.escaped);
	        }
	      case 'table':
	        {
	          var header = '',
	              body = '',
	              i,
	              row,
	              cell,
	              flags,
	              j;

	          // header
	          cell = '';
	          for (i = 0; i < this.token.header.length; i++) {
	            flags = { header: true, align: this.token.align[i] };
	            cell += this.renderer.tablecell(this.inline.output(this.token.header[i]), { header: true, align: this.token.align[i] });
	          }
	          header += this.renderer.tablerow(cell);

	          for (i = 0; i < this.token.cells.length; i++) {
	            row = this.token.cells[i];

	            cell = '';
	            for (j = 0; j < row.length; j++) {
	              cell += this.renderer.tablecell(this.inline.output(row[j]), { header: false, align: this.token.align[j] });
	            }

	            body += this.renderer.tablerow(cell);
	          }
	          return this.renderer.table(header, body);
	        }
	      case 'blockquote_start':
	        {
	          var body = '';

	          while (this.next().type !== 'blockquote_end') {
	            body += this.tok();
	          }

	          return this.renderer.blockquote(body);
	        }
	      case 'list_start':
	        {
	          var body = '',
	              ordered = this.token.ordered;

	          while (this.next().type !== 'list_end') {
	            body += this.tok();
	          }

	          return this.renderer.list(body, ordered);
	        }
	      case 'list_item_start':
	        {
	          var body = '';

	          while (this.next().type !== 'list_item_end') {
	            body += this.token.type === 'text' ? this.parseText() : this.tok();
	          }

	          return this.renderer.listitem(body);
	        }
	      case 'loose_item_start':
	        {
	          var body = '';

	          while (this.next().type !== 'list_item_end') {
	            body += this.tok();
	          }

	          return this.renderer.listitem(body);
	        }
	      case 'html':
	        {
	          var html = !this.token.pre && !this.options.pedantic ? this.inline.output(this.token.text) : this.token.text;
	          return this.renderer.html(html);
	        }
	      case 'paragraph':
	        {
	          return this.renderer.paragraph(this.inline.output(this.token.text));
	        }
	      case 'text':
	        {
	          return this.renderer.paragraph(this.parseText());
	        }
	    }
	  };

	  /**
	   * Helpers
	   */

	  function escape(html, encode) {
	    return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	  }

	  function unescape(html) {
	    return html.replace(/&([#\w]+);/g, function (_, n) {
	      n = n.toLowerCase();
	      if (n === 'colon') return ':';
	      if (n.charAt(0) === '#') {
	        return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
	      }
	      return '';
	    });
	  }

	  function replace(regex, opt) {
	    regex = regex.source;
	    opt = opt || '';
	    return function self(name, val) {
	      if (!name) return new RegExp(regex, opt);
	      val = val.source || val;
	      val = val.replace(/(^|[^\[])\^/g, '$1');
	      regex = regex.replace(name, val);
	      return self;
	    };
	  }

	  function noop() {}
	  noop.exec = noop;

	  function merge(obj) {
	    var i = 1,
	        target,
	        key;

	    for (; i < arguments.length; i++) {
	      target = arguments[i];
	      for (key in target) {
	        if (Object.prototype.hasOwnProperty.call(target, key)) {
	          obj[key] = target[key];
	        }
	      }
	    }

	    return obj;
	  }

	  /**
	   * Marked
	   */

	  function marked(src, opt, callback) {
	    if (callback || typeof opt === 'function') {
	      if (!callback) {
	        callback = opt;
	        opt = null;
	      }

	      opt = merge({}, marked.defaults, opt || {});

	      var highlight = opt.highlight,
	          tokens,
	          pending,
	          i = 0;

	      try {
	        tokens = Lexer.lex(src, opt);
	      } catch (e) {
	        return callback(e);
	      }

	      pending = tokens.length;

	      var done = function done(err) {
	        if (err) {
	          opt.highlight = highlight;
	          return callback(err);
	        }

	        var out;

	        try {
	          out = Parser.parse(tokens, opt);
	        } catch (e) {
	          err = e;
	        }

	        opt.highlight = highlight;

	        return err ? callback(err) : callback(null, out);
	      };

	      if (!highlight || highlight.length < 3) {
	        return done();
	      }

	      delete opt.highlight;

	      if (!pending) return done();

	      for (; i < tokens.length; i++) {
	        (function (token) {
	          if (token.type !== 'code') {
	            return --pending || done();
	          }
	          return highlight(token.text, token.lang, function (err, code) {
	            if (err) return done(err);
	            if (code == null || code === token.text) {
	              return --pending || done();
	            }
	            token.text = code;
	            token.escaped = true;
	            --pending || done();
	          });
	        })(tokens[i]);
	      }

	      return;
	    }
	    try {
	      if (opt) opt = merge({}, marked.defaults, opt);
	      return Parser.parse(Lexer.lex(src, opt), opt);
	    } catch (e) {
	      e.message += '\nPlease report this to https://github.com/chjj/marked.';
	      if ((opt || marked.defaults).silent) {
	        return '<p>An error occured:</p><pre>' + escape(e.message + '', true) + '</pre>';
	      }
	      throw e;
	    }
	  }

	  /**
	   * Options
	   */

	  marked.options = marked.setOptions = function (opt) {
	    merge(marked.defaults, opt);
	    return marked;
	  };

	  marked.defaults = {
	    gfm: true,
	    tables: true,
	    breaks: false,
	    pedantic: false,
	    sanitize: false,
	    sanitizer: null,
	    mangle: true,
	    smartLists: false,
	    silent: false,
	    highlight: null,
	    langPrefix: 'lang-',
	    smartypants: false,
	    headerPrefix: '',
	    renderer: new Renderer(),
	    xhtml: false
	  };

	  /**
	   * Expose
	   */

	  marked.Parser = Parser;
	  marked.parser = Parser.parse;

	  marked.Renderer = Renderer;

	  marked.Lexer = Lexer;
	  marked.lexer = Lexer.lex;

	  marked.InlineLexer = InlineLexer;
	  marked.inlineLexer = InlineLexer.output;

	  marked.parse = marked;

	  if (typeof module !== 'undefined' && ( false ? 'undefined' : _typeof(exports)) === 'object') {
	    module.exports = marked;
	  } else if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return marked;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    this.marked = marked;
	  }
	}).call(function () {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ })
/******/ ]);