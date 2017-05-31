'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-file-watcher'); /**
                                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                                    * All rights reserved.
                                                                                    *
                                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                                    * the root directory of this source tree.
                                                                                    *
                                                                                    * 
                                                                                    * @format
                                                                                    */

class FileWatcher {

  constructor(editor) {
    this._editor = editor;
    if (this._editor == null) {
      logger.warn('No editor instance on this._editor');
      return;
    }
    const _subscriptions = new _atom.CompositeDisposable();
    _subscriptions.add(this._editor.onDidConflict(() => {
      if (this._shouldPromptToReload()) {
        logger.info(`Conflict at file: ${this._editor.getPath() || 'File not found'}`);
        this._promptReload();
      }
    }));
    this._subscriptions = _subscriptions;
  }

  _shouldPromptToReload() {
    return this._editor.getBuffer().isInConflict();
  }

  _promptReload() {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('file-watcher:promptReload', () => this.__promptReload());
  }

  __promptReload() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = _this._editor.getPath();
      if (filePath == null) {
        return;
      }
      const encoding = _this._editor.getEncoding();
      const fileName = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
      const choice = atom.confirm({
        message: fileName + ' has changed on disk.',
        buttons: ['Reload', 'Compare', 'Ignore']
      });
      if (choice === 2) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('file-watcher:promptReload-ignoreChosen');
        return;
      }
      if (choice === 0) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('file-watcher:promptReload-reloadChosen');
        const buffer = _this._editor.getBuffer();
        if (buffer) {
          buffer.reload();
        }
        return;
      }
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('file-watcher:promptReload-compareChosen');

      // Load the file contents locally or remotely.
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(filePath);
      const contents = (yield service.readFile(filePath)).toString(encoding);

      // Open a right split pane to compare the contents.
      // TODO: We can use the diff-view here when ready.
      // TODO: Figure out wtf is going on here (why are we passing the empty string as a path) and
      // consider using goToLocation instead.
      // eslint-disable-next-line nuclide-internal/atom-apis
      const splitEditor = yield atom.workspace.open('', { split: 'right' });

      splitEditor.insertText(contents);
      splitEditor.setGrammar(_this._editor.getGrammar());
    })();
  }

  destroy() {
    if (!this._subscriptions) {
      return;
    }
    this._subscriptions.dispose();
    this._subscriptions = null;
  }
}
exports.default = FileWatcher;