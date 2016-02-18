var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('../../atom');

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

var NodeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(NodeDebuggerInstance, _DebuggerInstance);

  function NodeDebuggerInstance(processInfo, debugPort) {
    _classCallCheck(this, NodeDebuggerInstance);

    _get(Object.getPrototypeOf(NodeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._debugPort = debugPort;
    this._server = null;
  }

  _createClass(NodeDebuggerInstance, [{
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

  return NodeDebuggerInstance;
})(_atom.DebuggerInstance);

var NodeDebuggerProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(NodeDebuggerProcessInfo, _DebuggerProcessInfo);

  function NodeDebuggerProcessInfo(pid, command, targetUri) {
    _classCallCheck(this, NodeDebuggerProcessInfo);

    _get(Object.getPrototypeOf(NodeDebuggerProcessInfo.prototype), 'constructor', this).call(this, 'node', targetUri);

    this.pid = pid;
    this._command = command;
  }

  _createClass(NodeDebuggerProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      // Enable debugging in the process.
      process.kill(this.pid, 'SIGUSR1');

      // This is the port that the V8 debugger usually listens on.
      // TODO(natthu): Provide a way to override this in the UI.
      var debugPort = 5858;
      return new NodeDebuggerInstance(this, debugPort);
    })
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof NodeDebuggerProcessInfo);
      return this._command === other._command ? this.pid - other.pid : this._command < other._command ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._command + '(' + this.pid + ')';
    }
  }]);

  return NodeDebuggerProcessInfo;
})(_atom.DebuggerProcessInfo);

