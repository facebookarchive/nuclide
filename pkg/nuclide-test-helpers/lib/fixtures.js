'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import fse from 'fs-extra';
import temp from 'temp';
import invariant from 'assert';

import fsPromise from '../../commons-node/fsPromise';
import nuclideUri from '../../nuclide-remote-uri';
import {asyncLimit} from '../../commons-node/promise';

/**
 * Traverses up the parent directories looking for `fixtures/FIXTURE_NAME`.
 * When found, it's copied to $TMP. Example:
 *
 *    const fixtureDir = await copyFixture('foo', __dirname)
 *
 *    1. Starts looking for `fixtures/foo` in `__dirname`, going up the parent
 *       until it's found.
 *    2. Copies `__dirname/fixtures/foo` to `$TMP/random-foo-temp-name`.
 *
 * When the process exists, the temporary directory is removed.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory
 * that should be copied.
 * @param startDir The calling function should call `__dirname` as this argument.
 * This should correspond to the spec/ directory with a fixtures/ subdirectory.
 * @returns the path to the temporary directory.
 */
export async function copyFixture(
  fixtureName: string,
  startDir: string,
): Promise<string> {
  const fixturePath = nuclideUri.join('fixtures', fixtureName);
  const fixtureRoot = await fsPromise.findNearestFile(fixturePath, startDir);
  invariant(fixtureRoot != null, 'Could not find source fixture.');
  const sourceDir = nuclideUri.join(fixtureRoot, fixturePath);

  temp.track();
  const tempDir = await fsPromise.tempdir(fixtureName);
  const realTempDir = await fsPromise.realpath(tempDir);

  // Recursively copy the contents of the fixture to the temp directory.
  await new Promise((resolve, reject) => {
    fse.copy(sourceDir, realTempDir, (err: ?Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return realTempDir;
}

/*
 * Copies a specified subdirectory of `spec/fixtures` to a temporary
 * location. The `fixtureName` parameter must contain a directory named
 * `.hg-rename`. After the directory specified by `fixtureName` is copied, its
 * `.hg-rename` folder will be renamed to `.hg`, so that it can act as a
 * mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the `fixtures/` directory.
 * Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */
export async function copyMercurialFixture(
  fixtureName: string,
  source: string,
): Promise<string> {
  const repo = await copyFixture(fixtureName, source);

  const pathToFakeHg = nuclideUri.join(repo, '.hg-rename');
  const pathToRealHg = nuclideUri.join(repo, '.hg');
  invariant(fs.existsSync(pathToFakeHg), `Directory: ${pathToFakeHg} was not found.`);

  await new Promise((resolve, reject) => {
    fse.move(pathToFakeHg, pathToRealHg, (err: ?Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return repo;
}

/**
 * Takes of Map of file/file-content pairs, and creates a temp dir that matches
 * the file structure of the Map. Example:
 *
 * generateFixture('myfixture', new Map([
 *   ['foo.js'],
 *   ['bar/baz.txt', 'some text'],
 * ]));
 *
 * Creates:
 *
 * /tmp/myfixture_1/foo.js (empty file)
 * /tmp/myfixture_1/bar/baz.txt (with 'some text')
 */
export async function generateFixture(
  fixtureName: string,
  files: ?Map<string, ?string>,
): Promise<string> {
  temp.track();

  const MAX_CONCURRENT_FILE_OPS = 100;
  const tempDir = await fsPromise.tempdir(fixtureName);

  if (files == null) {
    return tempDir;
  }

  // Map -> Array with full paths
  const fileTuples = Array.from(files, tuple => {
    // It's our own array - it's ok to mutate it
    tuple[0] = nuclideUri.join(tempDir, tuple[0]);
    return tuple;
  });

  // Dedupe the dirs that we have to make.
  const dirsToMake = fileTuples
    .map(([filename]) => nuclideUri.dirname(filename))
    .filter((dirname, i, arr) => arr.indexOf(dirname) === i);

  await asyncLimit(
    dirsToMake,
    MAX_CONCURRENT_FILE_OPS,
    dirname => fsPromise.mkdirp(dirname),
  );

  await asyncLimit(
    fileTuples,
    MAX_CONCURRENT_FILE_OPS,
    ([filename, contents]) => {
      // We can't use fsPromise/fs-plus because it does too much extra work.
      // They call `mkdirp` before `writeFile`. We know that the target dir
      // exists, so we can optimize by going straight to `fs`. When you're
      // making 10k files, this adds ~500ms.
      return new Promise((resolve, reject) => {
        fs.writeFile(filename, contents || '', err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
  );

  return tempDir;
}
