var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideDebuggerAtom2;

function _nuclideDebuggerAtom() {
  return _nuclideDebuggerAtom2 = require('../../nuclide-debugger-atom');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var NodeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(NodeDebuggerInstance, _DebuggerInstance);

  function NodeDebuggerInstance(processInfo, debugPort) {
    var _this = this;

    _classCallCheck(this, NodeDebuggerInstance);

    _get(Object.getPrototypeOf(NodeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);
    this._debugPort = debugPort;
    this._server = null;
    this._close$ = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Subject();
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
        this._server = new (_ws2 || _ws()).default.Server({ port: wsPort });
        this._server.on('connection', function (websocket) {
          var config = {
            debugPort: _this2._debugPort,
            preload: false };
          // This makes the node inspector not load all the source files on startup.

          var _require = require('./Session');

          var Session = _require.Session;

          var session = new Session(config, _this2._debugPort, websocket);
          (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(session, 'close').subscribe(_this2._close$);
        });
      }
      // create an instance of DebugServer, and get its ws port.
      return Promise.resolve('ws=localhost:' + wsPort + '/');
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._close$.first().subscribe(callback));
    }
  }]);

  return NodeDebuggerInstance;
})((_nuclideDebuggerAtom2 || _nuclideDebuggerAtom()).DebuggerInstance);

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
      (0, (_assert2 || _assert()).default)(other instanceof NodeDebuggerProcessInfo);
      return this._command === other._command ? this.pid - other.pid : this._command < other._command ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._command + '(' + this.pid + ')';
    }
  }]);

  return NodeDebuggerProcessInfo;
})((_nuclideDebuggerAtom2 || _nuclideDebuggerAtom()).DebuggerProcessInfo);

function getProcessInfoList() {
  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('ps', ['-e', '-o', 'pid,comm'], {}).then(function (result) {
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