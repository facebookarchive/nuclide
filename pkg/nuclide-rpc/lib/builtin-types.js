"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.namedBuiltinTypes = exports.fsStatsType = exports.bufferType = exports.regExpType = exports.dateType = exports.objectType = exports.numberType = exports.booleanType = exports.stringType = exports.mixedType = exports.anyType = exports.voidType = exports.builtinLocation = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
const builtinLocation = {
  type: 'builtin'
};
exports.builtinLocation = builtinLocation;
const voidType = {
  kind: 'void'
};
exports.voidType = voidType;
const anyType = {
  kind: 'any'
};
exports.anyType = anyType;
const mixedType = {
  kind: 'mixed'
};
exports.mixedType = mixedType;
const stringType = {
  kind: 'string'
};
exports.stringType = stringType;
const booleanType = {
  kind: 'boolean'
};
exports.booleanType = booleanType;
const numberType = {
  kind: 'number'
};
exports.numberType = numberType;
const objectType = {
  kind: 'named',
  name: 'Object'
};
exports.objectType = objectType;
const dateType = {
  kind: 'named',
  name: 'Date'
};
exports.dateType = dateType;
const regExpType = {
  kind: 'named',
  name: 'RegExp'
};
exports.regExpType = regExpType;
const bufferType = {
  kind: 'named',
  name: 'Buffer'
};
exports.bufferType = bufferType;
const fsStatsType = {
  kind: 'named',
  name: 'fs.Stats'
};
exports.fsStatsType = fsStatsType;
const namedBuiltinTypes = [objectType.name, dateType.name, regExpType.name, bufferType.name, fsStatsType.name];
exports.namedBuiltinTypes = namedBuiltinTypes;