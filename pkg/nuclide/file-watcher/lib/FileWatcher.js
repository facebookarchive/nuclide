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
  return logger || (logger = require('../../logging').getLogger());
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
      var _require2 = require('../../remote-uri');

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

      var _require3 = require('../../client');

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
//# sourceMappingURL=data:application/json;base64,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LEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7O0FBRXBFLGlCQUFXLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDM0MsaUJBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3hCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7S0FDNUI7OztTQXRFRyxXQUFXOzs7QUF5RWpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6IkZpbGVXYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xubGV0IGxvZ2dlciA9IG51bGw7XG5cbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgcmV0dXJuIGxvZ2dlciB8fCAobG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpKTtcbn1cblxuY2xhc3MgRmlsZVdhdGNoZXIge1xuXG4gIF9lZGl0b3I6IFRleHRFZGl0b3I7XG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3I7XG4gICAgaWYgKHRoaXMuX2VkaXRvciA9PSBudWxsKSB7XG4gICAgICBnZXRMb2dnZXIoKS53YXJuKCdObyBlZGl0b3IgaW5zdGFuY2Ugb24gdGhpcy5fZWRpdG9yJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBfc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZWRpdG9yLm9uRGlkQ29uZmxpY3QoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3Nob3VsZFByb21wdFRvUmVsb2FkKCkpIHtcbiAgICAgICAgZ2V0TG9nZ2VyKCkuaW5mbyhgQ29uZmxpY3QgYXQgZmlsZTogJHt0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpIHx8ICdGaWxlIG5vdCBmb3VuZCd9YCk7XG4gICAgICAgIHRoaXMuX3Byb21wdFJlbG9hZCgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gX3N1YnNjcmlwdGlvbnM7XG4gIH1cblxuICBfc2hvdWxkUHJvbXB0VG9SZWxvYWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvci5nZXRCdWZmZXIoKS5pc0luQ29uZmxpY3QoKTtcbiAgfVxuXG4gIGFzeW5jIF9wcm9tcHRSZWxvYWQoKTogUHJvbWlzZSB7XG4gICAgY29uc3Qge2dldFBhdGgsIGJhc2VuYW1lfSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGhpcy5fZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoZmlsZVBhdGggPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGluZyA9IHRoaXMuX2VkaXRvci5nZXRFbmNvZGluZygpO1xuICAgIGNvbnN0IGZpbGVOYW1lID0gYmFzZW5hbWUoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGNob2ljZSA9IGF0b20uY29uZmlybSh7XG4gICAgICBtZXNzYWdlOiBmaWxlTmFtZSArICcgaGFzIGNoYW5nZWQgb24gZGlzay4nLFxuICAgICAgYnV0dG9uczogWydSZWxvYWQnLCAnQ29tcGFyZScsICdJZ25vcmUnXSxcbiAgICB9KTtcbiAgICBpZiAoY2hvaWNlID09PSAyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChjaG9pY2UgPT09IDApIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX2VkaXRvci5nZXRCdWZmZXIoKTtcbiAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgYnVmZmVyLnJlbG9hZCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9jbGllbnQnKTtcblxuICAgIC8vIExvYWQgdGhlIGZpbGUgY29udGVudHMgbG9jYWxseSBvciByZW1vdGVseS5cbiAgICBjb25zdCBsb2NhbEZpbGVQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgY29uc3QgZmlsZXN5c3RlbUNvbnRlbnRzID0gKGF3YWl0IGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGVQYXRoKS5cbiAgICAgIHJlYWRGaWxlKGxvY2FsRmlsZVBhdGgpKS50b1N0cmluZyhlbmNvZGluZyk7XG5cbiAgICAvLyBPcGVuIGEgcmlnaHQgc3BsaXQgcGFuZSB0byBjb21wYXJlIHRoZSBjb250ZW50cy5cbiAgICAvLyBUT0RPOiBXZSBjYW4gdXNlIHRoZSBkaWZmLXZpZXcgaGVyZSB3aGVuIHJlYWR5LlxuICAgIGNvbnN0IHNwbGl0RWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbignJywge3NwbGl0OiAncmlnaHQnfSk7XG5cbiAgICBzcGxpdEVkaXRvci5pbnNlcnRUZXh0KGZpbGVzeXN0ZW1Db250ZW50cyk7XG4gICAgc3BsaXRFZGl0b3Iuc2V0R3JhbW1hcih0aGlzLl9lZGl0b3IuZ2V0R3JhbW1hcigpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLl9zdWJzY3JpcHRpb25zKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBudWxsO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVdhdGNoZXI7XG4iXX0=