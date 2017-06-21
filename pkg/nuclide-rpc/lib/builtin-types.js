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
    * @format
    */

const voidType = exports.voidType = {
  kind: 'void'
};

const anyType = exports.anyType = {
  kind: 'any'
};

const mixedType = exports.mixedType = {
  kind: 'mixed'
};

const stringType = exports.stringType = {
  kind: 'string'
};

const booleanType = exports.booleanType = {
  kind: 'boolean'
};

const numberType = exports.numberType = {
  kind: 'number'
};

const objectType = exports.objectType = {
  kind: 'named',
  name: 'Object'
};

const dateType = exports.dateType = {
  kind: 'named',
  name: 'Date'
};

const regExpType = exports.regExpType = {
  kind: 'named',
  name: 'RegExp'
};

const bufferType = exports.bufferType = {
  kind: 'named',
  name: 'Buffer'
};

const fsStatsType = exports.fsStatsType = {
  kind: 'named',
  name: 'fs.Stats'
};

const namedBuiltinTypes = exports.namedBuiltinTypes = [objectType.name, dateType.name, regExpType.name, bufferType.name, fsStatsType.name];