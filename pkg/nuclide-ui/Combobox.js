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
exports.Combobox = undefined;

var _class, _temp;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('./AtomInput');
}

var _Portal;

function _load_Portal() {
  return _Portal = require('./Portal');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */
let Combobox = exports.Combobox = (_temp = _class = class Combobox extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      error: null,
      filteredOptions: [],
      loadingOptions: false,
      options: [],
      optionsRect: null,
      optionsVisible: false,
      selectedIndex: -1,
      textInput: props.initialTextInput
    };
    this.receiveUpdate = this.receiveUpdate.bind(this);
    this._handleTextInputChange = this._handleTextInputChange.bind(this);
    this._handleInputBlur = this._handleInputBlur.bind(this);
    this._handleInputFocus = this._handleInputFocus.bind(this);
    this._handleMoveDown = this._handleMoveDown.bind(this);
    this._handleMoveUp = this._handleMoveUp.bind(this);
    this._handleCancel = this._handleCancel.bind(this);
    this._handleConfirm = this._handleConfirm.bind(this);
    this._scrollSelectedOptionIntoViewIfNeeded = this._scrollSelectedOptionIntoViewIfNeeded.bind(this);
  }

  componentDidMount() {
    const node = _reactForAtom.ReactDOM.findDOMNode(this);
    this._subscriptions.add(atom.commands.add(node, 'core:move-up', this._handleMoveUp), atom.commands.add(node, 'core:move-down', this._handleMoveDown), atom.commands.add(node, 'core:cancel', this._handleCancel), atom.commands.add(node, 'core:confirm', this._handleConfirm), this.refs.freeformInput.onDidChange(this._handleTextInputChange));
    this.requestUpdate(this.state.textInput);
  }

  componentWillUnmount() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
    }
    if (this._updateSubscription != null) {
      this._updateSubscription.unsubscribe();
    }
  }

  requestUpdate(textInput) {
    // Cancel pending update.
    if (this._updateSubscription != null) {
      this._updateSubscription.unsubscribe();
    }

    this.setState({ error: null, loadingOptions: true });

    this._updateSubscription = this.props.requestOptions(textInput).subscribe(options => this.receiveUpdate(options), err => {
      this.setState({
        error: err,
        loadingOptions: false,
        options: [],
        filteredOptions: []
      });
      if (this.props.onRequestOptionsError != null) {
        this.props.onRequestOptionsError(err);
      }
    }, () => this.setState({ loadingOptions: false }));
  }

  receiveUpdate(newOptions) {
    const filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
    this.setState({
      error: null,
      options: newOptions,
      filteredOptions: filteredOptions,
      selectedIndex: this._getNewSelectedIndex(filteredOptions)
    });
  }

  selectValue(newValue, didRenderCallback) {
    this.refs.freeformInput.setText(newValue);
    this.setState({
      textInput: newValue,
      selectedIndex: -1,
      optionsVisible: false
    }, didRenderCallback);
    this.props.onSelect(newValue);
    // Selecting a value in the dropdown changes the text as well. Call the callback accordingly.
    this.props.onChange(newValue);
  }

  getText() {
    return this.refs.freeformInput.getText();
  }

  // TODO use native (fuzzy/strict - configurable?) filter provider
  _getFilteredOptions(options, filterValue) {
    const lowerCaseState = filterValue.toLowerCase();
    return options.map(option => {
      const valueLowercase = option.toLowerCase();
      return {
        value: option,
        valueLowercase: valueLowercase,
        matchIndex: valueLowercase.indexOf(lowerCaseState)
      };
    }).filter(option => option.matchIndex !== -1).sort((a, b) => {
      // We prefer lower match indices
      const indexDiff = a.matchIndex - b.matchIndex;
      if (indexDiff !== 0) {
        return indexDiff;
      }
      // Then we prefer smaller options, thus close to the input
      return a.value.length - b.value.length;
    }).slice(0, this.props.maxOptionCount);
  }

  _getOptionsElement() {
    if (this._optionsElement == null) {
      this._optionsElement = document.createElement('div');
      document.body.appendChild(this._optionsElement);
      this._subscriptions.add(() => {
        this._optionsElement.remove();
      });
    }
    return this._optionsElement;
  }

  _getNewSelectedIndex(filteredOptions) {
    if (filteredOptions.length === 0) {
      // If there aren't any options, don't select anything.
      return -1;
    } else if (this.state.selectedIndex === -1 || this.state.selectedIndex >= filteredOptions.length) {
      // If there are options and the selected index is out of bounds,
      // default to the first item.
      return 0;
    }
    return this.state.selectedIndex;
  }

  _handleTextInputChange() {
    const newText = this.refs.freeformInput.getText();
    if (newText === this.state.textInput) {
      return;
    }
    this.requestUpdate(newText);
    const filteredOptions = this._getFilteredOptions(this.state.options, newText);
    this.setState({
      textInput: newText,
      optionsVisible: true,
      filteredOptions: filteredOptions,
      selectedIndex: this._getNewSelectedIndex(filteredOptions)
    });
    this.props.onChange(newText);
  }

  _handleInputFocus() {
    this.requestUpdate(this.state.textInput);
    const boundingRect = _reactForAtom.ReactDOM.findDOMNode(this).getBoundingClientRect();
    this.setState({
      optionsVisible: true,
      optionsRect: {
        top: boundingRect.bottom,
        left: boundingRect.left,
        width: boundingRect.width
      }
    });
  }

  _handleInputBlur() {
    // Delay hiding the combobox long enough for a click inside the combobox to trigger on it in
    // case the blur was caused by a click inside the combobox. 150ms is empirically long enough to
    // let the stack clear from this blur event and for the click event to trigger.
    setTimeout(this._handleCancel, 150);
    const onBlur = this.props.onBlur;

    if (onBlur != null) {
      onBlur(this.getText());
    }
  }

  _handleItemClick(selectedValue, event) {
    this.selectValue(selectedValue, () => {
      // Focus the input again because the click will cause the input to blur. This mimics native
      // <select> behavior by keeping focus in the form being edited.
      const input = _reactForAtom.ReactDOM.findDOMNode(this.refs.freeformInput);
      if (input) {
        input.focus();
      }
    });
  }

  _handleMoveDown() {
    this.setState({
      selectedIndex: Math.min(this.props.maxOptionCount - 1, this.state.selectedIndex + 1, this.state.filteredOptions.length - 1)
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  }

  _handleMoveUp() {
    this.setState({
      selectedIndex: Math.max(0, this.state.selectedIndex - 1)
    }, this._scrollSelectedOptionIntoViewIfNeeded);
  }

  _handleCancel() {
    this.setState({
      optionsVisible: false
    });
  }

  _handleConfirm() {
    const option = this.state.filteredOptions[this.state.selectedIndex];
    if (option !== undefined) {
      this.selectValue(option.value);
    }
  }

  _setSelectedIndex(selectedIndex) {
    this.setState({ selectedIndex: selectedIndex });
  }

  _scrollSelectedOptionIntoViewIfNeeded() {
    const selectedOption = _reactForAtom.ReactDOM.findDOMNode(this.refs.selectedOption);
    if (selectedOption) {
      selectedOption.scrollIntoViewIfNeeded();
    }
  }

  render() {
    let optionsContainer;
    const options = [];

    if (this.props.loadingMessage && this.state.loadingOptions) {
      options.push(_reactForAtom.React.createElement(
        'li',
        { key: 'loading-text', className: 'loading' },
        _reactForAtom.React.createElement(
          'span',
          { className: 'loading-message' },
          this.props.loadingMessage
        )
      ));
    }

    if (this.state.error != null && this.props.formatRequestOptionsErrorMessage != null) {
      const message = this.props.formatRequestOptionsErrorMessage(this.state.error);
      options.push(_reactForAtom.React.createElement(
        'li',
        { key: 'text-error', className: 'text-error' },
        message
      ));
    }

    if (this.state.optionsVisible) {
      options.push(...this.state.filteredOptions.map((option, i) => {
        const beforeMatch = option.value.substring(0, option.matchIndex);
        const endOfMatchIndex = option.matchIndex + this.state.textInput.length;
        const highlightedMatch = option.value.substring(option.matchIndex, endOfMatchIndex);
        const afterMatch = option.value.substring(endOfMatchIndex, option.value.length);
        const isSelected = i === this.state.selectedIndex;
        return _reactForAtom.React.createElement(
          'li',
          {
            className: isSelected ? 'selected' : null,
            key: 'option-' + option.value,
            onClick: this._handleItemClick.bind(this, option.value),
            onMouseOver: this._setSelectedIndex.bind(this, i),
            ref: isSelected ? 'selectedOption' : null },
          beforeMatch,
          _reactForAtom.React.createElement(
            'strong',
            { className: 'text-highlight' },
            highlightedMatch
          ),
          afterMatch
        );
      }));

      if (!options.length) {
        options.push(_reactForAtom.React.createElement(
          'li',
          { className: 'text-subtle', key: 'no-results-found' },
          'No results found'
        ));
      }

      const rect = this.state.optionsRect || { left: 0, top: 0, width: 300 };

      optionsContainer = _reactForAtom.React.createElement(
        (_Portal || _load_Portal()).Portal,
        { container: this._getOptionsElement() },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-combobox-options', style: rect },
          _reactForAtom.React.createElement(
            'div',
            { className: 'select-list' },
            _reactForAtom.React.createElement(
              'ol',
              { className: 'nuclide-combobox-list-group list-group' },
              options
            )
          )
        )
      );
    }

    var _props = this.props;
    const initialTextInput = _props.initialTextInput,
          placeholderText = _props.placeholderText,
          size = _props.size,
          width = _props.width;

    const wrapperStyle = {
      width: width == null ? undefined : `${ width }px`
    };
    return _reactForAtom.React.createElement(
      'div',
      { className: 'select-list popover-list popover-list-subtle ' + this.props.className,
        style: wrapperStyle },
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: initialTextInput,
        onBlur: this._handleInputBlur,
        onFocus: this._handleInputFocus,
        placeholderText: placeholderText,
        ref: 'freeformInput',
        size: size,
        width: width
      }),
      optionsContainer
    );
  }

}, _class.defaultProps = {
  className: '',
  maxOptionCount: 10,
  onChange: newValue => {},
  onSelect: newValue => {},
  width: 200
}, _temp);