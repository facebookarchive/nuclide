'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseText;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _react = _interopRequireWildcard(require('react'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const DIFF_PATTERN = '\\b[dD][1-9][0-9]{5,}\\b';
const TASK_PATTERN = '\\b[tT]\\d+\\b';
const FILE_PATH_PATTERN = '([/A-Za-z_-s0-9.-]+[.][A-Za-z]+)(:([0-9]+))?(:([0-9]+))?';
const CLICKABLE_PATTERNS = `(${DIFF_PATTERN})|(${TASK_PATTERN})|(${(_string || _load_string()).URL_REGEX.source})|${FILE_PATH_PATTERN}`;
const CLICKABLE_RE = new RegExp(CLICKABLE_PATTERNS, 'g');

function toString(value) {
  return typeof value === 'string' ? value : '';
}

/**
 * Parse special entities into links. In the future, it would be great to add a service so that we
 * could add new clickable things and to allow providers to mark specific ranges as links to things
 * that only they can know (e.g. relative paths output in BUCK messages). For now, however, we'll
 * just use some pattern settings and hardcode the patterns we care about.
 */
function parseText(text) {
  const chunks = [];
  let lastIndex = 0;
  let index = 0;
  while (true) {
    const match = CLICKABLE_RE.exec(text);
    if (match == null) {
      break;
    }

    const matchedText = match[0];

    // Add all the text since our last match.
    chunks.push(text.slice(lastIndex, CLICKABLE_RE.lastIndex - matchedText.length));
    lastIndex = CLICKABLE_RE.lastIndex;

    let href;
    let handleOnClick;
    if (match[1] != null) {
      // It's a diff
      const url = toString((_featureConfig || _load_featureConfig()).default.get('atom-ide-console.diffUrlPattern'));
      if (url !== '') {
        href = url.replace('%s', matchedText);
      }
    } else if (match[2] != null) {
      // It's a task
      const url = toString((_featureConfig || _load_featureConfig()).default.get('atom-ide-console.taskUrlPattern'));
      if (url !== '') {
        href = url.replace('%s', matchedText.slice(1));
      }
    } else if (match[3] != null) {
      // It's a URL
      href = matchedText;
    } else if (match[5] != null) {
      // It's a file path
      href = '#';
      handleOnClick = () => {
        (0, (_goToLocation || _load_goToLocation()).goToLocation)(match[5], {
          line: match[7] ? parseInt(match[7], 10) - 1 : 0,
          column: match[9] ? parseInt(match[9], 10) - 1 : 0
        });
      };
    }

    chunks.push(
    // flowlint-next-line sketchy-null-string:off
    href ? _react.createElement(
      'a',
      {
        key: `r${index}`,
        href: href,
        target: '_blank',
        onClick: handleOnClick },
      matchedText
    ) : matchedText);

    index++;
  }

  // Add any remaining text.
  chunks.push(text.slice(lastIndex));

  return chunks;
}