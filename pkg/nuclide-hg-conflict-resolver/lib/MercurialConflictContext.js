'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MercurialConflictContext = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MercurialConflictContext {
  // Used in UI buttons (hg-specific).
  constructor() {
    this.resolveText = 'Resolve';
    this.clearConflictState();
  }
  // The priority takes values: -1, 1, 2
  // -1: when there are no conflicting repository.
  //  1: when the conflicting repository isn't for the current working directory.
  //  2: when the conflicting repository is for the current working directory.


  /* `merge-conflicts` API */
  // Used to join conflicting file paths (non-nullable).

  /**
   * The mercurial repository in a conflict state.
   * This would be `null` all the time except the timeframe in which one of the
   * projects' repositories
   */


  setConflictingRepository(conflictingRepository) {
    this._conflictingRepository = conflictingRepository;
    // TODO(most) Prioritize the current working directory's repository
    // in the non-typical case of multiple conflicting project repositories.
    this.priority = 2;
    this.workingDirectory = conflictingRepository._workingDirectory;
  }

  getConflictingRepository() {
    return this._conflictingRepository;
  }

  /**
   * Set the ConflictsContext to no-conflicts state.
   */
  clearConflictState() {
    this._cachedMergeConflicts = [];
    this._conflictingRepository = null;
    this.priority = -1;
    this.workingDirectory = new _atom.Directory('');
  }

  readConflicts() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this._conflictingRepository == null) {
        return [];
      }
      _this._cachedMergeConflicts = yield _this._conflictingRepository.fetchMergeConflicts();
      return _this._cachedMergeConflicts;
    })();
  }

  isResolvedFile(filePath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this2._cachedMergeConflicts.findIndex(function (mergeConflict) {
        return mergeConflict.path === filePath;
      }) === -1;
    })();
  }

  checkoutSide(sideName, filePath) {
    return (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.checkout-side-requested');
      throw new Error('Checkout sides is still not working for Mercurial repos');
    })();
  }

  resolveFile(filePath) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.resolve-file');
      if (_this3._conflictingRepository == null) {
        throw new Error('Mercurial merge conflict resolver doesn\'t have a conflicting repository');
      }
      yield _this3._conflictingRepository.resolveConflictedFile(filePath).toPromise();
      _this3._cachedMergeConflicts = _this3._cachedMergeConflicts.filter(function (mergeConflict) {
        return mergeConflict.path !== filePath;
      });
    })();
  }

  // Deletermine if that's a rebase or merge operation.
  isRebasing() {
    // TODO(most) check rebase or merge conflict state.
    return true;
  }

  joinPath(relativePath) {
    return (_nuclideUri || _load_nuclideUri()).default.join(this.workingDirectory.getPath(), relativePath);
  }

  complete(wasRebasing) {
    var _this4 = this;

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.complete-resolving');

    if (!wasRebasing) {
      throw new Error('Mercurial conflict resolver only handles rebasing');
    }

    if (!(this._conflictingRepository != null)) {
      throw new Error('merge conflicts complete with no active repository!');
    }

    const repository = this._conflictingRepository;
    const notification = atom.notifications.addSuccess('All Conflicts Resolved\n' + 'Click `Continue` to run: `hg rebase --continue`', {
      buttons: [{
        onDidClick: (() => {
          var _ref = (0, _asyncToGenerator.default)(function* () {
            notification.dismiss();
            _this4.clearConflictState();
            try {
              yield repository.continueRebase().toPromise();
              atom.notifications.addInfo('Rebase continued');
            } catch (error) {
              atom.notifications.addError('Failed to continue rebase\n' + 'You will have to run `hg rebase --continue` manually.');
            }
          });

          return function onDidClick() {
            return _ref.apply(this, arguments);
          };
        })(),
        text: 'Continue'
      }],
      dismissable: true
    });
  }

  quit(wasRebasing) {
    var _this5 = this;

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-conflict-detctor.quit-resolving');

    if (!wasRebasing) {
      throw new Error('Mercurial conflict resolver only handles rebasing');
    }

    if (!(this._conflictingRepository != null)) {
      throw new Error('merge conflicts quit with no active repository!');
    }

    const repository = this._conflictingRepository;
    const notification = atom.notifications.addWarning('Careful, You still have conflict markers!<br/>\n' + 'Click `Abort` if you want to give up on this and run: `hg rebase --abort`.', {
      buttons: [{
        onDidClick: (() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* () {
            notification.dismiss();
            _this5.clearConflictState();
            try {
              yield repository.abortRebase();
              atom.notifications.addInfo('Rebase aborted');
            } catch (error) {
              atom.notifications.addError('Failed to abort rebase\n' + 'You will have to run `hg rebase --abort` manually.');
            }
          });

          return function onDidClick() {
            return _ref2.apply(this, arguments);
          };
        })(),
        text: 'Abort'
      }],
      dismissable: true
    });
  }
}
exports.MercurialConflictContext = MercurialConflictContext; /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              */