/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {GatekeeperService} from 'nuclide-commons-atom/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import type {GlobalViewState} from './types';
import type {
  DatatipProvider,
  DatatipService,
} from '../../atom-ide-datatip/lib/types';
import type {
  DiagnosticMessage,
  DiagnosticMessages,
  DiagnosticUpdater,
} from '../../atom-ide-diagnostics/lib/types';

import {areSetsEqual} from 'nuclide-commons/collection';
import {fastDebounce} from 'nuclide-commons/observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import addNuxTooltip from './addNuxTooltip';
import analytics from 'nuclide-commons/analytics';
import AsyncStorage from 'idb-keyval';
import createPackage from 'nuclide-commons-atom/createPackage';
import idx from 'idx';
import invariant from 'assert';
import KeyboardShortcuts from './KeyboardShortcuts';
import Model from 'nuclide-commons/Model';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import {applyUpdateToEditor} from './gutter';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {DiagnosticsViewModel, WORKSPACE_VIEW_URI} from './DiagnosticsViewModel';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {isValidTextEditor} from 'nuclide-commons-atom/text-editor';
import {Observable, BehaviorSubject} from 'rxjs';
import featureConfig from 'nuclide-commons-atom/feature-config';
import getDiagnosticDatatip from './getDiagnosticDatatip';
import showActionsMenu from './showActionsMenu';
import showAtomLinterWarning from './showAtomLinterWarning';
import StatusBarTile from './ui/StatusBarTile';

const MAX_OPEN_ALL_FILES = 20;
const SHOW_TRACES_SETTING = 'atom-ide-diagnostics-ui.showDiagnosticTraces';

type ActivationState = {|
  filterByActiveTextEditor: boolean,
|};

type DiagnosticsState = {|
  ...ActivationState,
  diagnosticUpdater: ?DiagnosticUpdater,
|};

const NUX_ASYNC_STORAGE_KEY = 'nuclide_diagnostics_nux_shown';

class Activation {
  _subscriptions: UniversalDisposable;
  _model: Model<DiagnosticsState>;
  _statusBarTile: ?StatusBarTile;
  _fileDiagnostics: WeakMap<atom$TextEditor, Array<DiagnosticMessage>>;
  _globalViewStates: ?Observable<GlobalViewState>;
  _gatekeeperServices: BehaviorSubject<?GatekeeperService> = new BehaviorSubject();

  constructor(state: ?Object): void {
    this._model = new Model({
      filterByActiveTextEditor:
        idx(state, _ => _.filterByActiveTextEditor) === true,
      diagnosticUpdater: null,
    });
    this._subscriptions = new UniversalDisposable(
      this.registerOpenerAndCommand(),
      this._registerActionsMenu(),
      this._observeDiagnosticsAndOfferTable(),
      showAtomLinterWarning(),
    );
    this._fileDiagnostics = new WeakMap();
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const datatipProvider: DatatipProvider = {
      // show this datatip for every type of file
      providerName: 'diagnostics-datatip',
      // Diagnostic datatips should have higher priority than most other datatips.
      priority: 10,
      datatip: (editor, position) => {
        const messagesAtPosition = this._getMessagesAtPosition(
          editor,
          position,
        );
        const {diagnosticUpdater} = this._model.state;
        if (messagesAtPosition.length === 0 || diagnosticUpdater == null) {
          return Promise.resolve(null);
        }
        return getDiagnosticDatatip(
          editor,
          position,
          messagesAtPosition,
          diagnosticUpdater,
        );
      },
    };
    const disposable = service.addProvider(datatipProvider);
    this._subscriptions.add(disposable);
    return disposable;
  }

  consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): IDisposable {
    this._getStatusBarTile().consumeDiagnosticUpdates(diagnosticUpdater);
    this._subscriptions.add(gutterConsumeDiagnosticUpdates(diagnosticUpdater));

    // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.
    if (this._model.state.diagnosticUpdater != null) {
      return new UniversalDisposable();
    }
    this._model.setState({diagnosticUpdater});
    const atomCommandsDisposable = addAtomCommands(diagnosticUpdater);
    this._subscriptions.add(atomCommandsDisposable);
    this._subscriptions.add(
      // Track diagnostics for all active editors.
      atom.workspace.observeTextEditors((editor: TextEditor) => {
        this._fileDiagnostics.set(editor, []);
        // TODO: this is actually inefficient - this filters all file events
        // by their path, so this is actually O(N^2) in the number of editors.
        // We should merge the store and UI packages to get direct access.
        const subscription = getEditorDiagnosticUpdates(
          editor,
          diagnosticUpdater,
        )
          .finally(() => {
            this._subscriptions.remove(subscription);
            this._fileDiagnostics.delete(editor);
          })
          .subscribe(update => {
            this._fileDiagnostics.set(editor, update.messages);
          });
        this._subscriptions.add(subscription);
      }),
    );
    return new UniversalDisposable(atomCommandsDisposable, () => {
      invariant(this._model.state.diagnosticUpdater === diagnosticUpdater);
      this._model.setState({diagnosticUpdater: null});
    });
  }

  consumeGatekeeperService(service: GatekeeperService): IDisposable {
    this._gatekeeperServices.next(service);
    return new UniversalDisposable(() => {
      if (this._gatekeeperServices.getValue() === service) {
        this._gatekeeperServices.next(null);
      }
    });
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    this._getStatusBarTile().consumeStatusBar(statusBar);
  }

  deserializeDiagnosticsViewModel(): DiagnosticsViewModel {
    return this._createDiagnosticsViewModel();
  }

  dispose(): void {
    this._subscriptions.dispose();
    if (this._statusBarTile) {
      this._statusBarTile.dispose();
      this._statusBarTile = null;
    }
  }

  serialize(): ActivationState {
    const {filterByActiveTextEditor} = this._model.state;
    return {
      filterByActiveTextEditor,
    };
  }

  _observeDiagnosticsAndOfferTable(): IDisposable {
    return new UniversalDisposable(
      this._gatekeeperServices
        .switchMap(gatekeeperService => {
          if (gatekeeperService == null) {
            return Observable.of(null);
          }

          return gatekeeperService.passesGK('nuclide_diagnostics_nux');
        })
        .filter(Boolean)
        .take(1)
        // Don't show it to the user if they've seen it before
        .switchMap(() => AsyncStorage.get(NUX_ASYNC_STORAGE_KEY))
        .filter(seen => !seen)
        .switchMap(() =>
          // Only display once there are errors originating from multiple files
          this._getGlobalViewStates()
            .debounceTime(500)
            .map(state => state.diagnostics)
            .filter(diags => {
              // make sure there are diagnostics from at least two different uris
              // and that those diagnostics are errors
              const firstErrorDiagIndex = diags.findIndex(
                diag => diag.type === 'Error',
              );
              if (firstErrorDiagIndex === -1) {
                return false;
              }

              const firstUri = diags[firstErrorDiagIndex].filePath;
              for (let i = firstErrorDiagIndex + 1; i < diags.length; i++) {
                if (
                  diags[i].type === 'Error' &&
                  diags[i].filePath !== firstUri
                ) {
                  return true;
                }
              }
              return false;
            })
            .take(1),
        )
        .subscribe(async () => {
          // capture the current focus since opening diagnostics will change it
          const previouslyFocusedElement = document.activeElement;
          await goToLocation(WORKSPACE_VIEW_URI);
          // and then restore the focus if it existed before
          if (previouslyFocusedElement != null) {
            previouslyFocusedElement.focus();
          }

          const statusBarNode = document.querySelector(
            '.diagnostics-status-bar-item',
          );
          if (statusBarNode) {
            addNuxTooltip(statusBarNode);
            AsyncStorage.set(NUX_ASYNC_STORAGE_KEY, true);
            analytics.track('diagnostics-table-nux-shown');
          }
        }),
    );
  }

  _createDiagnosticsViewModel(): DiagnosticsViewModel {
    return new DiagnosticsViewModel(this._getGlobalViewStates());
  }

  /**
   * An observable of the state that's shared between all panel copies. State that's unique to a
   * single copy of the diagnostics panel is managed in DiagnosticsViewModel. Generally, users will
   * only have one copy of the diagnostics panel so this is mostly a theoretical distinction,
   * however, each copy should have its own sorting, filtering, etc.
   */
  _getGlobalViewStates(): Observable<GlobalViewState> {
    if (this._globalViewStates == null) {
      const packageStates = this._model.toObservable();
      const updaters = packageStates
        .map(state => state.diagnosticUpdater)
        .distinctUntilChanged();

      const diagnosticsStream = updaters
        .switchMap(
          updater =>
            updater == null
              ? Observable.of([])
              : observableFromSubscribeFunction(updater.observeMessages),
        )
        .map(diagnostics => diagnostics.filter(d => d.type !== 'Hint'))
        .let(fastDebounce(100))
        .startWith([]);

      const showTracesStream: Observable<
        boolean,
      > = (featureConfig.observeAsStream(SHOW_TRACES_SETTING): any);
      const setShowTraces = showTraces => {
        featureConfig.set(SHOW_TRACES_SETTING, showTraces);
      };

      const showDirectoryColumnStream: Observable<
        boolean,
      > = (featureConfig.observeAsStream(
        'atom-ide-diagnostics-ui.showDirectoryColumn',
      ): any);

      const autoVisibilityStream: Observable<
        boolean,
      > = (featureConfig.observeAsStream(
        'atom-ide-diagnostics-ui.autoVisibility',
      ): any);

      const pathToActiveTextEditorStream = getActiveEditorPaths();

      const filterByActiveTextEditorStream = packageStates
        .map(state => state.filterByActiveTextEditor)
        .distinctUntilChanged();
      const setFilterByActiveTextEditor = filterByActiveTextEditor => {
        this._model.setState({filterByActiveTextEditor});
      };

      const supportedMessageKindsStream = updaters
        .switchMap(
          updater =>
            updater == null
              ? Observable.of(new Set(['lint']))
              : observableFromSubscribeFunction(
                  updater.observeSupportedMessageKinds.bind(updater),
                ),
        )
        .distinctUntilChanged(areSetsEqual);

      const uiConfigStream = updaters.switchMap(
        updater =>
          updater == null
            ? Observable.of([])
            : observableFromSubscribeFunction(
                updater.observeUiConfig.bind(updater),
              ),
      );

      this._globalViewStates = Observable.combineLatest(
        diagnosticsStream,
        filterByActiveTextEditorStream,
        pathToActiveTextEditorStream,
        showTracesStream,
        showDirectoryColumnStream,
        autoVisibilityStream,
        supportedMessageKindsStream,
        uiConfigStream,
        // $FlowFixMe
        (
          diagnostics,
          filterByActiveTextEditor,
          pathToActiveTextEditor,
          showTraces,
          showDirectoryColumn,
          autoVisibility,
          supportedMessageKinds,
          uiConfig,
        ) => ({
          diagnostics,
          filterByActiveTextEditor,
          pathToActiveTextEditor,
          showTraces,
          showDirectoryColumn,
          autoVisibility,
          onShowTracesChange: setShowTraces,
          onFilterByActiveTextEditorChange: setFilterByActiveTextEditor,
          supportedMessageKinds,
          uiConfig,
        }),
      );
    }
    return this._globalViewStates;
  }

  registerOpenerAndCommand(): IDisposable {
    const commandDisposable = atom.commands.add(
      'atom-workspace',
      'diagnostics:toggle-table',
      () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      },
    );
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return this._createDiagnosticsViewModel();
        }
      }),
      () => {
        destroyItemWhere(item => item instanceof DiagnosticsViewModel);
      },
      commandDisposable,
    );
  }

  _registerActionsMenu(): IDisposable {
    return atom.commands.add(
      'atom-text-editor',
      'diagnostics:show-actions-at-position',
      () => {
        const editor = atom.workspace.getActiveTextEditor();
        const {diagnosticUpdater} = this._model.state;
        if (editor == null || diagnosticUpdater == null) {
          return;
        }
        const position = editor.getCursorBufferPosition();
        const messagesAtPosition = this._getMessagesAtPosition(
          editor,
          position,
        );
        if (messagesAtPosition.length === 0) {
          return;
        }
        showActionsMenu(
          editor,
          position,
          messagesAtPosition,
          diagnosticUpdater,
        );
      },
    );
  }

  _getStatusBarTile(): StatusBarTile {
    if (!this._statusBarTile) {
      this._statusBarTile = new StatusBarTile();
    }
    return this._statusBarTile;
  }

  _getMessagesAtPosition(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Array<DiagnosticMessage> {
    const messagesForFile = this._fileDiagnostics.get(editor);
    if (messagesForFile == null) {
      return [];
    }
    return messagesForFile.filter(
      message => message.range != null && message.range.containsPoint(position),
    );
  }
}

