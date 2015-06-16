'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Currently a file can either export types, or have a module.exports; i.e.
// they are mutually exclusive. (https://github.com/facebook/flow/issues/267#issuecomment-97125050)
// Thus we put all type definitions in this file, which must not have a module.exports.

/**
 * @param workingDirectory The path of the working directory of this repository.
 * Note: this should be a local path, not a URI (e.g. a URI used to represent a
 * remote directory.
 */
export type LocalHgServiceOptions = {
  workingDirectory: string;
};
