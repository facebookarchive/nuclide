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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var MercurialConflictContext = (function () {
  function MercurialConflictContext() {
    _classCallCheck(this, MercurialConflictContext);

    this.resolveText = 'Resolve';
    this.clearConflictState();
  }

  _createClass(MercurialConflictContext, [{
    key: 'setConflictingRepository',
    value: function setConflictingRepository(conflictingRepository) {
      this._conflictingRepository = conflictingRepository;
      // TODO(most) Prioritize the current working directory's repository
      // in the non-typical case of multiple conflicting project repositories.
      this.priority = 2;
      this.workingDirectory = conflictingRepository._workingDirectory;
    }
  }, {
    key: 'getConflictingRepository',
    value: function getConflictingRepository() {
      return this._conflictingRepository;
    }

    /**
     * Set the ConflictsContext to no-conflicts state.
     */
  }, {
    key: 'clearConflictState',
    value: function clearConflictState() {
      this._cachedMergeConflicts = [];
      this._conflictingRepository = null;
      this.priority = -1;
      this.workingDirectory = new (_atom2 || _atom()).Directory('');
    }
  }, {
    key: 'readConflicts',
    value: _asyncToGenerator(function* () {
      if (this._conflictingRepository == null) {
        return [];
      }
      this._cachedMergeConflicts = yield this._conflictingRepository.fetchMergeConflicts();
      return this._cachedMergeConflicts;
    })
  }, {
    key: 'isResolvedFile',
    value: _asyncToGenerator(function* (filePath) {
      return this._cachedMergeConflicts.findIndex(function (mergeConflict) {
        return mergeConflict.path === filePath;
      }) === -1;
    })
  }, {
    key: 'checkoutSide',
    value: _asyncToGenerator(function* (sideName, filePath) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.checkout-side-requested');
      throw new Error('Checkout sides is still not working for Mercurial repos');
    })
  }, {
    key: 'resolveFile',
    value: _asyncToGenerator(function* (filePath) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.resolve-file');
      if (this._conflictingRepository == null) {
        throw new Error('Mercurial merge conflict resolver doesn\'t have a conflicting repository');
      }
      yield this._conflictingRepository.resolveConflictedFile(filePath);
      this._cachedMergeConflicts = this._cachedMergeConflicts.filter(function (mergeConflict) {
        return mergeConflict.path !== filePath;
      });
    })

    // Deletermine if that's a rebase or merge operation.
  }, {
    key: 'isRebasing',
    value: function isRebasing() {
      // TODO(most) check rebase or merge conflict state.
      return true;
    }
  }, {
    key: 'joinPath',
    value: function joinPath(relativePath) {
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(this.workingDirectory.getPath(), relativePath);
    }
  }, {
    key: 'complete',
    value: function complete(wasRebasing) {
      var _this = this;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.complete-resolving');
      (0, (_assert2 || _assert()).default)(wasRebasing, 'Mercurial conflict resolver only handles rebasing');
      (0, (_assert2 || _assert()).default)(this._conflictingRepository != null, 'merge conflicts complete with no active repository!');
      var repository = this._conflictingRepository;
      var notification = atom.notifications.addSuccess('All Conflicts Resolved<br/>\n' + 'Click `Continue` to run: `hg rebase --continue`', {
        buttons: [{
          onDidClick: _asyncToGenerator(function* () {
            notification.dismiss();
            _this.clearConflictState();
            try {
              yield repository.continueRebase();
              atom.notifications.addInfo('Rebase continued');
            } catch (error) {
              atom.notifications.addError('Failed to continue rebase\n' + 'You will have to run `hg rebase --continue` manually.');
            }
          }),
          text: 'Continue'
        }],
        dismissable: true
      });
    }
  }, {
    key: 'quit',
    value: function quit(wasRebasing) {
      var _this2 = this;

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('hg-conflict-detctor.quit-resolving');
      (0, (_assert2 || _assert()).default)(wasRebasing, 'Mercurial conflict resolver only handles rebasing');
      (0, (_assert2 || _assert()).default)(this._conflictingRepository != null, 'merge conflicts quit with no active repository!');
      var repository = this._conflictingRepository;
      var notification = atom.notifications.addWarning('Careful, You still have conflict markers!<br/>\n' + 'Click `Abort` if you want to give up on this and run: `hg rebase --abort`.', {
        buttons: [{
          onDidClick: _asyncToGenerator(function* () {
            notification.dismiss();
            _this2.clearConflictState();
            try {
              yield repository.abortRebase();
              atom.notifications.addInfo('Rebase aborted');
            } catch (error) {
              atom.notifications.addError('Failed to abort rebase\n' + 'You will have to run `hg rebase --abort` manually.');
            }
          }),
          text: 'Abort'
        }],
        dismissable: true
      });
    }
  }]);

  return MercurialConflictContext;
})();

exports.MercurialConflictContext = MercurialConflictContext;

/**
 * The mercurial repository in a conflict state.
 * This would be `null` all the time except the timeframe in which one of the
 * projects' repositories
 */

/* `merge-conflicts` API */
// Used to join conflicting file paths (non-nullable).

// Used in UI buttons (hg-specific).

// The priority takes values: -1, 1, 2
// -1: when there are no conflicting repository.
//  1: when the conflicting repository isn't for the current working directory.
//  2: when the conflicting repository is for the current working directory.