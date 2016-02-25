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

const {CompositeDisposable} = require('atom');
const AtomInput = require('../../atom-input');
const {
  React,
  ReactDOM,
} = require('react-for-atom');

const emptyfunction = require('emptyfunction');

const {PropTypes} = React;

type State = {
  filteredOptions: Array<Object>;
  loadingCount: number;
  options: Array<string>;
  optionsVisible: boolean;
  selectedIndex: number;
  textInput: string;
};

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */
class AtomComboBox extends React.Component {
  state: State;
  _subscriptions: ?CompositeDisposable;

  static propTypes = {
    className: PropTypes.string.isRequired,
    initialTextInput: PropTypes.string,
    loadingMessage: PropTypes.string,
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
  };

  static defaultProps = {
    className: '',
    maxOptionCount: 10,
    onChange: emptyfunction,
    onSelect: emptyfunction,
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      filteredOptions: [],
      loadingCount: 0,
      options: [],
      optionsVisible: false,
      selectedIndex: -1,
      textInput: props.initialTextInput,
    };
    (this: any).receiveUpdate = this.receiveUpdate.bind(this);
    (this: any)._handleTextInputChange = this._handleTextInputChange.bind(this);
    (this: any)._handleInputBlur = this._handleInputBlur.bind(this);
    (this: any)._handleInputFocus = this._handleInputFocus.bind(this);
    (this: any)._handleMoveDown = this._handleMoveDown.bind(this);
    (this: any)._handleMoveUp = this._handleMoveUp.bind(this);
    (this: any)._handleCancel = this._handleCancel.bind(this);
    (this: any)._handleConfirm = this._handleConfirm.bind(this);
    (this: any)._scrollSelectedOptionIntoViewIfNeeded =
      this._scrollSelectedOptionIntoViewIfNeeded.bind(this);
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    const _subscriptions = this._subscriptions = new CompositeDisposable();
    _subscriptions.add(
      atom.commands.add(node, 'core:move-up', this._handleMoveUp),
      atom.commands.add(node, 'core:move-down', this._handleMoveDown),
      atom.commands.add(node, 'core:cancel', this._handleCancel),
      atom.commands.add(node, 'core:confirm', this._handleConfirm),
      this.refs['freeformInput'].onDidChange(this._handleTextInputChange)
    );
    this.requestUpdate();
  }

  componentWillUnmount() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
    }
  }

  requestUpdate() {
    this.setState({loadingCount: this.state.loadingCount + 1});
    this.props.requestOptions(this.state.textInput).then(this.receiveUpdate);
  }

  receiveUpdate(newOptions: Array<string>) {
    const filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
    this.setState({
      loadingCount: this.state.loadingCount -1,
      options: newOptions,
      filteredOptions: filteredOptions,
    });
  }

  selectValue(newValue: string, didRenderCallback?: () => void) {
    this.refs['freeformInput'].setText(newValue);
    this.setState({
      textInput: newValue,
      selectedIndex: -1,
      optionsVisible: false,
    }, didRenderCallback);
    this.props.onSelect(newValue);
    // Selecting a value in the dropdown changes the text as well. Call the callback accordingly.
    this.props.onChange(newValue);
  }

  getText(): string {
    return this.refs['freeformInput'].getText();
  }

  // TODO use native (fuzzy/strict - configurable?) filter provider
  _getFilteredOptions(options: Array<string>, filterValue: string): Array<ComboboxOption> {
    const lowerCaseState = filterValue.toLowerCase();
    return options
      .map(
        option => {
          const valueLowercase = option.toLowerCase();
          return {
            value: option,
            valueLowercase: valueLowercase,
            matchIndex: valueLowercase.indexOf(lowerCaseState),
          };
        }
      ).filter(
        option => option.matchIndex !== -1
      ).slice(0, this.props.maxOptionCount);
  }

  _handleTextInputChange(): void {
    const newText = this.refs.freeformInput.getText();
    if (newText === this.state.textInput) {
      return;
    }
    this.requestUpdate();
    const filteredOptions = this._getFilteredOptions(this.state.options, newText);
    let selectedIndex;
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
  }

  _handleInputFocus(): void {
    this.requestUpdate();
    this.setState({optionsVisible: true});
  }

  _handleInputBlur(): void {
    // Delay hiding the combobox long enough for a click inside the combobox to trigger on it in
    // case the blur was caused by a click inside the combobox. 150ms is empirically long enough to
    // let the stack clear from this blur event and for the click event to trigger.
    setTimeout(this._handleCancel, 150);
  }

  _handleItemClick(selectedValue: string, event: any) {
    this.selectValue(selectedValue, () => {
      // Focus the input again because the click will cause the input to blur. This mimics native
      // <select> behavior by keeping focus in the form being edited.
      const input = ReactDOM.findDOMNode(this.refs['freeformInput']);
      if (input) {
        input.focus();
      }
    });
  }

  _handleMoveDown() {
    this.setState({
      selectedIndex: Math.min(
        this.props.maxOptionCount - 1,
        this.state.selectedIndex + 1,
        this.state.filteredOptions.length - 1,
      ),
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  }

  _handleMoveUp() {
    this.setState({
      selectedIndex: Math.max(
        0,
        this.state.selectedIndex - 1,
      ),
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  }

  _handleCancel() {
    this.setState({
      optionsVisible: false,
    });
  }

  _handleConfirm() {
    const option = this.state.filteredOptions[this.state.selectedIndex];
    if (option !== undefined) {
      this.selectValue(option.value);
    }
  }

  _setSelectedIndex(selectedIndex: number) {
    this.setState({selectedIndex});
  }

  _scrollSelectedOptionIntoViewIfNeeded(): void {
    const selectedOption = ReactDOM.findDOMNode(this.refs['selectedOption']);
    if (selectedOption) {
      selectedOption.scrollIntoViewIfNeeded();
    }
  }

  render(): ReactElement {
    let optionsContainer;
    const options = [];

    if (this.props.loadingMessage && this.state.loadingCount > 0) {
      options.push(
        <li key="loading-text" className="loading">
          <span className="loading-message">{this.props.loadingMessage}</span>
        </li>
      );
    }

    if (this.state.optionsVisible) {
      options.push(...this.state.filteredOptions.map((option, i) => {
        const beforeMatch = option.value.substring(0, option.matchIndex);
        const endOfMatchIndex = option.matchIndex + this.state.textInput.length;
        const highlightedMatch = option.value.substring(
          option.matchIndex,
          endOfMatchIndex
        );
        const afterMatch = option.value.substring(
          endOfMatchIndex,
          option.value.length
        );
        const isSelected = i === this.state.selectedIndex;
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
      }));

      if (!options.length) {
        options.push(
          <li className="text-subtle" key="no-results-found">
            No results found
          </li>
        );
      }

      optionsContainer = (
        <ol className="list-group">
          {options}
        </ol>
      );
    }

    return (
      <div className={'select-list popover-list popover-list-subtle ' + this.props.className}>
        <AtomInput
          initialValue={this.props.initialTextInput}
          onBlur={this._handleInputBlur}
          onFocus={this._handleInputFocus}
          placeholderText={this.props.placeholderText}
          ref="freeformInput"
          size={this.props.size}
        />
        {optionsContainer}
      </div>
    );
  }

}

module.exports = AtomComboBox;
