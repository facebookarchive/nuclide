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
// A NestedVariableReference refers to a set of variables in another variable
// (struct, union, etc.)
class NestedVariableReference extends _VariableReference().default {
  constructor(client, variables, container, expression, // exp is the expression in the source language naming the variable
  varName) // name is the internal gdb variable name, used to get the value
  {
    super({
      client,
      variables,
      expression,
      threadId: container.threadId,
      frameIndex: container.frameIndex,
      varName
    }); // We will lazily create the variable binding to MI, so we only
    // have to do it for ones the user actually wants to drill into.

    this._qualifiedName = container.qualifiedName + '.' + expression; // if name is null, then we will lazily create a gdb varref which needs
    // to be cleaned up. if name is defined then the varref is already
    // created and whoever did that is responsible for deleting it.

    this._needsDeletion = varName == null;
  }

  async getVariables(start, count) {
    if (this._varName == null) {
      await this._createVariableBinding(this._expression);
    }

    const varName = this._varName;

    if (!(varName != null)) {
      throw new Error("Invariant violation: \"varName != null\"");
    } // var-list-children -no-values name from to (zero-based, from 'from and up to and including 'to')


    const command = `var-list-children --no-values ${varName}`;
    const result = await this._client.sendCommand(command);

    if (result.error) {
      throw new Error(`Error getting variable's children (${(0, _MITypes().toCommandError)(result).msg})`);
    }

    const miVariables = (0, _MITypes().varListChildrenResult)(result).children;
    const resolvedStart = start == null ? 0 : start;
    const resolvedEnd = count == null ? miVariables.length - resolvedStart : start + count;
    return Promise.all(miVariables.slice(resolvedStart, resolvedEnd).map(async _ => {
      const child = _.child;

      const handle = this._variables.nestedVariableReference(this, child.exp, child.name);

      return this.variableFromVarRefHandle(handle, child.exp, child.type);
    }));
  }

  get needsDeletion() {
    return this._needsDeletion;
  }

  async _getVarName() {
    if (this._varName != null) {
      return this._varName;
    }

    await this._createVariableBinding(this._expression);
    const varName = this._varName;

    if (!(varName != null)) {
      throw new Error("Invariant violation: \"varName != null\"");
    }

    return varName;
  }

  get qualifiedName() {
    return this._qualifiedName;
  }

}

exports.default = NestedVariableReference;