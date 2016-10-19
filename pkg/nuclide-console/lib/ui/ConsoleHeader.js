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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../../nuclide-ui/AtomInput');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _FunnelIcon;

function _load_FunnelIcon() {
  return _FunnelIcon = require('./FunnelIcon');
}

var _nuclideUiModalMultiSelect;

function _load_nuclideUiModalMultiSelect() {
  return _nuclideUiModalMultiSelect = require('../../../nuclide-ui/ModalMultiSelect');
}

var _nuclideUiToolbar;

function _load_nuclideUiToolbar() {
  return _nuclideUiToolbar = require('../../../nuclide-ui/Toolbar');
}

var _nuclideUiToolbarLeft;

function _load_nuclideUiToolbarLeft() {
  return _nuclideUiToolbarLeft = require('../../../nuclide-ui/ToolbarLeft');
}

var _nuclideUiToolbarRight;

function _load_nuclideUiToolbarRight() {
  return _nuclideUiToolbarRight = require('../../../nuclide-ui/ToolbarRight');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../nuclide-ui/Button');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var ConsoleHeader = (function (_React$Component) {
  _inherits(ConsoleHeader, _React$Component);

  function ConsoleHeader(props) {
    _classCallCheck(this, ConsoleHeader);

    _get(Object.getPrototypeOf(ConsoleHeader.prototype), 'constructor', this).call(this, props);
    this._handleClearButtonClick = this._handleClearButtonClick.bind(this);
    this._handleReToggleButtonClick = this._handleReToggleButtonClick.bind(this);
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
    key: '_renderProcessControlButton',
    value: function _renderProcessControlButton(source) {
      var action = undefined;
      var label = undefined;
      var icon = undefined;
      switch (source.status) {
        case 'starting':
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
        (0, (_assert || _load_assert()).default)(action != null);
        action();
      };
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiButton || _load_nuclideUiButton()).Button,
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
      (0, (_assert || _load_assert()).default)(source != null);
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
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

      var filterInputClassName = (0, (_classnames || _load_classnames()).default)('nuclide-console-filter-field', {
        invalid: this.props.invalidFilterInput
      });

      var MultiSelectOption = this._renderOption;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiToolbar || _load_nuclideUiToolbar()).Toolbar,
        { location: 'top' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiToolbarLeft || _load_nuclideUiToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'span',
            { className: 'nuclide-console-header-filter-icon inline-block' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_FunnelIcon || _load_FunnelIcon()).FunnelIcon, null)
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiModalMultiSelect || _load_nuclideUiModalMultiSelect()).ModalMultiSelect, {
            labelComponent: MultiSelectLabel,
            optionComponent: MultiSelectOption,
            size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
            options: options,
            value: this.props.selectedSourceIds,
            onChange: this.props.onSelectedSourcesChange,
            className: 'inline-block'
          }),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
            { className: 'inline-block' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
              className: filterInputClassName,
              size: 'sm',
              width: 200,
              placeholderText: 'Filter',
              onDidChange: this.props.onFilterTextChange
            }),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              {
                className: 'nuclide-console-filter-regexp-button',
                size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
                selected: this.props.enableRegExpFilter,
                onClick: this._handleReToggleButtonClick },
              '.*'
            )
          )
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_nuclideUiToolbarRight || _load_nuclideUiToolbarRight()).ToolbarRight,
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              size: (_nuclideUiButton || _load_nuclideUiButton()).ButtonSizes.SMALL,
              onClick: this._handleClearButtonClick },
            'Clear'
          )
        )
      );
    }
  }]);

  return ConsoleHeader;
})((_reactForAtom || _load_reactForAtom()).React.Component);

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
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'span',
    null,
    'Showing: ',
    label
  );
}
module.exports = exports.default;