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
      }), _rx2['default'].Observable.fromEvent(ws, 'close').subscribe(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUHJveHlDbGllbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVd5QixnQkFBZ0I7Ozs7b0JBQ0ssTUFBTTs7c0JBQ3pCLFFBQVE7O2tCQUNwQixJQUFJOzs7O2tCQUNHLElBQUk7Ozs7QUFFMUIsSUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzNCLElBQU0sTUFBTSx1QkFBcUIsYUFBYSwrQ0FBNEMsQ0FBQzs7SUFFOUUsbUJBQW1CO0FBT25CLFdBUEEsbUJBQW1CLEdBT2hCOzBCQVBILG1CQUFtQjs7QUFRNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsMEJBQWtCLENBQUM7R0FDcEM7O2VBWFUsbUJBQW1COztXQWF2QixtQkFBUztBQUNkLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdEI7OztXQUVTLHNCQUFTO0FBQ2pCLFVBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN4Qjs7O1dBRXlCLG9DQUFDLFFBQStDLEVBQWU7OztBQUN2RixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN0RCxhQUFPLHFCQUFlLFlBQU07QUFDMUIsY0FBSyxRQUFRLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ25FLENBQUMsQ0FBQztLQUNKOzs7V0FFWSx5QkFBUzs7O0FBQ3BCLFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFdkIsVUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDeEIsZUFBTztPQUNSOztBQUVELFVBQU0sRUFBRSxHQUFHLG9CQUFjLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLFVBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFBRSxVQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxPQUFPLEVBQVAsT0FBTyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDLENBQUM7T0FBRSxDQUFDOzs7O0FBSXJGLFVBQU0sWUFBWSxHQUFHLDhCQUFpQixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlELFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUVqQyxVQUFJLENBQUMsYUFBYSxHQUFHLDhCQUNuQixxQkFBZSxZQUFNO0FBQ25CLG9CQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekIsZUFBSyxTQUFTLFVBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUNyQyxDQUFDLEVBQ0YsZ0JBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQ25DLFNBQVMsQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUN2QixZQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUNsQixpQkFBSyxVQUFVLEVBQUUsQ0FBQztBQUNsQixpQkFBTztTQUNSO0FBQ0Qsb0JBQVksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDckMsQ0FBQyxFQUNKLGdCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQ25ELGVBQUssZUFBZSxFQUFFLENBQUM7OztBQUd2QixrQkFBVSxDQUFDLE9BQUssYUFBYSxDQUFDLElBQUksUUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO09BQ2hELENBQUMsRUFDRixxQkFBZSxZQUFNO0FBQUUsVUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQUUsQ0FBQyxDQUN0QyxDQUFDO0tBQ0g7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFlBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO09BQzNCO0tBQ0Y7OztTQTdFVSxtQkFBbUIiLCJmaWxlIjoiRGVidWdnZXJQcm94eUNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBDaGlsZE1hbmFnZXIgZnJvbSAnLi9DaGlsZE1hbmFnZXInO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSAnd3MnO1xuXG5jb25zdCBFWEVDVVRPUl9QT1JUID0gODA4MTtcbmNvbnN0IFdTX1VSTCA9IGB3czovL2xvY2FsaG9zdDoke0VYRUNVVE9SX1BPUlR9L2RlYnVnZ2VyLXByb3h5P3JvbGU9ZGVidWdnZXImbmFtZT1OdWNsaWRlYDtcblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUHJveHlDbGllbnQge1xuXG4gIF9jaGlsZHJlbjogU2V0O1xuICBfc2hvdWxkQ29ubmVjdDogYm9vbGVhbjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX3dzRGlzcG9zYWJsZTogP0lEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NoaWxkcmVuID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3Nob3VsZENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICB9XG5cbiAgY29ubmVjdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2hvdWxkQ29ubmVjdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zaG91bGRDb25uZWN0ID0gdHJ1ZTtcbiAgICB0aGlzLl90cnlUb0Nvbm5lY3QoKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKTogdm9pZCB7XG4gICAgdGhpcy5fc2hvdWxkQ29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG4gIH1cblxuICBvbkRpZEV2YWxBcHBsaWNhdGlvblNjcmlwdChjYWxsYmFjazogKHBpZDogbnVtYmVyKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPik6IElEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9lbWl0dGVyLm9uKCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICBfdHJ5VG9Db25uZWN0KCk6IHZvaWQge1xuICAgIHRoaXMuX2tpbGxDb25uZWN0aW9uKCk7XG5cbiAgICBpZiAoIXRoaXMuX3Nob3VsZENvbm5lY3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQoV1NfVVJMKTtcbiAgICBjb25zdCBvblJlcGx5ID0gKHJlcGx5SUQsIHJlc3VsdCkgPT4geyB3cy5zZW5kKEpTT04uc3RyaW5naWZ5KHtyZXBseUlELCByZXN1bHR9KSk7IH07XG5cbiAgICAvLyBUT0RPKG1hdHRoZXd3aXRoYW5tKTogRG9uJ3Qgc2hhcmUgYW4gZW1pdHRlcjsgYWRkIEFQSSBmb3Igc3Vic2NyaWJpbmcgdG8gd2hhdCB3ZSB3YW50IHRvXG4gICAgLy8gICBDaGlsZE1hbmFnZXIuXG4gICAgY29uc3QgY2hpbGRNYW5hZ2VyID0gbmV3IENoaWxkTWFuYWdlcihvblJlcGx5LCB0aGlzLl9lbWl0dGVyKTtcbiAgICB0aGlzLl9jaGlsZHJlbi5hZGQoY2hpbGRNYW5hZ2VyKTtcblxuICAgIHRoaXMuX3dzRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBjaGlsZE1hbmFnZXIua2lsbENoaWxkKCk7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuLmRlbGV0ZShjaGlsZE1hbmFnZXIpO1xuICAgICAgfSksXG4gICAgICBSeC5PYnNlcnZhYmxlLmZyb21FdmVudCh3cywgJ21lc3NhZ2UnKVxuICAgICAgICAuc3Vic2NyaWJlKHJhd01lc3NhZ2UgPT4ge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKHJhd01lc3NhZ2UpO1xuICAgICAgICAgIGlmIChtZXNzYWdlLiRjbG9zZSkge1xuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNoaWxkTWFuYWdlci5oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICB9KSxcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHdzLCAnY2xvc2UnKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICB0aGlzLl9raWxsQ29ubmVjdGlvbigpO1xuXG4gICAgICAgIC8vIEtlZXAgYXR0ZW1wdGluZyB0byBjb25uZWN0LlxuICAgICAgICBzZXRUaW1lb3V0KHRoaXMuX3RyeVRvQ29ubmVjdC5iaW5kKHRoaXMpLCA1MDApO1xuICAgICAgfSksXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHdzLmNsb3NlKCk7IH0pLFxuICAgICk7XG4gIH1cblxuICBfa2lsbENvbm5lY3Rpb24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3dzRGlzcG9zYWJsZSkge1xuICAgICAgdGhpcy5fd3NEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3dzRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==