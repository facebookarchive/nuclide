'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.READ_ONLY_EDITOR_PATH = exports.NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Split the pane items, if not already split.
 */
let getDiffEditors = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath) {
    let newEditor;
    const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    // Wait for next tick to allow the atom workspace panes to update its
    // state with the possibly just-opened editor.
    yield (0, (_promise || _load_promise()).nextTick)();
    let newEditorPane = atom.workspace.paneForURI(filePath);
    if (newEditorPane != null) {
      const newEditorItem = newEditorPane.itemForURI(filePath);
      newEditorPane.activateItem(newEditorItem);
      newEditor = newEditorItem;
    } else {
      newEditor = yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePath);
      // Allow the atom workspace to update its state before querying for
      // the new editor's pane.
      yield (0, (_promise || _load_promise()).nextTick)();
      newEditorPane = atom.workspace.paneForURI(filePath);

      if (!(newEditorPane != null)) {
        throw new Error('Cannot find a pane for the opened text editor');
      }
    }

    disposables.add((0, (_textEditor || _load_textEditor()).enforceSoftWrap)(newEditor, false), function () {
      return newEditor.setSoftWrapped(atom.config.get('editor.softWrap'));
    });

    const navigationGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME) || newEditor.addGutter({
      name: NAVIGATION_GUTTER_NAME,
      priority: -1500,
      visible: true
    });

    disposables.add(function () {
      const addedGutter = newEditor.gutterWithName(NAVIGATION_GUTTER_NAME);
      if (addedGutter != null) {
        addedGutter.destroy();
      }
    });

    const oldEditor = getReadOnlyEditor();
    newEditorPane.addItem(oldEditor);
    newEditorPane.activateItem(oldEditor);
    atom.commands.dispatch(atom.views.getView(oldEditor), 'nuclide-move-item-to-available-pane:left');
    // Allow the atom workspace to update its state before querying the views for the editor.
    yield (0, (_promise || _load_promise()).nextTick)();

    disposables.add((0, (_textEditor || _load_textEditor()).enforceSoftWrap)(oldEditor, false), function () {
      return cleanUpEditor(oldEditor);
    });

    newEditorPane.activateItem(newEditor);
    newEditorPane.activate();

    // Unfold all lines so diffs properly align.
    newEditor.unfoldAll();
    oldEditor.unfoldAll();

    const newEditorElement = atom.views.getView(newEditor);
    const oldEditorElement = atom.views.getView(oldEditor);

    const newDiffEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(newEditorElement);
    const oldDiffEditor = new (_DiffViewEditor || _load_DiffViewEditor()).default(oldEditorElement);

    disposables.add(function () {
      return newDiffEditor.destroyMarkers();
    }, function () {
      return oldDiffEditor.destroyMarkers();
    });

    // Add marker classes to be used for atom command registeration.
    newEditorElement.classList.add((_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS);
    oldEditorElement.classList.add(READ_ONLY_EDITOR_CLASS);
    oldEditorElement.classList.add((_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS);
    disposables.add(function () {
      return newEditorElement.classList.remove((_constants || _load_constants()).DIFF_EDITOR_MARKER_CLASS);
    });

    disposables.add(new (_SyncScroll || _load_SyncScroll()).default(oldEditorElement, newEditorElement));

    return {
      navigationGutter,
      newDiffEditor,
      oldDiffEditor,
      disposables
    };
  });

  return function getDiffEditors(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _DiffViewEditor;

function _load_DiffViewEditor() {
  return _DiffViewEditor = _interopRequireDefault(require('../DiffViewEditor'));
}

var _SyncScroll;

function _load_SyncScroll() {
  return _SyncScroll = _interopRequireDefault(require('../SyncScroll'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../commons-node/promise');
}

var _notifications;

function _load_notifications() {
  return _notifications = require('../notifications');
}

var _observeElementDimensions;

function _load_observeElementDimensions() {
  return _observeElementDimensions = require('../../../commons-atom/observe-element-dimensions');
}

var _DiffViewComponent;

function _load_DiffViewComponent() {
  return _DiffViewComponent = require('../DiffViewComponent');
}

var _react = _interopRequireDefault(require('react'));

var _DiffNavigationBar;

function _load_DiffNavigationBar() {
  return _DiffNavigationBar = require('../DiffNavigationBar');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../nuclide-ui/bindObservableAsProps');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../commons-atom/renderReactRoot');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../commons-atom/text-editor');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../../commons-atom/go-to-location');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../../nuclide-ui/LoadingSpinner');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DIFF_VIEW_NAVIGATION_TARGET = 'nuclide-diff-view-navigation-target'; /**
                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                            * All rights reserved.
                                                                            *
                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                            * the root directory of this source tree.
                                                                            *
                                                                            * 
                                                                            */

const NAVIGATION_GUTTER_NAME = 'nuclide-diff-split-navigation';
const NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME = 'nuclide-diff-view-editor-loading';
const READ_ONLY_EDITOR_CLASS = 'nuclide-diff-view-read-only-editor';
const DIFF_SPINNER_DELAY_MS = 50;
const SCROLL_FIRST_CHANGE_DELAY_MS = 100;
const NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME = exports.NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME = 'nuclide-diff-view-pane-loading-indicator';
const READ_ONLY_EDITOR_PATH = exports.READ_ONLY_EDITOR_PATH = 'nuclide-diff-view-read-only-path';

function cleanUpEditor(editor) {
  // When one of the editors gets destroyed by Atom pane item change,
  // Atom will error with further mutations at the same process cycle.
  // Hence, this delays the cleanup by one cycle to avoid the error.
  process.nextTick(() => editor.destroy());
}

function getReadOnlyEditor() {
  const textEditor = atom.workspace.buildTextEditor({ autoHeight: false });
  (0, (_textEditor || _load_textEditor()).enforceReadOnly)(textEditor);

  textEditor.getTitle = () => 'Original (Read Only)';
  textEditor.isModified = () => false;
  textEditor.getURI = () => READ_ONLY_EDITOR_PATH;
  textEditor.serialize = () => null;

  return textEditor;
}

function wrapDiffEditorObservable(promise) {
  let result;

  return _rxjsBundlesRxMinJs.Observable.fromPromise(promise).switchMap(_result => {
    result = _result;
    const newEditor = result.newDiffEditor.getEditor();
    const oldEditor = result.oldDiffEditor.getEditor();
    return _rxjsBundlesRxMinJs.Observable.of(result).merge(_rxjsBundlesRxMinJs.Observable.never())
    // If any of the editors is closed or the user switched to a different file,
    // the Diff View is closed.
    .takeUntil(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidChangeActivePaneItem.bind(atom.workspace)).filter(() => {
      const activePaneItem = atom.workspace.getActivePaneItem();
      return activePaneItem !== newEditor && activePaneItem !== oldEditor;
    }), (0, (_event || _load_event()).observableFromSubscribeFunction)(newEditor.onDidDestroy.bind(newEditor)), (0, (_event || _load_event()).observableFromSubscribeFunction)(oldEditor.onDidDestroy.bind(oldEditor)))).concat(_rxjsBundlesRxMinJs.Observable.of(null));
  }).startWith(null).finally(() => {
    if (result != null) {
      result.disposables.dispose();
    }
  });
}

