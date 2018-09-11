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
import {fastDebounce, diffSets} from 'nuclide-commons/observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
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
import ReactDOM from 'react-dom';
import {STALE_MESSAGE_UPDATE_THROTTLE_TIME} from './utils';

const MAX_OPEN_ALL_FILES = 20;
const SHOW_TRACES_SETTING = 'atom-ide-diagnostics-ui.showDiagnosticTraces';

type ActivationState = {|
  filterByActiveTextEditor: boolean,
|};

export type DiagnosticsState = {|
  ...ActivationState,
  ...OpenBlockDecorationState,
  diagnosticUpdater: ?DiagnosticUpdater,
  showNuxContent: boolean,
|};

type OpenBlockDecorationState = {|
  openedMessageIds: Set<string>,
|};

const NUX_ASYNC_STORAGE_KEY = 'nuclide_diagnostics_nux_shown';
const NUCLIDE_DIAGNOSTICS_STALE_GK = 'nuclide_diagnostics_stale';

class Activation {
  _subscriptions: UniversalDisposable;
  _model: Model<DiagnosticsState>;
  _statusBarTile: ?StatusBarTile;
  _fileDiagnostics: WeakMap<atom$TextEditor, Array<DiagnosticMessage>>;
  _globalViewStates: ?Observable<GlobalViewState>;
  _gatekeeperServices: BehaviorSubject<?GatekeeperService> = new BehaviorSubject();

  constructor(state: ?Object): void {
    this._model = new Model({
      showNuxContent: false,
      filterByActiveTextEditor:
        idx(state, _ => _.filterByActiveTextEditor) === true,
      diagnosticUpdater: null,
      openedMessageIds: new Set(),
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
    this._getStatusBarTile().consumeDiagnosticUpdates(
      diagnosticUpdater,
      this._getIsStaleMessageEnabledStream(),
    );

    this._subscriptions.add(
      this._gutterConsumeDiagnosticUpdates(diagnosticUpdater),
    );
    // Currently, the DiagnosticsView is designed to work with only one DiagnosticUpdater.
    if (this._model.state.diagnosticUpdater != null) {
      return new UniversalDisposable();
    }
    this._model.setState({diagnosticUpdater});
    const atomCommandsDisposable = addAtomCommands(diagnosticUpdater);
    this._subscriptions.add(atomCommandsDisposable);
    this._subscriptions.add(
      this._observeDiagnosticsAndCleanUpOpenedMessageIds(),
    );
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
          this._getIsStaleMessageEnabledStream(),
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

  _observeDiagnosticsAndCleanUpOpenedMessageIds(): IDisposable {
    const packageStates = this._model.toObservable();

    const updaters = packageStates
      .map(state => state.diagnosticUpdater)
      .distinctUntilChanged();

    const diagnosticMessageIdsStream = updaters
      .switchMap(
        updater =>
          updater == null
            ? Observable.of([])
            : observableFromSubscribeFunction(updater.observeMessages),
      )
      .map(diagnostics => {
        const messageIds = diagnostics
          .map(message => message.id)
          .filter(Boolean);
        return new Set(messageIds);
      })
      .let(diffSets());

    return new UniversalDisposable(
      diagnosticMessageIdsStream.subscribe(({_, removed}) => {
        const newOpenedMessageIds = new Set(this._model.state.openedMessageIds);
        removed.forEach(msgId => {
          newOpenedMessageIds.delete(msgId);
        });
        this._model.setState({openedMessageIds: newOpenedMessageIds});
      }),
    );
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
          this._model.setState({showNuxContent: true});

          // we need to await this as we must wait for the panel to activate to
          // change the focus back
          await goToLocation(WORKSPACE_VIEW_URI);
          AsyncStorage.set(NUX_ASYNC_STORAGE_KEY, true);
          analytics.track('diagnostics-table-nux-shown');

          // and then restore the focus if it existed before
          if (previouslyFocusedElement != null) {
            previouslyFocusedElement.focus();
          }
        }),
    );
  }

  _createDiagnosticsViewModel(): DiagnosticsViewModel {
    return new DiagnosticsViewModel(this._getGlobalViewStates());
  }

  _dismissNux = () => {
    this._model.setState({
      showNuxContent: false,
    });
  };

