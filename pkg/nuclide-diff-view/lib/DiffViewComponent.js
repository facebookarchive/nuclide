/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  NavigationSection,
  NavigationSectionStatusType,
} from './types';
import type DiffViewModel from './DiffViewModel';

import {MultiRootChangedFilesView} from '../../nuclide-ui/MultiRootChangedFilesView';
import React from 'react';
import DiffTimelineView from './DiffTimelineView';
import DiffCommitView from './DiffCommitView';
import DiffPublishView from './DiffPublishView';
import {NavigationSectionStatus} from './constants';
import {getMultiRootFileChanges} from '../../commons-atom/vcs';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from '../../nuclide-ui/LoadingSpinner';
import {formatDiffViewUrl} from './utils';

let CachedPublishComponent;
function getPublishComponent(shouldUseTextBasedForm: boolean) {
  if (shouldUseTextBasedForm) {
    return DiffPublishView;
  }

  if (CachedPublishComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      const {DiffViewPublishForm} = require('./fb/DiffViewPublishForm');
      CachedPublishComponent = DiffViewPublishForm;
    } catch (ex) {
      CachedPublishComponent = DiffPublishView;
    }
  }
  return CachedPublishComponent;
}

let CachedCommitComponent;
function getCommitComponent(shouldUseTextBasedForm: boolean) {
  if (shouldUseTextBasedForm) {
    return DiffCommitView;
  }

  if (CachedCommitComponent == null) {
    // Try requiring private module
    try {
      // $FlowFB
      const {DiffViewCreateForm} = require('./fb/DiffViewCreateForm');
      CachedCommitComponent = DiffViewCreateForm;
    } catch (ex) {
      CachedCommitComponent = DiffCommitView;
    }
  }

  return CachedCommitComponent;
}

export function renderPublishView(diffModel: DiffViewModel): React.Element<any> {
  const {
    lintExcuse,
    publish: {message, mode, state},
    activeRepositoryState: {headRevision},
    isPrepareMode,
    shouldDockPublishView,
    shouldUseTextBasedForm,
    suggestedReviewers,
    verbatimModeEnabled,
  } = diffModel.getState();
  const PublishComponent = getPublishComponent(shouldUseTextBasedForm);
  return (
    <PublishComponent
      lintExcuse={lintExcuse}
      suggestedReviewers={suggestedReviewers}
      publishModeState={state}
      message={message}
      publishMode={mode}
      headCommitMessage={headRevision == null ? '' : headRevision.description}
      diffModel={diffModel}
      shouldDockPublishView={shouldDockPublishView}
      isPrepareMode={isPrepareMode}
      verbatimModeEnabled={verbatimModeEnabled}
    />
  );
}

export function renderCommitView(diffModel: DiffViewModel): React.Element<any> {
  const {
    commit: {message, mode, state},
    isPrepareMode,
    lintExcuse,
    shouldCommitInteractively,
    shouldPublishOnCommit,
    shouldRebaseOnAmend,
    shouldUseTextBasedForm,
    suggestedReviewers,
    verbatimModeEnabled,
    enabledFeatures,
  } = diffModel.getState();
  const hasUncomittedChanges = diffModel.getDirtyFileChangesCount() > 0;

  const CommitComponent = getCommitComponent(shouldUseTextBasedForm);
  return (
    <CommitComponent
      suggestedReviewers={suggestedReviewers}
      commitMessage={message}
      commitMode={mode}
      commitModeState={state}
      hasUncommittedChanges={hasUncomittedChanges}
      isPrepareMode={isPrepareMode}
      lintExcuse={lintExcuse}
      shouldCommitInteractively={shouldCommitInteractively}
      shouldPublishOnCommit={shouldPublishOnCommit}
      shouldRebaseOnAmend={shouldRebaseOnAmend}
      // `diffModel` is acting as the action creator for commit view and needs to be passed so
      // methods can be called on it.
      diffModel={diffModel}
      verbatimModeEnabled={verbatimModeEnabled}
      enabledFeatures={enabledFeatures}
    />
  );
}

export function renderTimelineView(diffModel: DiffViewModel): React.Element<any> {
  const onSelectionChange = revision => diffModel.setCompareRevision(revision);
  return (
    <DiffTimelineView
      diffModel={diffModel}
      onSelectionChange={onSelectionChange}
    />
  );
}

