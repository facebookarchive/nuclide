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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlTm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OzsrQkFhNEIsbUJBQW1COzs7O3lCQUN6QixrQkFBa0I7Ozs7SUFFbEMsWUFBWTtBQVVMLFdBVlAsWUFBWSxDQVVKLEtBQW9CLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFBRTswQkFWaEUsWUFBWTs7QUFXZCxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixRQUFJLENBQUMsT0FBTyxHQUFHLDZCQUFnQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckQsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBZ0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxRQUFRLEdBQUcsNkJBQWdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sS0FBSyxPQUFPLENBQUM7QUFDbEMsUUFBSSxDQUFDLFdBQVcsR0FBRyw2QkFBZ0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3REOztlQW5CRyxZQUFZOztXQXFCWCxpQkFBWTtBQUNmLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3hDOzs7V0FFUSxxQkFBWTtBQUNuQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzFEOzs7V0FFUyxzQkFBWTtBQUNwQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzNEOzs7V0FFUyxzQkFBWTtBQUNwQixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzNEOzs7V0FFYSwwQkFBWTtBQUN4QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDckM7OztXQUVlLDRCQUFZO0FBQzFCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNqRTs7O1dBRVkseUJBQWlCO0FBQzVCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSw2QkFBZ0IsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQ3RGOzs7V0FFVyx3QkFBa0I7QUFDNUIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3RDs7O1dBRVkseUJBQXdCOzs7QUFDbkMsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkUsYUFBTyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsUUFBUTtlQUFJLE1BQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFLLE9BQU8sRUFBRSxRQUFRLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDL0U7OztXQUVjLDJCQUFXO0FBQ3hCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqRDs7Ozs7O1dBSVcsd0JBQVc7QUFDckIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixVQUFJLHVCQUFVLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM1QixlQUFPLHVCQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7T0FDdkMsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7O1dBRWUsNEJBQVc7QUFDekIsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtBQUN0QyxlQUFPLEVBQUUsQ0FBQztPQUNYOztBQUVELFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUUzRCxVQUFJLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQzlCLGVBQU8sT0FBTyxDQUFDO09BQ2hCOztBQUVELFVBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQixZQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDL0MsaUJBQU8sU0FBUyxDQUFDO1NBQ2xCLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3JELGlCQUFPLFNBQVMsQ0FBQztTQUNsQjs7QUFFRCxlQUFPLE9BQU8sQ0FBQztPQUNoQixNQUFNO0FBQ0wsWUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQy9DLGlCQUFPLFNBQVMsQ0FBQztTQUNsQjs7QUFFRCxlQUFPLE9BQU8sQ0FBQztPQUNoQjtLQUNGOzs7V0FFZSw0QkFBWTtBQUMxQixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtBQUNyQyxlQUFPLEtBQUssQ0FBQztPQUNkOztBQUVELFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDL0MsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUV6RCxVQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsV0FBVyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDaEYsZUFBTyxLQUFLLENBQUM7T0FDZDs7QUFFRCxVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2xGLGlCQUFPLElBQUksQ0FBQztTQUNiOztBQUVELGVBQU8sS0FBSyxDQUFDO09BQ2QsTUFBTTtBQUNMLFlBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNwRixpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxlQUFPLEtBQUssQ0FBQztPQUNkO0tBQ0Y7OztTQTlIRyxZQUFZOzs7QUFpSWxCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlTm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgUmVtb3RlVXJpIGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5jbGFzcyBGaWxlVHJlZU5vZGUge1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIHJvb3RLZXk6IHN0cmluZztcbiAgbm9kZUtleTogc3RyaW5nO1xuICBoYXNoS2V5OiBzdHJpbmc7XG4gIG5vZGVQYXRoOiBzdHJpbmc7XG4gIG5vZGVOYW1lOiBzdHJpbmc7XG4gIGlzUm9vdDogYm9vbGVhbjtcbiAgaXNDb250YWluZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmU6IEZpbGVUcmVlU3RvcmUsIHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLnJvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMubm9kZUtleSA9IG5vZGVLZXk7XG4gICAgdGhpcy5oYXNoS2V5ID0gRmlsZVRyZWVIZWxwZXJzLmJ1aWxkSGFzaEtleShub2RlS2V5KTtcbiAgICB0aGlzLm5vZGVQYXRoID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KTtcbiAgICB0aGlzLm5vZGVOYW1lID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvTmFtZShub2RlS2V5KTtcbiAgICB0aGlzLmlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgdGhpcy5pc0NvbnRhaW5lciA9IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KTtcbiAgfVxuXG4gIGlzQ3dkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc0N3ZCh0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgaXNMb2FkaW5nKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc0xvYWRpbmcodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuaXNFeHBhbmRlZCh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBpc1NlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc1NlbGVjdGVkKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIHVzZVByZXZpZXdUYWJzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS51c2VQcmV2aWV3VGFicygpO1xuICB9XG5cbiAgZ2V0VmNzU3RhdHVzQ29kZSgpOiA/bnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0VmNzU3RhdHVzQ29kZSh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBnZXRQYXJlbnROb2RlKCk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldE5vZGUodGhpcy5yb290S2V5LCBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KHRoaXMubm9kZUtleSkpO1xuICB9XG5cbiAgZ2V0Q2hpbGRLZXlzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRDaGlsZEtleXModGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgZ2V0Q2hpbGROb2RlcygpOiBBcnJheTxGaWxlVHJlZU5vZGU+IHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9zdG9yZS5nZXRDaGlsZEtleXModGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICAgIHJldHVybiBjaGlsZEtleXMubWFwKGNoaWxkS2V5ID0+IHRoaXMuX3N0b3JlLmdldE5vZGUodGhpcy5yb290S2V5LCBjaGlsZEtleSkpO1xuICB9XG5cbiAgZ2V0UmVsYXRpdmVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9kZVBhdGguc2xpY2UodGhpcy5yb290S2V5Lmxlbmd0aCk7XG4gIH1cblxuICAvLyBGb3IgcmVtb3RlIGZpbGVzIHdlIHdhbnQgdGhlIGxvY2FsIHBhdGggaW5zdGVhZCBvZiBmdWxsIHBhdGguXG4gIC8vIGkuZSwgXCIvaG9tZS9kaXIvZmlsZVwiIHZzIFwibnVjbGlkZTovL2hvc3RuYW1lOjEyMy9ob21lL2Rpci9maWxlXCJcbiAgZ2V0TG9jYWxQYXRoKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMubm9kZVBhdGg7XG4gICAgaWYgKFJlbW90ZVVyaS5pc1JlbW90ZShwYXRoKSkge1xuICAgICAgcmV0dXJuIFJlbW90ZVVyaS5wYXJzZShwYXRoKS5wYXRobmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2hlY2tlZFN0YXR1cygpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgZWRpdGVkV29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldEVkaXRlZFdvcmtpbmdTZXQoKTtcblxuICAgIGlmIChlZGl0ZWRXb3JraW5nU2V0LmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuICdjbGVhcic7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDb250YWluZXIpIHtcbiAgICAgIGlmIChlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRmlsZSh0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAnY2hlY2tlZCc7XG4gICAgICB9IGVsc2UgaWYgKGVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNEaXIodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gJ3BhcnRpYWwnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ2NsZWFyJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICdjaGVja2VkJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICdjbGVhcic7XG4gICAgfVxuICB9XG5cbiAgc2hvdWxkQmVTb2Z0ZW5lZCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFZGl0aW5nV29ya2luZ1NldCgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgd29ya2luZ1NldCA9IHRoaXMuX3N0b3JlLmdldFdvcmtpbmdTZXQoKTtcbiAgICBjb25zdCBvcGVuRmlsZXNXcyA9IHRoaXMuX3N0b3JlLmdldE9wZW5GaWxlc1dvcmtpbmdTZXQoKTtcblxuICAgIGlmICghd29ya2luZ1NldCB8fCAhb3BlbkZpbGVzV3MgfHwgd29ya2luZ1NldC5pc0VtcHR5KCkgfHwgb3BlbkZpbGVzV3MuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDb250YWluZXIpIHtcbiAgICAgIGlmICghd29ya2luZ1NldC5jb250YWluc0Rpcih0aGlzLm5vZGVLZXkpICYmIG9wZW5GaWxlc1dzLmNvbnRhaW5zRGlyKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF3b3JraW5nU2V0LmNvbnRhaW5zRmlsZSh0aGlzLm5vZGVLZXkpICYmIG9wZW5GaWxlc1dzLmNvbnRhaW5zRmlsZSh0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVOb2RlO1xuIl19