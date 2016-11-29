'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _notifications;

function _load_notifications() {
  return _notifications = require('./notifications');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
const DID_UPDATE_STATE_EVENT = 'did-update-state';

class DiffViewModel {

  constructor(actionCreators, progressUpdates) {
    this._actionCreators = actionCreators;
    this._progressUpdates = progressUpdates;
    this._emitter = new _atom.Emitter();
    this._state = (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
  }

  diffFile(filePath) {
    this._actionCreators.diffFile(filePath, this.emitActiveBufferChangeModified.bind(this));
  }

  getDirtyFileChangesCount() {
    const { activeRepositoryState: { dirtyFiles } } = this._state;
    return dirtyFiles.size;
  }

  setViewMode(viewMode) {
    this._actionCreators.setViewMode(viewMode);
  }

  emitActiveBufferChangeModified() {
    this._emitter.emit(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT);
  }

  onDidActiveBufferChangeModified(callback) {
    return this._emitter.on(ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT, callback);
  }

  isActiveBufferModified() {
    const { filePath } = this._state.fileDiff;
    const buffer = (0, (_textEditor || _load_textEditor()).bufferForUri)(filePath);
    return buffer.isModified();
  }

  setCompareRevision(revision) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-set-revision');

    if (!(this._state.activeRepository != null)) {
      throw new Error('There must be an active repository!');
    }

    this._actionCreators.setCompareId(this._state.activeRepository, revision.id);
  }

  saveActiveFile() {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('diff-view.save-file', () => {
      const { filePath } = this._state.fileDiff;
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-save-file');
      return this._saveFile(filePath).catch((_notifications || _load_notifications()).notifyInternalError);
    });
  }

  publishDiff(publishMessage, isPrepareMode, lintExcuse) {
    const activeRepository = this._state.activeRepository;

    if (!(activeRepository != null)) {
      throw new Error('Cannot publish without an active stack!');
    }

    this._actionCreators.publishDiff(activeRepository, publishMessage, isPrepareMode, lintExcuse, this._progressUpdates);
  }

  updatePublishMessage(message) {
    const { publish } = this._state;
    this._actionCreators.updatePublishState(Object.assign({}, publish, {
      message
    }));
  }

  _saveFile(filePath) {
    return (0, _asyncToGenerator.default)(function* () {
      const buffer = (0, (_textEditor || _load_textEditor()).bufferForUri)(filePath);
      if (buffer == null) {
        throw new Error(`Could not find file buffer to save: \`${ filePath }\``);
      }
      try {
        yield buffer.save();
      } catch (err) {
        throw new Error(`Could not save file buffer: \`${ filePath }\` - ${ err.toString() }`);
      }
    })();
  }

  onDidUpdateState(callback) {
    return this._emitter.on(DID_UPDATE_STATE_EVENT, callback);
  }

  commit(message) {
    if (message === '') {
      atom.notifications.addError('Commit aborted', { detail: 'Commit message empty' });
      return;
    }
    const activeRepository = this._state.activeRepository;

    if (!(activeRepository != null)) {
      throw new Error('No active repository stack');
    }

    this._actionCreators.commit(activeRepository, message, this._progressUpdates);
  }

  injectState(newState) {
    this._state = newState;
    this._emitter.emit(DID_UPDATE_STATE_EVENT);
  }

  getState() {
    return this._state;
  }

  setCommitMode(commitMode) {
    this._actionCreators.setCommitMode(commitMode);
  }

  setShouldAmendRebase(shouldRebaseOnAmend) {
    this._actionCreators.setShouldRebaseOnAmend(shouldRebaseOnAmend);
  }
}
exports.default = DiffViewModel;
module.exports = exports['default'];