'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIProxy;














function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}var _MITypes;
function _load_MITypes() {return _MITypes = require('./MITypes');}var _VariableReference;
function _load_VariableReference() {return _VariableReference = _interopRequireDefault(require('./VariableReference'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// A NestedVariableReference refers to a set of variables in another variable
// (struct, union, etc.)
class NestedVariableReference extends (_VariableReference || _load_VariableReference()).default {




  constructor(
  client,
  variables,
  container,
  expression, // exp is the expression in the source language naming the variable
  varName) // name is the internal gdb variable name, used to get the value
  {
    super({
      client,
      variables,
      expression,
      threadId: container.threadId,
      frameIndex: container.frameIndex,
      varName });

    // We will lazily create the variable binding to MI, so we only
    // have to do it for ones the user actually wants to drill into.
    this._qualifiedName = container.qualifiedName + '.' + expression;

    // if name is null, then we will lazily create a gdb varref which needs
    // to be cleaned up. if name is defined then the varref is already
    // created and whoever did that is responsible for deleting it.
    this._needsDeletion = varName == null;
  }

  getVariables(start, count) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this._varName == null) {
        yield _this._createVariableBinding(_this._expression);
      }

      const varName = _this._varName;if (!(
      varName != null)) {throw new Error('Invariant violation: "varName != null"');}

      // var-list-children -no-values name from to (zero-based, from 'from and up to and including 'to')
      const command = `var-list-children --no-values ${varName}`;
      const result = yield _this._client.sendCommand(command);

      if (result.error) {
        throw new Error(
        `Error getting variable's children (${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg})`);

      }

      const miVariables = (0, (_MITypes || _load_MITypes()).varListChildrenResult)(result).children;

      const resolvedStart = start == null ? 0 : start;
      const resolvedEnd =
      count == null ? miVariables.length - resolvedStart : start + count;

      return Promise.all(
      miVariables.slice(resolvedStart, resolvedEnd).map((() => {var _ref = (0, _asyncToGenerator.default)(function* (_) {
          const child = _.child;

          const handle = _this._variables.nestedVariableReference(_this,

          child.exp,
          child.name);


          return _this.variableFromVarRefHandle(handle, child.exp, child.type);
        });return function (_x) {return _ref.apply(this, arguments);};})()));})();

  }

  get needsDeletion() {
    return this._needsDeletion;
  }

  _getVarName() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this2._varName != null) {
        return _this2._varName;
      }

      yield _this2._createVariableBinding(_this2._expression);
      const varName = _this2._varName;if (!(
      varName != null)) {throw new Error('Invariant violation: "varName != null"');}

      return varName;})();
  }

  get qualifiedName() {
    return this._qualifiedName;
  }}exports.default = NestedVariableReference; /**
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