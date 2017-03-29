/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {
  AppState,
  FileDiffState,
  NavigationSection,
  NavigationSectionStatusType,
} from '../types';
import typeof * as BoundActionCreators from '../redux/Actions';

import UniversalDisposable from '../../../commons-node/UniversalDisposable';
import DiffViewEditor from '../DiffViewEditor';
import SyncScroll from '../SyncScroll';
import {Observable} from 'rxjs';
import invariant from 'assert';
import {observableFromSubscribeFunction} from '../../../commons-node/event';
import {nextTick} from '../../../commons-node/promise';
import {notifyInternalError} from '../notifications';
import {observeElementDimensions} from '../../../commons-atom/observe-element-dimensions';
import {
  getCenterScrollSelectedNavigationIndex,
  centerScrollToBufferLine,
  pixelRangeForNavigationSection,
  navigationSectionStatusToEditorElement,
} from '../DiffViewComponent';
import React from 'react';
import {
  clickEventToScrollLineNumber,
  DiffNavigationBar,
} from '../DiffNavigationBar';
import {bindObservableAsProps} from '../../../nuclide-ui/bindObservableAsProps';
import {renderReactRoot} from '../../../commons-atom/renderReactRoot';
import {getLogger} from '../../../nuclide-logging';
import {compact} from '../../../commons-node/observable';
import {
  enforceReadOnly,
  enforceSoftWrap,
} from '../../../commons-atom/text-editor';
import {goToLocation} from '../../../commons-atom/go-to-location';
import {DIFF_EDITOR_MARKER_CLASS} from '../../../commons-atom/vcs';
import {
  LoadingSpinner,
  LoadingSpinnerSizes,
} from '../../../nuclide-ui/LoadingSpinner';
import {track} from '../../../nuclide-analytics';

const DIFF_VIEW_NAVIGATION_TARGET = 'nuclide-diff-view-navigation-target';
const NAVIGATION_GUTTER_NAME = 'nuclide-diff-split-navigation';
const NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME = 'nuclide-diff-view-editor-loading';
const READ_ONLY_EDITOR_CLASS = 'nuclide-diff-view-read-only-editor';
const DIFF_SPINNER_DELAY_MS = 50;
const SCROLL_FIRST_CHANGE_DELAY_MS = 100;
export const NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME = 'nuclide-diff-view-pane-loading-indicator';
export const READ_ONLY_EDITOR_PATH = 'nuclide-diff-view-read-only-path';

function cleanUpEditor(editor: atom$TextEditor): void {
  // When one of the editors gets destroyed by Atom pane item change,
  // Atom will error with further mutations at the same process cycle.
  // Hence, this delays the cleanup by one cycle to avoid the error.
  process.nextTick(() => editor.destroy());
}

function getReadOnlyEditor(): atom$TextEditor {
  const textEditor = atom.workspace.buildTextEditor({autoHeight: false});
  enforceReadOnly(textEditor);

  textEditor.getTitle = () => 'Original (Read Only)';
  textEditor.isModified = () => false;
  textEditor.getURI = () => READ_ONLY_EDITOR_PATH;
  textEditor.serialize = () => null;

  return textEditor;
}

type DiffEditorsResult = {
  navigationGutter: atom$Gutter,
  newDiffEditor: DiffViewEditor,
  oldDiffEditor: DiffViewEditor,
  disposables: UniversalDisposable,
};

/**
 * Split the pane items, if not already split.
 */
