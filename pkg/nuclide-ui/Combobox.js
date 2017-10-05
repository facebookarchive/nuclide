'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Combobox = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Portal;

function _load_Portal() {
  return _Portal = require('./Portal');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _scrollIntoView;

function _load_scrollIntoView() {
  return _scrollIntoView = require('nuclide-commons-ui/scrollIntoView');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */
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

/* globals Element */

class Combobox extends _react.Component {

  constructor(props) {
    super(props);

    this.receiveUpdate = newOptions => {
      const filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
      this.setState({
        error: null,
        options: newOptions,
        filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
    };

    this._handleTextInputChange = () => {
      const newText = this.refs.freeformInput.getText();
      if (newText === this.state.textInput) {
        return;
      }
      this.requestUpdate(newText);
      const filteredOptions = this._getFilteredOptions(this.state.options, newText);
      this.setState({
        textInput: newText,
        optionsVisible: true,
        filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
      this.props.onChange(newText);
    };

    this._handleInputFocus = () => {
      this.requestUpdate(this.state.textInput);
      // $FlowFixMe
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
      const { relatedTarget } = event;
      if (relatedTarget == null ||
      // TODO(hansonw): Move this check inside AtomInput.
      // See https://github.com/atom/atom/blob/master/src/text-editor-element.coffee#L145
      relatedTarget.tagName === 'INPUT' && relatedTarget.classList.contains('hidden-input') ||
      // Selecting a menu item registers on the portal container.
      relatedTarget === this._getOptionsElement().parentNode) {
        return;
      }
      this._handleCancel();
      const { onBlur } = this.props;
      if (onBlur != null) {
        onBlur(this.getText());
      }
    };

    this._handleInputClick = () => {
      this.setState({ optionsVisible: true });
    };

    this._handleMoveDown = () => {
      // show the options but don't move the index
      if (!this.state.optionsVisible) {
        this.setState({ optionsVisible: true }, this._scrollSelectedOptionIntoViewIfNeeded);
        return;
      }

      this.setState({
        selectedIndex: Math.min(this.props.maxOptionCount - 1, this.state.selectedIndex + 1, this.state.filteredOptions.length - 1)
      }, this._scrollSelectedOptionIntoViewIfNeeded);
    };

    this._handleMoveUp = () => {
      this.setState({
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
      const selectedOption = _reactDom.default.findDOMNode(this.refs.selectedOption);
      if (selectedOption instanceof Element) {
        (0, (_scrollIntoView || _load_scrollIntoView()).scrollIntoViewIfNeeded)(selectedOption);
      }
    };

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
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);
    this._subscriptions.add(
    // $FlowFixMe
    atom.commands.add(node, 'core:move-up', this._handleMoveUp),
    // $FlowFixMe
    atom.commands.add(node, 'core:move-down', this._handleMoveDown),
    // $FlowFixMe
    atom.commands.add(node, 'core:cancel', this._handleCancel),
    // $FlowFixMe
    atom.commands.add(node, 'core:confirm', this._handleConfirm), this.refs.freeformInput.onDidChange(this._handleTextInputChange));
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

  focus(showOptions) {
    this.refs.freeformInput.focus();
    this.setState({ optionsVisible: showOptions });
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
      }
      // Then we prefer smaller options, thus close to the input
      return a.value.length - b.value.length;
    }).map(option => option.value).slice(0, this.props.maxOptionCount);
  }

  _getOptionsElement() {
    if (this._optionsElement == null) {
      const workspaceElement = atom.views.getView(atom.workspace);

      if (!(workspaceElement != null)) {
        throw new Error('Invariant violation: "workspaceElement != null"');
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
      const input = _reactDom.default.findDOMNode(this.refs.freeformInput);
      if (input) {
        // $FlowFixMe
        input.focus();
        // Focusing usually shows the options, so hide them immediately.
        setImmediate(() => this.setState({ optionsVisible: false }));
      }
    });
  }

  _setSelectedIndex(selectedIndex) {
    this.setState({ selectedIndex });
  }

  render() {
    let optionsContainer;
    const options = [];

    // flowlint-next-line sketchy-null-string:off
    if (this.props.loadingMessage && this.state.loadingOptions) {
      options.push(_react.createElement(
        'li',
        { key: 'loading-text', className: 'loading' },
        _react.createElement(
          'span',
          { className: 'loading-message' },
          this.props.loadingMessage
        )
      ));
    }

    if (this.state.error != null && this.props.formatRequestOptionsErrorMessage != null) {
      const message = this.props.formatRequestOptionsErrorMessage(this.state.error);
      options.push(_react.createElement(
        'li',
        { key: 'text-error', className: 'text-error' },
        message
      ));
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
        return _react.createElement(
          'li',
          {
            className: isSelected ? 'selected' : null,
            key: 'option-' + option,
            onClick: this._handleItemClick.bind(this, option),
            onMouseOver: this._setSelectedIndex.bind(this, i),
            ref: isSelected ? 'selectedOption' : null },
          beforeMatch,
          _react.createElement(
            'strong',
            { className: 'text-highlight' },
            highlightedMatch
          ),
          afterMatch
        );
      }));

      if (!options.length) {
        options.push(_react.createElement(
          'li',
          { className: 'text-subtle', key: 'no-results-found' },
          'No results found'
        ));
      }

      const rect = this.state.optionsRect || { left: 0, top: 0, width: 300 };

      optionsContainer = _react.createElement(
        (_Portal || _load_Portal()).Portal,
        { container: this._getOptionsElement() },
        _react.createElement(
          'div',
          { className: 'nuclide-combobox-options', style: rect },
          _react.createElement(
            'div',
            { className: 'select-list' },
            _react.createElement(
              'ol',
              { className: 'nuclide-combobox-list-group list-group' },
              options
            )
          )
        )
      );
    }

    const { initialTextInput, placeholderText, size, width } = this.props;
    const wrapperStyle = {
      width: width == null ? undefined : `${width}px`
    };
    return _react.createElement(
      'div',
      {
        className: 'select-list popover-list popover-list-subtle ' + this.props.className,
        style: wrapperStyle },
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: initialTextInput,
        onBlur: this._handleInputBlur,
        onClick: this._handleInputClick,
        onFocus: this._handleInputFocus,
        placeholderText: placeholderText,
        ref: 'freeformInput',
        size: size,
        width: width,
        disabled: this.props.disabled
      }),
      optionsContainer
    );
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