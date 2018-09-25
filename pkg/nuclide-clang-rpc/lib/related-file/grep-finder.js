"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findIncludingSourceFile = findIncludingSourceFile;
exports.getSearchFolder = getSearchFolder;

function _collection() {
  const data = require("../../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideCodeSearchRpc() {
  const data = require("../../../nuclide-code-search-rpc");

  _nuclideCodeSearchRpc = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("../utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _escapeStringRegexp() {
  const data = _interopRequireDefault(require("escape-string-regexp"));

  _escapeStringRegexp = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
const logger = (0, _log4js().getLogger)('nuclide-clang-rpc');
const INCLUDE_SEARCH_TIMEOUT = 15000;

function findIncludingSourceFile(headerFile, projectRoot) {
  return _findIncludingSourceFile(headerFile, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).take(1).catch(e => {
    (0, _nuclideAnalytics().track)('nuclide-clang-rpc.source-to-header.grep-error', {
      header: headerFile,
      projectRoot,
      error: e.toString()
    });
    return _RxMin.Observable.of(null);
  });
}

function getFBProjectRoots() {
  try {
    // $FlowFB
    return require("./fb/project-roots").getFBProjectRoots();
  } catch (e) {}

  return [];
}

function getSearchFolder(projectRoot, header) {
  const roots = getFBProjectRoots(); // if the projectRoot is a fb root, then search in the first subdirectory,
  // using the whole root is too expensive and might timeout

  if (roots.some(root => projectRoot.endsWith(root))) {
    const headerParts = _nuclideUri().default.split(header);

    for (const root of roots) {
      const rootParts = _nuclideUri().default.split(root);

      const offset = (0, _collection().findSubArrayIndex)(headerParts, rootParts);

      if (offset !== -1) {
        return _nuclideUri().default.join(...headerParts.slice(0, offset + rootParts.length + 1));
      }
    }
  }

  return projectRoot;
}

function _findIncludingSourceFile(header, projectRoot) {
  const basename = (0, _escapeStringRegexp().default)(_nuclideUri().default.basename(header));
  const relativePath = (0, _escapeStringRegexp().default)(_nuclideUri().default.relative(projectRoot, header));
  const regex = new RegExp(`^\\s*#include\\s+["<](${relativePath}|(../)*${basename})[">]\\s*$`);
  const folder = getSearchFolder(projectRoot, header); // We need both the file and the match to verify relative includes.
  // Relative includes may not always be correct, so we may have to go through all the results.

  return (0, _nuclideCodeSearchRpc().codeSearch)(folder, regex, false, null, 200).refCount().filter(result => (0, _utils().isSourceFile)(result.file)).flatMap(result => {
    const match = regex.exec(result.line);

    if (match == null) {
      return _RxMin.Observable.empty();
    } // Source-relative includes have to be verified.
    // Relative paths will match the (../)* rule (at index 2).


    if (match[2] != null) {
      const includePath = _nuclideUri().default.normalize(_nuclideUri().default.join(_nuclideUri().default.dirname(result.file), match[1]));

      if (includePath !== header) {
        return _RxMin.Observable.empty();
      }
    }

    return _RxMin.Observable.of(result.file);
  }).do(file => logger.info('found source file by grepping', file));
}