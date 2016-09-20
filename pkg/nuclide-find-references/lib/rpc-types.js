'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

export type Location = {
  line: number,
  column: number,
};

export type Reference = {
  uri: NuclideUri,      // Nuclide URI of the file path
  name: ?string,    // name of calling method/function/symbol
  start: Location,
  end: Location,
};

export type FindReferencesData = {
  type: 'data',
  baseUri: NuclideUri,
  referencedSymbolName: string,
  references: Array<Reference>,
};

export type FindReferencesError = {
  type: 'error',
  message: string,
};

export type FindReferencesReturn = FindReferencesData | FindReferencesError;
