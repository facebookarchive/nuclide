"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiSelectList = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class MultiSelectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null
    };
  }

  componentDidMount() {
    this._updateCommands();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.commandScope !== this.props.commandScope) {
      this._updateCommands();
    }
  }

  _updateCommands() {
    if (this._commandsDisposables != null) {
      this._commandsDisposables.dispose();
    }

    const el = this.props.commandScope || _reactDom.default.findDOMNode(this);

    this._commandsDisposables = new (_UniversalDisposable().default)(atom.commands.add( // $FlowFixMe
    el, {
      'core:move-up': () => {
        this._moveSelectionIndex(-1);
      },
      'core:move-down': () => {
        this._moveSelectionIndex(1);
      },
      'core:confirm': () => {
        const {
          selectedValue
        } = this.state;

        if (selectedValue != null) {
          this._toggleActive(selectedValue);
        }
      }
    }));
  }

  _moveSelectionIndex(delta) {
    const currentIndex = this.props.options.findIndex(option => option.value === this.state.selectedValue);
    const nextIndex = currentIndex + delta;

    if (nextIndex >= 0 && nextIndex < this.props.options.length) {
      this.setState({
        selectedValue: this.props.options[nextIndex].value
      });
    }
  }

  componentWillUnmount() {
    if (this._commandsDisposables != null) {
      this._commandsDisposables.dispose();
    }
  }

  _toggleActive(value) {
    const activeValues = this.props.value.slice();
    const index = activeValues.indexOf(value);

    if (index === -1) {
      activeValues.push(value);
    } else {
      activeValues.splice(index, 1);
    }

    this.props.onChange(activeValues);
  }

  render() {
    return React.createElement("div", {
      className: "nuclide-multi-select-list select-list block",
      tabIndex: "0"
    }, React.createElement("ol", {
      className: "list-group mark-active"
    }, this._renderOptions()));
  }

  _renderOptions() {
    const OptionComponent = this.props.optionComponent || DefaultOptionComponent;
    return this.props.options.map((option, index) => {
      const selected = this.state.selectedValue === option.value;
      const active = this.props.value.indexOf(option.value) !== -1;
      const className = (0, _classnames().default)({
        clearfix: true,
        selected,
        active
      });
      return React.createElement("li", {
        key: index,
        className: className,
        onMouseOver: () => {
          this.setState({
            selectedValue: option.value
          });
        },
        onClick: () => {
          this._toggleActive(option.value);
        }
      }, React.createElement(OptionComponent, {
        option: option,
        active: active,
        selected: selected
      }));
    });
  }

}

exports.MultiSelectList = MultiSelectList;
MultiSelectList.defaultProps = {
  onChange: values => {},
  optionComponent: DefaultOptionComponent,
  options: [],
  value: []
};

function DefaultOptionComponent(props) {
  return React.createElement("span", null, props.option.label);
}