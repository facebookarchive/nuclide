var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var AtomInput = require('../../atom-input');

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;

var emptyfunction = require('emptyfunction');

var PropTypes = React.PropTypes;

/**
 * A Combo Box.
 * TODO allow making text input non-editable via props
 * TODO open/close options dropdown upon focus/blur
 * TODO add public getter/setter for textInput
 * TODO use generic search provider
 * TODO move combobox to separate package.
 */

var AtomComboBox = (function (_React$Component) {
  _inherits(AtomComboBox, _React$Component);

  _createClass(AtomComboBox, null, [{
    key: 'propTypes',
    value: {
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
      size: PropTypes.oneOf(['xs', 'sm', 'lg'])
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      className: '',
      maxOptionCount: 10,
      onChange: emptyfunction,
      onSelect: emptyfunction
    },
    enumerable: true
  }]);

  function AtomComboBox(props) {
    _classCallCheck(this, AtomComboBox);

    _get(Object.getPrototypeOf(AtomComboBox.prototype), 'constructor', this).call(this, props);
    this.state = {
      filteredOptions: [],
      loadingCount: 0,
      options: [],
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

  _createClass(AtomComboBox, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var node = ReactDOM.findDOMNode(this);
      var _subscriptions = this._subscriptions = new CompositeDisposable();
      _subscriptions.add(atom.commands.add(node, 'core:move-up', this._handleMoveUp), atom.commands.add(node, 'core:move-down', this._handleMoveDown), atom.commands.add(node, 'core:cancel', this._handleCancel), atom.commands.add(node, 'core:confirm', this._handleConfirm), this.refs['freeformInput'].onDidChange(this._handleTextInputChange));
      this.requestUpdate();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
      }
    }
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      this.setState({ loadingCount: this.state.loadingCount + 1 });
      this.props.requestOptions(this.state.textInput).then(this.receiveUpdate);
    }
  }, {
    key: 'receiveUpdate',
    value: function receiveUpdate(newOptions) {
      var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
      this.setState({
        loadingCount: this.state.loadingCount - 1,
        options: newOptions,
        filteredOptions: filteredOptions
      });
    }
  }, {
    key: 'selectValue',
    value: function selectValue(newValue, didRenderCallback) {
      this.refs['freeformInput'].setText(newValue);
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
      return this.refs['freeformInput'].getText();
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
    key: '_handleTextInputChange',
    value: function _handleTextInputChange() {
      var newText = this.refs.freeformInput.getText();
      if (newText === this.state.textInput) {
        return;
      }
      this.requestUpdate();
      var filteredOptions = this._getFilteredOptions(this.state.options, newText);
      var selectedIndex = undefined;
      if (filteredOptions.length === 0) {
        // If there aren't any options, don't select anything.
        selectedIndex = -1;
      } else if (this.state.selectedIndex === -1 || this.state.selectedIndex >= filteredOptions.length) {
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
        selectedIndex: selectedIndex
      });
      this.props.onChange(newText);
    }
  }, {
    key: '_handleInputFocus',
    value: function _handleInputFocus() {
      this.requestUpdate();
      this.setState({ optionsVisible: true });
    }
  }, {
    key: '_handleInputBlur',
    value: function _handleInputBlur() {
      // Delay hiding the combobox long enough for a click inside the combobox to trigger on it in
      // case the blur was caused by a click inside the combobox. 150ms is empirically long enough to
      // let the stack clear from this blur event and for the click event to trigger.
      setTimeout(this._handleCancel, 150);
    }
  }, {
    key: '_handleItemClick',
    value: function _handleItemClick(selectedValue, event) {
      var _this = this;

      this.selectValue(selectedValue, function () {
        // Focus the input again because the click will cause the input to blur. This mimics native
        // <select> behavior by keeping focus in the form being edited.
        var input = ReactDOM.findDOMNode(_this.refs['freeformInput']);
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
      var selectedOption = ReactDOM.findDOMNode(this.refs['selectedOption']);
      if (selectedOption) {
        selectedOption.scrollIntoViewIfNeeded();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var optionsContainer = undefined;
      var options = [];

      if (this.props.loadingMessage && this.state.loadingCount > 0) {
        options.push(React.createElement(
          'li',
          { key: 'loading-text', className: 'loading' },
          React.createElement(
            'span',
            { className: 'loading-message' },
            this.props.loadingMessage
          )
        ));
      }

      if (this.state.optionsVisible) {
        options.push.apply(options, _toConsumableArray(this.state.filteredOptions.map(function (option, i) {
          var beforeMatch = option.value.substring(0, option.matchIndex);
          var endOfMatchIndex = option.matchIndex + _this2.state.textInput.length;
          var highlightedMatch = option.value.substring(option.matchIndex, endOfMatchIndex);
          var afterMatch = option.value.substring(endOfMatchIndex, option.value.length);
          var isSelected = i === _this2.state.selectedIndex;
          return React.createElement(
            'li',
            {
              className: isSelected ? 'selected' : null,
              key: option.value,
              onClick: _this2._handleItemClick.bind(_this2, option.value),
              onMouseOver: _this2._setSelectedIndex.bind(_this2, i),
              ref: isSelected ? 'selectedOption' : null },
            beforeMatch,
            React.createElement(
              'strong',
              { className: 'text-highlight' },
              highlightedMatch
            ),
            afterMatch
          );
        })));

        if (!options.length) {
          options.push(React.createElement(
            'li',
            { className: 'text-subtle', key: 'no-results-found' },
            'No results found'
          ));
        }

        optionsContainer = React.createElement(
          'ol',
          { className: 'list-group' },
          options
        );
      }

      return React.createElement(
        'div',
        { className: 'select-list popover-list popover-list-subtle ' + this.props.className },
        React.createElement(AtomInput, {
          initialValue: this.props.initialTextInput,
          onBlur: this._handleInputBlur,
          onFocus: this._handleInputFocus,
          placeholderText: this.props.placeholderText,
          ref: 'freeformInput',
          size: this.props.size
        }),
        optionsContainer
      );
    }
  }]);

  return AtomComboBox;
})(React.Component);

