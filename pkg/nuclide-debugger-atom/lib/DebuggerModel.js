var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _DebuggerProviderStore = require('./DebuggerProviderStore');

var _BreakpointManager = require('./BreakpointManager');

var _BreakpointManager2 = _interopRequireDefault(_BreakpointManager);

var _BreakpointStore = require('./BreakpointStore');

var _BreakpointStore2 = _interopRequireDefault(_BreakpointStore);

var _DebuggerActions = require('./DebuggerActions');

var _DebuggerActions2 = _interopRequireDefault(_DebuggerActions);

var _DebuggerStore = require('./DebuggerStore');

var _WatchExpressionStore = require('./WatchExpressionStore');

var _Bridge = require('./Bridge');

var _Bridge2 = _interopRequireDefault(_Bridge);

var _atom = require('atom');

var _flux = require('flux');

/**
 * Atom ViewProvider compatible model object.
 */

var DebuggerModel = (function () {
  function DebuggerModel(state) {
    _classCallCheck(this, DebuggerModel);

    this._dispatcher = new _flux.Dispatcher();
    this._store = new _DebuggerStore.DebuggerStore(this._dispatcher);
    this._actions = new _DebuggerActions2.default(this._dispatcher, this._store);
    this._breakpointStore = new _BreakpointStore2.default(state ? state.breakpoints : null);
    this._breakpointManager = new _BreakpointManager2.default(this._breakpointStore);
    this._bridge = new _Bridge2.default(this);
    this._debuggerProviderStore = new _DebuggerProviderStore.DebuggerProviderStore(this._dispatcher, this._actions);
    this._watchExpressionStore = new _WatchExpressionStore.WatchExpressionStore(this._bridge);

    this._disposables = new _atom.CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore, this._watchExpressionStore);
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