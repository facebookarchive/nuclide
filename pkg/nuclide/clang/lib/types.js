'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {ClangDeclarationTypes} = require('./main');

export type Declaration = {
  name: string,
  type: $Enum<typeof ClangDeclarationTypes>,
  cursor_usr: ?string,
  file: ?NuclideUri,
};

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
export type DeclarationInfo = {
  file: NuclideUri,
  line: number,
  column: number,
  info: Array<Declaration>,
};

export type NuclideUri = string;
