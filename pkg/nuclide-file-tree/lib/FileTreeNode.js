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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var FileTreeNode = (function () {
  function FileTreeNode(store, rootKey, nodeKey) {
    _classCallCheck(this, FileTreeNode);

    this._store = store;
    this.rootKey = rootKey;
    this.nodeKey = nodeKey;
    this.hashKey = _FileTreeHelpers2['default'].buildHashKey(nodeKey);
    this.nodePath = _FileTreeHelpers2['default'].keyToPath(nodeKey);
    this.nodeName = _FileTreeHelpers2['default'].keyToName(nodeKey);
    this.isRoot = rootKey === nodeKey;
    this.isContainer = _FileTreeHelpers2['default'].isDirKey(nodeKey);
  }

  _createClass(FileTreeNode, [{
    key: 'isCwd',
    value: function isCwd() {
      return this._store.isCwd(this.nodeKey);
    }
  }, {
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
      if (_nuclideRemoteUri2['default'].isRemote(path)) {
        return _nuclideRemoteUri2['default'].parse(path).pathname;
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
//# sourceMappingURL=data:application/json;base64,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VUFBVSxJQUFJLENBQUMsV0FBVyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDaEYsZUFBTyxLQUFLLENBQUM7T0FDZDs7QUFFRCxVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2xGLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELGVBQU8sS0FBSyxDQUFDO09BQ2QsTUFBTTtBQUNMLFlBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNwRixpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0Y7OztTQTlIRyxZQUFZOzs7QUFpSWxCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgUmVtb3RlVXJpIGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmNsYXNzIEZpbGVUcmVlTm9kZSB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgcm9vdEtleTogc3RyaW5nO1xuICBub2RlS2V5OiBzdHJpbmc7XG4gIGhhc2hLZXk6IHN0cmluZztcbiAgbm9kZVBhdGg6IHN0cmluZztcbiAgbm9kZU5hbWU6IHN0cmluZztcbiAgaXNSb290OiBib29sZWFuO1xuICBpc0NvbnRhaW5lcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogRmlsZVRyZWVTdG9yZSwgcm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMucm9vdEtleSA9IHJvb3RLZXk7XG4gICAgdGhpcy5ub2RlS2V5ID0gbm9kZUtleTtcbiAgICB0aGlzLmhhc2hLZXkgPSBGaWxlVHJlZUhlbHBlcnMuYnVpbGRIYXNoS2V5KG5vZGVLZXkpO1xuICAgIHRoaXMubm9kZVBhdGggPSBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGVLZXkpO1xuICAgIHRoaXMubm9kZU5hbWUgPSBGaWxlVHJlZUhlbHBlcnMua2V5VG9OYW1lKG5vZGVLZXkpO1xuICAgIHRoaXMuaXNSb290ID0gcm9vdEtleSA9PT0gbm9kZUtleTtcbiAgICB0aGlzLmlzQ29udGFpbmVyID0gRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpO1xuICB9XG5cbiAgaXNDd2QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzQ3dkKHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzTG9hZGluZyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBpc0V4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzU2VsZWN0ZWQodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgdXNlUHJldmlld1RhYnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLnVzZVByZXZpZXdUYWJzKCk7XG4gIH1cblxuICBnZXRWY3NTdGF0dXNDb2RlKCk6ID9udW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRWY3NTdGF0dXNDb2RlKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGdldFBhcmVudE5vZGUoKTogRmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0Tm9kZSh0aGlzLnJvb3RLZXksIEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkodGhpcy5ub2RlS2V5KSk7XG4gIH1cblxuICBnZXRDaGlsZEtleXMoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldENoaWxkS2V5cyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBnZXRDaGlsZE5vZGVzKCk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX3N0b3JlLmdldENoaWxkS2V5cyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gICAgcmV0dXJuIGNoaWxkS2V5cy5tYXAoY2hpbGRLZXkgPT4gdGhpcy5fc3RvcmUuZ2V0Tm9kZSh0aGlzLnJvb3RLZXksIGNoaWxkS2V5KSk7XG4gIH1cblxuICBnZXRSZWxhdGl2ZVBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlUGF0aC5zbGljZSh0aGlzLnJvb3RLZXkubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIEZvciByZW1vdGUgZmlsZXMgd2Ugd2FudCB0aGUgbG9jYWwgcGF0aCBpbnN0ZWFkIG9mIGZ1bGwgcGF0aC5cbiAgLy8gaS5lLCBcIi9ob21lL2Rpci9maWxlXCIgdnMgXCJudWNsaWRlOi8vaG9zdG5hbWU6MTIzL2hvbWUvZGlyL2ZpbGVcIlxuICBnZXRMb2NhbFBhdGgoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5ub2RlUGF0aDtcbiAgICBpZiAoUmVtb3RlVXJpLmlzUmVtb3RlKHBhdGgpKSB7XG4gICAgICByZXR1cm4gUmVtb3RlVXJpLnBhcnNlKHBhdGgpLnBhdGhuYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gIH1cblxuICBnZXRDaGVja2VkU3RhdHVzKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0RWRpdGVkV29ya2luZ1NldCgpO1xuXG4gICAgaWYgKGVkaXRlZFdvcmtpbmdTZXQuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gJ2NsZWFyJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKGVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICdjaGVja2VkJztcbiAgICAgIH0gZWxzZSBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0Rpcih0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAncGFydGlhbCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnY2xlYXInO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gJ2NoZWNrZWQnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ2NsZWFyJztcbiAgICB9XG4gIH1cblxuICBzaG91bGRCZVNvZnRlbmVkKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VkaXRpbmdXb3JraW5nU2V0KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB3b3JraW5nU2V0ID0gdGhpcy5fc3RvcmUuZ2V0V29ya2luZ1NldCgpO1xuICAgIGNvbnN0IG9wZW5GaWxlc1dzID0gdGhpcy5fc3RvcmUuZ2V0T3BlbkZpbGVzV29ya2luZ1NldCgpO1xuXG4gICAgaWYgKCF3b3JraW5nU2V0IHx8ICFvcGVuRmlsZXNXcyB8fCB3b3JraW5nU2V0LmlzRW1wdHkoKSB8fCBvcGVuRmlsZXNXcy5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0NvbnRhaW5lcikge1xuICAgICAgaWYgKCF3b3JraW5nU2V0LmNvbnRhaW5zRGlyKHRoaXMubm9kZUtleSkgJiYgb3BlbkZpbGVzV3MuY29udGFpbnNEaXIodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkgJiYgb3BlbkZpbGVzV3MuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZU5vZGU7XG4iXX0=