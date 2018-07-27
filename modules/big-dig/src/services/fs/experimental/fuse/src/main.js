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

/* eslint-disable */
/* eslint no-console: 0 */

import {MountedFileSystem} from './MountedFileSystem';

const remoteRoot = process.argv[2];
const localMountPoint = process.argv[3];
const port = process.argv[4];

async function main() {
  try {
    await MountedFileSystem.create(
      remoteRoot,
      localMountPoint,
      parseInt(port, 10),
    );
  } catch (e) {
    console.error(e);
  }
}

main();
