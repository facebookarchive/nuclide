'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../commons-node/nuclideUri';
import type {
  AppState,
  FileDiffState,
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
import {
  centerScrollToBufferLine,
  pixelRangeForNavigationSection,
  navigationSectionStatusToEditorElement,
} from '../DiffViewComponent';
import {React} from 'react-for-atom';
import {
  clickEventToScrollLineNumber,
  DiffNavigationBar,
} from '../DiffNavigationBar';
import {bindObservableAsProps} from '../../../nuclide-ui/bindObservableAsProps';
import {renderReactRoot} from '../../../commons-atom/renderReactRoot';
import {getLogger} from '../../../nuclide-logging';
import {compact} from '../../../commons-node/observable';

const DIFF_VIEW_NAVIGATION_TARGET = 'nuclide-diff-view-navigation-target';
const NAVIGATION_GUTTER_NAME = 'nuclide-diff-split-navigation';
const READ_ONLY_EDITOR_PATH = 'nuclide-diff-view-read-olnly-path';

function cleanUpEditor(editor: atom$TextEditor): void {
  // if the pane that this editor was in is now empty, we will destroy it.
  const editorPane = atom.workspace.paneForItem(editor);
  if (typeof editorPane !== 'undefined'
    && editorPane != null
    && editorPane.getItems().length === 1
  ) {
    editorPane.destroy();
  } else {
    editor.destroy();
  }
}

function forceReadOnly(textEditor: atom$TextEditor): void {
  const noop = () => {};
  // Cancel insert events to prevent typing in the text editor and disallow editing (read-only).
  textEditor.onWillInsertText(event => {
    event.cancel();
  });

  // Make pasting in the text editor a no-op to disallow editing (read-only).
  textEditor.pasteText = noop;

  // Make delete key presses in the text editor a no-op to disallow editing (read-only).
  textEditor.delete = noop;

  // Make backspace key presses in the text editor a no-op to disallow editing (read-only).
  textEditor.backspace = noop;

  // Make duplicate lines a no-op to disallow editing (read-only).
  textEditor.duplicateLines = noop;

  textEditor.getTitle = () => 'Diff View / Read Only';
  textEditor.isModified = () => false;
  textEditor.getURI = () => READ_ONLY_EDITOR_PATH;
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
  let oldEditor: atom$TextEditor;
  const disposables = new UniversalDisposable();

  // Wait for next tick to allow the atom workspace panes to update its
  // state with the possibly just-opened editor.
  await nextTick();
  const newEditorPane = atom.workspace.paneForURI(filePath);
  if (newEditorPane != null) {
    const newEditorItem = newEditorPane.itemForURI(filePath);
    newEditorPane.activateItem(newEditorItem);
    newEditor = ((newEditorItem: any): atom$TextEditor);
    disposables.add(() =>
      newEditor.setSoftWrapped((atom.config.get('editor.softWrap'): any)));
  } else {
    newEditor = ((await atom.workspace.open(filePath): any): atom$TextEditor);
    // Allow the atom workspace to update its state before querying for
    // the new editor's pane.
    await nextTick();
    disposables.add(() => cleanUpEditor(newEditor));
  }

  const navigationGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME) || newEditor.addGutter({
    name: NAVIGATION_GUTTER_NAME,
    visible: false,
  });

  disposables.add(() => {
    const addedGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME);
    if (addedGutter != null) {
      addedGutter.destroy();
    }
  });

  const oldEditorPane = atom.workspace.paneForURI(READ_ONLY_EDITOR_PATH);
  if (oldEditorPane == null && atom.workspace.getPanes().length > 1) {
    throw new Error(
      'Workspace have multiple panes\n' +
      'Please close your split panes before opening the Diff View',
    );
  }
  if (oldEditorPane != null) {
    const oldEditorItem = oldEditorPane.itemForURI(READ_ONLY_EDITOR_PATH);
    oldEditorPane.activateItem(oldEditorItem);
    oldEditor = ((oldEditorItem: any): atom$TextEditor);
  } else {
    oldEditor = atom.workspace.buildTextEditor({});
    forceReadOnly(oldEditor);
    const rightPane = atom.workspace.paneForItem(newEditor);
    invariant(rightPane != null, `editor1 pane cannot be found! ${newEditor.getPath() || ''}`);
    const leftPane = rightPane.splitLeft();
    leftPane.addItem(oldEditor);
    disposables.add(() => cleanUpEditor(oldEditor));
  }

  // Unfold all lines so diffs properly align.
  newEditor.unfoldAll();
  oldEditor.unfoldAll();

  // Turn off soft wrap setting for these editors so diffs properly align.
  newEditor.setSoftWrapped(false);
  oldEditor.setSoftWrapped(false);

  const newEditorElement = atom.views.getView(newEditor);
  const oldEditorElement = atom.views.getView(oldEditor);

  const newDiffEditor = new DiffViewEditor(newEditorElement);
  const oldDiffEditor = new DiffViewEditor(oldEditorElement);

  disposables.add(
    () => newDiffEditor.destroyMarkers(),
    () => oldDiffEditor.destroyMarkers(),
  );

  disposables.add(
    new SyncScroll(
      newEditorElement,
      oldEditorElement,
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
  const gutterContainer: HTMLElement = (navigationGutterView.parentNode: any);

  const BoundNavigationBarComponent = bindObservableAsProps(
    fileDiffs
      // Debounce diff sections rendering to avoid blocking the UI.
      .debounceTime(50)
      .map(({navigationSections}) => {
        const editorLineHeight = oldDiffEditor.getEditor().getLineHeightInPixels();
        const diffEditorsHeight = Math.max(
          oldEditorElement.getScrollHeight(),
          newEditorElement.getScrollHeight(),
          1, // Protect against zero scroll height while initializring editors.
        );
        const navigationScale = gutterContainer.clientHeight / diffEditorsHeight;

        return {
          navigationSections,
          navigationScale,
          editorLineHeight,
          pixelRangeForNavigationSection: boundPixelRangeForNavigationSection,
          onNavigateToNavigationSection: fakeNavigationHandler,
        };
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
  navigationGutterView.addEventListener('click', event => {
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

  navigationGutter.show();
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

    const updateDiffSubscriptions = Observable.combineLatest(diffEditorsStream, fileDiffs)
      .do(([diffEditors, fileDiff]) => {
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
      }).subscribe();

    const diffEditorsVisibility = diffEditorsStream
      .debounceTime(100)
      .map(diffEditors => diffEditors != null)
      .do(visible => {
        actionCreators.updateDiffEditorsVisibility(visible);
      }).subscribe();

    const navigationGutterUpdates = compact(diffEditorsStream)
      .do(diffEditors => renderNavigationBarAtGutter(diffEditors, fileDiffs))
      .subscribe();

    this._disposables.add(
      updateDiffSubscriptions,
      diffEditorsVisibility,
      navigationGutterUpdates,
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }
}
