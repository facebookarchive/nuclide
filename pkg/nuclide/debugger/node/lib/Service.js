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
var Session = require('../VendorLib/session');

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
//# sourceMappingURL=data:application/json;base64,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RyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM1QyxDQUFDLENBQ0MsTUFBTSxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksSUFBSSxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2pDLEVBQ0QsVUFBQSxDQUFDLEVBQUk7QUFDSCxXQUFPLEVBQUUsQ0FBQztHQUNYLENBQUMsQ0FBQztDQUNOOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCBTZXNzaW9uID0gcmVxdWlyZSgnLi4vVmVuZG9yTGliL3Nlc3Npb24nKTtcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc30gZnJvbSAnLi4vLi4vdXRpbHMnO1xuXG5pbXBvcnQgdHlwZSB7bnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvLH1cbiAgICBmcm9tICcuLi8uLi9pbnRlcmZhY2VzL1NlcnZpY2UnO1xuXG5jbGFzcyBOb2RlRGVidWdnZXJQcm9jZXNzIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzIHtcbiAgX2RlYnVnUG9ydDogbnVtYmVyO1xuICBfc2VydmVyOiA/V2ViU29ja2V0U2VydmVyO1xuICBfc2Vzc2lvbkVuZENhbGxiYWNrOiA/KCkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fZGVidWdQb3J0ID0gZGVidWdQb3J0O1xuICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX3NlcnZlci5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IEFzc2lnbiByYW5kb20gcG9ydCBpbnN0ZWFkLlxuICAgIGNvbnN0IHdzUG9ydCA9IDgwODA7XG4gICAgaWYgKCF0aGlzLl9zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX3NlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IHdzUG9ydH0pO1xuICAgICAgdGhpcy5fc2VydmVyLm9uKCdjb25uZWN0aW9uJywgd2Vic29ja2V0ID0+IHtcbiAgICAgICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAgIGRlYnVnUG9ydDogdGhpcy5fZGVidWdQb3J0LFxuICAgICAgICAgIHByZWxvYWQ6IGZhbHNlLCAvLyBUaGlzIG1ha2VzIHRoZSBub2RlIGluc3BlY3RvciBub3QgbG9hZCBhbGwgdGhlIHNvdXJjZSBmaWxlcyBvbiBzdGFydHVwLlxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gbmV3IFNlc3Npb24oY29uZmlnLCB0aGlzLl9kZWJ1Z1BvcnQsIHdlYnNvY2tldCk7XG4gICAgICAgIHNlc3Npb24ub24oJ2Nsb3NlJywgdGhpcy5faGFuZGxlU2Vzc2lvbkVuZC5iaW5kKHRoaXMpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgRGVidWdTZXJ2ZXIsIGFuZCBnZXQgaXRzIHdzIHBvcnQuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShgd3M9bG9jYWxob3N0OiR7d3NQb3J0fS9gKTtcbiAgfVxuXG4gIF9oYW5kbGVTZXNzaW9uRW5kKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaygpO1xuICAgIH1cbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkVuZChjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiAobmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gbnVsbCkpO1xuICB9XG59XG5cbmNvbnN0IHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzJyk7XG5cbmNsYXNzIFByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIHBpZDogbnVtYmVyO1xuICBfY29tbWFuZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBpZDogbnVtYmVyLCBjb21tYW5kOiBzdHJpbmcpIHtcbiAgICBzdXBlcignbm9kZScpO1xuXG4gICAgdGhpcy5waWQgPSBwaWQ7XG4gICAgdGhpcy5fY29tbWFuZCA9IGNvbW1hbmQ7XG4gIH1cblxuICBhdHRhY2goKTogRGVidWdnZXJQcm9jZXNzIHtcbiAgICAvLyBFbmFibGUgZGVidWdnaW5nIGluIHRoZSBwcm9jZXNzLlxuICAgIHByb2Nlc3Mua2lsbCh0aGlzLnBpZCwgJ1NJR1VTUjEnKTtcblxuICAgIC8vIFRoaXMgaXMgdGhlIHBvcnQgdGhhdCB0aGUgVjggZGVidWdnZXIgdXN1YWxseSBsaXN0ZW5zIG9uLlxuICAgIC8vIFRPRE8obmF0dGh1KTogUHJvdmlkZSBhIHdheSB0byBvdmVycmlkZSB0aGlzIGluIHRoZSBVSS5cbiAgICBjb25zdCBkZWJ1Z1BvcnQgPSA1ODU4O1xuICAgIHJldHVybiBuZXcgTm9kZURlYnVnZ2VyUHJvY2VzcyhkZWJ1Z1BvcnQpO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IG51Y2xpZGVfZGVidWdnZXIkRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgaW52YXJpYW50KG90aGVyIGluc3RhbmNlb2YgUHJvY2Vzc0luZm8pO1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kID09PSBvdGhlci5fY29tbWFuZFxuICAgICAgICA/ICh0aGlzLnBpZCAtIG90aGVyLnBpZClcbiAgICAgICAgOiAodGhpcy5fY29tbWFuZCA8IG90aGVyLl9jb21tYW5kKSA/IC0xIDogMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCArICcoJyArIHRoaXMucGlkICsgJyknO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOlxuICAgIFByb21pc2U8QXJyYXk8bnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvPj4ge1xuICBjb25zdCB7YXN5bmNFeGVjdXRlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbiAgcmV0dXJuIGFzeW5jRXhlY3V0ZSgncHMnLCBbJy1lJywgJy1vJywgJ3BpZCxjb21tJ10sIHt9KVxuICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAvLyAkRmxvd0lzc3VlIC0tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMTQzXG4gICAgICByZXR1cm4gcmVzdWx0LnN0ZG91dC50b1N0cmluZygpLnNwbGl0KCdcXG4nKS5zbGljZSgxKS5tYXAobGluZSA9PiB7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gbGluZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICAgICAgY29uc3QgcGlkID0gTnVtYmVyKHdvcmRzWzBdKTtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IHdvcmRzLnNsaWNlKDEpLmpvaW4oJyAnKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGNvbW1hbmQuc3BsaXQoJy8nKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdub2RlJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvY2Vzc0luZm8ocGlkLCBjb21tYW5kLCBuYW1lKTtcbiAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtICE9IG51bGwpO1xuICAgIH0sXG4gICAgZSA9PiB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbm9kZScsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbn07XG4iXX0=