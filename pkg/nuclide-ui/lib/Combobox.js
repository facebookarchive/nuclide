Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('./AtomInput');

var AtomInput = _require2.AtomInput;

var _require3 = require('react-for-atom');

var React = _require3.React;
var ReactDOM = _require3.ReactDOM;
var PropTypes = React.PropTypes;

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
    key: 'propTypes',
    value: {
      className: PropTypes.string.isRequired,
      formatRequestOptionsErrorMessage: PropTypes.func,
      initialTextInput: PropTypes.string,
      loadingMessage: PropTypes.string,
      placeholderText: PropTypes.string,
      maxOptionCount: PropTypes.number.isRequired,
      onChange: PropTypes.func.isRequired,
      onRequestOptionsError: PropTypes.func,
      onSelect: PropTypes.func.isRequired,
      /**
       * promise-returning function; Gets called with
       * the current value of the input field as its only argument
       */
      requestOptions: PropTypes.func.isRequired,
      size: PropTypes.oneOf(['xs', 'sm', 'lg']),
      width: PropTypes.number
    },
    enumerable: true
  }, {
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
    this.state = {
      error: null,
      filteredOptions: [],
      loadingOptions: false,
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

  _createClass(Combobox, [{
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
      if (this._updateSubscription != null) {
        this._updateSubscription.dispose();
      }
    }
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this = this;

      // Cancel pending update.
      if (this._updateSubscription != null) {
        this._updateSubscription.dispose();
      }

      this.setState({ error: null, loadingOptions: true });

      this._updateSubscription = _rx2['default'].Observable.fromPromise(this.props.requestOptions(this.state.textInput)).subscribe(function (options) {
        return _this.receiveUpdate(options);
      }, function (err) {
        _this.setState({ error: err, loadingOptions: false });
        if (_this.props.onRequestOptionsError != null) {
          _this.props.onRequestOptionsError(err);
        }
      });
    }
  }, {
    key: 'receiveUpdate',
    value: function receiveUpdate(newOptions) {
      var filteredOptions = this._getFilteredOptions(newOptions, this.state.textInput);
      this.setState({
        error: null,
        loadingOptions: false,
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
      var _this2 = this;

      this.selectValue(selectedValue, function () {
        // Focus the input again because the click will cause the input to blur. This mimics native
        // <select> behavior by keeping focus in the form being edited.
        var input = ReactDOM.findDOMNode(_this2.refs['freeformInput']);
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
      var _this3 = this;

      var optionsContainer = undefined;
      var options = [];

      if (this.props.loadingMessage && this.state.loadingOptions) {
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

      if (this.state.error != null && this.props.formatRequestOptionsErrorMessage != null) {
        var message = this.props.formatRequestOptionsErrorMessage(this.state.error);
        options.push(React.createElement(
          'li',
          { className: 'text-error' },
          message
        ));
      }

      if (this.state.optionsVisible) {
        options.push.apply(options, _toConsumableArray(this.state.filteredOptions.map(function (option, i) {
          var beforeMatch = option.value.substring(0, option.matchIndex);
          var endOfMatchIndex = option.matchIndex + _this3.state.textInput.length;
          var highlightedMatch = option.value.substring(option.matchIndex, endOfMatchIndex);
          var afterMatch = option.value.substring(endOfMatchIndex, option.value.length);
          var isSelected = i === _this3.state.selectedIndex;
          return React.createElement(
            'li',
            {
              className: isSelected ? 'selected' : null,
              key: option.value,
              onClick: _this3._handleItemClick.bind(_this3, option.value),
              onMouseOver: _this3._setSelectedIndex.bind(_this3, i),
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

      var _props = this.props;
      var initialTextInput = _props.initialTextInput;
      var placeholderText = _props.placeholderText;
      var size = _props.size;
      var width = _props.width;

      return React.createElement(
        'div',
        { className: 'select-list popover-list popover-list-subtle ' + this.props.className,
          style: { width: width + 'px' } },
        React.createElement(AtomInput, {
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
})(React.Component);

exports.Combobox = Combobox;
//# sourceMappingURL=data:application/json;base64,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Q0FDVjs7Y0FBSSxTQUFTLEVBQUMsYUFBYSxFQUFDLEdBQUcsRUFBQyxrQkFBa0I7O1dBRTdDLENBQ04sQ0FBQztTQUNIOztBQUVELHdCQUFnQixHQUNkOztZQUFJLFNBQVMsRUFBQyxZQUFZO1VBQ3ZCLE9BQU87U0FDTCxBQUNOLENBQUM7T0FDSDs7bUJBT0csSUFBSSxDQUFDLEtBQUs7VUFKWixnQkFBZ0IsVUFBaEIsZ0JBQWdCO1VBQ2hCLGVBQWUsVUFBZixlQUFlO1VBQ2YsSUFBSSxVQUFKLElBQUk7VUFDSixLQUFLLFVBQUwsS0FBSzs7QUFFUCxhQUNFOztVQUFLLFNBQVMsRUFBRSwrQ0FBK0MsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQUFBQztBQUNsRixlQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUssS0FBSyxPQUFJLEVBQUMsQUFBQztRQUNoQyxvQkFBQyxTQUFTO0FBQ1Isc0JBQVksRUFBRSxnQkFBZ0IsQUFBQztBQUMvQixnQkFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQUFBQztBQUM5QixpQkFBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQztBQUNoQyx5QkFBZSxFQUFFLGVBQWUsQUFBQztBQUNqQyxhQUFHLEVBQUMsZUFBZTtBQUNuQixjQUFJLEVBQUUsSUFBSSxBQUFDO0FBQ1gsZUFBSyxFQUFFLEtBQUssQUFBQztVQUNiO1FBQ0QsZ0JBQWdCO09BQ2IsQ0FDTjtLQUNIOzs7U0FqVVUsUUFBUTtHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IkNvbWJvYm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudHlwZSBDb21ib2JveE9wdGlvbiA9IHtcbiAgdmFsdWU6IHN0cmluZztcbiAgdmFsdWVMb3dlcmNhc2U6IHN0cmluZztcbiAgbWF0Y2hJbmRleDogbnVtYmVyO1xufTtcblxuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuL0F0b21JbnB1dCcpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgZXJyb3I6ID9FcnJvcjtcbiAgZmlsdGVyZWRPcHRpb25zOiBBcnJheTxPYmplY3Q+O1xuICBsb2FkaW5nT3B0aW9uczogYm9vbGVhbjtcbiAgb3B0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgb3B0aW9uc1Zpc2libGU6IGJvb2xlYW47XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgdGV4dElucHV0OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgQ29tYm8gQm94LlxuICogVE9ETyBhbGxvdyBtYWtpbmcgdGV4dCBpbnB1dCBub24tZWRpdGFibGUgdmlhIHByb3BzXG4gKiBUT0RPIG9wZW4vY2xvc2Ugb3B0aW9ucyBkcm9wZG93biB1cG9uIGZvY3VzL2JsdXJcbiAqIFRPRE8gYWRkIHB1YmxpYyBnZXR0ZXIvc2V0dGVyIGZvciB0ZXh0SW5wdXRcbiAqIFRPRE8gdXNlIGdlbmVyaWMgc2VhcmNoIHByb3ZpZGVyXG4gKiBUT0RPIG1vdmUgY29tYm9ib3ggdG8gc2VwYXJhdGUgcGFja2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbWJvYm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBfdXBkYXRlU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBpbml0aWFsVGV4dElucHV0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGxvYWRpbmdNZXNzYWdlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtYXhPcHRpb25Db3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uUmVxdWVzdE9wdGlvbnNFcnJvcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25TZWxlY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLyoqXG4gICAgICogcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb247IEdldHMgY2FsbGVkIHdpdGhcbiAgICAgKiB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgaW5wdXQgZmllbGQgYXMgaXRzIG9ubHkgYXJndW1lbnRcbiAgICAgKi9cbiAgICByZXF1ZXN0T3B0aW9uczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaXplOiBQcm9wVHlwZXMub25lT2YoWyd4cycsICdzbScsICdsZyddKSxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgbWF4T3B0aW9uQ291bnQ6IDEwLFxuICAgIG9uQ2hhbmdlOiAobmV3VmFsdWU6IHN0cmluZykgPT4ge30sXG4gICAgb25TZWxlY3Q6IChuZXdWYWx1ZTogc3RyaW5nKSA9PiB7fSxcbiAgICB3aWR0aDogMjAwLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBbXSxcbiAgICAgIGxvYWRpbmdPcHRpb25zOiBmYWxzZSxcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICB0ZXh0SW5wdXQ6IHByb3BzLmluaXRpYWxUZXh0SW5wdXQsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5yZWNlaXZlVXBkYXRlID0gdGhpcy5yZWNlaXZlVXBkYXRlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVRleHRJbnB1dENoYW5nZSA9IHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVJbnB1dEJsdXIgPSB0aGlzLl9oYW5kbGVJbnB1dEJsdXIuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlSW5wdXRGb2N1cyA9IHRoaXMuX2hhbmRsZUlucHV0Rm9jdXMuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTW92ZURvd24gPSB0aGlzLl9oYW5kbGVNb3ZlRG93bi5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3ZlVXAgPSB0aGlzLl9oYW5kbGVNb3ZlVXAuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ2FuY2VsID0gdGhpcy5faGFuZGxlQ2FuY2VsLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUNvbmZpcm0gPSB0aGlzLl9oYW5kbGVDb25maXJtLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCA9XG4gICAgICB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBfc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIF9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOm1vdmUtdXAnLCB0aGlzLl9oYW5kbGVNb3ZlVXApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS1kb3duJywgdGhpcy5faGFuZGxlTW92ZURvd24pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y2FuY2VsJywgdGhpcy5faGFuZGxlQ2FuY2VsKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9oYW5kbGVDb25maXJtKSxcbiAgICAgIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLm9uRGlkQ2hhbmdlKHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSlcbiAgICApO1xuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdXBkYXRlU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdFVwZGF0ZSgpOiB2b2lkIHtcbiAgICAvLyBDYW5jZWwgcGVuZGluZyB1cGRhdGUuXG4gICAgaWYgKHRoaXMuX3VwZGF0ZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe2Vycm9yOiBudWxsLCBsb2FkaW5nT3B0aW9uczogdHJ1ZX0pO1xuXG4gICAgdGhpcy5fdXBkYXRlU3Vic2NyaXB0aW9uID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShcbiAgICAgIHRoaXMucHJvcHMucmVxdWVzdE9wdGlvbnModGhpcy5zdGF0ZS50ZXh0SW5wdXQpXG4gICAgKVxuICAgICAgLnN1YnNjcmliZShcbiAgICAgICAgb3B0aW9ucyA9PiB0aGlzLnJlY2VpdmVVcGRhdGUob3B0aW9ucyksXG4gICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3I6IGVyciwgbG9hZGluZ09wdGlvbnM6IGZhbHNlfSk7XG4gICAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZXF1ZXN0T3B0aW9uc0Vycm9yICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25SZXF1ZXN0T3B0aW9uc0Vycm9yKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgKTtcbiAgfVxuXG4gIHJlY2VpdmVVcGRhdGUobmV3T3B0aW9uczogQXJyYXk8c3RyaW5nPikge1xuICAgIGNvbnN0IGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuX2dldEZpbHRlcmVkT3B0aW9ucyhuZXdPcHRpb25zLCB0aGlzLnN0YXRlLnRleHRJbnB1dCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIGxvYWRpbmdPcHRpb25zOiBmYWxzZSxcbiAgICAgIG9wdGlvbnM6IG5ld09wdGlvbnMsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdFZhbHVlKG5ld1ZhbHVlOiBzdHJpbmcsIGRpZFJlbmRlckNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xuICAgIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLnNldFRleHQobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdGV4dElucHV0OiBuZXdWYWx1ZSxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IC0xLFxuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgIH0sIGRpZFJlbmRlckNhbGxiYWNrKTtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KG5ld1ZhbHVlKTtcbiAgICAvLyBTZWxlY3RpbmcgYSB2YWx1ZSBpbiB0aGUgZHJvcGRvd24gY2hhbmdlcyB0aGUgdGV4dCBhcyB3ZWxsLiBDYWxsIHRoZSBjYWxsYmFjayBhY2NvcmRpbmdseS5cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgfVxuXG4gIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10uZ2V0VGV4dCgpO1xuICB9XG5cbiAgLy8gVE9ETyB1c2UgbmF0aXZlIChmdXp6eS9zdHJpY3QgLSBjb25maWd1cmFibGU/KSBmaWx0ZXIgcHJvdmlkZXJcbiAgX2dldEZpbHRlcmVkT3B0aW9ucyhvcHRpb25zOiBBcnJheTxzdHJpbmc+LCBmaWx0ZXJWYWx1ZTogc3RyaW5nKTogQXJyYXk8Q29tYm9ib3hPcHRpb24+IHtcbiAgICBjb25zdCBsb3dlckNhc2VTdGF0ZSA9IGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgICAgIC5tYXAoXG4gICAgICAgIG9wdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWVMb3dlcmNhc2UgPSBvcHRpb24udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IG9wdGlvbixcbiAgICAgICAgICAgIHZhbHVlTG93ZXJjYXNlOiB2YWx1ZUxvd2VyY2FzZSxcbiAgICAgICAgICAgIG1hdGNoSW5kZXg6IHZhbHVlTG93ZXJjYXNlLmluZGV4T2YobG93ZXJDYXNlU3RhdGUpLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICkuZmlsdGVyKFxuICAgICAgICBvcHRpb24gPT4gb3B0aW9uLm1hdGNoSW5kZXggIT09IC0xXG4gICAgICApLnNsaWNlKDAsIHRoaXMucHJvcHMubWF4T3B0aW9uQ291bnQpO1xuICB9XG5cbiAgX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy5yZWZzLmZyZWVmb3JtSW5wdXQuZ2V0VGV4dCgpO1xuICAgIGlmIChuZXdUZXh0ID09PSB0aGlzLnN0YXRlLnRleHRJbnB1dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zLCBuZXdUZXh0KTtcbiAgICBsZXQgc2VsZWN0ZWRJbmRleDtcbiAgICBpZiAoZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlbid0IGFueSBvcHRpb25zLCBkb24ndCBzZWxlY3QgYW55dGhpbmcuXG4gICAgICBzZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPT09IC0xIHx8XG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA+PSBmaWx0ZXJlZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3B0aW9ucyBhbmQgdGhlIHNlbGVjdGVkIGluZGV4IGlzIG91dCBvZiBib3VuZHMsXG4gICAgICAvLyBkZWZhdWx0IHRvIHRoZSBmaXJzdCBpdGVtLlxuICAgICAgc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdGV4dElucHV0OiBuZXdUZXh0LFxuICAgICAgb3B0aW9uc1Zpc2libGU6IHRydWUsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcbiAgICAgIHNlbGVjdGVkSW5kZXgsXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdUZXh0KTtcbiAgfVxuXG4gIF9oYW5kbGVJbnB1dEZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe29wdGlvbnNWaXNpYmxlOiB0cnVlfSk7XG4gIH1cblxuICBfaGFuZGxlSW5wdXRCbHVyKCk6IHZvaWQge1xuICAgIC8vIERlbGF5IGhpZGluZyB0aGUgY29tYm9ib3ggbG9uZyBlbm91Z2ggZm9yIGEgY2xpY2sgaW5zaWRlIHRoZSBjb21ib2JveCB0byB0cmlnZ2VyIG9uIGl0IGluXG4gICAgLy8gY2FzZSB0aGUgYmx1ciB3YXMgY2F1c2VkIGJ5IGEgY2xpY2sgaW5zaWRlIHRoZSBjb21ib2JveC4gMTUwbXMgaXMgZW1waXJpY2FsbHkgbG9uZyBlbm91Z2ggdG9cbiAgICAvLyBsZXQgdGhlIHN0YWNrIGNsZWFyIGZyb20gdGhpcyBibHVyIGV2ZW50IGFuZCBmb3IgdGhlIGNsaWNrIGV2ZW50IHRvIHRyaWdnZXIuXG4gICAgc2V0VGltZW91dCh0aGlzLl9oYW5kbGVDYW5jZWwsIDE1MCk7XG4gIH1cblxuICBfaGFuZGxlSXRlbUNsaWNrKHNlbGVjdGVkVmFsdWU6IHN0cmluZywgZXZlbnQ6IGFueSkge1xuICAgIHRoaXMuc2VsZWN0VmFsdWUoc2VsZWN0ZWRWYWx1ZSwgKCkgPT4ge1xuICAgICAgLy8gRm9jdXMgdGhlIGlucHV0IGFnYWluIGJlY2F1c2UgdGhlIGNsaWNrIHdpbGwgY2F1c2UgdGhlIGlucHV0IHRvIGJsdXIuIFRoaXMgbWltaWNzIG5hdGl2ZVxuICAgICAgLy8gPHNlbGVjdD4gYmVoYXZpb3IgYnkga2VlcGluZyBmb2N1cyBpbiB0aGUgZm9ybSBiZWluZyBlZGl0ZWQuXG4gICAgICBjb25zdCBpbnB1dCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddKTtcbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZU1vdmVEb3duKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRJbmRleDogTWF0aC5taW4oXG4gICAgICAgIHRoaXMucHJvcHMubWF4T3B0aW9uQ291bnQgLSAxLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggKyAxLFxuICAgICAgICB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggLSAxLFxuICAgICAgKSxcbiAgICB9LCB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQpO1xuICB9XG5cbiAgX2hhbmRsZU1vdmVVcCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggLSAxLFxuICAgICAgKSxcbiAgICB9LCB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQpO1xuICB9XG5cbiAgX2hhbmRsZUNhbmNlbCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVDb25maXJtKCkge1xuICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zW3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleF07XG4gICAgaWYgKG9wdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNlbGVjdFZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgX3NldFNlbGVjdGVkSW5kZXgoc2VsZWN0ZWRJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleH0pO1xuICB9XG5cbiAgX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCgpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2VsZWN0ZWRPcHRpb24nXSk7XG4gICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICBzZWxlY3RlZE9wdGlvbi5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IG9wdGlvbnNDb250YWluZXI7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtdO1xuXG4gICAgaWYgKHRoaXMucHJvcHMubG9hZGluZ01lc3NhZ2UgJiYgdGhpcy5zdGF0ZS5sb2FkaW5nT3B0aW9ucykge1xuICAgICAgb3B0aW9ucy5wdXNoKFxuICAgICAgICA8bGkga2V5PVwibG9hZGluZy10ZXh0XCIgY2xhc3NOYW1lPVwibG9hZGluZ1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImxvYWRpbmctbWVzc2FnZVwiPnt0aGlzLnByb3BzLmxvYWRpbmdNZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPC9saT5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgIT0gbnVsbCAmJiB0aGlzLnByb3BzLmZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLnByb3BzLmZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlKHRoaXMuc3RhdGUuZXJyb3IpO1xuICAgICAgb3B0aW9ucy5wdXNoKFxuICAgICAgICA8bGkgY2xhc3NOYW1lPVwidGV4dC1lcnJvclwiPlxuICAgICAgICAgIHttZXNzYWdlfVxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5vcHRpb25zVmlzaWJsZSkge1xuICAgICAgb3B0aW9ucy5wdXNoKC4uLnRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLm1hcCgob3B0aW9uLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGJlZm9yZU1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZygwLCBvcHRpb24ubWF0Y2hJbmRleCk7XG4gICAgICAgIGNvbnN0IGVuZE9mTWF0Y2hJbmRleCA9IG9wdGlvbi5tYXRjaEluZGV4ICsgdGhpcy5zdGF0ZS50ZXh0SW5wdXQubGVuZ3RoO1xuICAgICAgICBjb25zdCBoaWdobGlnaHRlZE1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICBvcHRpb24ubWF0Y2hJbmRleCxcbiAgICAgICAgICBlbmRPZk1hdGNoSW5kZXhcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWZ0ZXJNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgZW5kT2ZNYXRjaEluZGV4LFxuICAgICAgICAgIG9wdGlvbi52YWx1ZS5sZW5ndGhcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGkgPT09IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGlcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aXNTZWxlY3RlZCA/ICdzZWxlY3RlZCcgOiBudWxsfVxuICAgICAgICAgICAga2V5PXtvcHRpb24udmFsdWV9XG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVJdGVtQ2xpY2suYmluZCh0aGlzLCBvcHRpb24udmFsdWUpfVxuICAgICAgICAgICAgb25Nb3VzZU92ZXI9e3RoaXMuX3NldFNlbGVjdGVkSW5kZXguYmluZCh0aGlzLCBpKX1cbiAgICAgICAgICAgIHJlZj17aXNTZWxlY3RlZCA/ICdzZWxlY3RlZE9wdGlvbicgOiBudWxsfT5cbiAgICAgICAgICAgIHtiZWZvcmVNYXRjaH1cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwidGV4dC1oaWdobGlnaHRcIj57aGlnaGxpZ2h0ZWRNYXRjaH08L3N0cm9uZz5cbiAgICAgICAgICAgIHthZnRlck1hdGNofVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9KSk7XG5cbiAgICAgIGlmICghb3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgb3B0aW9ucy5wdXNoKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ0ZXh0LXN1YnRsZVwiIGtleT1cIm5vLXJlc3VsdHMtZm91bmRcIj5cbiAgICAgICAgICAgIE5vIHJlc3VsdHMgZm91bmRcbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zQ29udGFpbmVyID0gKFxuICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIHtvcHRpb25zfVxuICAgICAgICA8L29sPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBpbml0aWFsVGV4dElucHV0LFxuICAgICAgcGxhY2Vob2xkZXJUZXh0LFxuICAgICAgc2l6ZSxcbiAgICAgIHdpZHRoLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17J3NlbGVjdC1saXN0IHBvcG92ZXItbGlzdCBwb3BvdmVyLWxpc3Qtc3VidGxlICcgKyB0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgICAgc3R5bGU9e3t3aWR0aDogYCR7d2lkdGh9cHhgfX0+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICBpbml0aWFsVmFsdWU9e2luaXRpYWxUZXh0SW5wdXR9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLl9oYW5kbGVJbnB1dEJsdXJ9XG4gICAgICAgICAgb25Gb2N1cz17dGhpcy5faGFuZGxlSW5wdXRGb2N1c31cbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9e3BsYWNlaG9sZGVyVGV4dH1cbiAgICAgICAgICByZWY9XCJmcmVlZm9ybUlucHV0XCJcbiAgICAgICAgICBzaXplPXtzaXplfVxuICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgLz5cbiAgICAgICAge29wdGlvbnNDb250YWluZXJ9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cbiJdfQ==