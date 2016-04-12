Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var onWorkspaceDidStopChangingActivePaneItem = require('../../nuclide-atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

var RecentFilesService = (function () {
  function RecentFilesService(state) {
    var _this = this;

    _classCallCheck(this, RecentFilesService);

    this._fileList = new Map();
    if (state != null && state.filelist != null) {
      // Serialized state is in reverse chronological order. Reverse it to insert items correctly.
      state.filelist.reduceRight(function (_, fileItem) {
        _this._fileList.set(fileItem.path, fileItem.timestamp);
      }, null);
    }
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(onWorkspaceDidStopChangingActivePaneItem(function (item) {
      // Not all `item`s are instances of TextEditor (e.g. the diff view).
      if (!item || typeof item.getPath !== 'function') {
        return;
      }
      var editorPath = item.getPath();
      if (editorPath != null) {
        _this.touchFile(editorPath);
      }
    }));
  }

  _createDecoratedClass(RecentFilesService, [{
    key: 'touchFile',
    value: function touchFile(path) {
      // Delete first to force a new insertion.
      this._fileList['delete'](path);
      this._fileList.set(path, Date.now());
    }

    /**
     * Returns a reverse-chronological list of recently opened files.
     */
  }, {
    key: 'getRecentFiles',
    decorators: [(0, _nuclideAnalytics.trackTiming)()],
    value: function getRecentFiles() {
      return Array.from(this._fileList).reverse().map(function (pair) {
        return {
          path: pair[0],
          timestamp: pair[1]
        };
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return RecentFilesService;
})();

module.exports = RecentFilesService;

// Map uses `Map`'s insertion ordering to keep files in order.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY2VudEZpbGVzU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztnQ0FvQjBCLHlCQUF5Qjs7Ozs7Ozs7OztlQUxyQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztJQUd4Qix3Q0FBd0MsR0FDdEMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUMsaUJBQWlCLENBRHpELHdDQUF3Qzs7SUFJcEMsa0JBQWtCO0FBS1gsV0FMUCxrQkFBa0IsQ0FLVixLQUE2QixFQUFFOzs7MEJBTHZDLGtCQUFrQjs7QUFNcEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzNCLFFBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTs7QUFFM0MsV0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBQyxDQUFDLEVBQUUsUUFBUSxFQUFLO0FBQzFDLGNBQUssU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUN2RCxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ1Y7QUFDRCxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNoRCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxVQUFDLElBQUksRUFBYTs7QUFFakYsVUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO0FBQy9DLGVBQU87T0FDUjtBQUNELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDNUI7S0FDRixDQUFDLENBQUMsQ0FBQztHQUNMOzt3QkF4Qkcsa0JBQWtCOztXQTBCYixtQkFBQyxJQUFZLEVBQVE7O0FBRTVCLFVBQUksQ0FBQyxTQUFTLFVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDdEM7Ozs7Ozs7aUJBS0Esb0NBQWE7V0FDQSwwQkFBYTtBQUN6QixhQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7ZUFDakQ7QUFDQyxjQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNiLG1CQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNuQjtPQUFDLENBQ0gsQ0FBQztLQUNIOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQS9DRyxrQkFBa0I7OztBQW1EeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJSZWNlbnRGaWxlc1NlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgdHlwZSBGaWxlUGF0aCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFRpbWVTdGFtcCA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIEZpbGVMaXN0ID0gQXJyYXk8e3BhdGg6IEZpbGVQYXRoOyB0aW1lc3RhbXA6IFRpbWVTdGFtcH0+O1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmNvbnN0IHtcbiAgb25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSxcbn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycycpLmF0b21FdmVudERlYm91bmNlO1xuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5jbGFzcyBSZWNlbnRGaWxlc1NlcnZpY2Uge1xuICAvLyBNYXAgdXNlcyBgTWFwYCdzIGluc2VydGlvbiBvcmRlcmluZyB0byBrZWVwIGZpbGVzIGluIG9yZGVyLlxuICBfZmlsZUxpc3Q6IE1hcDxGaWxlUGF0aCwgVGltZVN0YW1wPjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID97ZmlsZWxpc3Q/OiBGaWxlTGlzdH0pIHtcbiAgICB0aGlzLl9maWxlTGlzdCA9IG5ldyBNYXAoKTtcbiAgICBpZiAoc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5maWxlbGlzdCAhPSBudWxsKSB7XG4gICAgICAvLyBTZXJpYWxpemVkIHN0YXRlIGlzIGluIHJldmVyc2UgY2hyb25vbG9naWNhbCBvcmRlci4gUmV2ZXJzZSBpdCB0byBpbnNlcnQgaXRlbXMgY29ycmVjdGx5LlxuICAgICAgc3RhdGUuZmlsZWxpc3QucmVkdWNlUmlnaHQoKF8sIGZpbGVJdGVtKSA9PiB7XG4gICAgICAgIHRoaXMuX2ZpbGVMaXN0LnNldChmaWxlSXRlbS5wYXRoLCBmaWxlSXRlbS50aW1lc3RhbXApO1xuICAgICAgfSwgbnVsbCk7XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oKGl0ZW06ID9taXhlZCkgPT4ge1xuICAgICAgLy8gTm90IGFsbCBgaXRlbWBzIGFyZSBpbnN0YW5jZXMgb2YgVGV4dEVkaXRvciAoZS5nLiB0aGUgZGlmZiB2aWV3KS5cbiAgICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbS5nZXRQYXRoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvclBhdGggPSBpdGVtLmdldFBhdGgoKTtcbiAgICAgIGlmIChlZGl0b3JQYXRoICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy50b3VjaEZpbGUoZWRpdG9yUGF0aCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgdG91Y2hGaWxlKHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIERlbGV0ZSBmaXJzdCB0byBmb3JjZSBhIG5ldyBpbnNlcnRpb24uXG4gICAgdGhpcy5fZmlsZUxpc3QuZGVsZXRlKHBhdGgpO1xuICAgIHRoaXMuX2ZpbGVMaXN0LnNldChwYXRoLCBEYXRlLm5vdygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZS1jaHJvbm9sb2dpY2FsIGxpc3Qgb2YgcmVjZW50bHkgb3BlbmVkIGZpbGVzLlxuICAgKi9cbiAgQHRyYWNrVGltaW5nKClcbiAgZ2V0UmVjZW50RmlsZXMoKTogRmlsZUxpc3Qge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2ZpbGVMaXN0KS5yZXZlcnNlKCkubWFwKHBhaXIgPT5cbiAgICAgICh7XG4gICAgICAgIHBhdGg6IHBhaXJbMF0sXG4gICAgICAgIHRpbWVzdGFtcDogcGFpclsxXSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlY2VudEZpbGVzU2VydmljZTtcbiJdfQ==