var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;

var emptyfunction = require('emptyfunction');

var PropTypes = React.PropTypes;

var NuclideDropdown = (function (_React$Component) {
  _inherits(NuclideDropdown, _React$Component);

  _createClass(NuclideDropdown, null, [{
    key: 'propTypes',
    value: {
      className: PropTypes.string.isRequired,
      disabled: PropTypes.bool.isRequired,
      menuItems: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.node.isRequired,
        value: PropTypes.any
      })).isRequired,
      selectedIndex: PropTypes.number.isRequired,
      /**
       * A function that gets called with the new selected index on change.
       */
      onSelectedChange: PropTypes.func.isRequired,
      /**
       * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
       * does not have an associated 'size' string).
       */
      size: PropTypes.oneOf(['xs', 'sm', 'lg']),
      title: PropTypes.string.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      selectedIndex: 0,
      menuItems: [],
      onSelectedChange: emptyfunction,
      title: ''
    },
    enumerable: true
  }]);

  function NuclideDropdown(props) {
    _classCallCheck(this, NuclideDropdown);

    _get(Object.getPrototypeOf(NuclideDropdown.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(NuclideDropdown, [{
    key: 'render',
    value: function render() {
      var options = this.props.menuItems.map(function (item) {
        return React.createElement(
          'option',
          { key: item.value, value: item.value },
          item.label
        );
      });
      var selectClassName = 'btn nuclide-dropdown';
      if (this.props.size) {
        selectClassName = selectClassName + ' btn-' + this.props.size;
      }
      var selectedItem = this.props.menuItems[this.props.selectedIndex];
      var selectedValue = selectedItem && selectedItem.value;
      return React.createElement(
        'div',
        { className: 'nuclide-dropdown-container ' + this.props.className },
        React.createElement(
          'select',
          {
            className: selectClassName,
            disabled: this.props.disabled,
            onChange: this._onChange,
            title: this.props.title,
            value: selectedValue },
          options
        ),
        React.createElement('i', { className: 'icon icon-triangle-down' })
      );
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      if (event.target.selectedIndex != null) {
        var selectedIndex = event.target.selectedIndex;
        this.props.onSelectedChange(selectedIndex);
      }
    }
  }]);

  return NuclideDropdown;
})(React.Component);

module.exports = NuclideDropdown;
//# sourceMappingURL=data:application/json;base64,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R0FBRztPQUNyQyxDQUNOO0tBQ0g7OztXQUVRLG1CQUFDLEtBQTBCLEVBQVE7QUFDMUMsVUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUU7QUFDdEMsWUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDakQsWUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUM1QztLQUNGOzs7U0FsRUcsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQXFFN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiTnVjbGlkZURyb3Bkb3duLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5jb25zdCBlbXB0eWZ1bmN0aW9uID0gcmVxdWlyZSgnZW1wdHlmdW5jdGlvbicpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG5jbGFzcyBOdWNsaWRlRHJvcGRvd24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXG4gICAgbWVudUl0ZW1zOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc2hhcGUoe1xuICAgICAgbGFiZWw6IFByb3BUeXBlcy5ub2RlLmlzUmVxdWlyZWQsXG4gICAgICB2YWx1ZTogUHJvcFR5cGVzLmFueSxcbiAgICB9KSkuaXNSZXF1aXJlZCxcbiAgICBzZWxlY3RlZEluZGV4OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgLyoqXG4gICAgICogQSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIHdpdGggdGhlIG5ldyBzZWxlY3RlZCBpbmRleCBvbiBjaGFuZ2UuXG4gICAgICovXG4gICAgb25TZWxlY3RlZENoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBTaXplIG9mIGRyb3Bkb3duLiBTaXplcyBtYXRjaCAuYnRuIGNsYXNzZXMgaW4gQXRvbSdzIHN0eWxlIGd1aWRlLiBEZWZhdWx0IGlzIG1lZGl1bSAod2hpY2hcbiAgICAgKiBkb2VzIG5vdCBoYXZlIGFuIGFzc29jaWF0ZWQgJ3NpemUnIHN0cmluZykuXG4gICAgICovXG4gICAgc2l6ZTogUHJvcFR5cGVzLm9uZU9mKFsneHMnLCAnc20nLCAnbGcnXSksXG4gICAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIHNlbGVjdGVkSW5kZXg6IDAsXG4gICAgbWVudUl0ZW1zOiBbXSxcbiAgICBvblNlbGVjdGVkQ2hhbmdlOiBlbXB0eWZ1bmN0aW9uLFxuICAgIHRpdGxlOiAnJyxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uQ2hhbmdlID0gdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnByb3BzLm1lbnVJdGVtcy5tYXAoaXRlbSA9PlxuICAgICAgPG9wdGlvbiBrZXk9e2l0ZW0udmFsdWV9IHZhbHVlPXtpdGVtLnZhbHVlfT57aXRlbS5sYWJlbH08L29wdGlvbj5cbiAgICApO1xuICAgIGxldCBzZWxlY3RDbGFzc05hbWUgPSAnYnRuIG51Y2xpZGUtZHJvcGRvd24nO1xuICAgIGlmICh0aGlzLnByb3BzLnNpemUpIHtcbiAgICAgIHNlbGVjdENsYXNzTmFtZSA9IGAke3NlbGVjdENsYXNzTmFtZX0gYnRuLSR7dGhpcy5wcm9wcy5zaXplfWA7XG4gICAgfVxuICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IHRoaXMucHJvcHMubWVudUl0ZW1zW3RoaXMucHJvcHMuc2VsZWN0ZWRJbmRleF07XG4gICAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkSXRlbSAmJiBzZWxlY3RlZEl0ZW0udmFsdWU7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnbnVjbGlkZS1kcm9wZG93bi1jb250YWluZXIgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfT5cbiAgICAgICAgPHNlbGVjdFxuICAgICAgICAgIGNsYXNzTmFtZT17c2VsZWN0Q2xhc3NOYW1lfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVkfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWRWYWx1ZX0+XG4gICAgICAgICAge29wdGlvbnN9XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgICA8aSBjbGFzc05hbWU9XCJpY29uIGljb24tdHJpYW5nbGUtZG93blwiIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2hhbmdlKGV2ZW50OiBTeW50aGV0aWNNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgaWYgKGV2ZW50LnRhcmdldC5zZWxlY3RlZEluZGV4ICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBldmVudC50YXJnZXQuc2VsZWN0ZWRJbmRleDtcbiAgICAgIHRoaXMucHJvcHMub25TZWxlY3RlZENoYW5nZShzZWxlY3RlZEluZGV4KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlRHJvcGRvd247XG4iXX0=