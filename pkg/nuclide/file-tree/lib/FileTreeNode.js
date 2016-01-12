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
//# sourceMappingURL=data:application/json;base64,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OlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBSZW1vdGVVcmkgZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNsYXNzIEZpbGVUcmVlTm9kZSB7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgcm9vdEtleTogc3RyaW5nO1xuICBub2RlS2V5OiBzdHJpbmc7XG4gIG5vZGVQYXRoOiBzdHJpbmc7XG4gIG5vZGVOYW1lOiBzdHJpbmc7XG4gIGlzUm9vdDogYm9vbGVhbjtcbiAgaXNDb250YWluZXI6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioc3RvcmU6IEZpbGVUcmVlU3RvcmUsIHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yZTtcbiAgICB0aGlzLnJvb3RLZXkgPSByb290S2V5O1xuICAgIHRoaXMubm9kZUtleSA9IG5vZGVLZXk7XG4gICAgdGhpcy5ub2RlUGF0aCA9IEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZUtleSk7XG4gICAgdGhpcy5ub2RlTmFtZSA9IEZpbGVUcmVlSGVscGVycy5rZXlUb05hbWUobm9kZUtleSk7XG4gICAgdGhpcy5pc1Jvb3QgPSByb290S2V5ID09PSBub2RlS2V5O1xuICAgIHRoaXMuaXNDb250YWluZXIgPSBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSk7XG4gIH1cblxuICBpc0xvYWRpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzTG9hZGluZyh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBpc0V4cGFuZGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHRoaXMucm9vdEtleSwgdGhpcy5ub2RlS2V5KTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmlzU2VsZWN0ZWQodGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgZ2V0VmNzU3RhdHVzQ29kZSgpOiA/bnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0VmNzU3RhdHVzQ29kZSh0aGlzLnJvb3RLZXksIHRoaXMubm9kZUtleSk7XG4gIH1cblxuICBnZXRQYXJlbnROb2RlKCk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldE5vZGUodGhpcy5yb290S2V5LCBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KHRoaXMubm9kZUtleSkpO1xuICB9XG5cbiAgZ2V0Q2hpbGRLZXlzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRDaGlsZEtleXModGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICB9XG5cbiAgZ2V0Q2hpbGROb2RlcygpOiBBcnJheTxGaWxlVHJlZU5vZGU+IHtcbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9zdG9yZS5nZXRDaGlsZEtleXModGhpcy5yb290S2V5LCB0aGlzLm5vZGVLZXkpO1xuICAgIHJldHVybiBjaGlsZEtleXMubWFwKGNoaWxkS2V5ID0+IHRoaXMuX3N0b3JlLmdldE5vZGUodGhpcy5yb290S2V5LCBjaGlsZEtleSkpO1xuICB9XG5cbiAgZ2V0UmVsYXRpdmVQYXRoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubm9kZVBhdGguc2xpY2UodGhpcy5yb290S2V5Lmxlbmd0aCk7XG4gIH1cblxuICAvLyBGb3IgcmVtb3RlIGZpbGVzIHdlIHdhbnQgdGhlIGxvY2FsIHBhdGggaW5zdGVhZCBvZiBmdWxsIHBhdGguXG4gIC8vIGkuZSwgXCIvaG9tZS9kaXIvZmlsZVwiIHZzIFwibnVjbGlkZTovL2hvc3RuYW1lOjEyMy9ob21lL2Rpci9maWxlXCJcbiAgZ2V0TG9jYWxQYXRoKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMubm9kZVBhdGg7XG4gICAgaWYgKFJlbW90ZVVyaS5pc1JlbW90ZShwYXRoKSkge1xuICAgICAgcmV0dXJuIFJlbW90ZVVyaS5wYXJzZShwYXRoKS5wYXRobmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVOb2RlO1xuIl19