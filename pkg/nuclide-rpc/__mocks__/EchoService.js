"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.echoAny = echoAny;
exports.echoString = echoString;
exports.echoNumber = echoNumber;
exports.echoBoolean = echoBoolean;
exports.echoDefaultNumber = echoDefaultNumber;
exports.echoVoid = echoVoid;
exports.echoDate = echoDate;
exports.echoRegExp = echoRegExp;
exports.echoBuffer = echoBuffer;
exports.echoArrayOfArrayOfDate = echoArrayOfArrayOfDate;
exports.echoObject = echoObject;
exports.echoSet = echoSet;
exports.echoMap = echoMap;
exports.echoTuple = echoTuple;
exports.echoValueType = echoValueType;
exports.echoNuclideUri = echoNuclideUri;
exports.echoRemotableObject = echoRemotableObject;
exports.RemotableObject = void 0;

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// Basic Primitives.
async function echoAny(arg) {
  return arg;
}

async function echoString(arg) {
  (0, _assert.default)(typeof arg === 'string', `Argument to echoString must be a string, not ${typeof arg}.`);
  return arg;
}

async function echoNumber(arg) {
  (0, _assert.default)(typeof arg === 'number', `Argument to echoNumber must be a number, not ${typeof arg}.`);
  return arg;
}

async function echoBoolean(arg) {
  (0, _assert.default)(typeof arg === 'boolean', `Argument to echoBoolean must be a boolean, not ${typeof arg}.`);
  return arg;
}

async function echoDefaultNumber(arg = 1) {
  return arg;
}

async function echoVoid(arg) {
  (0, _assert.default)(arg === undefined, 'Argument to echoVoid must be undefined');
  return arg;
} // More Complex Objects.


async function echoDate(arg) {
  (0, _assert.default)(arg instanceof Date, 'Argument to echoDate must be a Date.');
  return arg;
}

async function echoRegExp(arg) {
  (0, _assert.default)(arg instanceof RegExp, // $FlowFixMe
  `Argument to echoRegExp must be a RegExp. Not ${arg.constructor}`);
  return arg;
}

async function echoBuffer(arg) {
  (0, _assert.default)(arg instanceof Buffer, // $FlowFixMe
  `Argument to echoBuffer must be a Buffer. Not ${arg.constructor}`);
  return arg;
} // Parameterized types.


async function echoArrayOfArrayOfDate(arg) {
  return arg;
}

async function echoObject(arg) {
  return arg;
}

async function echoSet(arg) {
  return arg;
}

async function echoMap(arg) {
  return arg;
}

async function echoTuple(arg) {
  return arg;
} // Value Type


async function echoValueType(arg) {
  return arg;
} // NuclideUri


async function echoNuclideUri(arg) {
  return arg;
} // Remotable object


class RemotableObject {
  dispose() {}

}

exports.RemotableObject = RemotableObject;

async function echoRemotableObject(arg) {
  return arg;
}