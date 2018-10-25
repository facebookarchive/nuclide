"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MemoizedFieldsDeriver = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function FileTreeHelpers() {
  const data = _interopRequireWildcard(require("./FileTreeHelpers"));

  FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * This is a support class for FileTreeNode.
 * Since the FileTreeNode is immutable, any update to it actually creates a new instance.
 * But some of its properties properties are derived from others. Calculating them anew
 * every time is computationally expensive. This class takes care of the memoization of
 * this process to keep the logic of the FileTreeNode clean from it.
 *
 * The class is initialized with the URIs of a node and its root. These properties do not
 * change over time. Currently at least, all derived properties are calculated from these URIs
 * and various objects contained in the FileTreeNode.conf, so in order to calculate current
 * values only the conf object is to be supplied.
 *
 * Each instance has a set of memoized getter functions. Each is responsible for calculation of a
 * single property. There are dependencies between some of the properties, so it's possible that
 * one memoized getter will call another.
 *
 * Each getter has a separate cache instance which it is using for the memoization.
 * In this class' memoization strategy only the last value (and all its params, of course) are
 * stored.
 *
 */
class MemoizedFieldsDeriver {
  // These properties do not depend on the conf instance and can be calculated right away.
  constructor(uri, rootUri) {
    this._uri = uri;
    this._rootUri = rootUri;
    this._isContainer = FileTreeHelpers().isDirOrArchiveKey(uri);
    this._splitPath = _nuclideUri().default.split(uri);
    this._getRepo = memoize(this._repoGetter.bind(this));
    this._getIsIgnored = memoize(this._isIgnoredGetter.bind(this));
    this._getCheckedStatus = memoize(this._checkedStatusGetter.bind(this));
    this._getContainedInWorkingSet = memoize(this._containedInWorkingSetGetter.bind(this));
    this._getContainedInOpenFilesWorkingSet = memoize(this._containedInOpenFilesWorkingSetGetter.bind(this));
    this._getShouldBeShown = memoize(this._shouldBeShownGetter.bind(this));
    this._getShouldBeSoftened = memoize(this._shouldBeSoftenedGetter.bind(this));
  }

  _repoGetter(conf, cache) {
    if (cache.reposByRoot !== conf.reposByRoot) {
      cache.reposByRoot = conf.reposByRoot;
      cache.repo = cache.reposByRoot[this._rootUri];
    }

    return cache.repo;
  }

  _isIgnoredGetter(conf, cache) {
    const repo = this._getRepo(conf);

    if (cache.repo !== repo) {
      cache.repo = repo;
      cache.isIgnored = cache.repo != null && cache.repo.isProjectAtRoot() && cache.repo.isPathIgnored(this._uri);
    }

    return cache.isIgnored;
  }

  _checkedStatusGetter(conf, cache) {
    if (cache.editedWorkingSet !== conf.editedWorkingSet) {
      cache.editedWorkingSet = conf.editedWorkingSet;

      if (cache.editedWorkingSet.isEmpty()) {
        cache.checkedStatus = 'clear';
      } else {
        if (this._isContainer) {
          if (cache.editedWorkingSet.containsFileBySplitPath(this._splitPath)) {
            cache.checkedStatus = 'checked';
          } else if (cache.editedWorkingSet.containsDirBySplitPath(this._splitPath)) {
            cache.checkedStatus = 'partial';
          } else {
            cache.checkedStatus = 'clear';
          }
        } else {
          cache.checkedStatus = cache.editedWorkingSet.containsFileBySplitPath(this._splitPath) ? 'checked' : 'clear';
        }
      }
    }

    return cache.checkedStatus;
  }

  _containedInWorkingSetGetter(conf, cache) {
    if (cache.workingSet !== conf.workingSet) {
      cache.workingSet = conf.workingSet;
      cache.containedInWorkingSet = this._isContainer ? cache.workingSet.containsDirBySplitPath(this._splitPath) : cache.workingSet.containsFileBySplitPath(this._splitPath);
    }

    return cache.containedInWorkingSet;
  }

