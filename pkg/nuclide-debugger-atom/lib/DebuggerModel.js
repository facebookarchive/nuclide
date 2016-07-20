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

var _DebuggerProviderStore2;

function _DebuggerProviderStore() {
  return _DebuggerProviderStore2 = require('./DebuggerProviderStore');
}

var _BreakpointManager2;

function _BreakpointManager() {
  return _BreakpointManager2 = _interopRequireDefault(require('./BreakpointManager'));
}

var _BreakpointStore2;

function _BreakpointStore() {
  return _BreakpointStore2 = _interopRequireDefault(require('./BreakpointStore'));
}

var _DebuggerActions2;

function _DebuggerActions() {
  return _DebuggerActions2 = _interopRequireDefault(require('./DebuggerActions'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _WatchExpressionStore2;

function _WatchExpressionStore() {
  return _WatchExpressionStore2 = require('./WatchExpressionStore');
}

var _CallstackStore2;

function _CallstackStore() {
  return _CallstackStore2 = _interopRequireDefault(require('./CallstackStore'));
}

var _LocalsStore2;

function _LocalsStore() {
  return _LocalsStore2 = _interopRequireDefault(require('./LocalsStore'));
}

var _WatchExpressionListStore2;

function _WatchExpressionListStore() {
  return _WatchExpressionListStore2 = require('./WatchExpressionListStore');
}

var _DebuggerActionsStore2;

function _DebuggerActionsStore() {
  return _DebuggerActionsStore2 = _interopRequireDefault(require('./DebuggerActionsStore'));
}

var _Bridge2;

function _Bridge() {
  return _Bridge2 = _interopRequireDefault(require('./Bridge'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _flux2;

function _flux() {
  return _flux2 = require('flux');
}

var DebuggerModel = (function () {
  function DebuggerModel(state) {
    _classCallCheck(this, DebuggerModel);

    this._dispatcher = new (_flux2 || _flux()).Dispatcher();
    this._store = new (_DebuggerStore2 || _DebuggerStore()).DebuggerStore(this._dispatcher);
    this._actions = new (_DebuggerActions2 || _DebuggerActions()).default(this._dispatcher, this._store);
    this._breakpointStore = new (_BreakpointStore2 || _BreakpointStore()).default(this._dispatcher, state ? state.breakpoints : null);
    //serialized breakpoints
    this._breakpointManager = new (_BreakpointManager2 || _BreakpointManager()).default(this._breakpointStore, this._actions);
    this._bridge = new (_Bridge2 || _Bridge()).default(this);
    this._debuggerProviderStore = new (_DebuggerProviderStore2 || _DebuggerProviderStore()).DebuggerProviderStore(this._dispatcher, this._actions);
    this._watchExpressionStore = new (_WatchExpressionStore2 || _WatchExpressionStore()).WatchExpressionStore(this._dispatcher, this._bridge);
    this._watchExpressionListStore = new (_WatchExpressionListStore2 || _WatchExpressionListStore()).WatchExpressionListStore(this._watchExpressionStore, this._dispatcher);
    this._debuggerActionStore = new (_DebuggerActionsStore2 || _DebuggerActionsStore()).default(this._dispatcher, this._bridge);
    this._callstackStore = new (_CallstackStore2 || _CallstackStore()).default(this._dispatcher);
    this._localsStore = new (_LocalsStore2 || _LocalsStore()).default(this._dispatcher);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore, this._watchExpressionStore, this._debuggerActionStore, this._callstackStore, this._localsStore);
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
    key: 'getBridge',
    value: function getBridge() {
      return this._bridge;
    }
  }]);

  return DebuggerModel;
})();

module.exports = DebuggerModel;