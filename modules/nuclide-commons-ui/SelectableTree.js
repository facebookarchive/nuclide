'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Tree = undefined;var _collection;













function _load_collection() {return _collection = require('../nuclide-commons/collection');}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}
var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _shallowequal;
function _load_shallowequal() {return _shallowequal = _interopRequireDefault(require('shallowequal'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _scrollIntoView;
function _load_scrollIntoView() {return _scrollIntoView = require('./scrollIntoView');}var _Tree;
function _load_Tree() {return _Tree = require('./Tree');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



































class Tree extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.


    state = {
      isFocused: false,
      focusedPath: null }, this.






























    _selectNext = () => {
      let nextNodePath;
      if (this.state.focusedPath == null) {
        nextNodePath = [0];
      } else {
        nextNodePath = getNextNodePath(
        this.props.items,
        this.state.focusedPath,
        this.props.collapsedPaths);

      }
      if (nextNodePath != null) {
        this.props.onSelect(nextNodePath);
        this.setState({ focusedPath: nextNodePath });
      }
    }, this.

    _selectPrev = () => {
      let prevNodePath;
      if (this.state.focusedPath == null) {
        prevNodePath = [0];
      } else {
        prevNodePath = getPrevNodePath(
        this.props.items,
        this.state.focusedPath,
        this.props.collapsedPaths);

      }
      if (prevNodePath != null) {
        this.props.onSelect(prevNodePath);
      }
    }, this.

    _collapseNodeViaKeyboard = e => {
      if (this.state.focusedPath == null) {
        return;
      }

      let collapsablePath = [...this.state.focusedPath];
      let collapsableNode = selectNodeAtPath(this.props.items, collapsablePath);
      while (collapsableNode != null && collapsableNode.type !== 'NESTED') {
        collapsablePath = collapsablePath.slice(0, collapsablePath.length - 1);
        collapsableNode = selectNodeAtPath(this.props.items, collapsablePath);
      }

      if (collapsableNode == null) {
        return;
      }

      this.props.onCollapse(collapsablePath);
      // if a descendant of this node was selected when this node was collapsed,
      // moving selection to this node seems like intuitive behavior (see Chrome's
      // Elements tree)
      this.props.onSelect(collapsablePath);
    }, this.

    _expandNodeViaKeyboard = e => {
      const { focusedPath } = this.state;
      if (focusedPath == null) {
        return;
      }

      const focusedNode = selectNodeAtPath(this.props.items, focusedPath);
      if (focusedNode != null && focusedNode.type === 'NESTED') {
        this.props.onExpand(focusedPath);
      }
    }, this.

    _handleSelect = path => {
      this.props.onSelect(path);
    }, this.

    _handleConfirm = path => {
      this.props.onConfirm(path);
    }, _temp;}componentDidMount() {const rootNode = (0, (_nullthrows || _load_nullthrows()).default)(this._rootNode);this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add(rootNode, { 'core:move-up': this._selectPrev, 'core:move-down': this._selectNext, 'core:move-left': this._collapseNodeViaKeyboard, 'core:move-right': this._expandNodeViaKeyboard, 'core:confirm': () => this.state.focusedPath && this._handleConfirm(this.state.focusedPath) }), _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.fromEvent(rootNode, 'focusin').mapTo(true), _rxjsBundlesRxMinJs.Observable.fromEvent(rootNode, 'focusout').mapTo(false)).subscribe(isFocused => this.setState({ isFocused })));}componentWillUnmount() {this._subscriptions.dispose();}componentWillReceiveProps() {this.setState((state, props) => ({ focusedPath: props.selectedPaths[props.selectedPaths.length - 1] }));}

  render() {
    const {
      className,
      collapsedPaths,
      itemClassName,
      items: nodes,
      selectedPaths } =
    this.props;
    const { focusedPath, isFocused } = this.state;

    return (
      _react.createElement('ol', {
          className: (0, (_classnames || _load_classnames()).default)(
          'list-tree',
          'nuclide-selectable-tree',
          'has-collapsable-children',
          className,
          { focused: isFocused }),

          ref: node => this._rootNode = node,
          role: 'tree',
          style: { position: 'relative' },
          tabIndex: '0' },
        nodes.map((node, i) =>
        _react.createElement(AbstractTreeItem, {
          key: i,
          node: node,
          path: [i],
          focusedPath: focusedPath,
          collapsedPaths: collapsedPaths,
          selectedPaths: selectedPaths,
          className: itemClassName,
          onSelect: this._handleSelect,
          onConfirm: this._handleConfirm,
          onTripleClick: this.props.onTripleClick,
          onCollapse: this.props.onCollapse,
          onExpand: this.props.onExpand }))));




  }}exports.Tree = Tree; /**
                          * Copyright (c) 2017-present, Facebook, Inc.
                          * All rights reserved.
                          *
                          * This source code is licensed under the BSD-style license found in the
                          * LICENSE file in the root directory of this source tree. An additional grant
                          * of patent rights can be found in the PATENTS file in the same directory.
                          *
                          * 
                          * @format
                          */ /* eslint-env browser */function AbstractTreeItem({ className, collapsedPaths, focusedPath, onConfirm, onSelect, onTripleClick, onCollapse,
  onExpand,
  node,
  path,
  selectedPaths })












