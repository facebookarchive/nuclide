'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiSelectList = undefined;

var _atom = require('atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class MultiSelectList extends _react.Component {

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
    this._commandsDisposables = new _atom.CompositeDisposable(atom.commands.add(
    // $FlowFixMe
    el, {
      'core:move-up': () => {
        this._moveSelectionIndex(-1);
      },
      'core:move-down': () => {
        this._moveSelectionIndex(1);
      },
      'core:confirm': () => {
        const { selectedValue } = this.state;
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
      this.setState({ selectedValue: this.props.options[nextIndex].value });
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
    return _react.createElement(
      'div',
      { className: 'nuclide-multi-select-list select-list block', tabIndex: '0' },
      _react.createElement(
        'ol',
        { className: 'list-group mark-active' },
        this._renderOptions()
      )
    );
  }

  _renderOptions() {
    const OptionComponent = this.props.optionComponent || DefaultOptionComponent;
    return this.props.options.map((option, index) => {
      const selected = this.state.selectedValue === option.value;
      const active = this.props.value.indexOf(option.value) !== -1;
      const className = (0, (_classnames || _load_classnames()).default)({
        clearfix: true,
        selected,
        active
      });
      return _react.createElement(
        'li',
        {
          key: index,
          className: className,
          onMouseOver: () => {
            this.setState({ selectedValue: option.value });
          },
          onClick: () => {
            this._toggleActive(option.value);
          } },
        _react.createElement(OptionComponent, {
          option: option,
          active: active,
          selected: selected
        })
      );
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
  return _react.createElement(
    'span',
    null,
    props.option.label
  );
}