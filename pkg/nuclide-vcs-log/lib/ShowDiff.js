"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowDiff = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomTextEditor() {
  const data = require("../../../modules/nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _computeDiff() {
  const data = require("../../commons-node/computeDiff");

  _computeDiff = function () {
    return data;
  };

  return data;
}

function _DiffViewEditor() {
  const data = _interopRequireDefault(require("../../commons-atom/DiffViewEditor"));

  _DiffViewEditor = function () {
    return data;
  };

  return data;
}

function _LoadingSpinner() {
  const data = require("../../../modules/nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

class ShowDiff extends React.Component {
  render() {
    return React.createElement("div", {
      className: NUCLIDE_VCS_LOG_DIFF_CONTAINER_CLASSNAME
    }, React.createElement(_AtomTextEditor().AtomTextEditor, {
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
    }), React.createElement(_AtomTextEditor().AtomTextEditor, {
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
    }));
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
    const {
      filePath,
      oldContent,
      newContent
    } = this.props;
    this._oldDiffViewEditor = new (_DiffViewEditor().default)(atom.views.getView(this._oldTextEditor));
    this._newDiffViewEditor = new (_DiffViewEditor().default)(atom.views.getView(this._newTextEditor));

    this._oldDiffViewEditor.setFileContents(filePath, oldContent || '');

    this._newDiffViewEditor.setFileContents(filePath, newContent || '');

    const diff = (0, _computeDiff().computeDiff)(oldContent || '', newContent || '');

    this._oldDiffViewEditor.setHighlightedLines([], diff.removedLines);

    this._newDiffViewEditor.setHighlightedLines(diff.addedLines, []);

    this._oldDiffViewEditor.setOffsets(new Map(diff.oldLineOffsets));

    this._newDiffViewEditor.setOffsets(new Map(diff.newLineOffsets)); // Add loading spinners


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

    const loadingElement = (0, _renderReactRoot().renderReactRoot)(React.createElement(_LoadingSpinner().LoadingSpinner, {
      delay: 50,
      size: _LoadingSpinner().LoadingSpinnerSizes.LARGE
    }));
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