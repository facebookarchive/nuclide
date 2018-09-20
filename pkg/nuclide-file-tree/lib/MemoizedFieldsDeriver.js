/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {StoreConfigData, NodeCheckedStatus} from './types';
import type {StatusCodeNumberValue} from '../../nuclide-hg-rpc/lib/types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import * as FileTreeHelpers from './FileTreeHelpers';
import {StatusCodeNumber} from '../../nuclide-hg-rpc/lib/hg-constants';

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
export class MemoizedFieldsDeriver {
  _uri: NuclideUri;
  _rootUri: NuclideUri;

  // These properties do not depend on the conf instance and can be calculated right away.
  _isRoot: boolean;
  _name: string;
  _isContainer: boolean;
  _relativePath: NuclideUri;
  _localPath: NuclideUri;
  _splitPath: Array<string>;

  _getRepo: (conf: StoreConfigData) => ?atom$Repository;
  _getIsIgnored: (conf: StoreConfigData) => boolean;
  _getVcsStatusCode: (conf: StoreConfigData) => StatusCodeNumberValue;
  _getCheckedStatus: (conf: StoreConfigData) => NodeCheckedStatus;
  _getContainedInWorkingSet: (conf: StoreConfigData) => boolean;
  _getContainedInOpenFilesWorkingSet: (conf: StoreConfigData) => boolean;
  _getShouldBeShown: (conf: StoreConfigData) => boolean;
  _getShouldBeSoftened: (conf: StoreConfigData) => boolean;

  constructor(uri: NuclideUri, rootUri: NuclideUri) {
    this._uri = uri;
    this._rootUri = rootUri;

    this._isRoot = uri === rootUri;
    this._name = FileTreeHelpers.keyToName(uri);
    this._isContainer = FileTreeHelpers.isDirOrArchiveKey(uri);
    this._relativePath = nuclideUri.relative(rootUri, uri);
    this._localPath = FileTreeHelpers.keyToPath(
      nuclideUri.isRemote(uri) ? nuclideUri.parse(uri).path : uri,
    );
    this._splitPath = nuclideUri.split(uri);

    this._getRepo = memoize(this._repoGetter.bind(this));
    this._getVcsStatusCode = memoize(this._vcsStatusCodeGetter.bind(this));
    this._getIsIgnored = memoize(this._isIgnoredGetter.bind(this));
    this._getCheckedStatus = memoize(this._checkedStatusGetter.bind(this));
    this._getContainedInWorkingSet = memoize(
      this._containedInWorkingSetGetter.bind(this),
    );
    this._getContainedInOpenFilesWorkingSet = memoize(
      this._containedInOpenFilesWorkingSetGetter.bind(this),
    );
    this._getShouldBeShown = memoize(this._shouldBeShownGetter.bind(this));
    this._getShouldBeSoftened = memoize(
      this._shouldBeSoftenedGetter.bind(this),
    );
  }

  _repoGetter(conf: StoreConfigData, cache: Object): ?atom$Repository {
    if (cache.reposByRoot !== conf.reposByRoot) {
      cache.reposByRoot = conf.reposByRoot;

      cache.repo = cache.reposByRoot[this._rootUri];
    }

    return cache.repo;
  }

  _vcsStatusCodeGetter(
    conf: StoreConfigData,
    cache: Object,
  ): StatusCodeNumberValue {
    if (cache.vcsStatuses !== conf.vcsStatuses) {
      cache.vcsStatuses = conf.vcsStatuses;

      const rootVcsStatuses = cache.vcsStatuses.get(this._rootUri) || new Map();
      cache.vcsStatusCode =
        rootVcsStatuses.get(this._uri) || StatusCodeNumber.CLEAN;
    }

    return cache.vcsStatusCode;
  }

  _isIgnoredGetter(conf: StoreConfigData, cache: Object): boolean {
    const repo = this._getRepo(conf);
    if (cache.repo !== repo) {
      cache.repo = repo;

      cache.isIgnored =
        cache.repo != null &&
        cache.repo.isProjectAtRoot() &&
        cache.repo.isPathIgnored(this._uri);
    }

    return cache.isIgnored;
  }

  _checkedStatusGetter(
    conf: StoreConfigData,
    cache: Object,
  ): NodeCheckedStatus {
    if (cache.editedWorkingSet !== conf.editedWorkingSet) {
      cache.editedWorkingSet = conf.editedWorkingSet;

      if (cache.editedWorkingSet.isEmpty()) {
        cache.checkedStatus = 'clear';
      } else {
        if (this._isContainer) {
          if (cache.editedWorkingSet.containsFileBySplitPath(this._splitPath)) {
            cache.checkedStatus = 'checked';
          } else if (
            cache.editedWorkingSet.containsDirBySplitPath(this._splitPath)
          ) {
            cache.checkedStatus = 'partial';
          } else {
            cache.checkedStatus = 'clear';
          }
        } else {
          cache.checkedStatus = cache.editedWorkingSet.containsFileBySplitPath(
            this._splitPath,
          )
            ? 'checked'
            : 'clear';
        }
      }
    }

    return cache.checkedStatus;
  }

