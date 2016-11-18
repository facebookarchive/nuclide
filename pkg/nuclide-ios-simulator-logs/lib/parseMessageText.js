'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.parseMessageText = parseMessageText;

const TAG_RE = /\[([^[\]]*)]/g;
const TAG_PATTERN = '\\[[^\\[\\]]*\\]'; // The same as TAG_RE but without capturing, for embedding.
const DATETIME_PATTERN = '\\d{4}-\\d{2}-\\d{2} \\d+:\\d+:\\d+\\.\\d+';
const PARTS_PATTERN = `${ DATETIME_PATTERN }( (?:${ TAG_PATTERN })+ ?)?([\\s\\S]*)`;
const PARTS_RE = new RegExp(PARTS_PATTERN);

function parseMessageText(raw) {
  const messageMatch = raw.match(PARTS_RE);

  if (messageMatch == null) {
    return {
      text: raw,
      level: null,
      tags: null
    };
  }

  var _messageMatch = _slicedToArray(messageMatch, 3);

  const tagsPart = _messageMatch[1],
        text = _messageMatch[2];

  const tags = [];
  let level;
  let tagMatch;
  while (tagMatch = TAG_RE.exec(tagsPart)) {
    const tag = tagMatch[1];
    switch (tag) {
      case 'info':
      case 'log':
      case 'error':
      case 'debug':
        level = tag;
        break;
      case 'warn':
        level = 'warning';
        break;
      default:
        if (tag !== '') {
          tags.push(tag);
        }
    }
  }

  return { text: text, level: level, tags: tags };
}