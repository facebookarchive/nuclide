'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type ComboboxOption = {
  value: string;
  valueLowercase: string;
  matchIndex: number;
};

var {CompositeDisposable} = require('atom');
var AtomInput = require('nuclide-ui-atom-input');
var React = require('react-for-atom');

var emptyfunction = require('emptyfunction');

var {PropTypes} = React;

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
    intialTextInput: PropTypes.string,
    placeholderText: PropTypes.string,
    maxOptionCount: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    /**
     * promise-returning function; Gets called with
     * the current value of the input field as its only argument
     */
    requestOptions: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['xs', 'sm', 'lg']),
  },

  getDefaultProps(): {[key: string]: mixed} {
    return {
      className: '',
      maxOptionCount: 10,
      onChange: emptyfunction,
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

  receiveUpdate(newOptions: Array<string>) {
    var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
    this.setState({
      options: newOptions,
      filteredOptions: filteredOptions,
    });
  },

  selectValue(newValue: string, didRenderCallback?: () => mixed) {
    this.refs['freeformInput'].setText(newValue);
    this.setState({
      textInput: newValue,
      selectedIndex: -1,
      optionsVisible: false,
    }, didRenderCallback);
    this.props.onSelect(newValue);
  },

  getText(): string {
    return this.refs['freeformInput'].getText();
  },

  // TODO use native (fuzzy/strict - configurable?) filter provider
  _getFilteredOptions(options: Array<string>, filterValue: string): Array<ComboboxOption> {
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
    this.props.onChange(newText);
  },

  _handleInputBlur(): void {
    // Delay hiding the combobox long enough for a click inside the combobox to trigger on it in
    // case the blur was caused by a click inside the combobox. 150ms is empirically long enough to
    // let the stack clear from this blur event and for the click event to trigger.
    setTimeout(this._handleCancel, 150);
  },

  _handleItemClick(selectedValue: string, event: any) {
    this.selectValue(selectedValue, () => {
      // Focus the input again because the click will cause the input to blur. This mimics native
      // <select> behavior by keeping focus in the form being edited.
      var input = React.findDOMNode(this.refs['freeformInput']);
      if (input) {
        input.focus();
      }
    });
  },

  _handleMoveDown() {
    this.setState({
      selectedIndex: Math.min(
        this.props.maxOptionCount - 1,
        this.state.selectedIndex + 1,
        this.state.filteredOptions.length - 1
      )
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  },

  _handleMoveUp() {
    this.setState({
      selectedIndex: Math.max(
        0,
        this.state.selectedIndex - 1
      )
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  },

  _handleCancel() {
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

  _setSelectedIndex(selectedIndex: number) {
    this.setState({selectedIndex});
  },

  _scrollSelectedOptionIntoViewIfNeeded(): void {
    var selectedOption = React.findDOMNode(this.refs['selectedOption']);
    if (selectedOption) {
      selectedOption.scrollIntoViewIfNeeded();
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
          var isSelected = i === this.state.selectedIndex;
          return (
            <li
              className={isSelected ? 'selected' : null}
              key={option.value}
              onClick={this._handleItemClick.bind(this, option.value)}
              onMouseOver={this._setSelectedIndex.bind(this, i)}
              ref={isSelected ? 'selectedOption' : null}>
              {beforeMatch}
              <strong className="text-highlight">{highlightedMatch}</strong>
              {afterMatch}
            </li>
          );
        }
      );
    if (!options.length) {
      options.push(
        <li className="text-subtle" key="no-results-found">
          No results found
        </li>
      );
    }

    var optionsContainer;
    if (this.state.optionsVisible) {
      optionsContainer = (
        <ol className="list-group">
          {options}
        </ol>
      );
    }

    return (
      <div className={'select-list popover-list popover-list-subtle ' + this.props.className}>
        <AtomInput
          initialValue={this.props.intialTextInput}
          onBlur={this._handleInputBlur}
          placeholderText={this.props.placeholderText}
          ref="freeformInput"
          size={this.props.size}
        />
        {optionsContainer}
      </div>
    );
  },

});

module.exports = AtomComboBox;
