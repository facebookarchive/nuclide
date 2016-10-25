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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

var _atom = require('atom');

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

const ACTIVE_BUFFER_CHANGE_MODIFIED_EVENT = 'active-buffer-change-modified';
const DID_UPDATE_STATE_EVENT = 'did-update-state';

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

let DiffViewModel = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('diff-view.save-file'), (_class = class DiffViewModel {

  constructor(actionCreators, progressUpdates) {
    this._actionCreators = actionCreators;
    this._progressUpdates = progressUpdates;
    this._emitter = new _atom.Emitter();
    this._publishUpdates = new _rxjsBundlesRxMinJs.Subject();
    this._state = getInitialState();
  }

  diffFile(filePath) {
    this._actionCreators.diffFile(filePath, this.emitActiveBufferChangeModified.bind(this));
  }

  getActiveStackDirtyFileChanges() {
    return this._state.dirtyFileChanges;
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
    const filePath = this._state.filePath;

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

  getPublishUpdates() {
    return this._publishUpdates;
  }

  saveActiveFile() {
    const filePath = this._state.filePath;

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diff-view-save-file', { filePath: filePath });
    return this._saveFile(filePath).catch((_notifications || _load_notifications()).notifyInternalError);
  }

  publishDiff(publishMessage, isPrepareMode, lintExcuse) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const activeRepository = _this._state.activeRepository;

      if (!(activeRepository != null)) {
        throw new Error('Cannot publish without an active stack!');
      }

      _this._actionCreators.publishDiff(activeRepository, publishMessage, isPrepareMode, lintExcuse, _this._publishUpdates);
    })();
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

  activate() {
    this._actionCreators.openView();
  }

  deactivate() {
    this._actionCreators.closeView();
  }

  dispose() {
    this.deactivate();
  }
}, (_applyDecoratedDescriptor(_class.prototype, 'saveActiveFile', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'saveActiveFile'), _class.prototype)), _class));
exports.default = DiffViewModel;
module.exports = exports['default'];