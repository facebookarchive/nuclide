'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowDiff = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _computeDiff;

function _load_computeDiff() {
  return _computeDiff = require('../../commons-node/computeDiff');
}

var _DiffViewEditor;

function _load_DiffViewEditor() {
  return _DiffViewEditor = _interopRequireDefault(require('../../commons-atom/DiffViewEditor'));
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('nuclide-commons-ui/LoadingSpinner');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const NUCLIDE_VCS_LOG_LOADING_INDICATOR_CLASSNAME = 'nuclide-vcs-log-editor-loading-indicator';
const NUCLIDE_VCS_LOG_EDITOR_LOADING_CLASSNAME = 'nuclide-vcs-log-editor-loading';
const NUCLIDE_VCS_LOG_EDITOR_CLASSNAME = 'nuclide-vcs-log-editor';
const NUCLIDE_VCS_LOG_DIFF_CONTAINER_CLASSNAME = 'nuclide-vcs-log-diff-container';

class ShowDiff extends _react.Component {

  render() {
    return _react.createElement(
      'div',
      { className: NUCLIDE_VCS_LOG_DIFF_CONTAINER_CLASSNAME },
      _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        readOnly: true,
        autoGrow: true,
        syncTextContents: false,
        softWrapped: false,
        className: NUCLIDE_VCS_LOG_EDITOR_CLASSNAME,
        correctContainerWidth: false,
        ref: editorRef => {
          // $FlowFixMe(>=0.53.0) Flow suppress
          this._oldTextEditor = editorRef && editorRef.getModel();
        }
      }),
      _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
        readOnly: true,
        autoGrow: true,
        syncTextContents: false,
        softWrapped: false,
        className: NUCLIDE_VCS_LOG_EDITOR_CLASSNAME,
        correctContainerWidth: false,
        ref: editorRef => {
          // $FlowFixMe(>=0.53.0) Flow suppress
          this._newTextEditor = editorRef && editorRef.getModel();
        }
      })
    );
  }

  componentDidMount() {
    this._setupEditors();
  }

  componentWillUnmount() {
    this._cleanupEditors();
  }

  componentDidUpdate(prevProps) {
    if (this.props.filePath !== prevProps.filePath || this.props.oldContent !== prevProps.oldContent || this.props.newContent !== prevProps.newContent) {
      this._cleanupEditors();
      this._setupEditors();
    }
  }

  _setupEditors() {
    const { filePath, oldContent, newContent } = this.props;
    this._oldDiffViewEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(atom.views.getView(this._oldTextEditor));
    this._newDiffViewEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(atom.views.getView(this._newTextEditor));
    this._oldDiffViewEditor.setFileContents(filePath, oldContent || '');
    this._newDiffViewEditor.setFileContents(filePath, newContent || '');
    const diff = (0, (_computeDiff || _load_computeDiff()).computeDiff)(oldContent || '', newContent || '');
    this._oldDiffViewEditor.setHighlightedLines([], diff.removedLines);
    this._newDiffViewEditor.setHighlightedLines(diff.addedLines, []);
    this._oldDiffViewEditor.setOffsets(new Map(diff.oldLineOffsets));
    this._newDiffViewEditor.setOffsets(new Map(diff.newLineOffsets));

    // Add loading spinners
    if (oldContent == null) {
      this.setupLoadingIndicator(this._oldDiffViewEditor.getEditorDomElement());
    }
    if (newContent == null) {
      this.setupLoadingIndicator(this._newDiffViewEditor.getEditorDomElement());
    }
  }

  setupLoadingIndicator(editorElement) {
    const editorElementParent = editorElement.parentNode;
    if (editorElementParent == null) {
      return;
    }

    const loadingElement = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { delay: 50, size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.LARGE }));
    loadingElement.classList.add(NUCLIDE_VCS_LOG_LOADING_INDICATOR_CLASSNAME);
    editorElementParent.appendChild(loadingElement);
    editorElement.classList.add(NUCLIDE_VCS_LOG_EDITOR_LOADING_CLASSNAME);
  }

  removeLoadingIndicator(editorElement) {
    const editorElementParent = editorElement.parentNode;
    if (editorElementParent == null) {
      return;
    }
    editorElement.classList.remove(NUCLIDE_VCS_LOG_EDITOR_LOADING_CLASSNAME);
    const loadingElement = editorElementParent.querySelectorAll(`.${NUCLIDE_VCS_LOG_LOADING_INDICATOR_CLASSNAME}`);
    loadingElement.forEach(element => editorElementParent.removeChild(element));
  }

  _cleanupEditors() {
    this._oldDiffViewEditor.destroyMarkers();
    this._newDiffViewEditor.destroyMarkers();
    this.removeLoadingIndicator(this._oldDiffViewEditor.getEditorDomElement());
    this.removeLoadingIndicator(this._newDiffViewEditor.getEditorDomElement());
  }
}
exports.ShowDiff = ShowDiff;