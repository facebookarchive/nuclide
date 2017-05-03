'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.matchUrl = matchUrl;

var _atom = require('atom');

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Originally copied from:
// http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
// But adopted to match `www.` urls as well as `https?` urls
// and `!` as acceptable url piece.
// Then optimized with https://www.npmjs.com/package/regexp-tree
// eslint-disable-next-line max-len
const URL_REGEX = /(?:https?:\/\/(www.)?[-\w@:%.+~#=]{2,256}.[a-z]{2,6}\b([-\w@:%+.~#?&/=!]*))|(?:(www.)[-\w@:%.+~#=]{2,256}.[a-z]{2,6}\b([-\w@:%+.~#?&/=!]*))/; /**
                                                                                                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                  * All rights reserved.
                                                                                                                                                                  *
                                                                                                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                  * the root directory of this source tree.
                                                                                                                                                                  *
                                                                                                                                                                  * 
                                                                                                                                                                  * @format
                                                                                                                                                                  */

const TRAILING_JUNK_REGEX = /[.,]?$/;

// Exported for testing.
function matchUrl(text) {
  const match = URL_REGEX.exec(text);
  if (match == null) {
    return null;
  }
  URL_REGEX.lastIndex = 0;
  return {
    index: match.index,
    url: match[0].replace(TRAILING_JUNK_REGEX, '')
  };
}

class HyperclickProviderHelpers {
  static getSuggestionForWord(textEditor, text, range) {
    return (0, _asyncToGenerator.default)(function* () {
      // The match is an array that also has an index property, something that
      // Flow does not appear to understand.
      const match = matchUrl(text);
      if (match == null) {
        return null;
      }

      const { index, url } = match;
      const matchLength = url.length;

      // Update the range to include only what was matched
      const urlRange = new _atom.Range([range.start.row, range.start.column + index], [range.end.row, range.start.column + index + matchLength]);

      return {
        range: urlRange,
        callback() {
          _electron.shell.openExternal(url);
        }
      };
    })();
  }
}
exports.default = HyperclickProviderHelpers;