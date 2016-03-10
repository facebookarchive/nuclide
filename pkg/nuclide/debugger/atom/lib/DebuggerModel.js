var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Atom ViewProvider compatible model object.
 */
var BreakpointManager = require('./BreakpointManager');
var BreakpointStore = require('./BreakpointStore');
var DebuggerActions = require('./DebuggerActions');
var DebuggerStore = require('./DebuggerStore');
var Bridge = require('./Bridge');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('flux');

var Dispatcher = _require2.Dispatcher;

var DebuggerModel = (function () {
  function DebuggerModel(state) {
    _classCallCheck(this, DebuggerModel);

    this._dispatcher = new Dispatcher();
    this._store = new DebuggerStore(this._dispatcher);
    this._actions = new DebuggerActions(this._dispatcher, this._store);
    this._breakpointStore = new BreakpointStore(state ? state.breakpoints : null);
    this._breakpointManager = new BreakpointManager(this._breakpointStore);
    this._bridge = new Bridge(this._breakpointStore);

    this._disposables = new CompositeDisposable(this._store, this._actions, this._breakpointStore, this._breakpointManager, this._bridge);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O2VBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxhQUFWLFVBQVU7O0lBT1gsYUFBYTtBQVNOLFdBVFAsYUFBYSxDQVNMLEtBQXVCLEVBQUU7MEJBVGpDLGFBQWE7O0FBVWYsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzlFLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZFLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRWpELFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsQ0FDekMsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLGtCQUFrQixFQUN2QixJQUFJLENBQUMsT0FBTyxDQUNiLENBQUM7R0FDSDs7ZUF4QkcsYUFBYTs7V0EwQlYsbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFUyxzQkFBb0I7QUFDNUIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7V0FFTyxvQkFBa0I7QUFDeEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7V0FFaUIsOEJBQW9CO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7V0FFUSxxQkFBVztBQUNsQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztTQTVDRyxhQUFhOzs7QUErQ25CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyTW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBCcmVha3BvaW50TWFuYWdlciA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludE1hbmFnZXInKTtcbmNvbnN0IEJyZWFrcG9pbnRTdG9yZSA9IHJlcXVpcmUoJy4vQnJlYWtwb2ludFN0b3JlJyk7XG5jb25zdCBEZWJ1Z2dlckFjdGlvbnMgPSByZXF1aXJlKCcuL0RlYnVnZ2VyQWN0aW9ucycpO1xuY29uc3QgRGVidWdnZXJTdG9yZSA9IHJlcXVpcmUoJy4vRGVidWdnZXJTdG9yZScpO1xuY29uc3QgQnJpZGdlID0gcmVxdWlyZSgnLi9CcmlkZ2UnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtEaXNwYXRjaGVyfSA9IHJlcXVpcmUoJ2ZsdXgnKTtcblxuaW1wb3J0IHR5cGUge1NlcmlhbGl6ZWRTdGF0ZX0gZnJvbSAnLi9tYWluJztcblxuLyoqXG4gKiBBdG9tIFZpZXdQcm92aWRlciBjb21wYXRpYmxlIG1vZGVsIG9iamVjdC5cbiAqL1xuY2xhc3MgRGVidWdnZXJNb2RlbCB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGlvbnM6IERlYnVnZ2VyQWN0aW9ucztcbiAgX2JyZWFrcG9pbnRNYW5hZ2VyOiBCcmVha3BvaW50TWFuYWdlcjtcbiAgX2JyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlO1xuICBfYnJpZGdlOiBCcmlkZ2U7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9TZXJpYWxpemVkU3RhdGUpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBEZWJ1Z2dlclN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgRGVidWdnZXJBY3Rpb25zKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKHN0YXRlID8gc3RhdGUuYnJlYWtwb2ludHMgOiBudWxsKTtcbiAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlciA9IG5ldyBCcmVha3BvaW50TWFuYWdlcih0aGlzLl9icmVha3BvaW50U3RvcmUpO1xuICAgIHRoaXMuX2JyaWRnZSA9IG5ldyBCcmlkZ2UodGhpcy5fYnJlYWtwb2ludFN0b3JlKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLl9zdG9yZSxcbiAgICAgIHRoaXMuX2FjdGlvbnMsXG4gICAgICB0aGlzLl9icmVha3BvaW50U3RvcmUsXG4gICAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlcixcbiAgICAgIHRoaXMuX2JyaWRnZSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBnZXRBY3Rpb25zKCk6IERlYnVnZ2VyQWN0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGlvbnM7XG4gIH1cblxuICBnZXRTdG9yZSgpOiBEZWJ1Z2dlclN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmU7XG4gIH1cblxuICBnZXRCcmVha3BvaW50U3RvcmUoKTogQnJlYWtwb2ludFN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlO1xuICB9XG5cbiAgZ2V0QnJpZGdlKCk6IEJyaWRnZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyaWRnZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyTW9kZWw7XG4iXX0=