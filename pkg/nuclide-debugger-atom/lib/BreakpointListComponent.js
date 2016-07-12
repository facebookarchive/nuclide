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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideUiLibCheckbox2;

function _nuclideUiLibCheckbox() {
  return _nuclideUiLibCheckbox2 = require('../../nuclide-ui/lib/Checkbox');
}

var _nuclideUiLibListview2;

function _nuclideUiLibListview() {
  return _nuclideUiLibListview2 = require('../../nuclide-ui/lib/Listview');
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
    value: function _handleBreakpointEnabledChange(path, line, enabled) {
      // TODO jxg toggle breakpoint enabled/disabled on store
    }
  }, {
    key: '_handleBreakpointClick',
    value: function _handleBreakpointClick(breakpointIndex, event) {
      var breakpoints = this.props.breakpoints;

      (0, (_assert2 || _assert()).default)(breakpoints != null);
      var _breakpoints$breakpointIndex = breakpoints[breakpointIndex];
      var path = _breakpoints$breakpointIndex.path;
      var line = _breakpoints$breakpointIndex.line;

      this.props.actions.openSourceLocation((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.nuclideUriToUri(path), line);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var breakpoints = this.props.breakpoints;

      if (breakpoints == null || breakpoints.length === 0) {
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          null,
          '(no breakpoints)'
        );
      }
      var renderedBreakpoints = breakpoints.map(function (breakpoint, i) {
        var path = breakpoint.path;
        var line = breakpoint.line;
        var enabled = breakpoint.enabled;
        var resolved = breakpoint.resolved;

        var label = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(path) + ':' + line;
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-atom-breakpoint', key: i },
          resolved ? (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibCheckbox2 || _nuclideUiLibCheckbox()).Checkbox, {
            label: label,
            checked: enabled,
            onChange: _this._handleBreakpointEnabledChange.bind(_this, path, line)
          }) : (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            '(unresolved) ',
            label
          )
        );
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibListview2 || _nuclideUiLibListview()).Listview,
        {
          alternateBackground: true,
          onSelect: this._handleBreakpointClick,
          selectable: true },
        renderedBreakpoints
      );
    }
  }]);

  return BreakpointListComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.BreakpointListComponent = BreakpointListComponent;