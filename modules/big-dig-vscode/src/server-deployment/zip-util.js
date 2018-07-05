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
import fs from 'nuclide-commons/fsPromise';
import {asyncLimit} from 'nuclide-commons/promise';
import AdmZip from 'adm-zip';
import {getLogger} from 'log4js';
import type {PackageFile} from './server';

const ASYNC_LIMIT = 100;
const logger = getLogger('deploy');

// An empty zip file, because adm-zip cannot do it :(
export const emptyZip = new Buffer(
  '504b0506000000000000000000000000000000000000',
  'hex',
);

// Sometimes, we save a package and do not wait for it to complete before returning.
// To avoid the (remote) possibility that we try to access it before its's written,
// we use this promise:
let archiveWritesFlushed: Promise<void> = Promise.resolve();

export function zipToBuffer(zip: AdmZip): Promise<Buffer> {
  if (zip.getEntries().length === 0) {
    // AdmZip cannot handle empty zips
    return Promise.resolve(emptyZip);
  } else {
    return new Promise((resolve, reject) =>
      zip.toBuffer(resolve, reject, () => {}, () => {}),
    );
  }
}

export function zipEntryData(entry: AdmZip.IZipEntry): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    entry.getDataAsync((data: Buffer) => {
      if (data) {
        resolve(data);
      } else {
        reject(
          new Error(`Could not extract ${entry.entryName} from zip archive`),
        );
      }
    });
  });
}

/**
 * Adds a package-file to the zip. If `mtime` is specified, then only add files
 * that have been modified after mtime (a result of `stat`ing the file) *OR*
 * have `alwaysInclude` set to `true`.
 */
export async function addFileToZip(
  zip: AdmZip,
  file: PackageFile,
  mtime?: number,
): Promise<void> {
  if (mtime != null && file.alwaysInclude !== true) {
    const stats = await fs.stat(file.src);
    if (mtime > stats.mtime.valueOf()) {
      return; // Do not add the file
    }
    logger.info(`Adding file: ${file.dst}`);
  }
  if (file.data != null) {
    const data = file.data;
    zip.deleteFile(file.dst);
    zip.addFile(file.dst, await data());
  } else {
    zip.deleteFile(file.dst);
    zip.addLocalFile(
      file.src,
      // zip path (strip any leading './')
      path.relative('./', path.dirname(file.dst)),
      path.basename(file.dst),
    );
  }
}

export function addFilesToZip(
  zip: AdmZip,
  files: Array<PackageFile>,
  mtime?: number,
): Promise<mixed> {
  // Running too many operations in parallel will cause resource contention, like the occasional
  // error "ENFILE: file table overflow".
  return asyncLimit(files, ASYNC_LIMIT, file => addFileToZip(zip, file, mtime));
}

/**
 * adm-zip provides a `writeZip` function, which appears to create corrupt zip files. In any case,
 * we typically work with `Buffers`...
 */
export async function saveZip(zipData: Buffer, filename: string) {
  await archiveWritesFlushed;
  try {
    archiveWritesFlushed = fs.writeFile(filename, zipData);
    await archiveWritesFlushed;
    logger.info('Server package saved');
  } catch (error) {
    logger.warn(`Could not save server package at ${filename}`);
  }
}

export async function loadZip(filename: string) {
  await archiveWritesFlushed;
  return new AdmZip(filename);
}

export async function zipExists(filename: string) {
  await archiveWritesFlushed;
  return fs.exists(filename);
}
