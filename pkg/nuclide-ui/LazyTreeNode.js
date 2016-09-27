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

    /**
     * This can return a richer element for a node and will be used instead of the label if present.
     */
  }, {
    key: 'getLabelElement',
    value: function getLabelElement() {
      return null;
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