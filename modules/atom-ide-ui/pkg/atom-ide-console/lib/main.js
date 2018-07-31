"use strict";

function _immutable() {
  const data = require("immutable");

  _immutable = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../../nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _reduxObservable() {
  const data = require("../../../../nuclide-commons/redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function Epics() {
  const data = _interopRequireWildcard(require("./redux/Epics"));

  Epics = function () {
    return data;
  };

  return data;
}

function _Reducers() {
  const data = _interopRequireDefault(require("./redux/Reducers"));

  _Reducers = function () {
    return data;
  };

  return data;
}

function _Console() {
  const data = require("./ui/Console");

  _Console = function () {
    return data;
  };

  return data;
}

function _reduxMin() {
  const data = require("redux/dist/redux.min.js");

  _reduxMin = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const MAXIMUM_SERIALIZED_MESSAGES_CONFIG = 'atom-ide-console.maximumSerializedMessages';
const MAXIMUM_SERIALIZED_HISTORY_CONFIG = 'atom-ide-console.maximumSerializedHistory';

class Activation {
  constructor(rawState) {
    this._rawState = rawState;
    this._disposables = new (_UniversalDisposable().default)(atom.contextMenu.add({
      '.console-record': [{
        label: 'Copy Message',
        command: 'console:copy-message'
      }]
    }), atom.commands.add('.console-record', 'console:copy-message', event => {
      const el = event.target; // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

      if (el == null || typeof el.innerText !== 'string') {
        return;
      }

      atom.clipboard.write(el.innerText);
    }), atom.commands.add('atom-workspace', 'console:clear', () => this._getStore().dispatch(Actions().clearRecords())), _featureConfig().default.observe('atom-ide-console.maximumMessageCount', maxMessageCount => {
      this._getStore().dispatch(Actions().setMaxMessageCount(maxMessageCount));
    }), _RxMin.Observable.combineLatest((0, _event().observableFromSubscribeFunction)(cb => atom.config.observe('editor.fontSize', cb)), _featureConfig().default.observeAsStream('atom-ide-console.fontScale'), (fontSize, fontScale) => fontSize * parseFloat(fontScale)).map(Actions().setFontSize).subscribe(this._store.dispatch), this._registerCommandAndOpener());
  }

  _getStore() {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(Epics()).map(k => Epics()[k]).filter(epic => typeof epic === 'function');
      const rootEpic = (0, _reduxObservable().combineEpics)(...epics);
      this._store = (0, _reduxMin().createStore)(_Reducers().default, initialState, (0, _reduxMin().applyMiddleware)((0, _reduxObservable().createEpicMiddleware)(rootEpic)));
    }

    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton({
      icon: 'nuclicon-console',
      callback: 'console:toggle',
      tooltip: 'Toggle Console',
      priority: 700
    });

    this._disposables.add(() => {
      toolBar.removeItems();
    });
  }

  consumePasteProvider(provider) {
    const createPaste = provider.createPaste;

    this._getStore().dispatch(Actions().setCreatePasteFunction(createPaste));

    return new (_UniversalDisposable().default)(() => {
      if (this._getStore().getState().createPasteFunction === createPaste) {
        this._getStore().dispatch(Actions().setCreatePasteFunction(null));
      }
    });
  }

  consumeWatchEditor(watchEditor) {
    this._getStore().dispatch(Actions().setWatchEditor(watchEditor));

    return new (_UniversalDisposable().default)(() => {
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (this._getStore().getState().watchEditor === watchEditor) {
        this._getStore().dispatch(Actions().setWatchEditor(null));
      }
    });
  }

  provideAutocomplete() {
    const activation = this;
    return {
      labels: ['nuclide-console'],
      selector: '*',
      // Copies Chrome devtools and puts history suggestions at the bottom.
      suggestionPriority: -1,

      async getSuggestions(request) {
        // History provides suggestion only on exact match to current input.
        const prefix = request.editor.getText();

        const history = activation._getStore().getState().history; // Use a set to remove duplicates.


        const seen = new Set(history);
        return Array.from(seen).filter(text => text.startsWith(prefix)).map(text => ({
          text,
          replacementPrefix: prefix
        }));
      }

    };
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _Console().WORKSPACE_VIEW_URI) {
        return new (_Console().Console)({
          store: this._getStore()
        });
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _Console().Console), atom.commands.add('atom-workspace', 'console:toggle', () => {
      atom.workspace.toggle(_Console().WORKSPACE_VIEW_URI);
    }));
  }

  deserializeConsole(state) {
    return new (_Console().Console)({
      store: this._getStore(),
      initialFilterText: state.filterText,
      initialEnableRegExpFilter: state.enableRegExpFilter,
      initialUnselectedSourceIds: state.unselectedSourceIds
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


  provideConsole() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;

    this._disposables.add(() => {
      activation = null;
    });

    return sourceInfo => {
      if (!(activation != null)) {
        throw new Error("Invariant violation: \"activation != null\"");
      }

      let disposed;

      activation._getStore().dispatch(Actions().registerSource(sourceInfo));

      const console = {
        // TODO: Update these to be (object: any, ...objects: Array<any>): void.
        log(object) {
          console.append({
            text: object,
            level: 'log'
          });
        },

        warn(object) {
          console.append({
            text: object,
            level: 'warning'
          });
        },

        error(object) {
          console.append({
            text: object,
            level: 'error'
          });
        },

        info(object) {
          console.append({
            text: object,
            level: 'info'
          });
        },

        success(object) {
          console.append({
            text: object,
            level: 'success'
          });
        },

        append(message) {
          if (!(activation != null && !disposed)) {
            throw new Error("Invariant violation: \"activation != null && !disposed\"");
          }

          activation._getStore().dispatch(Actions().recordReceived({
            text: message.text,
            level: message.level,
            format: message.format,
            data: message.data,
            tags: message.tags,
            scopeName: message.scopeName,
            sourceId: sourceInfo.id,
            kind: message.kind || 'message',
            timestamp: new Date(),
            // TODO: Allow this to come with the message?
            repeatCount: 1
          }));
        },

        setStatus(status) {
          if (!(activation != null && !disposed)) {
            throw new Error("Invariant violation: \"activation != null && !disposed\"");
          }

          activation._getStore().dispatch(Actions().updateStatus(sourceInfo.id, status));
        },

        dispose() {
          if (!(activation != null)) {
            throw new Error("Invariant violation: \"activation != null\"");
          }

          if (!disposed) {
            disposed = true;

            activation._getStore().dispatch(Actions().removeSource(sourceInfo.id));
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

        activation._getStore().dispatch(Actions().registerOutputProvider(outputProvider));

        return new (_UniversalDisposable().default)(() => {
          if (activation != null) {
            activation._getStore().dispatch(Actions().unregisterOutputProvider(outputProvider));
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

      activation._getStore().dispatch(Actions().registerExecutor(executor));

      return new (_UniversalDisposable().default)(() => {
        if (activation != null) {
          activation._getStore().dispatch(Actions().unregisterExecutor(executor));
        }
      });
    };
  }

  serialize() {
    if (this._store == null) {
      return {};
    }

    const maximumSerializedMessages = _featureConfig().default.get(MAXIMUM_SERIALIZED_MESSAGES_CONFIG);

    const maximumSerializedHistory = _featureConfig().default.get(MAXIMUM_SERIALIZED_HISTORY_CONFIG);

    return {
      records: this._store.getState().records.slice(-maximumSerializedMessages).toArray().map(record => {
        // `Executor` is not serializable. Make sure to remove it first.
        const {
          executor
        } = record,
              rest = _objectWithoutProperties(record, ["executor"]);

        return rest;
      }),
      history: this._store.getState().history.slice(-maximumSerializedHistory)
    };
  }

}

function deserializeAppState(rawState) {
  return {
    executors: new Map(),
    createPasteFunction: null,
    currentExecutorId: null,
    records: rawState && rawState.records ? (0, _immutable().List)(rawState.records.map(deserializeRecord)) : (0, _immutable().List)(),
    history: rawState && rawState.history ? rawState.history : [],
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

(0, _createPackage().default)(module.exports, Activation);