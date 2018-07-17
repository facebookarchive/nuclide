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

import type {
  AppState,
  ConsolePersistedState,
  ConsoleService,
  SourceInfo,
  Message,
  OutputProvider,
  OutputProviderStatus,
  OutputService,
  Record,
  RegisterExecutorFunction,
  Store,
} from './types';
import type {CreatePasteFunction} from './types';

import {List} from 'immutable';
import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import {Observable} from 'rxjs';
import {
  combineEpics,
  createEpicMiddleware,
} from 'nuclide-commons/redux-observable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import Reducers from './redux/Reducers';
import {Console, WORKSPACE_VIEW_URI} from './ui/Console';
import invariant from 'assert';
import {applyMiddleware, createStore} from 'redux';

const MAXIMUM_SERIALIZED_MESSAGES_CONFIG =
  'atom-ide-console.maximumSerializedMessages';
const MAXIMUM_SERIALIZED_HISTORY_CONFIG =
  'atom-ide-console.maximumSerializedHistory';

class Activation {
  _disposables: UniversalDisposable;
  _rawState: ?Object;
  _store: Store;

  constructor(rawState: ?Object) {
    this._rawState = rawState;
    this._disposables = new UniversalDisposable(
      atom.contextMenu.add({
        '.console-record': [
          {
            label: 'Copy Message',
            command: 'console:copy-message',
          },
        ],
      }),
      atom.commands.add('.console-record', 'console:copy-message', event => {
        const el = event.target;
        // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
        if (el == null || typeof el.innerText !== 'string') {
          return;
        }
        atom.clipboard.write(el.innerText);
      }),
      atom.commands.add('atom-workspace', 'console:clear', () =>
        this._getStore().dispatch(Actions.clearRecords()),
      ),
      featureConfig.observe(
        'atom-ide-console.maximumMessageCount',
        (maxMessageCount: any) => {
          this._getStore().dispatch(
            Actions.setMaxMessageCount(maxMessageCount),
          );
        },
      ),
      Observable.combineLatest(
        observableFromSubscribeFunction(cb =>
          atom.config.observe('editor.fontSize', cb),
        ),
        featureConfig.observeAsStream('atom-ide-console.fontScale'),
        (fontSize, fontScale) => fontSize * parseFloat(fontScale),
      )
        .map(Actions.setFontSize)
        .subscribe(this._store.dispatch),
      this._registerCommandAndOpener(),
    );
  }

