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

var _ChildManager = require('./ChildManager');

var _ChildManager2 = _interopRequireDefault(_ChildManager);

var _atom = require('atom');

var _events = require('events');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var EXECUTOR_PORT = 8081;
var WS_URL = 'ws://localhost:' + EXECUTOR_PORT + '/debugger-proxy?role=debugger&name=Nuclide';

var DebuggerProxyClient = (function () {
  function DebuggerProxyClient() {
    _classCallCheck(this, DebuggerProxyClient);

    this._children = new Set();
    this._shouldConnect = false;
    this._emitter = new _events.EventEmitter();
  }

  _createClass(DebuggerProxyClient, [{
    key: 'connect',
    value: function connect() {
      if (this._shouldConnect) {
        return;
      }
      this._shouldConnect = true;
      this._tryToConnect();
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._shouldConnect = false;
      this._killConnection();
    }
  }, {
    key: 'onDidEvalApplicationScript',
    value: function onDidEvalApplicationScript(callback) {
      this._emitter.on('eval_application_script', callback);
    }
  }, {
    key: '_tryToConnect',
    value: function _tryToConnect() {
      var _this = this;

      this._killConnection();

      if (!this._shouldConnect) {
        return;
      }

      var ws = new _ws2['default'](WS_URL);
      var onReply = function onReply(replyID, result) {
        ws.send(JSON.stringify({ replyID: replyID, result: result }));
      };

      // TODO(matthewwithanm): Don't share an emitter; add API for subscribing to what we want to
      //   ChildManager.
      var childManager = new _ChildManager2['default'](onReply, this._emitter);
      this._children.add(childManager);

      this._wsDisposable = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        childManager.killChild();
        _this._children['delete'](childManager);
      }), _rx2['default'].Observable.fromEvent(ws, 'message').subscribe(function (rawMessage) {
        var message = JSON.parse(rawMessage);
        if (message.$close) {
          _this.disconnect();
          return;
        }
        childManager.handleMessage(message);
      }), _rx2['default'].Observable.fromEvent(ws, 'close').subscribe(function () {
        _this._killConnection();

        // Keep attempting to connect.
        setTimeout(_this._tryToConnect.bind(_this), 500);
      }), new _atom.Disposable(function () {
        ws.close();
      }));
    }
  }, {
    key: '_killConnection',
    value: function _killConnection() {
      if (this._wsDisposable) {
        this._wsDisposable.dispose();
        this._wsDisposable = null;
      }
    }
  }]);

  return DebuggerProxyClient;
})();

