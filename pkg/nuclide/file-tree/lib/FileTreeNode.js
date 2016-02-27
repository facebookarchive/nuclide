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

      if (!workingSet || !openFilesWs || openFilesWs.isEmpty()) {
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
//# sourceMappingURL=data:application/json;base64,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LElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNsRixpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxlQUFPLEtBQUssQ0FBQztPQUNkLE1BQU07QUFDTCxZQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDcEYsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGOzs7U0F4SEcsWUFBWTs7O0FBMkhsQixNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJGaWxlVHJlZU5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuY2xhc3MgRmlsZVRyZWVOb2RlIHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICByb290S2V5OiBzdHJpbmc7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgbm9kZVBhdGg6IHN0cmluZztcbiAgbm9kZU5hbWU6IHN0cmluZztcbiAgaXNSb290OiBib29sZWFuO1xuICBpc0NvbnRhaW5lcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogRmlsZVRyZWVTdG9yZSwgcm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMucm9vdEtleSA9IHJvb3RLZXk7XG4gICAgdGhpcy5ub2RlS2V5ID0gbm9kZUtleTtcbiAgICB0aGlzLm5vZGVQYXRoID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KTtcbiAgICB0aGlzLm5vZGVOYW1lID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvTmFtZShub2RlS2V5KTtcbiAgICB0aGlzLmlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgdGhpcy5pc0NvbnRhaW5lciA9IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KTtcbiAgfVxuXG4gIGlzTG9hZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuaXNMb2FkaW5nKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGlzRXhwYW5kZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgaXNTZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuaXNTZWxlY3RlZCh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICB1c2VQcmV2aWV3VGFicygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUudXNlUHJldmlld1RhYnMoKTtcbiAgfVxuXG4gIGdldFZjc1N0YXR1c0NvZGUoKTogP251bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFZjc1N0YXR1c0NvZGUodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgZ2V0UGFyZW50Tm9kZSgpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXROb2RlKHRoaXMucm9vdEtleSwgRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleSh0aGlzLm5vZGVLZXkpKTtcbiAgfVxuXG4gIGdldENoaWxkS2V5cygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0Q2hpbGRLZXlzKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGdldENoaWxkTm9kZXMoKTogQXJyYXk8RmlsZVRyZWVOb2RlPiB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2hpbGRLZXlzKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgICByZXR1cm4gY2hpbGRLZXlzLm1hcChjaGlsZEtleSA9PiB0aGlzLl9zdG9yZS5nZXROb2RlKHRoaXMucm9vdEtleSwgY2hpbGRLZXkpKTtcbiAgfVxuXG4gIGdldFJlbGF0aXZlUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vZGVQYXRoLnNsaWNlKHRoaXMucm9vdEtleS5sZW5ndGgpO1xuICB9XG5cbiAgLy8gRm9yIHJlbW90ZSBmaWxlcyB3ZSB3YW50IHRoZSBsb2NhbCBwYXRoIGluc3RlYWQgb2YgZnVsbCBwYXRoLlxuICAvLyBpLmUsIFwiL2hvbWUvZGlyL2ZpbGVcIiB2cyBcIm51Y2xpZGU6Ly9ob3N0bmFtZToxMjMvaG9tZS9kaXIvZmlsZVwiXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLm5vZGVQYXRoO1xuICAgIGlmIChSZW1vdGVVcmkuaXNSZW1vdGUocGF0aCkpIHtcbiAgICAgIHJldHVybiBSZW1vdGVVcmkucGFyc2UocGF0aCkucGF0aG5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxuXG4gIGdldENoZWNrZWRTdGF0dXMoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGVkaXRlZFdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRFZGl0ZWRXb3JraW5nU2V0KCk7XG5cbiAgICBpZiAoZWRpdGVkV29ya2luZ1NldC5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiAnY2xlYXInO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQ29udGFpbmVyKSB7XG4gICAgICBpZiAoZWRpdGVkV29ya2luZ1NldC5jb250YWluc0ZpbGUodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gJ2NoZWNrZWQnO1xuICAgICAgfSBlbHNlIGlmIChlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRGlyKHRoaXMubm9kZUtleSkpIHtcbiAgICAgICAgcmV0dXJuICdwYXJ0aWFsJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICdjbGVhcic7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRmlsZSh0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAnY2hlY2tlZCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnY2xlYXInO1xuICAgIH1cbiAgfVxuXG4gIHNob3VsZEJlU29mdGVuZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRWRpdGluZ1dvcmtpbmdTZXQoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHdvcmtpbmdTZXQgPSB0aGlzLl9zdG9yZS5nZXRXb3JraW5nU2V0KCk7XG4gICAgY29uc3Qgb3BlbkZpbGVzV3MgPSB0aGlzLl9zdG9yZS5nZXRPcGVuRmlsZXNXb3JraW5nU2V0KCk7XG5cbiAgICBpZiAoIXdvcmtpbmdTZXQgfHwgIW9wZW5GaWxlc1dzIHx8IG9wZW5GaWxlc1dzLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlzQ29udGFpbmVyKSB7XG4gICAgICBpZiAoIXdvcmtpbmdTZXQuY29udGFpbnNEaXIodGhpcy5ub2RlS2V5KSAmJiBvcGVuRmlsZXNXcy5jb250YWluc0Rpcih0aGlzLm5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghd29ya2luZ1NldC5jb250YWluc0ZpbGUodGhpcy5ub2RlS2V5KSAmJiBvcGVuRmlsZXNXcy5jb250YWluc0ZpbGUodGhpcy5ub2RlS2V5KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlTm9kZTtcbiJdfQ==