function renderNavigationBarAtGutter(diffEditors, fileDiffs, dimesionsUpdates) {
  const { oldDiffEditor, newDiffEditor, navigationGutter } = diffEditors;
  const oldEditorElement = oldDiffEditor.getEditorDomElement();
  const newEditorElement = newDiffEditor.getEditorDomElement();
  const boundPixelRangeForNavigationSection = (_DiffViewComponent || _load_DiffViewComponent()).pixelRangeForNavigationSection.bind(null, oldEditorElement, newEditorElement);

  const onNavigateToNavigationSection = (navigationSectionStatus, scrollToLineNumber) => {
    const textEditorElement = (0, (_DiffViewComponent || _load_DiffViewComponent()).navigationSectionStatusToEditorElement)(oldEditorElement, newEditorElement, navigationSectionStatus);
    (0, (_DiffViewComponent || _load_DiffViewComponent()).centerScrollToBufferLine)(textEditorElement, scrollToLineNumber);
  };

  const fakeNavigationHandler = () => {
    // TODO(most): use the React handler instead of DOM when it's fixed in the editor gutter.
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Gutter click events never go through!');
  };

  const navigationGutterView = atom.views.getView(navigationGutter);
  const BoundNavigationBarComponent = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(_rxjsBundlesRxMinJs.Observable.combineLatest(fileDiffs, dimesionsUpdates)
  // Debounce diff sections rendering to avoid blocking the UI.
  .debounceTime(50).switchMap(([{ navigationSections }]) => {
    const gutterContainer = navigationGutterView.parentNode;
    if (gutterContainer == null) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Split Diff Error: Navigation gutter is not mounted!');
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const editorLineHeight = oldDiffEditor.getEditor().getLineHeightInPixels();
    const diffEditorsHeight = Math.max(oldEditorElement.getScrollHeight(), newEditorElement.getScrollHeight(), 1);
    const navigationScale = gutterContainer.clientHeight / diffEditorsHeight;

    return _rxjsBundlesRxMinJs.Observable.of({
      navigationSections,
      navigationScale,
      editorLineHeight,
      pixelRangeForNavigationSection: boundPixelRangeForNavigationSection,
      onNavigateToNavigationSection: fakeNavigationHandler
    });
  }), (_DiffNavigationBar || _load_DiffNavigationBar()).DiffNavigationBar);

  const navigationElement = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(BoundNavigationBarComponent, null));
  navigationElement.className = 'nuclide-diff-view-split-navigation-gutter';
  navigationGutterView.style.position = 'relative';
  navigationGutterView.appendChild(navigationElement);

  // The gutter elements don't receive the click.
  // Hence, the need to inject DOM attributes in navigation targets,
  // and use  here for
  navigationGutterView.addEventListener('click', event => {
    // classList isn't in the defs of EventTarget...
    const target = event.target;
    if (!target.classList.contains(DIFF_VIEW_NAVIGATION_TARGET)) {
      return;
    }
    const navigationStatus = target.getAttribute('nav-status');
    const navigationLineCount = parseInt(target.getAttribute('nav-line-count'), 10);
    const navigationLineNumber = parseInt(target.getAttribute('nav-line-number'), 10);
    const scrollToLineNumber = (0, (_DiffNavigationBar || _load_DiffNavigationBar()).clickEventToScrollLineNumber)(navigationLineNumber, navigationLineCount, event);
    onNavigateToNavigationSection(navigationStatus, scrollToLineNumber);
  });
}

