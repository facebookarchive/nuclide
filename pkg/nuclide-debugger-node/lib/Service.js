var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _nuclideCommons = require('../../nuclide-commons');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var WebSocketServer = require('ws').Server;

var NodeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(NodeDebuggerInstance, _DebuggerInstance);

  function NodeDebuggerInstance(processInfo, debugPort) {
    var _this = this;

    _classCallCheck(this, NodeDebuggerInstance);

    _get(Object.getPrototypeOf(NodeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._debugPort = debugPort;
    this._server = null;
    this._close$ = new _reactivexRxjs2['default'].Subject();
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

          var _require = require('./Session');

          var Session = _require.Session;

          var session = new Session(config, _this2._debugPort, websocket);
          _reactivexRxjs2['default'].Observable.fromEvent(session, 'close').subscribe(_this2._close$);
        });
      }
      // create an instance of DebugServer, and get its ws port.
      return Promise.resolve('ws=localhost:' + wsPort + '/');
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      return new _nuclideCommons.DisposableSubscription(this._close$.first().subscribe(callback));
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
  var _require2 = require('../../nuclide-commons');

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
  getProcessInfoList: getProcessInfoList,
  NodeDebuggerInstance: NodeDebuggerInstance
};
//# sourceMappingURL=data:application/json;base64,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QUN0QyxVQUFNLElBQUksR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxVQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDbkIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdELGFBQU8sSUFBSSx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzdELENBQUMsQ0FDQyxNQUFNLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxJQUFJLElBQUk7S0FBQSxDQUFDLENBQUM7R0FDakMsRUFDRCxVQUFBLENBQUMsRUFBSTtBQUNILFdBQU8sRUFBRSxDQUFDO0dBQ1gsQ0FBQyxDQUFDO0NBQ047O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLE1BQUksRUFBRSxNQUFNO0FBQ1osb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQixzQkFBb0IsRUFBcEIsb0JBQW9CO0NBQ3JCLENBQUMiLCJmaWxlIjoiU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IFdlYlNvY2tldFNlcnZlciA9IHJlcXVpcmUoJ3dzJykuU2VydmVyO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VySW5zdGFuY2UsIERlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQge0Rpc3Bvc2FibGVTdWJzY3JpcHRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmNsYXNzIE5vZGVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9jbG9zZSQ6IFJ4LlN1YmplY3Q8bWl4ZWQ+O1xuICBfZGVidWdQb3J0OiBudW1iZXI7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9kZWJ1Z1BvcnQgPSBkZWJ1Z1BvcnQ7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLl9jbG9zZSQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX2Nsb3NlJC5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZGlzcG9zZSgpOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgY29uc3Qgd3NQb3J0ID0gODA4MDtcbiAgICBpZiAoIXRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJzb2NrZXQgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgZGVidWdQb3J0OiB0aGlzLl9kZWJ1Z1BvcnQsXG4gICAgICAgICAgcHJlbG9hZDogZmFsc2UsIC8vIFRoaXMgbWFrZXMgdGhlIG5vZGUgaW5zcGVjdG9yIG5vdCBsb2FkIGFsbCB0aGUgc291cmNlIGZpbGVzIG9uIHN0YXJ0dXAuXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHtTZXNzaW9ufSA9IHJlcXVpcmUoJy4vU2Vzc2lvbicpO1xuICAgICAgICBjb25zdCBzZXNzaW9uID0gbmV3IFNlc3Npb24oY29uZmlnLCB0aGlzLl9kZWJ1Z1BvcnQsIHdlYnNvY2tldCk7XG4gICAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHNlc3Npb24sICdjbG9zZScpLnN1YnNjcmliZSh0aGlzLl9jbG9zZSQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNyZWF0ZSBhbiBpbnN0YW5jZSBvZiBEZWJ1Z1NlcnZlciwgYW5kIGdldCBpdHMgd3MgcG9ydC5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGB3cz1sb2NhbGhvc3Q6JHt3c1BvcnR9L2ApO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiBtaXhlZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGVTdWJzY3JpcHRpb24odGhpcy5fY2xvc2UkLmZpcnN0KCkuc3Vic2NyaWJlKGNhbGxiYWNrKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgcGlkOiBudW1iZXI7XG4gIF9jb21tYW5kOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGlkOiBudW1iZXIsIGNvbW1hbmQ6IHN0cmluZywgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgc3VwZXIoJ25vZGUnLCB0YXJnZXRVcmkpO1xuXG4gICAgdGhpcy5waWQgPSBwaWQ7XG4gICAgdGhpcy5fY29tbWFuZCA9IGNvbW1hbmQ7XG4gIH1cblxuICBhc3luYyBkZWJ1ZygpOiBQcm9taXNlPERlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICAvLyBFbmFibGUgZGVidWdnaW5nIGluIHRoZSBwcm9jZXNzLlxuICAgIHByb2Nlc3Mua2lsbCh0aGlzLnBpZCwgJ1NJR1VTUjEnKTtcblxuICAgIC8vIFRoaXMgaXMgdGhlIHBvcnQgdGhhdCB0aGUgVjggZGVidWdnZXIgdXN1YWxseSBsaXN0ZW5zIG9uLlxuICAgIC8vIFRPRE8obmF0dGh1KTogUHJvdmlkZSBhIHdheSB0byBvdmVycmlkZSB0aGlzIGluIHRoZSBVSS5cbiAgICBjb25zdCBkZWJ1Z1BvcnQgPSA1ODU4O1xuICAgIHJldHVybiBuZXcgTm9kZURlYnVnZ2VySW5zdGFuY2UodGhpcywgZGVidWdQb3J0KTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBOb2RlRGVidWdnZXJQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQgPT09IG90aGVyLl9jb21tYW5kXG4gICAgICAgID8gKHRoaXMucGlkIC0gb3RoZXIucGlkKVxuICAgICAgICA6ICh0aGlzLl9jb21tYW5kIDwgb3RoZXIuX2NvbW1hbmQpID8gLTEgOiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kICsgJygnICsgdGhpcy5waWQgKyAnKSc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJvY2Vzc0luZm9MaXN0KCk6IFByb21pc2U8QXJyYXk8RGVidWdnZXJQcm9jZXNzSW5mbz4+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbiAgcmV0dXJuIGFzeW5jRXhlY3V0ZSgncHMnLCBbJy1lJywgJy1vJywgJ3BpZCxjb21tJ10sIHt9KVxuICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAvLyAkRmxvd0lzc3VlIC0tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMTQzXG4gICAgICByZXR1cm4gcmVzdWx0LnN0ZG91dC50b1N0cmluZygpLnNwbGl0KCdcXG4nKS5zbGljZSgxKS5tYXAobGluZSA9PiB7XG4gICAgICAgIGNvbnN0IHdvcmRzID0gbGluZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICAgICAgY29uc3QgcGlkID0gTnVtYmVyKHdvcmRzWzBdKTtcbiAgICAgICAgY29uc3QgY29tbWFuZCA9IHdvcmRzLnNsaWNlKDEpLmpvaW4oJyAnKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGNvbW1hbmQuc3BsaXQoJy8nKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdub2RlJykge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8oam9uYWxkaXNsYXJyeSk6IGN1cnJlbnRseSBmaXJzdCBkaXIgb25seVxuICAgICAgICBjb25zdCB0YXJnZXRVcmkgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5nZXRQYXRoKCk7XG4gICAgICAgIHJldHVybiBuZXcgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8ocGlkLCBjb21tYW5kLCB0YXJnZXRVcmkpO1xuICAgICAgfSlcbiAgICAgICAgLmZpbHRlcihpdGVtID0+IGl0ZW0gIT0gbnVsbCk7XG4gICAgfSxcbiAgICBlID0+IHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5hbWU6ICdub2RlJyxcbiAgZ2V0UHJvY2Vzc0luZm9MaXN0LFxuICBOb2RlRGVidWdnZXJJbnN0YW5jZSxcbn07XG4iXX0=