function gutterConsumeDiagnosticUpdates(
  diagnosticUpdater: DiagnosticUpdater,
): IDisposable {
  const subscriptions = new UniversalDisposable();
  subscriptions.add(
    atom.workspace.observeTextEditors((editor: TextEditor) => {
      const subscription = getEditorDiagnosticUpdates(editor, diagnosticUpdater)
        .finally(() => {
          subscriptions.remove(subscription);
        })
        .subscribe(update => {
          // Although the subscription should be cleaned up on editor destroy,
          // the very act of destroying the editor can trigger diagnostic updates.
          // Thus this callback can still be triggered after the editor is destroyed.
          if (!editor.isDestroyed()) {
            applyUpdateToEditor(editor, update, diagnosticUpdater);
          }
        });
      subscriptions.add(subscription);
    }),
  );
  return subscriptions;
}

function addAtomCommands(diagnosticUpdater: DiagnosticUpdater): IDisposable {
  const fixAllInCurrentFile = () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return;
    }
    const path = editor.getPath();
    if (path == null) {
      return;
    }
    analytics.track('diagnostics-autofix-all-in-file');
    diagnosticUpdater.applyFixesForFile(path);
  };

  const openAllFilesWithErrors = () => {
    analytics.track('diagnostics-panel-open-all-files-with-errors');
    observableFromSubscribeFunction(diagnosticUpdater.observeMessages)
      .first()
      .subscribe((messages: Array<DiagnosticMessage>) => {
        const errorsToOpen = getTopMostErrorLocationsByFilePath(messages);

        if (errorsToOpen.size > MAX_OPEN_ALL_FILES) {
          atom.notifications.addError(
            `Diagnostics: Will not open more than ${MAX_OPEN_ALL_FILES} files`,
          );
          return;
        }

        const column = 0;
        errorsToOpen.forEach((line, uri) => goToLocation(uri, {line, column}));
      });
  };

  return new UniversalDisposable(
    atom.commands.add(
      'atom-workspace',
      'diagnostics:fix-all-in-current-file',
      fixAllInCurrentFile,
    ),
    atom.commands.add(
      'atom-workspace',
      'diagnostics:open-all-files-with-errors',
      openAllFilesWithErrors,
    ),
    new KeyboardShortcuts(diagnosticUpdater),
  );
}

