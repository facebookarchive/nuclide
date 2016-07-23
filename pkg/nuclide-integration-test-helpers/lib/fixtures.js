'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Set the project.  If there are one or more projects set previously, this replaces them all with
 * the one(s) provided as the argument `projectPath`.
 */
export function setLocalProject(projectPath: string | Array<string>): void {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}
