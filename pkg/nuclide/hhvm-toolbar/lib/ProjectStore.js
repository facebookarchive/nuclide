var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var _client = require('../../client');

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
    value: _asyncToGenerator(function* (fileUri) {
      var hackService = (0, _client.getServiceByNuclideUri)('HackService', fileUri);
      return _remoteUri2['default'].isRemote(fileUri) && hackService != null && (yield hackService.isFileInHackProject(fileUri));
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLGFBQVEsSUFBSSxVQUFVLENBQUM7ZUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUU7S0FDM0U7OztXQUVpQiw4QkFBVztBQUMzQixhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7O1dBRWEsMEJBQWdCO0FBQzVCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E1RUcsWUFBWTs7O0FBK0VsQixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJQcm9qZWN0U3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7RXZlbnRFbWl0dGVyfSA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3Qge2J1Y2tQcm9qZWN0Um9vdEZvclBhdGh9ID0gcmVxdWlyZSgnLi4vLi4vYnVjay9jb21tb25zJyk7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vY2xpZW50JztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUvcmVtb3RlLXVyaSc7XG5cbnR5cGUgUHJvamVjdFR5cGUgPSAnQnVjaycgfCAnSGh2bScgfCAnT3RoZXInO1xuXG5jbGFzcyBQcm9qZWN0U3RvcmUge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9ldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2N1cnJlbnRGaWxlUGF0aDogc3RyaW5nO1xuICBfcHJvamVjdFR5cGU6IFByb2plY3RUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fY3VycmVudEZpbGVQYXRoID0gJyc7XG4gICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnT3RoZXInO1xuICAgIHRoaXMuX21vbml0b3JBY3RpdmVFZGl0b3JDaGFuZ2UoKTtcbiAgfVxuXG4gIF9tb25pdG9yQWN0aXZlRWRpdG9yQ2hhbmdlKCkge1xuICAgIC8vIEZvciB0aGUgY3VycmVudCBhY3RpdmUgZWRpdG9yLCBhbmQgYW55IHVwZGF0ZSB0byB0aGUgYWN0aXZlIGVkaXRvcixcbiAgICAvLyBkZWNpZGUgd2hldGhlciB0aGUgdG9vbGJhciBzaG91bGQgYmUgZGlzcGxheWVkLlxuICAgIGNvbnN0IHtvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSA9XG4gICAgICAgIHJlcXVpcmUoJy4uLy4uL2F0b20taGVscGVycycpLmF0b21FdmVudERlYm91bmNlO1xuICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5fb25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKGNhbGxiYWNrKSk7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGFzeW5jIF9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKCk6IFByb21pc2Uge1xuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCFhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhY3RpdmVUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVOYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRGaWxlUGF0aCA9IGZpbGVOYW1lO1xuXG4gICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnT3RoZXInO1xuICAgIGNvbnN0IGlzQnVja1Byb2plY3QgPSBhd2FpdCB0aGlzLl9pc0ZpbGVCdWNrUHJvamVjdChmaWxlTmFtZSk7XG4gICAgaWYgKGlzQnVja1Byb2plY3QpIHtcbiAgICAgIHRoaXMuX3Byb2plY3RUeXBlID0gJ0J1Y2snO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgdGhpcy5faXNGaWxlSEhWTVByb2plY3QoZmlsZU5hbWUpKSB7XG4gICAgICB0aGlzLl9wcm9qZWN0VHlwZSA9ICdIaHZtJztcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCd0b29sYmFyLmlzRmlsZUhIVk1Qcm9qZWN0JylcbiAgYXN5bmMgX2lzRmlsZUhIVk1Qcm9qZWN0KGZpbGVVcmk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoYWNrU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hhY2tTZXJ2aWNlJywgZmlsZVVyaSk7XG4gICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShmaWxlVXJpKVxuICAgICAgJiYgaGFja1NlcnZpY2UgIT0gbnVsbFxuICAgICAgJiYgYXdhaXQgaGFja1NlcnZpY2UuaXNGaWxlSW5IYWNrUHJvamVjdChmaWxlVXJpKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygndG9vbGJhci5pc0ZpbGVCdWNrUHJvamVjdCcpXG4gIGFzeW5jIF9pc0ZpbGVCdWNrUHJvamVjdChmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKGZpbGVOYW1lKTtcbiAgICByZXR1cm4gISFidWNrUHJvamVjdDtcbiAgfVxuXG4gIG9uQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuX2V2ZW50RW1pdHRlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIGNhbGxiYWNrKSkpO1xuICB9XG5cbiAgZ2V0Q3VycmVudEZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRGaWxlUGF0aDtcbiAgfVxuXG4gIGdldFByb2plY3RUeXBlKCk6IFByb2plY3RUeXBlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdFR5cGU7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTdG9yZTtcbiJdfQ==