'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _MIDebugSession;













function _load_MIDebugSession() {return _MIDebugSession = require('./MIDebugSession');}var _MITypes;

function _load_MITypes() {return _MITypes = require('./MITypes');}var _MIProxy;








function _load_MIProxy() {return _MIProxy = _interopRequireDefault(require('./MIProxy'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
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

  getVariables(start, count) {return (0, _asyncToGenerator.default)(function* () {
      throw new Error(
      'Base class VariableReference.getVariables called (abstract method)');})();

  }

  // typeClass describes what type of container the variable's type is
  // simple variables are not containers
  // named variables have named members: struct, union, class
  // indexed variables are native arrays and pointers
  getTypeClass(value) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      // it would seem to make sense to infer the type class from the actual
      // type. but that doesn't work, because the actual type may be a typedef,
      // and that's what MI will return. we can't recover the underlying type
      // from just the typedef name (there is a way in gdb but it's not exposed,
      // and in any case is more complicated than this.)
      if (_this._typeClass != null) {
        return _this._typeClass;
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
          const children = yield _this.getChildCount();

          // if the value is not formatted as a struct or array, and children
          // are available, then it's a pointer (which we treat as an array)
          if (children > 0) {
            type = 'indexed';
          }
        }
      }

      _this._typeClass = type;
      return type;})();
  }

  getType() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this2._type != null) {
        return _this2._type;
      }

      const varName = yield _this2._getVarName();
      const result = yield _this2._client.sendCommand(`var-info-type ${varName}`);
      if (result.error) {
        throw new Error(
        `Error determining variable's type (${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg})`);

      }

      _this2._type = (0, (_MITypes || _load_MITypes()).varInfoTypeResult)(result).type;
      return _this2._type;})();
  }

  // The value of a container variable is a summary of the value
  // of its contents.
  getValue() {var _this3 = this;return (0, _asyncToGenerator.default)(function* () {
      const varName = yield _this3._getVarName();
      const result = yield _this3._client.sendCommand(
      `var-evaluate-expression ${varName}`);


      if (result.error) {
        throw new Error(
        `Error determining variable's value (${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg})`);

      }

      return (0, (_MITypes || _load_MITypes()).varEvaluateExpressionResult)(result).value;})();
  }

  getChildCount() {var _this4 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this4._childCount != null) {
        return _this4._childCount;
      }

      const varName = yield _this4._getVarName();

      // If we had to create the var name, we will have gotten the child count
      // as a side effect
      if (_this4._childCount != null) {
        return _this4._childCount;
      }

      // otherwise, we have to ask
      const result = yield _this4._client.sendCommand(
      `var-info-num-children ${varName}`);

      if (result.error) {
        throw new Error(
        `Error determining the number of children (${
        (0, (_MITypes || _load_MITypes()).toCommandError)(result).msg
        })`);

      }

      const childCountStr = (0, (_MITypes || _load_MITypes()).varInfoNumChildrenResult)(result).numchild;if (!(
      childCountStr != null)) {throw new Error('Invariant violation: "childCountStr != null"');}

      const childCount = parseInt(childCountStr, 10);
      _this4._childCount = childCount;

      return childCount;})();
  }

  setChildValue(name, value) {var _this5 = this;return (0, _asyncToGenerator.default)(function* () {
      const varname = yield _this5._getVarName();
      const childrenResult = yield _this5._client.sendCommand(
      `var-list-children ${varname}`);

      if (childrenResult.error) {
        throw new Error(
        `Error getting the children of ${varname} ${
        (0, (_MITypes || _load_MITypes()).toCommandError)(childrenResult).msg
        }`);

      }

      const children = (0, (_MITypes || _load_MITypes()).varListChildrenResult)(childrenResult);
      const child = children.children.find(function (_) {return _.child.exp === name;});
      if (child == null) {
        throw new Error(`Cannot find variable ${name} to modify`);
      }

      const assignResult = yield _this5._client.sendCommand(
      `var-assign ${child.child.name} ${value}`);

      if (assignResult.error) {
        throw new Error(
        `Unable to set ${name} to {$value}: ${
        (0, (_MITypes || _load_MITypes()).toCommandError)(assignResult).msg
        }`);

      }

      const assign = (0, (_MITypes || _load_MITypes()).varAssignResult)(assignResult);

      return {
        value: assign.value,
        type: child.child.type,
        variablesReference: 0 };})();

  }

  deleteResources() {var _this6 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this6.needsDeletion && _this6._varName != null) {
        const result = yield _this6._client.sendCommand(
        `var-delete ${_this6._varName}`);

        if (result.error) {
          // don't throw here, because we can still continue safely, but log the error.
          (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(`Error deleting variable ${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg}`);
        }
      }})();
  }

  get qualifiedName() {
    throw new Error(
    'Base class VariableReference.getQualifiedName called (abstract method)');

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

  variableFromVarRefHandle(
  handle,
  name,
  type)
  {var _this7 = this;return (0, _asyncToGenerator.default)(function* () {
      const varref = _this7._variables.getVariableReference(handle);if (!(
      varref != null)) {throw new Error('Invariant violation: "varref != null"');}

      const value = yield varref.getValue();
      const typeClass = yield varref.getTypeClass(value);

      const resolvedType = type == null ? yield varref.getType() : type;

      (0, (_MIDebugSession || _load_MIDebugSession()).logVerbose)(
      `name ${name} type ${resolvedType} value ${value} typeClass ${typeClass}`);


      let variable = {
        name,
        value,
        type: resolvedType,
        variablesReference: 0 };


      if (typeClass !== 'simple') {
        const childCount = yield varref.getChildCount();

        if (typeClass === 'indexed') {
          variable = Object.assign({},
          variable, {
            indexedVariables: childCount,
            variablesReference: handle });

        } else if (typeClass === 'named') {
          variable = Object.assign({},
          variable, {
            namedVariables: childCount,
            variablesReference: handle });

        }
      }

      return variable;})();
  }

  _createVariableBinding(expression) {var _this8 = this;return (0, _asyncToGenerator.default)(function* () {
      // '-' means to let gdb create a unique name for the binding
      // '*' means use the current frame (which we specify via --thread/--frame)


      let command;
      if (_this8.threadId != null && _this8.frameIndex != null) {
        command = `var-create --thread ${_this8.threadId} --frame ${
        _this8.frameIndex
        } - * ${expression}`;
      } else {
        command = `var-create - @ ${expression}`;
      }

      const result = yield _this8._client.sendCommand(command);
      if (result.error) {
        throw new Error(
        `Error creating variable binding (${(0, (_MITypes || _load_MITypes()).toCommandError)(result).msg})`);

      }

      const varResult = (0, (_MITypes || _load_MITypes()).varCreateResult)(result);
      _this8._varName = varResult.name;
      _this8._childCount = parseInt(varResult.numchild, 10);

      return varResult.name;})();
  }

  _getVarName() {var _this9 = this;return (0, _asyncToGenerator.default)(function* () {
      if (_this9._varName != null) {
        return _this9._varName;
      }

      yield _this9._createVariableBinding(_this9._expression);
      const varName = _this9._varName;if (!(
      varName != null)) {throw new Error('Invariant violation: "varName != null"');}

      return varName;})();
  }}exports.default = VariableReference;