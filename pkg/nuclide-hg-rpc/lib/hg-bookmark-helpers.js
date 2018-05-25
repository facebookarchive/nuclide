'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchActiveBookmark = fetchActiveBookmark;
exports.fetchBookmarks = fetchBookmarks;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc');

/**
 * @param repoPath The full path to the repository directory (.hg).
 * @return A promise that resolves to the current bookmark name, if it exists,
 *   or else an empty string.
 */
async function fetchActiveBookmark(repoPath) {
  const bookmarkFile = (_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'bookmarks.current');
  let result;
  try {
    result = await (_fsPromise || _load_fsPromise()).default.readFile(bookmarkFile, 'utf-8');
  } catch (e) {
    if (!(e.code === 'ENOENT')) {
      // We expect an error if the bookmark file doesn't exist. Otherwise, the
      // error is unexpected, so log it.
      logger.error(e);
    }
    result = '';
  }
  return result;
}

async function fetchBookmarks(repoPath) {
  const bookmarkFile = (_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'bookmarks');
  let result;
  try {
    const bookmarks = await (_fsPromise || _load_fsPromise()).default.readFile(bookmarkFile, 'utf-8');
    const activeBookmark = await fetchActiveBookmark(repoPath);
    result = bookmarks.split('\n').filter(bookmark => bookmark.length > 0).map(bookmarkEntry => {
      const [node, bookmark] = bookmarkEntry.split(' ');
      return {
        node,
        bookmark,
        active: activeBookmark === bookmark
      };
    });
  } catch (e) {
    if (!(e.code === 'ENOENT')) {
      // We expect an error if the bookmark file doesn't exist. Otherwise, the
      // error is unexpected, so log it.
      logger.error(e);
    }
    result = [];
  }
  return result;
}