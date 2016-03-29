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

var Bridge = require('./Bridge');

var _require2 = require('atom');

var CompositeDisposable = _require2.CompositeDisposable;

var _require3 = require('flux');

var Dispatcher = _require3.Dispatcher;

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

    this._disposables = new CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge, this._debuggerProviderStore);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FDQVdvQyx5QkFBeUI7Ozs7OztBQUM3RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztlQUM3QixPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQTNDLGFBQWEsWUFBYixhQUFhOztBQUNwQixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O2dCQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXRDLG1CQUFtQixhQUFuQixtQkFBbUI7O2dCQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsYUFBVixVQUFVOztJQU9YLGFBQWE7QUFVTixXQVZQLGFBQWEsQ0FVTCxLQUF1QixFQUFFOzBCQVZqQyxhQUFhOztBQVdmLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUNwQyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25FLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM5RSxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN2RSxRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxzQkFBc0IsR0FBRyxpREFBMEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXpGLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsQ0FDekMsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGtCQUFrQixFQUN2QixJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksQ0FBQyxzQkFBc0IsQ0FDNUIsQ0FBQztHQUNIOztlQTNCRyxhQUFhOztXQTZCVixtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVTLHNCQUFvQjtBQUM1QixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVPLG9CQUFrQjtBQUN4QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDcEI7OztXQUV1QixvQ0FBMEI7QUFDaEQsYUFBTyxJQUFJLENBQUMsc0JBQXNCLENBQUM7S0FDcEM7OztXQUVpQiw4QkFBb0I7QUFDcEMsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztXQUVRLHFCQUFXO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBbkRHLGFBQWE7OztBQXNEbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGVidWdnZXJNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7RGVidWdnZXJQcm92aWRlclN0b3JlfSBmcm9tICcuL0RlYnVnZ2VyUHJvdmlkZXJTdG9yZSc7XG5jb25zdCBCcmVha3BvaW50TWFuYWdlciA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludE1hbmFnZXInKTtcbmNvbnN0IEJyZWFrcG9pbnRTdG9yZSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCBEZWJ1Z2dlckFjdGlvbnMgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQWN0aW9ucycpO1xuY29uc3Qge0RlYnVnZ2VyU3RvcmV9ID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclN0b3JlJyk7XG5jb25zdCBCcmlkZ2UgPSByZXF1aXJlKCcuL0JyaWRnZScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZFN0YXRlfSBmcm9tICcuLic7XG5cbi8qKlxuICogQXRvbSBWaWV3UHJvdmlkZXIgY29tcGF0aWJsZSBtb2RlbCBvYmplY3QuXG4gKi9cbmNsYXNzIERlYnVnZ2VyTW9kZWwge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9hY3Rpb25zOiBEZWJ1Z2dlckFjdGlvbnM7XG4gIF9icmVha3BvaW50TWFuYWdlcjogQnJlYWtwb2ludE1hbmFnZXI7XG4gIF9icmVha3BvaW50U3RvcmU6IEJyZWFrcG9pbnRTdG9yZTtcbiAgX2Rpc3BhdGNoZXI6IERpc3BhdGNoZXI7XG4gIF9zdG9yZTogRGVidWdnZXJTdG9yZTtcbiAgX2RlYnVnZ2VyUHJvdmlkZXJTdG9yZTogRGVidWdnZXJQcm92aWRlclN0b3JlO1xuICBfYnJpZGdlOiBCcmlkZ2U7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBEZWJ1Z2dlclN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgRGVidWdnZXJBY3Rpb25zKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKHN0YXRlID8gc3RhdGUuYnJlYWtwb2ludHMgOiBudWxsKTtcbiAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlciA9IG5ldyBCcmVha3BvaW50TWFuYWdlcih0aGlzLl9icmVha3BvaW50U3RvcmUpO1xuICAgIHRoaXMuX2JyaWRnZSA9IG5ldyBCcmlkZ2UodGhpcyk7XG4gICAgdGhpcy5fZGVidWdnZXJQcm92aWRlclN0b3JlID0gbmV3IERlYnVnZ2VyUHJvdmlkZXJTdG9yZSh0aGlzLl9kaXNwYXRjaGVyLCB0aGlzLl9hY3Rpb25zKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLl9zdG9yZSxcbiAgICAgIHRoaXMuX2FjdGlvbnMsXG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUsXG4gICAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlcixcbiAgICAgIHRoaXMuX2JyaWRnZSxcbiAgICAgIHRoaXMuX2RlYnVnZ2VyUHJvdmlkZXJTdG9yZSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBnZXRBY3Rpb25zKCk6IERlYnVnZ2VyQWN0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGlvbnM7XG4gIH1cblxuICBnZXRTdG9yZSgpOiBEZWJ1Z2dlclN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmU7XG4gIH1cblxuICBnZXREZWJ1Z2dlclByb3ZpZGVyU3RvcmUoKTogRGVidWdnZXJQcm92aWRlclN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fZGVidWdnZXJQcm92aWRlclN0b3JlO1xuICB9XG5cbiAgZ2V0QnJlYWtwb2ludFN0b3JlKCk6IEJyZWFrcG9pbnRTdG9yZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyZWFrcG9pbnRTdG9yZTtcbiAgfVxuXG4gIGdldEJyaWRnZSgpOiBCcmlkZ2Uge1xuICAgIHJldHVybiB0aGlzLl9icmlkZ2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWJ1Z2dlck1vZGVsO1xuIl19