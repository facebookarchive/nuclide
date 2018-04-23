'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MITypes;















function _load_MITypes() {return _MITypes = require('./MITypes');}var _MIProxy;





function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MIRegisterValue;
function _load_MIRegisterValue() {return _MIRegisterValue = require('./MIRegisterValue');}var _VariableReference;
function _load_VariableReference() {return _VariableReference = _interopRequireDefault(require('./VariableReference'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                       * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                       * All rights reserved.
                                                                                                                                                                                                                       *
                                                                                                                                                                                                                       * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                       *
                                                                                                                                                                                                                       * 
                                                                                                                                                                                                                       * @format
                                                                                                                                                                                                                       */class RegistersVariableReference extends (_VariableReference || _load_VariableReference()).default {constructor(client, variables) {super({ client, variables, expression: '',
      typeClass: 'named',
      type: 'register-file' });

  }

  getVariables(start, count) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const resolvedStart = start == null ? 0 : start;
      const resolvedCount = count == null ? yield _this.getChildCount() : count;

      yield _this._ensureRegisterIndicesExist();
      const indices = _this._registerIndices.slice(
      resolvedStart,
      resolvedStart + resolvedCount);


      const result = yield _this._client.sendCommand(
      `data-list-register-values --skip-unavailable x ${indices.join(' ')}`);


      if (result.error) {
        throw new Error(
        `Could not fetch register values ${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg}`);

      }

      return (0, (_MITypes || _load_MITypes()).dataListRegisterValuesResult)(result)['register-values'].map(function (_) {
        const name = _this._registerNames.get(parseInt(_.number, 10));if (!(
        name != null)) {throw new Error('Invariant violation: "name != null"');}

        const value = new (_MIRegisterValue || _load_MIRegisterValue()).MIRegisterValueParser(_.value).parse();

        return RegistersVariableReference.variableFromRegisterValue(
        _this._variables,
        name,
        `$${name}`, // registers are denoted $reg in gdb expressions
        value);

      });})();
  }

  static variableFromRegisterValue(
  variables,
  name,
  expression,
  value)
  {
    let variable = {
      name,
      value: value.toString(),
      type: 'int',
      variablesReference: 0 };


    if (value.isContainer()) {
      const varref = variables.registerElementVariableReference(
      value,
      name,
      expression);


      if (value.containerKeyIsString) {
        variable = Object.assign({},
        variable, {
          type: '{}',
          variablesReference: varref,
          namedVariables: value.length,
          presentationHint: {
            kind: 'readOnly' } });


      } else {
        variable = Object.assign({},
        variable, {
          type: '[]',
          variablesReference: varref,
          indexedVariables: value.length,
          presentationHint: {
            kind: 'readOnly' } });


      }
    }

    return variable;
  }

  getType() {return (0, _asyncToGenerator.default)(function* () {
      return '[]';})();
  }

  // The value of a container variable is a summary of the value
  // of its contents.
  getValue() {return (0, _asyncToGenerator.default)(function* () {
      return '...';})();
  }

  getChildCount() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      yield _this2._ensureRegisterIndicesExist();
      return _this2._registerIndices.length;})();
  }

  _ensureRegisterIndicesExist() {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this3._registerIndices != null) {
        return;
      }

      // MI indexes registers, but the indices aren't contiguous so that the
      // indices can match the target CPU's numbering scheme if there is one.
      // This is represented in the API by empty register names for unused
      // slots.
      _this3._registerNames = new Map();
      _this3._registerIndices = [];

      const result = yield _this3._client.sendCommand('data-list-register-names');
      if (result.error) {
        throw new Error(
        `Failed to fetch register names ${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg}`);

      }

      (0, (_MITypes || _load_MITypes()).dataListRegisterNamesResult)(result)['register-names'].forEach(
      function (name, index) {
        if (name !== '') {
          _this3._registerIndices.push(index);
          _this3._registerNames.set(index, name);
        }
      });})();

  }

  setChildValue(name, value) {var _this4 = this;return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this4._client.sendCommand(
      `data-evaluate-expression $${name}=${value}`);

      if (result.error) {
        throw new Error(
        `Unable to change register value ${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg}`);

      }

      const newValue = (0, (_MITypes || _load_MITypes()).dataEvaluateExpressionResult)(result).value;

      return {
        value: newValue,
        type: yield _this4.getType() };})();

  }

  get qualifiedName() {
    return 'registers';
  }

  get needsDeletion() {
    return false;
  }}exports.default = RegistersVariableReference;