'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Location,
  BuiltinLocation,
  StringType,
  NumberType,
  BooleanType,
  AnyType,
  NamedType,
} from './types';

export const builtinLocation: BuiltinLocation = {
  type: 'builtin',
};

export function locationToString(location: Location): string {
  switch (location.type) {
    case 'source':
      return `${location.fileName}(${location.line})`;
    case 'builtin':
      return '<builtin>';
    default:
      throw new Error('Bad location type');
  }
}

export const anyType: AnyType = {
  location: builtinLocation,
  kind: 'any',
};

export const stringType: StringType = {
  location: builtinLocation,
  kind: 'string',
};

export const booleanType: BooleanType = {
  location: builtinLocation,
  kind: 'boolean',
};

export const numberType: NumberType = {
  location: builtinLocation,
  kind: 'number',
};

export const dateType: NamedType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Date',
};

export const regExpType: NamedType = {
  location: builtinLocation,
  kind: 'named',
  name: 'RegExp',
};

export const bufferType: NamedType = {
  location: builtinLocation,
  kind: 'named',
  name: 'Buffer',
};

export const fsStatsType: NamedType = {
  location: builtinLocation,
  kind: 'named',
  name: 'fs.Stats',
};

export const namedBuiltinTypes: Set<string> = new Set();

namedBuiltinTypes.add(dateType.name);
namedBuiltinTypes.add(regExpType.name);
namedBuiltinTypes.add(bufferType.name);
namedBuiltinTypes.add(fsStatsType.name);
