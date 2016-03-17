var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _nuclideClient = require('../../nuclide-client');

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
      var hackService = (0, _nuclideClient.getServiceByNuclideUri)('HackService', fileUri);
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
//# sourceMappingURL=data:application/json;base64,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O0FBQ25DLFVBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxQyxhQUFRLElBQUksVUFBVSxDQUFDO2VBQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO09BQUEsQ0FBQyxDQUFFO0tBQzNFOzs7V0FFaUIsOEJBQVc7QUFDM0IsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztXQUVhLDBCQUFnQjtBQUM1QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBNUVHLFlBQVk7OztBQStFbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoiUHJvamVjdFN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGVvZiAqIGFzIEhhY2tTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSgnZXZlbnRzJyk7XG5jb25zdCB7YnVja1Byb2plY3RSb290Rm9yUGF0aH0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWJ1Y2stY29tbW9ucycpO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHJlbW90ZVVyaSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLWNsaWVudCc7XG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuXG50eXBlIFByb2plY3RUeXBlID0gJ0J1Y2snIHwgJ0hodm0nIHwgJ090aGVyJztcblxuY2xhc3MgUHJvamVjdFN0b3JlIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9jdXJyZW50RmlsZVBhdGg6IHN0cmluZztcbiAgX3Byb2plY3RUeXBlOiBQcm9qZWN0VHlwZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX2N1cnJlbnRGaWxlUGF0aCA9ICcnO1xuICAgIHRoaXMuX3Byb2plY3RUeXBlID0gJ090aGVyJztcbiAgICB0aGlzLl9tb25pdG9yQWN0aXZlRWRpdG9yQ2hhbmdlKCk7XG4gIH1cblxuICBfbW9uaXRvckFjdGl2ZUVkaXRvckNoYW5nZSgpIHtcbiAgICAvLyBGb3IgdGhlIGN1cnJlbnQgYWN0aXZlIGVkaXRvciwgYW5kIGFueSB1cGRhdGUgdG8gdGhlIGFjdGl2ZSBlZGl0b3IsXG4gICAgLy8gZGVjaWRlIHdoZXRoZXIgdGhlIHRvb2xiYXIgc2hvdWxkIGJlIGRpc3BsYXllZC5cbiAgICBjb25zdCB7b25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbX0gPVxuICAgICAgICByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpLmF0b21FdmVudERlYm91bmNlO1xuICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5fb25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKGNhbGxiYWNrKSk7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGFzeW5jIF9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKCk6IFByb21pc2Uge1xuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCFhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhY3RpdmVUZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVOYW1lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRGaWxlUGF0aCA9IGZpbGVOYW1lO1xuXG4gICAgdGhpcy5fcHJvamVjdFR5cGUgPSAnT3RoZXInO1xuICAgIGNvbnN0IGlzQnVja1Byb2plY3QgPSBhd2FpdCB0aGlzLl9pc0ZpbGVCdWNrUHJvamVjdChmaWxlTmFtZSk7XG4gICAgaWYgKGlzQnVja1Byb2plY3QpIHtcbiAgICAgIHRoaXMuX3Byb2plY3RUeXBlID0gJ0J1Y2snO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgdGhpcy5faXNGaWxlSEhWTVByb2plY3QoZmlsZU5hbWUpKSB7XG4gICAgICB0aGlzLl9wcm9qZWN0VHlwZSA9ICdIaHZtJztcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoJ2NoYW5nZScpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCd0b29sYmFyLmlzRmlsZUhIVk1Qcm9qZWN0JylcbiAgYXN5bmMgX2lzRmlsZUhIVk1Qcm9qZWN0KGZpbGVVcmk6IE51Y2xpZGVVcmkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoYWNrU2VydmljZTogP0hhY2tTZXJ2aWNlID0gKGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hhY2tTZXJ2aWNlJywgZmlsZVVyaSk6IGFueSk7XG4gICAgcmV0dXJuIHJlbW90ZVVyaS5pc1JlbW90ZShmaWxlVXJpKVxuICAgICAgJiYgaGFja1NlcnZpY2UgIT0gbnVsbFxuICAgICAgJiYgYXdhaXQgaGFja1NlcnZpY2UuaXNGaWxlSW5IYWNrUHJvamVjdChmaWxlVXJpKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygndG9vbGJhci5pc0ZpbGVCdWNrUHJvamVjdCcpXG4gIGFzeW5jIF9pc0ZpbGVCdWNrUHJvamVjdChmaWxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgYnVja1Byb2plY3QgPSBhd2FpdCBidWNrUHJvamVjdFJvb3RGb3JQYXRoKGZpbGVOYW1lKTtcbiAgICByZXR1cm4gISFidWNrUHJvamVjdDtcbiAgfVxuXG4gIG9uQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogRGlzcG9zYWJsZSB7XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuX2V2ZW50RW1pdHRlcjtcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIub24oJ2NoYW5nZScsIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gKG5ldyBEaXNwb3NhYmxlKCgpID0+IGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2NoYW5nZScsIGNhbGxiYWNrKSkpO1xuICB9XG5cbiAgZ2V0Q3VycmVudEZpbGVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRGaWxlUGF0aDtcbiAgfVxuXG4gIGdldFByb2plY3RUeXBlKCk6IFByb2plY3RUeXBlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvamVjdFR5cGU7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2plY3RTdG9yZTtcbiJdfQ==