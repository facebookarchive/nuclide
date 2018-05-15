'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _immutable;


























function _load_immutable() {return _immutable = require('immutable');}var _createPackage;
function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _destroyItemWhere;
function _load_destroyItemWhere() {return _destroyItemWhere = require('../../../../nuclide-commons-atom/destroyItemWhere');}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _reduxObservable;
function _load_reduxObservable() {return _reduxObservable = require('../../../../nuclide-commons/redux-observable');}var _event;



function _load_event() {return _event = require('../../../../nuclide-commons/event');}var _featureConfig;
function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('../../../../nuclide-commons-atom/feature-config'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}var _Actions;
function _load_Actions() {return _Actions = _interopRequireWildcard(require('./redux/Actions'));}var _Epics;
function _load_Epics() {return _Epics = _interopRequireWildcard(require('./redux/Epics'));}var _Reducers;
function _load_Reducers() {return _Reducers = _interopRequireDefault(require('./redux/Reducers'));}var _Console;
function _load_Console() {return _Console = require('./ui/Console');}var _reduxMin;

function _load_reduxMin() {return _reduxMin = require('redux/dist/redux.min.js');}var _ToolbarUtils;
function _load_ToolbarUtils() {return _ToolbarUtils = require('../../../../nuclide-commons-ui/ToolbarUtils');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */const MAXIMUM_SERIALIZED_MESSAGES_CONFIG = 'atom-ide-console.maximumSerializedMessages';const MAXIMUM_SERIALIZED_HISTORY_CONFIG = 'atom-ide-console.maximumSerializedHistory';class Activation {

  constructor(rawState) {
    this._rawState = rawState;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.contextMenu.add({
      '.console-record': [
      {
        label: 'Copy Message',
        command: 'console:copy-message' }] }),



    atom.commands.add('.console-record', 'console:copy-message', event => {
      const el = event.target;
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (el == null || typeof el.innerText !== 'string') {
        return;
      }
      atom.clipboard.write(el.innerText);
    }),
    atom.commands.add('atom-workspace', 'console:clear', () =>
    this._getStore().dispatch((_Actions || _load_Actions()).clearRecords())),

    (_featureConfig || _load_featureConfig()).default.observe(
    'atom-ide-console.maximumMessageCount',
    maxMessageCount => {
      this._getStore().dispatch(
      (_Actions || _load_Actions()).setMaxMessageCount(maxMessageCount));

    }),

    _rxjsBundlesRxMinJs.Observable.combineLatest(
    (0, (_event || _load_event()).observableFromSubscribeFunction)(cb =>
    atom.config.observe('editor.fontSize', cb)),

    (_featureConfig || _load_featureConfig()).default.observeAsStream('atom-ide-console.fontScale'),
    (fontSize, fontScale) => fontSize * parseFloat(fontScale)).

    map((_Actions || _load_Actions()).setFontSize).
    subscribe(this._store.dispatch),
    this._registerCommandAndOpener());

  }

  _getStore() {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(_Epics || _load_Epics()).
      map(k => (_Epics || _load_Epics())[k]).
      filter(epic => typeof epic === 'function');
      const rootEpic = (0, (_reduxObservable || _load_reduxObservable()).combineEpics)(...epics);
      this._store = (0, (_reduxMin || _load_reduxMin()).createStore)((_Reducers || _load_Reducers()).default,

      initialState,
      (0, (_reduxMin || _load_reduxMin()).applyMiddleware)((0, (_reduxObservable || _load_reduxObservable()).createEpicMiddleware)(rootEpic)));

    }
    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton(
    (0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
      icon: 'terminal',
      callback: 'console:toggle',
      tooltip: 'Toggle Console',
      priority: 700 }));


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

  consumeWatchEditor(watchEditor) {
    this._getStore().dispatch((_Actions || _load_Actions()).setWatchEditor(watchEditor));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (this._getStore().getState().watchEditor === watchEditor) {
        this._getStore().dispatch((_Actions || _load_Actions()).setWatchEditor(null));
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
      getSuggestions(request) {return (0, _asyncToGenerator.default)(function* () {
          // History provides suggestion only on exact match to current input.
          const prefix = request.editor.getText();
          const history = activation._getStore().getState().history;
          // Use a set to remove duplicates.
          const seen = new Set(history);
          return Array.from(seen).
          filter(function (text) {return text.startsWith(prefix);}).
          map(function (text) {return { text, replacementPrefix: prefix };});})();
      } };

  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.workspace.addOpener(uri => {
      if (uri === (_Console || _load_Console()).WORKSPACE_VIEW_URI) {
        return new (_Console || _load_Console()).Console({ store: this._getStore() });
      }
    }),
    () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_Console || _load_Console()).Console),
    atom.commands.add('atom-workspace', 'console:toggle', () => {
      atom.workspace.toggle((_Console || _load_Console()).WORKSPACE_VIEW_URI);
    }));

  }

  deserializeConsole(state) {
    return new (_Console || _load_Console()).Console({
      store: this._getStore(),
      initialFilterText: state.filterText,
      initialEnableRegExpFilter: state.enableRegExpFilter,
      initialUnselectedSourceIds: state.unselectedSourceIds });

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

    return sourceInfo => {if (!(
      activation != null)) {throw new Error('Invariant violation: "activation != null"');}
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
        success(object) {
          console.append({ text: object, level: 'success' });
        },
        append(message) {if (!(
          activation != null && !disposed)) {throw new Error('Invariant violation: "activation != null && !disposed"');}
          activation._getStore().dispatch(
          (_Actions || _load_Actions()).recordReceived({
            text: message.text,
            level: message.level,
            format: message.format,
            data: message.data,
            tags: message.tags,
            scopeName: message.scopeName,
            sourceId: sourceInfo.id,
            kind: message.kind || 'message',
            timestamp: new Date(), // TODO: Allow this to come with the message?
            repeatCount: 1 }));


        },
        setStatus(status) {if (!(
          activation != null && !disposed)) {throw new Error('Invariant violation: "activation != null && !disposed"');}
          activation.
          _getStore().
          dispatch((_Actions || _load_Actions()).updateStatus(sourceInfo.id, status));
        },
        dispose() {if (!(
          activation != null)) {throw new Error('Invariant violation: "activation != null"');}
          if (!disposed) {
            disposed = true;
            activation.
            _getStore().
            dispatch((_Actions || _load_Actions()).removeSource(sourceInfo.id));
          }
        } };

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
      registerOutputProvider(outputProvider) {if (!(
        activation != null)) {throw new Error('Output service used after deactivation');}
        activation.
        _getStore().
        dispatch((_Actions || _load_Actions()).registerOutputProvider(outputProvider));
        return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
          if (activation != null) {
            activation.
            _getStore().
            dispatch((_Actions || _load_Actions()).unregisterOutputProvider(outputProvider));
          }
        });
      } };

  }

  provideRegisterExecutor() {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => {
      activation = null;
    });

    return executor => {if (!(

      activation != null)) {throw new Error(
        'Executor registration attempted after deactivation');}

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
    const maximumSerializedMessages = (_featureConfig || _load_featureConfig()).default.get(
    MAXIMUM_SERIALIZED_MESSAGES_CONFIG);

    const maximumSerializedHistory = (_featureConfig || _load_featureConfig()).default.get(
    MAXIMUM_SERIALIZED_HISTORY_CONFIG);

    return {
      records: this._store.
      getState().
      records.slice(-maximumSerializedMessages).
      toArray().
      map(record => {
        // `Executor` is not serializable. Make sure to remove it first.
        const { executor } = record,rest = _objectWithoutProperties(record, ['executor']);
        return rest;
      }),
      history: this._store.getState().history.slice(-maximumSerializedHistory) };

  }}


function deserializeAppState(rawState) {
  return {
    executors: new Map(),
    createPasteFunction: null,
    currentExecutorId: null,
    records:
    rawState && rawState.records ?
    (0, (_immutable || _load_immutable()).List)(rawState.records.map(deserializeRecord)) :
    (0, (_immutable || _load_immutable()).List)(),
    history: rawState && rawState.history ? rawState.history : [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY };

}

function deserializeRecord(record) {
  return Object.assign({},
  record, {
    timestamp: parseDate(record.timestamp) || new Date(0) });

}

function parseDate(raw) {
  if (raw == null) {
    return null;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);