  _getStore(): Store {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(Epics)
        .map(k => Epics[k])
        .filter(epic => typeof epic === 'function');
      const rootEpic = combineEpics(...epics);
      this._store = createStore(
        Reducers,
        initialState,
        applyMiddleware(createEpicMiddleware(rootEpic)),
      );
    }
    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar: toolbar$GetToolbar): void {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton({
      icon: 'nuclicon-console',
      callback: 'console:toggle',
      tooltip: 'Toggle Console',
      priority: 700,
    });
    this._disposables.add(() => {
      toolBar.removeItems();
    });
  }

  consumePasteProvider(provider: any): IDisposable {
    const createPaste: CreatePasteFunction = provider.createPaste;
    this._getStore().dispatch(Actions.setCreatePasteFunction(createPaste));
    return new UniversalDisposable(() => {
      if (this._getStore().getState().createPasteFunction === createPaste) {
        this._getStore().dispatch(Actions.setCreatePasteFunction(null));
      }
    });
  }

  consumeWatchEditor(watchEditor: atom$AutocompleteWatchEditor): IDisposable {
    this._getStore().dispatch(Actions.setWatchEditor(watchEditor));
    return new UniversalDisposable(() => {
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (this._getStore().getState().watchEditor === watchEditor) {
        this._getStore().dispatch(Actions.setWatchEditor(null));
      }
    });
  }

  provideAutocomplete(): atom$AutocompleteProvider {
    const activation = this;
    return {
      labels: ['nuclide-console'],
      selector: '*',
      // Copies Chrome devtools and puts history suggestions at the bottom.
      suggestionPriority: -1,
      async getSuggestions(request) {
        // History provides suggestion only on exact match to current input.
        const prefix = request.editor.getText();
        const history = activation._getStore().getState().history;
        // Use a set to remove duplicates.
        const seen = new Set(history);
        return Array.from(seen)
          .filter(text => text.startsWith(prefix))
          .map(text => ({text, replacementPrefix: prefix}));
      },
    };
  }

  _registerCommandAndOpener(): UniversalDisposable {
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return new Console({store: this._getStore()});
        }
      }),
      () => destroyItemWhere(item => item instanceof Console),
      atom.commands.add('atom-workspace', 'console:toggle', () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      }),
    );
  }

  deserializeConsole(state: ConsolePersistedState): Console {
    return new Console({
      store: this._getStore(),
      initialFilterText: state.filterText,
      initialEnableRegExpFilter: state.enableRegExpFilter,
      initialUnselectedSourceIds: state.unselectedSourceIds,
    });
  }

  /**
   * This service provides a factory for creating a console object tied to a particular source. If
   * the consumer wants to expose starting and stopping functionality through the Console UI (for
   * example, to allow the user to decide when to start and stop tailing logs), they can include
   * `start()` and `stop()` functions on the object they pass to the factory.
   *
   * When the factory is invoked, the source will be added to the Console UI's filter list. The
   * factory returns a Disposable which should be disposed of when the source goes away (e.g. its
   * package is disabled). This will remove the source from the Console UI's filter list (as long as
   * there aren't any remaining messages from the source).
   */
  provideConsole(): ConsoleService {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return (sourceInfo: SourceInfo) => {
      invariant(activation != null);
      let disposed;
      activation._getStore().dispatch(Actions.registerSource(sourceInfo));
      const console = {
        // TODO: Update these to be (object: any, ...objects: Array<any>): void.
        log(object: string): void {
          console.append({text: object, level: 'log'});
        },
        warn(object: string): void {
          console.append({text: object, level: 'warning'});
        },
        error(object: string): void {
          console.append({text: object, level: 'error'});
        },
        info(object: string): void {
          console.append({text: object, level: 'info'});
        },
        success(object: string): void {
          console.append({text: object, level: 'success'});
        },
        append(message: Message): void {
          invariant(activation != null && !disposed);
          activation._getStore().dispatch(
            Actions.recordReceived({
              text: message.text,
              level: message.level,
              format: message.format,
              data: message.data,
              tags: message.tags,
              scopeName: message.scopeName,
              sourceId: sourceInfo.id,
              kind: message.kind || 'message',
              timestamp: new Date(), // TODO: Allow this to come with the message?
              repeatCount: 1,
            }),
          );
        },
        setStatus(status: OutputProviderStatus): void {
          invariant(activation != null && !disposed);
          activation
            ._getStore()
            .dispatch(Actions.updateStatus(sourceInfo.id, status));
        },
        dispose(): void {
          invariant(activation != null);
          if (!disposed) {
            disposed = true;
            activation
              ._getStore()
              .dispatch(Actions.removeSource(sourceInfo.id));
          }
        },
      };
      return console;
    };
  }

  provideOutputService(): OutputService {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return {
      registerOutputProvider(outputProvider: OutputProvider): IDisposable {
        invariant(activation != null, 'Output service used after deactivation');
        activation
          ._getStore()
          .dispatch(Actions.registerOutputProvider(outputProvider));
        return new UniversalDisposable(() => {
          if (activation != null) {
            activation
              ._getStore()
              .dispatch(Actions.unregisterOutputProvider(outputProvider));
          }
        });
      },
    };
  }

  provideRegisterExecutor(): RegisterExecutorFunction {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return executor => {
      invariant(
        activation != null,
        'Executor registration attempted after deactivation',
      );
      activation._getStore().dispatch(Actions.registerExecutor(executor));
      return new UniversalDisposable(() => {
        if (activation != null) {
          activation._getStore().dispatch(Actions.unregisterExecutor(executor));
        }
      });
    };
  }

  serialize(): Object {
    if (this._store == null) {
      return {};
    }
    const maximumSerializedMessages: number = (featureConfig.get(
      MAXIMUM_SERIALIZED_MESSAGES_CONFIG,
    ): any);
    const maximumSerializedHistory: number = (featureConfig.get(
      MAXIMUM_SERIALIZED_HISTORY_CONFIG,
    ): any);
    return {
      records: this._store
        .getState()
        .records.slice(-maximumSerializedMessages)
        .toArray()
        .map(record => {
          // `Executor` is not serializable. Make sure to remove it first.
          const {executor, ...rest} = record;
          return rest;
        }),
      history: this._store.getState().history.slice(-maximumSerializedHistory),
    };
  }
}

function deserializeAppState(rawState: ?Object): AppState {
  return {
    executors: new Map(),
    createPasteFunction: null,
    currentExecutorId: null,
    records:
      rawState && rawState.records
        ? List(rawState.records.map(deserializeRecord))
        : List(),
    history: rawState && rawState.history ? rawState.history : [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY,
  };
}

function deserializeRecord(record: Object): Record {
  return {
    ...record,
    timestamp: parseDate(record.timestamp) || new Date(0),
  };
}

function parseDate(raw: ?string): ?Date {
  if (raw == null) {
    return null;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

createPackage(module.exports, Activation);