function getProcessInfoList() {
  var _require2 = require('../../../commons');

  var asyncExecute = _require2.asyncExecute;

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
      // TODO(jonaldislarry): currently first dir only
      var targetUri = atom.project.getDirectories()[0].getPath();
      return new NodeDebuggerProcessInfo(pid, command, targetUri);
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
//# sourceMappingURL=data:application/json;base64,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LFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFVBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNuQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0QsYUFBTyxJQUFJLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0QsQ0FBQyxDQUNDLE1BQU0sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLElBQUksSUFBSTtLQUFBLENBQUMsQ0FBQztHQUNqQyxFQUNELFVBQUEsQ0FBQyxFQUFJO0FBQ0gsV0FBTyxFQUFFLENBQUM7R0FDWCxDQUFDLENBQUM7Q0FDTjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFFLE1BQU07QUFDWixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUMiLCJmaWxlIjoiU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuY29uc3QgU2Vzc2lvbiA9IHJlcXVpcmUoJy4uL1ZlbmRvckxpYi9ub2RlLWluc3BlY3Rvci9saWIvc2Vzc2lvbicpO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VySW5zdGFuY2UsIERlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL2F0b20nO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNsYXNzIE5vZGVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9kZWJ1Z1BvcnQ6IG51bWJlcjtcbiAgX3NlcnZlcjogP1dlYlNvY2tldFNlcnZlcjtcbiAgX3Nlc3Npb25FbmRDYWxsYmFjazogPygpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHJvY2Vzc0luZm86IERlYnVnZ2VyUHJvY2Vzc0luZm8sIGRlYnVnUG9ydDogbnVtYmVyKSB7XG4gICAgc3VwZXIocHJvY2Vzc0luZm8pO1xuICAgIHRoaXMuX2RlYnVnUG9ydCA9IGRlYnVnUG9ydDtcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBBc3NpZ24gcmFuZG9tIHBvcnQgaW5zdGVhZC5cbiAgICBjb25zdCB3c1BvcnQgPSA4MDgwO1xuICAgIGlmICghdGhpcy5fc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiB3c1BvcnR9KTtcbiAgICAgIHRoaXMuX3NlcnZlci5vbignY29ubmVjdGlvbicsIHdlYnNvY2tldCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgICAgICAgICBkZWJ1Z1BvcnQ6IHRoaXMuX2RlYnVnUG9ydCxcbiAgICAgICAgICBwcmVsb2FkOiBmYWxzZSwgLy8gVGhpcyBtYWtlcyB0aGUgbm9kZSBpbnNwZWN0b3Igbm90IGxvYWQgYWxsIHRoZSBzb3VyY2UgZmlsZXMgb24gc3RhcnR1cC5cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IG5ldyBTZXNzaW9uKGNvbmZpZywgdGhpcy5fZGVidWdQb3J0LCB3ZWJzb2NrZXQpO1xuICAgICAgICBzZXNzaW9uLm9uKCdjbG9zZScsIHRoaXMuX2hhbmRsZVNlc3Npb25FbmQuYmluZCh0aGlzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIERlYnVnU2VydmVyLCBhbmQgZ2V0IGl0cyB3cyBwb3J0LlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYHdzPWxvY2FsaG9zdDoke3dzUG9ydH0vYCk7XG4gIH1cblxuICBfaGFuZGxlU2Vzc2lvbkVuZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKSB7XG4gICAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2soKTtcbiAgICB9XG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiBEaXNwb3NhYmxlIHtcbiAgICB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjayA9IG51bGwpKTtcbiAgfVxufVxuXG5jbGFzcyBOb2RlRGVidWdnZXJQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBwaWQ6IG51bWJlcjtcbiAgX2NvbW1hbmQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwaWQ6IG51bWJlciwgY29tbWFuZDogc3RyaW5nLCB0YXJnZXRVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICBzdXBlcignbm9kZScsIHRhcmdldFVyaSk7XG5cbiAgICB0aGlzLnBpZCA9IHBpZDtcbiAgICB0aGlzLl9jb21tYW5kID0gY29tbWFuZDtcbiAgfVxuXG4gIGFzeW5jIGRlYnVnKCk6IFByb21pc2U8RGVidWdnZXJJbnN0YW5jZT4ge1xuICAgIC8vIEVuYWJsZSBkZWJ1Z2dpbmcgaW4gdGhlIHByb2Nlc3MuXG4gICAgcHJvY2Vzcy5raWxsKHRoaXMucGlkLCAnU0lHVVNSMScpO1xuXG4gICAgLy8gVGhpcyBpcyB0aGUgcG9ydCB0aGF0IHRoZSBWOCBkZWJ1Z2dlciB1c3VhbGx5IGxpc3RlbnMgb24uXG4gICAgLy8gVE9ETyhuYXR0aHUpOiBQcm92aWRlIGEgd2F5IHRvIG92ZXJyaWRlIHRoaXMgaW4gdGhlIFVJLlxuICAgIGNvbnN0IGRlYnVnUG9ydCA9IDU4NTg7XG4gICAgcmV0dXJuIG5ldyBOb2RlRGVidWdnZXJJbnN0YW5jZSh0aGlzLCBkZWJ1Z1BvcnQpO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIE5vZGVEZWJ1Z2dlclByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCA9PT0gb3RoZXIuX2NvbW1hbmRcbiAgICAgICAgPyAodGhpcy5waWQgLSBvdGhlci5waWQpXG4gICAgICAgIDogKHRoaXMuX2NvbW1hbmQgPCBvdGhlci5fY29tbWFuZCkgPyAtMSA6IDE7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQgKyAnKCcgKyB0aGlzLnBpZCArICcpJztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxEZWJ1Z2dlclByb2Nlc3NJbmZvPj4ge1xuICBjb25zdCB7YXN5bmNFeGVjdXRlfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NvbW1vbnMnKTtcbiAgcmV0dXJuIGFzeW5jRXhlY3V0ZSgncHMnLCBbJy1lJywgJy1vJywgJ3BpZCxjb21tJ10sIHt9KVxuICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAvLyAkRmxvd0lzc3VlIC0tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMTQzXG4gICAgICByZXR1cm4gcmVzdWx0LnN0ZG91dC50b1N0cmluZygpLnNwbGl0KCdcXG4nKS5zbGljZSgxKS5tYXAobGluZSA9PiB7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gbGluZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICAgICAgY29uc3QgcGlkID0gTnVtYmVyKHdvcmRzWzBdKTtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IHdvcmRzLnNsaWNlKDEpLmpvaW4oJyAnKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGNvbW1hbmQuc3BsaXQoJy8nKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdub2RlJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8oam9uYWxkaXNsYXJyeSk6IGN1cnJlbnRseSBmaXJzdCBkaXIgb25seVxuICAgICAgICBjb25zdCB0YXJnZXRVcmkgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5nZXRQYXRoKCk7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8ocGlkLCBjb21tYW5kLCB0YXJnZXRVcmkpO1xuICAgICAgfSlcbiAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0gIT0gbnVsbCk7XG4gICAgfSxcbiAgICBlID0+IHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdub2RlJyxcbiAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxufTtcbiJdfQ==