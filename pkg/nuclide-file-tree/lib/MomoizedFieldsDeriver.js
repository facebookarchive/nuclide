Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _FileTreeHelpers2;

function _FileTreeHelpers() {
  return _FileTreeHelpers2 = require('./FileTreeHelpers');
}

var _nuclideHgRepositoryBaseLibHgConstants2;

function _nuclideHgRepositoryBaseLibHgConstants() {
  return _nuclideHgRepositoryBaseLibHgConstants2 = require('../../nuclide-hg-repository-base/lib/hg-constants');
}

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
 * Each getter has a separate store instance which it is using for the memoization.
 * In this class' memoization strategy only the last value (and all its params, of course) are
 * stored.
 *
 */

var MomoizedFieldsDeriver = (function () {
  function MomoizedFieldsDeriver(uri, rootUri) {
    _classCallCheck(this, MomoizedFieldsDeriver);

    this._uri = uri;
    this._rootUri = rootUri;

    this._isRoot = uri === rootUri;
    this._name = (0, (_FileTreeHelpers2 || _FileTreeHelpers()).keyToName)(uri);
    this._isContainer = (0, (_FileTreeHelpers2 || _FileTreeHelpers()).isDirKey)(uri);
    this._relativePath = uri.slice(rootUri.length);
    this._localPath = (0, (_FileTreeHelpers2 || _FileTreeHelpers()).keyToPath)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isRemote(uri) ? (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(uri).pathname : uri);
    this._splitPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.split(uri);

    this._getRepo = memoize(this._repoGetter.bind(this));
    this._getVcsStatusCode = memoize(this._vcsStatusCodeGetter.bind(this));
    this._getIsIgnored = memoize(this._isIgnoredGetter.bind(this));
    this._getCheckedStatus = memoize(this._checkedStatusGetter.bind(this));
    this._getContainedInWorkingSet = memoize(this._containedInWorkingSetGetter.bind(this));
    this._getContainedInOpenFilesWorkingSet = memoize(this._containedInOpenFilesWorkingSetGetter.bind(this));
    this._getShouldBeShown = memoize(this._shouldBeShownGetter.bind(this));
    this._getShouldBeSoftened = memoize(this._shouldBeSoftenedGetter.bind(this));
  }

  _createClass(MomoizedFieldsDeriver, [{
    key: '_repoGetter',
    value: function _repoGetter(conf, store) {
      if (store.reposByRoot !== conf.reposByRoot) {
        store.reposByRoot = conf.reposByRoot;

        store.repo = store.reposByRoot[this._rootUri];
      }

      return store.repo;
    }
  }, {
    key: '_vcsStatusCodeGetter',
    value: function _vcsStatusCodeGetter(conf, store) {
      if (store.vcsStatuses !== conf.vcsStatuses) {
        store.vcsStatuses = conf.vcsStatuses;

        var rootVcsStatuses = store.vcsStatuses.get(this._rootUri) || {};
        store.vcsStatusCode = rootVcsStatuses[this._uri] || (_nuclideHgRepositoryBaseLibHgConstants2 || _nuclideHgRepositoryBaseLibHgConstants()).StatusCodeNumber.CLEAN;
      }

      return store.vcsStatusCode;
    }
  }, {
    key: '_isIgnoredGetter',
    value: function _isIgnoredGetter(conf, store) {
      var repo = this._getRepo(conf);
      if (store.repo !== repo) {
        store.repo = repo;

        store.isIgnored = store.repo != null && store.repo.isProjectAtRoot() && store.repo.isPathIgnored(this._uri);
      }

      return store.isIgnored;
    }
  }, {
    key: '_checkedStatusGetter',
    value: function _checkedStatusGetter(conf, store) {
      if (store.editedWorkingSet !== conf.editedWorkingSet) {
        store.editedWorkingSet = conf.editedWorkingSet;

        if (store.editedWorkingSet.isEmpty()) {
          store.checkedStatus = 'clear';
        } else {
          if (this._isContainer) {
            if (store.editedWorkingSet.containsFileBySplitPath(this._splitPath)) {
              store.checkedStatus = 'checked';
            } else if (store.editedWorkingSet.containsDirBySplitPath(this._splitPath)) {
              store.checkedStatus = 'partial';
            } else {
              store.checkedStatus = 'clear';
            }
          } else {
            store.checkedStatus = store.editedWorkingSet.containsFileBySplitPath(this._splitPath) ? 'checked' : 'clear';
          }
        }
      }

      return store.checkedStatus;
    }
  }, {
    key: '_containedInWorkingSetGetter',
    value: function _containedInWorkingSetGetter(conf, store) {
      if (store.workingSet !== conf.workingSet) {
        store.workingSet = conf.workingSet;

        store.containedInWorkingSet = this._isContainer ? store.workingSet.containsDirBySplitPath(this._splitPath) : store.workingSet.containsFileBySplitPath(this._splitPath);
      }

      return store.containedInWorkingSet;
    }
  }, {
    key: '_containedInOpenFilesWorkingSetGetter',
    value: function _containedInOpenFilesWorkingSetGetter(conf, store) {
      if (store.openFilesWorkingSet !== conf.openFilesWorkingSet) {
        store.openFilesWorkingSet = conf.openFilesWorkingSet;

        if (store.openFilesWorkingSet.isEmpty()) {
          store.containedInOpenFilesWorkingSet = false;
        } else {
          store.containedInOpenFilesWorkingSet = this._isContainer ? store.openFilesWorkingSet.containsDirBySplitPath(this._splitPath) : store.openFilesWorkingSet.containsFileBySplitPath(this._splitPath);
        }
      }

      return store.containedInOpenFilesWorkingSet;
    }
  }, {
    key: '_shouldBeShownGetter',
    value: function _shouldBeShownGetter(conf, store) {
      var _this = this;

      var isIgnored = this._getIsIgnored(conf);
      var containedInWorkingSet = this._getContainedInWorkingSet(conf);
      var containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(conf);

      if (store.isIgnored !== isIgnored || store.excludeVcsIgnoredPaths !== conf.excludeVcsIgnoredPaths || store.hideIgnoredNames !== conf.hideIgnoredNames || store.ignoredPatterns !== conf.ignoredPatterns || store.isEditingWorkingSet !== conf.isEditingWorkingSet || store.containedInWorkingSet !== containedInWorkingSet || store.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet) {
        store.isIgnored = isIgnored;
        store.excludeVcsIgnoredPaths = conf.excludeVcsIgnoredPaths;
        store.hideIgnoredNames = conf.hideIgnoredNames;
        store.ignoredPatterns = conf.ignoredPatterns;
        store.isEditingWorkingSet = conf.isEditingWorkingSet;
        store.containedInWorkingSet = containedInWorkingSet;
        store.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

        if (store.isIgnored && store.excludeVcsIgnoredPaths) {
          store.shouldBeShown = false;
        } else if (store.hideIgnoredNames && store.ignoredPatterns.some(function (p) {
          return p.match(_this._uri);
        })) {
          store.shouldBeShown = false;
        } else if (store.isEditingWorkingSet) {
          store.shouldBeShown = true;
        } else {
          store.shouldBeShown = store.containedInWorkingSet || store.containedInOpenFilesWorkingSet;
        }
      }

      return store.shouldBeShown;
    }
  }, {
    key: '_shouldBeSoftenedGetter',
    value: function _shouldBeSoftenedGetter(conf, store) {
      var containedInWorkingSet = this._getContainedInWorkingSet(conf);
      var containedInOpenFilesWorkingSet = this._getContainedInOpenFilesWorkingSet(conf);

      if (store.isEditingWorkingSet !== conf.isEditingWorkingSet || store.containedInWorkingSet !== containedInWorkingSet || store.containedInOpenFilesWorkingSet !== containedInOpenFilesWorkingSet) {
        store.isEditingWorkingSet = conf.isEditingWorkingSet;
        store.containedInWorkingSet = containedInWorkingSet;
        store.containedInOpenFilesWorkingSet = containedInOpenFilesWorkingSet;

        if (store.isEditingWorkingSet) {
          store.shouldBeSoftened = false;
        } else {
          store.shouldBeSoftened = !store.containedInWorkingSet && store.containedInOpenFilesWorkingSet;
        }
      }

      return store.shouldBeSoftened;
    }
  }, {
    key: 'buildDerivedFields',
    value: function buildDerivedFields(conf) {
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
        shouldBeSoftened: this._getShouldBeSoftened(conf)
      };
    }
  }]);

  return MomoizedFieldsDeriver;
})();

exports.MomoizedFieldsDeriver = MomoizedFieldsDeriver;

function memoize(getter) {
  var store = {};

  return function (conf) {
    return getter(conf, store);
  };
}

// These properties do not depend on the conf instance and can be calculated right away.