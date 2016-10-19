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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _notifications;

function _load_notifications() {
  return _notifications = require('./notifications');
}

var _commonsAtomTextEditor;

function _load_commonsAtomTextEditor() {
  return _commonsAtomTextEditor = require('../../commons-atom/text-editor');
}

var ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
var DID_UPDATE_STATE_EVENT = 'did-update-state';

function getInitialState() {
  return {
    fromRevisionTitle: 'No file selected',
    toRevisionTitle: 'No file selected',
    filePath: '',
    oldContents: '',
    newContents: '',
    isLoadingFileDiff: false,
    inlineComponents: [],
    activeRepository: null,
    viewMode: (_constants || _load_constants()).DiffMode.BROWSE_MODE,
    commitMessage: null,
    commitMode: (_constants || _load_constants()).CommitMode.COMMIT,
    commitModeState: (_constants || _load_constants()).CommitModeState.READY,
    shouldRebaseOnAmend: true,
    publishMessage: null,
    publishMode: (_constants || _load_constants()).PublishMode.CREATE,
    publishModeState: (_constants || _load_constants()).PublishModeState.READY,
    headCommitMessage: null,
    dirtyFileChanges: new Map(),
    selectedFileChanges: new Map(),
    isLoadingSelectedFiles: false,
    showNonHgRepos: true,
    revisionsState: null
  };
}

var DiffViewModel = (function () {
  function DiffViewModel(actionCreators) {
    _classCallCheck(this, DiffViewModel);

    this._actionCreators = actionCreators;
    this._emitter = new (_atom || _load_atom()).Emitter();
    this._publishUpdates = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    this._state = getInitialState();
  }

  _createDecoratedClass(DiffViewModel, [{
    key: 'diffFile',
    value: function diffFile(filePath) {
      this._actionCreators.diffFile(filePath, this.emitActiveBufferChangeModified.bind(this));
    }
  }, {
    key: 'getActiveStackDirtyFileChanges',
    value: function getActiveStackDirtyFileChanges() {
      return this._state.dirtyFileChanges;
    }
  }, {
    key: 'setViewMode',
    value: function setViewMode(viewMode) {
      this._actionCreators.setViewMode(viewMode);
    }
  }, {
    key: 'emitActiveBufferChangeModified',
    value: function emitActiveBufferChangeModified() {
      this._emitter.emit(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT);
    }
  }, {
    key: 'onDidActiveBufferChangeModified',
    value: function onDidActiveBufferChangeModified(callback) {
      return this._emitter.on(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT, callback);
    }
  }, {
    key: 'isActiveBufferModified',
    value: function isActiveBufferModified() {
      var filePath = this._state.filePath;

      var buffer = (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).bufferForUri)(filePath);
      return buffer.isModified();
    }
  }, {
    key: 'setCompareRevision',
    value: function setCompareRevision(revision) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-set-revision');
      (0, (_assert || _load_assert()).default)(this._state.activeRepository != null, 'There must be an active repository!');
      this._actionCreators.setCompareId(this._state.activeRepository, revision.id);
    }
  }, {
    key: 'getPublishUpdates',
    value: function getPublishUpdates() {
      return this._publishUpdates;
    }
  }, {
    key: 'saveActiveFile',
    decorators: [(0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('diff-view.save-file')],
    value: function saveActiveFile() {
      var filePath = this._state.filePath;

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-save-file', { filePath: filePath });
      return this._saveFile(filePath).catch((_notifications || _load_notifications()).notifyInternalError);
    }
  }, {
    key: 'publishDiff',
    value: _asyncToGenerator(function* (publishMessage, isPrepareMode, lintExcuse) {
      var activeRepository = this._state.activeRepository;
      (0, (_assert || _load_assert()).default)(activeRepository != null, 'Cannot publish without an active stack!');

      this._actionCreators.publishDiff(activeRepository, publishMessage, isPrepareMode, lintExcuse, this._publishUpdates);
    })
  }, {
    key: '_saveFile',
    value: _asyncToGenerator(function* (filePath) {
      var buffer = (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).bufferForUri)(filePath);
      if (buffer == null) {
        throw new Error('Could not find file buffer to save: `' + filePath + '`');
      }
      try {
        yield buffer.save();
      } catch (err) {
        throw new Error('Could not save file buffer: `' + filePath + '` - ' + err.toString());
      }
    })
  }, {
    key: 'onDidUpdateState',
    value: function onDidUpdateState(callback) {
      return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
    }
  }, {
    key: 'commit',
    value: function commit(message) {
      if (message === '') {
        atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
        return;
      }
      var activeRepository = this._state.activeRepository;
      (0, (_assert || _load_assert()).default)(activeRepository != null, 'No active repository stack');
      this._actionCreators.commit(activeRepository, message);
    }
  }, {
    key: 'injectState',
    value: function injectState(newState) {
      this._state = newState;
      this._emitter.emit(DID_UPDATE_STATE_EVENT);
    }
  }, {
    key: 'getState',
    value: function getState() {
      return this._state;
    }
  }, {
    key: 'setCommitMode',
    value: function setCommitMode(commitMode) {
      this._actionCreators.setCommitMode(commitMode);
    }
  }, {
    key: 'setShouldAmendRebase',
    value: function setShouldAmendRebase(shouldRebaseOnAmend) {
      this._actionCreators.setShouldRebaseOnAmend(shouldRebaseOnAmend);
    }
  }, {
    key: 'activate',
    value: function activate() {
      this._actionCreators.openView();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this._actionCreators.closeView();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.deactivate();
    }
  }]);

  return DiffViewModel;
})();

exports.default = DiffViewModel;
module.exports = exports.default;