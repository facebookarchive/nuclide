"use strict";

function _MountedFileSystem() {
  const data = require("./MountedFileSystem");

  _MountedFileSystem = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* eslint-disable */

/* eslint no-console: 0 */
const remoteRoot = process.argv[2];
const localMountPoint = process.argv[3];
const port = process.argv[4];

async function main() {
  try {
    await _MountedFileSystem().MountedFileSystem.create(remoteRoot, localMountPoint, parseInt(port, 10));
  } catch (e) {
    console.error(e);
  }
}

main();