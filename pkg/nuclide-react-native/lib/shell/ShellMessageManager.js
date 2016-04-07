Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var EXECUTOR_PORT = 8081;
var WS_URL = 'ws://localhost:' + EXECUTOR_PORT + '/message?role=interface&name=Nuclide';

var ShellMessageManager = (function () {
  function ShellMessageManager() {
    _classCallCheck(this, ShellMessageManager);

    this._url = WS_URL;
  }

  _createClass(ShellMessageManager, [{
    key: 'send',
    value: function send(message) {
      var _this = this;

      if (this._ws == null) {
        (function () {
          // Currently, use cases only require a simple fire-and-forget interaction
          var ws = new _ws2['default'](_this._url);
          _this._ws = ws;
          ws.onopen = function () {
            ws.send(JSON.stringify(message));
            ws.close();
          };
          ws.onerror = function () {
            atom.notifications.addWarning('Error connecting to React Native shell.');
          };
          ws.onclose = function () {
            _this._ws = null;
          };
        })();
      }
    }
  }]);

  return ShellMessageManager;
})();

exports.ShellMessageManager = ShellMessageManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoZWxsTWVzc2FnZU1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQVdzQixJQUFJOzs7O0FBRTFCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUMzQixJQUFNLE1BQU0sdUJBQXFCLGFBQWEseUNBQXNDLENBQUM7O0lBRXhFLG1CQUFtQjtBQUluQixXQUpBLG1CQUFtQixHQUloQjswQkFKSCxtQkFBbUI7O0FBSzVCLFFBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0dBQ3BCOztlQU5VLG1CQUFtQjs7V0FRMUIsY0FBQyxPQUFlLEVBQVE7OztBQUMxQixVQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFOzs7QUFFcEIsY0FBTSxFQUFFLEdBQUcsb0JBQWMsTUFBSyxJQUFJLENBQUMsQ0FBQztBQUNwQyxnQkFBSyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2QsWUFBRSxDQUFDLE1BQU0sR0FBRyxZQUFNO0FBQ2hCLGNBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLGNBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztXQUNaLENBQUM7QUFDRixZQUFFLENBQUMsT0FBTyxHQUFHLFlBQU07QUFDakIsZ0JBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7V0FDMUUsQ0FBQztBQUNGLFlBQUUsQ0FBQyxPQUFPLEdBQUcsWUFBTTtBQUNqQixrQkFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDO1dBQ2pCLENBQUM7O09BQ0g7S0FDRjs7O1NBeEJVLG1CQUFtQiIsImZpbGUiOiJTaGVsbE1lc3NhZ2VNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5cbmNvbnN0IEVYRUNVVE9SX1BPUlQgPSA4MDgxO1xuY29uc3QgV1NfVVJMID0gYHdzOi8vbG9jYWxob3N0OiR7RVhFQ1VUT1JfUE9SVH0vbWVzc2FnZT9yb2xlPWludGVyZmFjZSZuYW1lPU51Y2xpZGVgO1xuXG5leHBvcnQgY2xhc3MgU2hlbGxNZXNzYWdlTWFuYWdlciB7XG4gIF91cmw6IHN0cmluZztcbiAgX3dzOiBXZWJTb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fdXJsID0gV1NfVVJMO1xuICB9XG5cbiAgc2VuZChtZXNzYWdlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd3MgPT0gbnVsbCkge1xuICAgICAgLy8gQ3VycmVudGx5LCB1c2UgY2FzZXMgb25seSByZXF1aXJlIGEgc2ltcGxlIGZpcmUtYW5kLWZvcmdldCBpbnRlcmFjdGlvblxuICAgICAgY29uc3Qgd3MgPSBuZXcgV2ViU29ja2V0KHRoaXMuX3VybCk7XG4gICAgICB0aGlzLl93cyA9IHdzO1xuICAgICAgd3Mub25vcGVuID0gKCkgPT4ge1xuICAgICAgICB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpKTtcbiAgICAgICAgd3MuY2xvc2UoKTtcbiAgICAgIH07XG4gICAgICB3cy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnRXJyb3IgY29ubmVjdGluZyB0byBSZWFjdCBOYXRpdmUgc2hlbGwuJyk7XG4gICAgICB9O1xuICAgICAgd3Mub25jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fd3MgPSBudWxsO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxufVxuIl19