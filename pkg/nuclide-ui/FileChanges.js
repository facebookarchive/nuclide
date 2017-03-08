'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('./AtomTextEditor');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Format returned by `diffparser`:
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

class HunkDiff extends _reactForAtom.React.Component {

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
      changes
    } = hunk;
    // Remove the first character in each line (/[+- ]/) which indicates addition / deletion
    const text = changes.map(change => change.content.slice(1)).join('\n');
    const textBuffer = new _atom.TextBuffer();
    textBuffer.setText(text);
    return _reactForAtom.React.createElement(
      'div',
      { key: content },
      content,
      _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
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
class FileChanges extends _reactForAtom.React.Component {

  render() {
    const { diff } = this.props;
    const {
      to,
      chunks,
      deletions,
      additions
    } = diff;
    const grammar = atom.grammars.selectGrammar(to, '');
    const hunks = chunks.map(chunk => _reactForAtom.React.createElement(HunkDiff, {
      key: chunk.content,
      grammar: grammar,
      hunk: chunk
    }));
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-ui-file-changes' },
      _reactForAtom.React.createElement(
        'h3',
        null,
        to
      ),
      _reactForAtom.React.createElement(
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
      _reactForAtom.React.createElement(
        'div',
        null,
        hunks
      )
    );
  }
}
exports.default = FileChanges;