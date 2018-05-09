'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIDebugSession;













function _load_MIDebugSession() {return _MIDebugSession = require('./MIDebugSession');}var _MIProxy;
function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _VariableReference;
function _load_VariableReference() {return _VariableReference = _interopRequireDefault(require('./VariableReference'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// An ExpressionVariableReference refers to a watch or hover expression rather
// than a variable rooted in a stack frame scope.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */class ExpressionVariableReference extends (_VariableReference || _load_VariableReference()).default {constructor(client, variables, threadId, frameIndex, expression) {super({ client, variables, expression, threadId, frameIndex });}
  // Unlike variable enumeration, getVariables here can only return exactly
  // one variable.
  getVariables(start, count) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const value = yield _this.getValue();
      const typeClass = yield _this.getTypeClass(value);

      const resolvedType = yield _this.getType();

      (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(
      `eval name ${
      _this._expression
      } type ${resolvedType} value ${value} typeClass ${typeClass}`);


      let variable = {
        name: _this._expression,
        value,
        type: resolvedType,
        variablesReference: 0 };


      if (typeClass !== 'simple') {
        const handle = _this._variables.nestedVariableReference(_this,

        _this._expression, (
        yield _this._getVarName()));

        const childCount = yield _this.getChildCount();

        if (typeClass === 'indexed') {
          variable = Object.assign({},
          variable, {
            indexedVariables: childCount,
            variablesReference: handle });

        } else if (typeClass === 'named') {
          variable = Object.assign({},
          variable, {
            namedVariables: childCount,
            variablesReference: handle });

        }
      }

      return [variable];})();
  }

  get needsDeletion() {
    return true;
  }

  get qualifiedName() {
    return `eval.${this._expression}`;
  }}exports.default = ExpressionVariableReference;