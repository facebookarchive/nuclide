'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchBookmarks = exports.fetchActiveBookmark = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * @param repoPath The full path to the repository directory (.hg).
 * @return A promise that resolves to the current bookmark name, if it exists,
 *   or else an empty string.
 */
let fetchActiveBookmark = exports.fetchActiveBookmark = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (repoPath) {
    const bookmarkFile = (_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'bookmarks.current');
    let result;
    try {
      result = yield (_fsPromise || _load_fsPromise()).default.readFile(bookmarkFile, 'utf-8');
    } catch (e) {
      if (!(e.code === 'ENOENT')) {
        // We expect an error if the bookmark file doesn't exist. Otherwise, the
        // error is unexpected, so log it.
        logger.error(e);
      }
      result = '';
    }
    return result;
  });

  return function fetchActiveBookmark(_x) {
    return _ref.apply(this, arguments);
  };
})();

let fetchBookmarks = exports.fetchBookmarks = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (repoPath) {
    const bookmarkFile = (_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'bookmarks');
    let result;
    try {
      const bookmarks = yield (_fsPromise || _load_fsPromise()).default.readFile(bookmarkFile, 'utf-8');
      const activeBookmark = yield fetchActiveBookmark(repoPath);
      result = bookmarks.split('\n').filter(function (bookmark) {
        return bookmark.length > 0;
      }).map(function (bookmarkEntry) {
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
  });

  return function fetchBookmarks(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-rpc');