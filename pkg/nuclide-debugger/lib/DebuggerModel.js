var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * Atom ViewProvider compatible model object.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _LocalsStore;

function _load_LocalsStore() {
  return _LocalsStore = _interopRequireDefault(require('./LocalsStore'));
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

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = _interopRequireDefault(require('./DebuggerDispatcher'));
}

var _DebuggerPauseController;

function _load_DebuggerPauseController() {
  return _DebuggerPauseController = require('./DebuggerPauseController');
}

var DebuggerModel = (function () {
  function DebuggerModel(state) {
    _classCallCheck(this, DebuggerModel);

    this._dispatcher = new (_DebuggerDispatcher || _load_DebuggerDispatcher()).default();
    this._store = new (_DebuggerStore || _load_DebuggerStore()).DebuggerStore(this._dispatcher, this);
    this._actions = new (_DebuggerActions || _load_DebuggerActions()).default(this._dispatcher, this._store);
    this._breakpointStore = new (_BreakpointStore || _load_BreakpointStore()).default(this._dispatcher, state ? state.breakpoints : null);
    //serialized breakpoints
    this._breakpointManager = new (_BreakpointManager || _load_BreakpointManager()).default(this._breakpointStore, this._actions);
    this._bridge = new (_Bridge || _load_Bridge()).default(this);
    this._debuggerProviderStore = new (_DebuggerProviderStore || _load_DebuggerProviderStore()).DebuggerProviderStore(this._dispatcher, this._actions);
    this._watchExpressionStore = new (_WatchExpressionStore || _load_WatchExpressionStore()).WatchExpressionStore(this._dispatcher, this._bridge);
    this._watchExpressionListStore = new (_WatchExpressionListStore || _load_WatchExpressionListStore()).WatchExpressionListStore(this._watchExpressionStore, this._dispatcher);
    this._debuggerActionStore = new (_DebuggerActionsStore || _load_DebuggerActionsStore()).default(this._dispatcher, this._bridge);
    this._callstackStore = new (_CallstackStore || _load_CallstackStore()).default(this._dispatcher);
    this._localsStore = new (_LocalsStore || _load_LocalsStore()).default(this._dispatcher);
    this._threadStore = new (_ThreadStore || _load_ThreadStore()).default(this._dispatcher);
    this._debuggerPauseController = new (_DebuggerPauseController || _load_DebuggerPauseController()).DebuggerPauseController(this._store);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore, this._watchExpressionStore, this._debuggerActionStore, this._callstackStore, this._localsStore, this._threadStore, this._debuggerPauseController);
  }

  _createClass(DebuggerModel, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'getActions',
    value: function getActions() {
      return this._actions;
    }
  }, {
    key: 'getStore',
    value: function getStore() {
      return this._store;
    }
  }, {
    key: 'getWatchExpressionStore',
    value: function getWatchExpressionStore() {
      return this._watchExpressionStore;
    }
  }, {
    key: 'getWatchExpressionListStore',
    value: function getWatchExpressionListStore() {
      return this._watchExpressionListStore;
    }
  }, {
    key: 'getDebuggerProviderStore',
    value: function getDebuggerProviderStore() {
      return this._debuggerProviderStore;
    }
  }, {
    key: 'getBreakpointStore',
    value: function getBreakpointStore() {
      return this._breakpointStore;
    }
  }, {
    key: 'getCallstackStore',
    value: function getCallstackStore() {
      return this._callstackStore;
    }
  }, {
    key: 'getLocalsStore',
    value: function getLocalsStore() {
      return this._localsStore;
    }
  }, {
    key: 'getThreadStore',
    value: function getThreadStore() {
      return this._threadStore;
    }
  }, {
    key: 'getBridge',
    value: function getBridge() {
      return this._bridge;
    }
  }]);

  return DebuggerModel;
})();

module.exports = DebuggerModel;