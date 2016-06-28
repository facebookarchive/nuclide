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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

/** A vertical divider with a title.
 * Specifying `collapsable` prop as true will add a clickable chevron icon that
 * collapses the component children. Optionally specify collapsedByDefault
 * (defaults to false)
 **/

var Section = (function (_React$Component) {
  _inherits(Section, _React$Component);

  function Section(props) {
    _classCallCheck(this, Section);

    _get(Object.getPrototypeOf(Section.prototype), 'constructor', this).call(this, props);

    var initialIsCollapsed = this.props.collapsable != null && this.props.collapsable && this.props.collapsedByDefault != null && this.props.collapsedByDefault;

    this.state = {
      isCollapsed: initialIsCollapsed
    };
  }

  _createClass(Section, [{
    key: 'render',
    value: function render() {
      var collapsable = this.props.collapsable != null ? this.props.collapsable : false;
      var isCollapsed = this.state.isCollapsed;
      var chevronTooltip = isCollapsed ? 'Click to expand' : 'Click to collapse';
      // Only include classes if the component is collapsable
      var iconClass = (0, (_classnames2 || _classnames()).default)({
        'icon': collapsable,
        'icon-chevron-down': collapsable && !isCollapsed,
        'icon-chevron-right': collapsable && isCollapsed,
        'nuclide-ui-section-collapsable': collapsable
      });
      var conditionalProps = {};
      if (collapsable) {
        conditionalProps.onClick = this._toggleCollapsed.bind(this);
        conditionalProps.title = chevronTooltip;
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h3',
          _extends({ className: iconClass }, conditionalProps),
          this.props.headline
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: isCollapsed ? { display: 'none' } : {} },
          this.props.children
        )
      );
    }
  }, {
    key: '_toggleCollapsed',
    value: function _toggleCollapsed() {
      this.setState({ isCollapsed: !this.state.isCollapsed });
    }
  }]);

  return Section;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Section = Section;