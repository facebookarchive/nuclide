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

var _nuclideCommons = require('../../nuclide-commons');

var _ChildManager = require('./ChildManager');

var _ChildManager2 = _interopRequireDefault(_ChildManager);

var _atom = require('atom');

var _events = require('events');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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

      var rnMessages = _reactivexRxjs2['default'].Observable.fromEvent(ws, 'message').map(JSON.parse);

      this._wsDisposable = new _atom.CompositeDisposable(new _atom.Disposable(function () {
        childManager.killChild();
        _this2._children['delete'](childManager);
      }), new _nuclideCommons.DisposableSubscription(rnMessages.subscribe(function (message) {
        if (message.$close) {
          _this2.disconnect();
          return;
        }
        childManager.handleMessage(message);
      })),
      // TODO: Add timeout
      // If we can't connect, or get disconnected, keep trying to connect.
      new _nuclideCommons.DisposableSubscription(_reactivexRxjs2['default'].Observable.merge(_reactivexRxjs2['default'].Observable.fromEvent(ws, 'error').filter(function (err) {
        return err.code === 'ECONNREFUSED';
      }), _reactivexRxjs2['default'].Observable.fromEvent(ws, 'close')).subscribe(function () {
        _this2._killConnection();

        // Keep attempting to connect.
        setTimeout(_this2._tryToConnect.bind(_this2), 500);
      })), new _atom.Disposable(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJveHlDbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhCQWFxQyx1QkFBdUI7OzRCQUNuQyxnQkFBZ0I7Ozs7b0JBQ0ssTUFBTTs7c0JBQ3pCLFFBQVE7OzZCQUNwQixpQkFBaUI7Ozs7a0JBQ1YsSUFBSTs7OztBQUUxQixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDM0IsSUFBTSxNQUFNLHVCQUFxQixhQUFhLCtDQUE0QyxDQUFDOztJQUU5RSxtQkFBbUI7QUFPbkIsV0FQQSxtQkFBbUIsR0FPaEI7MEJBUEgsbUJBQW1COztBQVE1QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRywwQkFBa0IsQ0FBQztHQUNwQzs7ZUFYVSxtQkFBbUI7O1dBYXZCLG1CQUFTO0FBQ2QsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN0Qjs7O1dBRVMsc0JBQVM7QUFDakIsVUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDNUIsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3hCOzs7V0FFeUIsb0NBQUMsUUFBK0MsRUFBZTs7O0FBQ3ZGLFVBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RELGFBQU8scUJBQWUsWUFBTTtBQUMxQixjQUFLLFFBQVEsQ0FBQyxjQUFjLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDbkUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVZLHlCQUFTOzs7QUFDcEIsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUV2QixVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixlQUFPO09BQ1I7O0FBRUQsVUFBTSxFQUFFLEdBQUcsb0JBQWMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksT0FBTyxFQUFFLE1BQU0sRUFBSztBQUFFLFVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLE9BQU8sRUFBUCxPQUFPLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUMsQ0FBQztPQUFFLENBQUM7Ozs7QUFJckYsVUFBTSxZQUFZLEdBQUcsOEJBQWlCLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUQsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWpDLFVBQU0sVUFBVSxHQUNkLDJCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEFBQ3ZELENBQUM7O0FBRUYsVUFBSSxDQUFDLGFBQWEsR0FBRyw4QkFDbkIscUJBQWUsWUFBTTtBQUNuQixvQkFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pCLGVBQUssU0FBUyxVQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7T0FDckMsQ0FBQyxFQUNGLDJDQUNFLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDOUIsWUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ2xCLGlCQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLGlCQUFPO1NBQ1I7QUFDRCxvQkFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNyQyxDQUFDLENBQ0g7OztBQUdELGlEQUNFLDJCQUFHLFVBQVUsQ0FBQyxLQUFLLENBQ2pCLDJCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUc7ZUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGNBQWM7T0FBQSxDQUFDLEVBQy9FLDJCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUNyQyxDQUNFLFNBQVMsQ0FBQyxZQUFNO0FBQ2YsZUFBSyxlQUFlLEVBQUUsQ0FBQzs7O0FBR3ZCLGtCQUFVLENBQUMsT0FBSyxhQUFhLENBQUMsSUFBSSxRQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDaEQsQ0FBQyxDQUNMLEVBQ0QscUJBQWUsWUFBTTtBQUFFLFVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FDdEMsQ0FBQztLQUNIOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUMzQjtLQUNGOzs7U0F6RlUsbUJBQW1CIiwiZmlsZSI6IkRlYnVnZ2VyUHJveHlDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Um5SZXF1ZXN0fSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IENoaWxkTWFuYWdlciBmcm9tICcuL0NoaWxkTWFuYWdlcic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSAnd3MnO1xuXG5jb25zdCBFWEVDVVRPUl9QT1JUID0gODA4MTtcbmNvbnN0IFdTX1VSTCA9IGB3czovL2xvY2FsaG9zdDoke0VYRUNVVE9SX1BPUlR9L2RlYnVnZ2VyLXByb3h5P3JvbGU9ZGVidWdnZXImbmFtZT1OdWNsaWRlYDtcblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUHJveHlDbGllbnQge1xuXG4gIF9jaGlsZHJlbjogU2V0O1xuICBfc2hvdWxkQ29ubmVjdDogYm9vbGVhbjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3dzRGlzcG9zYWJsZTogP0lEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NoaWxkcmVuID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3Nob3VsZENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cbiAgY29ubmVjdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkQ29ubmVjdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zaG91bGRDb25uZWN0ID0gdHJ1ZTtcbiAgICB0aGlzLl90cnlUb0Nvbm5lY3QoKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5fc2hvdWxkQ29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG4gIH1cblxuICBvbkRpZEV2YWxBcHBsaWNhdGlvblNjcmlwdChjYWxsYmFjazogKHBpZDogbnVtYmVyKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPik6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBfdHJ5VG9Db25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuX3Nob3VsZENvbm5lY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQoV1NfVVJMKTtcbiAgICBjb25zdCBvblJlcGx5ID0gKHJlcGx5SUQsIHJlc3VsdCkgPT4geyB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtyZXBseUlELCByZXN1bHR9KSk7IH07XG5cbiAgICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogRG9uJ3Qgc2hhcmUgYW4gZW1pdHRlcjsgYWRkIEFQSSBmb3Igc3Vic2NyaWJpbmcgdG8gd2hhdCB3ZSB3YW50IHRvXG4gICAgLy8gICBDaGlsZE1hbmFnZXIuXG4gICAgY29uc3QgY2hpbGRNYW5hZ2VyID0gbmV3IENoaWxkTWFuYWdlcihvblJlcGx5LCB0aGlzLl9lbWl0dGVyKTtcbiAgICB0aGlzLl9jaGlsZHJlbi5hZGQoY2hpbGRNYW5hZ2VyKTtcblxuICAgIGNvbnN0IHJuTWVzc2FnZXMgPSAoXG4gICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudCh3cywgJ21lc3NhZ2UnKS5tYXAoSlNPTi5wYXJzZSk6IFJ4Lk9ic2VydmFibGU8Um5SZXF1ZXN0PlxuICAgICk7XG5cbiAgICB0aGlzLl93c0Rpc3Bvc2FibGUgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgY2hpbGRNYW5hZ2VyLmtpbGxDaGlsZCgpO1xuICAgICAgICB0aGlzLl9jaGlsZHJlbi5kZWxldGUoY2hpbGRNYW5hZ2VyKTtcbiAgICAgIH0pLFxuICAgICAgbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICAgIHJuTWVzc2FnZXMuc3Vic2NyaWJlKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgIGlmIChtZXNzYWdlLiRjbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkTWFuYWdlci5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIC8vIFRPRE86IEFkZCB0aW1lb3V0XG4gICAgICAvLyBJZiB3ZSBjYW4ndCBjb25uZWN0LCBvciBnZXQgZGlzY29ubmVjdGVkLCBrZWVwIHRyeWluZyB0byBjb25uZWN0LlxuICAgICAgbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24oXG4gICAgICAgIFJ4Lk9ic2VydmFibGUubWVyZ2UoXG4gICAgICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQod3MsICdlcnJvcicpLmZpbHRlcihlcnIgPT4gZXJyLmNvZGUgPT09ICdFQ09OTlJFRlVTRUQnKSxcbiAgICAgICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudCh3cywgJ2Nsb3NlJyksXG4gICAgICAgIClcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG5cbiAgICAgICAgICAgIC8vIEtlZXAgYXR0ZW1wdGluZyB0byBjb25uZWN0LlxuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLl90cnlUb0Nvbm5lY3QuYmluZCh0aGlzKSwgNTAwKTtcbiAgICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgd3MuY2xvc2UoKTsgfSksXG4gICAgKTtcbiAgfVxuXG4gIF9raWxsQ29ubmVjdGlvbigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd3NEaXNwb3NhYmxlKSB7XG4gICAgICB0aGlzLl93c0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fd3NEaXNwb3NhYmxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxufVxuIl19