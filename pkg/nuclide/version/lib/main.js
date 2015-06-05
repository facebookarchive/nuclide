'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');

const TEST_VERSION = 'test-version';
var version;

/*
 * This is the versioning of Nuclide client-server protocol.
 * It is not a communication protocol per se. It is the sum of communication and
 * services API.
 *
 * First, no commit shall break the protocol in that client and server
 * from the same master shall always work with each other.
 * That means, no client new feature shall be enabled before the dependent
 * server serice is in place, while it is OK to add a new server service before
 * the client is ready.
 *
 * Rule number two. Every commit that breaks the backward compatibility shall
 * bump the version in version.json. This includes any client changes
 * (new feature or whatever) that do not work with the older servers.
 * It also includes server changes that break older clients.
 */
function getVersion(): string {
  if (!version) {
    try {
      // TODO: The reason we are using version.json file is for our Python
      // server scripts to read and parse. We shall at one point rewrite our
      // Python scripts in Node, and then we can hard code the version in code,
      // instead of reading from the json file.
      //
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
