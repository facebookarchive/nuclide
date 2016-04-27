Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

// "urlregexp" uses the "g" flag. Since we only care about the first result,
// we make a copy of it w/o the "g" flag so we don't have to reset `lastIndex`
// after every use.
var urlregexp = RegExp(require('urlregexp').source);

var HyperclickProvider = (function () {
  function HyperclickProvider() {
    _classCallCheck(this, HyperclickProvider);

    this.wordRegExp = /[^\s]+/g;
    // Allow all language-specific providers to take priority.
    this.priority = 5;
    this.providerName = 'url-hyperclick';
  }

  _createClass(HyperclickProvider, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      // The match is an array that also has an index property, something that Flow does not appear to

      var match = text.match(urlregexp);
      if (match == null) {
        return null;
      }

      var _match = _slicedToArray(match, 1);

      var url = _match[0];

      var index = match.index;
      var matchLength = url.length;

      // Update the range to include only what was matched
      var urlRange = new _atom.Range([range.start.row, range.start.column + index], [range.end.row, range.start.column + index + matchLength]);

      return {
        range: urlRange,
        callback: function callback() {
          var validUrl = undefined;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            validUrl = url;
          } else {
            // Now that we match urls like 'facebook.com', we have to prepend http:// to them for them to
            // open properly.
            validUrl = 'http://' + url;
          }
          _shell2['default'].openExternal(validUrl);
        }
      };
    })
  }]);

  return HyperclickProvider;
})();

exports.HyperclickProvider = HyperclickProvider;
// understand.