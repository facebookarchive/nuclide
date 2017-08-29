'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeUnescapedUnicodeDatatipComponent;

var _react = _interopRequireWildcard(require('react'));

var _Unicode;

function _load_Unicode() {
  return _Unicode = require('./Unicode');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function makeUnescapedUnicodeDatatipComponent(codePoints) {
  return () => _react.createElement(UnescapedUnicodeDatatipComponent, { codePoints: codePoints });
}

const UnescapedUnicodeDatatipComponent = props => {
  const text = props.codePoints.map(cp => String.fromCodePoint(cp)).join('');
  const charsWithCodePoints = props.codePoints.map((cp, i) => {
    const hex = (0, (_Unicode || _load_Unicode()).zeroPaddedHex)(cp, 4);
    return _react.createElement(
      'div',
      {
        className: 'nuclide-unicode-escapes-unescaped-char',
        key: i,
        title: 'U+' + hex },
      String.fromCodePoint(cp),
      _react.createElement(
        'div',
        { className: 'nuclide-unicode-escapes-unescaped-char-code-point' },
        hex
      )
    );
  });
  const result = _react.createElement(
    'table',
    { className: 'nuclide-unicode-escapes-unescaped-datatip' },
    _react.createElement(
      'tr',
      null,
      _react.createElement(
        'td',
        null,
        'Visual'
      ),
      _react.createElement(
        'td',
        { className: 'nuclide-unicode-escapes-string' },
        text
      )
    ),
    _react.createElement(
      'tr',
      null,
      _react.createElement(
        'td',
        null,
        'Logical'
      ),
      _react.createElement(
        'td',
        null,
        _react.createElement(
          'div',
          { className: 'nuclide-unicode-escapes-string' },
          charsWithCodePoints
        )
      )
    )
  );
  return result;
};