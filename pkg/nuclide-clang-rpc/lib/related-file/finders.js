'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelatedFileFinder = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _common;

function _load_common() {
  return _common = require('./common');
}

var _objcFramework;

function _load_objcFramework() {
  return _objcFramework = require('./objc-framework');
}

var _grepFinder;

function _load_grepFinder() {
  return _grepFinder = require('./grep-finder');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RelatedFileFinder {
  getRelatedHeaderForSource(src) {
    return (0, _asyncToGenerator.default)(function* () {
      // search in folder
      const header = yield (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.dirname(src), (0, (_utils || _load_utils()).getFileBasename)(src), (_utils || _load_utils()).isHeaderFile);
      if (header != null) {
        return header;
      }
      // special case for obj-c frameworks
      return (0, (_objcFramework || _load_objcFramework()).getRelatedHeaderForSourceFromFramework)(src);
    })();
  }

  getRelatedSourceForHeader(header, projectRoot) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // search in folder
      let source = yield (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.dirname(header), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
      if (source != null) {
        return source;
      }
      // special case for obj-c frameworks
      source = yield (0, (_objcFramework || _load_objcFramework()).getRelatedSourceForHeaderFromFramework)(header);
      if (source != null) {
        return source;
      }

      if (projectRoot != null) {
        source = yield (0, (_grepFinder || _load_grepFinder()).findIncludingSourceFile)(header, projectRoot).toPromise();
        if (source != null) {
          return source;
        }
      }

      return (0, (_grepFinder || _load_grepFinder()).findIncludingSourceFile)(header, _this._inferProjectRoot(header)).toPromise();
    })();
  }

  _getProjectRoots() {
    try {
      // $FlowFB
      return require('./fb-project-roots').getFBProjectRoots();
    } catch (e) {}
    return [];
  }

  /**
   * Given a file path, find out from the list of registered hardcoded project
   * roots which one is part of it and use it as project root. Otherwise, this
   * uses the file's parent dir as fallback.
   */
  _inferProjectRoot(file) {
    const pathParts = (_nuclideUri || _load_nuclideUri()).default.split(file);
    for (const root of this._getProjectRoots()) {
      const offset = (0, (_common || _load_common()).findSubArrayIndex)(pathParts, (_nuclideUri || _load_nuclideUri()).default.split(root));
      if (offset !== -1) {
        return (_nuclideUri || _load_nuclideUri()).default.join(...pathParts.slice(0, offset), root);
      }
    }
    return (_nuclideUri || _load_nuclideUri()).default.dirname(file);
  }
}
exports.RelatedFileFinder = RelatedFileFinder; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */