"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.packageVersion = packageVersion;
exports.createServerPackage = createServerPackage;

var path = _interopRequireWildcard(require("path"));

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

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

var _os = _interopRequireDefault(require("os"));

function _server() {
  const data = require("./server");

  _server = function () {
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

function zutil() {
  const data = _interopRequireWildcard(require("./zip-util"));

  zutil = function () {
    return data;
  };

  return data;
}

function _production() {
  const data = require("./production");

  _production = function () {
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
const ASYNC_LIMIT = 100;
const logger = (0, _log4js().getLogger)('deploy');
/**
 * In development mode, we can expect frequent small changes to big-dig-vscode-server. Creating a full
 * deployment package upon connecting to the server will add time to the debugging/testing cycle.
 * Furthermore, the big-dig update mechanism will not detect that changes are needed without seeing
 * a version mismatch (and during production, the version is set to big-dig-vscode-server's version).
 *
 * Objectives:
 * 1. to make sure that changes to big-dig-vscode-server are immediately picked up, and
 * 2. to minimize the time the developer must wait for updates to be applied.
 *
 * Features:
 * 1. The package is created as a background task upon big-dig-vscode startup rather than
 *   waiting for big-dig to request an update.
 * 2. The version is tagged with the most recent modified-time of the files in the package. This
 *   means that big-dig will request an update whenever one of the server's files has changed.
 * 3. We attempt to create a delta of the changed files rather than transmitting the full package
 *   to big-dig. The delta is created w.r.t. the cached package at `cacheFilename`, which is updated
 *   whenever big-dig requests a package to install. But if big-dig requests an update to a
 *   different installed version, then we will fall back to sending the whole package. We will also
 *   fall back to this behavior if a delta cannot be created for various other reasons, like e.g.
 *   `cacheFilename` not existing or a file being removed.
 */

const cacheFilename = path.join(_os.default.tmpdir(), 'big-dig-vscode-server-dev.zip');
// Kick off creation of the server package right away if we're in dev mode.
const devZip = new (_promise().Deferred)(); // This is resolved halfway into `createDevZip` and should be equal to the
// version reported by `devZip`. (We want the version as soon as possible, so
// don't wait for the whole zip to be ready.)

const devZipVersion = new (_promise().Deferred)();
/**
 * In case modules are only loaded on demand, call `init` to initialize background startup tasks.
 *
 * If we're in development mode, this will begin the background task of generating a deployment
 * package.
 */

function init() {
  if (_dev().__DEV__) {
    createDevZip().then(result => devZip.resolve(result)).catch(err => logger.error('Could not create development package', err));
  } else {
    devZip.reject(new Error('Development-mode server package not available'));
  }
}
/**
 * @return The version string of the server.
 */


function packageVersion() {
  // TODO(siegebell): can this be sped up? It blocks the server-reconnection
  // process (we need to compare versions) in development mode and costs us a
  // few more seconds. On the other hand, there may not be much more we can do
  // to speed up the process of getting the most recent modified time for all
  // files in the server...
  return devZipVersion.promise;
}
/**
 * Appends the big-dig-vscode-server version with a development version -- which is a function of the
 * latest modified-time of the files that will appear in the server-deployment package.
 */


async function createVersionString(version, files) {
  const mtimes = await (0, _promise().asyncLimit)(files, ASYNC_LIMIT, async file => (await _fsPromise().default.stat(file.src)).mtime.valueOf());
  const mtime = Math.max(...mtimes);
  return `${version}-${mtime}`;
}
/**
 * Creates a server-deployment package zip (for use with big-dig) that will be applied to the
 * remote `existingVersion` installation (`null` if there is no preexisting installation). If we
 * were able to create a delta for `existingVersion`, it will be returned. Otherwise a full package
 * will be returned.
 */


async function createServerPackage(existingVersion) {
  const dev = await devZip.promise;
  const {
    version,
    fullPkgData,
    fullPkgFilename
  } = dev; // Cache the development package if it is being sent to the remote server so that future
  // deltas will be created from a version that is likely to already be installed on the remote
  // system.

  fullPkgData.then(data => zutil().saveZip(data, fullPkgFilename));

  if (dev.deltaPkgData && existingVersion != null && dev.baseVersion === existingVersion) {
    const {
      deltaPkgData
    } = dev;
    return {
      version,
      data: await deltaPkgData,
      isDelta: true
    };
  } else {
    if (existingVersion != null) {
      // We created a delta for the wrong base version; fall back to a full package:
      logger.info(`Server package delta cannot be applied to existing version ${existingVersion}; sending full package`);
    }

    return {
      version,
      data: await fullPkgData,
      isDelta: false
    };
  }
}

async function createDevZip() {
  logger.info('Creating server package for development');
  const archive = cacheFilename;
  const {
    version,
    files: serverFiles
  } = await (0, _server().packageServer)();
  const devVersion = await createVersionString(version, serverFiles);
  logger.info(`Package version: ${devVersion}`); // Reconnecting is blocked by `devZipVersion` (and may not need the results of
  // `devZip`), so report the version as soon as possible:

  devZipVersion.resolve(devVersion); // Modify big-dig-vscode-server's package.json to reflect the dev-version

  const files = await (0, _production().patchPackageVersion)(version, devVersion, serverFiles);

  async function fallback() {
    // We cannot create a delta...
    const {
      data
    } = await (0, _production().createProductionZip)(archive, devVersion, files);
    return {
      version: devVersion,
      fullPkgData: Promise.resolve(data),
      fullPkgFilename: archive
    };
  }

  if (!(await zutil().zipExists(archive))) {
    logger.info(`Package does not exist; creating ${archive}`);
    return fallback();
  }

  const zip = new (_admZip().default)(archive); // We store the version as the comment:

  const baseVersion = zip.getZipComment();
  logger.info(`Creating delta package for base version: ${baseVersion}`);
  zip.addZipComment(Buffer.from(devVersion, 'utf8'));
  logger.info('Checking for missing files...');
  const zipFiles = new Set(zip.getEntries().map(entry => path.normalize(entry.entryName)));
  const currentFiles = new Set(files.map(file => path.normalize(file.dst)));

  for (const zFile of zipFiles) {
    if (!currentFiles.has(zFile)) {
      logger.info('Files have been deleted; creating package from scratch');
      return fallback();
    }
  }

  logger.info('No missing files');
  logger.info('Creating delta of server package'); // No files have been deleted!
  // Use the archive's modified-time to detect changed files:

  const mtime = (await _fsPromise().default.stat(archive)).mtime.valueOf();
  const diffZip = new (_admZip().default)(); // Create a zip of just the modified files:

  await zutil().addFilesToZip(diffZip, files, mtime);
  const deltaPkgData = zutil().zipToBuffer(diffZip);
  deltaPkgData.then(data => logger.info(`Server package delta is ready (${data.length} bytes)`)); // Update the cached zip:

  const fullPkgData = zutil().addFilesToZip(zip, files).then(() => zutil().zipToBuffer(zip)); // Assume this will be used to update an installation

  return {
    baseVersion,
    version: devVersion,
    deltaPkgData,
    fullPkgData,
    fullPkgFilename: archive
  };
}