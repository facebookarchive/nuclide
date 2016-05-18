'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fsPromise from './fsPromise';

/*
 * Filters out paths that don't resolve to a valid path in the file system from the
 * key-val map object.
 */
export default async function filterPaths(paths: Object): Promise<Object> {
  const results = {};

  // Filter out non-existent paths.
  await Promise.all(Object.keys(paths).map(async key => {
    const path = paths[key];
    if (await fsPromise.exists(path)) {
      results[key] = path;
    }
  }));

  return results;
}
