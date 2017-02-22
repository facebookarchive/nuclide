'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _electron = require('electron');

var _urlregexp;

function _load_urlregexp() {
  return _urlregexp = _interopRequireDefault(require('urlregexp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// urlregexp will match trailing: ' | " | '. | ', | ". | ",
// These are most likely not part of the url, but just junk that got caught.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const trailingJunkRe = /['"][.,]?$/;

class HyperclickProviderHelpers {
  static getSuggestionForWord(textEditor, text, range) {
    return (0, _asyncToGenerator.default)(function* () {
      // The match is an array that also has an index property, something that
      const match = (_urlregexp || _load_urlregexp()).default.exec(text);
      if (match == null) {
        return null;
      }

      (_urlregexp || _load_urlregexp()).default.lastIndex = 0;

      const url = match[0].replace(trailingJunkRe, '');
      const index = match.index;
      const matchLength = url.length;

      // Update the range to include only what was matched
      const urlRange = new _atom.Range([range.start.row, range.start.column + index], [range.end.row, range.start.column + index + matchLength]);

      return {
        range: urlRange,
        callback() {
          let validUrl;
          if (url.startsWith('http://') || url.startsWith('https://')) {
            validUrl = url;
          } else {
            // Now that we match urls like 'facebook.com', we have to prepend
            // http:// to them for them to open properly.
            validUrl = 'http://' + url;
          }
          _electron.shell.openExternal(validUrl);
        }
      };
    })();
  }
}
exports.default = HyperclickProviderHelpers;