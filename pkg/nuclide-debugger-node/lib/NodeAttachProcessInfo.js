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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
}

var _NodeDebuggerInstance2;

function _NodeDebuggerInstance() {
  return _NodeDebuggerInstance2 = require('./NodeDebuggerInstance');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var NodeAttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(NodeAttachProcessInfo, _DebuggerProcessInfo);

  function NodeAttachProcessInfo(targetUri, targetInfo) {
    _classCallCheck(this, NodeAttachProcessInfo);

    _get(Object.getPrototypeOf(NodeAttachProcessInfo.prototype), 'constructor', this).call(this, 'node', targetUri);
    this._targetInfo = targetInfo;
  }

  _createClass(NodeAttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      var rpcService = this._getRpcService();
      yield rpcService.attach(this._targetInfo);
      return new (_NodeDebuggerInstance2 || _NodeDebuggerInstance()).NodeDebuggerInstance(this, rpcService);
    })
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      var debuggerConfig = {
        logLevel: (0, (_utils2 || _utils()).getConfig)().serverLogLevel
      };
      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('NodeDebuggerService', this.getTargetUri());
      (0, (_assert2 || _assert()).default)(service);
      return new service.NodeDebuggerService(debuggerConfig);
    }
  }]);

  return NodeAttachProcessInfo;
})((_nuclideDebuggerBase2 || _nuclideDebuggerBase()).DebuggerProcessInfo);

exports.NodeAttachProcessInfo = NodeAttachProcessInfo;