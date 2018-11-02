"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _MITypes() {
  const data = require("./MITypes");

  _MITypes = function () {
    return data;
  };

  return data;
}

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
class RegistersVariableReference extends _VariableReference().default {
  constructor(client, variables) {
    super({
      client,
      variables,
      expression: '',
      typeClass: 'named',
      type: 'register-file'
    });
  }

  async getVariables(start, count) {
    const resolvedStart = start == null ? 0 : start;
    const resolvedCount = count == null ? await this.getChildCount() : count;
    await this._ensureRegisterIndicesExist();

    const indices = this._registerIndices.slice(resolvedStart, resolvedStart + resolvedCount);

    const result = await this._client.sendCommand(`data-list-register-values --skip-unavailable x ${indices.join(' ')}`);

    if (result.error) {
      throw new Error(`Could not fetch register values ${(0, _MITypes().toCommandError)(result).msg}`);
    }

    return (0, _MITypes().dataListRegisterValuesResult)(result)['register-values'].map(_ => {
      const name = this._registerNames.get(parseInt(_.number, 10));

      if (!(name != null)) {
        throw new Error("Invariant violation: \"name != null\"");
      }

      const value = new (_MIRegisterValue().MIRegisterValueParser)(_.value).parse();
      return RegistersVariableReference.variableFromRegisterValue(this._variables, name, `$${name}`, // registers are denoted $reg in gdb expressions
      value);
    });
  }

  static variableFromRegisterValue(variables, name, expression, value) {
    let variable = {
      name,
      value: value.toString(),
      type: 'int',
      variablesReference: 0
    };

    if (value.isContainer()) {
      const varref = variables.registerElementVariableReference(value, name, expression);

      if (value.containerKeyIsString) {
        variable = Object.assign({}, variable, {
          type: '{}',
          variablesReference: varref,
          namedVariables: value.length,
          presentationHint: {
            kind: 'readOnly'
          }
        });
      } else {
        variable = Object.assign({}, variable, {
          type: '[]',
          variablesReference: varref,
          indexedVariables: value.length,
          presentationHint: {
            kind: 'readOnly'
          }
        });
      }
    }

    return variable;
  }

  async getType() {
    return '[]';
  } // The value of a container variable is a summary of the value
  // of its contents.


  async getValue() {
    return '...';
  }

  async getChildCount() {
    await this._ensureRegisterIndicesExist();
    return this._registerIndices.length;
  }

  async _ensureRegisterIndicesExist() {
    if (this._registerIndices != null) {
      return;
    } // MI indexes registers, but the indices aren't contiguous so that the
    // indices can match the target CPU's numbering scheme if there is one.
    // This is represented in the API by empty register names for unused
    // slots.


    this._registerNames = new Map();
    this._registerIndices = [];
    const result = await this._client.sendCommand('data-list-register-names');

    if (result.error) {
      throw new Error(`Failed to fetch register names ${(0, _MITypes().toCommandError)(result).msg}`);
    }

    (0, _MITypes().dataListRegisterNamesResult)(result)['register-names'].forEach((name, index) => {
      if (name !== '') {
        this._registerIndices.push(index);

        this._registerNames.set(index, name);
      }
    });
  }

  async setChildValue(name, value) {
    const result = await this._client.sendCommand(`data-evaluate-expression $${name}=${value}`);

    if (result.error) {
      throw new Error(`Unable to change register value ${(0, _MITypes().toCommandError)(result).msg}`);
    }

    const newValue = (0, _MITypes().dataEvaluateExpressionResult)(result).value;
    return {
      value: newValue,
      type: await this.getType()
    };
  }

  get qualifiedName() {
    return 'registers';
  }

  get needsDeletion() {
    return false;
  }

}

exports.default = RegistersVariableReference;