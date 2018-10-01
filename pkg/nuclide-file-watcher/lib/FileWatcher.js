"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

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
const logger = (0, _log4js().getLogger)('nuclide-file-watcher');

class FileWatcher {
  constructor(editor) {
    this._editor = editor;

    if (this._editor == null) {
      logger.warn('No editor instance on this._editor');
      return;
    }

    const _subscriptions = new (_UniversalDisposable().default)();

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
    return (0, _nuclideAnalytics().trackTiming)('file-watcher:promptReload', () => this.__promptReload());
  }

  async __promptReload() {
    const filePath = this._editor.getPath();

    if (filePath == null) {
      return;
    }

    const encoding = this._editor.getEncoding();

    const fileName = _nuclideUri().default.basename(filePath);

    const choice = atom.confirm({
      message: fileName + ' has changed on disk.',
      buttons: ['Reload', 'Compare', 'Ignore']
    });

    if (choice === 2) {
      (0, _nuclideAnalytics().track)('file-watcher:promptReload-ignoreChosen');
      return;
    }

    if (choice === 0) {
      (0, _nuclideAnalytics().track)('file-watcher:promptReload-reloadChosen');

      const buffer = this._editor.getBuffer();

      if (buffer) {
        buffer.reload();
      }

      return;
    }

    (0, _nuclideAnalytics().track)('file-watcher:promptReload-compareChosen'); // Load the file contents locally or remotely.

    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(filePath);
    const contents = (await service.readFile(filePath)).toString(encoding); // Open a right split pane to compare the contents.
    // TODO: We can use the diff-view here when ready.
    // TODO: Figure out wtf is going on here (why are we passing the empty string as a path) and
    // consider using goToLocation instead.
    // eslint-disable-next-line nuclide-internal/atom-apis

    const splitEditor = await atom.workspace.open('', {
      split: 'right'
    });
    splitEditor.insertText(contents);
    splitEditor.setGrammar(this._editor.getGrammar());
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