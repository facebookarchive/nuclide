'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelatedFileFinder = undefined;

var _collection;

function _load_collection() {
  return _collection = require('../../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _SimpleCache;

function _load_SimpleCache() {
  return _SimpleCache = require('../../../../modules/nuclide-commons/SimpleCache');
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

// If the source for a header is null, recheck after 10 minutes.
const SOURCE_FOR_HEADER_RECHECK_INTERVAL = 10 * 60 * 1000; /**
                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                            * All rights reserved.
                                                            *
                                                            * This source code is licensed under the license found in the LICENSE file in
                                                            * the root directory of this source tree.
                                                            *
                                                            * 
                                                            * @format
                                                            */

class RelatedFileFinder {
  constructor() {
    this._sourceForHeaderCache = new (_SimpleCache || _load_SimpleCache()).SimpleCache({ keyFactory: key => JSON.stringify(key) });
  }
  // Finding the source file that relates to header may be very expensive
  // because we grep for '#include' directives, so cache the results.


  async getRelatedHeaderForSource(src) {
    // search in folder
    const header = await (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.dirname(src), (0, (_utils || _load_utils()).getFileBasename)(src), (_utils || _load_utils()).isHeaderFile);
    if (header != null) {
      return header;
    }
    // special case for obj-c frameworks
    return (0, (_objcFramework || _load_objcFramework()).getRelatedHeaderForSourceFromFramework)(src);
  }

  async getRelatedSourceForHeader(header, projectRoot) {
    const { source, time } = await this._sourceForHeaderCache.getOrCreate({ header, projectRoot }, () => this._getRelatedSourceForHeaderImpl(header, projectRoot).then(src => ({
      source: src,
      time: Date.now()
    })));
    const now = Date.now();
    if (source == null && now > time + SOURCE_FOR_HEADER_RECHECK_INTERVAL) {
      this._sourceForHeaderCache.delete({ header, projectRoot });
      return this.getRelatedHeaderForSource(header);
    }
    return source;
  }

  async _getRelatedSourceForHeaderImpl(header, projectRoot) {
    // search in folder
    let source = await (0, (_common || _load_common()).searchFileWithBasename)((_nuclideUri || _load_nuclideUri()).default.dirname(header), (0, (_utils || _load_utils()).getFileBasename)(header), (_utils || _load_utils()).isSourceFile);
    if (source != null) {
      return source;
    }
    // special case for obj-c frameworks
    source = await (0, (_objcFramework || _load_objcFramework()).getRelatedSourceForHeaderFromFramework)(header);
    if (source != null) {
      return source;
    }

    if (projectRoot != null) {
      source = await (0, (_grepFinder || _load_grepFinder()).findIncludingSourceFile)(header, projectRoot).toPromise();
      if (source != null) {
        return source;
      }
    }

    source = await (0, (_grepFinder || _load_grepFinder()).findIncludingSourceFile)(header, this._inferProjectRoot(header)).toPromise();

    if (source != null) {
      return source;
    }

    try {
      // $FlowFB
      return require('./fb/fallback-finder').findIncludingSourceFile(header);
    } catch (e) {
      return null;
    }
  }

  _getFBProjectRoots() {
    try {
      // $FlowFB
      return require('./fb/project-roots').getFBProjectRoots();
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
    for (const root of this._getFBProjectRoots()) {
      const offset = (0, (_collection || _load_collection()).findSubArrayIndex)(pathParts, (_nuclideUri || _load_nuclideUri()).default.split(root));
      if (offset !== -1) {
        return (_nuclideUri || _load_nuclideUri()).default.join(...pathParts.slice(0, offset), root);
      }
    }
    return (_nuclideUri || _load_nuclideUri()).default.dirname(file);
  }
}
exports.RelatedFileFinder = RelatedFileFinder;