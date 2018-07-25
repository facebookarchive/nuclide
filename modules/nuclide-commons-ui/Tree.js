"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tree = Tree;
exports.TreeList = exports.NestedTreeItem = exports.TreeItem = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _scrollIntoView() {
  const data = require("./scrollIntoView");

  _scrollIntoView = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function Tree(_ref) {
  let {
    className,
    style
  } = _ref,
      props = _objectWithoutProperties(_ref, ["className", "style"]);

  return React.createElement("ol", Object.assign({
    className: (0, _classnames().default)('list-tree', className),
    role: "tree",
    style: Object.assign({
      position: 'relative'
    }, style)
  }, props));
}

class TreeItem extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleClick = handleClick.bind(this), _temp;
  }

  scrollIntoView() {
    if (this._liNode != null) {
      (0, _scrollIntoView().scrollIntoView)(this._liNode);
    }
  }

  render() {
    const {
      className,
      selected,
      children,
      onMouseDown,
      onMouseEnter,
      onMouseLeave,
      path,
      name,
      title
    } = this.props;
    return React.createElement("div", {
      title: title
    }, React.createElement("li", {
      "aria-selected": selected,
      className: (0, _classnames().default)(className, {
        selected
      }, 'list-item'),
      onMouseDown: onMouseDown,
      onMouseEnter: onMouseEnter,
      onMouseLeave: onMouseLeave,
      "data-path": path,
      "data-name": name,
      onClick: this._handleClick,
      ref: liNode => this._liNode = liNode,
      role: "treeitem",
      tabIndex: selected ? '0' : '-1'
    }, selected && typeof children === 'string' ? // String children must be wrapped to receive correct styles when selected.
    React.createElement("span", null, children) : children));
  }

}

exports.TreeItem = TreeItem;

class NestedTreeItem extends React.Component {
  constructor(...args) {
    var _temp2;

    return _temp2 = super(...args), this._handleClick = e => {
      const itemNode = this._itemNode;

      if (itemNode == null) {
        return;
      }

      if (!(e.target instanceof Element)) {
        throw new Error("Invariant violation: \"e.target instanceof Element\"");
      }

      if (e.target.closest('.list-item') === itemNode) {
        handleClick.call(this, e);
      }
    }, _temp2;
  }

  render() {
    const {
      className,
      hasFlatChildren,
      selected,
      collapsed,
      title,
      children
    } = this.props;
    return React.createElement("li", {
      "aria-selected": selected,
      "aria-expanded": !collapsed,
      className: (0, _classnames().default)(className, {
        selected,
        collapsed
      }, 'list-nested-item'),
      onClick: this._handleClick,
      role: "treeitem",
      tabIndex: selected ? '0' : '-1'
    }, title == null ? null : React.createElement("div", {
      tabIndex: -1,
      className: "native-key-bindings list-item",
      ref: node => this._itemNode = node
    }, title), React.createElement(TreeList, {
      hasFlatChildren: hasFlatChildren
    }, children));
  }

}

exports.NestedTreeItem = NestedTreeItem;

const TreeList = props => // $FlowFixMe(>=0.53.0) Flow suppress
React.createElement("ul", {
  className: (0, _classnames().default)(props.className, {
    'has-collapsable-children': props.showArrows,
    'has-flat-children': props.hasFlatChildren
  }, 'list-tree'),
  role: "group"
}, props.children);

exports.TreeList = TreeList;

function handleClick(e) {
  const {
    onSelect,
    onConfirm,
    onTripleClick
  } = this.props;
  const numberOfClicks = e.detail;

  switch (numberOfClicks) {
    case 1:
      onSelect && onSelect(e);
      break;

    case 2:
      onConfirm && onConfirm(e);
      break;

    case 3:
      onTripleClick && onTripleClick(e);
      break;

    default:
      break;
  }
}