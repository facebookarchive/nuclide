"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeSnippet = void 0;

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class CodeSnippet extends React.Component {
  componentDidMount() {
    if (!(this._editor != null)) {
      throw new Error("Invariant violation: \"this._editor != null\"");
    }

    const editor = this._editor.getTextEditor();

    const {
      grammar,
      highlights,
      startLine
    } = this.props;

    if (grammar) {
      editor.setGrammar(grammar);
    }

    if (highlights != null) {
      highlights.forEach(range => {
        const marker = editor.markBufferRange([[range.start.row - startLine, range.start.column], [range.end.row - startLine, range.end.column]]);
        editor.decorateMarker(marker, {
          type: 'highlight',
          class: 'code-snippet-highlight'
        });
      }); // Make sure at least one highlight is visible.

      if (highlights.length > 0) {
        editor.scrollToBufferPosition([highlights[0].end.row - startLine + 1, highlights[0].end.column]);
      }
    }
  }

  render() {
    const lineNumbers = [];

    for (let i = this.props.startLine; i <= this.props.endLine; i++) {
      lineNumbers.push(React.createElement("div", {
        key: i,
        className: "nuclide-ui-code-snippet-line-number",
        onClick: evt => this.props.onLineClick(evt, i)
      }, i + 1));
    }

    return React.createElement("div", {
      className: "nuclide-ui-code-snippet"
    }, React.createElement("div", {
      className: "nuclide-ui-code-snippet-line-number-column"
    }, lineNumbers), React.createElement(_AtomInput().AtomInput, {
      ref: input => {
        this._editor = input;
      },
      initialValue: this.props.text,
      onMouseDown: e => {
        this._ongoingSelection = null;
      },
      onDidChangeSelectionRange: e => {
        this._ongoingSelection = e.selection;
      },
      onClick: e => {
        // If the user selected a range, cancel the `onClick` behavior
        // to enable copying the selection.
        let shouldCancel = false;

        if (this._ongoingSelection != null) {
          const {
            start,
            end
          } = this._ongoingSelection.getBufferRange();

          shouldCancel = start.compare(end) !== 0;
        }

        if (!shouldCancel) {
          this.props.onClick(e);
        }

        this._ongoingSelection = null;
      }
    }));
  }

}

exports.CodeSnippet = CodeSnippet;