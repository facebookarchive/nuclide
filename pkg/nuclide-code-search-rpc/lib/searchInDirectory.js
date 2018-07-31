"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchInDirectory = searchInDirectory;
exports.searchInDirectories = searchInDirectories;

function _minimatch() {
  const data = require("minimatch");

  _minimatch = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _searchTools() {
  const data = require("./searchTools");

  _searchTools = function () {
    return data;
  };

  return data;
}

function _VcsSearchHandler() {
  const data = require("./VcsSearchHandler");

  _VcsSearchHandler = function () {
    return data;
  };

  return data;
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
function searchInDirectory(tool, useVcsSearch, params) {
  return useVcsSearch ? (0, _VcsSearchHandler().search)(params).catch(() => (0, _searchTools().searchWithTool)(tool, params)) : (0, _searchTools().searchWithTool)(tool, params);
}

function searchInDirectories(subdirs, tool, useVcsSearch, options) {
  const {
    directory
  } = options; // Resolve tool once here so we do not call 'which' for each subdir.

  return _RxMin.Observable.defer(() => (0, _searchTools().resolveTool)(tool)).switchMap(actualTool => {
    if (!subdirs || subdirs.length === 0) {
      // Since no subdirs were specified, run search on the root directory.
      return searchInDirectory(tool, useVcsSearch, options);
    } else if (subdirs.find(subdir => subdir.includes('*'))) {
      // Mimic Atom and use minimatch for glob matching.
      const matchers = subdirs.map(subdir => {
        let pattern = subdir;

        if (!pattern.includes('*')) {
          // Automatically glob-ify the non-globs.
          pattern = _nuclideUri().default.ensureTrailingSeparator(pattern) + '**';
        }

        return new (_minimatch().Minimatch)(pattern, {
          matchBase: true,
          dot: true
        });
      }); // TODO: This should walk the subdirectories and filter by glob before searching.

      return searchInDirectory(tool, useVcsSearch, options).filter(result => Boolean(matchers.find(matcher => matcher.match(result.file))));
    } else {
      // Run the search on each subdirectory that exists.
      return _RxMin.Observable.from(subdirs).concatMap(async subdir => {
        try {
          const stat = await _fsPromise().default.lstat(_nuclideUri().default.join(directory, subdir));

          if (stat.isDirectory()) {
            return searchInDirectory(tool, useVcsSearch, Object.assign({}, options, {
              directory: _nuclideUri().default.join(directory, subdir)
            }));
          } else {
            return _RxMin.Observable.empty();
          }
        } catch (e) {
          return _RxMin.Observable.empty();
        }
      }).mergeAll();
    }
  });
}