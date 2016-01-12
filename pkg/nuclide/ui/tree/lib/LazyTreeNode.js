var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LazyTreeNode = (function () {

  /**
   * @param fetchChildren returns a Promise that resolves to an Immutable.List
   *     of LazyTreeNode objects.
   */

  function LazyTreeNode(item, parent, isContainer, fetchChildren) {
    _classCallCheck(this, LazyTreeNode);

    this.__item = item;
    this.__parent = parent;
    this.__isContainer = isContainer;
    this._fetchChildren = fetchChildren;
    this._children = null;
    this._isCacheValid = false;
    this._pendingFetch = null;
    this.__key = null;
  }

  _createClass(LazyTreeNode, [{
    key: 'isRoot',
    value: function isRoot() {
      return this.__parent === null;
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      return this.__parent;
    }
  }, {
    key: 'getItem',
    value: function getItem() {
      return this.__item;
    }
  }, {
    key: 'getCachedChildren',
    value: function getCachedChildren() {
      return this._children;
    }
  }, {
    key: 'fetchChildren',
    value: function fetchChildren() {
      var _this = this;

      var pendingFetch = this._pendingFetch;
      if (!pendingFetch) {
        pendingFetch = this._fetchChildren(this).then(function (children) {
          // Store the children before returning them from the Promise.
          _this._children = children;
          _this._isCacheValid = true;
          return children;
        });
        this._pendingFetch = pendingFetch;

        // Make sure that whether the fetch succeeds or fails, the _pendingFetch
        // field is cleared.
        var clear = function clear() {
          _this._pendingFetch = null;
        };
        pendingFetch.then(clear, clear);
      }
      return pendingFetch;
    }

    /**
     * Each node should have a key that uniquely identifies it among the
     * LazyTreeNodes that make up the tree.
     */
  }, {
    key: 'getKey',
    value: function getKey() {
      var key = this.__key;
      if (!key) {
        // TODO(mbolin): Escape slashes.
        var prefix = this.__parent ? this.__parent.getKey() : '/';
        var suffix = this.__isContainer ? '/' : '';
        key = prefix + this.getLabel() + suffix;
        this.__key = key;
      }
      return key;
    }

    /**
     * @return the string that the tree UI should display for the node
     */
  }, {
    key: 'getLabel',
    value: function getLabel() {
      throw new Error('subclasses must override this method');
    }
  }, {
    key: 'isContainer',
    value: function isContainer() {
      return this.__isContainer;
    }
  }, {
    key: 'isCacheValid',
    value: function isCacheValid() {
      return this._isCacheValid;
    }
  }, {
    key: 'invalidateCache',
    value: function invalidateCache() {
      this._isCacheValid = false;
    }
  }]);

  return LazyTreeNode;
})();

module.exports = LazyTreeNode;

// Protected

