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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _urlregexp = require('urlregexp');

var _urlregexp2 = _interopRequireDefault(_urlregexp);

exports.default = _asyncToGenerator(function* (textEditor, text, range) {
  // The match is an array that also has an index property, something that

  var match = _urlregexp2.default.exec(text);
  if (match == null) {
    return null;
  }

  _urlregexp2.default.lastIndex = 0;

  var url = match[0];
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
        // Now that we match urls like 'facebook.com', we have to prepend
        // http:// to them for them to open properly.
        validUrl = 'http://' + url;
      }
      _shell2.default.openExternal(validUrl);
    }
  };
});
module.exports = exports.default;
// Flow does not appear to understand.