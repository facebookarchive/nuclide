'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var service = new (require('./LocalArcanistBaseService'))();

function findArcConfigDirectory(fileName: string): Promise<?string> {
  return service.findArcConfigDirectory(fileName);
}

function readArcConfig(fileName: string): Promise<?Object> {
  return service.readArcConfig(fileName);
}

function findArcProjectIdOfPath(fileName: string): Promise<?string> {
  return service.findArcProjectIdOfPath(fileName);
}

function getProjectRelativePath(fileName: string): Promise<?string> {
  return service.getProjectRelativePath(fileName);
}

module.exports = {
  findArcConfigDirectory,
  readArcConfig,
  findArcProjectIdOfPath,
  getProjectRelativePath,
};
