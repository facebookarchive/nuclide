"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _getFragmentGrammar() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/getFragmentGrammar"));

  _getFragmentGrammar = function () {
    return data;
  };

  return data;
}

function _HighlightedCode() {
  const data = require("./HighlightedCode");

  _HighlightedCode = function () {
    return data;
  };

  return data;
}

function _HighlightedText() {
  const data = _interopRequireDefault(require("./HighlightedText"));

  _HighlightedText = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("./PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/* globals getSelection, requestAnimationFrame */
// $FlowIgnore: Not an official API yet.
const AsyncMode = React.unstable_AsyncMode; // Asynchronously highlight any results with a lot of lines.

const ASYNC_LINE_LIMIT = 5; // Must match value defined in FileResults.less.

const TAB_SIZE = 8; // Return the number of leading tabs in the line.

function countLeadingTabs(line) {
  let tabsSeen = 0;

  for (let index = 0; index < line.length; index++) {
    if (line.charAt(index) === '\t') {
      tabsSeen++;
    } else {
      break;
    }
  }

  return tabsSeen;
} // Renders highlights for matches in the current line.
// Highlights are designed to be superimposed on the actual code.


function renderHighlights(line, matches) {
  const pieces = [];
  const leadingTabs = countLeadingTabs(line);
  let curChar = 0;
  matches.forEach((match, i) => {
    if (match.start.column > line.length) {
      // This occasionally happens when lines are truncated server-side. Ignore.
      return;
    }

    if (match.start.column > curChar) {
      // If we picked up any leading tabs, convert them to spaces.
      const tabDifference = Math.max(leadingTabs - curChar, 0);
      const tabExtraSpaces = (TAB_SIZE - 1) * tabDifference;
      pieces.push(' '.repeat(tabExtraSpaces + match.start.column - curChar));
    }

    const matchStart = Math.max(curChar, match.start.column); // Note that matches can overlap.

    if (matchStart < match.end.column) {
      pieces.push(React.createElement("span", {
        key: match.end.column,
        "data-column": match.start.column,
        className: "highlight-info"
      }, line.substring(matchStart, match.end.column)));
    }

    curChar = Math.max(curChar, match.end.column);
  });
  pieces.push('\n');
  return pieces;
}

function selectGrammar(path) {
  let bestMatch = null;
  let highestScore = -Infinity;
  atom.grammars.forEachGrammar(grammar => {
    // TODO: tree-sitter grammars are not supported yet.
    if (!('tokenizeLine' in grammar)) {
      return;
    }

    const score = atom.grammars.getGrammarScore(grammar, path, '');

    if (score > highestScore || bestMatch == null) {
      bestMatch = grammar;
      highestScore = score;
    }
  });

  if (!(bestMatch != null)) {
    throw new Error('no grammars found');
  }

  return (0, _getFragmentGrammar().default)(bestMatch);
}

class FileResultsComponent extends React.Component {
  constructor(props) {
    super(props);

    this._onLineColumnClick = event => {
      const line = event.target.dataset.line;

      if (line != null) {
        this.props.onClick(this.props.fileResults.path, parseInt(line, 10));
      }
    };

    this._onCodeClick = (event, startLine, lineCount) => {
      let column = undefined;

      if (event.target instanceof HTMLElement && event.target.className === 'highlight-info') {
        // Highlights have columns attached as data-column.
        // (We could get this from the client coords as well, but it's harder.)
        column = parseInt(event.target.dataset.column, 10);
      } else {
        // Don't trigger if the user is trying to select something.
        const selection = getSelection();

        if (selection == null || selection.type === 'Range') {
          return;
        }
      }

      const {
        currentTarget,
        clientY
      } = event;

      if (!(currentTarget instanceof HTMLElement)) {
        return;
      } // Determine the line number via the relative click coordinates.


      const {
        top,
        height
      } = currentTarget.getBoundingClientRect();
      const relativeY = clientY - top;

      if (relativeY <= height) {
        const lineNumber = startLine + Math.floor(lineCount * relativeY / height);
        this.props.onClick(this.props.fileResults.path, lineNumber - 1, column);
      }
    };

    this._onToggle = () => {
      this.props.onToggle(this.props.fileResults.path);
    };

    this._onFileClick = event => {
      const {
        groups
      } = this.props.fileResults;

      if (groups.length === 0) {
        this.props.onClick(this.props.fileResults.path);
      } else {
        this.props.onClick(this.props.fileResults.path, groups[0].matches[0].start.row, groups[0].matches[0].start.column);
      }

      event.stopPropagation();
    };

    const totalLines = props.fileResults.groups.reduce((acc, group) => acc + group.lines.length, 0);
    this.state = {
      highlighted: totalLines < ASYNC_LINE_LIMIT
    };
  }

  componentDidMount() {
    if (!this.state.highlighted) {
      this._startHighlighting();
    }
  }

  _startHighlighting() {
    // TODO(pelmers): Use react deferred update API when facebook/react/issues/13306 is ready
    requestAnimationFrame(() => {
      this.setState({
        highlighted: true
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.fileResults !== nextProps.fileResults || this.props.collapsed !== nextProps.collapsed || this.state.highlighted !== nextState.highlighted;
  } // Register event callbacks on the line number / code containers.
  // We can then use the data attributes to find the line numbers.


  render() {
    const {
      fileResults
    } = this.props;
    const {
      path,
      pathMatch,
      groups
    } = fileResults;
    let displayPath = path;

    if (pathMatch != null) {
      displayPath = React.createElement(_HighlightedText().default, {
        text: path,
        highlightedRanges: [[pathMatch[0], pathMatch[1]]]
      });
    }

    const grammar = selectGrammar(path);
    return React.createElement("div", null, React.createElement("div", {
      // Show the full path in a tooltip if it overflows.
      title: fileResults.path,
      className: "file-results-filename",
      onClick: this._onToggle
    }, React.createElement("span", {
      className: (0, _classnames().default)('icon', this.props.collapsed ? 'icon-chevron-right' : 'icon-chevron-down')
    }), React.createElement("span", {
      onClick: this._onFileClick
    }, React.createElement(_PathWithFileIcon().default, {
      path: fileResults.path,
      children: []
    }), displayPath)), React.createElement("div", null, !this.props.collapsed && groups.map((group, groupKey) => {
      const lineNumbers = [];
      const highlights = [];
      const code = group.lines.join('\n');
      let matchIndex = 0;

      for (let i = 0; i < group.lines.length; i++) {
        const lineNum = i + group.startLine; // Extract all matches that are on the current line.

        const lineMatches = [];

        while (matchIndex < group.matches.length) {
          const curMatch = group.matches[matchIndex];
          const curLine = curMatch.start.row + 1;

          if (curLine < lineNum) {
            continue;
          } else if (curLine === lineNum) {
            lineMatches.push(curMatch);
          } else {
            break;
          }

          matchIndex++;
        }

        lineNumbers.push(React.createElement("div", {
          key: lineNum,
          "data-line": lineNum - 1
        }, lineNum));
        highlights.push(renderHighlights(group.lines[i], lineMatches));
      }

      return React.createElement("div", {
        key: groupKey,
        className: "file-results-snippet"
      }, React.createElement("div", {
        onClick: this._onLineColumnClick,
        className: "file-results-line-numbers"
      }, lineNumbers), React.createElement("div", {
        onClick: evt => this._onCodeClick(evt, group.startLine, group.lines.length),
        className: "file-results-code"
      }, this.state.highlighted ? React.createElement(AsyncMode, null, React.createElement(_HighlightedCode().HighlightedLines, {
        grammar: grammar,
        code: code
      })) : code, React.createElement("div", {
        className: "file-results-highlights"
      }, highlights)));
    })));
  }

}

exports.default = FileResultsComponent;