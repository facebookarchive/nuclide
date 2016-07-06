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

var _FunnelIcon2;

function _FunnelIcon() {
  return _FunnelIcon2 = require('./FunnelIcon');
}

var _nuclideUiLibModalMultiSelect2;

function _nuclideUiLibModalMultiSelect() {
  return _nuclideUiLibModalMultiSelect2 = require('../../../nuclide-ui/lib/ModalMultiSelect');
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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    this._handleReToggleButtonClick = this._handleReToggleButtonClick.bind(this);
    this._handleSelectedSourcesChange = this._handleSelectedSourcesChange.bind(this);
    this._renderOption = this._renderOption.bind(this);
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
    key: '_handleSelectedSourcesChange',
    value: function _handleSelectedSourcesChange(sourceIds) {
      this.props.onSelectedSourcesChange(sourceIds.length === 0
      // We don't actually allow no sources to be selected. What would be the point? If nothing is
      // selected, treat it as though everything is.
      ? this.props.sources.map(function (source) {
        return source.id;
      }) : sourceIds);
    }
  }, {
    key: '_renderProcessControlButton',
    value: function _renderProcessControlButton(source) {
      var action = undefined;
      var label = undefined;
      var icon = undefined;
      switch (source.status) {
        case 'running':
          {
            action = source.stop;
            label = 'Stop Process';
            icon = 'primitive-square';
            break;
          }
        case 'stopped':
          {
            action = source.start;
            label = 'Start Process';
            icon = 'triangle-right';
            break;
          }
      }
      if (action == null) {
        return;
      }
      var clickHandler = function clickHandler(event) {
        event.stopPropagation();
        (0, (_assert2 || _assert()).default)(action != null);
        action();
      };
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
        {
          className: 'pull-right',
          icon: icon,
          onClick: clickHandler },
        label
      );
    }
  }, {
    key: '_renderOption',
    value: function _renderOption(optionProps) {
      var option = optionProps.option;

      var source = this.props.sources.find(function (s) {
        return s.id === option.value;
      });
      (0, (_assert2 || _assert()).default)(source != null);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        null,
        option.label,
        this._renderProcessControlButton(source)
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var options = this.props.sources.slice().sort(function (a, b) {
        return sortAlpha(a.name, b.name);
      }).map(function (source) {
        return {
          label: source.id,
          value: source.name
        };
      });

      var filterInputClassName = (0, (_classnames2 || _classnames()).default)('nuclide-console-filter-field', {
        invalid: this.props.invalidFilterInput
      });

      var MultiSelectOption = this._renderOption;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiLibToolbar2 || _nuclideUiLibToolbar()).Toolbar,
        { location: 'top' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibToolbarLeft2 || _nuclideUiLibToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'nuclide-console-header-filter-icon inline-block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_FunnelIcon2 || _FunnelIcon()).FunnelIcon, null)
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibModalMultiSelect2 || _nuclideUiLibModalMultiSelect()).ModalMultiSelect, {
            labelComponent: MultiSelectLabel,
            optionComponent: MultiSelectOption,
            size: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonSizes.SMALL,
            options: options,
            value: this.props.selectedSourceIds,
            onChange: this._handleSelectedSourcesChange,
            className: 'inline-block'
          }),
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

function MultiSelectLabel(props) {
  var selectedOptions = props.selectedOptions;

  var label = selectedOptions.length === 1 ? selectedOptions[0].label : selectedOptions.length + ' Sources';
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    null,
    'Showing: ',
    label
  );
}
module.exports = exports.default;