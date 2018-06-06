'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CtagsService = undefined;
exports.getCtagsService = getCtagsService;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TAGS_FILENAME = 'tags'; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */

class CtagsService {

  constructor(tagsPath) {
    this._tagsPath = tagsPath;
  }

  getTagsPath() {
    return Promise.resolve(this._tagsPath);
  }

  findTags(query, options) {
    let ctags;
    try {
      ctags = require('nuclide-prebuilt-libs/ctags');
    } catch (e) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-ctags-rpc').error('Could not load the ctags package:', e);
      return Promise.resolve([]);
    }

    const dir = (_nuclideUri || _load_nuclideUri()).default.dirname(this._tagsPath);
    return new Promise((resolve, reject) => {
      ctags.findTags(this._tagsPath, query, options, async (error, tags) => {
        if (error != null) {
          reject(error);
        } else {
          const processed = await Promise.all(tags.map(async tag => {
            // Convert relative paths to absolute ones.
            tag.file = (_nuclideUri || _load_nuclideUri()).default.join(dir, tag.file);
            // Tag files are often not perfectly in sync - filter out missing files.
            if (await (_fsPromise || _load_fsPromise()).default.exists(tag.file)) {
              if (tag.fields != null) {
                const map = new Map();
                for (const key in tag.fields) {
                  map.set(key, tag.fields[key]);
                }
                tag.fields = map;
              }
              return tag;
            }
            return null;
          }));
          // $FlowFixMe(>=0.55.0) Flow suppress
          resolve((0, (_collection || _load_collection()).arrayCompact)(processed));
        }
      });
    });
  }

  dispose() {
    // nothing here
  }
}

exports.CtagsService = CtagsService;
async function getCtagsService(uri) {
  const dir = await (_fsPromise || _load_fsPromise()).default.findNearestFile(TAGS_FILENAME, (_nuclideUri || _load_nuclideUri()).default.dirname(uri));
  if (dir == null) {
    return null;
  }
  // TAGS and tags are very much incompatible (emacs vs ctags style).
  // Currently the TAGS format also makes node-ctags crash (!!)
  // As such, on case-insensitive filesystems we need to double check.
  if (process.platform !== 'linux') {
    const files = await (_fsPromise || _load_fsPromise()).default.readdir(dir);
    if (!files.includes(TAGS_FILENAME)) {
      return null;
    }
  }
  return new CtagsService((_nuclideUri || _load_nuclideUri()).default.join(dir, TAGS_FILENAME));
}