var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
      this.props.requestOptions(this.state.textInput).then(this.receiveUpdate);
    }
  }, {
    key: 'receiveUpdate',
    value: function receiveUpdate(newOptions) {
      var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
      this.setState({
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
      if (this.state.optionsVisible) {
        var _options = this.state.filteredOptions.map(function (option, i) {
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
        });

        if (!_options.length) {
          _options.push(React.createElement(
            'li',
            { className: 'text-subtle', key: 'no-results-found' },
            'No results found'
          ));
        }

        optionsContainer = React.createElement(
          'ol',
          { className: 'list-group' },
          _options
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBQztVQUN0QjtRQUNELGdCQUFnQjtPQUNiLENBQ047S0FDSDs7O1NBdlFHLFlBQVk7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUEyUTFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkF0b21Db21ib0JveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgQ29tYm9ib3hPcHRpb24gPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHZhbHVlTG93ZXJjYXNlOiBzdHJpbmc7XG4gIG1hdGNoSW5kZXg6IG51bWJlcjtcbn07XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL2F0b20taW5wdXQnKTtcbmNvbnN0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNvbnN0IGVtcHR5ZnVuY3Rpb24gPSByZXF1aXJlKCdlbXB0eWZ1bmN0aW9uJyk7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgU3RhdGUgPSB7XG4gIGZpbHRlcmVkT3B0aW9uczogQXJyYXk8T2JqZWN0PjtcbiAgb3B0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgb3B0aW9uc1Zpc2libGU6IGJvb2xlYW47XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgdGV4dElucHV0OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgQ29tYm8gQm94LlxuICogVE9ETyBhbGxvdyBtYWtpbmcgdGV4dCBpbnB1dCBub24tZWRpdGFibGUgdmlhIHByb3BzXG4gKiBUT0RPIG9wZW4vY2xvc2Ugb3B0aW9ucyBkcm9wZG93biB1cG9uIGZvY3VzL2JsdXJcbiAqIFRPRE8gYWRkIHB1YmxpYyBnZXR0ZXIvc2V0dGVyIGZvciB0ZXh0SW5wdXRcbiAqIFRPRE8gdXNlIGdlbmVyaWMgc2VhcmNoIHByb3ZpZGVyXG4gKiBUT0RPIG1vdmUgY29tYm9ib3ggdG8gc2VwYXJhdGUgcGFja2FnZS5cbiAqL1xuY2xhc3MgQXRvbUNvbWJvQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBpbml0aWFsVGV4dElucHV0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtYXhPcHRpb25Db3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uU2VsZWN0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8qKlxuICAgICAqIHByb21pc2UtcmV0dXJuaW5nIGZ1bmN0aW9uOyBHZXRzIGNhbGxlZCB3aXRoXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGlucHV0IGZpZWxkIGFzIGl0cyBvbmx5IGFyZ3VtZW50XG4gICAgICovXG4gICAgcmVxdWVzdE9wdGlvbnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2l6ZTogUHJvcFR5cGVzLm9uZU9mKFsneHMnLCAnc20nLCAnbGcnXSksXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIG1heE9wdGlvbkNvdW50OiAxMCxcbiAgICBvbkNoYW5nZTogZW1wdHlmdW5jdGlvbixcbiAgICBvblNlbGVjdDogZW1wdHlmdW5jdGlvbixcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IFtdLFxuICAgICAgb3B0aW9uczogW10sXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIHRleHRJbnB1dDogcHJvcHMuaW5pdGlhbFRleHRJbnB1dCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLnJlY2VpdmVVcGRhdGUgPSB0aGlzLnJlY2VpdmVVcGRhdGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlVGV4dElucHV0Q2hhbmdlID0gdGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUlucHV0Qmx1ciA9IHRoaXMuX2hhbmRsZUlucHV0Qmx1ci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVJbnB1dEZvY3VzID0gdGhpcy5faGFuZGxlSW5wdXRGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3ZlRG93biA9IHRoaXMuX2hhbmRsZU1vdmVEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdmVVcCA9IHRoaXMuX2hhbmRsZU1vdmVVcC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWwgPSB0aGlzLl9oYW5kbGVDYW5jZWwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ29uZmlybSA9IHRoaXMuX2hhbmRsZUNvbmZpcm0uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkID1cbiAgICAgIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS11cCcsIHRoaXMuX2hhbmRsZU1vdmVVcCksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLl9oYW5kbGVNb3ZlRG93biksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTpjYW5jZWwnLCB0aGlzLl9oYW5kbGVDYW5jZWwpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2hhbmRsZUNvbmZpcm0pLFxuICAgICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10ub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKVxuICAgICk7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdFVwZGF0ZSgpIHtcbiAgICB0aGlzLnByb3BzLnJlcXVlc3RPcHRpb25zKHRoaXMuc3RhdGUudGV4dElucHV0KS50aGVuKHRoaXMucmVjZWl2ZVVwZGF0ZSk7XG4gIH1cblxuICByZWNlaXZlVXBkYXRlKG5ld09wdGlvbnM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnMobmV3T3B0aW9ucywgdGhpcy5zdGF0ZS50ZXh0SW5wdXQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3B0aW9uczogbmV3T3B0aW9ucyxcbiAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0VmFsdWUobmV3VmFsdWU6IHN0cmluZywgZGlkUmVuZGVyQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10uc2V0VGV4dChuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0ZXh0SW5wdXQ6IG5ld1ZhbHVlLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgfSwgZGlkUmVuZGVyQ2FsbGJhY2spO1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QobmV3VmFsdWUpO1xuICAgIC8vIFNlbGVjdGluZyBhIHZhbHVlIGluIHRoZSBkcm9wZG93biBjaGFuZ2VzIHRoZSB0ZXh0IGFzIHdlbGwuIENhbGwgdGhlIGNhbGxiYWNrIGFjY29yZGluZ2x5LlxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXS5nZXRUZXh0KCk7XG4gIH1cblxuICAvLyBUT0RPIHVzZSBuYXRpdmUgKGZ1enp5L3N0cmljdCAtIGNvbmZpZ3VyYWJsZT8pIGZpbHRlciBwcm92aWRlclxuICBfZ2V0RmlsdGVyZWRPcHRpb25zKG9wdGlvbnM6IEFycmF5PHN0cmluZz4sIGZpbHRlclZhbHVlOiBzdHJpbmcpOiBBcnJheTxDb21ib2JveE9wdGlvbj4ge1xuICAgIGNvbnN0IGxvd2VyQ2FzZVN0YXRlID0gZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gb3B0aW9uc1xuICAgICAgLm1hcChcbiAgICAgICAgb3B0aW9uID0+IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZUxvd2VyY2FzZSA9IG9wdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogb3B0aW9uLFxuICAgICAgICAgICAgdmFsdWVMb3dlcmNhc2U6IHZhbHVlTG93ZXJjYXNlLFxuICAgICAgICAgICAgbWF0Y2hJbmRleDogdmFsdWVMb3dlcmNhc2UuaW5kZXhPZihsb3dlckNhc2VTdGF0ZSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgKS5maWx0ZXIoXG4gICAgICAgIG9wdGlvbiA9PiBvcHRpb24ubWF0Y2hJbmRleCAhPT0gLTFcbiAgICAgICkuc2xpY2UoMCwgdGhpcy5wcm9wcy5tYXhPcHRpb25Db3VudCk7XG4gIH1cblxuICBfaGFuZGxlVGV4dElucHV0Q2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnJlZnMuZnJlZWZvcm1JbnB1dC5nZXRUZXh0KCk7XG4gICAgaWYgKG5ld1RleHQgPT09IHRoaXMuc3RhdGUudGV4dElucHV0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgIGNvbnN0IGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuX2dldEZpbHRlcmVkT3B0aW9ucyh0aGlzLnN0YXRlLm9wdGlvbnMsIG5ld1RleHQpO1xuICAgIGxldCBzZWxlY3RlZEluZGV4O1xuICAgIGlmIChmaWx0ZXJlZE9wdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYW55IG9wdGlvbnMsIGRvbid0IHNlbGVjdCBhbnl0aGluZy5cbiAgICAgIHNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA9PT0gLTEgfHxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID49IGZpbHRlcmVkT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvcHRpb25zIGFuZCB0aGUgc2VsZWN0ZWQgaW5kZXggaXMgb3V0IG9mIGJvdW5kcyxcbiAgICAgIC8vIGRlZmF1bHQgdG8gdGhlIGZpcnN0IGl0ZW0uXG4gICAgICBzZWxlY3RlZEluZGV4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleDtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0ZXh0SW5wdXQ6IG5ld1RleHQsXG4gICAgICBvcHRpb25zVmlzaWJsZTogdHJ1ZSxcbiAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgICAgc2VsZWN0ZWRJbmRleCxcbiAgICB9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1RleHQpO1xuICB9XG5cbiAgX2hhbmRsZUlucHV0Rm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3B0aW9uc1Zpc2libGU6IHRydWV9KTtcbiAgfVxuXG4gIF9oYW5kbGVJbnB1dEJsdXIoKTogdm9pZCB7XG4gICAgLy8gRGVsYXkgaGlkaW5nIHRoZSBjb21ib2JveCBsb25nIGVub3VnaCBmb3IgYSBjbGljayBpbnNpZGUgdGhlIGNvbWJvYm94IHRvIHRyaWdnZXIgb24gaXQgaW5cbiAgICAvLyBjYXNlIHRoZSBibHVyIHdhcyBjYXVzZWQgYnkgYSBjbGljayBpbnNpZGUgdGhlIGNvbWJvYm94LiAxNTBtcyBpcyBlbXBpcmljYWxseSBsb25nIGVub3VnaCB0b1xuICAgIC8vIGxldCB0aGUgc3RhY2sgY2xlYXIgZnJvbSB0aGlzIGJsdXIgZXZlbnQgYW5kIGZvciB0aGUgY2xpY2sgZXZlbnQgdG8gdHJpZ2dlci5cbiAgICBzZXRUaW1lb3V0KHRoaXMuX2hhbmRsZUNhbmNlbCwgMTUwKTtcbiAgfVxuXG4gIF9oYW5kbGVJdGVtQ2xpY2soc2VsZWN0ZWRWYWx1ZTogc3RyaW5nLCBldmVudDogYW55KSB7XG4gICAgdGhpcy5zZWxlY3RWYWx1ZShzZWxlY3RlZFZhbHVlLCAoKSA9PiB7XG4gICAgICAvLyBGb2N1cyB0aGUgaW5wdXQgYWdhaW4gYmVjYXVzZSB0aGUgY2xpY2sgd2lsbCBjYXVzZSB0aGUgaW5wdXQgdG8gYmx1ci4gVGhpcyBtaW1pY3MgbmF0aXZlXG4gICAgICAvLyA8c2VsZWN0PiBiZWhhdmlvciBieSBrZWVwaW5nIGZvY3VzIGluIHRoZSBmb3JtIGJlaW5nIGVkaXRlZC5cbiAgICAgIGNvbnN0IGlucHV0ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10pO1xuICAgICAgaWYgKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlTW92ZURvd24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBNYXRoLm1pbihcbiAgICAgICAgdGhpcy5wcm9wcy5tYXhPcHRpb25Db3VudCAtIDEsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCArIDEsXG4gICAgICAgIHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCAtIDEsXG4gICAgICApLFxuICAgIH0sIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCk7XG4gIH1cblxuICBfaGFuZGxlTW92ZVVwKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRJbmRleDogTWF0aC5tYXgoXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCAtIDEsXG4gICAgICApLFxuICAgIH0sIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCk7XG4gIH1cblxuICBfaGFuZGxlQ2FuY2VsKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZUNvbmZpcm0oKSB7XG4gICAgY29uc3Qgb3B0aW9uID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnNbdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4XTtcbiAgICBpZiAob3B0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRJbmRleChzZWxlY3RlZEluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4fSk7XG4gIH1cblxuICBfc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydzZWxlY3RlZE9wdGlvbiddKTtcbiAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgIHNlbGVjdGVkT3B0aW9uLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgb3B0aW9uc0NvbnRhaW5lcjtcbiAgICBpZiAodGhpcy5zdGF0ZS5vcHRpb25zVmlzaWJsZSkge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLm1hcCgob3B0aW9uLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGJlZm9yZU1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZygwLCBvcHRpb24ubWF0Y2hJbmRleCk7XG4gICAgICAgIGNvbnN0IGVuZE9mTWF0Y2hJbmRleCA9IG9wdGlvbi5tYXRjaEluZGV4ICsgdGhpcy5zdGF0ZS50ZXh0SW5wdXQubGVuZ3RoO1xuICAgICAgICBjb25zdCBoaWdobGlnaHRlZE1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICBvcHRpb24ubWF0Y2hJbmRleCxcbiAgICAgICAgICBlbmRPZk1hdGNoSW5kZXhcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWZ0ZXJNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgZW5kT2ZNYXRjaEluZGV4LFxuICAgICAgICAgIG9wdGlvbi52YWx1ZS5sZW5ndGhcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGkgPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGlcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aXNTZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiBudWxsfVxuICAgICAgICAgICAga2V5PXtvcHRpb24udmFsdWV9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVJdGVtQ2xpY2suYmluZCh0aGlzLCBvcHRpb24udmFsdWUpfVxuICAgICAgICAgICAgb25Nb3VzZU92ZXI9e3RoaXMuX3NldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBpKX1cbiAgICAgICAgICAgIHJlZj17aXNTZWxlY3RlZCA/ICdzZWxlY3RlZE9wdGlvbicgOiBudWxsfT5cbiAgICAgICAgICAgIHtiZWZvcmVNYXRjaH1cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwidGV4dC1oaWdobGlnaHRcIj57aGlnaGxpZ2h0ZWRNYXRjaH08L3N0cm9uZz5cbiAgICAgICAgICAgIHthZnRlck1hdGNofVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFvcHRpb25zLmxlbmd0aCkge1xuICAgICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT1cInRleHQtc3VidGxlXCIga2V5PVwibm8tcmVzdWx0cy1mb3VuZFwiPlxuICAgICAgICAgICAgTm8gcmVzdWx0cyBmb3VuZFxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnNDb250YWluZXIgPSAoXG4gICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG4gICAgICAgICAge29wdGlvbnN9XG4gICAgICAgIDwvb2w+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17J3NlbGVjdC1saXN0IHBvcG92ZXItbGlzdCBwb3BvdmVyLWxpc3Qtc3VidGxlICcgKyB0aGlzLnByb3BzLmNsYXNzTmFtZX0+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMucHJvcHMuaW5pdGlhbFRleHRJbnB1dH1cbiAgICAgICAgICBvbkJsdXI9e3RoaXMuX2hhbmRsZUlucHV0Qmx1cn1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9oYW5kbGVJbnB1dEZvY3VzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD17dGhpcy5wcm9wcy5wbGFjZWhvbGRlclRleHR9XG4gICAgICAgICAgcmVmPVwiZnJlZWZvcm1JbnB1dFwiXG4gICAgICAgICAgc2l6ZT17dGhpcy5wcm9wcy5zaXplfVxuICAgICAgICAvPlxuICAgICAgICB7b3B0aW9uc0NvbnRhaW5lcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21Db21ib0JveDtcbiJdfQ==