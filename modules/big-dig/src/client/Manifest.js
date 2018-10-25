"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createManifest = createManifest;
exports.serializeManifest = serializeManifest;
exports.deserializeManifest = deserializeManifest;
exports.compareManifests = compareManifests;
exports.CorruptManifestError = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * Thrown when a manifest does not have a valid structure.
 */
class CorruptManifestError extends Error {}
/**
 * Verifies that the manifest has a valid structure; throws `ManifestError` if not.
 * @param {*} manifest an (untrusted) manifest object.
 */


exports.CorruptManifestError = CorruptManifestError;

function verifyManifest(manifest) {
  if (typeof manifest.version !== 'string') {
    throw corrupt('Invalid version in manifest');
  }

  if (typeof manifest.hash !== 'string') {
    throw corrupt('Invalid hash property in manifest');
  }

  const {
    version,
    hash
  } = manifest;
  return {
    version,
    hash
  };
}
/**
 * Creates a manifest from some observed state.
 * @param version The version to assign to the observed state.
 * @param manifestFilename The *absolute* path to the manifest; it is used to elide the manifest
 *    from itself.
 * @param basePath The *absolute* path to the root folder of the observed files.
 *    (Also used to elide the manifest from itself.)
 * @param files A list of all [sub]files and [sub]directories under `basePath`, paired with the
 *    output of `stat` on each file. These should be absolute paths.
 */


function createManifest(version, manifestFilename, basePath, files) {
  const hash = _crypto.default.createHash('sha1');

  const sortedFiles = files // Exclude the manifest file and directories from the manifest.
  .filter(file => file.filename !== manifestFilename && !file.stats.isDirectory()).sort((a, b) => a.filename.localeCompare(b.filename));

  for (const file of sortedFiles) {
    const filename = _path.default.relative(basePath, file.filename);

    const {
      mode,
      uid,
      gid,
      size,
      mtime
    } = file.stats;
    hash.update(`${filename}:${mode}.${uid}.${gid}.${size}.${mtime}`, 'utf8');
  }

  return {
    version,
    hash: hash.digest('hex')
  };
}
/**
 * Serializes the manifest into a `Buffer` that can be written to a manifest file.
 * @param manifest
 */


function serializeManifest(manifest) {
  return new Buffer(JSON.stringify(manifest), 'utf8');
}
/**
 * Deserialize data read from a manifest file and verify that it is a valid manifest.
 * Throws `ManifestError` if `data` does not encode a valid manifest structure.
 * @param data A buffer containing the manifest data loaded from a file.
 */


function deserializeManifest(data) {
  return verifyManifest(parseManifest(data.toString('utf8')));
}

/**
 * Compares two manifests for agreement on the state of the system.
 * NOTICE: equal manifests do not guarantee that the contents of a file has not changed.
 * Return a status of:
 *  * 'equal' if they agree on the state of the system.
 *  * 'diff-versions' if the manifests do not have the same version
 *  * 'changed-files' a file has been added, removed, or had its stats changed.
 *
 * @param expected The state we expect to see.
 * @param current The observed state.
 * @return `{status: 'okay'}` if the two manifests agree on the state of the system.
 */
function compareManifests(expected, current) {
  if (expected.version !== current.version) {
    return {
      status: 'diff-versions',
      message: 'Different versions'
    };
  } else if (expected.hash !== current.hash) {
    return {
      status: 'changed-files',
      message: 'Files are missing, have been added, or file-stats have changed'
    };
  }

  return {
    status: 'equal'
  };
}

function corrupt(message) {
  return new CorruptManifestError(message);
}

function parseManifest(data) {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw corrupt('Manifest is not valid JSON syntax');
  }
}