"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelatedFileFinder = void 0;

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

function _SimpleCache() {
  const data = require("../../../../modules/nuclide-commons/SimpleCache");

  _SimpleCache = function () {
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

function _common() {
  const data = require("./common");

  _common = function () {
    return data;
  };

  return data;
}

function _objcFramework() {
  const data = require("./objc-framework");

  _objcFramework = function () {
    return data;
  };

  return data;
}

function _grepFinder() {
  const data = require("./grep-finder");

  _grepFinder = function () {
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
// If the source for a header is null, recheck after 10 minutes.
const SOURCE_FOR_HEADER_RECHECK_INTERVAL = 10 * 60 * 1000;

class RelatedFileFinder {
  constructor() {
    this._sourceForHeaderCache = new (_SimpleCache().SimpleCache)({
      keyFactory: key => JSON.stringify(key)
    });
  }

  async getRelatedHeaderForSource(src) {
    // search in folder
    const header = await (0, _common().searchFileWithBasename)(_nuclideUri().default.dirname(src), (0, _utils().getFileBasename)(src), _utils().isHeaderFile);

    if (header != null) {
      return header;
    } // special case for obj-c frameworks


    return (0, _objcFramework().getRelatedHeaderForSourceFromFramework)(src);
  }

  async getRelatedSourceForHeader(header, projectRoot) {
    const {
      source,
      time
    } = await this._sourceForHeaderCache.getOrCreate({
      header,
      projectRoot
    }, () => this._getRelatedSourceForHeaderImpl(header, projectRoot).then(src => ({
      source: src,
      time: Date.now()
    })));
    const now = Date.now();

    if (source == null && now > time + SOURCE_FOR_HEADER_RECHECK_INTERVAL) {
      this._sourceForHeaderCache.delete({
        header,
        projectRoot
      });

      return this.getRelatedHeaderForSource(header);
    }

    return source;
  }

  async _getRelatedSourceForHeaderImpl(header, projectRoot) {
    // search in folder
    let source = await (0, _common().searchFileWithBasename)(_nuclideUri().default.dirname(header), (0, _utils().getFileBasename)(header), _utils().isSourceFile);

    if (source != null) {
      return source;
    } // special case for obj-c frameworks


    source = await (0, _objcFramework().getRelatedSourceForHeaderFromFramework)(header);

    if (source != null) {
      return source;
    }

    if (projectRoot != null) {
      source = await (0, _grepFinder().findIncludingSourceFile)(header, projectRoot).toPromise();

      if (source != null) {
        return source;
      }
    }

    source = await (0, _grepFinder().findIncludingSourceFile)(header, this._inferProjectRoot(header)).toPromise();

    if (source != null) {
      return source;
    }

    try {
      // $FlowFB
      return require("./fb/fallback-finder").findIncludingSourceFile(header);
    } catch (e) {
      return null;
    }
  }

  _getFBProjectRoots() {
    try {
      // $FlowFB
      return require("./fb/project-roots").getFBProjectRoots();
    } catch (e) {}

    return [];
  }
  /**
   * Given a file path, find out from the list of registered hardcoded project
   * roots which one is part of it and use it as project root. Otherwise, this
   * uses the file's parent dir as fallback.
   */


  _inferProjectRoot(file) {
    const pathParts = _nuclideUri().default.split(file);

    for (const root of this._getFBProjectRoots()) {
      const offset = (0, _collection().findSubArrayIndex)(pathParts, _nuclideUri().default.split(root));

      if (offset !== -1) {
        return _nuclideUri().default.join(...pathParts.slice(0, offset), root);
      }
    }

    return _nuclideUri().default.dirname(file);
  }

}

exports.RelatedFileFinder = RelatedFileFinder;