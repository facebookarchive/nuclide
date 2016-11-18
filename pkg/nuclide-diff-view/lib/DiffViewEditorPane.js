'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _reactForAtom = require('react-for-atom');

var _DiffViewEditor;

function _load_DiffViewEditor() {
  return _DiffViewEditor = _interopRequireDefault(require('./DiffViewEditor'));
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SPINNER_DELAY_MS = 50;
const DEBOUNCE_SCROLL_MS = 50;

let DiffViewEditorPane = class DiffViewEditorPane extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  componentDidMount() {
    this._setupDiffEditor();
  }

  _setupDiffEditor() {
    const editorSubscriptions = this._editorSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add(editorSubscriptions);

    const editorDomElement = this.getEditorDomElement();
    editorDomElement.classList.add((_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS);
    this._diffViewEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(editorDomElement);
    const textEditor = this.getEditorModel();

    /*
     * Those should have been synced automatically, but an implementation limitation of creating
     * a <atom-text-editor> element assumes default settings for those.
     * Filed: https://github.com/atom/atom/issues/10506
     */
    editorSubscriptions.add(atom.config.observe('editor.tabLength', tabLength => {
      textEditor.setTabLength(tabLength);
    }));
    editorSubscriptions.add(atom.config.observe('editor.softTabs', softTabs => {
      textEditor.setSoftTabs(softTabs);
    }));

    if (this.props.onDidChangeScrollTop != null) {
      editorSubscriptions.add(
      // Debounce for smooth scrolling without hogging the CPU.
      (0, (_event || _load_event()).observableFromSubscribeFunction)(editorDomElement.onDidChangeScrollTop.bind(editorDomElement)).debounceTime(DEBOUNCE_SCROLL_MS).subscribe(this.props.onDidChangeScrollTop));
    }

    process.nextTick(() => this.props.onDidUpdateTextEditorElement());
    // TODO(most): Fix by listening to text editor rendering.
    editorSubscriptions.add(_rxjsBundlesRxMinJs.Observable.interval(100).first().subscribe(() => this._setOffsets(this.props.offsets)));

    editorSubscriptions.add(() => this._diffViewEditor.destroy());
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render() {
    const isLoading = this.props.isLoading;

    const rootClassName = (0, (_classnames || _load_classnames()).default)({
      'nuclide-diff-editor-container': true,
      'nuclide-diff-view-editor-loading': isLoading
    });

    const loadingIndicator = isLoading ? _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diff-view-pane-loading-indicator' },
      _reactForAtom.React.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { delay: SPINNER_DELAY_MS, size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.LARGE })
    ) : null;

    return _reactForAtom.React.createElement(
      'div',
      { className: rootClassName },
      loadingIndicator,
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-diff-editor-wrapper' },
        _reactForAtom.React.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
          _alwaysUpdate: true,
          ref: 'editor',
          readOnly: this.props.readOnly,
          textBuffer: this.props.textBuffer,
          syncTextContents: false
        })
      )
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.textBuffer !== this.props.textBuffer) {
      const oldEditorSubscriptions = this._editorSubscriptions;
      if (oldEditorSubscriptions != null) {
        oldEditorSubscriptions.dispose();
        this._subscriptions.remove(oldEditorSubscriptions);
        this._editorSubscriptions = null;
      }
      this._setupDiffEditor();
    }
    this._updateDiffView(prevProps);
  }

  _updateDiffView(oldProps) {
    const newProps = this.props;
    // The Diff View can never edit the edited buffer contents.
    if (newProps.readOnly && newProps.textContent != null && oldProps.textContent !== newProps.textContent) {
      this._setTextContent(newProps.filePath, newProps.textContent);
    }
    if (!(0, (_collection || _load_collection()).mapEqual)(oldProps.offsets, newProps.offsets)) {
      this._setOffsets(newProps.offsets);
    }
    if (!(0, (_collection || _load_collection()).mapEqual)(oldProps.inlineElements, newProps.inlineElements)) {
      this._diffViewEditor.setUiElements(newProps.inlineElements);
    }
    if (!(0, (_collection || _load_collection()).mapEqual)(oldProps.inlineOffsetElements, newProps.inlineOffsetElements)) {
      this._diffViewEditor.setOffsetUiElements(newProps.inlineOffsetElements, newProps.lineMapper);
    }
    this._setHighlightedLines(newProps.highlightedLines);
  }

  _setTextContent(filePath, text) {
    this._diffViewEditor.setFileContents(filePath, text);
  }

  _setHighlightedLines(highlightedLines) {
    this._diffViewEditor.setHighlightedLines(highlightedLines.added, highlightedLines.removed);
  }

  _setOffsets(offsets) {
    this._diffViewEditor.setOffsets(offsets);
  }

  getEditorModel() {
    return this.refs.editor.getModel();
  }

  getDiffEditor() {
    return this._diffViewEditor;
  }

  getEditorDomElement() {
    return this.refs.editor.getElement();
  }
};
exports.default = DiffViewEditorPane;
module.exports = exports['default'];