Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

exports.LazyTreeNode = LazyTreeNode;

// Protected

// Private
//# sourceMappingURL=data:application/json;base64,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Iid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuXG5leHBvcnQgY2xhc3MgTGF6eVRyZWVOb2RlIHtcblxuICAvLyBQcm90ZWN0ZWRcbiAgX19pc0NvbnRhaW5lcjogYm9vbGVhbjtcbiAgX19pdGVtOiBhbnk7XG4gIF9fa2V5OiA/c3RyaW5nO1xuICBfX3BhcmVudDogP0xhenlUcmVlTm9kZTtcblxuICAvLyBQcml2YXRlXG4gIF9jaGlsZHJlbjogP0ltbXV0YWJsZS5MaXN0O1xuICBfZmV0Y2hDaGlsZHJlbjogKG5vZGU6IExhenlUcmVlTm9kZSkgPT4gUHJvbWlzZTtcbiAgX2lzQ2FjaGVWYWxpZDogYm9vbGVhbjtcbiAgX3BlbmRpbmdGZXRjaDogP1Byb21pc2U7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBmZXRjaENoaWxkcmVuIHJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gSW1tdXRhYmxlLkxpc3RcbiAgICogICAgIG9mIExhenlUcmVlTm9kZSBvYmplY3RzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgICBpdGVtOiBhbnksXG4gICAgICBwYXJlbnQ6ID9MYXp5VHJlZU5vZGUsXG4gICAgICBpc0NvbnRhaW5lcjogYm9vbGVhbixcbiAgICAgIGZldGNoQ2hpbGRyZW46IChub2RlOiBMYXp5VHJlZU5vZGUpID0+IFByb21pc2UpIHtcbiAgICB0aGlzLl9faXRlbSA9IGl0ZW07XG4gICAgdGhpcy5fX3BhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLl9faXNDb250YWluZXIgPSBpc0NvbnRhaW5lcjtcbiAgICB0aGlzLl9mZXRjaENoaWxkcmVuID0gZmV0Y2hDaGlsZHJlbjtcbiAgICB0aGlzLl9jaGlsZHJlbiA9IG51bGw7XG4gICAgdGhpcy5faXNDYWNoZVZhbGlkID0gZmFsc2U7XG4gICAgdGhpcy5fcGVuZGluZ0ZldGNoID0gbnVsbDtcbiAgICB0aGlzLl9fa2V5ID0gbnVsbDtcbiAgfVxuXG4gIGlzUm9vdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fX3BhcmVudCA9PT0gbnVsbDtcbiAgfVxuXG4gIGdldFBhcmVudCgpOiA/TGF6eVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fX3BhcmVudDtcbiAgfVxuXG4gIGdldEl0ZW0oKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fX2l0ZW07XG4gIH1cblxuICBnZXRDYWNoZWRDaGlsZHJlbigpOiA/SW1tdXRhYmxlLkxpc3Q8TGF6eVRyZWVOb2RlPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkcmVuO1xuICB9XG5cbiAgZmV0Y2hDaGlsZHJlbigpOiBQcm9taXNlIHtcbiAgICBsZXQgcGVuZGluZ0ZldGNoID0gdGhpcy5fcGVuZGluZ0ZldGNoO1xuICAgIGlmICghcGVuZGluZ0ZldGNoKSB7XG4gICAgICBwZW5kaW5nRmV0Y2ggPSB0aGlzLl9mZXRjaENoaWxkcmVuKHRoaXMpLnRoZW4oY2hpbGRyZW4gPT4ge1xuICAgICAgICAvLyBTdG9yZSB0aGUgY2hpbGRyZW4gYmVmb3JlIHJldHVybmluZyB0aGVtIGZyb20gdGhlIFByb21pc2UuXG4gICAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHRoaXMuX2lzQ2FjaGVWYWxpZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGVuZGluZ0ZldGNoID0gcGVuZGluZ0ZldGNoO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCB3aGV0aGVyIHRoZSBmZXRjaCBzdWNjZWVkcyBvciBmYWlscywgdGhlIF9wZW5kaW5nRmV0Y2hcbiAgICAgIC8vIGZpZWxkIGlzIGNsZWFyZWQuXG4gICAgICBjb25zdCBjbGVhciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0ZldGNoID0gbnVsbDtcbiAgICAgIH07XG4gICAgICBwZW5kaW5nRmV0Y2gudGhlbihjbGVhciwgY2xlYXIpO1xuICAgIH1cbiAgICByZXR1cm4gcGVuZGluZ0ZldGNoO1xuICB9XG5cbiAgLyoqXG4gICAqIEVhY2ggbm9kZSBzaG91bGQgaGF2ZSBhIGtleSB0aGF0IHVuaXF1ZWx5IGlkZW50aWZpZXMgaXQgYW1vbmcgdGhlXG4gICAqIExhenlUcmVlTm9kZXMgdGhhdCBtYWtlIHVwIHRoZSB0cmVlLlxuICAgKi9cbiAgZ2V0S2V5KCk6IHN0cmluZyB7XG4gICAgbGV0IGtleSA9IHRoaXMuX19rZXk7XG4gICAgaWYgKCFrZXkpIHtcbiAgICAgIC8vIFRPRE8obWJvbGluKTogRXNjYXBlIHNsYXNoZXMuXG4gICAgICBjb25zdCBwcmVmaXggPSB0aGlzLl9fcGFyZW50ID8gdGhpcy5fX3BhcmVudC5nZXRLZXkoKSA6ICcvJztcbiAgICAgIGNvbnN0IHN1ZmZpeCA9IHRoaXMuX19pc0NvbnRhaW5lciA/ICcvJyA6ICcnO1xuICAgICAga2V5ID0gcHJlZml4ICsgdGhpcy5nZXRMYWJlbCgpICsgc3VmZml4O1xuICAgICAgdGhpcy5fX2tleSA9IGtleTtcbiAgICB9XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHRoZSBzdHJpbmcgdGhhdCB0aGUgdHJlZSBVSSBzaG91bGQgZGlzcGxheSBmb3IgdGhlIG5vZGVcbiAgICovXG4gIGdldExhYmVsKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdWJjbGFzc2VzIG11c3Qgb3ZlcnJpZGUgdGhpcyBtZXRob2QnKTtcbiAgfVxuXG4gIGlzQ29udGFpbmVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9faXNDb250YWluZXI7XG4gIH1cblxuICBpc0NhY2hlVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ2FjaGVWYWxpZDtcbiAgfVxuXG4gIGludmFsaWRhdGVDYWNoZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0NhY2hlVmFsaWQgPSBmYWxzZTtcbiAgfVxuXG59XG4iXX0=