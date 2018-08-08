"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.devInit = devInit;
exports.serverPackageZipVersion = serverPackageZipVersion;
exports.packageServerZip = packageServerZip;

function prodZip() {
  const data = _interopRequireWildcard(require("./production"));

  prodZip = function () {
    return data;
  };

  return data;
}

function devZip() {
  const data = _interopRequireWildcard(require("./development"));

  devZip = function () {
    return data;
  };

  return data;
}

function _dev() {
  const data = require("../dev");

  _dev = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const logger = (0, _log4js().getLogger)('deploy');
/**
 * In case modules are only loaded on demand, call `init` to start background tasks.
 */

function devInit() {
  devZip().init();
}
/**
 * @return The version string of the server.
 */


async function serverPackageZipVersion() {
  if (_dev().__DEV__) {
    try {
      return await devZip().packageVersion();
    } catch (error) {}
  }

  return prodZip().packageVersion();
}
/**
 * Creates a zip archive containing the server and all of its dependencies.
 */


async function packageServerZip(existingVersion) {
  if (_dev().__DEV__) {
    logger.info('Preparing server package for deployment [DEV]');

    try {
      return await devZip().createServerPackage(existingVersion);
    } catch (error) {
      /* fall through */
    }

    logger.warn('Could not generate development delta package; creating full package');
  } else {
    logger.info('Preparing server package for deployment');
  }

  return prodZip().createServerPackage();
}