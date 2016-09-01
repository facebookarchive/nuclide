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

var NodeAttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(NodeAttachProcessInfo, _DebuggerProcessInfo);

  function NodeAttachProcessInfo(pid, command, targetUri) {
    _classCallCheck(this, NodeAttachProcessInfo);

    _get(Object.getPrototypeOf(NodeAttachProcessInfo.prototype), 'constructor', this).call(this, 'node', targetUri);

    this.pid = pid;
    this._command = command;
  }

  _createClass(NodeAttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      // Enable debugging in the process.
      process.kill(this.pid, 'SIGUSR1');

      // This is the port that the V8 debugger usually listens on.
      // TODO(natthu): Provide a way to override this in the UI.
      var debugPort = 5858;
      return new (_NodeDebuggerInstance2 || _NodeDebuggerInstance()).NodeDebuggerInstance(this, debugPort);
    })
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, (_assert2 || _assert()).default)(other instanceof NodeAttachProcessInfo);
      return this._command === other._command ? this.pid - other.pid : this._command < other._command ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._command + '(' + this.pid + ')';
    }
  }]);

  return NodeAttachProcessInfo;
})((_nuclideDebuggerBase2 || _nuclideDebuggerBase()).DebuggerProcessInfo);

exports.NodeAttachProcessInfo = NodeAttachProcessInfo;