function updateEditorLoadingIndicator(editorElement, isLoading) {
  // Adding to the parent because the atom-text-editor isn't relatively positioned.
  const editorParent = editorElement.parentNode;
  if (editorParent == null) {
    (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Split Diff Error: Editor is not yet mounted!');
    return;
  }

  function removeLoadingIndicator() {
    // Unfade the editor and hide the loading spinner with delay.
    editorElement.classList.remove(NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME);
    const loadingElement = editorParent.querySelector(`.${NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME}`);
    if (loadingElement != null) {
      editorParent.removeChild(loadingElement);
    }
  }

  removeLoadingIndicator();

  if (isLoading) {
    // Fade the editor and show the loading spinner with delay.
    editorElement.classList.add(NUCLIDE_DIFF_EDITOR_LOADING_CLASSNAME);
    const loadingElement = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, { delay: DIFF_SPINNER_DELAY_MS, size: (_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinnerSizes.LARGE }));
    loadingElement.classList.add(NUCLIDE_DIFF_LOADING_INDICATOR_CLASSNAME);
    editorParent.appendChild(loadingElement);
  }
}

function centerScrollToFirstChange(diffEditors, navigationSections) {
  if (navigationSections.length === 0) {
    return;
  }

  const { oldDiffEditor, newDiffEditor } = diffEditors;
  const firstSection = navigationSections[0];
  const editorElement = (0, (_DiffViewComponent || _load_DiffViewComponent()).navigationSectionStatusToEditorElement)(oldDiffEditor.getEditorDomElement(), newDiffEditor.getEditorDomElement(), firstSection.status);

  (0, (_DiffViewComponent || _load_DiffViewComponent()).centerScrollToBufferLine)(editorElement, firstSection.lineNumber);
}

