"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _Logger() {
  const data = require("./Logger");

  _Logger = function () {
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
// An ExpressionVariableReference refers to a watch or hover expression rather
// than a variable rooted in a stack frame scope.
class ExpressionVariableReference extends _VariableReference().default {
  constructor(client, variables, threadId, frameIndex, expression) {
    super({
      client,
      variables,
      expression,
      threadId,
      frameIndex
    });
  } // Unlike variable enumeration, getVariables here can only return exactly
  // one variable.


  async getVariables(start, count) {
    const value = await this.getValue();
    const typeClass = await this.getTypeClass(value);
    const resolvedType = await this.getType();
    (0, _Logger().logVerbose)(`eval name ${this._expression} type ${resolvedType} value ${value} typeClass ${typeClass}`);
    let variable = {
      name: this._expression,
      value,
      type: resolvedType,
      variablesReference: 0
    };

    if (typeClass !== 'simple') {
      const handle = this._variables.nestedVariableReference(this, this._expression, (await this._getVarName()));

      const childCount = await this.getChildCount();

      if (typeClass === 'indexed') {
        variable = Object.assign({}, variable, {
          indexedVariables: childCount,
          variablesReference: handle
        });
      } else if (typeClass === 'named') {
        variable = Object.assign({}, variable, {
          namedVariables: childCount,
          variablesReference: handle
        });
      }
    }

    return [variable];
  }

  get needsDeletion() {
    return true;
  }

  get qualifiedName() {
    return `eval.${this._expression}`;
  }

}

exports.default = ExpressionVariableReference;