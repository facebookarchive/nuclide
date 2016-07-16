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
import nuclideUri from '../../nuclide-remote-uri';
import {mkdir} from './tempdir';
import {asyncLimit} from '../../commons-node/promise';
import fsPromise from '../../commons-node/fsPromise';

/**
 * When called from a file in a spec/ directory that has a subdirectory named fixtures/, it copies
 * the specified subdirectory of fixtures into a temp directory. The temp directory will be deleted
 * automatically when the current process exits.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory that should be copied.
 * @param dirname The calling function should call `__dirname` as this argument. This should
 *   correspond to the spec/ directory with a fixtures/ subdirectory.
 */
export async function copyFixture(fixtureName: string, dirname: string): Promise<string> {
  const tempDir = await mkdir(fixtureName);

  // Recursively copy the contents of the fixture to the temp directory.
  await new Promise((resolve, reject) => {
    const sourceDirectory = nuclideUri.join(dirname, 'fixtures', fixtureName);
    fse.copy(sourceDirectory, tempDir, (err: ?Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return tempDir;
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
  const MAX_CONCURRENT_FILE_OPS = 100;
  const tempDir = await mkdir(fixtureName);

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
