Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

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

var _require2 = require('../../commons');

var array = _require2.array;

var onWorkspaceDidStopChangingActivePaneItem = require('../../atom-helpers').atomEventDebounce.onWorkspaceDidStopChangingActivePaneItem;

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
    decorators: [(0, _analytics.trackTiming)()],
    value: function getRecentFiles() {
      return array.from(this._fileList).reverse().map(function (pair) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY2VudEZpbGVzU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozt5QkFtQjBCLGlCQUFpQjs7Ozs7Ozs7OztlQUpiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXRDLG1CQUFtQixZQUFuQixtQkFBbUI7O2dCQUVWLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQWpDLEtBQUssYUFBTCxLQUFLOztJQUNMLHdDQUF3QyxHQUFJLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLGlCQUFpQixDQUEzRix3Q0FBd0M7O0lBR3pDLGtCQUFrQjtBQUtYLFdBTFAsa0JBQWtCLENBS1YsS0FBNkIsRUFBRTs7OzBCQUx2QyxrQkFBa0I7O0FBTXBCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7O0FBRTNDLFdBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBSztBQUMxQyxjQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDdkQsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNWO0FBQ0QsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDaEQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsVUFBQyxJQUFJLEVBQWE7O0FBRWpGLFVBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRTtBQUMvQyxlQUFPO09BQ1I7QUFDRCxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO0FBQ3RCLGNBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQzVCO0tBQ0YsQ0FBQyxDQUFDLENBQUM7R0FDTDs7d0JBeEJHLGtCQUFrQjs7V0EwQmIsbUJBQUMsSUFBWSxFQUFROztBQUU1QixVQUFJLENBQUMsU0FBUyxVQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ3RDOzs7Ozs7O2lCQUtBLDZCQUFhO1dBQ0EsMEJBQWE7QUFDekIsYUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQ2pEO0FBQ0MsY0FBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDYixtQkFBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDbkI7T0FBQyxDQUNILENBQUM7S0FDSDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0EvQ0csa0JBQWtCOzs7QUFtRHhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiUmVjZW50RmlsZXNTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuZXhwb3J0IHR5cGUgRmlsZVBhdGggPSBzdHJpbmc7XG5leHBvcnQgdHlwZSBUaW1lU3RhbXAgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBGaWxlTGlzdCA9IEFycmF5PHtwYXRoOiBGaWxlUGF0aCwgdGltZXN0YW1wOiBUaW1lU3RhbXB9PjtcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3Qge29uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19ID0gcmVxdWlyZSgnLi4vLi4vYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jbGFzcyBSZWNlbnRGaWxlc1NlcnZpY2Uge1xuICAvLyBNYXAgdXNlcyBgTWFwYCdzIGluc2VydGlvbiBvcmRlcmluZyB0byBrZWVwIGZpbGVzIGluIG9yZGVyLlxuICBfZmlsZUxpc3Q6IE1hcDxGaWxlUGF0aCwgVGltZVN0YW1wPjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID97ZmlsZWxpc3Q/OiBGaWxlTGlzdH0pIHtcbiAgICB0aGlzLl9maWxlTGlzdCA9IG5ldyBNYXAoKTtcbiAgICBpZiAoc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5maWxlbGlzdCAhPSBudWxsKSB7XG4gICAgICAvLyBTZXJpYWxpemVkIHN0YXRlIGlzIGluIHJldmVyc2UgY2hyb25vbG9naWNhbCBvcmRlci4gUmV2ZXJzZSBpdCB0byBpbnNlcnQgaXRlbXMgY29ycmVjdGx5LlxuICAgICAgc3RhdGUuZmlsZWxpc3QucmVkdWNlUmlnaHQoKF8sIGZpbGVJdGVtKSA9PiB7XG4gICAgICAgIHRoaXMuX2ZpbGVMaXN0LnNldChmaWxlSXRlbS5wYXRoLCBmaWxlSXRlbS50aW1lc3RhbXApO1xuICAgICAgfSwgbnVsbCk7XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG9uV29ya3NwYWNlRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0oKGl0ZW06ID9taXhlZCkgPT4ge1xuICAgICAgLy8gTm90IGFsbCBgaXRlbWBzIGFyZSBpbnN0YW5jZXMgb2YgVGV4dEVkaXRvciAoZS5nLiB0aGUgZGlmZiB2aWV3KS5cbiAgICAgIGlmICghaXRlbSB8fCB0eXBlb2YgaXRlbS5nZXRQYXRoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkaXRvclBhdGggPSBpdGVtLmdldFBhdGgoKTtcbiAgICAgIGlmIChlZGl0b3JQYXRoICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy50b3VjaEZpbGUoZWRpdG9yUGF0aCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9XG5cbiAgdG91Y2hGaWxlKHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIERlbGV0ZSBmaXJzdCB0byBmb3JjZSBhIG5ldyBpbnNlcnRpb24uXG4gICAgdGhpcy5fZmlsZUxpc3QuZGVsZXRlKHBhdGgpO1xuICAgIHRoaXMuX2ZpbGVMaXN0LnNldChwYXRoLCBEYXRlLm5vdygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZS1jaHJvbm9sb2dpY2FsIGxpc3Qgb2YgcmVjZW50bHkgb3BlbmVkIGZpbGVzLlxuICAgKi9cbiAgQHRyYWNrVGltaW5nKClcbiAgZ2V0UmVjZW50RmlsZXMoKTogRmlsZUxpc3Qge1xuICAgIHJldHVybiBhcnJheS5mcm9tKHRoaXMuX2ZpbGVMaXN0KS5yZXZlcnNlKCkubWFwKHBhaXIgPT5cbiAgICAgICh7XG4gICAgICAgIHBhdGg6IHBhaXJbMF0sXG4gICAgICAgIHRpbWVzdGFtcDogcGFpclsxXSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlY2VudEZpbGVzU2VydmljZTtcbiJdfQ==