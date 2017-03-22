'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('./AtomTextEditor');
}

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
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

class HunkDiff extends _react.default.Component {

  constructor(props) {
    super(props);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    this._createLineMarkers(this.refs.editor.getModel());
  }

  // This is a read-only component– no need to update the underlying TextEditor.
  shouldComponentUpdate(nextProps) {
    return false;
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  /**
   * @param lineNumber A buffer line number to be highlighted.
   * @param type The type of highlight to be applied to the line.
   *             Could be a value of: ['insert', 'delete'].
   */
  _createLineMarkers(editor) {
    let gutter;
    if (this.props.checkboxFactory != null) {
      gutter = editor.addGutter({ name: 'checkboxes' });
      this._disposables.add(() => {
        if (gutter) {
          gutter.destroy();
        }
      });
    }
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

      if (gutter) {
        if (!(this.props.checkboxFactory != null)) {
          throw new Error('Invariant violation: "this.props.checkboxFactory != null"');
        }

        const checkbox = this.props.checkboxFactory(this.props.hunk.content, lineNumber);
        const item = document.createElement('div');
        _reactDom.default.render(checkbox, item);
        const gutterDecoration = gutter.decorateMarker(marker, {
          type: 'gutter',
          item
        });
        gutterDecoration.onDidDestroy(() => _reactDom.default.unmountComponentAtNode(item));
        this._disposables.add(() => {
          gutterDecoration.destroy();
        });
      }

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
      changes
    } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);

    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(content);
    }
    return _react.default.createElement(
      'div',
      { key: content },
      checkbox,
      content,
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
    );
  }
}

/* Renders changes to a single file. */
class FileChanges extends _react.default.Component {

  render() {
    const { diff } = this.props;
    const {
      to: fileName,
      chunks,
      deletions,
      additions
    } = diff;
    const grammar = atom.grammars.selectGrammar(fileName, '');
    const hunks = chunks.map(chunk => _react.default.createElement(HunkDiff, {
      key: chunk.content,
      grammar: grammar,
      hunk: chunk,
      checkboxFactory: this.props.checkboxFactory && this.props.checkboxFactory.bind(null, fileName)
    }));
    let checkbox;
    if (this.props.checkboxFactory != null) {
      checkbox = this.props.checkboxFactory(fileName);
    }
    return _react.default.createElement(
      'div',
      { className: 'nuclide-ui-file-changes' },
      _react.default.createElement(
        'h3',
        null,
        checkbox,
        fileName
      ),
      _react.default.createElement(
        'div',
        null,
        additions,
        ' ',
        (0, (_string || _load_string()).pluralize)('addition', additions),
        ',',
        ' ',
        deletions,
        ' ',
        (0, (_string || _load_string()).pluralize)('deletion', deletions)
      ),
      _react.default.createElement(
        'div',
        null,
        hunks
      )
    );
  }
}
exports.default = FileChanges;