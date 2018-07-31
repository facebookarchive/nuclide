"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _LoadingSpinner() {
  const data = require("../../../../../nuclide-commons-ui/LoadingSpinner");

  _LoadingSpinner = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _ModalMultiSelect() {
  const data = require("../../../../../nuclide-commons-ui/ModalMultiSelect");

  _ModalMultiSelect = function () {
    return data;
  };

  return data;
}

function _RegExpFilter() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/RegExpFilter"));

  _RegExpFilter = function () {
    return data;
  };

  return data;
}

function _Toolbar() {
  const data = require("../../../../../nuclide-commons-ui/Toolbar");

  _Toolbar = function () {
    return data;
  };

  return data;
}

function _ToolbarLeft() {
  const data = require("../../../../../nuclide-commons-ui/ToolbarLeft");

  _ToolbarLeft = function () {
    return data;
  };

  return data;
}

function _ToolbarRight() {
  const data = require("../../../../../nuclide-commons-ui/ToolbarRight");

  _ToolbarRight = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class ConsoleHeader extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.focusFilter = () => {
      if (this._filterComponent != null) {
        this._filterComponent.focus();
      }
    }, this._handleClearButtonClick = event => {
      this.props.clear();
    }, this._handleCreatePasteButtonClick = event => {
      if (this.props.createPaste != null) {
        this.props.createPaste();
      }
    }, this._handleFilterChange = value => {
      this.props.onFilterChange(value);
    }, this._renderOption = optionProps => {
      const {
        option
      } = optionProps;
      const source = this.props.sources.find(s => s.id === option.value);

      if (!(source != null)) {
        throw new Error("Invariant violation: \"source != null\"");
      }

      const startingSpinner = source.status !== 'starting' ? null : React.createElement(_LoadingSpinner().LoadingSpinner, {
        className: "inline-block console-process-starting-spinner",
        size: "EXTRA_SMALL"
      });
      return React.createElement("span", null, option.label, startingSpinner, this._renderProcessControlButton(source));
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
        throw new Error("Invariant violation: \"action != null\"");
      }

      action();
    };

    return React.createElement(_Button().Button, {
      className: "pull-right console-process-control-button",
      icon: icon,
      onClick: clickHandler
    }, label);
  }

  render() {
    const options = this.props.sources.slice().sort((a, b) => sortAlpha(a.name, b.name)).map(source => ({
      label: source.name,
      value: source.id
    }));
    const sourceButton = options.length === 0 ? null : React.createElement(_ModalMultiSelect().ModalMultiSelect, {
      labelComponent: MultiSelectLabel,
      optionComponent: this._renderOption,
      size: _Button().ButtonSizes.SMALL,
      options: options,
      value: this.props.selectedSourceIds,
      onChange: this.props.onSelectedSourcesChange,
      className: "inline-block"
    });
    const pasteButton = this.props.createPaste == null ? null : React.createElement(_Button().Button, {
      className: "inline-block",
      size: _Button().ButtonSizes.SMALL,
      onClick: this._handleCreatePasteButtonClick // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        title: 'Creates a Paste from the current contents of the console'
      })
    }, "Create Paste");
    return React.createElement(_Toolbar().Toolbar, {
      location: "top"
    }, React.createElement(_ToolbarLeft().ToolbarLeft, null, sourceButton, React.createElement(_RegExpFilter().default, {
      ref: component => this._filterComponent = component,
      value: {
        text: this.props.filterText,
        isRegExp: this.props.enableRegExpFilter,
        invalid: this.props.invalidFilterInput
      },
      onChange: this._handleFilterChange
    })), React.createElement(_ToolbarRight().ToolbarRight, null, pasteButton, React.createElement(_Button().Button, {
      size: _Button().ButtonSizes.SMALL,
      onClick: this._handleClearButtonClick
    }, "Clear")));
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
  const {
    selectedOptions
  } = props;
  const label = selectedOptions.length === 1 ? selectedOptions[0].label : `${selectedOptions.length} Sources`;
  return React.createElement("span", null, "Showing: ", label);
}