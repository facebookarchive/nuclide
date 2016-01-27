var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _utils = require('../../utils');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Disposable = _require.Disposable;

var WebSocketServer = require('ws').Server;
var Session = require('../VendorLib/node-inspector/lib/session');

var NodeDebuggerProcess = (function (_DebuggerProcess) {
  _inherits(NodeDebuggerProcess, _DebuggerProcess);

  function NodeDebuggerProcess(debugPort) {
    _classCallCheck(this, NodeDebuggerProcess);

    _get(Object.getPrototypeOf(NodeDebuggerProcess.prototype), 'constructor', this).call(this);
    this._debugPort = debugPort;
    this._server = null;
  }

  _createClass(NodeDebuggerProcess, [{
    key: 'dispose',
    value: function dispose() {
      if (this._server) {
        this._server.close();
      }
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      var _this = this;

      // TODO(natthu): Assign random port instead.
      var wsPort = 8080;
      if (!this._server) {
        this._server = new WebSocketServer({ port: wsPort });
        this._server.on('connection', function (websocket) {
          var config = {
            debugPort: _this._debugPort,
            preload: false };
          // This makes the node inspector not load all the source files on startup.
          var session = new Session(config, _this._debugPort, websocket);
          session.on('close', _this._handleSessionEnd.bind(_this));
        });
      }
      // create an instance of DebugServer, and get its ws port.
      return Promise.resolve('ws=localhost:' + wsPort + '/');
    }
  }, {
    key: '_handleSessionEnd',
    value: function _handleSessionEnd() {
      if (this._sessionEndCallback) {
        this._sessionEndCallback();
      }
      this.dispose();
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      var _this2 = this;

      this._sessionEndCallback = callback;
      return new Disposable(function () {
        return _this2._sessionEndCallback = null;
      });
    }
  }]);

  return NodeDebuggerProcess;
})(_utils.DebuggerProcess);

var _require2 = require('../../utils');

var DebuggerProcessInfo = _require2.DebuggerProcessInfo;

var ProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ProcessInfo, _DebuggerProcessInfo);

  function ProcessInfo(pid, command) {
    _classCallCheck(this, ProcessInfo);

    _get(Object.getPrototypeOf(ProcessInfo.prototype), 'constructor', this).call(this, 'node');

    this.pid = pid;
    this._command = command;
  }

  _createClass(ProcessInfo, [{
    key: 'attach',
    value: function attach() {
      // Enable debugging in the process.
      process.kill(this.pid, 'SIGUSR1');

      // This is the port that the V8 debugger usually listens on.
      // TODO(natthu): Provide a way to override this in the UI.
      var debugPort = 5858;
      return new NodeDebuggerProcess(debugPort);
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof ProcessInfo);
      return this._command === other._command ? this.pid - other.pid : this._command < other._command ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._command + '(' + this.pid + ')';
    }
  }]);

  return ProcessInfo;
})(DebuggerProcessInfo);

function getProcessInfoList() {
  var _require3 = require('../../../commons');

  var asyncExecute = _require3.asyncExecute;

  return asyncExecute('ps', ['-e', '-o', 'pid,comm'], {}).then(function (result) {
    // $FlowIssue -- https://github.com/facebook/flow/issues/1143
    return result.stdout.toString().split('\n').slice(1).map(function (line) {
      var words = line.trim().split(' ');
      var pid = Number(words[0]);
      var command = words.slice(1).join(' ');
      var components = command.split('/');
      var name = components[components.length - 1];
      if (name !== 'node') {
        return null;
      }
      return new ProcessInfo(pid, command, name);
    }).filter(function (item) {
      return item != null;
    });
  }, function (e) {
    return [];
  });
}

