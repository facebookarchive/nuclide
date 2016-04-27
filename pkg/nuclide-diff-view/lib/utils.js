Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getFileSystemContents = getFileSystemContents;
exports.getFileTreePathFromTargetEvent = getFileTreePathFromTargetEvent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideClient = require('../../nuclide-client');

var TREE_API_DATA_PATH = 'data-path';

/**
 * Reads the file contents and returns empty string if the file doesn't exist
 * which means it was removed in the HEAD dirty repository status.
 *
 * If another error is encontered, it's thrown to be handled up the stack.
 */

function getFileSystemContents(filePath) {
  var fileSystemService = (0, _nuclideClient.getFileSystemServiceByNuclideUri)(filePath);
  (0, _assert2['default'])(fileSystemService);
  var localFilePath = require('../../nuclide-remote-uri').getPath(filePath);
  return fileSystemService.readFile(localFilePath).then(function (contents) {
    return contents.toString('utf8');
  }, function (error) {
    if (error.code === 'ENOENT') {
      // The file is deleted in the current dirty status.
      return '';
    }
    throw error;
  });
}

function getFileTreePathFromTargetEvent(event) {
  // Event target isn't necessarily an HTMLElement,

  var target = event.currentTarget;
  var nameElement = target.hasAttribute(TREE_API_DATA_PATH) ? target : target.querySelector('[' + TREE_API_DATA_PATH + ']');
  return nameElement.getAttribute(TREE_API_DATA_PATH);
}

// but that's guaranteed in the usages here.