Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var builtinLocation = {
  type: 'builtin'
};

exports.builtinLocation = builtinLocation;
var voidType = {
  location: builtinLocation,
  kind: 'void'
};

exports.voidType = voidType;
var anyType = {
  location: builtinLocation,
  kind: 'any'
};

exports.anyType = anyType;
var mixedType = {
  location: builtinLocation,
  kind: 'mixed'
};

exports.mixedType = mixedType;
var stringType = {
  location: builtinLocation,
  kind: 'string'
};

exports.stringType = stringType;
var booleanType = {
  location: builtinLocation,
  kind: 'boolean'
};

exports.booleanType = booleanType;
var numberType = {
  location: builtinLocation,
  kind: 'number'
};

exports.numberType = numberType;
var objectType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Object'
};

exports.objectType = objectType;
var dateType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Date'
};

exports.dateType = dateType;
var regExpType = {
  location: builtinLocation,
  kind: 'named',
  name: 'RegExp'
};

exports.regExpType = regExpType;
var bufferType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Buffer'
};

exports.bufferType = bufferType;
var fsStatsType = {
  location: builtinLocation,
  kind: 'named',
  name: 'fs.Stats'
};

exports.fsStatsType = fsStatsType;
var namedBuiltinTypes = new Set();

exports.namedBuiltinTypes = namedBuiltinTypes;
namedBuiltinTypes.add(objectType.name);
namedBuiltinTypes.add(dateType.name);
namedBuiltinTypes.add(regExpType.name);
namedBuiltinTypes.add(bufferType.name);
namedBuiltinTypes.add(fsStatsType.name);