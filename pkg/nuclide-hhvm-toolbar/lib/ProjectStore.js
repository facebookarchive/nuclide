var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideHackLibUtils = require('../../nuclide-hack/lib/utils');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var _require2 = require('events');

var EventEmitter = _require2.EventEmitter;

var _require3 = require('../../nuclide-buck-commons');

var buckProjectRootForPath = _require3.buckProjectRootForPath;

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

      var onWorkspaceDidStopChangingActivePaneItem = require('../../nuclide-atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

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
    decorators: [(0, _nuclideAnalytics.trackTiming)('toolbar.isFileHHVMProject')],
    value: _asyncToGenerator(function* (fileUri) {
      var _ref = yield (0, _nuclideHackLibUtils.getHackEnvironmentDetails)(fileUri);

      var hackService = _ref.hackService;

      return _nuclideRemoteUri2['default'].isRemote(fileUri) && hackService != null && (yield hackService.isFileInHackProject(fileUri));
    })
  }, {
    key: '_isFileBuckProject',
    decorators: [(0, _nuclideAnalytics.trackTiming)('toolbar.isFileBuckProject')],
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
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDMUMsYUFBUSxJQUFJLFVBQVUsQ0FBQztlQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztPQUFBLENBQUMsQ0FBRTtLQUMzRTs7O1dBRWlCLDhCQUFXO0FBQzNCLGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7V0FFYSwwQkFBZ0I7QUFDNUIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQTVFRyxZQUFZOzs7QUErRWxCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IlByb2plY3RTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Z2V0SGFja0Vudmlyb25tZW50RGV0YWlsc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrL2xpYi91dGlscyc7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3Qge2J1Y2tQcm9qZWN0Um9vdEZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1idWNrLWNvbW1vbnMnKTtcbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbnR5cGUgUHJvamVjdFR5cGUgPSAnQnVjaycgfCAnSGh2bScgfCAnT3RoZXInO1xuXG5jbGFzcyBQcm9qZWN0U3RvcmUge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9ldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2N1cnJlbnRGaWxlUGF0aDogc3RyaW5nO1xuICBfcHJvamVjdFR5cGU6IFByb2plY3RUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fY3VycmVudEZpbGVQYXRoID0gJyc7XG4gICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnT3RoZXInO1xuICAgIHRoaXMuX21vbml0b3JBY3RpdmVFZGl0b3JDaGFuZ2UoKTtcbiAgfVxuXG4gIF9tb25pdG9yQWN0aXZlRWRpdG9yQ2hhbmdlKCkge1xuICAgIC8vIEZvciB0aGUgY3VycmVudCBhY3RpdmUgZWRpdG9yLCBhbmQgYW55IHVwZGF0ZSB0byB0aGUgYWN0aXZlIGVkaXRvcixcbiAgICAvLyBkZWNpZGUgd2hldGhlciB0aGUgdG9vbGJhciBzaG91bGQgYmUgZGlzcGxheWVkLlxuICAgIGNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9XG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG4gICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLl9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oY2FsbGJhY2spKTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgYXN5bmMgX29uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKTogUHJvbWlzZSB7XG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoIWFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlTmFtZSA9IGFjdGl2ZVRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZU5hbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudEZpbGVQYXRoID0gZmlsZU5hbWU7XG5cbiAgICB0aGlzLl9wcm9qZWN0VHlwZSA9ICdPdGhlcic7XG4gICAgY29uc3QgaXNCdWNrUHJvamVjdCA9IGF3YWl0IHRoaXMuX2lzRmlsZUJ1Y2tQcm9qZWN0KGZpbGVOYW1lKTtcbiAgICBpZiAoaXNCdWNrUHJvamVjdCkge1xuICAgICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnQnVjayc7XG4gICAgfSBlbHNlIGlmIChhd2FpdCB0aGlzLl9pc0ZpbGVISFZNUHJvamVjdChmaWxlTmFtZSkpIHtcbiAgICAgIHRoaXMuX3Byb2plY3RUeXBlID0gJ0hodm0nO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ3Rvb2xiYXIuaXNGaWxlSEhWTVByb2plY3QnKVxuICBhc3luYyBfaXNGaWxlSEhWTVByb2plY3QoZmlsZVVyaTogTnVjbGlkZVVyaSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHtoYWNrU2VydmljZX0gPSBhd2FpdCBnZXRIYWNrRW52aXJvbm1lbnREZXRhaWxzKGZpbGVVcmkpO1xuICAgIHJldHVybiByZW1vdGVVcmkuaXNSZW1vdGUoZmlsZVVyaSlcbiAgICAgICYmIGhhY2tTZXJ2aWNlICE9IG51bGxcbiAgICAgICYmIGF3YWl0IGhhY2tTZXJ2aWNlLmlzRmlsZUluSGFja1Byb2plY3QoZmlsZVVyaSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ3Rvb2xiYXIuaXNGaWxlQnVja1Byb2plY3QnKVxuICBhc3luYyBfaXNGaWxlQnVja1Byb2plY3QoZmlsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGJ1Y2tQcm9qZWN0ID0gYXdhaXQgYnVja1Byb2plY3RSb290Rm9yUGF0aChmaWxlTmFtZSk7XG4gICAgcmV0dXJuICEhYnVja1Byb2plY3Q7XG4gIH1cblxuICBvbkNoYW5nZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGVtaXR0ZXIgPSB0aGlzLl9ldmVudEVtaXR0ZXI7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLm9uKCdjaGFuZ2UnLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIChuZXcgRGlzcG9zYWJsZSgoKSA9PiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdjaGFuZ2UnLCBjYWxsYmFjaykpKTtcbiAgfVxuXG4gIGdldEN1cnJlbnRGaWxlUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RmlsZVBhdGg7XG4gIH1cblxuICBnZXRQcm9qZWN0VHlwZSgpOiBQcm9qZWN0VHlwZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2plY3RUeXBlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcm9qZWN0U3RvcmU7XG4iXX0=