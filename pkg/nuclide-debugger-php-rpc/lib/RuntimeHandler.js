Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Handles all 'Runtime.*' Chrome dev tools messages

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _Handler2;

function _Handler() {
  return _Handler2 = _interopRequireDefault(require('./Handler'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var RuntimeHandler = (function (_default) {
  _inherits(RuntimeHandler, _default);

  function RuntimeHandler(clientCallback, connectionMultiplexer) {
    _classCallCheck(this, RuntimeHandler);

    _get(Object.getPrototypeOf(RuntimeHandler.prototype), 'constructor', this).call(this, 'Runtime', clientCallback);
    this._connectionMultiplexer = connectionMultiplexer;
  }

  _createClass(RuntimeHandler, [{
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {
      switch (method) {
        case 'enable':
          this._notifyExecutionContext(id);
          break;

        case 'getProperties':
          yield this._getProperties(id, params);
          break;

        case 'evaluate':
          var compatParams = (0, (_utils2 || _utils()).makeExpressionHphpdCompatible)(params);

          // Chrome may call 'evaluate' for other purposes like auto-completion etc..
          // and we are only interested in console evaluation.
          if (compatParams.objectGroup === 'console') {
            yield this._evaluate(id, compatParams);
          } else {
            this.unknownMethod(id, method, compatParams);
          }
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }, {
    key: '_notifyExecutionContext',
    value: function _notifyExecutionContext(id) {
      this.sendMethod('Runtime.executionContextCreated', {
        context: {
          id: 1,
          frameId: (_helpers2 || _helpers()).DUMMY_FRAME_ID,
          name: 'hhvm: TODO: mangle in pid, idekey, script from connection'
        }
      });
      this.replyToCommand(id, {});
    }
  }, {
    key: '_getProperties',
    value: _asyncToGenerator(function* (id, params) {
      // params also has properties:
      //    ownProperties
      //    generatePreview
      var objectId = params.objectId;
      var accessorPropertiesOnly = params.accessorPropertiesOnly;

      var result = undefined;
      if (!accessorPropertiesOnly) {
        result = yield this._connectionMultiplexer.getProperties(objectId);
      } else {
        // TODO: Handle remaining params
        result = [];
      }
      this.replyToCommand(id, { result: result });
    })
  }, {
    key: '_evaluate',
    value: _asyncToGenerator(function* (id, params) {
      var result = yield this._connectionMultiplexer.runtimeEvaluate(params.expression);
      this.replyToCommand(id, result);
    })
  }]);

  return RuntimeHandler;
})((_Handler2 || _Handler()).default);

exports.RuntimeHandler = RuntimeHandler;