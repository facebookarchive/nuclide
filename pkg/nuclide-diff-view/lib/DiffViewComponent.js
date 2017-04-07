'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderPublishView = renderPublishView;
exports.renderCommitView = renderCommitView;
exports.renderTimelineView = renderTimelineView;
exports.renderFileChanges = renderFileChanges;
exports.centerScrollToBufferLine = centerScrollToBufferLine;
exports.pixelRangeForNavigationSection = pixelRangeForNavigationSection;
exports.navigationSectionStatusToEditorElement = navigationSectionStatusToEditorElement;
exports.getCenterScrollSelectedNavigationIndex = getCenterScrollSelectedNavigationIndex;

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('../../nuclide-ui/MultiRootChangedFilesView');
}

var _react = _interopRequireDefault(require('react'));

var _DiffTimelineView;

function _load_DiffTimelineView() {
  return _DiffTimelineView = _interopRequireDefault(require('./DiffTimelineView'));
}

var _DiffCommitView;

function _load_DiffCommitView() {
  return _DiffCommitView = _interopRequireDefault(require('./DiffCommitView'));
}

var _DiffPublishView;

function _load_DiffPublishView() {
  return _DiffPublishView = _interopRequireDefault(require('./DiffPublishView'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../nuclide-ui/LoadingSpinner');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let CachedPublishComponent; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             */

function getPublishComponent(shouldUseTextBasedForm) {
  if (shouldUseTextBasedForm) {
    return (_DiffPublishView || _load_DiffPublishView()).default;
  }

  if (CachedPublishComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      const { DiffViewPublishForm } = require('./fb/DiffViewPublishForm');
      CachedPublishComponent = DiffViewPublishForm;
    } catch (ex) {
      CachedPublishComponent = (_DiffPublishView || _load_DiffPublishView()).default;
    }
  }
  return CachedPublishComponent;
}

let CachedCommitComponent;
function getCommitComponent(shouldUseTextBasedForm) {
  if (shouldUseTextBasedForm) {
    return (_DiffCommitView || _load_DiffCommitView()).default;
  }

  if (CachedCommitComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      const { DiffViewCreateForm } = require('./fb/DiffViewCreateForm');
      CachedCommitComponent = DiffViewCreateForm;
    } catch (ex) {
      CachedCommitComponent = (_DiffCommitView || _load_DiffCommitView()).default;
    }
  }

  return CachedCommitComponent;
}

function renderPublishView(diffModel) {
  const {
    lintExcuse,
    publish: { message, mode, state },
    activeRepositoryState: { headRevision },
    isPrepareMode,
    shouldDockPublishView,
    shouldUseTextBasedForm,
    suggestedReviewers,
    verbatimModeEnabled
  } = diffModel.getState();
  const PublishComponent = getPublishComponent(shouldUseTextBasedForm);
  return _react.default.createElement(PublishComponent, {
    lintExcuse: lintExcuse,
    suggestedReviewers: suggestedReviewers,
    publishModeState: state,
    message: message,
    publishMode: mode,
    headCommitMessage: headRevision == null ? '' : headRevision.description,
    diffModel: diffModel,
    shouldDockPublishView: shouldDockPublishView,
    isPrepareMode: isPrepareMode,
    verbatimModeEnabled: verbatimModeEnabled
  });
}

function renderCommitView(diffModel) {
  const {
    commit: { message, mode, state },
    isPrepareMode,
    lintExcuse,
    shouldCommitInteractively,
    shouldPublishOnCommit,
    shouldRebaseOnAmend,
    shouldUseTextBasedForm,
    suggestedReviewers,
    verbatimModeEnabled,
    enabledFeatures
  } = diffModel.getState();
  const hasUncomittedChanges = diffModel.getDirtyFileChangesCount() > 0;

  const CommitComponent = getCommitComponent(shouldUseTextBasedForm);
  return _react.default.createElement(CommitComponent, {
    suggestedReviewers: suggestedReviewers,
    commitMessage: message,
    commitMode: mode,
    commitModeState: state,
    hasUncommittedChanges: hasUncomittedChanges,
    isPrepareMode: isPrepareMode,
    lintExcuse: lintExcuse,
    shouldCommitInteractively: shouldCommitInteractively,
    shouldPublishOnCommit: shouldPublishOnCommit,
    shouldRebaseOnAmend: shouldRebaseOnAmend
    // `diffModel` is acting as the action creator for commit view and needs to be passed so
    // methods can be called on it.
    , diffModel: diffModel,
    verbatimModeEnabled: verbatimModeEnabled,
    enabledFeatures: enabledFeatures
  });
}

function renderTimelineView(diffModel) {
  const onSelectionChange = revision => diffModel.setCompareRevision(revision);
  return _react.default.createElement((_DiffTimelineView || _load_DiffTimelineView()).default, {
    diffModel: diffModel,
    onSelectionChange: onSelectionChange
  });
}

function renderFileChanges(diffModel) {
  const {
    activeRepository,
    activeRepositoryState: {
      isLoadingSelectedFiles,
      selectedFiles
    },
    fileDiff
  } = diffModel.getState();
  const rootPaths = activeRepository != null ? [activeRepository.getWorkingDirectory()] : [];

  let spinnerElement = null;
  if (isLoadingSelectedFiles) {
    spinnerElement = _react.default.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
      className: 'inline-block nuclide-diff-view-file-change-spinner',
      size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.EXTRA_SMALL
    });
  }

  const emptyMessage = selectedFiles.size === 0 ? _react.default.createElement(
    'div',
    { className: 'nuclide-diff-view-padded' },
    'No file changes selected'
  ) : null;

  // Open the view, if not previously open as well as issue a diff command.
  // TODO(most): Switch to an action after migration complete to the new split UI.
  const diffFilePath = filePath => {
    if (diffModel.getState().diffEditorsVisible) {
      diffModel.diffFile(filePath);
    } else {
      // This is not a file URI
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open((0, (_utils || _load_utils()).formatDiffViewUrl)({ file: filePath }));
    }
  };

  const getCompareRevision = () => {
    const { compareRevisionId } = diffModel.getState().activeRepositoryState;
    return compareRevisionId == null ? null : `${compareRevisionId}`;
  };

  return _react.default.createElement(
    'div',
    { className: 'nuclide-diff-view-tree' },
    _react.default.createElement(
      'div',
      { className: 'padded' },
      'File Changes',
      spinnerElement
    ),
    _react.default.createElement(
      'div',
      null,
      _react.default.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
        commandPrefix: 'nuclide-diff-view',
        fileChanges: (0, (_vcs || _load_vcs()).getMultiRootFileChanges)(selectedFiles, rootPaths),
        getRevertTargetRevision: getCompareRevision,
        selectedFile: fileDiff.filePath,
        onFileChosen: diffFilePath
      }),
      emptyMessage
    )
  );
}