  _getIsStaleMessageEnabledStream(): Observable<boolean> {
    return this._gatekeeperServices
      .switchMap(gkService => {
        if (gkService != null) {
          return gkService.passesGK(NUCLIDE_DIAGNOSTICS_STALE_GK);
        }
        return Observable.of(false);
      })
      .distinctUntilChanged();
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
      const showNuxContentStream = packageStates.map(
        state => state.showNuxContent,
      );

      const diagnosticsStream = updaters
        .switchMap(
          updater =>
            updater == null
              ? Observable.of([])
              : observableFromSubscribeFunction(updater.observeMessages),
        )
        .combineLatest(this._getIsStaleMessageEnabledStream())
        // $FlowFixMe
        .throttle(
          ([_, isStaleMessageEnabled]) =>
            Observable.interval(
              isStaleMessageEnabled ? STALE_MESSAGE_UPDATE_THROTTLE_TIME : 0,
            ),
          {leading: true, trailing: true},
        )
        .map(([diagnostics, isStaleMessageEnabled]) =>
          diagnostics.filter(d => d.type !== 'Hint').map(diagnostic => {
            if (!isStaleMessageEnabled) {
              // Note: reason of doing this is currently Flow is sending message
              // marked as stale sometimes(on user type or immediately on save).
              // Until we turn on the gk, we don't want user to see the Stale
              // style/behavior just yet. so here we mark them as not stale.
              diagnostic.stale = false;
            }
            return diagnostic;
          }),
        )
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
        showNuxContentStream,
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
          showNuxContent,
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
          onDismissNux: this._dismissNux,
          supportedMessageKinds,
          showNuxContent,
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

  _gutterConsumeDiagnosticUpdates(
    diagnosticUpdater: DiagnosticUpdater,
  ): IDisposable {
    const subscriptions = new UniversalDisposable();
    const updateOpenedMessageIds = this._model
      .toObservable()
      .map(state => state.openedMessageIds)
      .distinctUntilChanged();

    this._subscriptions.add(updateOpenedMessageIds.subscribe());

    const setOpenedMessageIds = openedMessageIds => {
      this._model.setState({openedMessageIds});
    };
    subscriptions.add(
      atom.workspace.observeTextEditors((editor: TextEditor) => {
        // blockDecorationContainer is unique per editor and will get cleaned up
        // when editor destroys and diagnostics package deactivates
        const blockDecorationContainer = document.createElement('div');
        editor.onDidDestroy(() => {
          ReactDOM.unmountComponentAtNode(blockDecorationContainer);
        });
        subscriptions.add(() => {
          ReactDOM.unmountComponentAtNode(blockDecorationContainer);
        });

        const subscription = Observable.combineLatest(
          updateOpenedMessageIds,
          getEditorDiagnosticUpdates(
            editor,
            diagnosticUpdater,
            this._getIsStaleMessageEnabledStream(),
          ),
        )
          .finally(() => {
            subscriptions.remove(subscription);
          })
          .subscribe(
            ([openedMessageIds: Set<string>, update: DiagnosticMessages]) => {
              // Although the subscription should be cleaned up on editor destroy,
              // the very act of destroying the editor can trigger diagnostic updates.
              // Thus this callback can still be triggered after the editor is destroyed.
              if (!editor.isDestroyed()) {
                applyUpdateToEditor(
                  editor,
                  update,
                  diagnosticUpdater,
                  blockDecorationContainer,
                  openedMessageIds,
                  setOpenedMessageIds,
                );
              }
            },
          );
        subscriptions.add(subscription);
      }),
    );
    return subscriptions;
  }
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
  isStaleMessageEnabledStream: Observable<boolean>,
): Observable<DiagnosticMessages> {
  return (
    observableFromSubscribeFunction(editor.onDidChangePath.bind(editor))
      .startWith(editor.getPath())
      .switchMap(
        filePath =>
          filePath != null
            ? observableFromSubscribeFunction(cb =>
                diagnosticUpdater.observeFileMessages(filePath, cb),
              )
            : Observable.empty(),
      )
      .combineLatest(isStaleMessageEnabledStream)
      // $FlowFixMe
      .throttle(
        ([_, isStaleMessageEnabled]) =>
          Observable.interval(
            isStaleMessageEnabled ? STALE_MESSAGE_UPDATE_THROTTLE_TIME : 0,
          ),
        {leading: true, trailing: true},
      )
      .map(([diagnosticMessages, isStaleMessageEnabled]) => {
        return {
          ...diagnosticMessages,
          messages: diagnosticMessages.messages
            .filter(diagnostic => diagnostic.type !== 'Hint')
            .map(message => {
              if (!isStaleMessageEnabled) {
                // Note: reason of doing this is currently Flow is sending message
                // marked as stale sometimes(on user type or immediately on save).
                // Until we turn on the gk, we don't want user to see the Stale
                // style/behavior just yet. so here we mark them as not stale.
                message.stale = false;
              }
              return message;
            }),
        };
      })
      .takeUntil(
        observableFromSubscribeFunction(editor.onDidDestroy.bind(editor)),
      )
  );
}

createPackage(module.exports, Activation);
