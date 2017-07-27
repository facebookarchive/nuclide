'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _FunnelIcon;

function _load_FunnelIcon() {
  return _FunnelIcon = require('./FunnelIcon');
}

var _ModalMultiSelect;

function _load_ModalMultiSelect() {
  return _ModalMultiSelect = require('../../../nuclide-ui/ModalMultiSelect');
}

var _Toolbar;

function _load_Toolbar() {
  return _Toolbar = require('nuclide-commons-ui/Toolbar');
}

var _ToolbarLeft;

function _load_ToolbarLeft() {
  return _ToolbarLeft = require('nuclide-commons-ui/ToolbarLeft');
}

var _ToolbarRight;

function _load_ToolbarRight() {
  return _ToolbarRight = require('nuclide-commons-ui/ToolbarRight');
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class ConsoleHeader extends _react.default.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._handleClearButtonClick = event => {
      this.props.clear();
    }, this._handleCreatePasteButtonClick = event => {
      if (this.props.createPaste != null) {
        this.props.createPaste();
      }
    }, this._handleReToggleButtonClick = () => {
      this.props.toggleRegExpFilter();
    }, this._renderOption = optionProps => {
      const { option } = optionProps;
      const source = this.props.sources.find(s => s.id === option.value);

      if (!(source != null)) {
        throw new Error('Invariant violation: "source != null"');
      }

      return _react.default.createElement(
        'span',
        null,
        option.label,
        this._renderProcessControlButton(source)
      );
    }, _temp;
  }

  _renderProcessControlButton(source) {
    let action;
    let label;
    let icon;
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
    const clickHandler = event => {
      event.stopPropagation();

      if (!(action != null)) {
        throw new Error('Invariant violation: "action != null"');
      }

      action();
    };
    return _react.default.createElement(
      (_Button || _load_Button()).Button,
      { className: 'pull-right', icon: icon, onClick: clickHandler },
      label
    );
  }

  render() {
    const options = this.props.sources.slice().sort((a, b) => sortAlpha(a.name, b.name)).map(source => ({
      label: source.id,
      value: source.name
    }));

    const filterInputClassName = (0, (_classnames || _load_classnames()).default)('nuclide-console-filter-field', {
      invalid: this.props.invalidFilterInput
    });

    const MultiSelectOption = this._renderOption;
    const pasteButton = this.props.createPaste == null ? null : _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        className: 'inline-block',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        onClick: this._handleCreatePasteButtonClick,
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: 'Creates a Paste from the current contents of the console'
        }) },
      'Create Paste'
    );

    return _react.default.createElement(
      (_Toolbar || _load_Toolbar()).Toolbar,
      { location: 'top' },
      _react.default.createElement(
        (_ToolbarLeft || _load_ToolbarLeft()).ToolbarLeft,
        null,
        _react.default.createElement(
          'span',
          { className: 'nuclide-console-header-filter-icon inline-block' },
          _react.default.createElement((_FunnelIcon || _load_FunnelIcon()).FunnelIcon, null)
        ),
        _react.default.createElement((_ModalMultiSelect || _load_ModalMultiSelect()).ModalMultiSelect, {
          labelComponent: MultiSelectLabel,
          optionComponent: MultiSelectOption,
          size: (_Button || _load_Button()).ButtonSizes.SMALL,
          options: options,
          value: this.props.selectedSourceIds,
          onChange: this.props.onSelectedSourcesChange,
          className: 'inline-block'
        }),
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { className: 'inline-block' },
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            className: filterInputClassName,
            size: 'sm',
            width: 200,
            placeholderText: 'Filter',
            onDidChange: this.props.onFilterTextChange,
            value: this.props.filterText
          }),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              className: 'nuclide-console-filter-regexp-button',
              size: (_Button || _load_Button()).ButtonSizes.SMALL,
              selected: this.props.enableRegExpFilter,
              onClick: this._handleReToggleButtonClick,
              tooltip: { title: 'Use Regex' } },
            '.*'
          )
        )
      ),
      _react.default.createElement(
        (_ToolbarRight || _load_ToolbarRight()).ToolbarRight,
        null,
        pasteButton,
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            size: (_Button || _load_Button()).ButtonSizes.SMALL,
            onClick: this._handleClearButtonClick },
          'Clear'
        )
      )
    );
  }
}

exports.default = ConsoleHeader;
function sortAlpha(a, b) {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower < bLower) {
    return -1;
  } else if (aLower > bLower) {
    return 1;
  }
  return 0;
}

function MultiSelectLabel(props) {
  const { selectedOptions } = props;
  const label = selectedOptions.length === 1 ? selectedOptions[0].label : `${selectedOptions.length} Sources`;
  return _react.default.createElement(
    'span',
    null,
    'Showing: ',
    label
  );
}