{
  if (node.hidden) {
    return null;
  }

  if (node.type === 'LEAF') {
    return (
      // $FlowIgnore
      _react.createElement(TreeItem, {
          className: className,
          isFocused: focusedPath && (0, (_collection || _load_collection()).arrayEqual)(focusedPath, path),
          onConfirm: onConfirm,
          onSelect: onSelect,
          onTripleClick: onTripleClick,
          path: path,
          selectedPaths: selectedPaths },
        node.label));


  }

  const hasFlatChildren = node.children.every(child => child.type === 'LEAF');
  return (
    // $FlowIgnore
    _react.createElement(NestedTreeItem, {
        className: className,
        collapsed: false,
        hasFlatChildren: hasFlatChildren,
        focusedPath: focusedPath,
        onConfirm: onConfirm,
        onSelect: onSelect,
        onTripleClick: onTripleClick,
        onCollapse: onCollapse,
        onExpand: onExpand,
        path: path,
        collapsedPaths: collapsedPaths,
        selectedPaths: selectedPaths,
        label: node.label },
      node.children.map((child, i) => {
        const childPath = path.concat([i]);
        return (
          _react.createElement(AbstractTreeItem, {
            className: className,
            collapsedPaths: collapsedPaths,
            focusedPath: focusedPath,
            key: childPath.join('.'),
            node: child,
            onConfirm: onConfirm,
            onSelect: onSelect,
            onTripleClick: onTripleClick,
            onCollapse: onCollapse,
            onExpand: onExpand,
            path: childPath,
            selectedPaths: selectedPaths }));


      })));


}












class TreeItem extends _react.Component {constructor(...args) {var _temp2;return _temp2 = super(...args), this.

    _handleClick = e => {
      const { onSelect, onConfirm, onTripleClick } = this.props;

      const numberOfClicks = e.detail;
      switch (numberOfClicks) {
        case 1:
          onSelect && onSelect(this.props.path);
          break;
        case 2:
          onConfirm && onConfirm(this.props.path);
          break;
        case 3:
          onTripleClick && onTripleClick(this.props.path);
          break;
        default:
          break;}

    }, _temp2;}

  scrollIntoView() {
    if (this._liNode != null) {
      (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoView)(this._liNode);
    }
  }

  render() {
    const { className, isFocused, path, selectedPaths, children } = this.props;
    const isSelected = selectedPaths.some(selectedPath =>
    (0, (_shallowequal || _load_shallowequal()).default)(path, selectedPath));


    return (
      _react.createElement('li', {
          'aria-activedescendant': isFocused,
          'aria-selected': isSelected,
          className: (0, (_classnames || _load_classnames()).default)('list-item', className, {
            selected: isSelected }),

          onClick: this._handleClick,
          ref: liNode => this._liNode = liNode,
          role: 'treeitem' },
        isSelected && typeof children === 'string' ?
        // String children must be wrapped to receive correct styles when selected.
        _react.createElement('span', null, children) :

        children));



  }}


















class NestedTreeItem extends _react.Component {constructor(...args) {var _temp3;return _temp3 = super(...args), this.



    _handleClick = e => {
      const itemNode = this._itemNode;
      if (itemNode == null) {
        return;
      }if (!(

      e.target instanceof Element)) {throw new Error('Invariant violation: "e.target instanceof Element"');}
      if (e.target.closest('.list-item') !== itemNode) {
        // this was a click on a descendant node in the inner list
        return;
      }

      // TODO: This is gross. It assumes that the expand chevron is present in the
      // `before` pseudoelement (as is with most themes), and measures the space
      // it occupies using computed style properties, not actual measurements.
      // The toggle chevron should be reimplemented as a true dom node instead,
      // bypassing themes. Though this is more visually consistent, it's probably
      // not worth the hassle.
      const beforeStyle = window.getComputedStyle(this._itemNode, ':before');
      const itemStyle = window.getComputedStyle(this._itemNode);
      const chevronWidth =
      parsePx(itemStyle.paddingLeft) +
      parsePx(beforeStyle.paddingLeft) +
      parsePx(beforeStyle.paddingRight) +
      parsePx(beforeStyle.marginLeft) +
      parsePx(beforeStyle.marginRight) +
      parsePx(beforeStyle.width) +
      parsePx(beforeStyle.left);

      const { path, collapsedPaths } = this.props;if (!(
      e.nativeEvent instanceof MouseEvent)) {throw new Error('Invariant violation: "e.nativeEvent instanceof MouseEvent"');}
      if (e.nativeEvent.offsetX <= chevronWidth) {
        if (
        collapsedPaths.some(collapsedPath => (0, (_collection || _load_collection()).arrayEqual)(path, collapsedPath)))
        {
          this.props.onExpand(path);
        } else {
          this.props.onCollapse(path);
        }
        return;
      }

      const { onSelect, onConfirm, onTripleClick } = this.props;
      const numberOfClicks = e.detail;
      if (numberOfClicks === 1 && onSelect != null) {
        onSelect(path);
      } else if (numberOfClicks === 2 && onConfirm != null) {
        onConfirm(path);
      } else if (numberOfClicks === 3 && onTripleClick != null) {
        onTripleClick(path);
      }
    }, _temp3;}

