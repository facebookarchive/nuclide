var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var logger = null;

function getLogger() {
  return logger || (logger = require('../../nuclide-logging').getLogger());
}

var FileWatcher = (function () {
  function FileWatcher(editor) {
    var _this = this;

    _classCallCheck(this, FileWatcher);

    this._editor = editor;
    if (this._editor == null) {
      getLogger().warn('No editor instance on this._editor');
      return;
    }
    var _subscriptions = new CompositeDisposable();
    _subscriptions.add(this._editor.onDidConflict(function () {
      if (_this._shouldPromptToReload()) {
        getLogger().info('Conflict at file: ' + (_this._editor.getPath() || 'File not found'));
        _this._promptReload();
      }
    }));
    this._subscriptions = _subscriptions;
  }

  _createClass(FileWatcher, [{
    key: '_shouldPromptToReload',
    value: function _shouldPromptToReload() {
      return this._editor.getBuffer().isInConflict();
    }
  }, {
    key: '_promptReload',
    value: _asyncToGenerator(function* () {
      var _require2 = require('../../nuclide-remote-uri');

      var getPath = _require2.getPath;
      var basename = _require2.basename;

      var filePath = this._editor.getPath();
      if (filePath == null) {
        return;
      }
      var encoding = this._editor.getEncoding();
      var fileName = basename(filePath);
      var choice = atom.confirm({
        message: fileName + ' has changed on disk.',
        buttons: ['Reload', 'Compare', 'Ignore']
      });
      if (choice === 2) {
        return;
      }
      if (choice === 0) {
        var buffer = this._editor.getBuffer();
        if (buffer) {
          buffer.reload();
        }
        return;
      }

      var _require3 = require('../../nuclide-client');

      var getFileSystemServiceByNuclideUri = _require3.getFileSystemServiceByNuclideUri;

      // Load the file contents locally or remotely.
      var localFilePath = getPath(filePath);
      var filesystemContents = (yield getFileSystemServiceByNuclideUri(filePath).readFile(localFilePath)).toString(encoding);

      // Open a right split pane to compare the contents.
      // TODO: We can use the diff-view here when ready.
      var splitEditor = yield atom.workspace.open('', { split: 'right' });

      splitEditor.insertText(filesystemContents);
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDOztBQUVwRSxpQkFBVyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzNDLGlCQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNuRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFVBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0tBQzVCOzs7U0F0RUcsV0FBVzs7O0FBeUVqQixNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJGaWxlV2F0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmxldCBsb2dnZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIHJldHVybiBsb2dnZXIgfHwgKGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuY2xhc3MgRmlsZVdhdGNoZXIge1xuXG4gIF9lZGl0b3I6IFRleHRFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3I7XG4gICAgaWYgKHRoaXMuX2VkaXRvciA9PSBudWxsKSB7XG4gICAgICBnZXRMb2dnZXIoKS53YXJuKCdObyBlZGl0b3IgaW5zdGFuY2Ugb24gdGhpcy5fZWRpdG9yJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBfc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZWRpdG9yLm9uRGlkQ29uZmxpY3QoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb21wdFRvUmVsb2FkKCkpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuaW5mbyhgQ29uZmxpY3QgYXQgZmlsZTogJHt0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpIHx8ICdGaWxlIG5vdCBmb3VuZCd9YCk7XG4gICAgICAgIHRoaXMuX3Byb21wdFJlbG9hZCgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gX3N1YnNjcmlwdGlvbnM7XG4gIH1cblxuICBfc2hvdWxkUHJvbXB0VG9SZWxvYWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5nZXRCdWZmZXIoKS5pc0luQ29uZmxpY3QoKTtcbiAgfVxuXG4gIGFzeW5jIF9wcm9tcHRSZWxvYWQoKTogUHJvbWlzZSB7XG4gICAgY29uc3Qge2dldFBhdGgsIGJhc2VuYW1lfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaScpO1xuXG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChmaWxlUGF0aCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGVuY29kaW5nID0gdGhpcy5fZWRpdG9yLmdldEVuY29kaW5nKCk7XG4gICAgY29uc3QgZmlsZU5hbWUgPSBiYXNlbmFtZShmaWxlUGF0aCk7XG4gICAgY29uc3QgY2hvaWNlID0gYXRvbS5jb25maXJtKHtcbiAgICAgIG1lc3NhZ2U6IGZpbGVOYW1lICsgJyBoYXMgY2hhbmdlZCBvbiBkaXNrLicsXG4gICAgICBidXR0b25zOiBbJ1JlbG9hZCcsICdDb21wYXJlJywgJ0lnbm9yZSddLFxuICAgIH0pO1xuICAgIGlmIChjaG9pY2UgPT09IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGNob2ljZSA9PT0gMCkge1xuICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5fZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgICAgaWYgKGJ1ZmZlcikge1xuICAgICAgICBidWZmZXIucmVsb2FkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2dldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY2xpZW50Jyk7XG5cbiAgICAvLyBMb2FkIHRoZSBmaWxlIGNvbnRlbnRzIGxvY2FsbHkgb3IgcmVtb3RlbHkuXG4gICAgY29uc3QgbG9jYWxGaWxlUGF0aCA9IGdldFBhdGgoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGZpbGVzeXN0ZW1Db250ZW50cyA9IChhd2FpdCBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaShmaWxlUGF0aCkuXG4gICAgICByZWFkRmlsZShsb2NhbEZpbGVQYXRoKSkudG9TdHJpbmcoZW5jb2RpbmcpO1xuXG4gICAgLy8gT3BlbiBhIHJpZ2h0IHNwbGl0IHBhbmUgdG8gY29tcGFyZSB0aGUgY29udGVudHMuXG4gICAgLy8gVE9ETzogV2UgY2FuIHVzZSB0aGUgZGlmZi12aWV3IGhlcmUgd2hlbiByZWFkeS5cbiAgICBjb25zdCBzcGxpdEVkaXRvciA9IGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oJycsIHtzcGxpdDogJ3JpZ2h0J30pO1xuXG4gICAgc3BsaXRFZGl0b3IuaW5zZXJ0VGV4dChmaWxlc3lzdGVtQ29udGVudHMpO1xuICAgIHNwbGl0RWRpdG9yLnNldEdyYW1tYXIodGhpcy5fZWRpdG9yLmdldEdyYW1tYXIoKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVXYXRjaGVyO1xuIl19