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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3FDQVdvQyx5QkFBeUI7Ozs7OztBQUM3RCxJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3JELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ2pELElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7ZUFDTCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztnQkFDTCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QixVQUFVLGFBQVYsVUFBVTs7SUFPWCxhQUFhO0FBVU4sV0FWUCxhQUFhLENBVUwsS0FBdUIsRUFBRTswQkFWakMsYUFBYTs7QUFXZixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFDcEMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEQsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuRSxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxlQUFlLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDOUUsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDdkUsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsc0JBQXNCLEdBQUcsaURBQTBCLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUV6RixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksbUJBQW1CLENBQ3pDLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQyxrQkFBa0IsRUFDdkIsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLENBQUMsc0JBQXNCLENBQzVCLENBQUM7R0FDSDs7ZUEzQkcsYUFBYTs7V0E2QlYsbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFUyxzQkFBb0I7QUFDNUIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0tBQ3RCOzs7V0FFTyxvQkFBa0I7QUFDeEIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7V0FFdUIsb0NBQTBCO0FBQ2hELGFBQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDO0tBQ3BDOzs7V0FFaUIsOEJBQW9CO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7V0FFUSxxQkFBVztBQUNsQixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztTQW5ERyxhQUFhOzs7QUFzRG5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkRlYnVnZ2VyTW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0RlYnVnZ2VyUHJvdmlkZXJTdG9yZX0gZnJvbSAnLi9EZWJ1Z2dlclByb3ZpZGVyU3RvcmUnO1xuY29uc3QgQnJlYWtwb2ludE1hbmFnZXIgPSByZXF1aXJlKCcuL0JyZWFrcG9pbnRNYW5hZ2VyJyk7XG5jb25zdCBCcmVha3BvaW50U3RvcmUgPSByZXF1aXJlKCcuL0JyZWFrcG9pbnRTdG9yZScpO1xuY29uc3QgRGVidWdnZXJBY3Rpb25zID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckFjdGlvbnMnKTtcbmNvbnN0IERlYnVnZ2VyU3RvcmUgPSByZXF1aXJlKCcuL0RlYnVnZ2VyU3RvcmUnKTtcbmNvbnN0IEJyaWRnZSA9IHJlcXVpcmUoJy4vQnJpZGdlJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RGlzcGF0Y2hlcn0gPSByZXF1aXJlKCdmbHV4Jyk7XG5cbmltcG9ydCB0eXBlIHtTZXJpYWxpemVkU3RhdGV9IGZyb20gJy4uJztcblxuLyoqXG4gKiBBdG9tIFZpZXdQcm92aWRlciBjb21wYXRpYmxlIG1vZGVsIG9iamVjdC5cbiAqL1xuY2xhc3MgRGVidWdnZXJNb2RlbCB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2FjdGlvbnM6IERlYnVnZ2VyQWN0aW9ucztcbiAgX2JyZWFrcG9pbnRNYW5hZ2VyOiBCcmVha3BvaW50TWFuYWdlcjtcbiAgX2JyZWFrcG9pbnRTdG9yZTogQnJlYWtwb2ludFN0b3JlO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBEZWJ1Z2dlclN0b3JlO1xuICBfZGVidWdnZXJQcm92aWRlclN0b3JlOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIF9icmlkZ2U6IEJyaWRnZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIHRoaXMuX3N0b3JlID0gbmV3IERlYnVnZ2VyU3RvcmUodGhpcy5fZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5fYWN0aW9ucyA9IG5ldyBEZWJ1Z2dlckFjdGlvbnModGhpcy5fZGlzcGF0Y2hlciwgdGhpcy5fc3RvcmUpO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSA9IG5ldyBCcmVha3BvaW50U3RvcmUoc3RhdGUgPyBzdGF0ZS5icmVha3BvaW50cyA6IG51bGwpO1xuICAgIHRoaXMuX2JyZWFrcG9pbnRNYW5hZ2VyID0gbmV3IEJyZWFrcG9pbnRNYW5hZ2VyKHRoaXMuX2JyZWFrcG9pbnRTdG9yZSk7XG4gICAgdGhpcy5fYnJpZGdlID0gbmV3IEJyaWRnZSh0aGlzKTtcbiAgICB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVyU3RvcmUgPSBuZXcgRGVidWdnZXJQcm92aWRlclN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuX2FjdGlvbnMpO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX3N0b3JlLFxuICAgICAgdGhpcy5fYWN0aW9ucyxcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRTdG9yZSxcbiAgICAgIHRoaXMuX2JyZWFrcG9pbnRNYW5hZ2VyLFxuICAgICAgdGhpcy5fYnJpZGdlLFxuICAgICAgdGhpcy5fZGVidWdnZXJQcm92aWRlclN0b3JlLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGdldEFjdGlvbnMoKTogRGVidWdnZXJBY3Rpb25zIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aW9ucztcbiAgfVxuXG4gIGdldFN0b3JlKCk6IERlYnVnZ2VyU3RvcmUge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZTtcbiAgfVxuXG4gIGdldERlYnVnZ2VyUHJvdmlkZXJTdG9yZSgpOiBEZWJ1Z2dlclByb3ZpZGVyU3RvcmUge1xuICAgIHJldHVybiB0aGlzLl9kZWJ1Z2dlclByb3ZpZGVyU3RvcmU7XG4gIH1cblxuICBnZXRCcmVha3BvaW50U3RvcmUoKTogQnJlYWtwb2ludFN0b3JlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJlYWtwb2ludFN0b3JlO1xuICB9XG5cbiAgZ2V0QnJpZGdlKCk6IEJyaWRnZSB7XG4gICAgcmV0dXJuIHRoaXMuX2JyaWRnZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IERlYnVnZ2VyTW9kZWw7XG4iXX0=