'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _DebuggerProviderStore;

function _load_DebuggerProviderStore() {
  return _DebuggerProviderStore = require('./DebuggerProviderStore');
}

var _BreakpointManager;

function _load_BreakpointManager() {
  return _BreakpointManager = _interopRequireDefault(require('./BreakpointManager'));
}

var _BreakpointStore;

function _load_BreakpointStore() {
  return _BreakpointStore = _interopRequireDefault(require('./BreakpointStore'));
}

var _DebuggerActions;

function _load_DebuggerActions() {
  return _DebuggerActions = _interopRequireDefault(require('./DebuggerActions'));
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _WatchExpressionStore;

function _load_WatchExpressionStore() {
  return _WatchExpressionStore = require('./WatchExpressionStore');
}

var _CallstackStore;

function _load_CallstackStore() {
  return _CallstackStore = _interopRequireDefault(require('./CallstackStore'));
}

var _ScopesStore;

function _load_ScopesStore() {
  return _ScopesStore = _interopRequireDefault(require('./ScopesStore'));
}

var _ThreadStore;

function _load_ThreadStore() {
  return _ThreadStore = _interopRequireDefault(require('./ThreadStore'));
}

var _WatchExpressionListStore;

function _load_WatchExpressionListStore() {
  return _WatchExpressionListStore = require('./WatchExpressionListStore');
}

var _DebuggerActionsStore;

function _load_DebuggerActionsStore() {
  return _DebuggerActionsStore = _interopRequireDefault(require('./DebuggerActionsStore'));
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _atom = require('atom');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = _interopRequireDefault(require('./DebuggerDispatcher'));
}

var _DebuggerPauseController;

function _load_DebuggerPauseController() {
  return _DebuggerPauseController = require('./DebuggerPauseController');
}

var _events = _interopRequireDefault(require('events'));

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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/debugger';

/**
 * Atom ViewProvider compatible model object.
 */
class DebuggerModel {

  constructor(state) {
    this._dispatcher = new (_DebuggerDispatcher || _load_DebuggerDispatcher()).default();
    this._emitter = new _events.default();
    this._store = new (_DebuggerStore || _load_DebuggerStore()).DebuggerStore(this._dispatcher, this);
    this._actions = new (_DebuggerActions || _load_DebuggerActions()).default(this._dispatcher, this._store);
    this._breakpointStore = new (_BreakpointStore || _load_BreakpointStore()).default(this._dispatcher, state ? state.breakpoints : null, // serialized breakpoints
    this._store);
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).default(this._breakpointStore, this._actions);
    this._bridge = new (_Bridge || _load_Bridge()).default(this);
    this._debuggerProviderStore = new (_DebuggerProviderStore || _load_DebuggerProviderStore()).DebuggerProviderStore(this._dispatcher, this._actions);
    this._watchExpressionStore = new (_WatchExpressionStore || _load_WatchExpressionStore()).WatchExpressionStore(this._dispatcher, this._bridge);
    this._watchExpressionListStore = new (_WatchExpressionListStore || _load_WatchExpressionListStore()).WatchExpressionListStore(this._watchExpressionStore, this._dispatcher);
    this._debuggerActionStore = new (_DebuggerActionsStore || _load_DebuggerActionsStore()).default(this._dispatcher, this._bridge);
    this._callstackStore = new (_CallstackStore || _load_CallstackStore()).default(this._dispatcher, this._store);
    this._scopesStore = new (_ScopesStore || _load_ScopesStore()).default(this._dispatcher);
    this._threadStore = new (_ThreadStore || _load_ThreadStore()).default(this._dispatcher);
    this._debuggerPauseController = new (_DebuggerPauseController || _load_DebuggerPauseController()).DebuggerPauseController(this._store);

    this._disposables = new _atom.CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore, this._watchExpressionStore, this._debuggerActionStore, this._callstackStore, this._scopesStore, this._threadStore, this._debuggerPauseController);
  }

  dispose() {
    this._disposables.dispose();
  }

  getLaunchAttachActionEventEmitter() {
    return this._emitter;
  }

  getActions() {
    return this._actions;
  }

  getStore() {
    return this._store;
  }

  getWatchExpressionStore() {
    return this._watchExpressionStore;
  }

  getWatchExpressionListStore() {
    return this._watchExpressionListStore;
  }

  getDebuggerProviderStore() {
    return this._debuggerProviderStore;
  }

  getBreakpointStore() {
    return this._breakpointStore;
  }

  getCallstackStore() {
    return this._callstackStore;
  }

  getScopesStore() {
    return this._scopesStore;
  }

  getThreadStore() {
    return this._threadStore;
  }

  getBridge() {
    return this._bridge;
  }

  getTitle() {
    return 'Debugger';
  }

  getDefaultLocation() {
    return 'right';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getPreferredWidth() {
    return 500;
  }
}
exports.default = DebuggerModel;