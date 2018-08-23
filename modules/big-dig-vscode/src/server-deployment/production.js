"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.packageVersion = packageVersion;
exports.createServerPackage = createServerPackage;
exports.createProductionZip = createProductionZip;
exports.patchPackageVersion = patchPackageVersion;

var path = _interopRequireWildcard(require("path"));

function _admZip() {
  const data = _interopRequireDefault(require("adm-zip"));

  _admZip = function () {
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

function _server() {
  const data = require("./server");

  _server = function () {
    return data;
  };

  return data;
}

function zutil() {
  const data = _interopRequireWildcard(require("./zip-util"));

  zutil = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const logger = (0, _log4js().getLogger)('deploy');
const DEFAULT_FILENAME = path.resolve(__dirname, '../../resources/big-dig-vscode-server.zip');
/**
 * Attempts to get the version of the production server, first from an existing
 * zip archive, second by attempting to load the node module.
 * @return The version string of the server, or the empty string if a server
 * cannot be found.
 */

async function packageVersion(packageFilename = DEFAULT_FILENAME) {
  const pkg = (await getServerPackageFromZip(packageFilename)) || (await (0, _server().getServerPackage)()).info;

  if (pkg != null) {
    return pkg.version;
  } else {
    throw new Error('Cannot determine remote server version');
  }
}
/**
 * Creates a zip archive containing the server and all of its dependencies.
 * Patches the package's version with the specified version.
 */


async function createServerPackage(prodVersion, packageFilename = DEFAULT_FILENAME) {
  const pkg = await getServerPackageFromZip(packageFilename);

  if (pkg != null) {
    logger.info(`Found server package at ${packageFilename}; version ${pkg.version}`);
    return {
      version: pkg.version,
      filename: packageFilename
    };
  } else {
    logger.info('Creating full production package');
    let {
      version,
      files
    } = await (0, _server().packageServer)();

    if (prodVersion != null) {
      files = await patchPackageVersion(version, prodVersion, files);
      version = prodVersion;
    }

    return productionZip(packageFilename, version, files);
  }
}

async function createProductionZip(filename, version, files) {
  logger.info('Creating server package');
  const zip = new (_admZip().default)();
  await zutil().addFilesToZip(zip, files);
  logger.info('Saving server package');
  const buffer = await zutil().zipToBuffer(zip);
  zutil().saveZip(buffer, filename);
  return {
    version,
    data: buffer
  };
}
/**
 * Attempts to read the server's package.json from the production zip. If not
 * available, then this will return null,
 */


async function getServerPackageFromZip(packageFilename) {
  if (!(await zutil().zipExists(packageFilename))) {
    logger.warn(`Big-dig server package does not exist: ${packageFilename}`);
    return null;
  }

  try {
    const zip = new (_admZip().default)(packageFilename);
    const data = await zutil().zipEntryData(zip.getEntry('package.json'));
    const pkg = JSON.parse(data.toString('utf8'));
    return pkg;
  } catch (error) {
    logger.warn(`Cannot load server package info from ${packageFilename}`);
    return null;
  }
}

async function productionZip(filename, version, files) {
  if (!(await zutil().zipExists(filename))) {
    return createProductionZip(filename, version, files);
  }

  return {
    version,
    filename
  };
}
/**
 * Returns the server package files, but with the server's version in
 * package.json changed to `newVersion`.
 * @param version production version; must match the original version
 * @param newVersion new version; will replace the original
 * @param files patched files; all but the server's package.json will remain
 * unchanged.
 */


async function patchPackageVersion(version, newVersion, files) {
  const server = await (0, _server().getServerPackage)();

  if (!(server.info.version === version)) {
    throw new Error("Invariant violation: \"server.info.version === version\"");
  }

  server.info.version = newVersion;

  function patchVersion(file) {
    if (file.src !== server.getPackageFile()) {
      return file;
    }

    return {
      src: file.src,
      dst: file.dst,
      data: () => Promise.resolve(new Buffer(JSON.stringify(server.info), 'utf8')),
      alwaysInclude: true
    };
  }

  try {
    return files.map(patchVersion);
  } catch (error) {
    logger.error(`Could not update version ${version} to ${newVersion} in server's package.json.`);
    return files;
  }
}