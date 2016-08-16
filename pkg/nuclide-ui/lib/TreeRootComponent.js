Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _LazyTreeNode2;

function _LazyTreeNode() {
  return _LazyTreeNode2 = require('./LazyTreeNode');
}

var _TreeNodeComponent2;

function _TreeNodeComponent() {
  return _TreeNodeComponent2 = require('./TreeNodeComponent');
}

var _treeNodeTraversals2;

function _treeNodeTraversals() {
  return _treeNodeTraversals2 = require('./tree-node-traversals');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * Toggles the existence of a value in a set. If the value exists, deletes it.
 * If the value does not exist, adds it.
 *
 * @param set The set whose value to toggle.
 * @param value The value to toggle in the set.
 * @param [forceHas] If defined, forces the existence of the value in the set
 *     regardless of its current existence. If truthy, adds `value`, if falsy
 *     deletes `value`.
 * @returns `true` if the value was added to the set, otherwise `false`. If
 *     `forceHas` is defined, the return value will be equal to `forceHas`.
 */
function toggleSetHas(set, value, forceHas) {
  var added = undefined;

  if (forceHas || forceHas === undefined && !set.has(value)) {
    set.add(value);
    added = true;
  } else {
    set.delete(value);
    added = false;
  }

  return added;
}

var FIRST_SELECTED_DESCENDANT_REF = 'firstSelectedDescendant';

/**
 * Generic tree component that operates on LazyTreeNodes.
 */

var TreeRootComponent = (function (_React$Component) {
  _inherits(TreeRootComponent, _React$Component);

  _createClass(TreeRootComponent, null, [{
    key: 'defaultProps',
    value: {
      elementToRenderWhenEmpty: null,
      onConfirmSelection: function onConfirmSelection(node) {},
      rowClassNameForNode: function rowClassNameForNode(node) {
        return '';
      }
    },
    enumerable: true
  }]);

  function TreeRootComponent(props) {
    _classCallCheck(this, TreeRootComponent);

    _get(Object.getPrototypeOf(TreeRootComponent.prototype), 'constructor', this).call(this, props);
    this._allKeys = null;
    this._emitter = null;
    this._isMounted = false;
    this._keyToNode = null;
    this._rejectDidUpdateListenerPromise = null;
    this._subscriptions = null;

    var rootKeys = this.props.initialRoots.map(function (root) {
      return root.getKey();
    });
    this.state = {
      roots: this.props.initialRoots,
      // This is maintained as a set of strings for two reasons:
      // (1) It is straightforward to serialize.
      // (2) If the LazyFileTreeNode for a path is re-created, this will still work.
      expandedKeys: new Set(this.props.initialExpandedNodeKeys || rootKeys),
      selectedKeys: this.props.initialSelectedNodeKeys ? new Set(this.props.initialSelectedNodeKeys) : new Set(rootKeys.length === 0 ? [] : [rootKeys[0]])
    };

    this._onClickNodeArrow = this._onClickNodeArrow.bind(this);
    this._onClickNode = this._onClickNode.bind(this);
    this._onDoubleClickNode = this._onDoubleClickNode.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  _createClass(TreeRootComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._isMounted = true;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      // If the Set of selected items is new, like when navigating the tree with
      // the arrow keys, scroll the first item into view. This addresses the
      // following scenario:
      // (1) Select a node in the tree
      // (2) Scroll the selected node out of the viewport
      // (3) Press the up or down arrow key to change the selected node
      // (4) The new node should scroll into view
      if (!prevState || this.state.selectedKeys !== prevState.selectedKeys) {
        var firstSelectedDescendant = this.refs[FIRST_SELECTED_DESCENDANT_REF];
        if (firstSelectedDescendant !== undefined) {
          (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(firstSelectedDescendant).scrollIntoViewIfNeeded(false);
        }
      }

      (0, (_assert2 || _assert()).default)(this._emitter);
      this._emitter.emit('did-update');
    }
  }, {
    key: '_deselectDescendants',
    value: function _deselectDescendants(root) {
      var selectedKeys = this.state.selectedKeys;

      (0, (_treeNodeTraversals2 || _treeNodeTraversals()).forEachCachedNode)(root, function (node) {
        // `forEachCachedNode` iterates over the root, but it should remain
        // selected. Skip it.
        if (node === root) {
          return;
        }

        selectedKeys.delete(node.getKey());
      });

      this.setState({ selectedKeys: selectedKeys });
    }
  }, {
    key: '_isNodeExpanded',
    value: function _isNodeExpanded(node) {
      return this.state.expandedKeys.has(node.getKey());
    }
  }, {
    key: '_isNodeSelected',
    value: function _isNodeSelected(node) {
      return this.state.selectedKeys.has(node.getKey());
    }
  }, {
    key: '_toggleNodeExpanded',
    value: function _toggleNodeExpanded(node, forceExpanded) {
      var expandedKeys = this.state.expandedKeys;
      var keyAdded = toggleSetHas(expandedKeys, node.getKey(), forceExpanded);

      // If the node was collapsed, deselect its descendants so only nodes visible
      // in the tree remain selected.
      if (!keyAdded) {
        this._deselectDescendants(node);
      }

      this.setState({ expandedKeys: expandedKeys });
    }
  }, {
    key: '_toggleNodeSelected',
    value: function _toggleNodeSelected(node, forceSelected) {
      var selectedKeys = this.state.selectedKeys;
      toggleSetHas(selectedKeys, node.getKey(), forceSelected);
      this.setState({ selectedKeys: selectedKeys });
    }
  }, {
    key: '_onClickNode',
    value: function _onClickNode(event, node) {
      if (event.metaKey) {
        this._toggleNodeSelected(node);
        return;
      }

      this.setState({
        selectedKeys: new Set([node.getKey()])
      });

      if (!this._isNodeSelected(node) && node.isContainer()) {
        // User clicked on a new directory or the user isn't using the "Preview Tabs" feature of the
        // `tabs` package, so don't toggle the node's state any further yet.
        return;
      }

      this._confirmNode(node);
    }
  }, {
    key: '_onClickNodeArrow',
    value: function _onClickNodeArrow(event, node) {
      this._toggleNodeExpanded(node);
    }
  }, {
    key: '_onDoubleClickNode',
    value: function _onDoubleClickNode(event, node) {
      // Double clicking a non-directory will keep the created tab open.
      if (!node.isContainer()) {
        this.props.onKeepSelection();
      }
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event, node) {
      // Select the node on right-click.
      if (event.button === 2 || event.button === 0 && event.ctrlKey === true) {
        if (!this._isNodeSelected(node)) {
          this.setState({ selectedKeys: new Set([node.getKey()]) });
        }
      }
    }
  }, {
    key: 'addContextMenuItemGroup',
    value: function addContextMenuItemGroup(menuItemDefinitions) {
      var _this = this;

      var items = menuItemDefinitions.slice();
      items = items.map(function (definition) {
        definition.shouldDisplay = function () {
          if (_this.state.roots.length === 0 && !definition.shouldDisplayIfTreeIsEmpty) {
            return false;
          }
          var shouldDisplayForSelectedNodes = definition.shouldDisplayForSelectedNodes;
          if (shouldDisplayForSelectedNodes) {
            return shouldDisplayForSelectedNodes.call(definition, _this.getSelectedNodes());
          }
          return true;
        };
        return definition;
      });

      // Atom is smart about only displaying a separator when there are items to
      // separate, so there will never be a dangling separator at the end.
      items.push({ type: 'separator' });

      // TODO: Use a computed property when supported by Flow.
      var contextMenuObj = {};
      contextMenuObj[this.props.eventHandlerSelector] = items;
      atom.contextMenu.add(contextMenuObj);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      if (this.state.roots.length === 0) {
        return this.props.elementToRenderWhenEmpty;
      }

      var children = [];
      var expandedKeys = this.state.expandedKeys;
      var foundFirstSelectedDescendant = false;

      var promises = [];
      var allKeys = [];
      var keyToNode = {};

      this.state.roots.forEach(function (root) {
        var stack = [{ node: root, depth: 0 }];

        while (stack.length !== 0) {
          // Pop off the top of the stack and add it to the list of nodes to display.
          var item = stack.pop();
          var _node = item.node;

          // Keep a reference the first selected descendant with
          // `this.refs[FIRST_SELECTED_DESCENDANT_REF]`.
          var isNodeSelected = _this2._isNodeSelected(_node);
          var ref = null;
          if (!foundFirstSelectedDescendant && isNodeSelected) {
            foundFirstSelectedDescendant = true;
            ref = FIRST_SELECTED_DESCENDANT_REF;
          }

          var child = (_reactForAtom2 || _reactForAtom()).React.createElement((_TreeNodeComponent2 || _TreeNodeComponent()).TreeNodeComponent, _extends({}, item, {
            isContainer: _node.isContainer(),
            isExpanded: _this2._isNodeExpanded(_node),
            isLoading: !_node.isCacheValid(),
            isSelected: isNodeSelected,
            label: _node.getLabel(),
            labelElement: _node.getLabelElement(),
            labelClassName: _this2.props.labelClassNameForNode(_node),
            rowClassName: _this2.props.rowClassNameForNode(_node),
            onClickArrow: _this2._onClickNodeArrow,
            onClick: _this2._onClickNode,
            onDoubleClick: _this2._onDoubleClickNode,
            onMouseDown: _this2._onMouseDown,
            path: _node.getKey(),
            key: _node.getKey(),
            ref: ref
          }));
          children.push(child);
          allKeys.push(_node.getKey());
          keyToNode[_node.getKey()] = _node;

          // Check whether the node has any children that should be displayed.
          if (!_node.isContainer() || !expandedKeys.has(_node.getKey())) {
            continue;
          }

          var cachedChildren = _node.getCachedChildren();
          if (!cachedChildren || !_node.isCacheValid()) {
            promises.push(_node.fetchChildren());
          }

          // Prevent flickering by always rendering cached children -- if they're invalid,
          // then the fetch will happen soon.
          if (cachedChildren) {
            (function () {
              var depth = item.depth + 1;
              // Push the node's children on the stack in reverse order so that when
              // they are popped off the stack, they are iterated in the original
              // order.
              cachedChildren.reverse().forEach(function (childNode) {
                stack.push({ node: childNode, depth: depth });
              });
            })();
          }
        }
      });

      if (promises.length) {
        Promise.all(promises).then(function () {
          // The component could have been unmounted by the time the promises are resolved.
          if (_this2._isMounted) {
            _this2.forceUpdate();
          }
        });
      }

      this._allKeys = allKeys;
      this._keyToNode = keyToNode;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-tree-root' },
        children
      );
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this3 = this;

      var allKeys = [];
      var keyToNode = {};

      this.state.roots.forEach(function (root) {
        var rootKey = root.getKey();
        allKeys.push(rootKey);
        keyToNode[rootKey] = root;
      });

      var subscriptions = new (_atom2 || _atom()).CompositeDisposable();
      subscriptions.add(atom.commands.add(this.props.eventHandlerSelector, {
        // Expand and collapse.
        'core:move-right': function coreMoveRight() {
          return _this3._expandSelection();
        },
        'core:move-left': function coreMoveLeft() {
          return _this3._collapseSelection();
        },

        // Move selection up and down.
        'core:move-up': function coreMoveUp() {
          return _this3._moveSelectionUp();
        },
        'core:move-down': function coreMoveDown() {
          return _this3._moveSelectionDown();
        },

        'core:confirm': function coreConfirm() {
          return _this3._confirmSelection();
        }
      }));

      this._allKeys = allKeys;
      this._emitter = new (_atom2 || _atom()).Emitter();
      this._keyToNode = keyToNode;
      this._subscriptions = subscriptions;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
      }
      if (this._emitter) {
        this._emitter.dispose();
      }
      this._isMounted = false;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        expandedNodeKeys: Array.from(this.state.expandedKeys),
        selectedNodeKeys: Array.from(this.state.selectedKeys)
      };
    }
  }, {
    key: 'invalidateCachedNodes',
    value: function invalidateCachedNodes() {
      this.state.roots.forEach(function (root) {
        (0, (_treeNodeTraversals2 || _treeNodeTraversals()).forEachCachedNode)(root, function (node) {
          node.invalidateCache();
        });
      });
    }

    /**
     * Returns a Promise that's resolved when the roots are rendered.
     */
  }, {
    key: 'setRoots',
    value: function setRoots(roots) {
      var _this4 = this;

      this.state.roots.forEach(function (root) {
        _this4.removeStateForSubtree(root);
      });

      var expandedKeys = this.state.expandedKeys;
      roots.forEach(function (root) {
        return expandedKeys.add(root.getKey());
      });

      // We have to create the listener before setting the state so it can pick
      // up the changes from `setState`.
      var promise = this._createDidUpdateListener( /* shouldResolve */function () {
        var rootsReady = _this4.state.roots === roots;
        var childrenReady = _this4.state.roots.every(function (root) {
          return root.isCacheValid();
        });
        return rootsReady && childrenReady;
      });

      this.setState({
        roots: roots,
        expandedKeys: expandedKeys
      });

      return promise;
    }
  }, {
    key: '_createDidUpdateListener',
    value: function _createDidUpdateListener(shouldResolve) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        (0, (_assert2 || _assert()).default)(_this5._emitter);
        var didUpdateDisposable = _this5._emitter.on('did-update', function () {
          if (shouldResolve()) {
            resolve(undefined);

            // Set this to null so this promise can't be rejected anymore.
            _this5._rejectDidUpdateListenerPromise = null;
            didUpdateDisposable.dispose();
          }
        });

        // We need to reject the previous promise, so it doesn't get leaked.
        if (_this5._rejectDidUpdateListenerPromise) {
          _this5._rejectDidUpdateListenerPromise();
          _this5._rejectDidUpdateListenerPromise = null;
        }
        _this5._rejectDidUpdateListenerPromise = function () {
          reject(undefined);
          didUpdateDisposable.dispose();
        };
      });
    }
  }, {
    key: 'removeStateForSubtree',
    value: function removeStateForSubtree(root) {
      var expandedKeys = this.state.expandedKeys;
      var selectedKeys = this.state.selectedKeys;

      (0, (_treeNodeTraversals2 || _treeNodeTraversals()).forEachCachedNode)(root, function (node) {
        var cachedKey = node.getKey();
        expandedKeys.delete(cachedKey);
        selectedKeys.delete(cachedKey);
      });

      this.setState({
        expandedKeys: expandedKeys,
        selectedKeys: selectedKeys
      });
    }
  }, {
    key: 'getRootNodes',
    value: function getRootNodes() {
      return this.state.roots;
    }
  }, {
    key: 'getExpandedNodes',
    value: function getExpandedNodes() {
      var _this6 = this;

      var expandedNodes = [];
      this.state.expandedKeys.forEach(function (key) {
        var node = _this6.getNodeForKey(key);
        if (node != null) {
          expandedNodes.push(node);
        }
      });
      return expandedNodes;
    }
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      var _this7 = this;

      var selectedNodes = [];
      this.state.selectedKeys.forEach(function (key) {
        var node = _this7.getNodeForKey(key);
        if (node != null) {
          selectedNodes.push(node);
        }
      });
      return selectedNodes;
    }

    // Return the key for the first node that is selected, or null if there are none.
  }, {
    key: '_getFirstSelectedKey',
    value: function _getFirstSelectedKey() {
      var _this8 = this;

      if (this.state.selectedKeys.size === 0) {
        return null;
      }

      var selectedKey = undefined;
      if (this._allKeys != null) {
        this._allKeys.every(function (key) {
          if (_this8.state.selectedKeys.has(key)) {
            selectedKey = key;
            return false;
          }
          return true;
        });
      }

      return selectedKey;
    }
  }, {
    key: '_expandSelection',
    value: function _expandSelection() {
      var key = this._getFirstSelectedKey();
      if (key) {
        this.expandNodeKey(key);
      }
    }

    /**
     * Selects a node by key if it's in the file tree; otherwise, do nothing.
     */
  }, {
    key: 'selectNodeKey',
    value: function selectNodeKey(nodeKey) {
      var _this9 = this;

      if (!this.getNodeForKey(nodeKey)) {
        return Promise.reject();
      }

      // We have to create the listener before setting the state so it can pick
      // up the changes from `setState`.
      var promise = this._createDidUpdateListener( /* shouldResolve */function () {
        return _this9.state.selectedKeys.has(nodeKey);
      });
      this.setState({ selectedKeys: new Set([nodeKey]) });
      return promise;
    }
  }, {
    key: 'getNodeForKey',
    value: function getNodeForKey(nodeKey) {
      if (this._keyToNode != null) {
        return this._keyToNode[nodeKey];
      }
    }

    /**
     * If this function is called multiple times in parallel, the later calls will
     * cause the previous promises to reject even if they end up expanding the
     * node key successfully.
     *
     * If we don't reject, then we might leak promises if a node key is expanded
     * and collapsed in succession (the collapse could succeed first, causing
     * the expand to never resolve).
     */
  }, {
    key: 'expandNodeKey',
    value: function expandNodeKey(nodeKey) {
      var _this10 = this;

      var node = this.getNodeForKey(nodeKey);

      if (node && node.isContainer()) {
        var promise = this._createDidUpdateListener( /* shouldResolve */function () {
          var isExpanded = _this10.state.expandedKeys.has(nodeKey);
          var nodeNow = _this10.getNodeForKey(nodeKey);
          var isDoneFetching = nodeNow && nodeNow.isContainer() && nodeNow.isCacheValid();
          return Boolean(isExpanded && isDoneFetching);
        });
        this._toggleNodeExpanded(node, true /* forceExpanded */);
        return promise;
      }

      return Promise.resolve();
    }
  }, {
    key: 'collapseNodeKey',
    value: function collapseNodeKey(nodeKey) {
      var _this11 = this;

      var node = this.getNodeForKey(nodeKey);

      if (node && node.isContainer()) {
        var promise = this._createDidUpdateListener(
        /* shouldResolve */function () {
          return !_this11.state.expandedKeys.has(nodeKey);
        });
        this._toggleNodeExpanded(node, false /* forceExpanded */);
        return promise;
      }

      return Promise.resolve();
    }
  }, {
    key: 'isNodeKeyExpanded',
    value: function isNodeKeyExpanded(nodeKey) {
      return this.state.expandedKeys.has(nodeKey);
    }
  }, {
    key: '_collapseSelection',
    value: function _collapseSelection() {
      var key = this._getFirstSelectedKey();
      if (!key) {
        return;
      }

      var expandedKeys = this.state.expandedKeys;
      var node = this.getNodeForKey(key);
      if (node != null && (!expandedKeys.has(key) || !node.isContainer())) {
        // If the selection is already collapsed or it's not a container, select its parent.
        var _parent = node.getParent();
        if (_parent) {
          this.selectNodeKey(_parent.getKey());
        }
      }

      this.collapseNodeKey(key);
    }
  }, {
    key: '_moveSelectionUp',
    value: function _moveSelectionUp() {
      var allKeys = this._allKeys;
      if (!allKeys) {
        return;
      }

      var keyIndexToSelect = allKeys.length - 1;
      var key = this._getFirstSelectedKey();
      if (key) {
        keyIndexToSelect = allKeys.indexOf(key);
        if (keyIndexToSelect > 0) {
          --keyIndexToSelect;
        }
      }

      this.setState({ selectedKeys: new Set([allKeys[keyIndexToSelect]]) });
    }
  }, {
    key: '_moveSelectionDown',
    value: function _moveSelectionDown() {
      var allKeys = this._allKeys;
      if (!allKeys) {
        return;
      }

      var keyIndexToSelect = 0;
      var key = this._getFirstSelectedKey();
      if (key) {
        keyIndexToSelect = allKeys.indexOf(key);
        if (keyIndexToSelect !== -1 && keyIndexToSelect < allKeys.length - 1) {
          ++keyIndexToSelect;
        }
      }

      this.setState({ selectedKeys: new Set([allKeys[keyIndexToSelect]]) });
    }
  }, {
    key: '_confirmSelection',
    value: function _confirmSelection() {
      var key = this._getFirstSelectedKey();
      if (key) {
        var _node2 = this.getNodeForKey(key);
        if (_node2) {
          this._confirmNode(_node2);
        }
      }
    }
  }, {
    key: '_confirmNode',
    value: function _confirmNode(node) {
      if (node.isContainer()) {
        this._toggleNodeExpanded(node);
      } else {
        this.props.onConfirmSelection(node);
      }
    }
  }]);

  return TreeRootComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.TreeRootComponent = TreeRootComponent;

// By default, no context menu item will be displayed if the tree is empty.
// Set this to true to override that behavior.

// Render will return this component if there are no root nodes.

// A node can be confirmed if it is a selected non-container node and the user is clicks on it
// or presses <enter>.

// A node can be "kept" (opened permanently) by double clicking it. This only has an effect
// when the `usePreviewTabs` setting is enabled in the "tabs" package.