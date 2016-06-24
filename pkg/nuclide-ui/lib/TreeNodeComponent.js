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

var _LazyTreeNode2;

function _LazyTreeNode() {
  return _LazyTreeNode2 = require('./LazyTreeNode');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var PropTypes = (_reactForAtom2 || _reactForAtom()).React.PropTypes;

var INDENT_IN_PX = 10;
var INDENT_PER_LEVEL_IN_PX = 15;
var DOWN_ARROW = '';
var RIGHT_ARROW = '';
var SPINNER = '';

/**
 * Represents one entry in a TreeComponent.
 */

var TreeNodeComponent = (function (_React$Component) {
  _inherits(TreeNodeComponent, _React$Component);

  _createClass(TreeNodeComponent, null, [{
    key: 'propTypes',
    value: {
      depth: PropTypes.number.isRequired,
      isContainer: PropTypes.bool.isRequired,
      isExpanded: PropTypes.bool.isRequired,
      isLoading: PropTypes.bool.isRequired,
      isSelected: PropTypes.bool.isRequired,
      label: PropTypes.string.isRequired,
      labelElement: PropTypes.element,
      labelClassName: PropTypes.string.isRequired,
      node: PropTypes.instanceOf((_LazyTreeNode2 || _LazyTreeNode()).LazyTreeNode).isRequired,
      onClickArrow: PropTypes.func.isRequired,
      onClick: PropTypes.func.isRequired,
      onDoubleClick: PropTypes.func.isRequired,
      onMouseDown: PropTypes.func.isRequired,
      path: PropTypes.string.isRequired,
      rowClassName: PropTypes.string
    },
    enumerable: true
  }]);

  function TreeNodeComponent(props) {
    _classCallCheck(this, TreeNodeComponent);

    _get(Object.getPrototypeOf(TreeNodeComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
  }

  _createClass(TreeNodeComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return (_reactForAtom2 || _reactForAtom()).PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'render',
    value: function render() {
      var rowClassNameObj = {
        // Support for selectors in the "file-icons" package.
        // @see {@link https://atom.io/packages/file-icons|file-icons}
        'entry file list-item': true,
        'nuclide-tree-component-item': true,
        'nuclide-tree-component-selected': this.props.isSelected
      };
      if (this.props.rowClassName) {
        rowClassNameObj[this.props.rowClassName] = true;
      }

      var itemStyle = {
        paddingLeft: INDENT_IN_PX + this.props.depth * INDENT_PER_LEVEL_IN_PX
      };

      var arrow = undefined;
      if (this.props.isContainer) {
        if (this.props.isExpanded) {
          if (this.props.isLoading) {
            arrow = (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              { className: 'nuclide-tree-component-item-arrow-spinner' },
              SPINNER
            );
          } else {
            arrow = DOWN_ARROW;
          }
        } else {
          arrow = RIGHT_ARROW;
        }
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: (0, (_classnames2 || _classnames()).default)(rowClassNameObj),
          style: itemStyle,
          onClick: this._onClick,
          onDoubleClick: this._onDoubleClick,
          onMouseDown: this._onMouseDown },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'nuclide-tree-component-item-arrow', ref: 'arrow' },
          arrow
        ),
        this.props.labelElement != null ? this.props.labelElement : (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          {
            className: this.props.labelClassName,
            // `data-name` is support for selectors in the "file-icons" package.
            // @see {@link https://atom.io/packages/file-icons|file-icons}
            'data-name': this.props.label,
            'data-path': this.props.path },
          this.props.label
        )
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      if ((_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.arrow).contains(event.target)) {
        this.props.onClickArrow(event, this.props.node);
      } else {
        this.props.onClick(event, this.props.node);
      }
    }
  }, {
    key: '_onDoubleClick',
    value: function _onDoubleClick(event) {
      this.props.onDoubleClick(event, this.props.node);
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      this.props.onMouseDown(event, this.props.node);
    }
  }]);

  return TreeNodeComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.TreeNodeComponent = TreeNodeComponent;