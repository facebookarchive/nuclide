Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideDebuggerBase2;

function _nuclideDebuggerBase() {
  return _nuclideDebuggerBase2 = require('../../nuclide-debugger-base');
}

var _PhpDebuggerInstance2;

function _PhpDebuggerInstance() {
  return _PhpDebuggerInstance2 = require('./PhpDebuggerInstance');
}

var AttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(AttachProcessInfo, _DebuggerProcessInfo);

  function AttachProcessInfo(targetUri) {
    _classCallCheck(this, AttachProcessInfo);

    _get(Object.getPrototypeOf(AttachProcessInfo.prototype), 'constructor', this).call(this, 'hhvm', targetUri);
  }

  _createClass(AttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      try {
        // $FlowFB
        var services = require('./fb/services');
        yield services.warnIfNotBuilt(this.getTargetUri());
        services.startSlog();
      } catch (_) {}
      return new (_PhpDebuggerInstance2 || _PhpDebuggerInstance()).PhpDebuggerInstance(this);
    })
  }, {
    key: 'supportThreads',
    value: function supportThreads() {
      return true;
    }
  }, {
    key: 'supportSingleThreadStepping',
    value: function supportSingleThreadStepping() {
      return true;
    }
  }, {
    key: 'singleThreadSteppingEnabled',
    value: function singleThreadSteppingEnabled() {
      return true;
    }
  }, {
    key: 'customControlButtons',
    value: function customControlButtons() {
      var customControlButtons = [{
        icon: 'link-external',
        title: 'Toggle HTTP Request Sender',
        onClick: function onClick() {
          return atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog');
        }
      }];
      try {
        // $FlowFB
        return customControlButtons.concat(require('./fb/services').customControlButtons);
      } catch (_) {
        return customControlButtons;
      }
    }
  }]);

  return AttachProcessInfo;
})((_nuclideDebuggerBase2 || _nuclideDebuggerBase()).DebuggerProcessInfo);

exports.AttachProcessInfo = AttachProcessInfo;