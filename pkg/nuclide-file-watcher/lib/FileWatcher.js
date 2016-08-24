var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

var FileWatcher = (function () {
  function FileWatcher(editor) {
    var _this = this;

    _classCallCheck(this, FileWatcher);

    this._editor = editor;
    if (this._editor == null) {
      logger.warn('No editor instance on this._editor');
      return;
    }
    var _subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    _subscriptions.add(this._editor.onDidConflict(function () {
      if (_this._shouldPromptToReload()) {
        logger.info('Conflict at file: ' + (_this._editor.getPath() || 'File not found'));
        _this._promptReload();
      }
    }));
    this._subscriptions = _subscriptions;
  }

  _createDecoratedClass(FileWatcher, [{
    key: '_shouldPromptToReload',
    value: function _shouldPromptToReload() {
      return this._editor.getBuffer().isInConflict();
    }
  }, {
    key: '_promptReload',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('file-watcher:promptReload')],
    value: _asyncToGenerator(function* () {
      var filePath = this._editor.getPath();
      if (filePath == null) {
        return;
      }
      var encoding = this._editor.getEncoding();
      var fileName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath);
      var choice = atom.confirm({
        message: fileName + ' has changed on disk.',
        buttons: ['Reload', 'Compare', 'Ignore']
      });
      if (choice === 2) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('file-watcher:promptReload-ignoreChosen');
        return;
      }
      if (choice === 0) {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('file-watcher:promptReload-reloadChosen');
        var buffer = this._editor.getBuffer();
        if (buffer) {
          buffer.reload();
        }
        return;
      }
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('file-watcher:promptReload-compareChosen');

      // Load the file contents locally or remotely.
      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(filePath);
      var localFilePath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(filePath);
      var contents = (yield service.readFile(localFilePath)).toString(encoding);

      // Open a right split pane to compare the contents.
      // TODO: We can use the diff-view here when ready.
      var splitEditor = yield atom.workspace.open('', { split: 'right' });

      splitEditor.insertText(contents);
      splitEditor.setGrammar(this._editor.getGrammar());
    })
  }, {
    key: 'destroy',
    value: function destroy() {
      if (!this._subscriptions) {
        return;
      }
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
  }]);

  return FileWatcher;
})();

module.exports = FileWatcher;