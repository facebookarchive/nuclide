var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _remoteUri = require('../../remote-uri');

var _remoteUri2 = _interopRequireDefault(_remoteUri);

var FileTreeNode = (function () {
  function FileTreeNode(store, rootKey, nodeKey) {
    _classCallCheck(this, FileTreeNode);

    this._store = store;
    this.rootKey = rootKey;
    this.nodeKey = nodeKey;
    this.nodePath = _FileTreeHelpers2['default'].keyToPath(nodeKey);
    this.nodeName = _FileTreeHelpers2['default'].keyToName(nodeKey);
    this.isRoot = rootKey === nodeKey;
    this.isContainer = _FileTreeHelpers2['default'].isDirKey(nodeKey);
  }

  _createClass(FileTreeNode, [{
    key: 'isLoading',
    value: function isLoading() {
      return this._store.isLoading(this.rootKey, this.nodeKey);
    }
  }, {
    key: 'isExpanded',
    value: function isExpanded() {
      return this._store.isExpanded(this.rootKey, this.nodeKey);
    }
  }, {
    key: 'isSelected',
    value: function isSelected() {
      return this._store.isSelected(this.rootKey, this.nodeKey);
    }
  }, {
    key: 'usePreviewTabs',
    value: function usePreviewTabs() {
      return this._store.usePreviewTabs();
    }
  }, {
    key: 'getVcsStatusCode',
    value: function getVcsStatusCode() {
      return this._store.getVcsStatusCode(this.rootKey, this.nodeKey);
    }
  }, {
    key: 'getParentNode',
    value: function getParentNode() {
      return this._store.getNode(this.rootKey, _FileTreeHelpers2['default'].getParentKey(this.nodeKey));
    }
  }, {
    key: 'getChildKeys',
    value: function getChildKeys() {
      return this._store.getChildKeys(this.rootKey, this.nodeKey);
    }
  }, {
    key: 'getChildNodes',
    value: function getChildNodes() {
      var _this = this;

      var childKeys = this._store.getChildKeys(this.rootKey, this.nodeKey);
      return childKeys.map(function (childKey) {
        return _this._store.getNode(_this.rootKey, childKey);
      });
    }
  }, {
    key: 'getRelativePath',
    value: function getRelativePath() {
      return this.nodePath.slice(this.rootKey.length);
    }

    // For remote files we want the local path instead of full path.
    // i.e, "/home/dir/file" vs "nuclide://hostname:123/home/dir/file"
  }, {
    key: 'getLocalPath',
    value: function getLocalPath() {
      var path = this.nodePath;
      if (_remoteUri2['default'].isRemote(path)) {
        return _remoteUri2['default'].parse(path).pathname;
      } else {
        return path;
      }
    }
  }, {
    key: 'getCheckedStatus',
    value: function getCheckedStatus() {
      if (!this._store.isEditingWorkingSet()) {
        return '';
      }

      var editedWorkingSet = this._store.getEditedWorkingSet();

      if (editedWorkingSet.isEmpty()) {
        return 'clear';
      }

      if (this.isContainer) {
        if (editedWorkingSet.containsFile(this.nodeKey)) {
          return 'checked';
        } else if (editedWorkingSet.containsDir(this.nodeKey)) {
          return 'partial';
        }

        return 'clear';
      } else {
        if (editedWorkingSet.containsFile(this.nodeKey)) {
          return 'checked';
        }

        return 'clear';
      }
    }
  }, {
    key: 'shouldBeSoftened',
    value: function shouldBeSoftened() {
      if (this._store.isEditingWorkingSet()) {
        return false;
      }

      var workingSet = this._store.getWorkingSet();
      var openFilesWs = this._store.getOpenFilesWorkingSet();

      if (!workingSet || !openFilesWs || workingSet.isEmpty() || openFilesWs.isEmpty()) {
        return false;
      }

      if (this.isContainer) {
        if (!workingSet.containsDir(this.nodeKey) && openFilesWs.containsDir(this.nodeKey)) {
          return true;
        }

        return false;
      } else {
        if (!workingSet.containsFile(this.nodeKey) && openFilesWs.containsFile(this.nodeKey)) {
          return true;
        }

        return false;
      }
    }
  }]);

  return FileTreeNode;
})();

