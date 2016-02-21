var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('../../atom');

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
var Session = require('../VendorLib/node-inspector/lib/session');

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
  getProcessInfoList: getProcessInfoList,
  NodeDebuggerInstance: NodeDebuggerInstance
};
//# sourceMappingURL=data:application/json;base64,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QUcsQ0FBQyxDQUFDO0FBQ3RDLFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFVBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtBQUNuQixlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0QsYUFBTyxJQUFJLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDN0QsQ0FBQyxDQUNDLE1BQU0sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLElBQUksSUFBSTtLQUFBLENBQUMsQ0FBQztHQUNqQyxFQUNELFVBQUEsQ0FBQyxFQUFJO0FBQ0gsV0FBTyxFQUFFLENBQUM7R0FDWCxDQUFDLENBQUM7Q0FDTjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFFLE1BQU07QUFDWixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHNCQUFvQixFQUFwQixvQkFBb0I7Q0FDckIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgV2ViU29ja2V0U2VydmVyID0gcmVxdWlyZSgnd3MnKS5TZXJ2ZXI7XG5jb25zdCBTZXNzaW9uID0gcmVxdWlyZSgnLi4vVmVuZG9yTGliL25vZGUtaW5zcGVjdG9yL2xpYi9zZXNzaW9uJyk7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZSwgRGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNsYXNzIE5vZGVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9jbG9zZSQ6IFJ4LlN1YmplY3Q8bWl4ZWQ+O1xuICBfZGVidWdQb3J0OiBudW1iZXI7XG4gIF9zZXJ2ZXI6ID9XZWJTb2NrZXRTZXJ2ZXI7XG4gIF9zZXNzaW9uRW5kQ2FsbGJhY2s6ID8oKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcbiAgICB0aGlzLl9kZWJ1Z1BvcnQgPSBkZWJ1Z1BvcnQ7XG4gICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLl9jbG9zZSQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX2Nsb3NlJC5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7IHRoaXMuZGlzcG9zZSgpOyB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgY29uc3Qgd3NQb3J0ID0gODA4MDtcbiAgICBpZiAoIXRoaXMuX3NlcnZlcikge1xuICAgICAgdGhpcy5fc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogd3NQb3J0fSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3ZWJzb2NrZXQgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICAgICAgZGVidWdQb3J0OiB0aGlzLl9kZWJ1Z1BvcnQsXG4gICAgICAgICAgcHJlbG9hZDogZmFsc2UsIC8vIFRoaXMgbWFrZXMgdGhlIG5vZGUgaW5zcGVjdG9yIG5vdCBsb2FkIGFsbCB0aGUgc291cmNlIGZpbGVzIG9uIHN0YXJ0dXAuXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSBuZXcgU2Vzc2lvbihjb25maWcsIHRoaXMuX2RlYnVnUG9ydCwgd2Vic29ja2V0KTtcbiAgICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2Vzc2lvbiwgJ2Nsb3NlJykuc3Vic2NyaWJlKHRoaXMuX2Nsb3NlJCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gY3JlYXRlIGFuIGluc3RhbmNlIG9mIERlYnVnU2VydmVyLCBhbmQgZ2V0IGl0cyB3cyBwb3J0LlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYHdzPWxvY2FsaG9zdDoke3dzUG9ydH0vYCk7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IG1peGVkKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nsb3NlJC5maXJzdCgpLnN1YnNjcmliZShjYWxsYmFjayk7XG4gIH1cbn1cblxuY2xhc3MgTm9kZURlYnVnZ2VyUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgcGlkOiBudW1iZXI7XG4gIF9jb21tYW5kOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGlkOiBudW1iZXIsIGNvbW1hbmQ6IHN0cmluZywgdGFyZ2V0VXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgc3VwZXIoJ25vZGUnLCB0YXJnZXRVcmkpO1xuXG4gICAgdGhpcy5waWQgPSBwaWQ7XG4gICAgdGhpcy5fY29tbWFuZCA9IGNvbW1hbmQ7XG4gIH1cblxuICBhc3luYyBkZWJ1ZygpOiBQcm9taXNlPERlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICAvLyBFbmFibGUgZGVidWdnaW5nIGluIHRoZSBwcm9jZXNzLlxuICAgIHByb2Nlc3Mua2lsbCh0aGlzLnBpZCwgJ1NJR1VTUjEnKTtcblxuICAgIC8vIFRoaXMgaXMgdGhlIHBvcnQgdGhhdCB0aGUgVjggZGVidWdnZXIgdXN1YWxseSBsaXN0ZW5zIG9uLlxuICAgIC8vIFRPRE8obmF0dGh1KTogUHJvdmlkZSBhIHdheSB0byBvdmVycmlkZSB0aGlzIGluIHRoZSBVSS5cbiAgICBjb25zdCBkZWJ1Z1BvcnQgPSA1ODU4O1xuICAgIHJldHVybiBuZXcgTm9kZURlYnVnZ2VySW5zdGFuY2UodGhpcywgZGVidWdQb3J0KTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBOb2RlRGVidWdnZXJQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1hbmQgPT09IG90aGVyLl9jb21tYW5kXG4gICAgICAgID8gKHRoaXMucGlkIC0gb3RoZXIucGlkKVxuICAgICAgICA6ICh0aGlzLl9jb21tYW5kIDwgb3RoZXIuX2NvbW1hbmQpID8gLTEgOiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb21tYW5kICsgJygnICsgdGhpcy5waWQgKyAnKSc7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJvY2Vzc0luZm9MaXN0KCk6IFByb21pc2U8QXJyYXk8RGVidWdnZXJQcm9jZXNzSW5mbz4+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi8uLi9jb21tb25zJyk7XG4gIHJldHVybiBhc3luY0V4ZWN1dGUoJ3BzJywgWyctZScsICctbycsICdwaWQsY29tbSddLCB7fSlcbiAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgLy8gJEZsb3dJc3N1ZSAtLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTE0M1xuICAgICAgcmV0dXJuIHJlc3VsdC5zdGRvdXQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSkubWFwKGxpbmUgPT4ge1xuICAgICAgICBjb25zdCB3b3JkcyA9IGxpbmUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICAgIGNvbnN0IHBpZCA9IE51bWJlcih3b3Jkc1swXSk7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB3b3Jkcy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBjb21tYW5kLnNwbGl0KCcvJyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChuYW1lICE9PSAnbm9kZScpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpOiBjdXJyZW50bHkgZmlyc3QgZGlyIG9ubHlcbiAgICAgICAgY29uc3QgdGFyZ2V0VXJpID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0uZ2V0UGF0aCgpO1xuICAgICAgICByZXR1cm4gbmV3IE5vZGVEZWJ1Z2dlclByb2Nlc3NJbmZvKHBpZCwgY29tbWFuZCwgdGFyZ2V0VXJpKTtcbiAgICAgIH0pXG4gICAgICAgIC5maWx0ZXIoaXRlbSA9PiBpdGVtICE9IG51bGwpO1xuICAgIH0sXG4gICAgZSA9PiB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuYW1lOiAnbm9kZScsXG4gIGdldFByb2Nlc3NJbmZvTGlzdCxcbiAgTm9kZURlYnVnZ2VySW5zdGFuY2UsXG59O1xuIl19