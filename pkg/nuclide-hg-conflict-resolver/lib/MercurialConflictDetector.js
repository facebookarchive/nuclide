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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _MercurialConflictContext2;

function _MercurialConflictContext() {
  return _MercurialConflictContext2 = require('./MercurialConflictContext');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var MercurialConflictDetector = (function () {
  function MercurialConflictDetector() {
    _classCallCheck(this, MercurialConflictDetector);

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._repositorySubscriptions = new Map();
    this._mercurialConflictContext = new (_MercurialConflictContext2 || _MercurialConflictContext()).MercurialConflictContext();
    this._subscriptions.add(atom.project.onDidChangePaths(this._updateRepositories.bind(this)));
  }

  _createClass(MercurialConflictDetector, [{
    key: 'setConflictsApi',
    value: function setConflictsApi(conflictsApi) {
      var _this = this;

      this._conflictsApi = conflictsApi;
      conflictsApi.registerContextApi({
        getContext: function getContext() {
          return Promise.resolve(_this._mercurialConflictContext);
        }
      });
      this._updateRepositories();
    }
  }, {
    key: '_updateRepositories',
    value: function _updateRepositories() {
      var repositories = new Set(atom.project.getRepositories().filter(function (repository) {
        return repository != null && repository.getType() === 'hg';
      }));
      // Dispose removed projects repositories, if any.
      for (var _ref3 of this._repositorySubscriptions) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var repository = _ref2[0];
        var repositorySubscription = _ref2[1];

        if (repositories.has(repository)) {
          continue;
        }
        repositorySubscription.dispose();
        this._repositorySubscriptions.delete(repository);
      }

      // Add the new project repositories, if any.
      for (var repository of repositories) {
        if (this._repositorySubscriptions.has(repository)) {
          continue;
        }
        this._watchRepository(repository);
      }
    }
  }, {
    key: '_watchRepository',
    value: function _watchRepository(repository) {
      var _this2 = this;

      var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
      this._conflictStateChanged(repository);
      subscriptions.add(repository.onDidChangeConflictState(function () {
        return _this2._conflictStateChanged(repository);
      }));
      this._repositorySubscriptions.set(repository, subscriptions);
    }
  }, {
    key: '_conflictStateChanged',
    value: function _conflictStateChanged(repository) {
      var conflictsApi = this._conflictsApi;
      if (conflictsApi == null || conflictsApi.showForContext == null) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('No compatible "merge-conflicts" API found.');
        return;
      }
      if (repository.isInConflict()) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.detected-conflicts');
        this._mercurialConflictContext.setConflictingRepository(repository);
        conflictsApi.showForContext(this._mercurialConflictContext);
        atom.notifications.addWarning('Nuclide detected merge conflicts in your active project\'s repository', {
          detail: 'Use the conflicts resolver UI below to help resolve them',
          nativeFriendly: true
        });
      } else {
        var toClear = this._mercurialConflictContext.getConflictingRepository() === repository;
        if (toClear) {
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.resolved-outside-nuclide');
          this._mercurialConflictContext.clearConflictState();
          conflictsApi.hideForContext(this._mercurialConflictContext);
          atom.notifications.addInfo('Conflicts resolved outside of Nuclide');
          (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().info('Conflicts resolved outside of Nuclide');
        } else {
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.resolved-in-nuclide');
        }
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      for (var repositorySubscription of this._repositorySubscriptions.values()) {
        repositorySubscription.dispose();
      }
      this._repositorySubscriptions.clear();
    }
  }]);

  return MercurialConflictDetector;
})();

exports.MercurialConflictDetector = MercurialConflictDetector;