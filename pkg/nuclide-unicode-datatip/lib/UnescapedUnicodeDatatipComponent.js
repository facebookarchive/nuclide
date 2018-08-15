"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeUnescapedUnicodeDatatipComponent;

var React = _interopRequireWildcard(require("react"));

function _Unicode() {
  const data = require("./Unicode");

  _Unicode = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  return () => React.createElement(UnescapedUnicodeDatatipComponent, {
    codePoints: codePoints
  });
}

const UnescapedUnicodeDatatipComponent = props => {
  const text = props.codePoints.map(cp => String.fromCodePoint(cp)).join('');
  const charsWithCodePoints = props.codePoints.map((cp, i) => {
    const hex = (0, _Unicode().zeroPaddedHex)(cp, 4);
    return React.createElement("div", {
      className: "nuclide-unicode-escapes-unescaped-char",
      key: i,
      title: 'U+' + hex
    }, String.fromCodePoint(cp), React.createElement("div", {
      className: "nuclide-unicode-escapes-unescaped-char-code-point"
    }, hex));
  });
  const result = React.createElement("table", {
    className: "nuclide-unicode-escapes-unescaped-datatip"
  }, React.createElement("tr", null, React.createElement("td", null, "Visual"), React.createElement("td", {
    className: "nuclide-unicode-escapes-string"
  }, text)), React.createElement("tr", null, React.createElement("td", null, "Logical"), React.createElement("td", null, React.createElement("div", {
    className: "nuclide-unicode-escapes-string"
  }, charsWithCodePoints))));
  return result;
};