async function getDiffEditors(
  filePath: NuclideUri,
): Promise<DiffEditorsResult> {
  let newEditor: atom$TextEditor;
  const disposables = new UniversalDisposable();

  // Wait for next tick to allow the atom workspace panes to update its
  // state with the possibly just-opened editor.
  await nextTick();
  let newEditorPane = atom.workspace.paneForURI(filePath);
  if (newEditorPane != null) {
    const newEditorItem = newEditorPane.itemForURI(filePath);
    newEditorPane.activateItem(newEditorItem);
    newEditor = ((newEditorItem: any): atom$TextEditor);
  } else {
    newEditor = await goToLocation(filePath);
    // Allow the atom workspace to update its state before querying for
    // the new editor's pane.
    await nextTick();
    newEditorPane = atom.workspace.paneForURI(filePath);
    invariant(newEditorPane != null, 'Cannot find a pane for the opened text editor');
  }

  disposables.add(
    enforceSoftWrap(newEditor, false),
    () => newEditor.setSoftWrapped((atom.config.get('editor.softWrap'): any)),
  );

  const navigationGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME) || newEditor.addGutter({
    name: NAVIGATION_GUTTER_NAME,
    priority: -1500,
    visible: true,
  });

  disposables.add(() => {
    const addedGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME);
    if (addedGutter != null) {
      addedGutter.destroy();
    }
  });

  const oldEditor = getReadOnlyEditor();
  newEditorPane.addItem(oldEditor);
  newEditorPane.activateItem(oldEditor);
  atom.commands.dispatch(
    atom.views.getView(oldEditor),
    'nuclide-move-item-to-available-pane:left',
  );
  // Allow the atom workspace to update its state before querying the views for the editor.
  await nextTick();

  disposables.add(
    enforceSoftWrap(oldEditor, false),
    () => cleanUpEditor(oldEditor),
  );

  newEditorPane.activateItem(newEditor);
  newEditorPane.activate();

  // Unfold all lines so diffs properly align.
  newEditor.unfoldAll();
  oldEditor.unfoldAll();

  const newEditorElement = atom.views.getView(newEditor);
  const oldEditorElement = atom.views.getView(oldEditor);

  const newDiffEditor = new DiffViewEditor(newEditorElement);
  const oldDiffEditor = new DiffViewEditor(oldEditorElement);

  disposables.add(
    () => newDiffEditor.destroyMarkers(),
    () => oldDiffEditor.destroyMarkers(),
  );

  // Add marker classes to be used for atom command registeration.
  newEditorElement.classList.add(DIFF_EDITOR_MARKER_CLASS);
  oldEditorElement.classList.add(READ_ONLY_EDITOR_CLASS);
  oldEditorElement.classList.add(DIFF_EDITOR_MARKER_CLASS);
  disposables.add(() => newEditorElement.classList.remove(DIFF_EDITOR_MARKER_CLASS));

  disposables.add(
    new SyncScroll(
      oldEditorElement,
      newEditorElement,
    ),
  );

  return {
    navigationGutter,
    newDiffEditor,
    oldDiffEditor,
    disposables,
  };
}

function wrapDiffEditorObservable(
  promise: Promise<DiffEditorsResult>,
): Observable<?DiffEditorsResult> {
  let result;

  return Observable.fromPromise(promise)
    .switchMap(_result => {
      result = _result;
      const newEditor = result.newDiffEditor.getEditor();
      const oldEditor = result.oldDiffEditor.getEditor();
      return Observable.of(result)
        .merge(Observable.never())
        // If any of the editors is closed or the user switched to a different file,
        // the Diff View is closed.
        .takeUntil(Observable.merge(
          observableFromSubscribeFunction(
            atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace))
            .filter(() => {
              const activePaneItem = atom.workspace.getActivePaneItem();
              return activePaneItem !== newEditor && activePaneItem !== oldEditor;
            }),
          observableFromSubscribeFunction(newEditor.onDidDestroy.bind(newEditor)),
          observableFromSubscribeFunction(oldEditor.onDidDestroy.bind(oldEditor)),
        )).concat(Observable.of(null));
    })
    .startWith(null)
    .finally(() => {
      if (result != null) {
        result.disposables.dispose();
      }
    });
}