  render() {
    const {
      className,
      hasFlatChildren,
      focusedPath,
      selectedPaths,
      collapsedPaths,
      path,
      label,
      children } =
    this.props;
    const isFocused = focusedPath && (0, (_collection || _load_collection()).arrayEqual)(path, focusedPath);
    const isSelected = selectedPaths.some(selectedPath =>
    (0, (_shallowequal || _load_shallowequal()).default)(path, selectedPath));

    const isCollapsed = collapsedPaths.some(collapsedPath =>
    (0, (_shallowequal || _load_shallowequal()).default)(path, collapsedPath));


    return (
      _react.createElement('li', {
          'aria-activedescendant': isFocused,
          'aria-selected': isSelected,
          'aria-expanded': !isCollapsed,
          className: (0, (_classnames || _load_classnames()).default)('list-nested-item', className, {
            collapsed: isCollapsed,
            selected: isSelected }),

          onClick: this._handleClick,
          role: 'treeitem' },
        label == null ? null :
        _react.createElement('div', { className: 'list-item', ref: node => this._itemNode = node },
          label),


        _react.createElement((_Tree || _load_Tree()).TreeList, { hasFlatChildren: hasFlatChildren }, children)));


  }}


function selectNodeAtPath(roots, path) {
  if (path.length === 0) {
    return;
  }

  let node = roots[path[0]];
  for (let i = 1; i < path.length; i++) {if (!(
    node.type === 'NESTED')) {throw new Error('Invariant violation: "node.type === \'NESTED\'"');}
    node = node.children[path[i]];
  }
  return node;
}

function getNextNodePath(
roots,
path,
collapsedPaths)
{
  if (path.length === 0) {
    return null;
  }

  const currentNode = selectNodeAtPath(roots, path);
  if (currentNode == null) {
    return;
  }

  if (
  currentNode.type === 'NESTED' &&
  currentNode.children.length > 0 &&
  // don't traverse children of collapsed nodes
  !collapsedPaths.find(collapsedPath => (0, (_collection || _load_collection()).arrayEqual)(collapsedPath, path)))
  {
    // 'down' was pressed on a nested item. most of the time we want go to its
    // first child, but we need to make sure it's not hidden (eg filtered by
    // a search) first
    const firstVisibleChildIndex = currentNode.children.findIndex(
    n => !n.hidden);

    if (firstVisibleChildIndex >= 0) {
      return path.concat([firstVisibleChildIndex]);
    }
  }

  return findNextSibling(roots, path, collapsedPaths);
}

function findNextSibling(
roots,
path,
collapsedPaths)
{
  if (path.length === 0) {
    return null;
  }

  const leadingIndexes = path.slice(0, path.length - 1);
  const tailIndex = path[path.length - 1];
  const nextSiblingPath = [...leadingIndexes, tailIndex + 1];
  const nextSibling = selectNodeAtPath(roots, nextSiblingPath);
  if (nextSibling != null) {
    if (nextSibling.hidden) {
      // skip over next hidden nodes by finding *their* next sibling
      return findNextSibling(roots, nextSiblingPath, collapsedPaths);
    }
    return nextSiblingPath;
  }

  // there's no next sibling. let's navigate to this node's parent's siblings
  return findNextSibling(roots, leadingIndexes, collapsedPaths);
}

function getPrevNodePath(
roots,
path,
collapsedPaths)
{
  if (path.length === 0) {
    return null;
  }

  const leadingIndexes = path.slice(0, path.length - 1);
  const tailIndex = path[path.length - 1];
  const prevSiblingPath = [...leadingIndexes, tailIndex - 1];
  const prevSibling = selectNodeAtPath(roots, prevSiblingPath);
  if (prevSibling != null) {
    if (prevSibling.hidden) {
      return getPrevNodePath(roots, prevSiblingPath, collapsedPaths);
    }

    if (
    prevSibling.type === 'NESTED' &&
    prevSibling.children.length > 0 &&
    // don't traverse children of collapsed nodes
    !collapsedPaths.find(collapsedPath =>
    (0, (_collection || _load_collection()).arrayEqual)(collapsedPath, prevSiblingPath)))

    {
      // pressed 'up' on a node just after an expanded nested item. Normally this
      // should take us to the last item inside the expanded node, but some may
      // be hidden. Find the last in the list that's visible.
      const lastVisibleChildIndex = (0, (_collection || _load_collection()).arrayFindLastIndex)(
      prevSibling.children,
      n => !n.hidden);

      if (lastVisibleChildIndex >= 0) {
        return prevSiblingPath.concat([lastVisibleChildIndex]);
      }
    }

    return prevSiblingPath;
  }

  // return the parent if it's a valid path
  if (leadingIndexes.length > 0) {
    return leadingIndexes;
  }
}

function parsePx(px) {
  return px.length === 0 ? 0 : Number(px.replace('px', ''));
}