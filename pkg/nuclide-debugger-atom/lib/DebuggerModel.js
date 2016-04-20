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
//# sourceMappingURL=data:application/json;base64,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bnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtEZWJ1Z2dlclByb3ZpZGVyU3RvcmV9IGZyb20gJy4vRGVidWdnZXJQcm92aWRlclN0b3JlJztcbmNvbnN0IEJyZWFrcG9pbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9CcmVha3BvaW50TWFuYWdlcicpO1xuY29uc3QgQnJlYWtwb2ludFN0b3JlID0gcmVxdWlyZSgnLi9CcmVha3BvaW50U3RvcmUnKTtcbmNvbnN0IERlYnVnZ2VyQWN0aW9ucyA9IHJlcXVpcmUoJy4vRGVidWdnZXJBY3Rpb25zJyk7XG5jb25zdCB7RGVidWdnZXJTdG9yZX0gPSByZXF1aXJlKCcuL0RlYnVnZ2VyU3RvcmUnKTtcbmNvbnN0IHtXYXRjaEV4cHJlc3Npb25TdG9yZX0gPSByZXF1aXJlKCcuL1dhdGNoRXhwcmVzc2lvblN0b3JlJyk7XG5jb25zdCBCcmlkZ2UgPSByZXF1aXJlKCcuL0JyaWRnZScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZFN0YXRlfSBmcm9tICcuLic7XG5cbi8qKlxuICogQXRvbSBWaWV3UHJvdmlkZXIgY29tcGF0aWJsZSBtb2RlbCBvYmplY3QuXG4gKi9cbmNsYXNzIERlYnVnZ2VyTW9kZWwge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3Rpb25zOiBEZWJ1Z2dlckFjdGlvbnM7XG4gIF9icmVha3BvaW50TWFuYWdlcjogQnJlYWtwb2ludE1hbmFnZXI7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9zdG9yZTogRGVidWdnZXJTdG9yZTtcbiAgX3dhdGNoRXhwcmVzc2lvblN0b3JlOiBXYXRjaEV4cHJlc3Npb25TdG9yZTtcbiAgX2RlYnVnZ2VyUHJvdmlkZXJTdG9yZTogRGVidWdnZXJQcm92aWRlclN0b3JlO1xuICBfYnJpZGdlOiBCcmlkZ2U7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBEZWJ1Z2dlclN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgRGVidWdnZXJBY3Rpb25zKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKHN0YXRlID8gc3RhdGUuYnJlYWtwb2ludHMgOiBudWxsKTtcbiAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlciA9IG5ldyBCcmVha3BvaW50TWFuYWdlcih0aGlzLl9icmVha3BvaW50U3RvcmUpO1xuICAgIHRoaXMuX2JyaWRnZSA9IG5ldyBCcmlkZ2UodGhpcyk7XG4gICAgdGhpcy5fZGVidWdnZXJQcm92aWRlclN0b3JlID0gbmV3IERlYnVnZ2VyUHJvdmlkZXJTdG9yZSh0aGlzLl9kaXNwYXRjaGVyLCB0aGlzLl9hY3Rpb25zKTtcbiAgICB0aGlzLl93YXRjaEV4cHJlc3Npb25TdG9yZSA9IG5ldyBXYXRjaEV4cHJlc3Npb25TdG9yZSh0aGlzLl9icmlkZ2UpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX3N0b3JlLFxuICAgICAgdGhpcy5fYWN0aW9ucyxcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSxcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRNYW5hZ2VyLFxuICAgICAgdGhpcy5fYnJpZGdlLFxuICAgICAgdGhpcy5fZGVidWdnZXJQcm92aWRlclN0b3JlLFxuICAgICAgdGhpcy5fd2F0Y2hFeHByZXNzaW9uU3RvcmUsXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgZ2V0QWN0aW9ucygpOiBEZWJ1Z2dlckFjdGlvbnMge1xuICAgIHJldHVybiB0aGlzLl9hY3Rpb25zO1xuICB9XG5cbiAgZ2V0U3RvcmUoKTogRGVidWdnZXJTdG9yZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlO1xuICB9XG5cbiAgZ2V0V2F0Y2hFeHByZXNzaW9uU3RvcmUoKTogV2F0Y2hFeHByZXNzaW9uU3RvcmUge1xuICAgIHJldHVybiB0aGlzLl93YXRjaEV4cHJlc3Npb25TdG9yZTtcbiAgfVxuXG4gIGdldERlYnVnZ2VyUHJvdmlkZXJTdG9yZSgpOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmUge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIH1cblxuICBnZXRCcmVha3BvaW50U3RvcmUoKTogQnJlYWtwb2ludFN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlO1xuICB9XG5cbiAgZ2V0QnJpZGdlKCk6IEJyaWRnZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyaWRnZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyTW9kZWw7XG4iXX0=