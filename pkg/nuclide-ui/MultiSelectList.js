'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiSelectList = undefined;

var _class, _temp;

var _atom = require('atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let MultiSelectList = exports.MultiSelectList = (_temp = _class = class MultiSelectList extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null
    };
  }

  componentDidMount() {
    this._updateCommands(this.props.commandScope);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.commandScope !== this.props.commandScope) {
      this._updateCommands(this.props.commandScope);
    }
  }

  _updateCommands() {
    if (this._commandsDisposables != null) {
      this._commandsDisposables.dispose();
    }
    const el = this.props.commandScope || _reactForAtom.ReactDOM.findDOMNode(this);
    this._commandsDisposables = new _atom.CompositeDisposable(atom.commands.add(el, {
      'core:move-up': () => {
        this._moveSelectionIndex(-1);
      },
      'core:move-down': () => {
        this._moveSelectionIndex(1);
      },
      'core:confirm': () => {
        const selectedValue = this.state.selectedValue;

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
    return _reactForAtom.React.createElement(
      'div',
      {
        className: 'nuclide-multi-select-list select-list block',
        tabIndex: '0' },
      _reactForAtom.React.createElement(
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
        selected: selected,
        active: active
      });
      return _reactForAtom.React.createElement(
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
        _reactForAtom.React.createElement(OptionComponent, {
          option: option,
          active: active,
          selected: selected
        })
      );
    });
  }

}, _class.defaultProps = {
  onChange: values => {},
  optionComponent: DefaultOptionComponent,
  options: [],
  value: []
}, _temp);


function DefaultOptionComponent(props) {
  return _reactForAtom.React.createElement(
    'span',
    null,
    props.option.label
  );
}