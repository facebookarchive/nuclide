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
  StringType,
  NumberType,
  BooleanType,
  AnyType,
  NamedType,
} from './types';

export const anyType: AnyType = {
  kind: 'any',
};

export const stringType: StringType = {
  kind: 'string',
};

export const booleanType: BooleanType = {
  kind: 'boolean',
};

export const numberType: NumberType = {
  kind: 'number',
};

export const dateType: NamedType = {
  kind: 'named',
  name: 'Date',
};

export const regExpType: NamedType = {
  kind: 'named',
  name: 'RegExp',
};

export const bufferType: NamedType = {
  kind: 'named',
  name: 'Buffer',
};

export const fsStatsType: NamedType = {
  kind: 'named',
  name: 'fs.Stats',
};
