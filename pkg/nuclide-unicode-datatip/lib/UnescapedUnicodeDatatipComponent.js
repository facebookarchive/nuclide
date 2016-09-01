Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = makeUnescapedUnicodeDatatipComponent;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Unicode2;

function _Unicode() {
  return _Unicode2 = require('./Unicode');
}

function makeUnescapedUnicodeDatatipComponent(codePoints) {
  return function () {
    return (_reactForAtom2 || _reactForAtom()).React.createElement(UnescapedUnicodeDatatipComponent, { codePoints: codePoints });
  };
}

var UnescapedUnicodeDatatipComponent = function UnescapedUnicodeDatatipComponent(props) {
  var text = props.codePoints.map(function (cp) {
    return String.fromCodePoint(cp);
  }).join('');
  var charsWithCodePoints = props.codePoints.map(function (cp, i) {
    var hex = (0, (_Unicode2 || _Unicode()).zeroPaddedHex)(cp, 4);
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      {
        className: 'nuclide-unicode-escapes-unescaped-char',
        key: i,
        title: 'U+' + hex },
      String.fromCodePoint(cp),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-unicode-escapes-unescaped-char-code-point' },
        hex
      )
    );
  });
  var result = (_reactForAtom2 || _reactForAtom()).React.createElement(
    'table',
    { className: 'nuclide-unicode-escapes-unescaped-datatip' },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'tr',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'td',
        null,
        'Visual'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'td',
        { className: 'nuclide-unicode-escapes-string' },
        text
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'tr',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'td',
        null,
        'Logical'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'td',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-unicode-escapes-string' },
          charsWithCodePoints
        )
      )
    )
  );
  return result;
};
module.exports = exports.default;