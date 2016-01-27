var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var _require3 = require('../../buck/commons');

var buckProjectRootForPath = _require3.buckProjectRootForPath;

var ARC_PROJECT_WWW = 'facebook-www';

var ProjectStore = (function () {
  function ProjectStore() {
    _classCallCheck(this, ProjectStore);

    this._disposables = new CompositeDisposable();
    this._eventEmitter = new EventEmitter();
    this._currentFilePath = '';
    this._projectType = 'Other';
    this._monitorActiveEditorChange();
  }

  _createDecoratedClass(ProjectStore, [{
    key: '_monitorActiveEditorChange',
    value: function _monitorActiveEditorChange() {
      // For the current active editor, and any update to the active editor,
      // decide whether the toolbar should be displayed.

      var onWorkspaceDidStopChangingActivePaneItem = require('../../atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

      var callback = this._onDidChangeActivePaneItem.bind(this);
      this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(callback));
      callback();
    }
  }, {
    key: '_onDidChangeActivePaneItem',
    value: _asyncToGenerator(function* () {
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (!activeTextEditor) {
        return;
      }

      var fileName = activeTextEditor.getPath();
      if (!fileName) {
        return;
      }
      this._currentFilePath = fileName;

      this._projectType = 'Other';
      var isBuckProject = yield this._isFileBuckProject(fileName);
      if (isBuckProject) {
        this._projectType = 'Buck';
      } else if (yield this._isFileHHVMProject(fileName)) {
        this._projectType = 'Hhvm';
      }
      this._eventEmitter.emit('change');
    })
  }, {
    key: '_isFileHHVMProject',
    decorators: [(0, _analytics.trackTiming)('toolbar.isFileHHVMProject')],
    value: _asyncToGenerator(function* (fileName) {
      var remoteUri = require('../../remote-uri');
      var arcanist = require('../../arcanist-client');
      var arcProjectId = yield arcanist.findArcProjectIdOfPath(fileName);

      return remoteUri.isRemote(fileName) && arcProjectId === ARC_PROJECT_WWW;
    })
  }, {
    key: '_isFileBuckProject',
    decorators: [(0, _analytics.trackTiming)('toolbar.isFileBuckProject')],
    value: _asyncToGenerator(function* (fileName) {
      var buckProject = yield buckProjectRootForPath(fileName);
      return !!buckProject;
    })
  }, {
    key: 'onChange',
    value: function onChange(callback) {
      var emitter = this._eventEmitter;
      this._eventEmitter.on('change', callback);
      return new Disposable(function () {
        return emitter.removeListener('change', callback);
      });
    }
  }, {
    key: 'getCurrentFilePath',
    value: function getCurrentFilePath() {
      return this._currentFilePath;
    }
  }, {
    key: 'getProjectType',
    value: function getProjectType() {
      return this._projectType;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return ProjectStore;
})();

module.exports = ProjectStore;
//# sourceMappingURL=data:application/json;base64,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QyxRQUFvQixFQUFjO0FBQ3pDLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDbkMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLGFBQVEsSUFBSSxVQUFVLENBQUM7ZUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUU7S0FDM0U7OztXQUVpQiw4QkFBVztBQUMzQixhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7O1dBRWEsMEJBQWdCO0FBQzVCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E3RUcsWUFBWTs7O0FBZ0ZsQixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJQcm9qZWN0U3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3Qge2J1Y2tQcm9qZWN0Um9vdEZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vYnVjay9jb21tb25zJyk7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCBBUkNfUFJPSkVDVF9XV1cgPSAnZmFjZWJvb2std3d3JztcblxudHlwZSBQcm9qZWN0VHlwZSA9ICdCdWNrJyB8ICdIaHZtJyB8ICdPdGhlcic7XG5cbmNsYXNzIFByb2plY3RTdG9yZSB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2V2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfY3VycmVudEZpbGVQYXRoOiBzdHJpbmc7XG4gIF9wcm9qZWN0VHlwZTogUHJvamVjdFR5cGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2V2ZW50RW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9jdXJyZW50RmlsZVBhdGggPSAnJztcbiAgICB0aGlzLl9wcm9qZWN0VHlwZSA9ICdPdGhlcic7XG4gICAgdGhpcy5fbW9uaXRvckFjdGl2ZUVkaXRvckNoYW5nZSgpO1xuICB9XG5cbiAgX21vbml0b3JBY3RpdmVFZGl0b3JDaGFuZ2UoKSB7XG4gICAgLy8gRm9yIHRoZSBjdXJyZW50IGFjdGl2ZSBlZGl0b3IsIGFuZCBhbnkgdXBkYXRlIHRvIHRoZSBhY3RpdmUgZWRpdG9yLFxuICAgIC8vIGRlY2lkZSB3aGV0aGVyIHRoZSB0b29sYmFyIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID1cbiAgICAgICAgcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG4gICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLl9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oY2FsbGJhY2spKTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgYXN5bmMgX29uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKTogUHJvbWlzZSB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoIWFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlTmFtZSA9IGFjdGl2ZVRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZU5hbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEZpbGVQYXRoID0gZmlsZU5hbWU7XG5cbiAgICB0aGlzLl9wcm9qZWN0VHlwZSA9ICdPdGhlcic7XG4gICAgY29uc3QgaXNCdWNrUHJvamVjdCA9IGF3YWl0IHRoaXMuX2lzRmlsZUJ1Y2tQcm9qZWN0KGZpbGVOYW1lKTtcbiAgICBpZiAoaXNCdWNrUHJvamVjdCkge1xuICAgICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnQnVjayc7XG4gICAgfSBlbHNlIGlmIChhd2FpdCB0aGlzLl9pc0ZpbGVISFZNUHJvamVjdChmaWxlTmFtZSkpIHtcbiAgICAgIHRoaXMuX3Byb2plY3RUeXBlID0gJ0hodm0nO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ3Rvb2xiYXIuaXNGaWxlSEhWTVByb2plY3QnKVxuICBhc3luYyBfaXNGaWxlSEhWTVByb2plY3QoZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlbW90ZVVyaSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcbiAgICBjb25zdCBhcmNhbmlzdCA9IHJlcXVpcmUoJy4uLy4uL2FyY2FuaXN0LWNsaWVudCcpO1xuICAgIGNvbnN0IGFyY1Byb2plY3RJZCA9IGF3YWl0IGFyY2FuaXN0LmZpbmRBcmNQcm9qZWN0SWRPZlBhdGgoZmlsZU5hbWUpO1xuXG4gICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShmaWxlTmFtZSkgJiYgYXJjUHJvamVjdElkID09PSBBUkNfUFJPSkVDVF9XV1c7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ3Rvb2xiYXIuaXNGaWxlQnVja1Byb2plY3QnKVxuICBhc3luYyBfaXNGaWxlQnVja1Byb2plY3QoZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gYXdhaXQgYnVja1Byb2plY3RSb290Rm9yUGF0aChmaWxlTmFtZSk7XG4gICAgcmV0dXJuICEhYnVja1Byb2plY3Q7XG4gIH1cblxuICBvbkNoYW5nZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGVtaXR0ZXIgPSB0aGlzLl9ldmVudEVtaXR0ZXI7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaykpKTtcbiAgfVxuXG4gIGdldEN1cnJlbnRGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RmlsZVBhdGg7XG4gIH1cblxuICBnZXRQcm9qZWN0VHlwZSgpOiBQcm9qZWN0VHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3RUeXBlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U3RvcmU7XG4iXX0=