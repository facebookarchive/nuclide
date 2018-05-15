'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIProxy;















function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MITypes;
function _load_MITypes() {return _MITypes = require('./MITypes');}var _VariableReference;





function _load_VariableReference() {return _VariableReference = _interopRequireDefault(require('./VariableReference'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// a ScopeVariableReference refers to a set of variables in a stack frame
class ScopeVariableReference extends (_VariableReference || _load_VariableReference()).default {
  constructor(
  client,
  variables,
  threadId,
  frameIndex)
  {
    super({
      client,
      variables,
      expression: '',
      threadId,
      frameIndex,
      typeClass: 'named',
      type: 'scope' });

  }

  getVariables(start, count) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      // By definition, a scope variable must have a stack frame.
      if (!(_this.threadId != null)) {throw new Error('Invariant violation: "this.threadId != null"');}if (!(
      _this.frameIndex != null)) {throw new Error('Invariant violation: "this.frameIndex != null"');}

      const command = `stack-list-variables --thread ${_this.threadId} --frame ${
      _this.frameIndex
      } --no-values`;
      const result = yield _this._client.sendCommand(command);
      if (result.error) {
        throw new Error(
        `Error retrieving variables for stack frame (${
        (0, (_MITypes || _load_MITypes()).toCommandError)(result).msg
        })`);

      }

      const miVariables = (0, (_MITypes || _load_MITypes()).stackListVariablesResult)(result).variables;

      const resolvedStart = start == null ? 0 : start;
      const resolvedEnd =
      count == null ? miVariables.length - resolvedStart : start + count;

      return Promise.all(
      miVariables.slice(resolvedStart, resolvedEnd).map((() => {var _ref = (0, _asyncToGenerator.default)(function* (_) {
          const handle = _this._variables.nestedVariableReference(_this, _.name);

          return _this.variableFromVarRefHandle(handle, _.name, null);
        });return function (_x) {return _ref.apply(this, arguments);};})()));})();

  }

  setChildValue(name, value) {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      const varResult = yield _this2._client.sendCommand(`var-create - * ${name}`);
      if (varResult.error) {
        throw new Error(
        `Could not get variable ${name} to set: ${
        (0, (_MITypes || _load_MITypes()).toCommandError)(varResult).msg
        }`);

      }

      const varInfo = (0, (_MITypes || _load_MITypes()).varCreateResult)(varResult);

      const assignResult = yield _this2._client.sendCommand(
      `var-assign ${varInfo.name} ${value}`);

      if (assignResult.error) {
        throw new Error(
        `Unable to set ${name} to {value}: ${(0, (_MITypes || _load_MITypes()).toCommandError)(assignResult).msg}`);

      }

      const assign = (0, (_MITypes || _load_MITypes()).varAssignResult)(assignResult);

      yield _this2._client.sendCommand(`var-delete ${varInfo.name}`);

      return {
        value: assign.value,
        type: varInfo.type,
        variablesReference: 0 };})();

  }

  getValue() {return (0, _asyncToGenerator.default)(function* () {
      return '';})();
  }

  get qualifiedName() {
    return 'scope';
  }

  getChildCount() {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this3._childCount != null) {
        return _this3._childCount;
      }

      const variables = yield _this3.getVariables();
      _this3._childCount = variables.length;
      return variables.length;})();
  }}exports.default = ScopeVariableReference; /**
                                               * Copyright (c) 2017-present, Facebook, Inc.
                                               * All rights reserved.
                                               *
                                               * This source code is licensed under the BSD-style license found in the
                                               * LICENSE file in the root directory of this source tree. An additional grant
                                               * of patent rights can be found in the PATENTS file in the same directory.
                                               *
                                               * 
                                               * @format
                                               */