function getTopMostErrorLocationsByFilePath(
  messages: Array<DiagnosticMessage>,
): Map<string, number> {
  const errorLocations: Map<string, number> = new Map();

  messages.forEach(message => {
    const filePath = message.filePath;
    if (nuclideUri.endsWithSeparator(filePath)) {
      return;
    }

    // If initialLine is N, Atom will navigate to line N+1.
    // Flow sometimes reports a row of -1, so this ensures the line is at least one.
    let line = Math.max(message.range ? message.range.start.row : 0, 0);

    const prevMinLine = errorLocations.get(filePath);
    if (prevMinLine != null) {
      line = Math.min(prevMinLine, line);
    }

    errorLocations.set(filePath, line);
  });

  return errorLocations;
}

function getActiveEditorPaths(): Observable<?NuclideUri> {
  const center = atom.workspace.getCenter();
  return (
    observableFromSubscribeFunction(center.observeActivePaneItem.bind(center))
      .map(paneItem => (isValidTextEditor(paneItem) ? paneItem : null))
      // We want the stream to contain the last valid text editor. Normally that means just ignoring
      // non-editors, except initially, when there hasn't been an active editor yet.
      .filter((paneItem, index) => paneItem != null || index === 0)
      .switchMap(textEditor_ => {
        const textEditor: ?atom$TextEditor = (textEditor_: any);
        if (textEditor == null) {
          return Observable.of(null);
        }
        // An observable that emits the editor path and then, when the editor's destroyed, null.
        return Observable.concat(
          Observable.of(textEditor.getPath()),
          observableFromSubscribeFunction(
            textEditor.onDidDestroy.bind(textEditor),
          )
            .take(1)
            .mapTo(null),
        );
      })
      .distinctUntilChanged()
  );
}

function getEditorDiagnosticUpdates(
  editor: atom$TextEditor,
  diagnosticUpdater: DiagnosticUpdater,
): Observable<DiagnosticMessages> {
  return observableFromSubscribeFunction(editor.onDidChangePath.bind(editor))
    .startWith(editor.getPath())
    .switchMap(
      filePath =>
        filePath != null
          ? observableFromSubscribeFunction(cb =>
              diagnosticUpdater.observeFileMessages(filePath, cb),
            )
          : Observable.empty(),
    )
    .map(diagnosticMessages => {
      return {
        ...diagnosticMessages,
        messages: diagnosticMessages.messages.filter(
          diagnostic => diagnostic.type !== 'Hint',
        ),
      };
    })
    .takeUntil(
      observableFromSubscribeFunction(editor.onDidDestroy.bind(editor)),
    );
}

createPackage(module.exports, Activation);
