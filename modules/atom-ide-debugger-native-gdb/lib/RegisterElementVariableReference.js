'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIProxy;

















function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MIRegisterValue;
function _load_MIRegisterValue() {return _MIRegisterValue = require('./MIRegisterValue');}var _RegistersVariableReference;
function _load_RegistersVariableReference() {return _RegistersVariableReference = _interopRequireDefault(require('./RegistersVariableReference'));}var _MITypes;
function _load_MITypes() {return _MITypes = require('./MITypes');}var _VariableReference;
function _load_VariableReference() {return _VariableReference = _interopRequireDefault(require('./VariableReference'));}var _Variables;
function _load_Variables() {return _Variables = _interopRequireDefault(require('./Variables'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                               * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                               *
                                                                                                                                                                                               * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                               *
                                                                                                                                                                                               * 
                                                                                                                                                                                               * @format
                                                                                                                                                                                               */class RegisterElementVariableReference extends (_VariableReference || _load_VariableReference()).default {constructor(client, variables,
  name,
  expression,
  value)
  {
    super({ client, variables, expression });
    this._value = value;
    this._name = name;

    this._containedVariables = this._value.containedValues().map(v => {
      return (_RegistersVariableReference || _load_RegistersVariableReference()).default.variableFromRegisterValue(
      this._variables,
      v.name,
      `${this._expression}${v.expressionSuffix}`,
      v.value);

    });

    this._childrenByName = new Map(
    this._value.containedValues().map(v => [v.name, v]));

  }

  getVariables(start, count) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const resolvedStart = start == null ? 0 : start;
      const resolvedCount = count == null ? yield _this.getChildCount() : count;

      return _this._containedVariables.slice(
      resolvedStart,
      resolvedStart + resolvedCount);})();

  }

  getTypeClass(value) {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      if (!_this2._value.isContainer()) {
        return 'simple';
      }

      if (_this2._value.containerKeyIsString) {
        return 'named';
      }

      return 'indexed';})();
  }

  getType() {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      if (!_this3._value.isContainer()) {
        return 'int';
      }
      return '[]';})();
  }

  getValue() {var _this4 = this;return (0, _asyncToGenerator.default)(function* () {
      return _this4._value.toString();})();
  }

  getChildCount() {var _this5 = this;return (0, _asyncToGenerator.default)(function* () {
      return _this5._value.length;})();
  }

  setChildValue(name, value) {var _this6 = this;return (0, _asyncToGenerator.default)(function* () {
      const nestedValue = _this6._childrenByName.get(name);if (!(
      nestedValue != null)) {throw new Error('Invariant violation: "nestedValue != null"');}

      if (nestedValue.value.isContainer()) {
        throw new Error(
        'Cannot edit aggregate value directly, please edit individual components.');

      }

      const result = yield _this6._client.sendCommand(
      `data-evaluate-expression ${_this6._expression}${
      nestedValue.expressionSuffix
      }=${value}`);

      if (result.error) {
        throw new Error(
        `Unable to change register value ${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg}`);

      }

      const newValue = (0, (_MITypes || _load_MITypes()).dataEvaluateExpressionResult)(result).value;

      return {
        value: newValue,
        type: yield _this6.getType() };})();

  }

  get needsDeletion() {
    return false;
  }}exports.default = RegisterElementVariableReference;