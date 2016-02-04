var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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
    key: 'attach',
    value: function attach() {
      // Enable debugging in the process.
      process.kill(this.pid, 'SIGUSR1');

      // This is the port that the V8 debugger usually listens on.
      // TODO(natthu): Provide a way to override this in the UI.
      var debugPort = 5858;
      return new NodeDebuggerInstance(this, debugPort);
    }
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
//# sourceMappingURL=data:application/json;base64,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QUFNLElBQUksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdELGFBQU8sSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzdELENBQUMsQ0FDQyxNQUFNLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxJQUFJLElBQUk7S0FBQSxDQUFDLENBQUM7R0FDakMsRUFDRCxVQUFBLENBQUMsRUFBSTtBQUNILFdBQU8sRUFBRSxDQUFDO0dBQ1gsQ0FBQyxDQUFDO0NBQ047O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBRSxNQUFNO0FBQ1osb0JBQWtCLEVBQWxCLGtCQUFrQjtDQUNuQixDQUFDIiwiZmlsZSI6IlNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXIgPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcbmNvbnN0IFNlc3Npb24gPSByZXF1aXJlKCcuLi9WZW5kb3JMaWIvbm9kZS1pbnNwZWN0b3IvbGliL3Nlc3Npb24nKTtcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlLCBEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9hdG9tJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuXG5jbGFzcyBOb2RlRGVidWdnZXJJbnN0YW5jZSBleHRlbmRzIERlYnVnZ2VySW5zdGFuY2Uge1xuICBfZGVidWdQb3J0OiBudW1iZXI7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9kZWJ1Z1BvcnQgPSBkZWJ1Z1BvcnQ7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgY29uc3Qgd3NQb3J0ID0gODA4MDtcbiAgICBpZiAoIXRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJzb2NrZXQgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgZGVidWdQb3J0OiB0aGlzLl9kZWJ1Z1BvcnQsXG4gICAgICAgICAgcHJlbG9hZDogZmFsc2UsIC8vIFRoaXMgbWFrZXMgdGhlIG5vZGUgaW5zcGVjdG9yIG5vdCBsb2FkIGFsbCB0aGUgc291cmNlIGZpbGVzIG9uIHN0YXJ0dXAuXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSBuZXcgU2Vzc2lvbihjb25maWcsIHRoaXMuX2RlYnVnUG9ydCwgd2Vic29ja2V0KTtcbiAgICAgICAgc2Vzc2lvbi5vbignY2xvc2UnLCB0aGlzLl9oYW5kbGVTZXNzaW9uRW5kLmJpbmQodGhpcykpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBEZWJ1Z1NlcnZlciwgYW5kIGdldCBpdHMgd3MgcG9ydC5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGB3cz1sb2NhbGhvc3Q6JHt3c1BvcnR9L2ApO1xuICB9XG5cbiAgX2hhbmRsZVNlc3Npb25FbmQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb25FbmRDYWxsYmFjaykge1xuICAgICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrKCk7XG4gICAgfVxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgdGhpcy5fc2Vzc2lvbkVuZENhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiB0aGlzLl9zZXNzaW9uRW5kQ2FsbGJhY2sgPSBudWxsKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgcGlkOiBudW1iZXI7XG4gIF9jb21tYW5kOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGlkOiBudW1iZXIsIGNvbW1hbmQ6IHN0cmluZywgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgc3VwZXIoJ25vZGUnLCB0YXJnZXRVcmkpO1xuXG4gICAgdGhpcy5waWQgPSBwaWQ7XG4gICAgdGhpcy5fY29tbWFuZCA9IGNvbW1hbmQ7XG4gIH1cblxuICBhdHRhY2goKTogRGVidWdnZXJJbnN0YW5jZSB7XG4gICAgLy8gRW5hYmxlIGRlYnVnZ2luZyBpbiB0aGUgcHJvY2Vzcy5cbiAgICBwcm9jZXNzLmtpbGwodGhpcy5waWQsICdTSUdVU1IxJyk7XG5cbiAgICAvLyBUaGlzIGlzIHRoZSBwb3J0IHRoYXQgdGhlIFY4IGRlYnVnZ2VyIHVzdWFsbHkgbGlzdGVucyBvbi5cbiAgICAvLyBUT0RPKG5hdHRodSk6IFByb3ZpZGUgYSB3YXkgdG8gb3ZlcnJpZGUgdGhpcyBpbiB0aGUgVUkuXG4gICAgY29uc3QgZGVidWdQb3J0ID0gNTg1ODtcbiAgICByZXR1cm4gbmV3IE5vZGVEZWJ1Z2dlckluc3RhbmNlKHRoaXMsIGRlYnVnUG9ydCk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgaW52YXJpYW50KG90aGVyIGluc3RhbmNlb2YgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8pO1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kID09PSBvdGhlci5fY29tbWFuZFxuICAgICAgICA/ICh0aGlzLnBpZCAtIG90aGVyLnBpZClcbiAgICAgICAgOiAodGhpcy5fY29tbWFuZCA8IG90aGVyLl9jb21tYW5kKSA/IC0xIDogMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCArICcoJyArIHRoaXMucGlkICsgJyknO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuICByZXR1cm4gYXN5bmNFeGVjdXRlKCdwcycsIFsnLWUnLCAnLW8nLCAncGlkLGNvbW0nXSwge30pXG4gICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgIC8vICRGbG93SXNzdWUgLS0gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzExNDNcbiAgICAgIHJldHVybiByZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpLnNsaWNlKDEpLm1hcChsaW5lID0+IHtcbiAgICAgICAgY29uc3Qgd29yZHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgICAgICBjb25zdCBwaWQgPSBOdW1iZXIod29yZHNbMF0pO1xuICAgICAgICBjb25zdCBjb21tYW5kID0gd29yZHMuc2xpY2UoMSkuam9pbignICcpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gY29tbWFuZC5zcGxpdCgnLycpO1xuICAgICAgICBjb25zdCBuYW1lID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobmFtZSAhPT0gJ25vZGUnKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyhqb25hbGRpc2xhcnJ5KTogY3VycmVudGx5IGZpcnN0IGRpciBvbmx5XG4gICAgICAgIGNvbnN0IHRhcmdldFVyaSA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLmdldFBhdGgoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBOb2RlRGVidWdnZXJQcm9jZXNzSW5mbyhwaWQsIGNvbW1hbmQsIHRhcmdldFVyaSk7XG4gICAgICB9KVxuICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPSBudWxsKTtcbiAgICB9LFxuICAgIGUgPT4ge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbmFtZTogJ25vZGUnLFxuICBnZXRQcm9jZXNzSW5mb0xpc3QsXG59O1xuIl19