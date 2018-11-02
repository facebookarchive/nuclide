"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _collection() {
  const data = require("../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class HighlightedText extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.text !== nextProps.text || !(0, _collection().arrayEqual)(this.props.highlightedRanges, nextProps.highlightedRanges, rangeEqual);
  }

  render() {
    const {
      className,
      highlightedRanges,
      style,
      text
    } = this.props; // generate counterpart unhighlightedRanges for the highlightedRanges

    const unhighlightedRanges = [];

    for (let i = 0; i < highlightedRanges.length; i++) {
      const lastHighlighted = highlightedRanges[i - 1];
      const currentHighlighted = highlightedRanges[i];

      if (lastHighlighted == null) {
        // there's an opportunity for a minor correctness/optimization to not
        // include a [0, 0] range, but this is an internal process and it
        // preserves a handy property that unmatched always preceeds matched.
        // We don't render zero-length slices below anyway.
        unhighlightedRanges.push([0, currentHighlighted[0]]);
      } else {
        unhighlightedRanges.push([lastHighlighted[1], currentHighlighted[0]]);
      }

      if ( // if the last matched range
      i === highlightedRanges.length - 1 && // doesn't end perfectly at the end of the text,
      currentHighlighted[1] !== text.length) {
        // add an additional unmatched range to cover the rest of the text
        unhighlightedRanges.push([currentHighlighted[1], text.length]);
      }
    }

    if (unhighlightedRanges.length === 0) {
      unhighlightedRanges.push([0, text.length]);
    }

    if (!(unhighlightedRanges.length === highlightedRanges.length || unhighlightedRanges.length === highlightedRanges.length + 1)) {
      throw new Error("Invariant violation: \"unhighlightedRanges.length === highlightedRanges.length ||\\n        unhighlightedRanges.length === highlightedRanges.length + 1\"");
    }

    const renderedSequences = [];

    for (let i = 0; i < unhighlightedRanges.length; i++) {
      const unhighlightedRange = unhighlightedRanges[i];
      const highlightedRange = highlightedRanges[i];

      if (!rangeEmpty(unhighlightedRange)) {
        renderedSequences.push(renderUnmatchedSubsequence(text.slice(unhighlightedRange[0], unhighlightedRange[1]), unhighlightedRange.join(',')));
      }

      if (highlightedRange != null && !rangeEmpty(highlightedRange)) {
        renderedSequences.push(renderMatchedSubsequence(text.slice(highlightedRange[0], highlightedRange[1]), highlightedRange.join(',')));
      }
    }

    return React.createElement("span", {
      className: className,
      style: style
    }, renderedSequences);
  }

}

exports.default = HighlightedText;

function renderSubsequence(seq, props) {
  return React.createElement("span", props, seq);
}

function renderUnmatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key
  });
}

function renderMatchedSubsequence(seq, key) {
  return renderSubsequence(seq, {
    key,
    className: 'nuclide-match-highlighted-text-match'
  });
}

function rangeEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function rangeEmpty(range) {
  return range[0] === range[1];
}