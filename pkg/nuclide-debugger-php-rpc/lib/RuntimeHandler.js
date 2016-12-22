'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RuntimeHandler = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _Handler;

function _load_Handler() {
  return _Handler = _interopRequireDefault(require('./Handler'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handles all 'Runtime.*' Chrome dev tools messages
class RuntimeHandler extends (_Handler || _load_Handler()).default {

  constructor(clientCallback, connectionMultiplexer) {
    super('Runtime', clientCallback);
    this._connectionMultiplexer = connectionMultiplexer;
  }

  handleMethod(id, method, params) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (method) {
        case 'enable':
          _this._notifyExecutionContext(id);
          break;

        case 'getProperties':
          yield _this._getProperties(id, params);
          break;

        case 'evaluate':
          const compatParams = (0, (_utils || _load_utils()).makeExpressionHphpdCompatible)(params);

          // Chrome may call 'evaluate' for other purposes like auto-completion etc..
          // and we are only interested in console evaluation.
          if (compatParams.objectGroup === 'console') {
            yield _this._evaluate(id, compatParams);
          } else {
            _this.unknownMethod(id, method, compatParams);
          }
          break;

        default:
          _this.unknownMethod(id, method, params);
          break;
      }
    })();
  }

  _notifyExecutionContext(id) {
    this.sendMethod('Runtime.executionContextCreated', {
      context: {
        id: 1,
        frameId: (_helpers || _load_helpers()).DUMMY_FRAME_ID,
        name: 'hhvm: TODO: mangle in pid, idekey, script from connection'
      }
    });
    this.replyToCommand(id, {});
  }

  _getProperties(id, params) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // params also has properties:
      //    ownProperties
      //    generatePreview
      const { objectId, accessorPropertiesOnly } = params;
      let result;
      if (!accessorPropertiesOnly) {
        result = yield _this2._connectionMultiplexer.getProperties(objectId);
      } else {
        // TODO: Handle remaining params
        result = [];
      }
      _this2.replyToCommand(id, { result });
    })();
  }

  _evaluate(id, params) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this3._connectionMultiplexer.runtimeEvaluate(params.expression);
      _this3.replyToCommand(id, result);
    })();
  }
}
exports.RuntimeHandler = RuntimeHandler; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          */