exports.DebuggerProxyClient = DebuggerProxyClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJveHlDbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVd5QixnQkFBZ0I7Ozs7b0JBQ0ssTUFBTTs7c0JBQ3pCLFFBQVE7O2tCQUNwQixJQUFJOzs7O2tCQUNHLElBQUk7Ozs7QUFFMUIsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzNCLElBQU0sTUFBTSx1QkFBcUIsYUFBYSwrQ0FBNEMsQ0FBQzs7SUFFOUUsbUJBQW1CO0FBT25CLFdBUEEsbUJBQW1CLEdBT2hCOzBCQVBILG1CQUFtQjs7QUFRNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWtCLENBQUM7R0FDcEM7O2VBWFUsbUJBQW1COztXQWF2QixtQkFBUztBQUNkLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdEI7OztXQUVTLHNCQUFTO0FBQ2pCLFVBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN4Qjs7O1dBRXlCLG9DQUFDLFFBQStDLEVBQUU7QUFDMUUsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDdkQ7OztXQUVZLHlCQUFTOzs7QUFDcEIsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUV2QixVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixlQUFPO09BQ1I7O0FBRUQsVUFBTSxFQUFFLEdBQUcsb0JBQWMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksT0FBTyxFQUFFLE1BQU0sRUFBSztBQUFFLFVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUMsQ0FBQztPQUFFLENBQUM7Ozs7QUFJckYsVUFBTSxZQUFZLEdBQUcsOEJBQWlCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWpDLFVBQUksQ0FBQyxhQUFhLEdBQUcsOEJBQ25CLHFCQUFlLFlBQU07QUFDbkIsb0JBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QixjQUFLLFNBQVMsVUFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ3JDLENBQUMsRUFDRixnQkFBRyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FDbkMsU0FBUyxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ3ZCLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsWUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ2xCLGdCQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLGlCQUFPO1NBQ1I7QUFDRCxvQkFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNyQyxDQUFDLEVBQ0osZ0JBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQU07QUFDbkQsY0FBSyxlQUFlLEVBQUUsQ0FBQzs7O0FBR3ZCLGtCQUFVLENBQUMsTUFBSyxhQUFhLENBQUMsSUFBSSxPQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDaEQsQ0FBQyxFQUNGLHFCQUFlLFlBQU07QUFBRSxVQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7T0FBRSxDQUFDLENBQ3RDLENBQUM7S0FDSDs7O1dBRWMsMkJBQVM7QUFDdEIsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7T0FDM0I7S0FDRjs7O1NBMUVVLG1CQUFtQiIsImZpbGUiOiJEZWJ1Z2dlclByb3h5Q2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IENoaWxkTWFuYWdlciBmcm9tICcuL0NoaWxkTWFuYWdlcic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5cbmNvbnN0IEVYRUNVVE9SX1BPUlQgPSA4MDgxO1xuY29uc3QgV1NfVVJMID0gYHdzOi8vbG9jYWxob3N0OiR7RVhFQ1VUT1JfUE9SVH0vZGVidWdnZXItcHJveHk/cm9sZT1kZWJ1Z2dlciZuYW1lPU51Y2xpZGVgO1xuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJQcm94eUNsaWVudCB7XG5cbiAgX2NoaWxkcmVuOiBTZXQ7XG4gIF9zaG91bGRDb25uZWN0OiBib29sZWFuO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfd3NEaXNwb3NhYmxlOiA/SURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fc2hvdWxkQ29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIH1cblxuICBjb25uZWN0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zaG91bGRDb25uZWN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Nob3VsZENvbm5lY3QgPSB0cnVlO1xuICAgIHRoaXMuX3RyeVRvQ29ubmVjdCgpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zaG91bGRDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5fa2lsbENvbm5lY3Rpb24oKTtcbiAgfVxuXG4gIG9uRGlkRXZhbEFwcGxpY2F0aW9uU2NyaXB0KGNhbGxiYWNrOiAocGlkOiBudW1iZXIpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KSB7XG4gICAgdGhpcy5fZW1pdHRlci5vbignZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBfdHJ5VG9Db25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuX3Nob3VsZENvbm5lY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQoV1NfVVJMKTtcbiAgICBjb25zdCBvblJlcGx5ID0gKHJlcGx5SUQsIHJlc3VsdCkgPT4geyB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtyZXBseUlELCByZXN1bHR9KSk7IH07XG5cbiAgICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogRG9uJ3Qgc2hhcmUgYW4gZW1pdHRlcjsgYWRkIEFQSSBmb3Igc3Vic2NyaWJpbmcgdG8gd2hhdCB3ZSB3YW50IHRvXG4gICAgLy8gICBDaGlsZE1hbmFnZXIuXG4gICAgY29uc3QgY2hpbGRNYW5hZ2VyID0gbmV3IENoaWxkTWFuYWdlcihvblJlcGx5LCB0aGlzLl9lbWl0dGVyKTtcbiAgICB0aGlzLl9jaGlsZHJlbi5hZGQoY2hpbGRNYW5hZ2VyKTtcblxuICAgIHRoaXMuX3dzRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBjaGlsZE1hbmFnZXIua2lsbENoaWxkKCk7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuLmRlbGV0ZShjaGlsZE1hbmFnZXIpO1xuICAgICAgfSksXG4gICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudCh3cywgJ21lc3NhZ2UnKVxuICAgICAgICAuc3Vic2NyaWJlKHJhd01lc3NhZ2UgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKHJhd01lc3NhZ2UpO1xuICAgICAgICAgIGlmIChtZXNzYWdlLiRjbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkTWFuYWdlci5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KSxcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnY2xvc2UnKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9raWxsQ29ubmVjdGlvbigpO1xuXG4gICAgICAgIC8vIEtlZXAgYXR0ZW1wdGluZyB0byBjb25uZWN0LlxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMuX3RyeVRvQ29ubmVjdC5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHdzLmNsb3NlKCk7IH0pLFxuICAgICk7XG4gIH1cblxuICBfa2lsbENvbm5lY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dzRGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy5fd3NEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3dzRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==