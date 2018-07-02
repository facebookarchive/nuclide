"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCustomLineNumberGutter = createCustomLineNumberGutter;
exports.default = exports.HunkDiff = void 0;

function _AtomTextEditor() {
  const data = require("./AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _renderReactRoot() {
  const data = require("./renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _Section() {
  const data = require("./Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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
const MAX_GUTTER_WIDTH = 5;

function getHighlightClass(type) {
  if (type === 'add') {
    return 'nuclide-ui-hunk-diff-insert';
  }

  if (type === 'del') {
    return 'nuclide-ui-hunk-diff-delete';
  }

  return null;
} // add a gutter to a text editor with line numbers defined by an iterable, as
// opposed to being forced to start at 1 and counting up


function createCustomLineNumberGutter(editor, lineNumbers, gutterWidth, options = {}) {
  const {
    extraName,
    onClick
  } = options; // 'nuclide-ui-file-changes-line-number-gutter-wX' makes a gutter Xem wide.
  // 'nuclide-ui-file-changes-line-number-gutter' makes a gutter 5em wide

  const suffix = gutterWidth > 0 && gutterWidth < MAX_GUTTER_WIDTH ? `-w${gutterWidth}` : '';
  let name = `nuclide-ui-file-changes-line-number-gutter${suffix}`;

  if (extraName != null) {
    name += ` ${extraName}`;
  }

  const gutter = editor.addGutter({
    name
  });
  let index = -1;

  for (const lineNumber of lineNumbers) {
    index++;

    if (lineNumber == null) {
      continue;
    }

    const marker = editor.markBufferPosition([index, 0], {
      invalidate: 'touch'
    });
    const item = createGutterItem(lineNumber, gutterWidth, onClick);
    gutter.decorateMarker(marker, {
      type: 'gutter',
      item
    });
    gutter.onDidDestroy(() => {
      marker.destroy();

      _reactDom.default.unmountComponentAtNode(item);
    });
  }

  return gutter;
}

const NBSP = '\xa0';

function createGutterItem(lineNumber, gutterWidth, onClick) {
  const fillWidth = gutterWidth - String(lineNumber).length; // Paralleling the original line-number implementation,
  // pad the line number with leading spaces.

  const filler = fillWidth > 0 ? new Array(fillWidth).fill(NBSP).join('') : ''; // Attempt to reuse the existing line-number styles.

  return (0, _renderReactRoot().renderReactRoot)(React.createElement("div", {
    onClick: onClick && (() => onClick(lineNumber)),
    className: (0, _classnames().default)('line-number', {
      clickable: onClick != null
    })
  }, filler, lineNumber));
}

class HunkDiff extends React.Component {
  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable().default)( // enable copying filename
    atom.contextMenu.add({
      '.nuclide-ui-file-changes-item': [{
        label: 'Copy',
        command: 'core:copy'
      }]
    }));
  }

  componentDidMount() {
    const editor = (0, _nullthrows().default)(this.editor);

    this._createLineMarkers(editor);

    this._createLineNumbers(editor);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      hunk,
      grammar
    } = nextProps;
    const changes = hunk.changes;
    const prevHunk = this.props.hunk;
    const editor = (0, _nullthrows().default)(this.editor);
    const newText = changes.map(change => change.content.slice(1)).join('\n');
    const oldText = prevHunk.changes.map(change => change.content.slice(1)).join('\n');
    const oldGrammar = this.props.grammar;

    if (newText === oldText && grammar === oldGrammar) {
      return;
    }

    if (newText !== oldText) {
      editor.setText(newText);
    }

    if (grammar !== oldGrammar) {
      editor.setGrammar(grammar);
    }

    this._disposables.dispose();

    this._disposables = new (_UniversalDisposable().default)();

    this._createLineMarkers(editor);

    this._createLineNumbers(editor);
  }

  shouldComponentUpdate(nextProps) {
    return false;
  }

  componentWillUnmount() {
    this._disposables.dispose();
  } // Line numbers are contiguous, but have a random starting point, so we can't use the
  // default line-number gutter.


  _createLineNumbers(editor) {
    const {
      changes,
      newStart: initialOffset
    } = this.props.hunk;
    const changeCount = changes.length;
    const maxDisplayLineNumber = initialOffset + changeCount - 1; // The maximum required gutter width for this hunk, in characters:

    const gutterWidth = String(maxDisplayLineNumber).length;
    let deletedLinesInSection = 0;
    let deletedLines = 0; // use a generator to avoid having to precalculate and store an array of
    // line numbers

    function* lineNumberGenerator() {
      for (let line = 0; line < changeCount; line++) {
        if (changes[line].type === 'del') {
          deletedLinesInSection++;
        } else {
          deletedLines += deletedLinesInSection;
          deletedLinesInSection = 0;
        }

        yield line + initialOffset - deletedLines;
      }
    }

    const gutter = createCustomLineNumberGutter(editor, lineNumberGenerator(), gutterWidth);

    this._disposables.add(() => {
      gutter.destroy();
    });
  }
  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
   *             Could be a value of: ['insert', 'delete'].
   */


  _createLineMarkers(editor) {
    let hunkIndex = 0;

    for (const hunkChanges of this.props.hunk.changes) {
      const lineNumber = hunkIndex++;
      const range = new _atom.Range([lineNumber, 0], [lineNumber + 1, 0]);
      const marker = editor.markBufferRange(range, {
        invalidate: 'never'
      });
      const className = getHighlightClass(hunkChanges.type);

      if (className == null) {
        // No need to highlight normal lines.
        continue;
      }

      const decoration = editor.decorateMarker(marker, {
        type: 'highlight',
        class: className
      });

      this._disposables.add(() => {
        decoration.destroy();
      });
    }
  }

  render() {
    const {
      hunk,
      grammar
    } = this.props;
    const {
      changes
    } = hunk; // Remove the first character in each line (/[+- ]/) which indicates addition / deletion

    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);
    return React.createElement(_AtomTextEditor().AtomTextEditor, {
      autoGrow: true,
      className: "nuclide-ui-hunk-diff-text-editor",
      correctContainerWidth: false,
      grammar: grammar,
      gutterHidden: true,
      readOnly: true,
      ref: editorRef => {
        // $FlowFixMe(>=0.53.0) Flow suppress
        this.editor = editorRef && editorRef.getModel();
      },
      textBuffer: textBuffer
    });
  }

}
/* Renders changes to a single file. */