  _containedInWorkingSetGetter(conf: StoreConfigData, cache: Object): boolean {
    if (cache.workingSet !== conf.workingSet) {
      cache.workingSet = conf.workingSet;

      cache.containedInWorkingSet = this._isContainer
        ? cache.workingSet.containsDirBySplitPath(this._splitPath)
        : cache.workingSet.containsFileBySplitPath(this._splitPath);
    }

    return cache.containedInWorkingSet;
  }

  _containedInOpenFilesWorkingSetGetter(
    conf: StoreConfigData,
    cache: Object,
  ): boolean {
    if (cache.openFilesWorkingSet !== conf.openFilesWorkingSet) {
      cache.openFilesWorkingSet = conf.openFilesWorkingSet;

      if (cache.openFilesWorkingSet.isEmpty()) {
        cache.containedInOpenFilesWorkingSet = false;
      } else {
        cache.containedInOpenFilesWorkingSet = this._isContainer
          ? cache.openFilesWorkingSet.containsDirBySplitPath(this._splitPath)
          : cache.openFilesWorkingSet.containsFileBySplitPath(this._splitPath);
      }
    }

    return cache.containedInOpenFilesWorkingSet;
  }

  _shouldBeShownGetter(conf: StoreConfigData, cache: Object): boolean {
    const isIgnored = this._getIsIgnored(conf);
    const containedInWorkingSet = this._getContainedInWorkingSet(conf);
    const containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(
      conf,
    );

    if (
      cache.isIgnored !== isIgnored ||
      cache.excludeVcsIgnoredPaths !== conf.excludeVcsIgnoredPaths ||
      cache.hideVcsIgnoredPaths !== conf.hideVcsIgnoredPaths ||
      cache.hideIgnoredNames !== conf.hideIgnoredNames ||
      cache.ignoredPatterns !== conf.ignoredPatterns ||
      cache.isEditingWorkingSet !== conf.isEditingWorkingSet ||
      cache.containedInWorkingSet !== containedInWorkingSet ||
      cache.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet
    ) {
      cache.isIgnored = isIgnored;
      cache.excludeVcsIgnoredPaths = conf.excludeVcsIgnoredPaths;
      cache.hideVcsIgnoredPaths = conf.hideVcsIgnoredPaths;
      cache.hideIgnoredNames = conf.hideIgnoredNames;
      cache.ignoredPatterns = conf.ignoredPatterns;
      cache.isEditingWorkingSet = conf.isEditingWorkingSet;
      cache.containedInWorkingSet = containedInWorkingSet;
      cache.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

      if (
        cache.isIgnored &&
        cache.excludeVcsIgnoredPaths &&
        cache.hideVcsIgnoredPaths
      ) {
        cache.shouldBeShown = false;
      } else if (
        cache.hideIgnoredNames &&
        cache.ignoredPatterns.some(p => p.match(this._uri))
      ) {
        cache.shouldBeShown = false;
      } else if (cache.isEditingWorkingSet) {
        cache.shouldBeShown = true;
      } else {
        cache.shouldBeShown =
          cache.containedInWorkingSet || cache.containedInOpenFilesWorkingSet;
      }
    }

    return cache.shouldBeShown;
  }

  _shouldBeSoftenedGetter(conf: StoreConfigData, cache: Object): boolean {
    const containedInWorkingSet = this._getContainedInWorkingSet(conf);
    const containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(
      conf,
    );

    if (
      cache.isEditingWorkingSet !== conf.isEditingWorkingSet ||
      cache.containedInWorkingSet !== containedInWorkingSet ||
      cache.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet
    ) {
      cache.isEditingWorkingSet = conf.isEditingWorkingSet;
      cache.containedInWorkingSet = containedInWorkingSet;
      cache.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

      if (cache.isEditingWorkingSet) {
        cache.shouldBeSoftened = false;
      } else {
        cache.shouldBeSoftened =
          !cache.containedInWorkingSet && cache.containedInOpenFilesWorkingSet;
      }
    }

    return cache.shouldBeSoftened;
  }

  buildDerivedFields(conf: StoreConfigData): Object {
    return {
      isRoot: this._isRoot,
      name: this._name,
      isContainer: this._isContainer,
      relativePath: this._relativePath,
      localPath: this._localPath,

      repo: this._getRepo(conf),
      vcsStatusCode: this._getVcsStatusCode(conf),
      isIgnored: this._getIsIgnored(conf),
      checkedStatus: this._getCheckedStatus(conf),
      shouldBeShown: this._getShouldBeShown(conf),
      shouldBeSoftened: this._getShouldBeSoftened(conf),
    };
  }
}

function memoize<T>(
  getter: (conf: StoreConfigData, cache: Object) => T,
): (conf: StoreConfigData) => T {
  const cache = {};

  return conf => getter(conf, cache);
}
