'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  CompositeDisposable,
} = require('atom');
var AtomInput = require('nuclide-ui-atom-input');
var React = require('react-for-atom');
var {
  PropTypes,
} = React;

var cx = require('react-classset');
var emptyfunction = require('emptyfunction');

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 * TODO comprehensive Flow typing
 */
var AtomComboBox = React.createClass({

  propTypes: {
    className: PropTypes.string.isRequired,
    intialTextInput: PropTypes.string.isRequired,
    placeholderText: PropTypes.string,
    maxOptionCount: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    /**
     * promise-returning function; Gets called with
     * the current value of the input field as its only argument
     */
    requestOptions: PropTypes.func.isRequired,
  },

  getDefaultProps(): {[key: string]: mixed} {
    return {
      className: '',
      intialTextInput: '',
      placeholderText: null,
      maxOptionCount: 10,
      onSelect: emptyfunction,
    };
  },

  getInitialState(): {[key: string]: mixed} {
    return {
      filteredOptions: [],
      options: [],
      optionsVisible: false,
      selectedIndex: -1,
      textInput: '',
    };
  },

  componentDidMount() {
    this._subscriptions = new CompositeDisposable();
    var node = this.getDOMNode();

    this._subscriptions.add(
      atom.commands.add(node, 'core:move-up', this._handleMoveUp),
      atom.commands.add(node, 'core:move-down', this._handleMoveDown),
      atom.commands.add(node, 'core:cancel', this._handleCancel),
      atom.commands.add(node, 'core:confirm', this._handleConfirm),
      this.refs['freeformInput'].onDidChange(this._handleTextInputChange)
    );
    this.requestUpdate();
  },

  componentWillUnmount() {
    this._subscriptions.dispose();
  },

  requestUpdate() {
    this.props.requestOptions(this.state.textInput).then(this.receiveUpdate);
  },

  receiveUpdate(newOptions) {
    var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
    this.setState({
      options: newOptions,
      filteredOptions: filteredOptions,
    });
  },

  selectValue(newValue: string) {
    this.refs['freeformInput'].setText(newValue);
    this.setState({
      textInput: newValue,
      selectedIndex: -1,
      optionsVisible: false,
    });
    this.props.onSelect(newValue);
  },

  getText(): string {
    return this.refs['freeformInput'].getText();
  },

  // TODO use native (fuzzy/strict - configurable?) filter provider
  _getFilteredOptions(options, filterValue) {
    var lowerCaseState = filterValue.toLowerCase();
    return options
      .map(
        option => {
          var valueLowercase = option.toLowerCase();
          return {
            value: option,
            valueLowercase: valueLowercase,
            matchIndex: valueLowercase.indexOf(lowerCaseState),
          };
        }
      ).filter(
        option => option.matchIndex !== -1
      ).slice(0, this.props.maxOptionCount);
  },

  _handleTextInputChange(): void {
    var newText = this.refs.freeformInput.getText();
    if (newText === this.state.textInput) {
      return;
    }
    this.requestUpdate();
    var filteredOptions = this._getFilteredOptions(this.state.options, newText);
    var selectedIndex;
    if (filteredOptions.length === 0) {
      // If there aren't any options, don't select anything.
      selectedIndex = -1;
    } else if (this.state.selectedIndex === -1 ||
        this.state.selectedIndex >= filteredOptions.length) {
      // If there are options and the selected index is out of bounds,
      // default to the first item.
      selectedIndex = 0;
    } else {
      selectedIndex = this.state.selectedIndex;
    }
    this.setState({
      textInput: newText,
      optionsVisible: true,
      filteredOptions: filteredOptions,
      selectedIndex,
    });
  },

  _handleItemClick(selectedValue: string, event: any) {
    this.selectValue(selectedValue);
  },

  _handleMoveDown(event) {
    this.setState({
      selectedIndex: Math.min(
        this.props.maxOptionCount - 1,
        this.state.selectedIndex + 1,
        this.state.filteredOptions.length - 1
      )
    });
  },

  _handleMoveUp(event) {
    this.setState({
      selectedIndex: Math.max(
        0,
        this.state.selectedIndex - 1
      )
    });
  },

  _handleCancel(event) {
    this.setState({
      optionsVisible: false,
    });
  },

  _handleConfirm() {
    var option = this.state.filteredOptions[this.state.selectedIndex];
    if (option !== undefined) {
      this.selectValue(option.value);
    }
  },

  render(): ReactElement {
    var options = this.state.filteredOptions
      .map((option, i) =>
        {
          var beforeMatch = option.value.substring(0, option.matchIndex);
          var endOfMatchIndex = option.matchIndex + this.state.textInput.length;
          var highlightedMatch = option.value.substring(
            option.matchIndex,
            endOfMatchIndex
          );
          var afterMatch = option.value.substring(
            endOfMatchIndex,
            option.value.length
          );
          return (
            <div
              className={cx({
                'combobox-item': true,
                'combobox-item-selected': i === this.state.selectedIndex,
              })}
              key={option.value}
              onClick={this._handleItemClick.bind(this, option.value)}>
              {beforeMatch}
              <span className="combobox-fuzzy-highlight">{highlightedMatch}</span>
              {afterMatch}
            </div>
          );
        }
      );
    if (!options.length) {
      options.push(
        <div className="combobox-item combobox-item-empty">
          No results found
        </div>
      );
    }
    var optionsContainer = this.state.optionsVisible
      ? (
        <div className="combobox-option-container">
          {options}
        </div>
      )
      : null;
    return (
      <div className={'combobox-combobox ' + this.props.className} onKeyDown={this._handleKeyDown}>
        <AtomInput
          ref="freeformInput"
          initialValue={this.props.intialTextInput}
          placeholderText={this.props.placeholderText}
        />
        {optionsContainer}
      </div>
    );
  },

});

module.exports = AtomComboBox;