module.exports = AtomComboBox;
//# sourceMappingURL=data:application/json;base64,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O0FBRUosWUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbkIsaUJBQU8sQ0FBQyxJQUFJLENBQ1Y7O2NBQUksU0FBUyxFQUFDLGFBQWEsRUFBQyxHQUFHLEVBQUMsa0JBQWtCOztXQUU3QyxDQUNOLENBQUM7U0FDSDs7QUFFRCx3QkFBZ0IsR0FDZDs7WUFBSSxTQUFTLEVBQUMsWUFBWTtVQUN2QixPQUFPO1NBQ0wsQUFDTixDQUFDO09BQ0g7O0FBRUQsYUFDRTs7VUFBSyxTQUFTLEVBQUUsK0NBQStDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7UUFDckYsb0JBQUMsU0FBUztBQUNSLHNCQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQUFBQztBQUMxQyxnQkFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQUFBQztBQUM5QixpQkFBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQztBQUNoQyx5QkFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxBQUFDO0FBQzVDLGFBQUcsRUFBQyxlQUFlO0FBQ25CLGNBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBQztVQUN0QjtRQUNELGdCQUFnQjtPQUNiLENBQ047S0FDSDs7O1NBclJHLFlBQVk7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUF5UjFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkF0b21Db21ib0JveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgQ29tYm9ib3hPcHRpb24gPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHZhbHVlTG93ZXJjYXNlOiBzdHJpbmc7XG4gIG1hdGNoSW5kZXg6IG51bWJlcjtcbn07XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL2F0b20taW5wdXQnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IGVtcHR5ZnVuY3Rpb24gPSByZXF1aXJlKCdlbXB0eWZ1bmN0aW9uJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGZpbHRlcmVkT3B0aW9uczogQXJyYXk8T2JqZWN0PjtcbiAgbG9hZGluZ0NvdW50OiBudW1iZXI7XG4gIG9wdGlvbnM6IEFycmF5PHN0cmluZz47XG4gIG9wdGlvbnNWaXNpYmxlOiBib29sZWFuO1xuICBzZWxlY3RlZEluZGV4OiBudW1iZXI7XG4gIHRleHRJbnB1dDogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBBIENvbWJvIEJveC5cbiAqIFRPRE8gYWxsb3cgbWFraW5nIHRleHQgaW5wdXQgbm9uLWVkaXRhYmxlIHZpYSBwcm9wc1xuICogVE9ETyBvcGVuL2Nsb3NlIG9wdGlvbnMgZHJvcGRvd24gdXBvbiBmb2N1cy9ibHVyXG4gKiBUT0RPIGFkZCBwdWJsaWMgZ2V0dGVyL3NldHRlciBmb3IgdGV4dElucHV0XG4gKiBUT0RPIHVzZSBnZW5lcmljIHNlYXJjaCBwcm92aWRlclxuICogVE9ETyBtb3ZlIGNvbWJvYm94IHRvIHNlcGFyYXRlIHBhY2thZ2UuXG4gKi9cbmNsYXNzIEF0b21Db21ib0JveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRlOiBTdGF0ZTtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgaW5pdGlhbFRleHRJbnB1dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBsb2FkaW5nTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwbGFjZWhvbGRlclRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWF4T3B0aW9uQ291bnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbjsgR2V0cyBjYWxsZWQgd2l0aFxuICAgICAqIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBpbnB1dCBmaWVsZCBhcyBpdHMgb25seSBhcmd1bWVudFxuICAgICAqL1xuICAgIHJlcXVlc3RPcHRpb25zOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBtYXhPcHRpb25Db3VudDogMTAsXG4gICAgb25DaGFuZ2U6IGVtcHR5ZnVuY3Rpb24sXG4gICAgb25TZWxlY3Q6IGVtcHR5ZnVuY3Rpb24sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZmlsdGVyZWRPcHRpb25zOiBbXSxcbiAgICAgIGxvYWRpbmdDb3VudDogMCxcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICB0ZXh0SW5wdXQ6IHByb3BzLmluaXRpYWxUZXh0SW5wdXQsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5yZWNlaXZlVXBkYXRlID0gdGhpcy5yZWNlaXZlVXBkYXRlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVRleHRJbnB1dENoYW5nZSA9IHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVJbnB1dEJsdXIgPSB0aGlzLl9oYW5kbGVJbnB1dEJsdXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlSW5wdXRGb2N1cyA9IHRoaXMuX2hhbmRsZUlucHV0Rm9jdXMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW92ZURvd24gPSB0aGlzLl9oYW5kbGVNb3ZlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3ZlVXAgPSB0aGlzLl9oYW5kbGVNb3ZlVXAuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2FuY2VsID0gdGhpcy5faGFuZGxlQ2FuY2VsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNvbmZpcm0gPSB0aGlzLl9oYW5kbGVDb25maXJtLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCA9XG4gICAgICB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBfc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIF9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOm1vdmUtdXAnLCB0aGlzLl9oYW5kbGVNb3ZlVXApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS1kb3duJywgdGhpcy5faGFuZGxlTW92ZURvd24pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y2FuY2VsJywgdGhpcy5faGFuZGxlQ2FuY2VsKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9oYW5kbGVDb25maXJtKSxcbiAgICAgIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLm9uRGlkQ2hhbmdlKHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSlcbiAgICApO1xuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RVcGRhdGUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bG9hZGluZ0NvdW50OiB0aGlzLnN0YXRlLmxvYWRpbmdDb3VudCArIDF9KTtcbiAgICB0aGlzLnByb3BzLnJlcXVlc3RPcHRpb25zKHRoaXMuc3RhdGUudGV4dElucHV0KS50aGVuKHRoaXMucmVjZWl2ZVVwZGF0ZSk7XG4gIH1cblxuICByZWNlaXZlVXBkYXRlKG5ld09wdGlvbnM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnMobmV3T3B0aW9ucywgdGhpcy5zdGF0ZS50ZXh0SW5wdXQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbG9hZGluZ0NvdW50OiB0aGlzLnN0YXRlLmxvYWRpbmdDb3VudCAtIDEsXG4gICAgICBvcHRpb25zOiBuZXdPcHRpb25zLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICBzZWxlY3RWYWx1ZShuZXdWYWx1ZTogc3RyaW5nLCBkaWRSZW5kZXJDYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXS5zZXRUZXh0KG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VmFsdWUsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICB9LCBkaWRSZW5kZXJDYWxsYmFjayk7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChuZXdWYWx1ZSk7XG4gICAgLy8gU2VsZWN0aW5nIGEgdmFsdWUgaW4gdGhlIGRyb3Bkb3duIGNoYW5nZXMgdGhlIHRleHQgYXMgd2VsbC4gQ2FsbCB0aGUgY2FsbGJhY2sgYWNjb3JkaW5nbHkuXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLmdldFRleHQoKTtcbiAgfVxuXG4gIC8vIFRPRE8gdXNlIG5hdGl2ZSAoZnV6enkvc3RyaWN0IC0gY29uZmlndXJhYmxlPykgZmlsdGVyIHByb3ZpZGVyXG4gIF9nZXRGaWx0ZXJlZE9wdGlvbnMob3B0aW9uczogQXJyYXk8c3RyaW5nPiwgZmlsdGVyVmFsdWU6IHN0cmluZyk6IEFycmF5PENvbWJvYm94T3B0aW9uPiB7XG4gICAgY29uc3QgbG93ZXJDYXNlU3RhdGUgPSBmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBvcHRpb25zXG4gICAgICAubWFwKFxuICAgICAgICBvcHRpb24gPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlTG93ZXJjYXNlID0gb3B0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24sXG4gICAgICAgICAgICB2YWx1ZUxvd2VyY2FzZTogdmFsdWVMb3dlcmNhc2UsXG4gICAgICAgICAgICBtYXRjaEluZGV4OiB2YWx1ZUxvd2VyY2FzZS5pbmRleE9mKGxvd2VyQ2FzZVN0YXRlKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICApLmZpbHRlcihcbiAgICAgICAgb3B0aW9uID0+IG9wdGlvbi5tYXRjaEluZGV4ICE9PSAtMVxuICAgICAgKS5zbGljZSgwLCB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50KTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VGV4dCA9IHRoaXMucmVmcy5mcmVlZm9ybUlucHV0LmdldFRleHQoKTtcbiAgICBpZiAobmV3VGV4dCA9PT0gdGhpcy5zdGF0ZS50ZXh0SW5wdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgY29uc3QgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5fZ2V0RmlsdGVyZWRPcHRpb25zKHRoaXMuc3RhdGUub3B0aW9ucywgbmV3VGV4dCk7XG4gICAgbGV0IHNlbGVjdGVkSW5kZXg7XG4gICAgaWYgKGZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZW4ndCBhbnkgb3B0aW9ucywgZG9uJ3Qgc2VsZWN0IGFueXRoaW5nLlxuICAgICAgc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID09PSAtMSB8fFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPj0gZmlsdGVyZWRPcHRpb25zLmxlbmd0aCkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlIG9wdGlvbnMgYW5kIHRoZSBzZWxlY3RlZCBpbmRleCBpcyBvdXQgb2YgYm91bmRzLFxuICAgICAgLy8gZGVmYXVsdCB0byB0aGUgZmlyc3QgaXRlbS5cbiAgICAgIHNlbGVjdGVkSW5kZXggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VGV4dCxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiB0cnVlLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICBzZWxlY3RlZEluZGV4LFxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VGV4dCk7XG4gIH1cblxuICBfaGFuZGxlSW5wdXRGb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zVmlzaWJsZTogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZUlucHV0Qmx1cigpOiB2b2lkIHtcbiAgICAvLyBEZWxheSBoaWRpbmcgdGhlIGNvbWJvYm94IGxvbmcgZW5vdWdoIGZvciBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3ggdG8gdHJpZ2dlciBvbiBpdCBpblxuICAgIC8vIGNhc2UgdGhlIGJsdXIgd2FzIGNhdXNlZCBieSBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3guIDE1MG1zIGlzIGVtcGlyaWNhbGx5IGxvbmcgZW5vdWdoIHRvXG4gICAgLy8gbGV0IHRoZSBzdGFjayBjbGVhciBmcm9tIHRoaXMgYmx1ciBldmVudCBhbmQgZm9yIHRoZSBjbGljayBldmVudCB0byB0cmlnZ2VyLlxuICAgIHNldFRpbWVvdXQodGhpcy5faGFuZGxlQ2FuY2VsLCAxNTApO1xuICB9XG5cbiAgX2hhbmRsZUl0ZW1DbGljayhzZWxlY3RlZFZhbHVlOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnNlbGVjdFZhbHVlKHNlbGVjdGVkVmFsdWUsICgpID0+IHtcbiAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCBhZ2FpbiBiZWNhdXNlIHRoZSBjbGljayB3aWxsIGNhdXNlIHRoZSBpbnB1dCB0byBibHVyLiBUaGlzIG1pbWljcyBuYXRpdmVcbiAgICAgIC8vIDxzZWxlY3Q+IGJlaGF2aW9yIGJ5IGtlZXBpbmcgZm9jdXMgaW4gdGhlIGZvcm0gYmVpbmcgZWRpdGVkLlxuICAgICAgY29uc3QgaW5wdXQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXSk7XG4gICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlRG93bigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IE1hdGgubWluKFxuICAgICAgICB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50IC0gMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ICsgMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlVXAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4IC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWwoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlQ29uZmlybSgpIHtcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9uc1t0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXhdO1xuICAgIGlmIChvcHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEluZGV4KHNlbGVjdGVkSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXh9KTtcbiAgfVxuXG4gIF9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGVkT3B0aW9uJ10pO1xuICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgc2VsZWN0ZWRPcHRpb24uc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBvcHRpb25zQ29udGFpbmVyO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBbXTtcblxuICAgIGlmICh0aGlzLnByb3BzLmxvYWRpbmdNZXNzYWdlICYmIHRoaXMuc3RhdGUubG9hZGluZ0NvdW50ID4gMCkge1xuICAgICAgb3B0aW9ucy5wdXNoKFxuICAgICAgICA8bGkga2V5PVwibG9hZGluZy10ZXh0XCIgY2xhc3NOYW1lPVwibG9hZGluZ1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmctbWVzc2FnZVwiPnt0aGlzLnByb3BzLmxvYWRpbmdNZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUub3B0aW9uc1Zpc2libGUpIHtcbiAgICAgIG9wdGlvbnMucHVzaCguLi50aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5tYXAoKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICBjb25zdCBiZWZvcmVNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoMCwgb3B0aW9uLm1hdGNoSW5kZXgpO1xuICAgICAgICBjb25zdCBlbmRPZk1hdGNoSW5kZXggPSBvcHRpb24ubWF0Y2hJbmRleCArIHRoaXMuc3RhdGUudGV4dElucHV0Lmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZWRNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgb3B0aW9uLm1hdGNoSW5kZXgsXG4gICAgICAgICAgZW5kT2ZNYXRjaEluZGV4XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGFmdGVyTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgIGVuZE9mTWF0Y2hJbmRleCxcbiAgICAgICAgICBvcHRpb24udmFsdWUubGVuZ3RoXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpXG4gICAgICAgICAgICBjbGFzc05hbWU9e2lzU2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogbnVsbH1cbiAgICAgICAgICAgIGtleT17b3B0aW9uLnZhbHVlfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlSXRlbUNsaWNrLmJpbmQodGhpcywgb3B0aW9uLnZhbHVlKX1cbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLl9zZXRTZWxlY3RlZEluZGV4LmJpbmQodGhpcywgaSl9XG4gICAgICAgICAgICByZWY9e2lzU2VsZWN0ZWQgPyAnc2VsZWN0ZWRPcHRpb24nIDogbnVsbH0+XG4gICAgICAgICAgICB7YmVmb3JlTWF0Y2h9XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInRleHQtaGlnaGxpZ2h0XCI+e2hpZ2hsaWdodGVkTWF0Y2h9PC9zdHJvbmc+XG4gICAgICAgICAgICB7YWZ0ZXJNYXRjaH1cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfSkpO1xuXG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMucHVzaChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwidGV4dC1zdWJ0bGVcIiBrZXk9XCJuby1yZXN1bHRzLWZvdW5kXCI+XG4gICAgICAgICAgICBObyByZXN1bHRzIGZvdW5kXG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9uc0NvbnRhaW5lciA9IChcbiAgICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgPC9vbD5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnc2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IHBvcG92ZXItbGlzdC1zdWJ0bGUgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfT5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVGV4dElucHV0fVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5faGFuZGxlSW5wdXRCbHVyfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2hhbmRsZUlucHV0Rm9jdXN9XG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyVGV4dH1cbiAgICAgICAgICByZWY9XCJmcmVlZm9ybUlucHV0XCJcbiAgICAgICAgICBzaXplPXt0aGlzLnByb3BzLnNpemV9XG4gICAgICAgIC8+XG4gICAgICAgIHtvcHRpb25zQ29udGFpbmVyfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbUNvbWJvQm94O1xuIl19