exports.HunkDiff = HunkDiff;

class FileChanges extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleFilenameClick = event => {
      const {
        fullPath
      } = this.props;

      if (fullPath == null) {
        return;
      }

      (0, _goToLocation().goToLocation)(fullPath);
      event.stopPropagation();
    }, _temp;
  }

  render() {
    const {
      hideHeadline,
      diff,
      fullPath,
      collapsable,
      collapsedByDefault,
      grammar
    } = this.props;
    const {
      additions,
      annotation,
      chunks,
      deletions,
      from: fromFileName,
      to: toFileName
    } = diff;

    if (toFileName == null || fromFileName == null) {
      // sanity check: toFileName & fromFileName should always be given
      return null;
    }

    const fileName = toFileName !== '/dev/null' ? toFileName : fromFileName;
    const hunks = [];
    let i = 0;

    for (const chunk of chunks) {
      if (i > 0) {
        hunks.push(React.createElement("div", {
          className: "nuclide-ui-hunk-diff-spacer",
          key: `spacer-${i}`
        }));
      }

      hunks.push( // $FlowFixMe(>=0.53.0) Flow suppress
      React.createElement(this.props.hunkComponentClass, {
        extraData: this.props.extraData,
        key: chunk.oldStart,
        grammar: grammar != null ? grammar : atom.grammars.selectGrammar(fileName, ''),
        hunk: chunk
      }));
      i++;
    }

    let annotationComponent;

    if (annotation != null) {
      annotationComponent = React.createElement("span", null, annotation.split('\n').map((line, index) => React.createElement("span", {
        key: index
      }, line, React.createElement("br", null))));
    }

    let addedOrDeletedString = '';

    if (toFileName === '/dev/null') {
      addedOrDeletedString = 'file deleted - ';
    } else if (fromFileName === '/dev/null') {
      addedOrDeletedString = 'file added - ';
    }

    const diffDetails = React.createElement("span", {
      className: "nuclide-ui-file-changes-details"
    }, annotationComponent, " (", addedOrDeletedString, additions + deletions, " ", (0, _string().pluralize)('line', additions + deletions), ")"); // insert zero-width spaces so filenames are wrapped at '/'

    const breakableFilename = fileName.replace(/\//g, '/' + _string().ZERO_WIDTH_SPACE);
    const renderedFilename = fullPath != null ? React.createElement("a", {
      className: "nuclide-ui-file-changes-name",
      onClick: this._handleFilenameClick
    }, breakableFilename) : breakableFilename;

    if (hideHeadline) {
      return hunks;
    }

    const headline = React.createElement("span", {
      className: (0, _classnames().default)('nuclide-ui-file-changes-item', 'native-key-bindings'),
      tabIndex: -1
    }, renderedFilename, " ", diffDetails);
    return React.createElement(_Section().Section, {
      collapsable: collapsable,
      collapsedByDefault: collapsedByDefault,
      headline: headline,
      title: "Click to open"
    }, hunks);
  }

}

exports.default = FileChanges;
FileChanges.defaultProps = {
  hunkComponentClass: HunkDiff
};