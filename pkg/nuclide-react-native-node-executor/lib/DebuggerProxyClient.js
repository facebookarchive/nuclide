Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
      var _this = this;

      this._emitter.on('eval_application_script', callback);
      return new _atom.Disposable(function () {
        _this._emitter.removeListener('eval_application_script', callback);
      });
    }
  }, {
    key: '_tryToConnect',
    value: function _tryToConnect() {
      var _this2 = this;

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

      var rnMessages = _rx2['default'].Observable.fromEvent(ws, 'message').map(JSON.parse);

      this._wsDisposable = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        childManager.killChild();
        _this2._children['delete'](childManager);
      }), rnMessages.subscribe(function (message) {
        if (message.$close) {
          _this2.disconnect();
          return;
        }
        childManager.handleMessage(message);
      }),
      // TODO: Add timeout
      // If we can't connect, or get disconnected, keep trying to connect.
      _rx2['default'].Observable.merge(_rx2['default'].Observable.fromEvent(ws, 'error').filter(function (err) {
        return err.code === 'ECONNREFUSED';
      }), _rx2['default'].Observable.fromEvent(ws, 'close')).subscribe(function () {
        _this2._killConnection();

        // Keep attempting to connect.
        setTimeout(_this2._tryToConnect.bind(_this2), 500);
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
//# sourceMappingURL=data:application/json;base64,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Y0FBYztPQUFBLENBQUMsRUFDL0UsZ0JBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ3JDLENBQ0UsU0FBUyxDQUFDLFlBQU07QUFDZixlQUFLLGVBQWUsRUFBRSxDQUFDOzs7QUFHdkIsa0JBQVUsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxJQUFJLFFBQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNoRCxDQUFDLEVBQ0oscUJBQWUsWUFBTTtBQUFFLFVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FDdEMsQ0FBQztLQUNIOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUMzQjtLQUNGOzs7U0FyRlUsbUJBQW1CIiwiZmlsZSI6IkRlYnVnZ2VyUHJveHlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Um5SZXF1ZXN0fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IENoaWxkTWFuYWdlciBmcm9tICcuL0NoaWxkTWFuYWdlcic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5cbmNvbnN0IEVYRUNVVE9SX1BPUlQgPSA4MDgxO1xuY29uc3QgV1NfVVJMID0gYHdzOi8vbG9jYWxob3N0OiR7RVhFQ1VUT1JfUE9SVH0vZGVidWdnZXItcHJveHk/cm9sZT1kZWJ1Z2dlciZuYW1lPU51Y2xpZGVgO1xuXG5leHBvcnQgY2xhc3MgRGVidWdnZXJQcm94eUNsaWVudCB7XG5cbiAgX2NoaWxkcmVuOiBTZXQ7XG4gIF9zaG91bGRDb25uZWN0OiBib29sZWFuO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfd3NEaXNwb3NhYmxlOiA/SURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fc2hvdWxkQ29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIH1cblxuICBjb25uZWN0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zaG91bGRDb25uZWN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Nob3VsZENvbm5lY3QgPSB0cnVlO1xuICAgIHRoaXMuX3RyeVRvQ29ubmVjdCgpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zaG91bGRDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5fa2lsbENvbm5lY3Rpb24oKTtcbiAgfVxuXG4gIG9uRGlkRXZhbEFwcGxpY2F0aW9uU2NyaXB0KGNhbGxiYWNrOiAocGlkOiBudW1iZXIpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KTogSURpc3Bvc2FibGUge1xuICAgIHRoaXMuX2VtaXR0ZXIub24oJ2V2YWxfYXBwbGljYXRpb25fc2NyaXB0JywgY2FsbGJhY2spO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIF90cnlUb0Nvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5fa2lsbENvbm5lY3Rpb24oKTtcblxuICAgIGlmICghdGhpcy5fc2hvdWxkQ29ubmVjdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldChXU19VUkwpO1xuICAgIGNvbnN0IG9uUmVwbHkgPSAocmVwbHlJRCwgcmVzdWx0KSA9PiB7IHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe3JlcGx5SUQsIHJlc3VsdH0pKTsgfTtcblxuICAgIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBEb24ndCBzaGFyZSBhbiBlbWl0dGVyOyBhZGQgQVBJIGZvciBzdWJzY3JpYmluZyB0byB3aGF0IHdlIHdhbnQgdG9cbiAgICAvLyAgIENoaWxkTWFuYWdlci5cbiAgICBjb25zdCBjaGlsZE1hbmFnZXIgPSBuZXcgQ2hpbGRNYW5hZ2VyKG9uUmVwbHksIHRoaXMuX2VtaXR0ZXIpO1xuICAgIHRoaXMuX2NoaWxkcmVuLmFkZChjaGlsZE1hbmFnZXIpO1xuXG4gICAgY29uc3Qgcm5NZXNzYWdlcyA9IChcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnbWVzc2FnZScpLm1hcChKU09OLnBhcnNlKTogUnguT2JzZXJ2YWJsZTxSblJlcXVlc3Q+XG4gICAgKTtcblxuICAgIHRoaXMuX3dzRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBjaGlsZE1hbmFnZXIua2lsbENoaWxkKCk7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuLmRlbGV0ZShjaGlsZE1hbmFnZXIpO1xuICAgICAgfSksXG4gICAgICBybk1lc3NhZ2VzLnN1YnNjcmliZShtZXNzYWdlID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuJGNsb3NlKSB7XG4gICAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkTWFuYWdlci5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgfSksXG4gICAgICAvLyBUT0RPOiBBZGQgdGltZW91dFxuICAgICAgLy8gSWYgd2UgY2FuJ3QgY29ubmVjdCwgb3IgZ2V0IGRpc2Nvbm5lY3RlZCwga2VlcCB0cnlpbmcgdG8gY29ubmVjdC5cbiAgICAgIFJ4Lk9ic2VydmFibGUubWVyZ2UoXG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnZXJyb3InKS5maWx0ZXIoZXJyID0+IGVyci5jb2RlID09PSAnRUNPTk5SRUZVU0VEJyksXG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnY2xvc2UnKSxcbiAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fa2lsbENvbm5lY3Rpb24oKTtcblxuICAgICAgICAgIC8vIEtlZXAgYXR0ZW1wdGluZyB0byBjb25uZWN0LlxuICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5fdHJ5VG9Db25uZWN0LmJpbmQodGhpcyksIDUwMCk7XG4gICAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB3cy5jbG9zZSgpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgX2tpbGxDb25uZWN0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93c0Rpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX3dzRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl93c0Rpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=