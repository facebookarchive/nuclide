'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type Options = {
  builtIns: Set<string>,
  builtInTypes: Set<string>,
  commonAliases: Map<string, string>,
};

export type ExternalOptions = {
  builtIns?: ?Array<string>,
  builtInBlacklist?: ?Array<string>,
  builtInTypes?: ?Array<string>,
  builtInTypeBlacklist?: ?Array<string>,
  commonAliases?: ?Array<string>,
};