class SplitDiffView {

  constructor(states, actionCreators) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const diffEditorsStream = states.map(state => state.fileDiff.filePath).distinctUntilChanged().switchMap(filePath => {
      if (!filePath) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      } else {
        return wrapDiffEditorObservable(getDiffEditors(filePath)).catch(error => {
          (0, (_notifications || _load_notifications()).notifyInternalError)(error);
          return _rxjsBundlesRxMinJs.Observable.empty();
        });
      }
    }).share();

    const fileDiffs = states.map(({ fileDiff }) => fileDiff).distinctUntilChanged();

    const diffStateStream = fileDiffs.distinctUntilChanged((fileDiff1, fileDiff2) => {
      return fileDiff1.oldEditorState === fileDiff2.oldEditorState && fileDiff1.newEditorState === fileDiff2.newEditorState;
    });

    const uiElementStream = fileDiffs.distinctUntilChanged((fileDiff1, fileDiff2) => {
      return fileDiff1.oldEditorState.inlineElements === fileDiff2.oldEditorState.inlineElements && fileDiff1.oldEditorState.inlineOffsetElements === fileDiff2.oldEditorState.inlineOffsetElements && fileDiff1.newEditorState.inlineElements === fileDiff2.newEditorState.inlineElements && fileDiff1.newEditorState.inlineOffsetElements === fileDiff2.newEditorState.inlineOffsetElements;
    });

    const updateDiffSubscriptions = _rxjsBundlesRxMinJs.Observable.combineLatest(diffEditorsStream, diffStateStream).subscribe(([diffEditors, fileDiff]) => {
      if (diffEditors == null) {
        // One or both editors were destroyed.
        return;
      }
      try {
        const { newDiffEditor, oldDiffEditor } = diffEditors;
        const { filePath, oldEditorState, newEditorState } = fileDiff;
        oldDiffEditor.setFileContents(filePath, oldEditorState.text);
        oldDiffEditor.setHighlightedLines([], oldEditorState.highlightedLines.removed);
        oldDiffEditor.setOffsets(oldEditorState.offsets);

        newDiffEditor.setHighlightedLines(newEditorState.highlightedLines.added, []);
        newDiffEditor.setOffsets(newEditorState.offsets);
      } catch (error) {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
      }
    });

    const uiElementsUpdates = _rxjsBundlesRxMinJs.Observable.combineLatest(diffEditorsStream, uiElementStream).subscribe(([diffEditors, fileDiff]) => {
      if (diffEditors == null) {
        // One or both editors were destroyed.
        return;
      }

      try {
        const { newDiffEditor, oldDiffEditor } = diffEditors;
        const { lineMapping, oldEditorState, newEditorState } = fileDiff;

        oldDiffEditor.setUiElements(oldEditorState.inlineElements);
        oldDiffEditor.setOffsetUiElements(oldEditorState.inlineOffsetElements, lineMapping.newToOld);
        newDiffEditor.setUiElements(newEditorState.inlineElements);
        newDiffEditor.setOffsetUiElements(newEditorState.inlineOffsetElements, lineMapping.oldToNew);
      } catch (error) {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
      }
    });

    const diffEditorsUpdates = diffEditorsStream.debounceTime(100).subscribe(diffEditors => {
      actionCreators.updateDiffEditorsVisibility(diffEditors != null);
      actionCreators.updateDiffEditors(diffEditors);
    });

    const activeSectionUpdates = diffEditorsStream.switchMap(diffEditors => {
      if (diffEditors == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const { newDiffEditor, oldDiffEditor } = diffEditors;
      const newEditorElement = newDiffEditor.getEditorDomElement();
      const oldEditorElement = oldDiffEditor.getEditorDomElement();

      return _rxjsBundlesRxMinJs.Observable.combineLatest(fileDiffs, _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(newEditorElement.onDidChangeScrollTop.bind(newEditorElement)), (0, (_event || _load_event()).observableFromSubscribeFunction)(oldEditorElement.onDidChangeScrollTop.bind(oldEditorElement)))).debounceTime(100).map(([fileDiff]) => {
        return (0, (_DiffViewComponent || _load_DiffViewComponent()).getCenterScrollSelectedNavigationIndex)([oldEditorElement, newEditorElement], fileDiff.navigationSections);
      }).distinctUntilChanged();
    }).subscribe(sectionIndex => {
      actionCreators.updateActiveNavigationSection(sectionIndex);
    });

    const navigationGutterUpdates = (0, (_observable || _load_observable()).compact)(diffEditorsStream).debounceTime(50).subscribe(diffEditors => {
      const dimesionsUpdates = _rxjsBundlesRxMinJs.Observable.merge((0, (_observeElementDimensions || _load_observeElementDimensions()).observeElementDimensions)(diffEditors.newDiffEditor.getEditorDomElement()), (0, (_observeElementDimensions || _load_observeElementDimensions()).observeElementDimensions)(diffEditors.oldDiffEditor.getEditorDomElement())).debounceTime(20).mapTo(null);
      try {
        renderNavigationBarAtGutter(diffEditors, fileDiffs, dimesionsUpdates);
      } catch (error) {
        (0, (_notifications || _load_notifications()).notifyInternalError)(error);
      }
    });

    const diffLoadingIndicatorUpdates = diffEditorsStream.switchMap(diffEditors => {
      if (diffEditors == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return states.map(({ isLoadingFileDiff }) => isLoadingFileDiff).distinctUntilChanged().map(isLoading => {
        const editorElement = diffEditors.oldDiffEditor.getEditorDomElement();
        return { editorElement, isLoading };
      });
    }).subscribe(({ editorElement, isLoading }) => {
      try {
        updateEditorLoadingIndicator(editorElement, isLoading);
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Split Diff Error: Could not update loading indicator', error);
      }
    });

    const scrollToFirstChange = diffEditorsStream.switchMap(diffEditors => {
      if (diffEditors == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      // Wait for the diff text to load.
      return states.filter(({ fileDiff }) => fileDiff.oldEditorState.text.length > 0).first()
      // Wait for the diff editor to render the UI state.
      .delay(SCROLL_FIRST_CHANGE_DELAY_MS).map(({ fileDiff: { navigationSections } }) => {
        return { diffEditors, navigationSections };
      });
    }).subscribe(({ diffEditors, navigationSections }) => {
      try {
        centerScrollToFirstChange(diffEditors, navigationSections);
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Split Diff Error: Could not scroll to first change', error);
      }
    });

    const trackSavingInSplit = diffEditorsStream.switchMap(diffEditors => {
      if (diffEditors == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const newEditor = diffEditors.newDiffEditor.getEditor();
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(newEditor.onDidSave.bind(newEditor));
    }).subscribe(() => (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-save-file'));

    this._disposables.add(activeSectionUpdates, diffEditorsUpdates, diffLoadingIndicatorUpdates, navigationGutterUpdates, scrollToFirstChange, trackSavingInSplit, uiElementsUpdates, updateDiffSubscriptions);
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = SplitDiffView;