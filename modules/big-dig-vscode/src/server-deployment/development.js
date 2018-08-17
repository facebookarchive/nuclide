/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import * as path from 'path';
import {Deferred, asyncLimit} from 'nuclide-commons/promise';
import fs from 'nuclide-commons/fsPromise';
import AdmZip from 'adm-zip';
import {getLogger} from 'log4js';
import os from 'os';

import {packageServer} from './server';
import type {PackageFile} from './server';
import {__DEV__} from '../dev';

import * as zutil from './zip-util';
import {createProductionZip, patchPackageVersion} from './production';
import {startDevPackagerWorker} from './dev-worker';

const ASYNC_LIMIT = 100;
const logger = getLogger('deploy');

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

const cacheFilename = path.join(os.tmpdir(), 'big-dig-vscode-server-dev.zip');

export type DevelopmentZipResult = {
  /** If a delta package was produced, then this is the version it is based off of; otherwise null. */
  baseVersion?: string,
  version: string,
  deltaPkgData?: Promise<Buffer>,
  fullPkgData: Promise<Buffer>,
  fullPkgFilename: string,
};

// Kick off creation of the server package right away if we're in dev mode.
const devZip: Deferred<DevelopmentZipResult> = new Deferred();
// This is resolved halfway into `createDevZip` and should be equal to the
// version reported by `devZip`. (We want the version as soon as possible, so
// don't wait for the whole zip to be ready.)
const devZipVersion: Deferred<string> = new Deferred();

/**
 * In case modules are only loaded on demand, call `init` to initialize background startup tasks.
 *
 * If we're in development mode, this will begin the background task of generating a deployment
 * package.
 */
export function init() {
  if (__DEV__) {
    startDevPackagerWorker(devZip, devZipVersion);

    // The above code essentially runs the following in another process. If it
    // needs to be debugged, you should consider running this:
    // createDevZip()
    //   .then(result => devZip.resolve(result))
    //   .catch(err => logger.error('Could not create development package', err));
  } else {
    devZip.reject(new Error('Development-mode server package not available'));
  }
}

/**
 * Returns the version string of the development server.
 * NOTE: this will not resolve unless `init()` or `createDevZip()` is also
 * called, although this may resolve sooner than `createDevZip()`.
 * @return The version string of the server.
 */
export function packageVersion(): Promise<string> {
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
async function createVersionString(version: string, files: Array<PackageFile>) {
  const mtimes = await asyncLimit(files, ASYNC_LIMIT, async file =>
    (await fs.stat(file.src)).mtime.valueOf(),
  );
  const mtime = Math.max(...mtimes);
  return `${version}-${mtime}`;
}

/**
 * Creates a server-deployment package zip (for use with big-dig) that will be applied to the
 * remote `existingVersion` installation (`null` if there is no preexisting installation). If we
 * were able to create a delta for `existingVersion`, it will be returned. Otherwise a full package
 * will be returned.
 */
export async function createServerPackage(existingVersion: ?string) {
  const dev = await devZip.promise;
  const {version, fullPkgData, fullPkgFilename} = dev;
  // Cache the development package if it is being sent to the remote server so that future
  // deltas will be created from a version that is likely to already be installed on the remote
  // system.
  fullPkgData.then(data => zutil.saveZip(data, fullPkgFilename));

  if (
    dev.deltaPkgData &&
    existingVersion != null &&
    dev.baseVersion === existingVersion
  ) {
    const {deltaPkgData} = dev;
    return {version, data: await deltaPkgData, isDelta: true};
  } else {
    if (existingVersion != null) {
      // We created a delta for the wrong base version; fall back to a full package:
      logger.info(
        `Server package delta cannot be applied to existing version ${existingVersion}; sending full package`,
      );
    }
    return {version, data: await fullPkgData, isDelta: false};
  }
}

export async function createDevZip(): Promise<DevelopmentZipResult> {
  logger.info('Creating server package for development');
  const archive = cacheFilename;
  const {version, files: serverFiles} = await packageServer();

  const devVersion = await createVersionString(version, serverFiles);
  logger.info(`Package version: ${devVersion}`);
  // Reconnecting is blocked by `devZipVersion` (and may not need the results of
  // `devZip`), so report the version as soon as possible:
  devZipVersion.resolve(devVersion);
  // Modify big-dig-vscode-server's package.json to reflect the dev-version
  const files = await patchPackageVersion(version, devVersion, serverFiles);

  async function fallback() {
    // We cannot create a delta...
    const {data} = await createProductionZip(archive, devVersion, files);
    return {
      version: devVersion,
      fullPkgData: Promise.resolve(data),
      fullPkgFilename: archive,
    };
  }

  if (!(await zutil.zipExists(archive))) {
    logger.info(`Package does not exist; creating ${archive}`);
    return fallback();
  }

  const zip = new AdmZip(archive);
  // We store the version as the comment:
  const baseVersion = zip.getZipComment();
  logger.info(`Creating delta package for base version: ${baseVersion}`);
  zip.addZipComment(Buffer.from(devVersion, 'utf8'));

  logger.info('Checking for missing files...');
  const zipFiles = new Set(
    zip.getEntries().map(entry => path.normalize(entry.entryName)),
  );
  const currentFiles = new Set(files.map(file => path.normalize(file.dst)));
  for (const zFile of zipFiles) {
    if (!currentFiles.has(zFile)) {
      logger.info('Files have been deleted; creating package from scratch');
      return fallback();
    }
  }
  logger.info('No missing files');
  logger.info('Creating delta of server package');
  // No files have been deleted!

  // Use the archive's modified-time to detect changed files:
  const mtime = (await fs.stat(archive)).mtime.valueOf();

  const diffZip = new AdmZip();
  // Create a zip of just the modified files:
  await zutil.addFilesToZip(diffZip, files, mtime);

  const deltaPkgData = zutil.zipToBuffer(diffZip);
  deltaPkgData.then(data =>
    logger.info(`Server package delta is ready (${data.length} bytes)`),
  );

  // TODO(siegbell): Cannot update an existing zip: https://github.com/cthackers/adm-zip/issues/64
  // // Update the cached zip:
  // const fullPkgData = zutil
  //   .addFilesToZip(zip, files)
  //   .then(() => zutil.zipToBuffer(zip));
  const fullPkgData = createProductionZip(archive, devVersion, files).then(
    ({data}) => data,
  );

  // Assume this will be used to update an installation
  return {
    baseVersion,
    version: devVersion,
    deltaPkgData,
    fullPkgData,
    fullPkgFilename: archive,
  };
}
