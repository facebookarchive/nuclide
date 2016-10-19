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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../nuclide-ui/Checkbox');
}

var _nuclideUiListView;

function _load_nuclideUiListView() {
  return _nuclideUiListView = require('../../nuclide-ui/ListView');
}

var BreakpointListComponent = (function (_React$Component) {
  _inherits(BreakpointListComponent, _React$Component);

  function BreakpointListComponent(props) {
    _classCallCheck(this, BreakpointListComponent);

    _get(Object.getPrototypeOf(BreakpointListComponent.prototype), 'constructor', this).call(this, props);
    this._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
    this._handleBreakpointClick = this._handleBreakpointClick.bind(this);
  }

  _createClass(BreakpointListComponent, [{
    key: '_handleBreakpointEnabledChange',
    value: function _handleBreakpointEnabledChange(breakpoint, enabled) {
      this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
    }
  }, {
    key: '_handleBreakpointClick',
    value: function _handleBreakpointClick(breakpointIndex, breakpoint) {
      (0, (_assert || _load_assert()).default)(breakpoint != null);
      var path = breakpoint.path;
      var line = breakpoint.line;

      this.props.actions.openSourceLocation((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.nuclideUriToUri(path), line);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var breakpoints = this.props.breakpoints;

      if (breakpoints == null || breakpoints.length === 0) {
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          'span',
          null,
          '(no breakpoints)'
        );
      }
      var items = breakpoints.map(function (breakpoint) {
        return _extends({}, breakpoint, {
          // Calculate the basename exactly once for each breakpoint
          basename: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(breakpoint.path)
        });
      })
      // Show resolved breakpoints at the top of the list, then order by filename & line number.
      .sort(function (breakpointA, breakpointB) {
        return 100 * (Number(breakpointB.resolved) - Number(breakpointA.resolved)) + 10 * breakpointA.basename.localeCompare(breakpointB.basename) + Math.sign(breakpointA.line - breakpointB.line);
      }).map(function (breakpoint, i) {
        var basename = breakpoint.basename;
        var line = breakpoint.line;
        var enabled = breakpoint.enabled;
        var resolved = breakpoint.resolved;

        var label = basename + ':' + (line + 1);
        var content = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-breakpoint', key: i },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
            label: label,
            checked: enabled,
            indeterminate: !resolved,
            disabled: !resolved,
            onChange: _this._handleBreakpointEnabledChange.bind(_this, breakpoint),
            title: resolved ? null : 'Unresolved Breakpoint'
          })
        );
        return (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiListView || _load_nuclideUiListView()).ListViewItem,
          { key: label, value: breakpoint },
          content
        );
      });
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiListView || _load_nuclideUiListView()).ListView,
        {
          alternateBackground: true,
          onSelect: this._handleBreakpointClick,
          selectable: true },
        items
      );
    }
  }]);

  return BreakpointListComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.BreakpointListComponent = BreakpointListComponent;