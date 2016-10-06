Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _AtomInput2;

function _AtomInput() {
  return _AtomInput2 = require('./AtomInput');
}

var _Portal2;

function _Portal() {
  return _Portal2 = require('./Portal');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */

var Combobox = (function (_React$Component) {
  _inherits(Combobox, _React$Component);

  _createClass(Combobox, null, [{
    key: 'defaultProps',
    value: {
      className: '',
      maxOptionCount: 10,
      onChange: function onChange(newValue) {},
      onSelect: function onSelect(newValue) {},
      width: 200
    },
    enumerable: true
  }]);

  function Combobox(props) {
    _classCallCheck(this, Combobox);

    _get(Object.getPrototypeOf(Combobox.prototype), 'constructor', this).call(this, props);
    this._subscriptions = new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default();
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

  _createClass(Combobox, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var node = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      this._subscriptions.add(atom.commands.add(node, 'core:move-up', this._handleMoveUp), atom.commands.add(node, 'core:move-down', this._handleMoveDown), atom.commands.add(node, 'core:cancel', this._handleCancel), atom.commands.add(node, 'core:confirm', this._handleConfirm), this.refs.freeformInput.onDidChange(this._handleTextInputChange));
      this.requestUpdate(this.state.textInput);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
      }
      if (this._updateSubscription != null) {
        this._updateSubscription.unsubscribe();
      }
    }
  }, {
    key: 'requestUpdate',
    value: function requestUpdate(textInput) {
      var _this = this;

      // Cancel pending update.
      if (this._updateSubscription != null) {
        this._updateSubscription.unsubscribe();
      }

      this.setState({ error: null, loadingOptions: true });

      this._updateSubscription = this.props.requestOptions(textInput).subscribe(function (options) {
        return _this.receiveUpdate(options);
      }, function (err) {
        _this.setState({
          error: err,
          loadingOptions: false,
          options: [],
          filteredOptions: []
        });
        if (_this.props.onRequestOptionsError != null) {
          _this.props.onRequestOptionsError(err);
        }
      }, function () {
        return _this.setState({ loadingOptions: false });
      });
    }
  }, {
    key: 'receiveUpdate',
    value: function receiveUpdate(newOptions) {
      var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
      this.setState({
        error: null,
        options: newOptions,
        filteredOptions: filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
    }
  }, {
    key: 'selectValue',
    value: function selectValue(newValue, didRenderCallback) {
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
  }, {
    key: 'getText',
    value: function getText() {
      return this.refs.freeformInput.getText();
    }

    // TODO use native (fuzzy/strict - configurable?) filter provider
  }, {
    key: '_getFilteredOptions',
    value: function _getFilteredOptions(options, filterValue) {
      var lowerCaseState = filterValue.toLowerCase();
      return options.map(function (option) {
        var valueLowercase = option.toLowerCase();
        return {
          value: option,
          valueLowercase: valueLowercase,
          matchIndex: valueLowercase.indexOf(lowerCaseState)
        };
      }).filter(function (option) {
        return option.matchIndex !== -1;
      }).slice(0, this.props.maxOptionCount);
    }
  }, {
    key: '_getOptionsElement',
    value: function _getOptionsElement() {
      var _this2 = this;

      if (this._optionsElement == null) {
        this._optionsElement = document.createElement('div');
        document.body.appendChild(this._optionsElement);
        this._subscriptions.add(function () {
          _this2._optionsElement.remove();
        });
      }
      return this._optionsElement;
    }
  }, {
    key: '_getNewSelectedIndex',
    value: function _getNewSelectedIndex(filteredOptions) {
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
  }, {
    key: '_handleTextInputChange',
    value: function _handleTextInputChange() {
      var newText = this.refs.freeformInput.getText();
      if (newText === this.state.textInput) {
        return;
      }
      this.requestUpdate(newText);
      var filteredOptions = this._getFilteredOptions(this.state.options, newText);
      this.setState({
        textInput: newText,
        optionsVisible: true,
        filteredOptions: filteredOptions,
        selectedIndex: this._getNewSelectedIndex(filteredOptions)
      });
      this.props.onChange(newText);
    }
  }, {
    key: '_handleInputFocus',
    value: function _handleInputFocus() {
      this.requestUpdate(this.state.textInput);
      var boundingRect = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this).getBoundingClientRect();
      this.setState({
        optionsVisible: true,
        optionsRect: {
          top: boundingRect.bottom,
          left: boundingRect.left,
          width: boundingRect.width
        }
      });
    }
  }, {
    key: '_handleInputBlur',
    value: function _handleInputBlur() {
      // Delay hiding the combobox long enough for a click inside the combobox to trigger on it in
      // case the blur was caused by a click inside the combobox. 150ms is empirically long enough to
      // let the stack clear from this blur event and for the click event to trigger.
      setTimeout(this._handleCancel, 150);
      var onBlur = this.props.onBlur;

      if (onBlur != null) {
        onBlur(this.getText());
      }
    }
  }, {
    key: '_handleItemClick',
    value: function _handleItemClick(selectedValue, event) {
      var _this3 = this;

      this.selectValue(selectedValue, function () {
        // Focus the input again because the click will cause the input to blur. This mimics native
        // <select> behavior by keeping focus in the form being edited.
        var input = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(_this3.refs.freeformInput);
        if (input) {
          input.focus();
        }
      });
    }
  }, {
    key: '_handleMoveDown',
    value: function _handleMoveDown() {
      this.setState({
        selectedIndex: Math.min(this.props.maxOptionCount - 1, this.state.selectedIndex + 1, this.state.filteredOptions.length - 1)
      }, this._scrollSelectedOptionIntoViewIfNeeded);
    }
  }, {
    key: '_handleMoveUp',
    value: function _handleMoveUp() {
      this.setState({
        selectedIndex: Math.max(0, this.state.selectedIndex - 1)
      }, this._scrollSelectedOptionIntoViewIfNeeded);
    }
  }, {
    key: '_handleCancel',
    value: function _handleCancel() {
      this.setState({
        optionsVisible: false
      });
    }
  }, {
    key: '_handleConfirm',
    value: function _handleConfirm() {
      var option = this.state.filteredOptions[this.state.selectedIndex];
      if (option !== undefined) {
        this.selectValue(option.value);
      }
    }
  }, {
    key: '_setSelectedIndex',
    value: function _setSelectedIndex(selectedIndex) {
      this.setState({ selectedIndex: selectedIndex });
    }
  }, {
    key: '_scrollSelectedOptionIntoViewIfNeeded',
    value: function _scrollSelectedOptionIntoViewIfNeeded() {
      var selectedOption = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.selectedOption);
      if (selectedOption) {
        selectedOption.scrollIntoViewIfNeeded();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var optionsContainer = undefined;
      var options = [];

      if (this.props.loadingMessage && this.state.loadingOptions) {
        options.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'li',
          { key: 'loading-text', className: 'loading' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            { className: 'loading-message' },
            this.props.loadingMessage
          )
        ));
      }

      if (this.state.error != null && this.props.formatRequestOptionsErrorMessage != null) {
        var message = this.props.formatRequestOptionsErrorMessage(this.state.error);
        options.push((_reactForAtom2 || _reactForAtom()).React.createElement(
          'li',
          { key: 'text-error', className: 'text-error' },
          message
        ));
      }

      if (this.state.optionsVisible) {
        options.push.apply(options, _toConsumableArray(this.state.filteredOptions.map(function (option, i) {
          var beforeMatch = option.value.substring(0, option.matchIndex);
          var endOfMatchIndex = option.matchIndex + _this4.state.textInput.length;
          var highlightedMatch = option.value.substring(option.matchIndex, endOfMatchIndex);
          var afterMatch = option.value.substring(endOfMatchIndex, option.value.length);
          var isSelected = i === _this4.state.selectedIndex;
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            {
              className: isSelected ? 'selected' : null,
              key: 'option-' + option.value,
              onClick: _this4._handleItemClick.bind(_this4, option.value),
              onMouseOver: _this4._setSelectedIndex.bind(_this4, i),
              ref: isSelected ? 'selectedOption' : null },
            beforeMatch,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'strong',
              { className: 'text-highlight' },
              highlightedMatch
            ),
            afterMatch
          );
        })));

        if (!options.length) {
          options.push((_reactForAtom2 || _reactForAtom()).React.createElement(
            'li',
            { className: 'text-subtle', key: 'no-results-found' },
            'No results found'
          ));
        }

        var rect = this.state.optionsRect || { left: 0, top: 0, width: 300 };

        optionsContainer = (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Portal2 || _Portal()).Portal,
          { container: this._getOptionsElement() },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'nuclide-combobox-options', style: rect },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'select-list' },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'ol',
                { className: 'nuclide-combobox-list-group list-group' },
                options
              )
            )
          )
        );
      }

      var _props = this.props;
      var initialTextInput = _props.initialTextInput;
      var placeholderText = _props.placeholderText;
      var size = _props.size;
      var width = _props.width;

      var wrapperStyle = {
        width: width == null ? undefined : width + 'px'
      };
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'select-list popover-list popover-list-subtle ' + this.props.className,
          style: wrapperStyle },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_AtomInput2 || _AtomInput()).AtomInput, {
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
  }]);

  return Combobox;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Combobox = Combobox;