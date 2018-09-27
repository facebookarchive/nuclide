"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _MIProxy() {
  const data = _interopRequireDefault(require("./MIProxy"));

  _MIProxy = function () {
    return data;
  };

  return data;
}

function _MIRegisterValue() {
  const data = require("./MIRegisterValue");

  _MIRegisterValue = function () {
    return data;
  };

  return data;
}

function _RegistersVariableReference() {
  const data = _interopRequireDefault(require("./RegistersVariableReference"));

  _RegistersVariableReference = function () {
    return data;
  };

  return data;
}

function _MITypes() {
  const data = require("./MITypes");

  _MITypes = function () {
    return data;
  };

  return data;
}

function _VariableReference() {
  const data = _interopRequireDefault(require("./VariableReference"));

  _VariableReference = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 */
class RegisterElementVariableReference extends _VariableReference().default {
  constructor(client, variables, name, expression, value) {
    super({
      client,
      variables,
      expression
    });
    this._value = value;
    this._name = name;
    this._containedVariables = this._value.containedValues().map(v => {
      return _RegistersVariableReference().default.variableFromRegisterValue(this._variables, v.name, `${this._expression}${v.expressionSuffix}`, v.value);
    });
    this._childrenByName = new Map(this._value.containedValues().map(v => [v.name, v]));
  }

  async getVariables(start, count) {
    const resolvedStart = start == null ? 0 : start;
    const resolvedCount = count == null ? await this.getChildCount() : count;
    return this._containedVariables.slice(resolvedStart, resolvedStart + resolvedCount);
  }

  async getTypeClass(value) {
    if (!this._value.isContainer()) {
      return 'simple';
    }

    if (this._value.containerKeyIsString) {
      return 'named';
    }

    return 'indexed';
  }

  async getType() {
    if (!this._value.isContainer()) {
      return 'int';
    }

    return '[]';
  }

  async getValue() {
    return this._value.toString();
  }

  async getChildCount() {
    return this._value.length;
  }

  async setChildValue(name, value) {
    const nestedValue = this._childrenByName.get(name);

    if (!(nestedValue != null)) {
      throw new Error("Invariant violation: \"nestedValue != null\"");
    }

    if (nestedValue.value.isContainer()) {
      throw new Error('Cannot edit aggregate value directly, please edit individual components.');
    }

    const result = await this._client.sendCommand(`data-evaluate-expression ${this._expression}${nestedValue.expressionSuffix}=${value}`);

    if (result.error) {
      throw new Error(`Unable to change register value ${(0, _MITypes().toCommandError)(result).msg}`);
    }

    const newValue = (0, _MITypes().dataEvaluateExpressionResult)(result).value;
    return {
      value: newValue,
      type: await this.getType()
    };
  }

  get needsDeletion() {
    return false;
  }

}

exports.default = RegisterElementVariableReference;