// Private
//# sourceMappingURL=data:application/json;base64,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eVRyZWVOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmNsYXNzIExhenlUcmVlTm9kZSB7XG5cbiAgLy8gUHJvdGVjdGVkXG4gIF9faXNDb250YWluZXI6IGJvb2xlYW47XG4gIF9faXRlbTogYW55O1xuICBfX2tleTogP3N0cmluZztcbiAgX19wYXJlbnQ6ID9MYXp5VHJlZU5vZGU7XG5cbiAgLy8gUHJpdmF0ZVxuICBfY2hpbGRyZW46ID9JbW11dGFibGUuTGlzdDtcbiAgX2ZldGNoQ2hpbGRyZW46IChub2RlOiBMYXp5VHJlZU5vZGUpID0+IFByb21pc2U7XG4gIF9pc0NhY2hlVmFsaWQ6IGJvb2xlYW47XG4gIF9wZW5kaW5nRmV0Y2g6ID9Qcm9taXNlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZmV0Y2hDaGlsZHJlbiByZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEltbXV0YWJsZS5MaXN0XG4gICAqICAgICBvZiBMYXp5VHJlZU5vZGUgb2JqZWN0cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgaXRlbTogYW55LFxuICAgICAgcGFyZW50OiA/TGF6eVRyZWVOb2RlLFxuICAgICAgaXNDb250YWluZXI6IGJvb2xlYW4sXG4gICAgICBmZXRjaENoaWxkcmVuOiAobm9kZTogTGF6eVRyZWVOb2RlKSA9PiBQcm9taXNlKSB7XG4gICAgdGhpcy5fX2l0ZW0gPSBpdGVtO1xuICAgIHRoaXMuX19wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5fX2lzQ29udGFpbmVyID0gaXNDb250YWluZXI7XG4gICAgdGhpcy5fZmV0Y2hDaGlsZHJlbiA9IGZldGNoQ2hpbGRyZW47XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBudWxsO1xuICAgIHRoaXMuX2lzQ2FjaGVWYWxpZCA9IGZhbHNlO1xuICAgIHRoaXMuX3BlbmRpbmdGZXRjaCA9IG51bGw7XG4gICAgdGhpcy5fX2tleSA9IG51bGw7XG4gIH1cblxuICBpc1Jvb3QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX19wYXJlbnQgPT09IG51bGw7XG4gIH1cblxuICBnZXRQYXJlbnQoKTogP0xhenlUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX19wYXJlbnQ7XG4gIH1cblxuICBnZXRJdGVtKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX19pdGVtO1xuICB9XG5cbiAgZ2V0Q2FjaGVkQ2hpbGRyZW4oKTogP0ltbXV0YWJsZS5MaXN0PExhenlUcmVlTm9kZT4ge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbjtcbiAgfVxuXG4gIGZldGNoQ2hpbGRyZW4oKTogUHJvbWlzZSB7XG4gICAgbGV0IHBlbmRpbmdGZXRjaCA9IHRoaXMuX3BlbmRpbmdGZXRjaDtcbiAgICBpZiAoIXBlbmRpbmdGZXRjaCkge1xuICAgICAgcGVuZGluZ0ZldGNoID0gdGhpcy5fZmV0Y2hDaGlsZHJlbih0aGlzKS50aGVuKChjaGlsZHJlbikgPT4ge1xuICAgICAgICAvLyBTdG9yZSB0aGUgY2hpbGRyZW4gYmVmb3JlIHJldHVybmluZyB0aGVtIGZyb20gdGhlIFByb21pc2UuXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHRoaXMuX2lzQ2FjaGVWYWxpZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGVuZGluZ0ZldGNoID0gcGVuZGluZ0ZldGNoO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCB3aGV0aGVyIHRoZSBmZXRjaCBzdWNjZWVkcyBvciBmYWlscywgdGhlIF9wZW5kaW5nRmV0Y2hcbiAgICAgIC8vIGZpZWxkIGlzIGNsZWFyZWQuXG4gICAgICBjb25zdCBjbGVhciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0ZldGNoID0gbnVsbDtcbiAgICAgIH07XG4gICAgICBwZW5kaW5nRmV0Y2gudGhlbihjbGVhciwgY2xlYXIpO1xuICAgIH1cbiAgICByZXR1cm4gcGVuZGluZ0ZldGNoO1xuICB9XG5cbiAgLyoqXG4gICAqIEVhY2ggbm9kZSBzaG91bGQgaGF2ZSBhIGtleSB0aGF0IHVuaXF1ZWx5IGlkZW50aWZpZXMgaXQgYW1vbmcgdGhlXG4gICAqIExhenlUcmVlTm9kZXMgdGhhdCBtYWtlIHVwIHRoZSB0cmVlLlxuICAgKi9cbiAgZ2V0S2V5KCk6IHN0cmluZyB7XG4gICAgbGV0IGtleSA9IHRoaXMuX19rZXk7XG4gICAgaWYgKCFrZXkpIHtcbiAgICAgIC8vIFRPRE8obWJvbGluKTogRXNjYXBlIHNsYXNoZXMuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLl9fcGFyZW50ID8gdGhpcy5fX3BhcmVudC5nZXRLZXkoKSA6ICcvJztcbiAgICAgIGNvbnN0IHN1ZmZpeCA9IHRoaXMuX19pc0NvbnRhaW5lciA/ICcvJyA6ICcnO1xuICAgICAga2V5ID0gcHJlZml4ICsgdGhpcy5nZXRMYWJlbCgpICsgc3VmZml4O1xuICAgICAgdGhpcy5fX2tleSA9IGtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHRoZSBzdHJpbmcgdGhhdCB0aGUgdHJlZSBVSSBzaG91bGQgZGlzcGxheSBmb3IgdGhlIG5vZGVcbiAgICovXG4gIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdWJjbGFzc2VzIG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QnKTtcbiAgfVxuXG4gIGlzQ29udGFpbmVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9faXNDb250YWluZXI7XG4gIH1cblxuICBpc0NhY2hlVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ2FjaGVWYWxpZDtcbiAgfVxuXG4gIGludmFsaWRhdGVDYWNoZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0NhY2hlVmFsaWQgPSBmYWxzZTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eVRyZWVOb2RlO1xuIl19