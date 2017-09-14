'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _reduxObservable;

function _load_reduxObservable() {
  return _reduxObservable = require('nuclide-commons/redux-observable');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _Epics;

function _load_Epics() {
  return _Epics = _interopRequireWildcard(require('./redux/Epics'));
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = _interopRequireDefault(require('./redux/Reducers'));
}

var _ConsoleContainer;

function _load_ConsoleContainer() {
  return _ConsoleContainer = require('./ui/ConsoleContainer');
}

var _react = _interopRequireWildcard(require('react'));

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const MAXIMUM_SERIALIZED_MESSAGES_CONFIG = 'nuclide-console.maximumSerializedMessages';

class Activation {

  constructor(rawState) {
    this._rawState = rawState;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.contextMenu.add({
      '.nuclide-console-record': [{
        label: 'Copy Message',
        command: 'nuclide-console:copy-message'
      }]
    }), atom.commands.add('.nuclide-console-record', 'nuclide-console:copy-message', event => {
      const el = event.target;
      if (el == null || typeof el.innerText !== 'string') {
        return;
      }
      atom.clipboard.write(el.innerText);
    }), atom.commands.add('atom-workspace', 'nuclide-console:clear', () => this._getStore().dispatch((_Actions || _load_Actions()).clearRecords())), (_featureConfig || _load_featureConfig()).default.observe('nuclide-console.maximumMessageCount', maxMessageCount => {
      this._getStore().dispatch((_Actions || _load_Actions()).setMaxMessageCount(maxMessageCount));
    }), this._registerCommandAndOpener());
  }

  _getStore() {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(_Epics || _load_Epics()).map(k => (_Epics || _load_Epics())[k]).filter(epic => typeof epic === 'function');
      const rootEpic = (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics);
      this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).default, initialState, (0, (_redux || _load_redux()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));
    }
    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton({
      icon: 'terminal',
      callback: 'nuclide-console:toggle',
      tooltip: 'Toggle Console',
      priority: 700
    });
    this._disposables.add(() => {
      toolBar.removeItems();
    });
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;
    this._getStore().dispatch((_Actions || _load_Actions()).setCreatePasteFunction(createPaste));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (this._getStore().getState().createPasteFunction === createPaste) {
        this._getStore().dispatch((_Actions || _load_Actions()).setCreatePasteFunction(null));
      }
    });
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_ConsoleContainer || _load_ConsoleContainer()).WORKSPACE_VIEW_URI) {
        return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer, { store: this._getStore() }));
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer), atom.commands.add('atom-workspace', 'nuclide-console:toggle', () => {
      atom.workspace.toggle((_ConsoleContainer || _load_ConsoleContainer()).WORKSPACE_VIEW_URI);
    }));
  }

  deserializeConsoleContainer(state) {
    return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_ConsoleContainer || _load_ConsoleContainer()).ConsoleContainer, {
      store: this._getStore(),
      initialFilterText: state.filterText,
      initialEnableRegExpFilter: state.enableRegExpFilter,
      initialUnselectedSourceIds: state.unselectedSourceIds
    }));
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
  provideConsole() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return sourceInfo => {
      if (!(activation != null)) {
        throw new Error('Invariant violation: "activation != null"');
      }

      let disposed;
      activation._getStore().dispatch((_Actions || _load_Actions()).registerSource(sourceInfo));
      const console = {
        // TODO: Update these to be (object: any, ...objects: Array<any>): void.
        log(object) {
          console.append({ text: object, level: 'log' });
        },
        warn(object) {
          console.append({ text: object, level: 'warning' });
        },
        error(object) {
          console.append({ text: object, level: 'error' });
        },
        info(object) {
          console.append({ text: object, level: 'info' });
        },
        append(message) {
          if (!(activation != null && !disposed)) {
            throw new Error('Invariant violation: "activation != null && !disposed"');
          }

          activation._getStore().dispatch((_Actions || _load_Actions()).recordReceived({
            text: message.text,
            level: message.level,
            data: message.data,
            tags: message.tags,
            scopeName: message.scopeName,
            sourceId: sourceInfo.id,
            kind: message.kind || 'message',
            timestamp: new Date() }));
        },
        setStatus(status) {
          if (!(activation != null && !disposed)) {
            throw new Error('Invariant violation: "activation != null && !disposed"');
          }

          activation._getStore().dispatch((_Actions || _load_Actions()).updateStatus(sourceInfo.id, status));
        },
        dispose() {
          if (!(activation != null)) {
            throw new Error('Invariant violation: "activation != null"');
          }

          if (!disposed) {
            disposed = true;
            activation._getStore().dispatch((_Actions || _load_Actions()).removeSource(sourceInfo.id));
          }
        }
      };
      return console;
    };
  }

  provideOutputService() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return {
      registerOutputProvider(outputProvider) {
        if (!(activation != null)) {
          throw new Error('Output service used after deactivation');
        }

        activation._getStore().dispatch((_Actions || _load_Actions()).registerOutputProvider(outputProvider));
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
          if (activation != null) {
            activation._getStore().dispatch((_Actions || _load_Actions()).unregisterOutputProvider(outputProvider));
          }
        });
      }
    };
  }

  provideRegisterExecutor() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return executor => {
      if (!(activation != null)) {
        throw new Error('Executor registration attempted after deactivation');
      }

      activation._getStore().dispatch((_Actions || _load_Actions()).registerExecutor(executor));
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
        if (activation != null) {
          activation._getStore().dispatch((_Actions || _load_Actions()).unregisterExecutor(executor));
        }
      });
    };
  }

  serialize() {
    if (this._store == null) {
      return {};
    }
    const maximumSerializedMessages = (_featureConfig || _load_featureConfig()).default.get(MAXIMUM_SERIALIZED_MESSAGES_CONFIG);
    return {
      records: this._store.getState().records.slice(-maximumSerializedMessages)
    };
  }
}

function deserializeAppState(rawState) {
  return {
    executors: new Map(),
    createPasteFunction: null,
    currentExecutorId: null,
    records: rawState && rawState.records ? rawState.records.map(deserializeRecord) : [],
    history: [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY
  };
}

function deserializeRecord(record) {
  return Object.assign({}, record, {
    timestamp: parseDate(record.timestamp) || new Date(0)
  });
}

function parseDate(raw) {
  if (raw == null) {
    return null;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);