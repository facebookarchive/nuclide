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

      this._wsDisposable = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        childManager.killChild();
        _this2._children['delete'](childManager);
      }), _rx2['default'].Observable.fromEvent(ws, 'message').subscribe(function (rawMessage) {
        var message = JSON.parse(rawMessage);
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
//# sourceMappingURL=data:application/json;base64,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RUFDL0UsZ0JBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ3JDLENBQ0UsU0FBUyxDQUFDLFlBQU07QUFDZixlQUFLLGVBQWUsRUFBRSxDQUFDOzs7QUFHdkIsa0JBQVUsQ0FBQyxPQUFLLGFBQWEsQ0FBQyxJQUFJLFFBQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNoRCxDQUFDLEVBQ0oscUJBQWUsWUFBTTtBQUFFLFVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FDdEMsQ0FBQztLQUNIOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUMzQjtLQUNGOzs7U0FuRlUsbUJBQW1CIiwiZmlsZSI6IkRlYnVnZ2VyUHJveHlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQ2hpbGRNYW5hZ2VyIGZyb20gJy4vQ2hpbGRNYW5hZ2VyJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5pbXBvcnQgV2ViU29ja2V0IGZyb20gJ3dzJztcblxuY29uc3QgRVhFQ1VUT1JfUE9SVCA9IDgwODE7XG5jb25zdCBXU19VUkwgPSBgd3M6Ly9sb2NhbGhvc3Q6JHtFWEVDVVRPUl9QT1JUfS9kZWJ1Z2dlci1wcm94eT9yb2xlPWRlYnVnZ2VyJm5hbWU9TnVjbGlkZWA7XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlclByb3h5Q2xpZW50IHtcblxuICBfY2hpbGRyZW46IFNldDtcbiAgX3Nob3VsZENvbm5lY3Q6IGJvb2xlYW47XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF93c0Rpc3Bvc2FibGU6ID9JRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jaGlsZHJlbiA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9zaG91bGRDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgfVxuXG4gIGNvbm5lY3QoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZENvbm5lY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2hvdWxkQ29ubmVjdCA9IHRydWU7XG4gICAgdGhpcy5fdHJ5VG9Db25uZWN0KCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX3Nob3VsZENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLl9raWxsQ29ubmVjdGlvbigpO1xuICB9XG5cbiAgb25EaWRFdmFsQXBwbGljYXRpb25TY3JpcHQoY2FsbGJhY2s6IChwaWQ6IG51bWJlcikgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4pOiBJRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fZW1pdHRlci5vbignZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2V2YWxfYXBwbGljYXRpb25fc2NyaXB0JywgY2FsbGJhY2spO1xuICAgIH0pO1xuICB9XG5cbiAgX3RyeVRvQ29ubmVjdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9raWxsQ29ubmVjdGlvbigpO1xuXG4gICAgaWYgKCF0aGlzLl9zaG91bGRDb25uZWN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgd3MgPSBuZXcgV2ViU29ja2V0KFdTX1VSTCk7XG4gICAgY29uc3Qgb25SZXBseSA9IChyZXBseUlELCByZXN1bHQpID0+IHsgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7cmVwbHlJRCwgcmVzdWx0fSkpOyB9O1xuXG4gICAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IERvbid0IHNoYXJlIGFuIGVtaXR0ZXI7IGFkZCBBUEkgZm9yIHN1YnNjcmliaW5nIHRvIHdoYXQgd2Ugd2FudCB0b1xuICAgIC8vICAgQ2hpbGRNYW5hZ2VyLlxuICAgIGNvbnN0IGNoaWxkTWFuYWdlciA9IG5ldyBDaGlsZE1hbmFnZXIob25SZXBseSwgdGhpcy5fZW1pdHRlcik7XG4gICAgdGhpcy5fY2hpbGRyZW4uYWRkKGNoaWxkTWFuYWdlcik7XG5cbiAgICB0aGlzLl93c0Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgY2hpbGRNYW5hZ2VyLmtpbGxDaGlsZCgpO1xuICAgICAgICB0aGlzLl9jaGlsZHJlbi5kZWxldGUoY2hpbGRNYW5hZ2VyKTtcbiAgICAgIH0pLFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQod3MsICdtZXNzYWdlJylcbiAgICAgICAgLnN1YnNjcmliZShyYXdNZXNzYWdlID0+IHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShyYXdNZXNzYWdlKTtcbiAgICAgICAgICBpZiAobWVzc2FnZS4kY2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaGlsZE1hbmFnZXIuaGFuZGxlTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgfSksXG4gICAgICAvLyBUT0RPOiBBZGQgdGltZW91dFxuICAgICAgLy8gSWYgd2UgY2FuJ3QgY29ubmVjdCwgb3IgZ2V0IGRpc2Nvbm5lY3RlZCwga2VlcCB0cnlpbmcgdG8gY29ubmVjdC5cbiAgICAgIFJ4Lk9ic2VydmFibGUubWVyZ2UoXG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnZXJyb3InKS5maWx0ZXIoZXJyID0+IGVyci5jb2RlID09PSAnRUNPTk5SRUZVU0VEJyksXG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnY2xvc2UnKSxcbiAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fa2lsbENvbm5lY3Rpb24oKTtcblxuICAgICAgICAgIC8vIEtlZXAgYXR0ZW1wdGluZyB0byBjb25uZWN0LlxuICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5fdHJ5VG9Db25uZWN0LmJpbmQodGhpcyksIDUwMCk7XG4gICAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB3cy5jbG9zZSgpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgX2tpbGxDb25uZWN0aW9uKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl93c0Rpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMuX3dzRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl93c0Rpc3Bvc2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=