function renderNavigationBarAtGutter(
  diffEditors: DiffEditorsResult,
  fileDiffs: Observable<FileDiffState>,
  dimesionsUpdates: Observable<null>,
): void {
  const {oldDiffEditor, newDiffEditor, navigationGutter} = diffEditors;
  const oldEditorElement = oldDiffEditor.getEditorDomElement();
  const newEditorElement = newDiffEditor.getEditorDomElement();
  const boundPixelRangeForNavigationSection = pixelRangeForNavigationSection
    .bind(null, oldEditorElement, newEditorElement);

  const onNavigateToNavigationSection = (
    navigationSectionStatus: NavigationSectionStatusType,
    scrollToLineNumber: number,
  ) => {
    const textEditorElement = navigationSectionStatusToEditorElement(
      oldEditorElement, newEditorElement, navigationSectionStatus);
    centerScrollToBufferLine(textEditorElement, scrollToLineNumber);
  };

  const fakeNavigationHandler = () => {
    // TODO(most): use the React handler instead of DOM when it's fixed in the editor gutter.
    getLogger().warn('Gutter click events never go through!');
  };

  const navigationGutterView = atom.views.getView(navigationGutter);
  const BoundNavigationBarComponent = bindObservableAsProps(
    Observable.combineLatest(fileDiffs, dimesionsUpdates)
      // Debounce diff sections rendering to avoid blocking the UI.
      .debounceTime(50)
      .switchMap(([{navigationSections}]) => {
        const gutterContainer: HTMLElement = (navigationGutterView.parentNode: any);
        if (gutterContainer == null) {
          getLogger().error('Split Diff Error: Navigation gutter is not mounted!');
          return Observable.empty();
        }

        const editorLineHeight = oldDiffEditor.getEditor().getLineHeightInPixels();
        const diffEditorsHeight = Math.max(
          oldEditorElement.getScrollHeight(),
          newEditorElement.getScrollHeight(),
          1, // Protect against zero scroll height while initializring editors.
        );
        const navigationScale = gutterContainer.clientHeight / diffEditorsHeight;

        return Observable.of({
          navigationSections,
          navigationScale,
          editorLineHeight,
          pixelRangeForNavigationSection: boundPixelRangeForNavigationSection,
          onNavigateToNavigationSection: fakeNavigationHandler,
        });
      }),
    DiffNavigationBar,
  );

  const navigationElement = renderReactRoot(<BoundNavigationBarComponent />);
  navigationElement.className = 'nuclide-diff-view-split-navigation-gutter';
  navigationGutterView.style.position = 'relative';
  navigationGutterView.appendChild(navigationElement);

  // The gutter elements don't receive the click.
  // Hence, the need to inject DOM attributes in navigation targets,
  // and use  here for
  navigationGutterView.addEventListener('click', (event: MouseEvent) => {
    // classList isn't in the defs of EventTarget...
    const target: HTMLElement = (event.target: any);
    if (!target.classList.contains(DIFF_VIEW_NAVIGATION_TARGET)) {
      return;
    }
    const navigationStatus: NavigationSectionStatusType =
      (target.getAttribute('nav-status'): any);
    const navigationLineCount = parseInt(target.getAttribute('nav-line-count'), 10);
    const navigationLineNumber = parseInt(target.getAttribute('nav-line-number'), 10);
    const scrollToLineNumber = clickEventToScrollLineNumber(
      navigationLineNumber, navigationLineCount, (event: any));
    onNavigateToNavigationSection(navigationStatus, scrollToLineNumber);
  });
}

function updateEditorLoadingIndicator(
  editorElement: atom$TextEditorElement,
  isLoading: boolean,
) {
  // Adding to the parent because the atom-text-editor isn't relatively positioned.
  const editorParent: HTMLElement = (editorElement.parentNode: any);
  if (editorParent == null) {
    getLogger().error('Split Diff Error: Editor is not yet mounted!');
    return;
  }

  function removeLoadingIndicator() {
    // Unfade the editor and hide the loading spinner with delay.
    editorElement.classList.remove(NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME);
    const loadingElement = editorParent
      .querySelector(`.${NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME}`);
    if (loadingElement != null) {
      editorParent.removeChild(loadingElement);
    }
  }

  removeLoadingIndicator();

  if (isLoading) {
    // Fade the editor and show the loading spinner with delay.
    editorElement.classList.add(NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME);
    const loadingElement = renderReactRoot(
      <LoadingSpinner delay={DIFF_SPINNER_DELAY_MS} size={LoadingSpinnerSizes.LARGE} />,
    );
    loadingElement.classList.add(NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME);
    editorParent.appendChild(loadingElement);
  }
}

