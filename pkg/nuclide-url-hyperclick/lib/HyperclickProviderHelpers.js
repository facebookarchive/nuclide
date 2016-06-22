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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _shell2;

function _shell() {
  return _shell2 = _interopRequireDefault(require('shell'));
}

var _urlregexp2;

function _urlregexp() {
  return _urlregexp2 = _interopRequireDefault(require('urlregexp'));
}

var HyperclickProviderHelpers = (function () {
  function HyperclickProviderHelpers() {
    _classCallCheck(this, HyperclickProviderHelpers);
  }

  _createClass(HyperclickProviderHelpers, null, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      // The match is an array that also has an index property, something that

      var match = (_urlregexp2 || _urlregexp()).default.exec(text);
      if (match == null) {
        return null;
      }

      (_urlregexp2 || _urlregexp()).default.lastIndex = 0;

      var url = match[0];
      var index = match.index;
      var matchLength = url.length;

      // Update the range to include only what was matched
      var urlRange = new (_atom2 || _atom()).Range([range.start.row, range.start.column + index], [range.end.row, range.start.column + index + matchLength]);

      return {
        range: urlRange,
        callback: function callback() {
          var validUrl = undefined;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            validUrl = url;
          } else {
            // Now that we match urls like 'facebook.com', we have to prepend
            // http:// to them for them to open properly.
            validUrl = 'http://' + url;
          }
          (_shell2 || _shell()).default.openExternal(validUrl);
        }
      };
    })
  }]);

  return HyperclickProviderHelpers;
})();

exports.default = HyperclickProviderHelpers;
module.exports = exports.default;
// Flow does not appear to understand.