module.exports = {
  name: 'node',
  getProcessInfoList: getProcessInfoList
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFlc0IsUUFBUTs7OztxQkFFQSxhQUFhOzs7Ozs7Ozs7O2VBTnRCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUNqQixJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzdDLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDOztJQVM3RCxtQkFBbUI7WUFBbkIsbUJBQW1COztBQUtaLFdBTFAsbUJBQW1CLENBS1gsU0FBaUIsRUFBRTswQkFMM0IsbUJBQW1COztBQU1yQiwrQkFORSxtQkFBbUIsNkNBTWI7QUFDUixRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztHQUNyQjs7ZUFURyxtQkFBbUI7O1dBV2hCLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDdEI7S0FDRjs7O1dBRWtCLCtCQUFvQjs7OztBQUVyQyxVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDcEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDakIsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQ25ELFlBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxVQUFBLFNBQVMsRUFBSTtBQUN6QyxjQUFNLE1BQU0sR0FBRztBQUNiLHFCQUFTLEVBQUUsTUFBSyxVQUFVO0FBQzFCLG1CQUFPLEVBQUUsS0FBSyxFQUNmLENBQUM7O0FBQ0YsY0FBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQUssVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2hFLGlCQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFLLGlCQUFpQixDQUFDLElBQUksT0FBTSxDQUFDLENBQUM7U0FDeEQsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBTyxPQUFPLENBQUMsT0FBTyxtQkFBaUIsTUFBTSxPQUFJLENBQUM7S0FDbkQ7OztXQUVnQiw2QkFBUztBQUN4QixVQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUM1QixZQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztPQUM1QjtBQUNELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRVcsc0JBQUMsUUFBb0IsRUFBYzs7O0FBQzdDLFVBQUksQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLENBQUM7QUFDcEMsYUFBUSxJQUFJLFVBQVUsQ0FBQztlQUFNLE9BQUssbUJBQW1CLEdBQUcsSUFBSTtPQUFBLENBQUMsQ0FBRTtLQUNoRTs7O1NBN0NHLG1CQUFtQjs7O2dCQWdESyxPQUFPLENBQUMsYUFBYSxDQUFDOztJQUE3QyxtQkFBbUIsYUFBbkIsbUJBQW1COztJQUVwQixXQUFXO1lBQVgsV0FBVzs7QUFJSixXQUpQLFdBQVcsQ0FJSCxHQUFXLEVBQUUsT0FBZSxFQUFFOzBCQUp0QyxXQUFXOztBQUtiLCtCQUxFLFdBQVcsNkNBS1AsTUFBTSxFQUFFOztBQUVkLFFBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7R0FDekI7O2VBVEcsV0FBVzs7V0FXVCxrQkFBb0I7O0FBRXhCLGFBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQzs7OztBQUlsQyxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdkIsYUFBTyxJQUFJLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzNDOzs7V0FFYSx3QkFBQyxLQUEyQyxFQUFVO0FBQ2xFLCtCQUFVLEtBQUssWUFBWSxXQUFXLENBQUMsQ0FBQztBQUN4QyxhQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxDQUFDLFFBQVEsR0FDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUNyQixBQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakQ7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7S0FDN0M7OztTQTlCRyxXQUFXO0dBQVMsbUJBQW1COztBQWlDN0MsU0FBUyxrQkFBa0IsR0FDOEI7a0JBQ2hDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQzs7TUFBM0MsWUFBWSxhQUFaLFlBQVk7O0FBQ25CLFNBQU8sWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3BELElBQUksQ0FBQyxVQUFBLE1BQU0sRUFBSTs7QUFFZCxXQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDL0QsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxVQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsVUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekMsVUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxVQUFNLElBQUksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1QyxDQUFDLENBQ0MsTUFBTSxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksSUFBSSxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2pDLEVBQ0QsVUFBQSxDQUFDLEVBQUk7QUFDSCxXQUFPLEVBQUUsQ0FBQztHQUNYLENBQUMsQ0FBQztDQUNOOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCBTZXNzaW9uID0gcmVxdWlyZSgnLi4vVmVuZG9yTGliL25vZGUtaW5zcGVjdG9yL2xpYi9zZXNzaW9uJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtEZWJ1Z2dlclByb2Nlc3N9IGZyb20gJy4uLy4uL3V0aWxzJztcblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyx9XG4gICAgZnJvbSAnLi4vLi4vaW50ZXJmYWNlcy9zZXJ2aWNlJztcblxuY2xhc3MgTm9kZURlYnVnZ2VyUHJvY2VzcyBleHRlbmRzIERlYnVnZ2VyUHJvY2VzcyB7XG4gIF9kZWJ1Z1BvcnQ6IG51bWJlcjtcbiAgX3NlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX3Nlc3Npb25FbmRDYWxsYmFjazogPygpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoZGVidWdQb3J0OiBudW1iZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2RlYnVnUG9ydCA9IGRlYnVnUG9ydDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBBc3NpZ24gcmFuZG9tIHBvcnQgaW5zdGVhZC5cbiAgICBjb25zdCB3c1BvcnQgPSA4MDgwO1xuICAgIGlmICghdGhpcy5fc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiB3c1BvcnR9KTtcbiAgICAgIHRoaXMuX3NlcnZlci5vbignY29ubmVjdGlvbicsIHdlYnNvY2tldCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgICBkZWJ1Z1BvcnQ6IHRoaXMuX2RlYnVnUG9ydCxcbiAgICAgICAgICBwcmVsb2FkOiBmYWxzZSwgLy8gVGhpcyBtYWtlcyB0aGUgbm9kZSBpbnNwZWN0b3Igbm90IGxvYWQgYWxsIHRoZSBzb3VyY2UgZmlsZXMgb24gc3RhcnR1cC5cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IG5ldyBTZXNzaW9uKGNvbmZpZywgdGhpcy5fZGVidWdQb3J0LCB3ZWJzb2NrZXQpO1xuICAgICAgICBzZXNzaW9uLm9uKCdjbG9zZScsIHRoaXMuX2hhbmRsZVNlc3Npb25FbmQuYmluZCh0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIERlYnVnU2VydmVyLCBhbmQgZ2V0IGl0cyB3cyBwb3J0LlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYHdzPWxvY2FsaG9zdDoke3dzUG9ydH0vYCk7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGwpKTtcbiAgfVxufVxuXG5jb25zdCB7RGVidWdnZXJQcm9jZXNzSW5mb30gPSByZXF1aXJlKCcuLi8uLi91dGlscycpO1xuXG5jbGFzcyBQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBwaWQ6IG51bWJlcjtcbiAgX2NvbW1hbmQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwaWQ6IG51bWJlciwgY29tbWFuZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoJ25vZGUnKTtcblxuICAgIHRoaXMucGlkID0gcGlkO1xuICAgIHRoaXMuX2NvbW1hbmQgPSBjb21tYW5kO1xuICB9XG5cbiAgYXR0YWNoKCk6IERlYnVnZ2VyUHJvY2VzcyB7XG4gICAgLy8gRW5hYmxlIGRlYnVnZ2luZyBpbiB0aGUgcHJvY2Vzcy5cbiAgICBwcm9jZXNzLmtpbGwodGhpcy5waWQsICdTSUdVU1IxJyk7XG5cbiAgICAvLyBUaGlzIGlzIHRoZSBwb3J0IHRoYXQgdGhlIFY4IGRlYnVnZ2VyIHVzdWFsbHkgbGlzdGVucyBvbi5cbiAgICAvLyBUT0RPKG5hdHRodSk6IFByb3ZpZGUgYSB3YXkgdG8gb3ZlcnJpZGUgdGhpcyBpbiB0aGUgVUkuXG4gICAgY29uc3QgZGVidWdQb3J0ID0gNTg1ODtcbiAgICByZXR1cm4gbmV3IE5vZGVEZWJ1Z2dlclByb2Nlc3MoZGVidWdQb3J0KTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIFByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCA9PT0gb3RoZXIuX2NvbW1hbmRcbiAgICAgICAgPyAodGhpcy5waWQgLSBvdGhlci5waWQpXG4gICAgICAgIDogKHRoaXMuX2NvbW1hbmQgPCBvdGhlci5fY29tbWFuZCkgPyAtMSA6IDE7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQgKyAnKCcgKyB0aGlzLnBpZCArICcpJztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTpcbiAgICBQcm9taXNlPEFycmF5PG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbz4+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJyk7XG4gIHJldHVybiBhc3luY0V4ZWN1dGUoJ3BzJywgWyctZScsICctbycsICdwaWQsY29tbSddLCB7fSlcbiAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgLy8gJEZsb3dJc3N1ZSAtLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTE0M1xuICAgICAgcmV0dXJuIHJlc3VsdC5zdGRvdXQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSkubWFwKGxpbmUgPT4ge1xuICAgICAgICBjb25zdCB3b3JkcyA9IGxpbmUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICAgIGNvbnN0IHBpZCA9IE51bWJlcih3b3Jkc1swXSk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB3b3Jkcy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBjb21tYW5kLnNwbGl0KCcvJyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChuYW1lICE9PSAnbm9kZScpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb2Nlc3NJbmZvKHBpZCwgY29tbWFuZCwgbmFtZSk7XG4gICAgICB9KVxuICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPSBudWxsKTtcbiAgICB9LFxuICAgIGUgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbmFtZTogJ25vZGUnLFxuICBnZXRQcm9jZXNzSW5mb0xpc3QsXG59O1xuIl19