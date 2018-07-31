"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zipToBuffer = zipToBuffer;
exports.zipEntryData = zipEntryData;
exports.addFileToZip = addFileToZip;
exports.addFilesToZip = addFilesToZip;
exports.saveZip = saveZip;
exports.loadZip = loadZip;
exports.zipExists = zipExists;
exports.emptyZip = void 0;

var path = _interopRequireWildcard(require("path"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
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
const logger = (0, _log4js().getLogger)('deploy'); // An empty zip file, because adm-zip cannot do it :(

const emptyZip = new Buffer('504b0506000000000000000000000000000000000000', 'hex'); // Sometimes, we save a package and do not wait for it to complete before returning.
// To avoid the (remote) possibility that we try to access it before its's written,
// we use this promise:

exports.emptyZip = emptyZip;
let archiveWritesFlushed = Promise.resolve();

function zipToBuffer(zip) {
  if (zip.getEntries().length === 0) {
    // AdmZip cannot handle empty zips
    return Promise.resolve(emptyZip);
  } else {
    return new Promise((resolve, reject) => zip.toBuffer(resolve, reject, () => {}, () => {}));
  }
}

function zipEntryData(entry) {
  return new Promise((resolve, reject) => {
    entry.getDataAsync(data => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error(`Could not extract ${entry.entryName} from zip archive`));
      }
    });
  });
}
/**
 * Adds a package-file to the zip. If `mtime` is specified, then only add files
 * that have been modified after mtime (a result of `stat`ing the file) *OR*
 * have `alwaysInclude` set to `true`.
 */


async function addFileToZip(zip, file, mtime) {
  if (mtime != null && file.alwaysInclude !== true) {
    const stats = await _fsPromise().default.stat(file.src);

    if (mtime > stats.mtime.valueOf()) {
      return; // Do not add the file
    }

    logger.info(`Adding file: ${file.dst}`);
  }

  if (file.data != null) {
    const data = file.data;
    zip.deleteFile(file.dst);
    zip.addFile(file.dst, (await data()));
  } else {
    zip.deleteFile(file.dst);
    zip.addLocalFile(file.src, // zip path (strip any leading './')
    path.relative('./', path.dirname(file.dst)), path.basename(file.dst));
  }
}

function addFilesToZip(zip, files, mtime) {
  // Running too many operations in parallel will cause resource contention, like the occasional
  // error "ENFILE: file table overflow".
  return (0, _promise().asyncLimit)(files, ASYNC_LIMIT, file => addFileToZip(zip, file, mtime));
}
/**
 * adm-zip provides a `writeZip` function, which appears to create corrupt zip files. In any case,
 * we typically work with `Buffers`...
 */


async function saveZip(zipData, filename) {
  await archiveWritesFlushed;

  try {
    archiveWritesFlushed = _fsPromise().default.writeFile(filename, zipData);
    await archiveWritesFlushed;
    logger.info('Server package saved');
  } catch (error) {
    logger.warn(`Could not save server package at ${filename}`);
  }
}

async function loadZip(filename) {
  await archiveWritesFlushed;
  return new (_admZip().default)(filename);
}

async function zipExists(filename) {
  await archiveWritesFlushed;
  return _fsPromise().default.exists(filename);
}