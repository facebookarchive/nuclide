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
class VariableReference {
  constructor(args) {
    this._client = args.client;
    this._variables = args.variables;
    this._expression = args.expression;
    this._threadId = args.threadId;
    this._frameIndex = args.frameIndex;
    this._typeClass = args.typeClass;
    this._type = args.type;
    this._varName = args.varName;
  }

  async getVariables(start, count) {
    throw new Error('Base class VariableReference.getVariables called (abstract method)');
  } // typeClass describes what type of container the variable's type is
  // simple variables are not containers
  // named variables have named members: struct, union, class
  // indexed variables are native arrays and pointers


  async getTypeClass(value) {
    // it would seem to make sense to infer the type class from the actual
    // type. but that doesn't work, because the actual type may be a typedef,
    // and that's what MI will return. we can't recover the underlying type
    // from just the typedef name (there is a way in gdb but it's not exposed,
    // and in any case is more complicated than this.)
    if (this._typeClass != null) {
      return this._typeClass;
    }

    let type = 'simple';

    if (value === '') {
      // For C++ code, gdb inserts an extra level of hierarchy that doesn't
      // exist in the code: nodes named 'public', 'private' and 'protected' that
      // group members at those protection levels. These nodes come back with an
      // empty string for the value.
      type = 'named';
    } else {
      const leading = value[0];

      if (leading === '[') {
        type = 'indexed';
      } else if (leading === '{') {
        type = 'named';
      } else {
        const children = await this.getChildCount(); // if the value is not formatted as a struct or array, and children
        // are available, then it's a pointer (which we treat as an array)

        if (children > 0) {
          type = 'indexed';
        }
      }
    }

    this._typeClass = type;
    return type;
  }

  async getType() {
    if (this._type != null) {
      return this._type;
    }

    const varName = await this._getVarName();
    const result = await this._client.sendCommand(`var-info-type ${varName}`);

    if (result.error) {
      throw new Error(`Error determining variable's type (${(0, _MITypes().toCommandError)(result).msg})`);
    }

    this._type = (0, _MITypes().varInfoTypeResult)(result).type;
    return this._type;
  } // The value of a container variable is a summary of the value
  // of its contents.


  async getValue() {
    const varName = await this._getVarName();
    const result = await this._client.sendCommand(`var-evaluate-expression ${varName}`);

    if (result.error) {
      throw new Error(`Error determining variable's value (${(0, _MITypes().toCommandError)(result).msg})`);
    }

    return (0, _MITypes().varEvaluateExpressionResult)(result).value;
  }

  async getChildCount() {
    if (this._childCount != null) {
      return this._childCount;
    }

    const varName = await this._getVarName(); // If we had to create the var name, we will have gotten the child count
    // as a side effect

    if (this._childCount != null) {
      return this._childCount;
    } // otherwise, we have to ask


    const result = await this._client.sendCommand(`var-info-num-children ${varName}`);

    if (result.error) {
      throw new Error(`Error determining the number of children (${(0, _MITypes().toCommandError)(result).msg})`);
    }

    const childCountStr = (0, _MITypes().varInfoNumChildrenResult)(result).numchild;

    if (!(childCountStr != null)) {
      throw new Error("Invariant violation: \"childCountStr != null\"");
    }

    const childCount = parseInt(childCountStr, 10);
    this._childCount = childCount;
    return childCount;
  }

  async setChildValue(name, value) {
    const varname = await this._getVarName();
    const childrenResult = await this._client.sendCommand(`var-list-children ${varname}`);

    if (childrenResult.error) {
      throw new Error(`Error getting the children of ${varname} ${(0, _MITypes().toCommandError)(childrenResult).msg}`);
    }

    const children = (0, _MITypes().varListChildrenResult)(childrenResult);
    const child = children.children.find(_ => _.child.exp === name);

    if (child == null) {
      throw new Error(`Cannot find variable ${name} to modify`);
    }

    const assignResult = await this._client.sendCommand(`var-assign ${child.child.name} ${value}`);

    if (assignResult.error) {
      throw new Error(`Unable to set ${name} to {$value}: ${(0, _MITypes().toCommandError)(assignResult).msg}`);
    }

    const assign = (0, _MITypes().varAssignResult)(assignResult);
    return {
      value: assign.value,
      type: child.child.type,
      variablesReference: 0
    };
  }

  async deleteResources() {
    if (this.needsDeletion && this._varName != null) {
      const result = await this._client.sendCommand(`var-delete ${this._varName}`);

      if (result.error) {
        // don't throw here, because we can still continue safely, but log the error.
        (0, _Logger().logVerbose)(`Error deleting variable ${(0, _MITypes().toCommandError)(result).msg}`);
      }
    }
  }

  get qualifiedName() {
    throw new Error('Base class VariableReference.getQualifiedName called (abstract method)');
  }

  get needsDeletion() {
    return false;
  }

  get threadId() {
    return this._threadId;
  }

  get frameIndex() {
    return this._frameIndex;
  }

  async variableFromVarRefHandle(handle, name, type) {
    const varref = this._variables.getVariableReference(handle);

    if (!(varref != null)) {
      throw new Error("Invariant violation: \"varref != null\"");
    }

    const value = await varref.getValue();
    const typeClass = await varref.getTypeClass(value);
    const resolvedType = type == null ? await varref.getType() : type;
    (0, _Logger().logVerbose)(`name ${name} type ${resolvedType} value ${value} typeClass ${typeClass}`);
    let variable = {
      name,
      value,
      type: resolvedType,
      variablesReference: 0
    };

    if (typeClass !== 'simple') {
      const childCount = await varref.getChildCount();

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

    return variable;
  }

  async _createVariableBinding(expression) {
    // '-' means to let gdb create a unique name for the binding
    // '*' means use the current frame (which we specify via --thread/--frame)
    let command;

    if (this.threadId != null && this.frameIndex != null) {
      command = `var-create --thread ${this.threadId} --frame ${this.frameIndex} - * ${expression}`;
    } else {
      command = `var-create - @ ${expression}`;
    }

    const result = await this._client.sendCommand(command);

    if (result.error) {
      throw new Error(`Error creating variable binding (${(0, _MITypes().toCommandError)(result).msg})`);
    }

    const varResult = (0, _MITypes().varCreateResult)(result);
    this._varName = varResult.name;
    this._childCount = parseInt(varResult.numchild, 10);
    return varResult.name;
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

}

exports.default = VariableReference;