function centerScrollToFirstChange(
  diffEditors: DiffEditorsResult,
  navigationSections: Array<NavigationSection>,
): void {
  if (navigationSections.length === 0) {
    return;
  }

  const {oldDiffEditor, newDiffEditor} = diffEditors;
  const firstSection = navigationSections[0];
  const editorElement = navigationSectionStatusToEditorElement(
    oldDiffEditor.getEditorDomElement(),
    newDiffEditor.getEditorDomElement(),
    firstSection.status,
  );

  centerScrollToBufferLine(editorElement, firstSection.lineNumber);
}

export default class SplitDiffView {
  _disposables: UniversalDisposable;

  constructor(states: Observable<AppState>, actionCreators: BoundActionCreators) {
    this._disposables = new UniversalDisposable();

    const diffEditorsStream: Observable<?DiffEditorsResult> = states
      .map(state => state.fileDiff.filePath)
      .distinctUntilChanged()
      .switchMap(filePath => {
        if (!filePath) {
          return Observable.empty();
        } else {
          return wrapDiffEditorObservable(getDiffEditors(filePath))
            .catch(error => {
              notifyInternalError(error);
              return Observable.empty();
            });
        }
      }).share();

    const fileDiffs = states
      .map(({fileDiff}) => fileDiff)
      .distinctUntilChanged();

    const diffStateStream = fileDiffs
      .distinctUntilChanged((fileDiff1, fileDiff2) => {
        return fileDiff1.oldEditorState === fileDiff2.oldEditorState
          && fileDiff1.newEditorState === fileDiff2.newEditorState;
      });

    const uiElementStream = fileDiffs
      .distinctUntilChanged((fileDiff1, fileDiff2) => {
        return fileDiff1.oldEditorState.inlineElements
          === fileDiff2.oldEditorState.inlineElements
          && fileDiff1.oldEditorState.inlineOffsetElements
            === fileDiff2.oldEditorState.inlineOffsetElements
          && fileDiff1.newEditorState.inlineElements
            === fileDiff2.newEditorState.inlineElements
          && fileDiff1.newEditorState.inlineOffsetElements
            === fileDiff2.newEditorState.inlineOffsetElements;
      });

    const updateDiffSubscriptions = Observable.combineLatest(diffEditorsStream, diffStateStream)
      .subscribe(([diffEditors, fileDiff]) => {
        if (diffEditors == null) {
          // One or both editors were destroyed.
          return;
        }
        try {
          const {newDiffEditor, oldDiffEditor} = diffEditors;
          const {filePath, oldEditorState, newEditorState} = fileDiff;
          oldDiffEditor.setFileContents(filePath, oldEditorState.text);
          oldDiffEditor.setHighlightedLines([], oldEditorState.highlightedLines.removed);
          oldDiffEditor.setOffsets(oldEditorState.offsets);

          newDiffEditor.setHighlightedLines(newEditorState.highlightedLines.added, []);
          newDiffEditor.setOffsets(newEditorState.offsets);
        } catch (error) {
          notifyInternalError(error);
        }
      });

    const uiElementsUpdates = Observable.combineLatest(diffEditorsStream, uiElementStream)
      .subscribe(([diffEditors, fileDiff]) => {
        if (diffEditors == null) {
          // One or both editors were destroyed.
          return;
        }

        try {
          const {newDiffEditor, oldDiffEditor} = diffEditors;
          const {lineMapping, oldEditorState, newEditorState} = fileDiff;

          oldDiffEditor.setUiElements(oldEditorState.inlineElements);
          oldDiffEditor.setOffsetUiElements(
            oldEditorState.inlineOffsetElements, lineMapping.newToOld);
          newDiffEditor.setUiElements(newEditorState.inlineElements);
          newDiffEditor.setOffsetUiElements(
            newEditorState.inlineOffsetElements, lineMapping.oldToNew);
        } catch (error) {
          notifyInternalError(error);
        }
      });

    const diffEditorsUpdates = diffEditorsStream
      .debounceTime(100)
      .subscribe(diffEditors => {
        actionCreators.updateDiffEditorsVisibility(diffEditors != null);
        actionCreators.updateDiffEditors(diffEditors);
      });

    const activeSectionUpdates = diffEditorsStream
      .switchMap(diffEditors => {
        if (diffEditors == null) {
          return Observable.empty();
        }
        const {newDiffEditor, oldDiffEditor} = diffEditors;
        const newEditorElement = newDiffEditor.getEditorDomElement();
        const oldEditorElement = oldDiffEditor.getEditorDomElement();

        return Observable.combineLatest(
          fileDiffs,
          Observable.merge(
            observableFromSubscribeFunction(
              newEditorElement.onDidChangeScrollTop.bind(newEditorElement)),
            observableFromSubscribeFunction(
              oldEditorElement.onDidChangeScrollTop.bind(oldEditorElement)),
          ),
        )
        .debounceTime(100)
        .map(([fileDiff]) => {
          return getCenterScrollSelectedNavigationIndex(
            [oldEditorElement, newEditorElement], fileDiff.navigationSections);
        })
        .distinctUntilChanged();
      }).subscribe((sectionIndex: number) => {
        actionCreators.updateActiveNavigationSection(sectionIndex);
      });

    const navigationGutterUpdates = compact(diffEditorsStream)
      .debounceTime(50)
      .subscribe(diffEditors => {
        const dimesionsUpdates = Observable.merge(
          observeElementDimensions(diffEditors.newDiffEditor.getEditorDomElement()),
          observeElementDimensions(diffEditors.oldDiffEditor.getEditorDomElement()),
        ).debounceTime(20)
        .mapTo(null);
        try {
          renderNavigationBarAtGutter(
            diffEditors,
            fileDiffs,
            dimesionsUpdates,
          );
        } catch (error) {
          notifyInternalError(error);
        }
      });

    const diffLoadingIndicatorUpdates = diffEditorsStream
      .switchMap(diffEditors => {
        if (diffEditors == null) {
          return Observable.empty();
        }
        return states
          .map(({isLoadingFileDiff}) => isLoadingFileDiff)
          .distinctUntilChanged()
          .map(isLoading => {
            const editorElement = diffEditors.oldDiffEditor.getEditorDomElement();
            return {editorElement, isLoading};
          });
      })
      .subscribe(({editorElement, isLoading}) => {
        try {
          updateEditorLoadingIndicator(editorElement, isLoading);
        } catch (error) {
          getLogger().error('Split Diff Error: Could not update loading indicator', error);
        }
      });


    const scrollToFirstChange = diffEditorsStream.switchMap(diffEditors => {
      if (diffEditors == null) {
        return Observable.empty();
      }

      // Wait for the diff text to load.
      return states
        .filter(({fileDiff}) => fileDiff.oldEditorState.text.length > 0)
        .first()
        // Wait for the diff editor to render the UI state.
        .delay(SCROLL_FIRST_CHANGE_DELAY_MS)
        .map(({fileDiff: {navigationSections}}) => {
          return {diffEditors, navigationSections};
        });
    }).subscribe(({diffEditors, navigationSections}) => {
      try {
        centerScrollToFirstChange(diffEditors, navigationSections);
      } catch (error) {
        getLogger().error('Split Diff Error: Could not scroll to first change', error);
      }
    });

    const trackSavingInSplit = diffEditorsStream
      .switchMap(diffEditors => {
        if (diffEditors == null) {
          return Observable.empty();
        }

        const newEditor = diffEditors.newDiffEditor.getEditor();
        return observableFromSubscribeFunction(newEditor.onDidSave.bind(newEditor));
      }).subscribe(() => track('diff-view-save-file'));

    this._disposables.add(
      activeSectionUpdates,
      diffEditorsUpdates,
      diffLoadingIndicatorUpdates,
      navigationGutterUpdates,
      scrollToFirstChange,
      trackSavingInSplit,
      uiElementsUpdates,
      updateDiffSubscriptions,
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
