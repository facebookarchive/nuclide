var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

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

var NodeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(NodeDebuggerInstance, _DebuggerInstance);

  function NodeDebuggerInstance(processInfo, debugPort) {
    var _this = this;

    _classCallCheck(this, NodeDebuggerInstance);

    _get(Object.getPrototypeOf(NodeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._debugPort = debugPort;
    this._server = null;
    this._close$ = new _rx2['default'].Subject();
    this._close$.first().subscribe(function () {
      _this.dispose();
    });
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
      var _this2 = this;

      // TODO(natthu): Assign random port instead.
      var wsPort = 8080;
      if (!this._server) {
        this._server = new WebSocketServer({ port: wsPort });
        this._server.on('connection', function (websocket) {
          var config = {
            debugPort: _this2._debugPort,
            preload: false };
          // This makes the node inspector not load all the source files on startup.

          var _require2 = require('./Session');

          var Session = _require2.Session;

          var session = new Session(config, _this2._debugPort, websocket);
          _rx2['default'].Observable.fromEvent(session, 'close').subscribe(_this2._close$);
        });
      }
      // create an instance of DebugServer, and get its ws port.
      return Promise.resolve('ws=localhost:' + wsPort + '/');
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      return this._close$.first().subscribe(callback);
    }
  }]);

  return NodeDebuggerInstance;
})(_nuclideDebuggerAtom.DebuggerInstance);

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
})(_nuclideDebuggerAtom.DebuggerProcessInfo);

