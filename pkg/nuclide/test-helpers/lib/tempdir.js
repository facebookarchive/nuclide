'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import temp from 'temp';

// Automatically track and cleanup files at exit.
const tempWithAutoCleanup = temp.track();

/**
 * Creates a temporary directory with the given name.
 */
export function mkdir(dirname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    tempWithAutoCleanup.mkdir(dirname, (err: ?Error, dirPath) => {
     if (err) {
       reject(err);
     } else {
       resolve(dirPath);
     }
    });
  });
}
