"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Combobox = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _AtomInput() {
  const data = require("../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _scrollIntoView() {
  const data = require("../../modules/nuclide-commons-ui/scrollIntoView");

  _scrollIntoView = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */
class Combobox extends React.Component {
  constructor(props) {
    super(props);

    this.receiveUpdate = newOptions => {
      const filteredOptions = this._getFilteredOptions(newOptions, // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.state.textInput);

      this.setState({
        error: null,
        options: newOptions,
        filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
    };

    this._handleTextInputChange = () => {
      const newText = (0, _nullthrows().default)(this._freeformInput).getText();

      if (newText === this.state.textInput) {
        return;
      }

      this.requestUpdate(newText);

      const filteredOptions = this._getFilteredOptions( // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.state.options, newText);

      this.setState({
        textInput: newText,
        optionsVisible: true,
        filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
      this.props.onChange(newText);
    };

    this._handleInputFocus = () => {
      this.requestUpdate(this.state.textInput); // $FlowFixMe

      const boundingRect = _reactDom.default.findDOMNode(this).getBoundingClientRect();

      this.setState({
        optionsVisible: true,
        optionsRect: {
          top: boundingRect.bottom,
          left: boundingRect.left,
          width: boundingRect.width
        }
      });
    };

    this._handleInputBlur = event => {
      this._handleCancel();

      const {
        onBlur
      } = this.props;

      if (onBlur != null) {
        onBlur(this.getText());
      }
    };

    this._handleInputClick = () => {
      this.setState({
        optionsVisible: true
      });
    };

    this._handleMoveDown = () => {
      // show the options but don't move the index
      if (!this.state.optionsVisible) {
        this.setState({
          optionsVisible: true
        }, this._scrollSelectedOptionIntoViewIfNeeded);
        return;
      }

      this.setState({
        selectedIndex: Math.min(this.props.maxOptionCount - 1, // TODO: (wbinnssmith) T30771435 this setState depends on current state
        // and should use an updater function rather than an object

        /* eslint-disable react/no-access-state-in-setstate */
        this.state.selectedIndex + 1, this.state.filteredOptions.length - 1
        /* eslint-enable react/no-access-state-in-setstate */
        )
      }, this._scrollSelectedOptionIntoViewIfNeeded);
    };

    this._handleMoveUp = () => {
      this.setState({
        // TODO: (wbinnssmith) T30771435 this setState depends on current state
        // and should use an updater function rather than an object
        // eslint-disable-next-line react/no-access-state-in-setstate
        selectedIndex: Math.max(0, this.state.selectedIndex - 1)
      }, this._scrollSelectedOptionIntoViewIfNeeded);
    };

    this._handleCancel = () => {
      this.setState({
        optionsVisible: false
      });
    };

    this._handleConfirm = () => {
      const option = this.state.filteredOptions[this.state.selectedIndex];

      if (option !== undefined) {
        this.selectValue(option);
      }
    };

    this._scrollSelectedOptionIntoViewIfNeeded = () => {
      if (this._selectedOption != null) {
        (0, _scrollIntoView().scrollIntoViewIfNeeded)(this._selectedOption);
      }
    };

    this._handleSelectedOption = el => {
      this._selectedOption = el;
    };

    this._subscriptions = new (_UniversalDisposable().default)();
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
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);

    this._subscriptions.add( // $FlowFixMe
    atom.commands.add(node, 'core:move-up', this._handleMoveUp), // $FlowFixMe
    atom.commands.add(node, 'core:move-down', this._handleMoveDown));
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

    this.setState({
      error: null,
      loadingOptions: true
    });
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
    }, () => this.setState({
      loadingOptions: false
    }));
  }

  selectValue(newValue, didRenderCallback) {
    (0, _nullthrows().default)(this._freeformInput).setText(newValue);
    this.setState({
      textInput: newValue,
      selectedIndex: -1,
      optionsVisible: false
    }, didRenderCallback);
    this.props.onSelect(newValue); // Selecting a value in the dropdown changes the text as well. Call the callback accordingly.

    this.props.onChange(newValue);
  }

  getText() {
    return (0, _nullthrows().default)(this._freeformInput).getText();
  }

  focus() {
    (0, _nullthrows().default)(this._freeformInput).focus();
  }

  scrollToEnd() {
    (0, _nullthrows().default)(this._freeformInput).getTextEditor().moveToEndOfLine();
  }

  _getFilteredOptions(options, filterValue) {
    if (this.props.filterOptions != null) {
      return this.props.filterOptions(options, filterValue).slice(0, this.props.maxOptionCount);
    }

    const lowerCaseState = filterValue.toLowerCase();
    return options.map(option => {
      const valueLowercase = option.toLowerCase();
      return {
        value: option,
        matchIndex: valueLowercase.indexOf(lowerCaseState)
      };
    }).filter(option => option.matchIndex !== -1).sort((a, b) => {
      // We prefer lower match indices
      const indexDiff = a.matchIndex - b.matchIndex;

      if (indexDiff !== 0) {
        return indexDiff;
      } // Then we prefer smaller options, thus close to the input


      return a.value.length - b.value.length;
    }).map(option => option.value).slice(0, this.props.maxOptionCount);
  }

  _getOptionsElement() {
    if (this._optionsElement == null) {
      const workspaceElement = document.body;

      if (!(workspaceElement != null)) {
        throw new Error("Invariant violation: \"workspaceElement != null\"");
      }

      this._optionsElement = document.createElement('div');
      workspaceElement.appendChild(this._optionsElement);

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

  _handleItemClick(selectedValue, event) {
    this.selectValue(selectedValue, () => {
      // Focus the input again because the click will cause the input to blur. This mimics native
      // <select> behavior by keeping focus in the form being edited.
      const input = _reactDom.default.findDOMNode(this._freeformInput);

      if (input) {
        // $FlowFixMe
        input.focus(); // Focusing usually shows the options, so hide them immediately.

        setImmediate(() => this.setState({
          optionsVisible: false
        }));
      }
    });
  }

  _setSelectedIndex(selectedIndex) {
    this.setState({
      selectedIndex
    });
  }

  render() {
    let optionsContainer;
    const options = []; // flowlint-next-line sketchy-null-string:off

    if (this.props.loadingMessage && this.state.loadingOptions) {
      options.push(React.createElement("li", {
        key: "loading-text",
        className: "loading"
      }, React.createElement("span", {
        className: "loading-message"
      }, this.props.loadingMessage)));
    }

    if (this.state.error != null && this.props.formatRequestOptionsErrorMessage != null) {
      const message = this.props.formatRequestOptionsErrorMessage(this.state.error);
      options.push(React.createElement("li", {
        key: "text-error",
        className: "text-error"
      }, message));
    }

    if (this.state.optionsVisible) {
      const lowerCaseState = this.state.textInput.toLowerCase();
      options.push(...this.state.filteredOptions.map((option, i) => {
        const matchIndex = option.toLowerCase().indexOf(lowerCaseState);
        let beforeMatch;
        let highlightedMatch;
        let afterMatch;

        if (matchIndex >= 0) {
          beforeMatch = option.substring(0, matchIndex);
          const endOfMatchIndex = matchIndex + this.state.textInput.length;
          highlightedMatch = option.substring(matchIndex, endOfMatchIndex);
          afterMatch = option.substring(endOfMatchIndex, option.length);
        } else {
          beforeMatch = option;
        }

        const isSelected = i === this.state.selectedIndex;
        return React.createElement("li", {
          className: isSelected ? 'selected' : null,
          key: 'option-' + option,
          onMouseDown: e => {
            // Prevent the input's blur event from firing.
            e.preventDefault();
          },
          onClick: this._handleItemClick.bind(this, option),
          onMouseOver: this._setSelectedIndex.bind(this, i) // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
          ,
          ref: isSelected ? this._handleSelectedOption : null
        }, beforeMatch, React.createElement("strong", {
          className: "text-highlight"
        }, highlightedMatch), afterMatch);
      }));

      if (!options.length) {
        options.push(React.createElement("li", {
          className: "text-subtle",
          key: "no-results-found"
        }, "No results found"));
      }

      const rect = this.state.optionsRect || {
        left: 0,
        top: 0,
        width: 300
      };
      optionsContainer = _reactDom.default.createPortal(React.createElement("div", {
        className: "nuclide-combobox-options",
        style: rect
      }, React.createElement("div", {
        className: "select-list"
      }, React.createElement("ol", {
        className: "nuclide-combobox-list-group list-group"
      }, options))), this._getOptionsElement());
    }

    const {
      initialTextInput,
      placeholderText,
      size,
      width
    } = this.props;
    const wrapperStyle = {
      width: width == null ? undefined : `${width}px`
    };
    return React.createElement("div", {
      className: 'select-list popover-list popover-list-subtle ' + this.props.className,
      style: wrapperStyle,
      title: this._freeformInput != null ? this.getText() : ''
    }, React.createElement(_AtomInput().AtomInput, {
      initialValue: initialTextInput,
      onBlur: this._handleInputBlur,
      onClick: this._handleInputClick,
      onFocus: this._handleInputFocus,
      onConfirm: this._handleConfirm,
      onCancel: this._handleCancel,
      onDidChange: this._handleTextInputChange,
      placeholderText: placeholderText,
      ref: input => {
        this._freeformInput = input;
      },
      size: size,
      width: width,
      disabled: this.props.disabled
    }), optionsContainer);
  }

}

exports.Combobox = Combobox;
Combobox.defaultProps = {
  className: '',
  maxOptionCount: 10,
  onChange: newValue => {},
  onSelect: newValue => {},
  width: 200,
  disabled: false
};