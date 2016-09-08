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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _Session2;

function _Session() {
  return _Session2 = require('./Session');
}

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
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
          var session = new (_Session2 || _Session()).Session(config, _this2._debugPort, websocket);
          (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(session, 'close').subscribe(_this2._close$);
        });
      }
      // create an instance of DebugServer, and get its ws port.
      return Promise.resolve('ws=localhost:' + wsPort + '/');
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._close$.first().subscribe(callback));
    }
  }]);

  return NodeDebuggerInstance;
})((_nuclideDebuggerBase2 || _nuclideDebuggerBase()).DebuggerInstance);

exports.NodeDebuggerInstance = NodeDebuggerInstance;