  _containedInOpenFilesWorkingSetGetter(conf, cache) {
    if (cache.openFilesWorkingSet !== conf.openFilesWorkingSet) {
      cache.openFilesWorkingSet = conf.openFilesWorkingSet;

      if (cache.openFilesWorkingSet.isEmpty()) {
        cache.containedInOpenFilesWorkingSet = false;
      } else {
        cache.containedInOpenFilesWorkingSet = this._isContainer ? cache.openFilesWorkingSet.containsDirBySplitPath(this._splitPath) : cache.openFilesWorkingSet.containsFileBySplitPath(this._splitPath);
      }
    }

    return cache.containedInOpenFilesWorkingSet;
  }

  _shouldBeShownGetter(conf, cache) {
    const isIgnored = this._getIsIgnored(conf);

    const containedInWorkingSet = this._getContainedInWorkingSet(conf);

    const containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(conf);

    if (cache.isIgnored !== isIgnored || cache.excludeVcsIgnoredPaths !== conf.excludeVcsIgnoredPaths || cache.hideVcsIgnoredPaths !== conf.hideVcsIgnoredPaths || cache.hideIgnoredNames !== conf.hideIgnoredNames || cache.ignoredPatterns !== conf.ignoredPatterns || cache.isEditingWorkingSet !== conf.isEditingWorkingSet || cache.containedInWorkingSet !== containedInWorkingSet || cache.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet) {
      cache.isIgnored = isIgnored;
      cache.excludeVcsIgnoredPaths = conf.excludeVcsIgnoredPaths;
      cache.hideVcsIgnoredPaths = conf.hideVcsIgnoredPaths;
      cache.hideIgnoredNames = conf.hideIgnoredNames;
      cache.ignoredPatterns = conf.ignoredPatterns;
      cache.isEditingWorkingSet = conf.isEditingWorkingSet;
      cache.containedInWorkingSet = containedInWorkingSet;
      cache.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

      if (cache.isIgnored && cache.excludeVcsIgnoredPaths && cache.hideVcsIgnoredPaths) {
        cache.shouldBeShown = false;
      } else if (cache.hideIgnoredNames && cache.ignoredPatterns.some(p => p.match(this._uri))) {
        cache.shouldBeShown = false;
      } else if (cache.isEditingWorkingSet) {
        cache.shouldBeShown = true;
      } else {
        cache.shouldBeShown = cache.containedInWorkingSet || cache.containedInOpenFilesWorkingSet;
      }
    }

    return cache.shouldBeShown;
  }

  _shouldBeSoftenedGetter(conf, cache) {
    const containedInWorkingSet = this._getContainedInWorkingSet(conf);

    const containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(conf);

    if (cache.isEditingWorkingSet !== conf.isEditingWorkingSet || cache.containedInWorkingSet !== containedInWorkingSet || cache.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet) {
      cache.isEditingWorkingSet = conf.isEditingWorkingSet;
      cache.containedInWorkingSet = containedInWorkingSet;
      cache.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

      if (cache.isEditingWorkingSet) {
        cache.shouldBeSoftened = false;
      } else {
        cache.shouldBeSoftened = !cache.containedInWorkingSet && cache.containedInOpenFilesWorkingSet;
      }
    }

    return cache.shouldBeSoftened;
  }

  buildDerivedFields(conf) {
    return {
      isContainer: this._isContainer,
      repo: this._getRepo(conf),
      isIgnored: this._getIsIgnored(conf),
      checkedStatus: this._getCheckedStatus(conf),
      shouldBeShown: this._getShouldBeShown(conf),
      shouldBeSoftened: this._getShouldBeSoftened(conf)
    };
  }

}

exports.MemoizedFieldsDeriver = MemoizedFieldsDeriver;

function memoize(getter) {
  const cache = {};
  return conf => getter(conf, cache);
}