'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HunkDiff = undefined;

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _Section;

function _load_Section() {
  return _Section = require('./Section');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function getHighlightClass(type) {
  if (type === 'add') {
    return 'nuclide-ui-hunk-diff-insert';
  }
  if (type === 'del') {
    return 'nuclide-ui-hunk-diff-delete';
  }
  return null;
}

const NBSP = '\xa0';
const GutterElement = props => {
  const { lineNumber, gutterWidth } = props;
  const fillWidth = gutterWidth - String(lineNumber).length;
  // Paralleling the original line-number implementation,
  // pad the line number with leading spaces.
  const filler = fillWidth > 0 ? new Array(fillWidth).fill(NBSP).join('') : '';
  // Attempt to reuse the existing line-number styles.
  return _react.createElement(
    'div',
    { className: 'line-number' },
    filler,
    lineNumber
  );
};

class HunkDiff extends _react.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    const editor = (0, (_nullthrows || _load_nullthrows()).default)(this.editor);
    this._createLineMarkers(editor);
    this._createLineNumbers(editor);
  }

  componentWillReceiveProps(nextProps) {
    const { hunk, grammar } = nextProps;
    const changes = hunk.changes;
    const prevHunk = this.props.hunk;
    const editor = (0, (_nullthrows || _load_nullthrows()).default)(this.editor);

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
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._createLineMarkers(editor);
    this._createLineNumbers(editor);
  }

  shouldComponentUpdate(nextProps) {
    return false;
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  // Line numbers are contiguous, but have a random starting point, so we can't use the
  // default line-number gutter.
  _createLineNumbers(editor) {
    const changeCount = this.props.hunk.changes.length;
    const initialOffset = this.props.hunk.newStart;
    const maxDisplayLineNumber = initialOffset + changeCount - 1;
    // The maximum required gutter width for this hunk, in characters:
    const gutterWidth = String(maxDisplayLineNumber).length;
    const suffix = gutterWidth > 0 && gutterWidth < 5 ? `-w${gutterWidth}` : '';
    const gutter = editor.addGutter({
      name: `nuclide-ui-file-changes-line-number-gutter${suffix}`
    });
    let deletedLinesInSection = 0;
    let deletedLines = 0;
    for (let line = 0; line < changeCount; line++) {
      if (this.props.hunk.changes[line].type === 'del') {
        deletedLinesInSection++;
      } else {
        deletedLines += deletedLinesInSection;
        deletedLinesInSection = 0;
      }
      const displayLine = line + initialOffset - deletedLines;
      const item = this._createGutterItem(displayLine, gutterWidth);
      const marker = editor.markBufferPosition([line, 0], {
        invalidate: 'touch'
      });
      gutter.decorateMarker(marker, {
        type: 'gutter',
        item
      });
      this._disposables.add(() => {
        _reactDom.default.unmountComponentAtNode(item);
        marker.destroy();
      });
    }
    this._disposables.add(() => {
      gutter.destroy();
    });
  }

  _createGutterItem(lineNumber, gutterWidthInCharacters) {
    const item = document.createElement('div');
    _reactDom.default.render(_react.createElement(GutterElement, {
      lineNumber: lineNumber,
      gutterWidth: gutterWidthInCharacters
    }), item);
    return item;
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
      const marker = editor.markBufferRange(range, { invalidate: 'never' });
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
    const { hunk, grammar } = this.props;
    const { changes } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);

    return _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
      autoGrow: true,
      className: 'nuclide-ui-hunk-diff-text-editor',
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

exports.HunkDiff = HunkDiff; /* Renders changes to a single file. */

class FileChanges extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleFilenameClick = event => {
      const { fullPath } = this.props;
      if (fullPath == null) {
        return;
      }
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(fullPath);
      event.stopPropagation();
    }, _temp;
  }

  render() {
    const { diff, fullPath, collapsable, collapsedByDefault } = this.props;
    const { additions, annotation, chunks, deletions, to: fileName } = diff;
    const grammar = atom.grammars.selectGrammar(fileName, '');
    const hunks = [];
    let i = 0;
    for (const chunk of chunks) {
      if (i > 0) {
        hunks.push(_react.createElement('div', { className: 'nuclide-ui-hunk-diff-spacer', key: `spacer-${i}` }));
      }
      hunks.push(
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(this.props.hunkComponentClass, {
        extraData: this.props.extraData,
        key: chunk.oldStart,
        grammar: grammar,
        hunk: chunk
      }));
      i++;
    }
    let annotationComponent;
    if (annotation != null) {
      annotationComponent = _react.createElement(
        'span',
        null,
        annotation.split('\n').map((line, index) => _react.createElement(
          'span',
          { key: index },
          line,
          _react.createElement('br', null)
        ))
      );
    }

    const diffDetails = _react.createElement(
      'span',
      null,
      annotationComponent,
      ' (',
      additions + deletions,
      ' ',
      (0, (_string || _load_string()).pluralize)('line', additions + deletions),
      ')'
    );

    const renderedFilename = fullPath != null ? _react.createElement(
      'a',
      { onClick: this._handleFilenameClick },
      fileName
    ) : fileName;

    const headline = _react.createElement(
      'span',
      { className: 'nuclide-ui-file-changes-item' },
      renderedFilename,
      ' ',
      diffDetails
    );

    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        (_Section || _load_Section()).Section,
        {
          collapsable: collapsable,
          collapsedByDefault: collapsedByDefault,
          headline: headline,
          title: 'Click to open' },
        hunks
      )
    );
  }
}
exports.default = FileChanges;
FileChanges.defaultProps = {
  hunkComponentClass: HunkDiff
};