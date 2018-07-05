/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import * as pathModule from 'path';
import fs from 'nuclide-commons/fsPromise';
import {asyncLimit} from 'nuclide-commons/promise';

export type Directory = {
  [name: string]: FileOrDirectory,
};
export type FileOrDirectory = Directory | string;

/**
 * Creates the given directories and files.
 * @return the filesystem, but with names mapped to absolute paths.
 */
export async function createFileHierarchy<T: Directory>(
  filesystem: T,
  base: string,
): Promise<T> {
  const result = {
    toString() {
      return base;
    },
  };

  await asyncLimit(Object.keys(filesystem), 100, async name => {
    const absName = pathModule.join(base, name);
    const value = filesystem[name];
    if (typeof value === 'string') {
      await fs.writeFile(absName, value);
      result[name] = absName;
    } else {
      await fs.mkdir(absName);
      const dir = await createFileHierarchy(value, absName);
      result[name] = dir;
    }
  });
  return (result: any);
}
