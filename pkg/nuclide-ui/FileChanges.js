'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('./AtomTextEditor');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _Section;

function _load_Section() {
  return _Section = require('./Section');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../commons-atom/viewableFromReactElement');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHighlightClass(type) {
  if (type === 'add') {
    return 'nuclide-ui-hunk-diff-insert';
  }
  if (type === 'del') {
    return 'nuclide-ui-hunk-diff-delete';
  }
  return null;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

const NBSP = '\xa0';
const GutterElement = props => {
  const {
    lineNumber,
    gutterWidth
  } = props;
  const fillWidth = gutterWidth - String(lineNumber).length;
  // Paralleling the original line-number implementation,
  // pad the line number with leading spaces.
  const filler = fillWidth > 0 ? new Array(fillWidth).fill(NBSP).join('') : '';
  // Attempt to reuse the existing line-number styles.
  return _react.default.createElement(
    'div',
    { className: 'line-number' },
    filler,
    lineNumber
  );
};

class HunkDiff extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    const model = this.refs.editor.getModel();
    this._createLineMarkers(model);
    this._createLineNumbers(model);
    this._updateCheckboxGutter(model);
  }

  componentDidUpdate() {
    this._updateCheckboxGutter(this.refs.editor.getModel());
  }

  shouldComponentUpdate(nextProps) {
    return this.props.checkboxFactory !== nextProps.checkboxFactory;
  }

  componentWillUnmount() {
    this._disposables.dispose();
    if (this._checkboxGutter != null) {
      this._checkboxGutter.destroy();
    }
  }

  _updateCheckboxGutter(editor) {
    if (this._checkboxGutter != null) {
      this._checkboxGutter.destroy();
      this._checkboxGutter = null;
    }
    const { checkboxFactory } = this.props;
    if (checkboxFactory == null) {
      return;
    }

    const gutter = editor.addGutter({ name: 'checkboxes' });
    let firstChangedLineNumber;
    let hunkIndex = 0;

    for (const line of this.props.hunk.changes) {
      const lineNumber = hunkIndex++;
      if (line.type === 'normal') {
        continue;
      } else if (firstChangedLineNumber == null) {
        firstChangedLineNumber = lineNumber;
      }
      const range = new _atom.Range([lineNumber, 0], [lineNumber + 1, 0]);
      const item = (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(checkboxFactory(this.props.fileName, this.props.hunk.oldStart, lineNumber - (0, (_nullthrows || _load_nullthrows()).default)(firstChangedLineNumber)));

      const marker = editor.markBufferRange(range, { invalidate: 'never' });
      const gutterDecoration = gutter.decorateMarker(marker, {
        type: 'gutter',
        item
      });

      gutter.onDidDestroy(() => {
        item.destroy();
        gutterDecoration.destroy();
      });
    }

    this._checkboxGutter = gutter;
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
      const marker = editor.markBufferPosition([line, 0], { invalidate: 'touch' });
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
    _reactDom.default.render(_react.default.createElement(GutterElement, { lineNumber: lineNumber, gutterWidth: gutterWidthInCharacters }), item);
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
    const {
      hunk,
      grammar
    } = this.props;
    const {
      content,
      changes,
      oldStart
    } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);

    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(this.props.fileName, oldStart);
    }

    return _react.default.createElement(
      'div',
      { className: 'nuclide-ui-hunk-diff', key: content },
      checkbox,
      _react.default.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-ui-hunk-diff-content',
          collapsable: this.props.collapsable,
          headline: content,
          size: 'medium' },
        _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
          autoGrow: true,
          className: 'nuclide-ui-hunk-diff-text-editor',
          correctContainerWidth: false,
          grammar: grammar,
          gutterHidden: true,
          readOnly: true,
          ref: 'editor',
          textBuffer: textBuffer
        })
      )
    );
  }
}

/* Renders changes to a single file. */
class FileChanges extends _react.default.Component {

  render() {
    const { diff } = this.props;
    const {
      additions,
      annotation,
      chunks,
      deletions,
      to: fileName
    } = diff;
    const grammar = atom.grammars.selectGrammar(fileName, '');
    const hunks = [];
    let i = 0;
    for (const chunk of chunks) {
      if (i > 0) {
        hunks.push(_react.default.createElement('div', {
          className: 'nuclide-ui-hunk-diff-spacer',
          key: `spacer-${i}`
        }));
      }
      hunks.push(_react.default.createElement(HunkDiff, {
        checkboxFactory: this.props.checkboxFactory,
        collapsable: this.props.collapsable,
        fileName: fileName,
        key: chunk.content,
        grammar: grammar,
        hunk: chunk
      }));
      i++;
    }
    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(fileName);
    }

    let annotationComponent;
    if (annotation != null) {
      annotationComponent = _react.default.createElement(
        'span',
        null,
        annotation.split('\n').map((line, index) => _react.default.createElement(
          'span',
          { key: index },
          line,
          _react.default.createElement('br', null)
        ))
      );
    }

    const diffDetails = _react.default.createElement(
      'span',
      null,
      annotationComponent,
      _react.default.createElement('br', null),
      additions,
      ' ',
      (0, (_string || _load_string()).pluralize)('addition', additions),
      ',',
      ' ',
      deletions,
      ' ',
      (0, (_string || _load_string()).pluralize)('deletion', deletions)
    );

    const headline = _react.default.createElement(
      'span',
      null,
      fileName,
      _react.default.createElement('br', null),
      diffDetails
    );

    return _react.default.createElement(
      'div',
      { className: 'nuclide-ui-file-changes' },
      checkbox,
      _react.default.createElement(
        (_Section || _load_Section()).Section,
        {
          className: 'nuclide-ui-file-changes-content',
          collapsable: this.props.collapsable,
          headline: headline },
        hunks
      )
    );
  }
}
exports.default = FileChanges;
FileChanges.defaultProps = {
  collapsable: false
};