function getProcessInfoList() {
  var _require3 = require('../../nuclide-commons');

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
  getProcessInfoList: getProcessInfoList,
  NodeDebuggerInstance: NodeDebuggerInstance
};
//# sourceMappingURL=data:application/json;base64,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QUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsVUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0MsVUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3RCxhQUFPLElBQUksdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3RCxDQUFDLENBQ0MsTUFBTSxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksSUFBSSxJQUFJO0tBQUEsQ0FBQyxDQUFDO0dBQ2pDLEVBQ0QsVUFBQSxDQUFDLEVBQUk7QUFDSCxXQUFPLEVBQUUsQ0FBQztHQUNYLENBQUMsQ0FBQztDQUNOOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7QUFDbEIsc0JBQW9CLEVBQXBCLG9CQUFvQjtDQUNyQixDQUFDIiwiZmlsZSI6IlNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBXZWJTb2NrZXRTZXJ2ZXIgPSByZXF1aXJlKCd3cycpLlNlcnZlcjtcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtEZWJ1Z2dlckluc3RhbmNlLCBEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmNsYXNzIE5vZGVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9jbG9zZSQ6IFJ4LlN1YmplY3Q8bWl4ZWQ+O1xuICBfZGVidWdQb3J0OiBudW1iZXI7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9kZWJ1Z1BvcnQgPSBkZWJ1Z1BvcnQ7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLl9jbG9zZSQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX2Nsb3NlJC5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZGlzcG9zZSgpOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgY29uc3Qgd3NQb3J0ID0gODA4MDtcbiAgICBpZiAoIXRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJzb2NrZXQgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgZGVidWdQb3J0OiB0aGlzLl9kZWJ1Z1BvcnQsXG4gICAgICAgICAgcHJlbG9hZDogZmFsc2UsIC8vIFRoaXMgbWFrZXMgdGhlIG5vZGUgaW5zcGVjdG9yIG5vdCBsb2FkIGFsbCB0aGUgc291cmNlIGZpbGVzIG9uIHN0YXJ0dXAuXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHtTZXNzaW9ufSA9IHJlcXVpcmUoJy4vU2Vzc2lvbicpO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gbmV3IFNlc3Npb24oY29uZmlnLCB0aGlzLl9kZWJ1Z1BvcnQsIHdlYnNvY2tldCk7XG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHNlc3Npb24sICdjbG9zZScpLnN1YnNjcmliZSh0aGlzLl9jbG9zZSQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBEZWJ1Z1NlcnZlciwgYW5kIGdldCBpdHMgd3MgcG9ydC5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGB3cz1sb2NhbGhvc3Q6JHt3c1BvcnR9L2ApO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jbG9zZSQuZmlyc3QoKS5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICB9XG59XG5cbmNsYXNzIE5vZGVEZWJ1Z2dlclByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIHBpZDogbnVtYmVyO1xuICBfY29tbWFuZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHBpZDogbnVtYmVyLCBjb21tYW5kOiBzdHJpbmcsIHRhcmdldFVyaTogTnVjbGlkZVVyaSkge1xuICAgIHN1cGVyKCdub2RlJywgdGFyZ2V0VXJpKTtcblxuICAgIHRoaXMucGlkID0gcGlkO1xuICAgIHRoaXMuX2NvbW1hbmQgPSBjb21tYW5kO1xuICB9XG5cbiAgYXN5bmMgZGVidWcoKTogUHJvbWlzZTxEZWJ1Z2dlckluc3RhbmNlPiB7XG4gICAgLy8gRW5hYmxlIGRlYnVnZ2luZyBpbiB0aGUgcHJvY2Vzcy5cbiAgICBwcm9jZXNzLmtpbGwodGhpcy5waWQsICdTSUdVU1IxJyk7XG5cbiAgICAvLyBUaGlzIGlzIHRoZSBwb3J0IHRoYXQgdGhlIFY4IGRlYnVnZ2VyIHVzdWFsbHkgbGlzdGVucyBvbi5cbiAgICAvLyBUT0RPKG5hdHRodSk6IFByb3ZpZGUgYSB3YXkgdG8gb3ZlcnJpZGUgdGhpcyBpbiB0aGUgVUkuXG4gICAgY29uc3QgZGVidWdQb3J0ID0gNTg1ODtcbiAgICByZXR1cm4gbmV3IE5vZGVEZWJ1Z2dlckluc3RhbmNlKHRoaXMsIGRlYnVnUG9ydCk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogRGVidWdnZXJQcm9jZXNzSW5mbyk6IG51bWJlciB7XG4gICAgaW52YXJpYW50KG90aGVyIGluc3RhbmNlb2YgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8pO1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kID09PSBvdGhlci5fY29tbWFuZFxuICAgICAgICA/ICh0aGlzLnBpZCAtIG90aGVyLnBpZClcbiAgICAgICAgOiAodGhpcy5fY29tbWFuZCA8IG90aGVyLl9jb21tYW5kKSA/IC0xIDogMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbWFuZCArICcoJyArIHRoaXMucGlkICsgJyknO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb2Nlc3NJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG4gIHJldHVybiBhc3luY0V4ZWN1dGUoJ3BzJywgWyctZScsICctbycsICdwaWQsY29tbSddLCB7fSlcbiAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgLy8gJEZsb3dJc3N1ZSAtLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTE0M1xuICAgICAgcmV0dXJuIHJlc3VsdC5zdGRvdXQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSkubWFwKGxpbmUgPT4ge1xuICAgICAgICBjb25zdCB3b3JkcyA9IGxpbmUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICAgIGNvbnN0IHBpZCA9IE51bWJlcih3b3Jkc1swXSk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB3b3Jkcy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBjb21tYW5kLnNwbGl0KCcvJyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChuYW1lICE9PSAnbm9kZScpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpOiBjdXJyZW50bHkgZmlyc3QgZGlyIG9ubHlcbiAgICAgICAgY29uc3QgdGFyZ2V0VXJpID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0uZ2V0UGF0aCgpO1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVEZWJ1Z2dlclByb2Nlc3NJbmZvKHBpZCwgY29tbWFuZCwgdGFyZ2V0VXJpKTtcbiAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtICE9IG51bGwpO1xuICAgIH0sXG4gICAgZSA9PiB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbm9kZScsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbiAgTm9kZURlYnVnZ2VySW5zdGFuY2UsXG59O1xuIl19