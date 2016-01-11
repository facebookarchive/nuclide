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

    this._disposables = new CompositeDisposable();
    this._dispatcher = new Dispatcher();
    this._store = new DebuggerStore(this._dispatcher);
    this._actions = new DebuggerActions(this._dispatcher, this._store);
    this._breakpointStore = new BreakpointStore(state ? state.breakpoints : null);
    this._breakpointManager = new BreakpointManager(this._breakpointStore);
    this._bridge = new Bridge(this._breakpointStore);

    this._disposables.add(this._store);
    this._disposables.add(this._actions);
    this._disposables.add(this._breakpointStore);
    this._disposables.add(this._breakpointManager);
    this._disposables.add(this._bridge);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBV0EsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6RCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNqRCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O2VBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBN0IsVUFBVSxhQUFWLFVBQVU7O0lBT1gsYUFBYTtBQVNOLFdBVFAsYUFBYSxDQVNMLEtBQXVCLEVBQUU7MEJBVGpDLGFBQWE7O0FBVWYsUUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzlFLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZFLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRWpELFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDL0MsUUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3JDOztlQXZCRyxhQUFhOztXQXlCVixtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVTLHNCQUFvQjtBQUM1QixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVPLG9CQUFrQjtBQUN4QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDcEI7OztXQUVpQiw4QkFBb0I7QUFDcEMsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztXQUVRLHFCQUFXO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBM0NHLGFBQWE7OztBQThDbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiRGVidWdnZXJNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEJyZWFrcG9pbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9CcmVha3BvaW50TWFuYWdlcicpO1xuY29uc3QgQnJlYWtwb2ludFN0b3JlID0gcmVxdWlyZSgnLi9CcmVha3BvaW50U3RvcmUnKTtcbmNvbnN0IERlYnVnZ2VyQWN0aW9ucyA9IHJlcXVpcmUoJy4vRGVidWdnZXJBY3Rpb25zJyk7XG5jb25zdCBEZWJ1Z2dlclN0b3JlID0gcmVxdWlyZSgnLi9EZWJ1Z2dlclN0b3JlJyk7XG5jb25zdCBCcmlkZ2UgPSByZXF1aXJlKCcuL0JyaWRnZScpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge0Rpc3BhdGNoZXJ9ID0gcmVxdWlyZSgnZmx1eCcpO1xuXG5pbXBvcnQgdHlwZSB7U2VyaWFsaXplZFN0YXRlfSBmcm9tICcuL21haW4nO1xuXG4vKipcbiAqIEF0b20gVmlld1Byb3ZpZGVyIGNvbXBhdGlibGUgbW9kZWwgb2JqZWN0LlxuICovXG5jbGFzcyBEZWJ1Z2dlck1vZGVsIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfYWN0aW9uczogRGVidWdnZXJBY3Rpb25zO1xuICBfYnJlYWtwb2ludE1hbmFnZXI6IEJyZWFrcG9pbnRNYW5hZ2VyO1xuICBfYnJlYWtwb2ludFN0b3JlOiBCcmVha3BvaW50U3RvcmU7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IERlYnVnZ2VyU3RvcmU7XG4gIF9icmlkZ2U6IEJyaWRnZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1NlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBEZWJ1Z2dlclN0b3JlKHRoaXMuX2Rpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgRGVidWdnZXJBY3Rpb25zKHRoaXMuX2Rpc3BhdGNoZXIsIHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9icmVha3BvaW50U3RvcmUgPSBuZXcgQnJlYWtwb2ludFN0b3JlKHN0YXRlID8gc3RhdGUuYnJlYWtwb2ludHMgOiBudWxsKTtcbiAgICB0aGlzLl9icmVha3BvaW50TWFuYWdlciA9IG5ldyBCcmVha3BvaW50TWFuYWdlcih0aGlzLl9icmVha3BvaW50U3RvcmUpO1xuICAgIHRoaXMuX2JyaWRnZSA9IG5ldyBCcmlkZ2UodGhpcy5fYnJlYWtwb2ludFN0b3JlKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9zdG9yZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2FjdGlvbnMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9icmVha3BvaW50U3RvcmUpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9icmVha3BvaW50TWFuYWdlcik7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX2JyaWRnZSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGdldEFjdGlvbnMoKTogRGVidWdnZXJBY3Rpb25zIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aW9ucztcbiAgfVxuXG4gIGdldFN0b3JlKCk6IERlYnVnZ2VyU3RvcmUge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZTtcbiAgfVxuXG4gIGdldEJyZWFrcG9pbnRTdG9yZSgpOiBCcmVha3BvaW50U3RvcmUge1xuICAgIHJldHVybiB0aGlzLl9icmVha3BvaW50U3RvcmU7XG4gIH1cblxuICBnZXRCcmlkZ2UoKTogQnJpZGdlIHtcbiAgICByZXR1cm4gdGhpcy5fYnJpZGdlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVidWdnZXJNb2RlbDtcbiJdfQ==