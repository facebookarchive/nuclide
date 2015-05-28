'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* @flow */

var fs = require('fs');
var path = require('path');

const TEST_VERSION = 'test-version';
var version;

function getVersion(): string {
  if (!version) {
    try {
      // Cannot use require() who counts on extension (.json) for parsing file as json.
      var json = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../version.json')));
      version = json.Version.toString();
    } catch (e) {
      version = TEST_VERSION;
      // No VERSION_INFO file, no version. e.g. in your development env.
    }
  }
  return version;
}

module.exports = {
  getVersion,
}
