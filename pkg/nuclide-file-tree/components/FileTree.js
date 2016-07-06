Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _libFileTreeStore2;

function _libFileTreeStore() {
  return _libFileTreeStore2 = require('../lib/FileTreeStore');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _FileTreeEntryComponent2;

function _FileTreeEntryComponent() {
  return _FileTreeEntryComponent2 = require('./FileTreeEntryComponent');
}

var _EmptyComponent2;

function _EmptyComponent() {
  return _EmptyComponent2 = require('./EmptyComponent');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodeOnce2;

function _commonsNodeOnce() {
  return _commonsNodeOnce2 = _interopRequireDefault(require('../../commons-node/once'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var BUFFER_ELEMENTS = 15;

var FileTree = (function (_React$Component) {
  _inherits(FileTree, _React$Component);

  _createClass(FileTree, null, [{
    key: 'trackFirstRender',
    value: (0, (_commonsNodeOnce2 || _commonsNodeOnce()).default)(function () {
      var rootKeysLength = (_libFileTreeStore2 || _libFileTreeStore()).FileTreeStore.getInstance().roots.size;
      // Wait using `setTimeout` and not `process.nextTick` or `setImmediate`
      // because those queue tasks in the current and next turn of the event loop
      // respectively. Since `setTimeout` gets preempted by them, it works great
      // for a more realistic "first render". Note: The scheduler for promises
      // (`Promise.resolve().then`) runs on the same queue as `process.nextTick`
      // but with a higher priority.
      setTimeout(function () {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('filetree-first-render', {
          'time-to-render': String(process.uptime() * 1000),
          'root-keys': String(rootKeysLength)
        });
      });
    }),
    enumerable: true
  }]);

  function FileTree(props) {
    _classCallCheck(this, FileTree);

    _get(Object.getPrototypeOf(FileTree.prototype), 'constructor', this).call(this, props);
    this._store = (_libFileTreeStore2 || _libFileTreeStore()).FileTreeStore.getInstance();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this.state = {
      elementHeight: 22 };

    // The minimal observed height makes a good default
    this._initialHeightMeasured = false;
    this._afRequestId = null;
    this._measureHeights = this._measureHeights.bind(this);
  }

  _createClass(FileTree, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      FileTree.trackFirstRender(this);
      this._scrollToTrackedNodeIfNeeded();
      this._measureHeights();
      window.addEventListener('resize', this._measureHeights);

      this._disposables.add(atom.themes.onDidChangeActiveThemes(function () {
        _this._initialHeightMeasured = false;
        _this._afRequestId = window.requestAnimationFrame(function () {
          _this._afRequestId = null;
          _this._measureHeights();
        });
      }), new (_atom2 || _atom()).Disposable(function () {
        window.removeEventListener('resize', _this._measureHeights);
      }));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._afRequestId != null) {
        window.cancelAnimationFrame(this._afRequestId);
      }
      this._disposables.dispose();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (!this._initialHeightMeasured) {
        this._measureHeights();
      }

      this._scrollToTrackedNodeIfNeeded();
    }
  }, {
    key: '_scrollToTrackedNodeIfNeeded',
    value: function _scrollToTrackedNodeIfNeeded() {
      var trackedIndex = findIndexOfTheTrackedNode(this._store.roots);
      if (trackedIndex < 0) {
        return;
      }

      this.props.scrollToPosition(trackedIndex * this.state.elementHeight, this.state.elementHeight);
    }
  }, {
    key: '_measureHeights',
    value: function _measureHeights() {
      var measuredComponent = this.refs.measured;
      if (measuredComponent == null) {
        return;
      }

      this._initialHeightMeasured = true;

      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(measuredComponent);
      var elementHeight = node.clientHeight;
      if (elementHeight !== this.state.elementHeight && elementHeight > 0) {
        this.setState({ elementHeight: elementHeight });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var classes = {
        'nuclide-file-tree': true,
        'focusable-panel': true,
        'tree-view': true,
        'nuclide-file-tree-editing-working-set': this._store.isEditingWorkingSet()
      };

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: (0, (_classnames2 || _classnames()).default)(classes), tabIndex: 0 },
        this._renderChildren()
      );
    }
  }, {
    key: '_renderChildren',
    value: function _renderChildren() {
      var roots = this._store.roots;
      var childrenCount = countShownNodes(roots);

      if (childrenCount === 0) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement((_EmptyComponent2 || _EmptyComponent()).EmptyComponent, null);
      }

      var scrollTop = this.props.containerScrollTop;
      var containerHeight = this.props.containerHeight;
      var elementHeight = this.state.elementHeight;
      var elementsInView = Math.ceil(containerHeight / elementHeight);
      var firstToRender = Math.floor(scrollTop / elementHeight) - BUFFER_ELEMENTS;
      // The container might have been scrolled too far for the current elements
      if (firstToRender > childrenCount - elementsInView) {
        firstToRender = childrenCount - elementsInView;
      }
      firstToRender = Math.max(firstToRender, 0);
      var amountToRender = elementsInView + 2 * BUFFER_ELEMENTS;

      var visibleChildren = [];
      var chosenMeasured = false;
      var node = findFirstNodeToRender(roots, firstToRender);

      // The chosen key is intentionally non-unique. This is to force React to reuse nodes
      // when scrolling is performed, rather then delete one and create another.
      // The selected key is a node's index modulo the amount of the rendered nodes. This way,
      // when a node is scrolled out of the view, another is added with just the same index.
      // Were React allowed to delete and creates nodes at its will it would have caused an
      // abrupt stop in the scrolling process.
      // See: https://github.com/facebook/react/issues/2295
      var key = firstToRender % amountToRender;
      while (node != null && visibleChildren.length < amountToRender) {
        if (!node.isRoot && !chosenMeasured) {
          visibleChildren.push((_reactForAtom2 || _reactForAtom()).React.createElement((_FileTreeEntryComponent2 || _FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node, ref: 'measured' }));
          chosenMeasured = true;
        } else {
          visibleChildren.push((_reactForAtom2 || _reactForAtom()).React.createElement((_FileTreeEntryComponent2 || _FileTreeEntryComponent()).FileTreeEntryComponent, { key: key, node: node }));
        }
        node = node.findNext();
        key = (key + 1) % amountToRender;
      }

      var topPlaceholderSize = firstToRender * elementHeight;
      var bottomPlaceholderCount = childrenCount - (firstToRender + visibleChildren.length);
      var bottomPlaceholderSize = bottomPlaceholderCount * elementHeight;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement('div', { style: { height: topPlaceholderSize + 'px' } }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ul',
          { className: 'list-tree has-collapsable-children' },
          visibleChildren
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('div', { style: { height: bottomPlaceholderSize + 'px' } })
      );
    }
  }]);

  return FileTree;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.FileTree = FileTree;

function findFirstNodeToRender(_x4, _x5) {
  var _again2 = true;

  _function2: while (_again2) {
    var roots = _x4,
        firstToRender = _x5;
    _again2 = false;

    var skipped = 0;

    var node = roots.find(function (r) {
      if (skipped + r.shownChildrenBelow > firstToRender) {
        return true;
      }

      skipped += r.shownChildrenBelow;
      return false;
    });

    if (node == null) {
      return null;
    }

    if (skipped === firstToRender) {
      return node;
    }

    // The result is under this root, but not the root itself - skipping it and searching recursively
    _x4 = node.children;
    _x5 = firstToRender - skipped - 1;
    _again2 = true;
    skipped = node = undefined;
    continue _function2;
  }
}

function findIndexOfTheTrackedNode(nodes) {
  var skipped = 0;
  var trackedNodeRoot = nodes.find(function (node) {
    if (node.containsTrackedNode) {
      return true;
    }

    skipped += node.shownChildrenBelow;
    return false;
  });

  if (trackedNodeRoot == null) {
    return -1;
  }

  if (trackedNodeRoot.isTracked) {
    return skipped;
  }

  return skipped + 1 + findIndexOfTheTrackedNode(trackedNodeRoot.children);
}

function countShownNodes(roots) {
  return roots.reduce(function (sum, root) {
    return sum + root.shownChildrenBelow;
  }, 0);
}