export function renderFileChanges(diffModel: DiffViewModel): React.Element<any> {
  const {
    activeRepository,
    activeRepositoryState: {
      isLoadingSelectedFiles,
      selectedFiles,
    },
    fileDiff,
  } = diffModel.getState();
  const rootPaths = activeRepository != null ? [activeRepository.getWorkingDirectory()] : [];

  let spinnerElement = null;
  if (isLoadingSelectedFiles) {
    spinnerElement = (
      <LoadingSpinner
        className="inline-block nuclide-diff-view-file-change-spinner"
        size={LoadingSpinnerSizes.EXTRA_SMALL}
      />
    );
  }

  const emptyMessage = selectedFiles.size === 0
    ? <div className="nuclide-diff-view-padded">No file changes selected</div>
    : null;

  // Open the view, if not previously open as well as issue a diff command.
  // TODO(most): Switch to an action after migration complete to the new split UI.
  const diffFilePath = filePath => {
    if (diffModel.getState().diffEditorsVisible) {
      diffModel.diffFile(filePath);
    } else {
      // This is not a file URI
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(formatDiffViewUrl({file: filePath}));
    }
  };

  const getCompareRevision = () => {
    const {compareRevisionId} = diffModel.getState().activeRepositoryState;
    return compareRevisionId == null ? null : `${compareRevisionId}`;
  };

  return (
    <div className="nuclide-diff-view-tree">
      <div className="padded">File Changes{spinnerElement}</div>
      <div>
        <MultiRootChangedFilesView
          commandPrefix="nuclide-diff-view"
          fileChanges={getMultiRootFileChanges(selectedFiles, rootPaths)}
          getRevertTargetRevision={getCompareRevision}
          selectedFile={fileDiff.filePath}
          onFileChosen={diffFilePath}
        />
        {emptyMessage}
      </div>
    </div>
  );
}

export function centerScrollToBufferLine(
  textEditorElement: atom$TextEditorElement,
  bufferLineNumber: number,
): void {
  const textEditor = textEditorElement.getModel();
  const pixelPositionTop = textEditorElement
    .pixelPositionForBufferPosition([bufferLineNumber, 0]).top;
  // Manually calculate the scroll location, instead of using
  // `textEditor.scrollToBufferPosition([lineNumber, 0], {center: true})`
  // because that API to wouldn't center the line if it was in the visible screen range.
  const scrollTop = pixelPositionTop
    + textEditor.getLineHeightInPixels() / 2
    - textEditorElement.clientHeight / 2;
  textEditorElement.setScrollTop(Math.max(scrollTop, 1));

  textEditorElement.focus();

  textEditor.setCursorBufferPosition(
    [bufferLineNumber, 0],
    {autoscroll: false},
  );
}

export function pixelRangeForNavigationSection(
  oldEditorElement: atom$TextEditorElement,
  newEditorElement: atom$TextEditorElement,
  navigationSection: NavigationSection,
): {top: number, bottom: number} {
  const {status, lineNumber, lineCount} = navigationSection;
  const textEditorElement = navigationSectionStatusToEditorElement(
    oldEditorElement, newEditorElement, status);
  const lineHeight = textEditorElement.getModel().getLineHeightInPixels();
  return {
    top: textEditorElement.pixelPositionForBufferPosition([lineNumber, 0]).top,
    bottom: textEditorElement.pixelPositionForBufferPosition([lineNumber + lineCount - 1, 0]).top
      + lineHeight,
  };
}

export function navigationSectionStatusToEditorElement(
  oldEditorElement: atom$TextEditorElement,
  newEditorElement: atom$TextEditorElement,
  navigationSectionStatus: NavigationSectionStatusType,
): atom$TextEditorElement {
  switch (navigationSectionStatus) {
    case NavigationSectionStatus.ADDED:
    case NavigationSectionStatus.CHANGED:
    case NavigationSectionStatus.NEW_ELEMENT:
      return newEditorElement;
    case NavigationSectionStatus.REMOVED:
    case NavigationSectionStatus.OLD_ELEMENT:
      return oldEditorElement;
    default:
      throw new Error('Invalid diff section status');
  }
}

export function getCenterScrollSelectedNavigationIndex(
  editorElements: [atom$TextEditorElement, atom$TextEditorElement],
  navigationSections: Array<NavigationSection>,
): number {
  const elementsScrollCenter = editorElements.map(editorElement => {
    const scrollTop = editorElement.getScrollTop();
    return scrollTop + editorElement.clientHeight / 2;
  });

  let selectedSectionIndex = -1;

  // TODO(most): Pre-compute the positions of the diff sections.
  // Q: when to invalidate (line edits, UI elements & diff reloads, ..etc.)
  for (let sectionIndex = 0; sectionIndex < navigationSections.length; sectionIndex++) {
    const {status, lineNumber} = navigationSections[sectionIndex];
    const textEditorElement = navigationSectionStatusToEditorElement(
      editorElements[0],
      editorElements[1],
      status,
    );
    const sectionPixelTop = textEditorElement
      .pixelPositionForBufferPosition([lineNumber, 0]).top;

    const sectionEditorIndex = editorElements.indexOf(textEditorElement);
    const sectionEditorScrollCenter = elementsScrollCenter[sectionEditorIndex];

    if (sectionEditorScrollCenter >= sectionPixelTop) {
      selectedSectionIndex = sectionIndex;
    }
  }

  return selectedSectionIndex;
}
