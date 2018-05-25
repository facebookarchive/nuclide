'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findIncludingSourceFile = findIncludingSourceFile;
exports.getSearchFolder = getSearchFolder;

var _collection;

function _load_collection() {
  return _collection = require('../../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _nuclideCodeSearchRpc;

function _load_nuclideCodeSearchRpc() {
  return _nuclideCodeSearchRpc = require('../../../nuclide-code-search-rpc');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
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

/**
 * Search all subdirectories of the header file for a source file that includes it.
 * We handle the two most common types of include statements:
 *
 * 1) Includes relative to the project root (if supplied); e.g. #include <a/b.h>
 * 2) Includes relative to the source file; e.g. #include "../../a.h"
 *
 * Note that we use an Observable here to enable cancellation.
 * The resulting Observable fires and completes as soon as a matching file is found;
 * 'null' will always be emitted if no results are found.
 */
const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-clang-rpc');

const INCLUDE_SEARCH_TIMEOUT = 15000;

function findIncludingSourceFile(headerFile, projectRoot) {
  return _findIncludingSourceFile(headerFile, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).take(1).catch(e => {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-clang-rpc.source-to-header.grep-error', {
      header: headerFile,
      projectRoot,
      error: e.toString()
    });
    return _rxjsBundlesRxMinJs.Observable.of(null);
  });
}

function getFBProjectRoots() {
  try {
    // $FlowFB
    return require('./fb/project-roots').getFBProjectRoots();
  } catch (e) {}
  return [];
}

function getSearchFolder(projectRoot, header) {
  const roots = getFBProjectRoots();
  // if the projectRoot is a fb root, then search in the first subdirectory,
  // using the whole root is too expensive and might timeout
  if (roots.some(root => projectRoot.endsWith(root))) {
    const headerParts = (_nuclideUri || _load_nuclideUri()).default.split(header);
    for (const root of roots) {
      const rootParts = (_nuclideUri || _load_nuclideUri()).default.split(root);
      const offset = (0, (_collection || _load_collection()).findSubArrayIndex)(headerParts, rootParts);
      if (offset !== -1) {
        return (_nuclideUri || _load_nuclideUri()).default.join(...headerParts.slice(0, offset + rootParts.length + 1));
      }
    }
  }
  return projectRoot;
}

function _findIncludingSourceFile(header, projectRoot) {
  const basename = (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)((_nuclideUri || _load_nuclideUri()).default.basename(header));
  const relativePath = (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)((_nuclideUri || _load_nuclideUri()).default.relative(projectRoot, header));
  const regex = new RegExp(`^\\s*#include\\s+["<](${relativePath}|(../)*${basename})[">]\\s*$`);
  const folder = getSearchFolder(projectRoot, header);
  // We need both the file and the match to verify relative includes.
  // Relative includes may not always be correct, so we may have to go through all the results.
  return (0, (_nuclideCodeSearchRpc || _load_nuclideCodeSearchRpc()).codeSearch)(folder, regex, false, null, 200).refCount().filter(result => (0, (_utils || _load_utils()).isSourceFile)(result.file)).flatMap(result => {
    const match = regex.exec(result.line);
    if (match == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    // Source-relative includes have to be verified.
    // Relative paths will match the (../)* rule (at index 2).
    if (match[2] != null) {
      const includePath = (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(result.file), match[1]));
      if (includePath !== header) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
    }
    return _rxjsBundlesRxMinJs.Observable.of(result.file);
  }).do(file => logger.info('found source file by grepping', file));
}