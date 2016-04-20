Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
        this._updateSubscription.unsubscribe();
      }
    }
  }, {
    key: 'requestUpdate',
    value: function requestUpdate() {
      var _this = this;

      // Cancel pending update.
      if (this._updateSubscription != null) {
        this._updateSubscription.unsubscribe();
      }

      this.setState({ error: null, loadingOptions: true });

      this._updateSubscription = _reactivexRxjs2['default'].Observable.fromPromise(this.props.requestOptions(this.state.textInput)).subscribe(function (options) {
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUNWOztjQUFJLFNBQVMsRUFBQyxhQUFhLEVBQUMsR0FBRyxFQUFDLGtCQUFrQjs7V0FFN0MsQ0FDTixDQUFDO1NBQ0g7O0FBRUQsd0JBQWdCLEdBQ2Q7O1lBQUksU0FBUyxFQUFDLFlBQVk7VUFDdkIsT0FBTztTQUNMLEFBQ04sQ0FBQztPQUNIOzttQkFPRyxJQUFJLENBQUMsS0FBSztVQUpaLGdCQUFnQixVQUFoQixnQkFBZ0I7VUFDaEIsZUFBZSxVQUFmLGVBQWU7VUFDZixJQUFJLFVBQUosSUFBSTtVQUNKLEtBQUssVUFBTCxLQUFLOztBQUVQLGFBQ0U7O1VBQUssU0FBUyxFQUFFLCtDQUErQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxBQUFDO0FBQ2xGLGVBQUssRUFBRSxFQUFDLEtBQUssRUFBSyxLQUFLLE9BQUksRUFBQyxBQUFDO1FBQ2hDLG9CQUFDLFNBQVM7QUFDUixzQkFBWSxFQUFFLGdCQUFnQixBQUFDO0FBQy9CLGdCQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixBQUFDO0FBQzlCLGlCQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixBQUFDO0FBQ2hDLHlCQUFlLEVBQUUsZUFBZSxBQUFDO0FBQ2pDLGFBQUcsRUFBQyxlQUFlO0FBQ25CLGNBQUksRUFBRSxJQUFJLEFBQUM7QUFDWCxlQUFLLEVBQUUsS0FBSyxBQUFDO1VBQ2I7UUFDRCxnQkFBZ0I7T0FDYixDQUNOO0tBQ0g7OztTQWpVVSxRQUFRO0dBQVMsS0FBSyxDQUFDLFNBQVMiLCJmaWxlIjoiQ29tYm9ib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG50eXBlIENvbWJvYm94T3B0aW9uID0ge1xuICB2YWx1ZTogc3RyaW5nO1xuICB2YWx1ZUxvd2VyY2FzZTogc3RyaW5nO1xuICBtYXRjaEluZGV4OiBudW1iZXI7XG59O1xuXG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge0F0b21JbnB1dH0gPSByZXF1aXJlKCcuL0F0b21JbnB1dCcpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgZXJyb3I6ID9FcnJvcjtcbiAgZmlsdGVyZWRPcHRpb25zOiBBcnJheTxPYmplY3Q+O1xuICBsb2FkaW5nT3B0aW9uczogYm9vbGVhbjtcbiAgb3B0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgb3B0aW9uc1Zpc2libGU6IGJvb2xlYW47XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgdGV4dElucHV0OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgQ29tYm8gQm94LlxuICogVE9ETyBhbGxvdyBtYWtpbmcgdGV4dCBpbnB1dCBub24tZWRpdGFibGUgdmlhIHByb3BzXG4gKiBUT0RPIG9wZW4vY2xvc2Ugb3B0aW9ucyBkcm9wZG93biB1cG9uIGZvY3VzL2JsdXJcbiAqIFRPRE8gYWRkIHB1YmxpYyBnZXR0ZXIvc2V0dGVyIGZvciB0ZXh0SW5wdXRcbiAqIFRPRE8gdXNlIGdlbmVyaWMgc2VhcmNoIHByb3ZpZGVyXG4gKiBUT0RPIG1vdmUgY29tYm9ib3ggdG8gc2VwYXJhdGUgcGFja2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbWJvYm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBfdXBkYXRlU3Vic2NyaXB0aW9uOiA/cngkSVN1YnNjcmlwdGlvbjtcbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIGluaXRpYWxUZXh0SW5wdXQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbG9hZGluZ01lc3NhZ2U6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG1heE9wdGlvbkNvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25SZXF1ZXN0T3B0aW9uc0Vycm9yOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblNlbGVjdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbjsgR2V0cyBjYWxsZWQgd2l0aFxuICAgICAqIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBpbnB1dCBmaWVsZCBhcyBpdHMgb25seSBhcmd1bWVudFxuICAgICAqL1xuICAgIHJlcXVlc3RPcHRpb25zOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICAgIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBtYXhPcHRpb25Db3VudDogMTAsXG4gICAgb25DaGFuZ2U6IChuZXdWYWx1ZTogc3RyaW5nKSA9PiB7fSxcbiAgICBvblNlbGVjdDogKG5ld1ZhbHVlOiBzdHJpbmcpID0+IHt9LFxuICAgIHdpZHRoOiAyMDAsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IFtdLFxuICAgICAgbG9hZGluZ09wdGlvbnM6IGZhbHNlLFxuICAgICAgb3B0aW9uczogW10sXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIHRleHRJbnB1dDogcHJvcHMuaW5pdGlhbFRleHRJbnB1dCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLnJlY2VpdmVVcGRhdGUgPSB0aGlzLnJlY2VpdmVVcGRhdGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlVGV4dElucHV0Q2hhbmdlID0gdGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUlucHV0Qmx1ciA9IHRoaXMuX2hhbmRsZUlucHV0Qmx1ci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVJbnB1dEZvY3VzID0gdGhpcy5faGFuZGxlSW5wdXRGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3ZlRG93biA9IHRoaXMuX2hhbmRsZU1vdmVEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdmVVcCA9IHRoaXMuX2hhbmRsZU1vdmVVcC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWwgPSB0aGlzLl9oYW5kbGVDYW5jZWwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ29uZmlybSA9IHRoaXMuX2hhbmRsZUNvbmZpcm0uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkID1cbiAgICAgIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS11cCcsIHRoaXMuX2hhbmRsZU1vdmVVcCksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLl9oYW5kbGVNb3ZlRG93biksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTpjYW5jZWwnLCB0aGlzLl9oYW5kbGVDYW5jZWwpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2hhbmRsZUNvbmZpcm0pLFxuICAgICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10ub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKVxuICAgICk7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl91cGRhdGVTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fdXBkYXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdFVwZGF0ZSgpOiB2b2lkIHtcbiAgICAvLyBDYW5jZWwgcGVuZGluZyB1cGRhdGUuXG4gICAgaWYgKHRoaXMuX3VwZGF0ZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtlcnJvcjogbnVsbCwgbG9hZGluZ09wdGlvbnM6IHRydWV9KTtcblxuICAgIHRoaXMuX3VwZGF0ZVN1YnNjcmlwdGlvbiA9IFJ4Lk9ic2VydmFibGUuZnJvbVByb21pc2UoXG4gICAgICB0aGlzLnByb3BzLnJlcXVlc3RPcHRpb25zKHRoaXMuc3RhdGUudGV4dElucHV0KVxuICAgIClcbiAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgIG9wdGlvbnMgPT4gdGhpcy5yZWNlaXZlVXBkYXRlKG9wdGlvbnMpLFxuICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2Vycm9yOiBlcnIsIGxvYWRpbmdPcHRpb25zOiBmYWxzZX0pO1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVxdWVzdE9wdGlvbnNFcnJvciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdE9wdGlvbnNFcnJvcihlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gIH1cblxuICByZWNlaXZlVXBkYXRlKG5ld09wdGlvbnM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnMobmV3T3B0aW9ucywgdGhpcy5zdGF0ZS50ZXh0SW5wdXQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBsb2FkaW5nT3B0aW9uczogZmFsc2UsXG4gICAgICBvcHRpb25zOiBuZXdPcHRpb25zLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH1cblxuICBzZWxlY3RWYWx1ZShuZXdWYWx1ZTogc3RyaW5nLCBkaWRSZW5kZXJDYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICB0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXS5zZXRUZXh0KG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VmFsdWUsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICB9LCBkaWRSZW5kZXJDYWxsYmFjayk7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChuZXdWYWx1ZSk7XG4gICAgLy8gU2VsZWN0aW5nIGEgdmFsdWUgaW4gdGhlIGRyb3Bkb3duIGNoYW5nZXMgdGhlIHRleHQgYXMgd2VsbC4gQ2FsbCB0aGUgY2FsbGJhY2sgYWNjb3JkaW5nbHkuXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLmdldFRleHQoKTtcbiAgfVxuXG4gIC8vIFRPRE8gdXNlIG5hdGl2ZSAoZnV6enkvc3RyaWN0IC0gY29uZmlndXJhYmxlPykgZmlsdGVyIHByb3ZpZGVyXG4gIF9nZXRGaWx0ZXJlZE9wdGlvbnMob3B0aW9uczogQXJyYXk8c3RyaW5nPiwgZmlsdGVyVmFsdWU6IHN0cmluZyk6IEFycmF5PENvbWJvYm94T3B0aW9uPiB7XG4gICAgY29uc3QgbG93ZXJDYXNlU3RhdGUgPSBmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBvcHRpb25zXG4gICAgICAubWFwKFxuICAgICAgICBvcHRpb24gPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlTG93ZXJjYXNlID0gb3B0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24sXG4gICAgICAgICAgICB2YWx1ZUxvd2VyY2FzZTogdmFsdWVMb3dlcmNhc2UsXG4gICAgICAgICAgICBtYXRjaEluZGV4OiB2YWx1ZUxvd2VyY2FzZS5pbmRleE9mKGxvd2VyQ2FzZVN0YXRlKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICApLmZpbHRlcihcbiAgICAgICAgb3B0aW9uID0+IG9wdGlvbi5tYXRjaEluZGV4ICE9PSAtMVxuICAgICAgKS5zbGljZSgwLCB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50KTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VGV4dCA9IHRoaXMucmVmcy5mcmVlZm9ybUlucHV0LmdldFRleHQoKTtcbiAgICBpZiAobmV3VGV4dCA9PT0gdGhpcy5zdGF0ZS50ZXh0SW5wdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgY29uc3QgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5fZ2V0RmlsdGVyZWRPcHRpb25zKHRoaXMuc3RhdGUub3B0aW9ucywgbmV3VGV4dCk7XG4gICAgbGV0IHNlbGVjdGVkSW5kZXg7XG4gICAgaWYgKGZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZW4ndCBhbnkgb3B0aW9ucywgZG9uJ3Qgc2VsZWN0IGFueXRoaW5nLlxuICAgICAgc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID09PSAtMSB8fFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPj0gZmlsdGVyZWRPcHRpb25zLmxlbmd0aCkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlIG9wdGlvbnMgYW5kIHRoZSBzZWxlY3RlZCBpbmRleCBpcyBvdXQgb2YgYm91bmRzLFxuICAgICAgLy8gZGVmYXVsdCB0byB0aGUgZmlyc3QgaXRlbS5cbiAgICAgIHNlbGVjdGVkSW5kZXggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VGV4dCxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiB0cnVlLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICBzZWxlY3RlZEluZGV4LFxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VGV4dCk7XG4gIH1cblxuICBfaGFuZGxlSW5wdXRGb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zVmlzaWJsZTogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZUlucHV0Qmx1cigpOiB2b2lkIHtcbiAgICAvLyBEZWxheSBoaWRpbmcgdGhlIGNvbWJvYm94IGxvbmcgZW5vdWdoIGZvciBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3ggdG8gdHJpZ2dlciBvbiBpdCBpblxuICAgIC8vIGNhc2UgdGhlIGJsdXIgd2FzIGNhdXNlZCBieSBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3guIDE1MG1zIGlzIGVtcGlyaWNhbGx5IGxvbmcgZW5vdWdoIHRvXG4gICAgLy8gbGV0IHRoZSBzdGFjayBjbGVhciBmcm9tIHRoaXMgYmx1ciBldmVudCBhbmQgZm9yIHRoZSBjbGljayBldmVudCB0byB0cmlnZ2VyLlxuICAgIHNldFRpbWVvdXQodGhpcy5faGFuZGxlQ2FuY2VsLCAxNTApO1xuICB9XG5cbiAgX2hhbmRsZUl0ZW1DbGljayhzZWxlY3RlZFZhbHVlOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnNlbGVjdFZhbHVlKHNlbGVjdGVkVmFsdWUsICgpID0+IHtcbiAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCBhZ2FpbiBiZWNhdXNlIHRoZSBjbGljayB3aWxsIGNhdXNlIHRoZSBpbnB1dCB0byBibHVyLiBUaGlzIG1pbWljcyBuYXRpdmVcbiAgICAgIC8vIDxzZWxlY3Q+IGJlaGF2aW9yIGJ5IGtlZXBpbmcgZm9jdXMgaW4gdGhlIGZvcm0gYmVpbmcgZWRpdGVkLlxuICAgICAgY29uc3QgaW5wdXQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXSk7XG4gICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlRG93bigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IE1hdGgubWluKFxuICAgICAgICB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50IC0gMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ICsgMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlVXAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4IC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWwoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlQ29uZmlybSgpIHtcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9uc1t0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXhdO1xuICAgIGlmIChvcHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEluZGV4KHNlbGVjdGVkSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXh9KTtcbiAgfVxuXG4gIF9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGVkT3B0aW9uJ10pO1xuICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgc2VsZWN0ZWRPcHRpb24uc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdC5FbGVtZW50IHtcbiAgICBsZXQgb3B0aW9uc0NvbnRhaW5lcjtcbiAgICBjb25zdCBvcHRpb25zID0gW107XG5cbiAgICBpZiAodGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZSAmJiB0aGlzLnN0YXRlLmxvYWRpbmdPcHRpb25zKSB7XG4gICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIDxsaSBrZXk9XCJsb2FkaW5nLXRleHRcIiBjbGFzc05hbWU9XCJsb2FkaW5nXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZy1tZXNzYWdlXCI+e3RoaXMucHJvcHMubG9hZGluZ01lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAhPSBudWxsICYmIHRoaXMucHJvcHMuZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMucHJvcHMuZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UodGhpcy5zdGF0ZS5lcnJvcik7XG4gICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIDxsaSBjbGFzc05hbWU9XCJ0ZXh0LWVycm9yXCI+XG4gICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLm9wdGlvbnNWaXNpYmxlKSB7XG4gICAgICBvcHRpb25zLnB1c2goLi4udGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubWFwKChvcHRpb24sIGkpID0+IHtcbiAgICAgICAgY29uc3QgYmVmb3JlTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKDAsIG9wdGlvbi5tYXRjaEluZGV4KTtcbiAgICAgICAgY29uc3QgZW5kT2ZNYXRjaEluZGV4ID0gb3B0aW9uLm1hdGNoSW5kZXggKyB0aGlzLnN0YXRlLnRleHRJbnB1dC5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgIG9wdGlvbi5tYXRjaEluZGV4LFxuICAgICAgICAgIGVuZE9mTWF0Y2hJbmRleFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhZnRlck1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICBlbmRPZk1hdGNoSW5kZXgsXG4gICAgICAgICAgb3B0aW9uLnZhbHVlLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gaSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkJyA6IG51bGx9XG4gICAgICAgICAgICBrZXk9e29wdGlvbi52YWx1ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMsIG9wdGlvbi52YWx1ZSl9XG4gICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5fc2V0U2VsZWN0ZWRJbmRleC5iaW5kKHRoaXMsIGkpfVxuICAgICAgICAgICAgcmVmPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkT3B0aW9uJyA6IG51bGx9PlxuICAgICAgICAgICAge2JlZm9yZU1hdGNofVxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ0ZXh0LWhpZ2hsaWdodFwiPntoaWdobGlnaHRlZE1hdGNofTwvc3Ryb25nPlxuICAgICAgICAgICAge2FmdGVyTWF0Y2h9XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH0pKTtcblxuICAgICAgaWYgKCFvcHRpb25zLmxlbmd0aCkge1xuICAgICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT1cInRleHQtc3VidGxlXCIga2V5PVwibm8tcmVzdWx0cy1mb3VuZFwiPlxuICAgICAgICAgICAgTm8gcmVzdWx0cyBmb3VuZFxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnNDb250YWluZXIgPSAoXG4gICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG4gICAgICAgICAge29wdGlvbnN9XG4gICAgICAgIDwvb2w+XG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGluaXRpYWxUZXh0SW5wdXQsXG4gICAgICBwbGFjZWhvbGRlclRleHQsXG4gICAgICBzaXplLFxuICAgICAgd2lkdGgsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnc2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IHBvcG92ZXItbGlzdC1zdWJ0bGUgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICAgICBzdHlsZT17e3dpZHRoOiBgJHt3aWR0aH1weGB9fT5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17aW5pdGlhbFRleHRJbnB1dH1cbiAgICAgICAgICBvbkJsdXI9e3RoaXMuX2hhbmRsZUlucHV0Qmx1cn1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9oYW5kbGVJbnB1dEZvY3VzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD17cGxhY2Vob2xkZXJUZXh0fVxuICAgICAgICAgIHJlZj1cImZyZWVmb3JtSW5wdXRcIlxuICAgICAgICAgIHNpemU9e3NpemV9XG4gICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAvPlxuICAgICAgICB7b3B0aW9uc0NvbnRhaW5lcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuIl19