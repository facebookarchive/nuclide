/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

export type CqueryProjectWithCompilationDb = {
  hasCompilationDb: true,
  compilationDbDir: string,
  flagsFile: string,
  projectRoot: string,
};
export type CqueryProjectWithoutCompilationDb = {
  hasCompilationDb: false,
  defaultFlags: ?Array<string>,
  projectRoot: string,
};

export type CqueryProject =
  | CqueryProjectWithCompilationDb
  | CqueryProjectWithoutCompilationDb;

export type CqueryProjectKey = string;
