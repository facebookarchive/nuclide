'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = _interopRequireDefault(require('crypto'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _os = _interopRequireDefault(require('os'));

var _DiskCache;

function _load_DiskCache() {
  return _DiskCache = _interopRequireDefault(require('../../../commons-node/DiskCache'));
}

var _Config;

function _load_Config() {
  return _Config = require('../Config');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

const CACHE_DIR = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), 'nuclide-js-imports-cache');
const CACHE_VERSION = 5; // Bump this for any breaking changes.

function getCachePath({ root, configFromFlow }) {
  const hash = _crypto.default.createHash('sha1');
  hash.update(`${root}:${CACHE_VERSION}\n`);
  hash.update((0, (_Config || _load_Config()).serializeConfig)(configFromFlow));
  const fileName = (_nuclideUri || _load_nuclideUri()).default.basename(root) + '-' + hash.digest('hex').substr(0, 8);
  return (_nuclideUri || _load_nuclideUri()).default.join(CACHE_DIR, fileName);
}

function getCacheKey({ filePath, sha1 }) {
  // We can truncate the sha1 hash, as collisions are very unlikely.
  return `${filePath}:${sha1.substr(0, 8)}`;
}

class ExportCache extends (_DiskCache || _load_DiskCache()).default {
  constructor(params) {
    super(getCachePath(params), getCacheKey);
  }
}
exports.default = ExportCache;