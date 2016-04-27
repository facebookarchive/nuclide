var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DebuggerProviderStore = require('./DebuggerProviderStore');

/**
 * Atom ViewProvider compatible model object.
 */

var BreakpointManager = require('./BreakpointManager');
var BreakpointStore = require('./BreakpointStore');
var DebuggerActions = require('./DebuggerActions');

var _require = require('./DebuggerStore');

var DebuggerStore = _require.DebuggerStore;

var _require2 = require('./WatchExpressionStore');

var WatchExpressionStore = _require2.WatchExpressionStore;

var Bridge = require('./Bridge');

var _require3 = require('atom');

var CompositeDisposable = _require3.CompositeDisposable;

var _require4 = require('flux');

var Dispatcher = _require4.Dispatcher;

var DebuggerModel = (function () {
  function DebuggerModel(state) {
    _classCallCheck(this, DebuggerModel);

    this._dispatcher = new Dispatcher();
    this._store = new DebuggerStore(this._dispatcher);
    this._actions = new DebuggerActions(this._dispatcher, this._store);
    this._breakpointStore = new BreakpointStore(state ? state.breakpoints : null);
    this._breakpointManager = new BreakpointManager(this._breakpointStore);
    this._bridge = new Bridge(this);
    this._debuggerProviderStore = new _DebuggerProviderStore.DebuggerProviderStore(this._dispatcher, this._actions);
    this._watchExpressionStore = new WatchExpressionStore(this._bridge);

    this._disposables = new CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore, this._watchExpressionStore);
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
    key: 'getBridge',
    value: function getBridge() {
      return this._bridge;
    }
  }]);

  return DebuggerModel;
})();

module.exports = DebuggerModel;