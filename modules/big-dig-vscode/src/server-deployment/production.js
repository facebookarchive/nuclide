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

import type {PackageInfo} from './Package';
import type {PackageFile} from './server';
import type {
  PackageBuffer as PackageBufferType,
  PackageFile as PackageFileType,
} from 'big-dig/src/client/RemotePackage';

import invariant from 'assert';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import * as path from 'path';
import AdmZip from 'adm-zip';
import {getLogger} from 'log4js';

import {packageServer, getServerPackage} from './server';
import * as zutil from './zip-util';

const logger = getLogger('deploy');

const DEFAULT_FILENAME = path.resolve(
  __dirname,
  '../../resources/big-dig-vscode-server.zip',
);

/**
 * Attempts to get the version of the production server, first from an existing
 * zip archive, second by attempting to load the node module.
 * @return The version string of the server, or the empty string if a server
 * cannot be found.
 */
export async function packageVersion(
  packageFilename: string = DEFAULT_FILENAME,
): Promise<string> {
  const pkg =
    (await getServerPackageFromZip(packageFilename)) ||
    (await getServerPackage()).info;
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
export async function createServerPackage(
  prodVersion?: string,
  packageFilename: string = DEFAULT_FILENAME,
) {
  const pkg = await getServerPackageFromZip(packageFilename);
  if (pkg != null) {
    logger.info(
      `Found server package at ${packageFilename}; version ${pkg.version}`,
    );
    return {
      version: pkg.version,
      filename: packageFilename,
    };
  } else {
    logger.info('Creating full production package');
    let {version, files} = await packageServer();
    if (prodVersion != null) {
      files = await patchPackageVersion(version, prodVersion, files);
      version = prodVersion;
    }
    return productionZip(packageFilename, version, files);
  }
}

export async function createProductionZip(
  filename: string,
  version: string,
  files: Array<PackageFile>,
): Promise<PackageBufferType> {
  logger.info('Creating server package');
  const zip = new AdmZip();
  await zutil.addFilesToZip(zip, files);
  logger.info('Saving server package');
  const buffer = await zutil.zipToBuffer(zip);
  zutil.saveZip(buffer, filename);
  return {version, data: buffer};
}

/**
 * Attempts to read the server's package.json from the production zip. If not
 * available, then this will return null,
 */
async function getServerPackageFromZip(
  packageFilename: string,
): Promise<?PackageInfo> {
  if (!(await zutil.zipExists(packageFilename))) {
    logger.warn(`Big-dig server package does not exist: ${packageFilename}`);
    return null;
  }
  try {
    const zip = new AdmZip(packageFilename);
    const data = await zutil.zipEntryData(zip.getEntry('package.json'));
    const pkg = JSON.parse(data.toString('utf8'));
    return pkg;
  } catch (error) {
    logger.warn(`Cannot load server package info from ${packageFilename}`);
    return null;
  }
}

async function productionZip(
  filename: string,
  version: string,
  files: Array<PackageFile>,
): Promise<PackageBufferType | PackageFileType> {
  if (!(await zutil.zipExists(filename))) {
    return createProductionZip(filename, version, files);
  }
  return {version, filename};
}

/**
 * Returns the server package files, but with the server's version in
 * package.json changed to `newVersion`.
 * @param version production version; must match the original version
 * @param newVersion new version; will replace the original
 * @param files patched files; all but the server's package.json will remain
 * unchanged.
 */
export async function patchPackageVersion(
  version: string,
  newVersion: string,
  files: Array<PackageFile>,
): Promise<Array<PackageFile>> {
  const server = await getServerPackage();
  invariant(server.info.version === version);
  server.info.version = newVersion;

  function patchVersion(file: PackageFile): PackageFile {
    if (file.src !== server.getPackageFile()) {
      return file;
    }
    return {
      src: file.src,
      dst: file.dst,
      data: () =>
        Promise.resolve(new Buffer(JSON.stringify(server.info), 'utf8')),
      alwaysInclude: true,
    };
  }

  try {
    return files.map(patchVersion);
  } catch (error) {
    logger.error(
      `Could not update version ${version} to ${newVersion} in server's package.json.`,
    );
    return files;
  }
}
