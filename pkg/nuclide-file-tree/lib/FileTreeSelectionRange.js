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

var _FileTreeNode2;

function _FileTreeNode() {
  return _FileTreeNode2 = require('./FileTreeNode');
}

var RangeKey = (function () {
  function RangeKey(rootKey, nodeKey) {
    _classCallCheck(this, RangeKey);

    this._rootKey = rootKey;
    this._nodeKey = nodeKey;
  }

  _createClass(RangeKey, [{
    key: 'rootKey',
    value: function rootKey() {
      return this._rootKey;
    }
  }, {
    key: 'nodeKey',
    value: function nodeKey() {
      return this._nodeKey;
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return this._rootKey === other._rootKey && this._nodeKey === other._nodeKey;
    }
  }], [{
    key: 'of',
    value: function of(node) {
      return new RangeKey(node.rootUri, node.uri);
    }
  }]);

  return RangeKey;
})();

exports.RangeKey = RangeKey;

var SelectionRange = (function () {
  function SelectionRange(anchor, range) {
    _classCallCheck(this, SelectionRange);

    this._anchor = anchor;
    this._range = range;
  }

  /**
   * Returns the current node if it is shown.
   * Otherwise, returns a nearby node that is shown.
   */

  _createClass(SelectionRange, [{
    key: 'anchor',
    value: function anchor() {
      return this._anchor;
    }
  }, {
    key: 'range',
    value: function range() {
      return this._range;
    }
  }, {
    key: 'withNewRange',
    value: function withNewRange(range) {
      return new SelectionRange(this._anchor, range);
    }
  }, {
    key: 'withNewAnchor',
    value: function withNewAnchor(anchor) {
      return new SelectionRange(anchor, this._range);
    }
  }, {
    key: 'equals',
    value: function equals(other) {
      return this._anchor.equals(other._anchor) && this._range.equals(other._range);
    }
  }], [{
    key: 'ofSingleItem',
    value: function ofSingleItem(anchor) {
      return new SelectionRange(anchor, anchor);
    }
  }]);

  return SelectionRange;
})();

exports.SelectionRange = SelectionRange;
function findShownNode(node) {
  if (node.shouldBeShown) {
    return node;
  }

  var shown = node;
  while (shown != null) {
    var next = shown.findNextShownSibling();
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }

  shown = node;
  while (shown != null) {
    var next = shown.findPrevShownSibling();
    if (next != null) {
      return next;
    }
    shown = shown.parent;
  }
  return null;
}

var RangeUtil = (function () {
  function RangeUtil() {
    _classCallCheck(this, RangeUtil);
  }

  _createClass(RangeUtil, null, [{
    key: 'findSelectedNode',

    /**
     * Returns the current node if it is shown and selected
     * Otherwise, returns a nearby selected node.
     */
    value: function findSelectedNode(node) {
      var shown = findShownNode(node);
      if (shown == null) {
        return shown;
      }
      if (shown.isSelected) {
        return shown;
      }
      var selected = shown;
      while (selected != null && !selected.isSelected) {
        selected = selected.findNext();
      }
      if (selected != null) {
        return selected;
      }
      selected = shown;
      while (selected != null && !selected.isSelected) {
        selected = selected.findPrevious();
      }
      return selected;
    }
  }]);

  return RangeUtil;
})();

exports.RangeUtil = RangeUtil;