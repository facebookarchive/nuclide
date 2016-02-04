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
  }]);

  return FileTreeNode;
})();

module.exports = FileTreeNode;
//# sourceMappingURL=data:application/json;base64,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QUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJGaWxlVHJlZU5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IFJlbW90ZVVyaSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuY2xhc3MgRmlsZVRyZWVOb2RlIHtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICByb290S2V5OiBzdHJpbmc7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgbm9kZVBhdGg6IHN0cmluZztcbiAgbm9kZU5hbWU6IHN0cmluZztcbiAgaXNSb290OiBib29sZWFuO1xuICBpc0NvbnRhaW5lcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogRmlsZVRyZWVTdG9yZSwgcm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMucm9vdEtleSA9IHJvb3RLZXk7XG4gICAgdGhpcy5ub2RlS2V5ID0gbm9kZUtleTtcbiAgICB0aGlzLm5vZGVQYXRoID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KTtcbiAgICB0aGlzLm5vZGVOYW1lID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvTmFtZShub2RlS2V5KTtcbiAgICB0aGlzLmlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgdGhpcy5pc0NvbnRhaW5lciA9IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KTtcbiAgfVxuXG4gIGlzTG9hZGluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuaXNMb2FkaW5nKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGlzRXhwYW5kZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgaXNTZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuaXNTZWxlY3RlZCh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICB1c2VQcmV2aWV3VGFicygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUudXNlUHJldmlld1RhYnMoKTtcbiAgfVxuXG4gIGdldFZjc1N0YXR1c0NvZGUoKTogP251bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFZjc1N0YXR1c0NvZGUodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgZ2V0UGFyZW50Tm9kZSgpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXROb2RlKHRoaXMucm9vdEtleSwgRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleSh0aGlzLm5vZGVLZXkpKTtcbiAgfVxuXG4gIGdldENoaWxkS2V5cygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0Q2hpbGRLZXlzKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGdldENoaWxkTm9kZXMoKTogQXJyYXk8RmlsZVRyZWVOb2RlPiB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2hpbGRLZXlzKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgICByZXR1cm4gY2hpbGRLZXlzLm1hcChjaGlsZEtleSA9PiB0aGlzLl9zdG9yZS5nZXROb2RlKHRoaXMucm9vdEtleSwgY2hpbGRLZXkpKTtcbiAgfVxuXG4gIGdldFJlbGF0aXZlUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5vZGVQYXRoLnNsaWNlKHRoaXMucm9vdEtleS5sZW5ndGgpO1xuICB9XG5cbiAgLy8gRm9yIHJlbW90ZSBmaWxlcyB3ZSB3YW50IHRoZSBsb2NhbCBwYXRoIGluc3RlYWQgb2YgZnVsbCBwYXRoLlxuICAvLyBpLmUsIFwiL2hvbWUvZGlyL2ZpbGVcIiB2cyBcIm51Y2xpZGU6Ly9ob3N0bmFtZToxMjMvaG9tZS9kaXIvZmlsZVwiXG4gIGdldExvY2FsUGF0aCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLm5vZGVQYXRoO1xuICAgIGlmIChSZW1vdGVVcmkuaXNSZW1vdGUocGF0aCkpIHtcbiAgICAgIHJldHVybiBSZW1vdGVVcmkucGFyc2UocGF0aCkucGF0aG5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlTm9kZTtcbiJdfQ==