module.exports = FileTreeNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlTm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OzsrQkFhNEIsbUJBQW1COzs7O3lCQUN6QixrQkFBa0I7Ozs7SUFFbEMsWUFBWTtBQVNMLFdBVFAsWUFBWSxDQVNKLEtBQW9CLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFBRTswQkFUaEUsWUFBWTs7QUFVZCxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsUUFBUSxHQUFHLDZCQUFnQixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBZ0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxLQUFLLE9BQU8sQ0FBQztBQUNsQyxRQUFJLENBQUMsV0FBVyxHQUFHLDZCQUFnQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDdEQ7O2VBakJHLFlBQVk7O1dBbUJQLHFCQUFZO0FBQ25CLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDMUQ7OztXQUVTLHNCQUFZO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDM0Q7OztXQUVTLHNCQUFZO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDM0Q7OztXQUVhLDBCQUFZO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztLQUNyQzs7O1dBRWUsNEJBQVk7QUFDMUIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2pFOzs7V0FFWSx5QkFBaUI7QUFDNUIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLDZCQUFnQixZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDdEY7OztXQUVXLHdCQUFrQjtBQUM1QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzdEOzs7V0FFWSx5QkFBd0I7OztBQUNuQyxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2RSxhQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRO2VBQUksTUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQUssT0FBTyxFQUFFLFFBQVEsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMvRTs7O1dBRWMsMkJBQVc7QUFDeEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2pEOzs7Ozs7V0FJVyx3QkFBVztBQUNyQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzNCLFVBQUksdUJBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzVCLGVBQU8sdUJBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztPQUN2QyxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7V0FFZSw0QkFBVztBQUN6QixVQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO0FBQ3RDLGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7O0FBRTNELFVBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDOUIsZUFBTyxPQUFPLENBQUM7T0FDaEI7O0FBRUQsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3BCLFlBQUksZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUMvQyxpQkFBTyxTQUFTLENBQUM7U0FDbEIsTUFBTSxJQUFJLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDckQsaUJBQU8sU0FBUyxDQUFDO1NBQ2xCOztBQUVELGVBQU8sT0FBTyxDQUFDO09BQ2hCLE1BQU07QUFDTCxZQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDL0MsaUJBQU8sU0FBUyxDQUFDO1NBQ2xCOztBQUVELGVBQU8sT0FBTyxDQUFDO09BQ2hCO0tBQ0Y7OztXQUVlLDRCQUFZO0FBQzFCLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFO0FBQ3JDLGVBQU8sS0FBSyxDQUFDO09BQ2Q7O0FBRUQsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUMvQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0FBRXpELFVBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUNoRixlQUFPLEtBQUssQ0FBQztPQUNkOztBQUVELFVBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQixZQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDbEYsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsZUFBTyxLQUFLLENBQUM7T0FDZCxNQUFNO0FBQ0wsWUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3BGLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELGVBQU8sS0FBSyxDQUFDO09BQ2Q7S0FDRjs7O1NBeEhHLFlBQVk7OztBQTJIbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNsYXNzIEZpbGVUcmVlTm9kZSB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgcm9vdEtleTogc3RyaW5nO1xuICBub2RlS2V5OiBzdHJpbmc7XG4gIG5vZGVQYXRoOiBzdHJpbmc7XG4gIG5vZGVOYW1lOiBzdHJpbmc7XG4gIGlzUm9vdDogYm9vbGVhbjtcbiAgaXNDb250YWluZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmU6IEZpbGVUcmVlU3RvcmUsIHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLnJvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMubm9kZUtleSA9IG5vZGVLZXk7XG4gICAgdGhpcy5ub2RlUGF0aCA9IEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZUtleSk7XG4gICAgdGhpcy5ub2RlTmFtZSA9IEZpbGVUcmVlSGVscGVycy5rZXlUb05hbWUobm9kZUtleSk7XG4gICAgdGhpcy5pc1Jvb3QgPSByb290S2V5ID09PSBub2RlS2V5O1xuICAgIHRoaXMuaXNDb250YWluZXIgPSBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSk7XG4gIH1cblxuICBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzTG9hZGluZyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBpc0V4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzU2VsZWN0ZWQodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLnVzZVByZXZpZXdUYWJzKCk7XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKCk6ID9udW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRWY3NTdGF0dXNDb2RlKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGdldFBhcmVudE5vZGUoKTogRmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0Tm9kZSh0aGlzLnJvb3RLZXksIEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkodGhpcy5ub2RlS2V5KSk7XG4gIH1cblxuICBnZXRDaGlsZEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldENoaWxkS2V5cyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBnZXRDaGlsZE5vZGVzKCk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX3N0b3JlLmdldENoaWxkS2V5cyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gICAgcmV0dXJuIGNoaWxkS2V5cy5tYXAoY2hpbGRLZXkgPT4gdGhpcy5fc3RvcmUuZ2V0Tm9kZSh0aGlzLnJvb3RLZXksIGNoaWxkS2V5KSk7XG4gIH1cblxuICBnZXRSZWxhdGl2ZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlUGF0aC5zbGljZSh0aGlzLnJvb3RLZXkubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIEZvciByZW1vdGUgZmlsZXMgd2Ugd2FudCB0aGUgbG9jYWwgcGF0aCBpbnN0ZWFkIG9mIGZ1bGwgcGF0aC5cbiAgLy8gaS5lLCBcIi9ob21lL2Rpci9maWxlXCIgdnMgXCJudWNsaWRlOi8vaG9zdG5hbWU6MTIzL2hvbWUvZGlyL2ZpbGVcIlxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5ub2RlUGF0aDtcbiAgICBpZiAoUmVtb3RlVXJpLmlzUmVtb3RlKHBhdGgpKSB7XG4gICAgICByZXR1cm4gUmVtb3RlVXJpLnBhcnNlKHBhdGgpLnBhdGhuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gIH1cblxuICBnZXRDaGVja2VkU3RhdHVzKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuXG4gICAgaWYgKGVkaXRlZFdvcmtpbmdTZXQuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gJ2NsZWFyJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKGVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICdjaGVja2VkJztcbiAgICAgIH0gZWxzZSBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0Rpcih0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAncGFydGlhbCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnY2xlYXInO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gJ2NoZWNrZWQnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ2NsZWFyJztcbiAgICB9XG4gIH1cblxuICBzaG91bGRCZVNvZnRlbmVkKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB3b3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldCgpO1xuICAgIGNvbnN0IG9wZW5GaWxlc1dzID0gdGhpcy5fc3RvcmUuZ2V0T3BlbkZpbGVzV29ya2luZ1NldCgpO1xuXG4gICAgaWYgKCF3b3JraW5nU2V0IHx8ICFvcGVuRmlsZXNXcyB8fCB3b3JraW5nU2V0LmlzRW1wdHkoKSB8fCBvcGVuRmlsZXNXcy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKCF3b3JraW5nU2V0LmNvbnRhaW5zRGlyKHRoaXMubm9kZUtleSkgJiYgb3BlbkZpbGVzV3MuY29udGFpbnNEaXIodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkgJiYgb3BlbkZpbGVzV3MuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZU5vZGU7XG4iXX0=