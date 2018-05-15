'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =
























humanizePath;var _idx;function _load_idx() {return _idx = _interopRequireDefault(require('idx'));}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                     * Format a path for display. After the path is humanized, it should no longer be treated like a
                                                                                                                                                                                                                                                                                                                                     * parsable, navigable path; it's just for display.
                                                                                                                                                                                                                                                                                                                                     *
                                                                                                                                                                                                                                                                                                                                     * Note that this (intentionally) provides different results based on the projects currently open in
                                                                                                                                                                                                                                                                                                                                     * Atom. If you have multiple directories open, the result will be prefixed with one of their names.
                                                                                                                                                                                                                                                                                                                                     * If you only have one, it won't.
                                                                                                                                                                                                                                                                                                                                     */function humanizePath(path, options) {var _ref, _ref2;const isDirectory = (_ref = options) != null ? _ref.isDirectory : _ref;
  const rootPaths =
  ((_ref2 = options) != null ? _ref2.rootPaths : _ref2) ||
  atom.project.getDirectories().map(dir => dir.getPath());
  const normalized = normalizePath(path, isDirectory);
  let resolved;
  for (const rootPath of rootPaths) {
    const normalizedDir = (_nuclideUri || _load_nuclideUri()).default.normalizeDir(rootPath);
    if ((_nuclideUri || _load_nuclideUri()).default.contains(normalizedDir, normalized)) {
      resolved = normalized.substr(normalizedDir.length);
      const rootName = (_nuclideUri || _load_nuclideUri()).default.basename(normalizedDir);
      // If the path is a root or there's more than one root, include the root's name.
      if (normalized === normalizedDir) {
        return (_nuclideUri || _load_nuclideUri()).default.normalizeDir(rootName);
      }
      if (rootPaths.length > 1) {
        return (_nuclideUri || _load_nuclideUri()).default.join(rootName, resolved);
      }
      return resolved;
    }
  }

  // It's not in one of the project directories so return the full (normalized)
  // path run through nuclideUriToDisplayString to remove nuclide:// etc.
  return (_nuclideUri || _load_nuclideUri()).default.nuclideUriToDisplayString(normalized);
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */function normalizePath(path, isDirectory_) {const isDirectory = isDirectory_ == null ? (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(path) : isDirectory_;return isDirectory ? (_nuclideUri || _load_nuclideUri()).default.normalizeDir(path) : (_nuclideUri || _load_nuclideUri()).default.normalize(path);}