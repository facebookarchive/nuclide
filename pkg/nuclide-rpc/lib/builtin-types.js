'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const builtinLocation = exports.builtinLocation = {
  type: 'builtin'
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    */

const voidType = exports.voidType = {
  location: builtinLocation,
  kind: 'void'
};

const anyType = exports.anyType = {
  location: builtinLocation,
  kind: 'any'
};

const mixedType = exports.mixedType = {
  location: builtinLocation,
  kind: 'mixed'
};

const stringType = exports.stringType = {
  location: builtinLocation,
  kind: 'string'
};

const booleanType = exports.booleanType = {
  location: builtinLocation,
  kind: 'boolean'
};

const numberType = exports.numberType = {
  location: builtinLocation,
  kind: 'number'
};

const objectType = exports.objectType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Object'
};

const dateType = exports.dateType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Date'
};

const regExpType = exports.regExpType = {
  location: builtinLocation,
  kind: 'named',
  name: 'RegExp'
};

const bufferType = exports.bufferType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Buffer'
};

const fsStatsType = exports.fsStatsType = {
  location: builtinLocation,
  kind: 'named',
  name: 'fs.Stats'
};

const namedBuiltinTypes = exports.namedBuiltinTypes = [objectType.name, dateType.name, regExpType.name, bufferType.name, fsStatsType.name];