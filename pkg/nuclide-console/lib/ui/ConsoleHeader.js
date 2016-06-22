Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../../nuclide-ui/lib/ButtonGroup');
}

var _nuclideUiLibDropdown2;

function _nuclideUiLibDropdown() {
  return _nuclideUiLibDropdown2 = require('../../../nuclide-ui/lib/Dropdown');
}

var _nuclideUiLibToolbar2;

function _nuclideUiLibToolbar() {
  return _nuclideUiLibToolbar2 = require('../../../nuclide-ui/lib/Toolbar');
}

var _nuclideUiLibToolbarLeft2;

function _nuclideUiLibToolbarLeft() {
  return _nuclideUiLibToolbarLeft2 = require('../../../nuclide-ui/lib/ToolbarLeft');
}

var _nuclideUiLibToolbarRight2;

function _nuclideUiLibToolbarRight() {
  return _nuclideUiLibToolbarRight2 = require('../../../nuclide-ui/lib/ToolbarRight');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../../nuclide-ui/lib/Button');
}

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    this._handleReToggleButtonClick = this._handleReToggleButtonClick.bind(this);
  }

  _createClass(ConsoleHeader, [{
    key: '_handleClearButtonClick',
    value: function _handleClearButtonClick(event) {
      this.props.clear();
    }
  }, {
    key: '_handleReToggleButtonClick',
    value: function _handleReToggleButtonClick() {
      this.props.toggleRegExpFilter();
    }
  }, {
    key: 'render',
    value: function render() {
      var options = [].concat(_toConsumableArray(this.props.sources.slice().sort(function (a, b) {
        return sortAlpha(a.name, b.name);
      }).map(function (source) {
        return {
          label: source.id,
          value: source.name
        };
      })), [{ label: 'All Sources', value: '' }]);

      var filterInputClassName = (0, (_classnames2 || _classnames()).default)('nuclide-console-filter-field', {
        invalid: this.props.invalidFilterInput
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibToolbar2 || _nuclideUiLibToolbar()).Toolbar,
        { location: 'top' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibToolbarLeft2 || _nuclideUiLibToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'nuclide-console-source-dropdown-container inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibDropdown2 || _nuclideUiLibDropdown()).Dropdown, {
              size: 'sm',
              options: options,
              value: this.props.selectedSourceId,
              onChange: this.props.onSelectedSourceChange
            })
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
            { className: 'inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
              className: filterInputClassName,
              size: 'sm',
              width: 200,
              placeholderText: 'Filter',
              onDidChange: this.props.onFilterTextChange
            }),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                className: 'nuclide-console-filter-regexp-button',
                size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
                selected: this.props.enableRegExpFilter,
                onClick: this._handleReToggleButtonClick },
              '.*'
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibToolbarRight2 || _nuclideUiLibToolbarRight()).ToolbarRight,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            {
              size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
              onClick: this._handleClearButtonClick },
            'Clear'
          )
        )
      );
    }
  }]);

  return ConsoleHeader;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = ConsoleHeader;

function sortAlpha(a, b) {
  var aLower = a.toLowerCase();
  var bLower = b.toLowerCase();
  if (aLower < bLower) {
    return -1;
  } else if (aLower > bLower) {
    return 1;
  }
  return 0;
}
module.exports = exports.default;