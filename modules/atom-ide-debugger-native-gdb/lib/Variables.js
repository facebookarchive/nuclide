"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _HandleMap() {
  const data = _interopRequireDefault(require("./HandleMap"));

  _HandleMap = function () {
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

function _ExpressionVariableReference() {
  const data = _interopRequireDefault(require("./ExpressionVariableReference"));

  _ExpressionVariableReference = function () {
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

function _NestedVariableReference() {
  const data = _interopRequireDefault(require("./NestedVariableReference"));

  _NestedVariableReference = function () {
    return data;
  };

  return data;
}

function _RegisterElementVariableReference() {
  const data = _interopRequireDefault(require("./RegisterElementVariableReference"));

  _RegisterElementVariableReference = function () {
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

function _ScopeVariableReference() {
  const data = _interopRequireDefault(require("./ScopeVariableReference"));

  _ScopeVariableReference = function () {
    return data;
  };

  return data;
}

function _StackFrames() {
  const data = _interopRequireDefault(require("./StackFrames"));

  _StackFrames = function () {
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
 *  strict-local
 * @format
 */
class Variables {
  // by thread, then frame index
  // by thread, frame index, varname
  // by register expression
  constructor(client, frames) {
    this._client = client;
    this._frames = frames;
    this._variables = new (_HandleMap().default)();
    this._scopeIndex = new Map();
    this._nestedReferenceIndex = new Map();
    this._registerElementReferenceIndex = new Map();
    this._varsNeedingDeletion = new Set();
  }

  async clearCachedVariables() {
    await Promise.all([...this._varsNeedingDeletion].map(async _ => _.deleteResources()));

    this._varsNeedingDeletion.clear();

    this._variables.clear();

    this._scopeIndex.clear();

    this._nestedReferenceIndex.clear();

    this._registerElementReferenceIndex.clear();

    this._registersVariableReference = null;
  }

  variableReferenceForStackFrame(frameId) {
    const frame = this._frames.stackFrameByHandle(frameId);

    if (frame == null) {
      throw new Error(`Attempt to find or create varref for unknown stack frame ${frameId}`);
    }

    let threadMap = this._scopeIndex.get(frame.threadId);

    if (threadMap == null) {
      threadMap = new Map();

      this._scopeIndex.set(frame.threadId, threadMap);
    }

    let varref = threadMap.get(frame.frameIndex);

    if (varref == null) {
      const scopeVarRef = new (_ScopeVariableReference().default)(this._client, this, frame.threadId, frame.frameIndex);
      varref = this._variables.put(scopeVarRef);
      threadMap.set(frame.frameIndex, varref);
    }

    return varref;
  }

  registersVariableReference() {
    if (this._registersVariableReference != null) {
      return this._registersVariableReference;
    }

    const varref = this._variables.put(new (_RegistersVariableReference().default)(this._client, this));

    this._registersVariableReference = varref;
    return varref;
  }

  registerElementVariableReference(value, name, expression) {
    let varref = this._registerElementReferenceIndex.get(expression);

    if (varref == null) {
      varref = this._variables.put(new (_RegisterElementVariableReference().default)(this._client, this, name, expression, value));
    }

    return varref;
  }

  nestedVariableReference(container, exp, name) {
    const resolvedThreadId = container.threadId == null ? -1 : container.threadId;
    const resolvedFrameIndex = container.frameIndex == null ? -1 : container.frameIndex;

    let threadMap = this._nestedReferenceIndex.get(resolvedThreadId);

    if (threadMap == null) {
      threadMap = new Map();

      this._nestedReferenceIndex.set(resolvedThreadId, threadMap);
    }

    let frameMap = threadMap.get(resolvedFrameIndex);

    if (frameMap == null) {
      frameMap = new Map();
      threadMap.set(resolvedFrameIndex, frameMap);
    }

    const key = `${container.qualifiedName}.${exp}`;
    let handle = frameMap.get(key);

    if (handle != null) {
      return handle;
    }

    const varref = new (_NestedVariableReference().default)(this._client, this, container, exp, name);

    if (varref.needsDeletion) {
      this._varsNeedingDeletion.add(varref);
    }

    handle = this._variables.put(varref);
    frameMap.set(key, handle);
    return handle;
  }

  expressionVariableReference(threadId, frameIndex, expression) {
    const resolvedThreadId = threadId == null ? -1 : threadId;
    const resolvedFrameIndex = frameIndex == null ? -1 : frameIndex;

    let threadMap = this._nestedReferenceIndex.get(resolvedThreadId);

    if (threadMap == null) {
      threadMap = new Map();

      this._nestedReferenceIndex.set(resolvedThreadId, threadMap);
    }

    let frameMap = threadMap.get(resolvedFrameIndex);

    if (frameMap == null) {
      frameMap = new Map();
      threadMap.set(resolvedFrameIndex, frameMap);
    }

    const key = `eval.${expression}`;
    let handle = frameMap.get(key);

    if (handle != null) {
      return handle;
    }

    const varref = new (_ExpressionVariableReference().default)(this._client, this, threadId, frameIndex, expression);

    if (varref.needsDeletion) {
      this._varsNeedingDeletion.add(varref);
    }

    handle = this._variables.put(varref);
    frameMap.set(key, handle);
    return handle;
  }

  getVariableReference(handle) {
    return this._variables.getObjectByHandle(handle);
  }

  async getVariables(varrefHandle, start, count) {
    const varref = this._variables.getObjectByHandle(varrefHandle);

    if (varref == null) {
      throw new Error(`Attempt to access invalid varref ${varrefHandle}`);
    }

    return varref.getVariables(start, count);
  }

}

exports.default = Variables;