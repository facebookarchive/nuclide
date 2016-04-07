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

var _require2 = require('../../nuclide-commons');

var array = _require2.array;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY2VudEZpbGVzU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztnQ0FxQjBCLHlCQUF5Qjs7Ozs7Ozs7OztlQU5yQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztnQkFFVixPQUFPLENBQUMsdUJBQXVCLENBQUM7O0lBQXpDLEtBQUssYUFBTCxLQUFLOztJQUVWLHdDQUF3QyxHQUN0QyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxpQkFBaUIsQ0FEekQsd0NBQXdDOztJQUlwQyxrQkFBa0I7QUFLWCxXQUxQLGtCQUFrQixDQUtWLEtBQTZCLEVBQUU7OzswQkFMdkMsa0JBQWtCOztBQU1wQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFOztBQUUzQyxXQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUFDLENBQUMsRUFBRSxRQUFRLEVBQUs7QUFDMUMsY0FBSyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ3ZELEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDVjtBQUNELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2hELFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLFVBQUMsSUFBSSxFQUFhOztBQUVqRixVQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUU7QUFDL0MsZUFBTztPQUNSO0FBQ0QsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xDLFVBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUM1QjtLQUNGLENBQUMsQ0FBQyxDQUFDO0dBQ0w7O3dCQXhCRyxrQkFBa0I7O1dBMEJiLG1CQUFDLElBQVksRUFBUTs7QUFFNUIsVUFBSSxDQUFDLFNBQVMsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztLQUN0Qzs7Ozs7OztpQkFLQSxvQ0FBYTtXQUNBLDBCQUFhO0FBQ3pCLGFBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUNqRDtBQUNDLGNBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2IsbUJBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25CO09BQUMsQ0FDSCxDQUFDO0tBQ0g7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBL0NHLGtCQUFrQjs7O0FBbUR4QixNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6IlJlY2VudEZpbGVzU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCB0eXBlIEZpbGVQYXRoID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgVGltZVN0YW1wID0gbnVtYmVyO1xuZXhwb3J0IHR5cGUgRmlsZUxpc3QgPSBBcnJheTx7cGF0aDogRmlsZVBhdGg7IHRpbWVzdGFtcDogVGltZVN0YW1wfT47XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY29uc3Qge2FycmF5fSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3Qge1xuICBvbldvcmtzcGFjZURpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtLFxufSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJykuYXRvbUV2ZW50RGVib3VuY2U7XG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmNsYXNzIFJlY2VudEZpbGVzU2VydmljZSB7XG4gIC8vIE1hcCB1c2VzIGBNYXBgJ3MgaW5zZXJ0aW9uIG9yZGVyaW5nIHRvIGtlZXAgZmlsZXMgaW4gb3JkZXIuXG4gIF9maWxlTGlzdDogTWFwPEZpbGVQYXRoLCBUaW1lU3RhbXA+O1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP3tmaWxlbGlzdD86IEZpbGVMaXN0fSkge1xuICAgIHRoaXMuX2ZpbGVMaXN0ID0gbmV3IE1hcCgpO1xuICAgIGlmIChzdGF0ZSAhPSBudWxsICYmIHN0YXRlLmZpbGVsaXN0ICE9IG51bGwpIHtcbiAgICAgIC8vIFNlcmlhbGl6ZWQgc3RhdGUgaXMgaW4gcmV2ZXJzZSBjaHJvbm9sb2dpY2FsIG9yZGVyLiBSZXZlcnNlIGl0IHRvIGluc2VydCBpdGVtcyBjb3JyZWN0bHkuXG4gICAgICBzdGF0ZS5maWxlbGlzdC5yZWR1Y2VSaWdodCgoXywgZmlsZUl0ZW0pID0+IHtcbiAgICAgICAgdGhpcy5fZmlsZUxpc3Quc2V0KGZpbGVJdGVtLnBhdGgsIGZpbGVJdGVtLnRpbWVzdGFtcCk7XG4gICAgICB9LCBudWxsKTtcbiAgICB9XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQob25Xb3Jrc3BhY2VEaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSgoaXRlbTogP21peGVkKSA9PiB7XG4gICAgICAvLyBOb3QgYWxsIGBpdGVtYHMgYXJlIGluc3RhbmNlcyBvZiBUZXh0RWRpdG9yIChlLmcuIHRoZSBkaWZmIHZpZXcpLlxuICAgICAgaWYgKCFpdGVtIHx8IHR5cGVvZiBpdGVtLmdldFBhdGggIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgZWRpdG9yUGF0aCA9IGl0ZW0uZ2V0UGF0aCgpO1xuICAgICAgaWYgKGVkaXRvclBhdGggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnRvdWNoRmlsZShlZGl0b3JQYXRoKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cblxuICB0b3VjaEZpbGUocGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gRGVsZXRlIGZpcnN0IHRvIGZvcmNlIGEgbmV3IGluc2VydGlvbi5cbiAgICB0aGlzLl9maWxlTGlzdC5kZWxldGUocGF0aCk7XG4gICAgdGhpcy5fZmlsZUxpc3Quc2V0KHBhdGgsIERhdGUubm93KCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZXZlcnNlLWNocm9ub2xvZ2ljYWwgbGlzdCBvZiByZWNlbnRseSBvcGVuZWQgZmlsZXMuXG4gICAqL1xuICBAdHJhY2tUaW1pbmcoKVxuICBnZXRSZWNlbnRGaWxlcygpOiBGaWxlTGlzdCB7XG4gICAgcmV0dXJuIGFycmF5LmZyb20odGhpcy5fZmlsZUxpc3QpLnJldmVyc2UoKS5tYXAocGFpciA9PlxuICAgICAgKHtcbiAgICAgICAgcGF0aDogcGFpclswXSxcbiAgICAgICAgdGltZXN0YW1wOiBwYWlyWzFdLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVjZW50RmlsZXNTZXJ2aWNlO1xuIl19