function centerScrollToBufferLine(textEditorElement, bufferLineNumber) {
  const textEditor = textEditorElement.getModel();
  const pixelPositionTop = textEditorElement.pixelPositionForBufferPosition([bufferLineNumber, 0]).top;
  // Manually calculate the scroll location, instead of using
  // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
  // because that API to wouldn't center the line if it was in the visible screen range.
  const scrollTop = pixelPositionTop + textEditor.getLineHeightInPixels() / 2 - textEditorElement.clientHeight / 2;
  textEditorElement.setScrollTop(Math.max(scrollTop, 1));

  textEditorElement.focus();

  textEditor.setCursorBufferPosition([bufferLineNumber, 0], { autoscroll: false });
}

function pixelRangeForNavigationSection(oldEditorElement, newEditorElement, navigationSection) {
  const { status, lineNumber, lineCount } = navigationSection;
  const textEditorElement = navigationSectionStatusToEditorElement(oldEditorElement, newEditorElement, status);
  const lineHeight = textEditorElement.getModel().getLineHeightInPixels();
  return {
    top: textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top,
    bottom: textEditorElement.pixelPositionForBufferPosition([lineNumber + lineCount - 1, 0]).top + lineHeight
  };
}

function navigationSectionStatusToEditorElement(oldEditorElement, newEditorElement, navigationSectionStatus) {
  switch (navigationSectionStatus) {
    case (_constants || _load_constants()).NavigationSectionStatus.ADDED:
    case (_constants || _load_constants()).NavigationSectionStatus.CHANGED:
    case (_constants || _load_constants()).NavigationSectionStatus.NEW_ELEMENT:
      return newEditorElement;
    case (_constants || _load_constants()).NavigationSectionStatus.REMOVED:
    case (_constants || _load_constants()).NavigationSectionStatus.OLD_ELEMENT:
      return oldEditorElement;
    default:
      throw new Error('Invalid diff section status');
  }
}

function getCenterScrollSelectedNavigationIndex(editorElements, navigationSections) {
  const elementsScrollCenter = editorElements.map(editorElement => {
    const scrollTop = editorElement.getScrollTop();
    return scrollTop + editorElement.clientHeight / 2;
  });

  let selectedSectionIndex = -1;

  // TODO(most): Pre-compute the positions of the diff sections.
  // Q: when to invalidate (line edits, UI elements & diff reloads, ..etc.)
  for (let sectionIndex = 0; sectionIndex < navigationSections.length; sectionIndex++) {
    const { status, lineNumber } = navigationSections[sectionIndex];
    const textEditorElement = navigationSectionStatusToEditorElement(editorElements[0], editorElements[1], status);
    const sectionPixelTop = textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top;

    const sectionEditorIndex = editorElements.indexOf(textEditorElement);
    const sectionEditorScrollCenter = elementsScrollCenter[sectionEditorIndex];

    if (sectionEditorScrollCenter >= sectionPixelTop) {
      selectedSectionIndex = sectionIndex;
    }
  }

  return selectedSectionIndex;
}