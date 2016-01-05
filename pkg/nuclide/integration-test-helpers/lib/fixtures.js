'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {absolute, existsSync, moveSync} from 'fs-plus';
import {fixtures} from '../../test-helpers';
import path from 'path';

/*
 * Copies a specified subdirectory of test-helpers/fixtures to a temporary location.  The
 * fixtureName parameter must contain a directory named .hg-rename.  After the directory specified
 * by fixtureName is copied, its .hg-rename folder will be renamed to .hg, so that it can act as a
 * mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.  Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */
export async function copyMercurialFixture(fixtureName: string): Promise<string> {
  const repo = await fixtures.copyFixture(fixtureName, path.join(__dirname, '../spec'));
  const pathToHg = path.join(repo, '.hg-rename');
  invariant(existsSync(pathToHg), `Directory: ${pathToHg} was not found.`);
  moveSync(pathToHg, path.join(repo, '.hg'));
  return absolute(repo);
}

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

/*
 * Copies a specified subdirectory of integration-test-helpers/fixtures to a temporary location.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.
 * @returns the path to the temporary directory that this function creates.
 */
export async function copyFixture(fixtureName: string): Promise<string> {
  const fixturePath = await fixtures.copyFixture(fixtureName, path.join(__dirname, '../spec'));
  return absolute(fixturePath);
}
