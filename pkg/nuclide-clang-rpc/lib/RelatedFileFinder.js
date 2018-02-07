'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelatedFileFinder = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _escapeStringRegexp;

function _load_escapeStringRegexp() {
  return _escapeStringRegexp = _interopRequireDefault(require('escape-string-regexp'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
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

const INCLUDE_SEARCH_TIMEOUT = 15000;

// The only purpose of having this as a class is because it's easier to mock
// functions within for testing
class RelatedFileFinder {
  _searchFileWithBasename(dir, basename, condition) {
    return (0, _asyncToGenerator.default)(function* () {
      const files = yield (_fsPromise || _load_fsPromise()).default.readdir(dir).catch(function () {
        return [];
      });
      for (const file of files) {
        if (condition(file) && (0, (_utils || _load_utils()).getFileBasename)(file) === basename) {
          return (_nuclideUri || _load_nuclideUri()).default.join(dir, file);
        }
      }
      return null;
    })();
  }

  _getFrameworkStructureFromSourceDir(dir) {
    const paths = (_nuclideUri || _load_nuclideUri()).default.split(dir).reverse();
    const rootIndex = paths.findIndex(folderName => folderName === 'Sources');
    if (rootIndex === -1) {
      return null;
    }
    const frameworkName = paths[rootIndex + 1];
    const frameworkPath = (_nuclideUri || _load_nuclideUri()).default.join(...paths.slice(rootIndex + 1).reverse());
    const frameworkSubPaths = paths.slice(0, rootIndex);
    const frameworkSubFolder = frameworkSubPaths.length === 0 ? '' : (_nuclideUri || _load_nuclideUri()).default.join(...frameworkSubPaths.reverse());
    return {
      frameworkPath,
      frameworkName,
      frameworkSubFolder
    };
  }

  _getFrameworkStructureFromHeaderDir(dir) {
    const paths = (_nuclideUri || _load_nuclideUri()).default.split(dir).reverse();
    const rootIndex = paths.findIndex(folderName => ['Headers', 'PrivateHeaders'].includes(folderName));
    if (rootIndex === -1) {
      return null;
    }
    const frameworkName = paths[rootIndex + 1];
    const frameworkPath = (_nuclideUri || _load_nuclideUri()).default.join(...paths.slice(rootIndex + 1).reverse());
    const frameworkSubPaths = paths.slice(0, rootIndex - 1);
    const frameworkSubFolder = frameworkSubPaths.length === 0 ? '' : (_nuclideUri || _load_nuclideUri()).default.join(...frameworkSubPaths.reverse());
    return {
      frameworkPath,
      frameworkName,
      frameworkSubFolder
    };
  }

  _getRelatedHeaderForSourceFromFramework(src) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frameworkStructure = _this._getFrameworkStructureFromSourceDir((_nuclideUri || _load_nuclideUri()).default.dirname(src));
      if (frameworkStructure == null) {
        return null;
      }
      const {
        frameworkPath,
        frameworkName,
        frameworkSubFolder
      } = frameworkStructure;
      const basename = (0, (_utils || _load_utils()).getFileBasename)(src);
      const headers = yield Promise.all(['Headers', 'PrivateHeaders'].map(function (headerFolder) {
        return _this._searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, headerFolder, frameworkName, frameworkSubFolder), basename, (_utils || _load_utils()).isHeaderFile);
      }));
      return headers.find(function (file) {
        return file != null;
      });
    })();
  }

  _getRelatedSourceForHeaderFromFramework(header) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frameworkStructure = _this2._getFrameworkStructureFromHeaderDir((_nuclideUri || _load_nuclideUri()).default.dirname(header));
      if (frameworkStructure == null) {
        return null;
      }
      const { frameworkPath, frameworkSubFolder } = frameworkStructure;
      return _this2._searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, 'Sources', frameworkSubFolder), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
    })();
  }

  getRelatedHeaderForSource(src) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // search in folder
      const header = yield _this3._searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.dirname(src), (0, (_utils || _load_utils()).getFileBasename)(src), (_utils || _load_utils()).isHeaderFile);
      if (header != null) {
        return header;
      }
      // special case for obj-c frameworks
      return _this3._getRelatedHeaderForSourceFromFramework(src);
    })();
  }

  getRelatedSourceForHeader(header, projectRoot) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // search in folder
      let source = yield _this4._searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.dirname(header), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
      if (source != null) {
        return source;
      }
      // special case for obj-c frameworks
      source = yield _this4._getRelatedSourceForHeaderFromFramework(header);
      if (source != null) {
        return source;
      }

      if (projectRoot != null) {
        source = yield _this4._findIncludingSourceFile(header, projectRoot).timeout(INCLUDE_SEARCH_TIMEOUT).catch(function () {
          return _rxjsBundlesRxMinJs.Observable.of(null);
        }).toPromise();
        if (source != null) {
          return source;
        }
      }

      return _this4._findIncludingSourceFile(header, _this4._inferProjectRoot(header)).timeout(INCLUDE_SEARCH_TIMEOUT).catch(function () {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }).toPromise();
    })();
  }

  _getFBProjectRoots() {
    try {
      // $FlowFB
      return require('./fb/project_roots').FB_PROJECT_ROOTS;
    } catch (e) {
      return [];
    }
  }

  _inferProjectRoot(header) {
    const headerParts = (_nuclideUri || _load_nuclideUri()).default.split(header);
    for (const root of this._getFBProjectRoots()) {
      const rootParts = (_nuclideUri || _load_nuclideUri()).default.split(root).filter(p => p.length > 0);
      for (let i = 0; i + rootParts.length <= headerParts.length; i++) {
        let found = true;
        for (let j = 0; found && j < rootParts.length; j++) {
          if (headerParts[i + j] !== rootParts[j]) {
            found = false;
          }
        }
        if (found) {
          return (_nuclideUri || _load_nuclideUri()).default.join(...headerParts.slice(0, i + rootParts.length));
        }
      }
    }
    // as fallback we just use the existing folder
    return (_nuclideUri || _load_nuclideUri()).default.dirname(header);
  }

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
  _findIncludingSourceFile(headerFile, projectRoot) {
    const basename = (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)((_nuclideUri || _load_nuclideUri()).default.basename(headerFile));
    const relativePath = (0, (_escapeStringRegexp || _load_escapeStringRegexp()).default)((_nuclideUri || _load_nuclideUri()).default.relative(projectRoot, headerFile));
    const pattern = `^\\s*#include\\s+["<](${relativePath}|(../)*${basename})[">]\\s*$`;
    const regex = new RegExp(pattern);
    // We need both the file and the match to verify relative includes.
    // Relative includes may not always be correct, so we may have to go through all the results.
    return (0, (_process || _load_process()).observeProcess)('grep', ['-RE', // recursive, extended
    '--null', // separate file/match with \0
    pattern, (_nuclideUri || _load_nuclideUri()).default.dirname(headerFile)], { /* TODO(T17353599) */isExitError: () => false }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })) // TODO(T17463635)
    .flatMap(message => {
      switch (message.kind) {
        case 'stdout':
          const file = this._processGrepResult(message.data, headerFile, regex);
          return file == null ? _rxjsBundlesRxMinJs.Observable.empty() : _rxjsBundlesRxMinJs.Observable.of(file);
        case 'error':
          throw new Error(String(message.error));
        case 'exit':
          return _rxjsBundlesRxMinJs.Observable.of(null);
        default:
          return _rxjsBundlesRxMinJs.Observable.empty();
      }
    }).take(1);
  }

  _processGrepResult(result, headerFile, includeRegex) {
    const splitIndex = result.indexOf('\0');
    if (splitIndex === -1) {
      return null;
    }
    const filename = result.substr(0, splitIndex);
    if (!(0, (_utils || _load_utils()).isSourceFile)(filename)) {
      return null;
    }
    const match = includeRegex.exec(result.substr(splitIndex + 1));
    if (match == null) {
      return null;
    }
    // Source-relative includes have to be verified.
    // Relative paths will match the (../)* rule (at index 2).
    if (match[2] != null) {
      const includePath = (_nuclideUri || _load_nuclideUri()).default.normalize((_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(filename), match[1]));
      if (includePath !== headerFile) {
        return null;
      }
    }
    return filename;
  }
}
exports.RelatedFileFinder = RelatedFileFinder;