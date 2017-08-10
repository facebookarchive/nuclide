'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openFileInDiffView = openFileInDiffView;

var _url = _interopRequireDefault(require('url'));

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

function openFileInDiffView(filePath) {
  const diffOpenUrl = _url.default.format({
    protocol: 'atom',
    host: 'nuclide',
    pathname: 'diff-view',
    slashes: true,
    query: {
      file: filePath,
      onlyDiff: true
    }
  });
  // This is not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open(diffOpenUrl);
}