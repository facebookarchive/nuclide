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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _Unicode;

function _load_Unicode() {
  return _Unicode = require('./Unicode');
}

function makeUnescapedUnicodeDatatipComponent(codePoints) {
  return function () {
    return (_reactForAtom || _load_reactForAtom()).React.createElement(UnescapedUnicodeDatatipComponent, { codePoints: codePoints });
  };
}

var UnescapedUnicodeDatatipComponent = function UnescapedUnicodeDatatipComponent(props) {
  var text = props.codePoints.map(function (cp) {
    return String.fromCodePoint(cp);
  }).join('');
  var charsWithCodePoints = props.codePoints.map(function (cp, i) {
    var hex = (0, (_Unicode || _load_Unicode()).zeroPaddedHex)(cp, 4);
    return (_reactForAtom || _load_reactForAtom()).React.createElement(
      'div',
      {
        className: 'nuclide-unicode-escapes-unescaped-char',
        key: i,
        title: 'U+' + hex },
      String.fromCodePoint(cp),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-unicode-escapes-unescaped-char-code-point' },
        hex
      )
    );
  });
  var result = (_reactForAtom || _load_reactForAtom()).React.createElement(
    'table',
    { className: 'nuclide-unicode-escapes-unescaped-datatip' },
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'tr',
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'td',
        null,
        'Visual'
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'td',
        { className: 'nuclide-unicode-escapes-string' },
        text
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      'tr',
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'td',
        null,
        'Logical'
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'td',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
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