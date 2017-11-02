'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRelatedSourceForHeader = exports.getRelatedHeaderForSource = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let searchFileWithBasename = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (dir, basename, condition) {
    const files = yield (_fsPromise || _load_fsPromise()).default.readdir(dir).catch(function () {
      return [];
    });
    for (const file of files) {
      if (condition(file) && (0, (_utils || _load_utils()).getFileBasename)(file) === basename) {
        return (_nuclideUri || _load_nuclideUri()).default.join(dir, file);
      }
    }
    return null;
  });

  return function searchFileWithBasename(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let getRelatedHeaderForSourceFromFramework = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (src) {
    const frameworkStructure = getFrameworkStructureFromSourceDir((_nuclideUri || _load_nuclideUri()).default.dirname(src));
    if (frameworkStructure == null) {
      return null;
    }
    const { frameworkPath, frameworkName, frameworkSubFolder } = frameworkStructure;
    const basename = (0, (_utils || _load_utils()).getFileBasename)(src);
    const headers = yield Promise.all(['Headers', 'PrivateHeaders'].map(function (headerFolder) {
      return searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, headerFolder, frameworkName, frameworkSubFolder), basename, (_utils || _load_utils()).isHeaderFile);
    }));
    return headers.find(function (file) {
      return file != null;
    });
  });

  return function getRelatedHeaderForSourceFromFramework(_x4) {
    return _ref2.apply(this, arguments);
  };
})();

let getRelatedSourceForHeaderFromFramework = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (header) {
    const frameworkStructure = getFrameworkStructureFromHeaderDir((_nuclideUri || _load_nuclideUri()).default.dirname(header));
    if (frameworkStructure == null) {
      return null;
    }
    const { frameworkPath, frameworkSubFolder } = frameworkStructure;
    return searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.join(frameworkPath, 'Sources', frameworkSubFolder), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
  });

  return function getRelatedSourceForHeaderFromFramework(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

let getRelatedHeaderForSource = exports.getRelatedHeaderForSource = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (src) {
    // search in folder
    const header = yield searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.dirname(src), (0, (_utils || _load_utils()).getFileBasename)(src), (_utils || _load_utils()).isHeaderFile);
    if (header != null) {
      return header;
    }
    // special case for obj-c frameworks
    return getRelatedHeaderForSourceFromFramework(src);
  });

  return function getRelatedHeaderForSource(_x6) {
    return _ref4.apply(this, arguments);
  };
})();

let getRelatedSourceForHeader = exports.getRelatedSourceForHeader = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (src) {
    // search in folder
    const source = yield searchFileWithBasename((_nuclideUri || _load_nuclideUri()).default.dirname(src), (0, (_utils || _load_utils()).getFileBasename)(src), (_utils || _load_utils()).isSourceFile);
    if (source != null) {
      return source;
    }
    // special case for obj-c frameworks
    return getRelatedSourceForHeaderFromFramework(src);
  });

  return function getRelatedSourceForHeader(_x7) {
    return _ref5.apply(this, arguments);
  };
})();

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


exports.findIncludingSourceFile = findIncludingSourceFile;

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

function getFrameworkStructureFromSourceDir(dir) {
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

function getFrameworkStructureFromHeaderDir(dir) {
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
function findIncludingSourceFile(headerFile, projectRoot) {
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
        const file = processGrepResult(message.data, headerFile, regex);
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

function processGrepResult(result, headerFile, includeRegex) {
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