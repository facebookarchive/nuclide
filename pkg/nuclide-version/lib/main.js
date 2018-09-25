"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVersion = getVersion;

function _package() {
  const data = require("../../../modules/nuclide-commons/package");

  _package = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
let version;
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
 * bump the version in package.json. This includes any client changes
 * (new feature or whatever) that do not work with the older servers.
 * It also includes server changes that break older clients.
 */

function getVersion() {
  if (!version) {
    // Don't use require() because it may be reading from the module cache.
    // Do use require.resolve so the paths can be codemoded in the future.
    const packageJsonPath = require.resolve("../../../package.json");

    version = (0, _package().getPackageMinorVersion)(packageJsonPath);
  }

  return version;
}