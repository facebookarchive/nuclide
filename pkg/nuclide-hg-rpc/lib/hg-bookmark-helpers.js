'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchActiveBookmark = undefined;

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

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)(); /**
                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                              * All rights reserved.
                                                                              *
                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                              * the root directory of this source tree.
                                                                              *
                                                                              * 
                                                                              */