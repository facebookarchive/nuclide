'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
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

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

let FileWatcher = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('file-watcher:promptReload'), (_class = class FileWatcher {

  constructor(editor) {
    this._editor = editor;
    if (this._editor == null) {
      logger.warn('No editor instance on this._editor');
      return;
    }
    const _subscriptions = new _atom.CompositeDisposable();
    _subscriptions.add(this._editor.onDidConflict(() => {
      if (this._shouldPromptToReload()) {
        logger.info(`Conflict at file: ${ this._editor.getPath() || 'File not found' }`);
        this._promptReload();
      }
    }));
    this._subscriptions = _subscriptions;
  }

  _shouldPromptToReload() {
    return this._editor.getBuffer().isInConflict();
  }

  _promptReload() {
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
      const localFilePath = (_nuclideUri || _load_nuclideUri()).default.getPath(filePath);
      const contents = (yield service.readFile(localFilePath)).toString(encoding);

      // Open a right split pane to compare the contents.
      // TODO: We can use the diff-view here when ready.
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
}, (_applyDecoratedDescriptor(_class.prototype, '_promptReload', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, '_promptReload'), _class.prototype)), _class));


module.exports = FileWatcher;