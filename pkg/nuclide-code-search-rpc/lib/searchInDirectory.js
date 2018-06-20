'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchInDirectory = searchInDirectory;
exports.searchInDirectories = searchInDirectories;

var _minimatch;

function _load_minimatch() {
  return _minimatch = require('minimatch');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _searchTools;

function _load_searchTools() {
  return _searchTools = require('./searchTools');
}

var _VcsSearchHandler;

function _load_VcsSearchHandler() {
  return _VcsSearchHandler = require('./VcsSearchHandler');
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

function searchInDirectory(directory, regex, tool, useVcsSearch) {
  const params = { regex, directory, recursive: true };
  return useVcsSearch ? (0, (_VcsSearchHandler || _load_VcsSearchHandler()).search)(directory, regex).catch(() => (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, params)) : (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, params);
}

function searchInDirectories(directory, regex, subdirs, useVcsSearch, tool) {
  // Resolve tool once here so we do not call 'which' for each subdir.
  return _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_searchTools || _load_searchTools()).resolveTool)(tool)).switchMap(actualTool => {
    if (!subdirs || subdirs.length === 0) {
      // Since no subdirs were specified, run search on the root directory.
      return searchInDirectory(directory, regex, actualTool, useVcsSearch);
    } else if (subdirs.find(subdir => subdir.includes('*'))) {
      // Mimic Atom and use minimatch for glob matching.
      const matchers = subdirs.map(subdir => {
        let pattern = subdir;
        if (!pattern.includes('*')) {
          // Automatically glob-ify the non-globs.
          pattern = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(pattern) + '**';
        }
        return new (_minimatch || _load_minimatch()).Minimatch(pattern, { matchBase: true, dot: true });
      });
      // TODO: This should walk the subdirectories and filter by glob before searching.
      return searchInDirectory(directory, regex, actualTool, useVcsSearch).filter(result => Boolean(matchers.find(matcher => matcher.match(result.file))));
    } else {
      // Run the search on each subdirectory that exists.
      return _rxjsBundlesRxMinJs.Observable.from(subdirs).concatMap(async subdir => {
        try {
          const stat = await (_fsPromise || _load_fsPromise()).default.lstat((_nuclideUri || _load_nuclideUri()).default.join(directory, subdir));
          if (stat.isDirectory()) {
            return searchInDirectory((_nuclideUri || _load_nuclideUri()).default.join(directory, subdir), regex, actualTool, useVcsSearch);
          } else {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }
        } catch (e) {
          return _rxjsBundlesRxMinJs.Observable.empty();
        }
      }).mergeAll();
    }
  });
}