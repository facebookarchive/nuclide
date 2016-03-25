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

var AtomInput = require('../../nuclide-ui-atom-input');

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
      onChange: emptyfunction,
      onSelect: emptyfunction,
      width: 200
    },
    enumerable: true
  }]);

  function AtomComboBox(props) {
    _classCallCheck(this, AtomComboBox);

    _get(Object.getPrototypeOf(AtomComboBox.prototype), 'constructor', this).call(this, props);
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

  return AtomComboBox;
})(React.Component);

module.exports = AtomComboBox;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0b21Db21ib0JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBaUJlLElBQUk7Ozs7Ozs7Ozs7OztlQUVXLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXRDLG1CQUFtQixZQUFuQixtQkFBbUI7O0FBQzFCLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDOztnQkFJckQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUYzQixLQUFLLGFBQUwsS0FBSztJQUNMLFFBQVEsYUFBUixRQUFROztBQUdWLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7SUFFeEMsU0FBUyxHQUFJLEtBQUssQ0FBbEIsU0FBUzs7Ozs7Ozs7Ozs7SUFvQlYsWUFBWTtZQUFaLFlBQVk7O2VBQVosWUFBWTs7V0FLRztBQUNqQixlQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3RDLHNDQUFnQyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ2hELHNCQUFnQixFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ2xDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDaEMscUJBQWUsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUNqQyxvQkFBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUMzQyxjQUFRLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ25DLDJCQUFxQixFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ3JDLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7Ozs7O0FBS25DLG9CQUFjLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQ3pDLFVBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxXQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU07S0FDeEI7Ozs7V0FFcUI7QUFDcEIsZUFBUyxFQUFFLEVBQUU7QUFDYixvQkFBYyxFQUFFLEVBQUU7QUFDbEIsY0FBUSxFQUFFLGFBQWE7QUFDdkIsY0FBUSxFQUFFLGFBQWE7QUFDdkIsV0FBSyxFQUFFLEdBQUc7S0FDWDs7OztBQUVVLFdBaENQLFlBQVksQ0FnQ0osS0FBYSxFQUFFOzBCQWhDdkIsWUFBWTs7QUFpQ2QsK0JBakNFLFlBQVksNkNBaUNSLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxXQUFLLEVBQUUsSUFBSTtBQUNYLHFCQUFlLEVBQUUsRUFBRTtBQUNuQixvQkFBYyxFQUFFLEtBQUs7QUFDckIsYUFBTyxFQUFFLEVBQUU7QUFDWCxvQkFBYyxFQUFFLEtBQUs7QUFDckIsbUJBQWEsRUFBRSxDQUFDLENBQUM7QUFDakIsZUFBUyxFQUFFLEtBQUssQ0FBQyxnQkFBZ0I7S0FDbEMsQ0FBQztBQUNGLEFBQUMsUUFBSSxDQUFPLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxRCxBQUFDLFFBQUksQ0FBTyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLEFBQUMsUUFBSSxDQUFPLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsQUFBQyxRQUFJLENBQU8saUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsQUFBQyxRQUFJLENBQU8sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFELEFBQUMsUUFBSSxDQUFPLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxRCxBQUFDLFFBQUksQ0FBTyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUQsQUFBQyxRQUFJLENBQU8scUNBQXFDLEdBQy9DLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekQ7O2VBckRHLFlBQVk7O1dBdURDLDZCQUFHO0FBQ2xCLFVBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7QUFDdkUsb0JBQWMsQ0FBQyxHQUFHLENBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUMzRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUMvRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUNwRSxDQUFDO0FBQ0YsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ3RCOzs7V0FFbUIsZ0NBQUc7QUFDckIsVUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDL0I7QUFDRCxVQUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDcEMsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3BDO0tBQ0Y7OztXQUVZLHlCQUFTOzs7O0FBRXBCLFVBQUksSUFBSSxDQUFDLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUNwQyxZQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEM7O0FBRUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7O0FBRW5ELFVBQUksQ0FBQyxtQkFBbUIsR0FBRyxnQkFBRyxVQUFVLENBQUMsV0FBVyxDQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUNoRCxDQUNFLFNBQVMsQ0FDUixVQUFBLE9BQU87ZUFBSSxNQUFLLGFBQWEsQ0FBQyxPQUFPLENBQUM7T0FBQSxFQUN0QyxVQUFBLEdBQUcsRUFBSTtBQUNMLGNBQUssUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztBQUNuRCxZQUFJLE1BQUssS0FBSyxDQUFDLHFCQUFxQixJQUFJLElBQUksRUFBRTtBQUM1QyxnQkFBSyxLQUFLLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkM7T0FDRixDQUNGLENBQUM7S0FDTDs7O1dBRVksdUJBQUMsVUFBeUIsRUFBRTtBQUN2QyxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkYsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGFBQUssRUFBRSxJQUFJO0FBQ1gsc0JBQWMsRUFBRSxLQUFLO0FBQ3JCLGVBQU8sRUFBRSxVQUFVO0FBQ25CLHVCQUFlLEVBQUUsZUFBZTtPQUNqQyxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsUUFBZ0IsRUFBRSxpQkFBOEIsRUFBRTtBQUM1RCxVQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQVMsRUFBRSxRQUFRO0FBQ25CLHFCQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLHNCQUFjLEVBQUUsS0FBSztPQUN0QixFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDdEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTlCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQy9COzs7V0FFTSxtQkFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0M7Ozs7O1dBR2tCLDZCQUFDLE9BQXNCLEVBQUUsV0FBbUIsRUFBeUI7QUFDdEYsVUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pELGFBQU8sT0FBTyxDQUNYLEdBQUcsQ0FDRixVQUFBLE1BQU0sRUFBSTtBQUNSLFlBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM1QyxlQUFPO0FBQ0wsZUFBSyxFQUFFLE1BQU07QUFDYix3QkFBYyxFQUFFLGNBQWM7QUFDOUIsb0JBQVUsRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztTQUNuRCxDQUFDO09BQ0gsQ0FDRixDQUFDLE1BQU0sQ0FDTixVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQztPQUFBLENBQ25DLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7V0FFcUIsa0NBQVM7QUFDN0IsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEQsVUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDcEMsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RSxVQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLFVBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWhDLHFCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDcEIsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxJQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFOzs7QUFHdEQscUJBQWEsR0FBRyxDQUFDLENBQUM7T0FDbkIsTUFBTTtBQUNMLHFCQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7T0FDMUM7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQVMsRUFBRSxPQUFPO0FBQ2xCLHNCQUFjLEVBQUUsSUFBSTtBQUNwQix1QkFBZSxFQUFFLGVBQWU7QUFDaEMscUJBQWEsRUFBYixhQUFhO09BQ2QsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7OztXQUVnQiw2QkFBUztBQUN4QixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDckIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFZSw0QkFBUzs7OztBQUl2QixnQkFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckM7OztXQUVlLDBCQUFDLGFBQXFCLEVBQUUsS0FBVSxFQUFFOzs7QUFDbEQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsWUFBTTs7O0FBR3BDLFlBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUMvRCxZQUFJLEtBQUssRUFBRTtBQUNULGVBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNmO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLDJCQUFHO0FBQ2hCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLENBQUMsRUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUN0QztPQUNGLEVBQUUsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FDaEQ7OztXQUVZLHlCQUFHO0FBQ2QsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHFCQUFhLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FDckIsQ0FBQyxFQUNELElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FDN0I7T0FDRixFQUFFLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFWSx5QkFBRztBQUNkLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixzQkFBYyxFQUFFLEtBQUs7T0FDdEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVhLDBCQUFHO0FBQ2YsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNwRSxVQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDeEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDaEM7S0FDRjs7O1dBRWdCLDJCQUFDLGFBQXFCLEVBQUU7QUFDdkMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGFBQWEsRUFBYixhQUFhLEVBQUMsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFb0MsaURBQVM7QUFDNUMsVUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUN6RSxVQUFJLGNBQWMsRUFBRTtBQUNsQixzQkFBYyxDQUFDLHNCQUFzQixFQUFFLENBQUM7T0FDekM7S0FDRjs7O1dBRUssa0JBQWlCOzs7QUFDckIsVUFBSSxnQkFBZ0IsWUFBQSxDQUFDO0FBQ3JCLFVBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRTtBQUMxRCxlQUFPLENBQUMsSUFBSSxDQUNWOztZQUFJLEdBQUcsRUFBQyxjQUFjLEVBQUMsU0FBUyxFQUFDLFNBQVM7VUFDeEM7O2NBQU0sU0FBUyxFQUFDLGlCQUFpQjtZQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYztXQUFRO1NBQ2pFLENBQ04sQ0FBQztPQUNIOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLElBQUksSUFBSSxFQUFFO0FBQ25GLFlBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5RSxlQUFPLENBQUMsSUFBSSxDQUNWOztZQUFJLFNBQVMsRUFBQyxZQUFZO1VBQ3ZCLE9BQU87U0FDTCxDQUNOLENBQUM7T0FDSDs7QUFFRCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFO0FBQzdCLGVBQU8sQ0FBQyxJQUFJLE1BQUEsQ0FBWixPQUFPLHFCQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUs7QUFDNUQsY0FBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqRSxjQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLE9BQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDeEUsY0FBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDN0MsTUFBTSxDQUFDLFVBQVUsRUFDakIsZUFBZSxDQUNoQixDQUFDO0FBQ0YsY0FBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQ3ZDLGVBQWUsRUFDZixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FDcEIsQ0FBQztBQUNGLGNBQU0sVUFBVSxHQUFHLENBQUMsS0FBSyxPQUFLLEtBQUssQ0FBQyxhQUFhLENBQUM7QUFDbEQsaUJBQ0U7OztBQUNFLHVCQUFTLEVBQUUsVUFBVSxHQUFHLFVBQVUsR0FBRyxJQUFJLEFBQUM7QUFDMUMsaUJBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxBQUFDO0FBQ2xCLHFCQUFPLEVBQUUsT0FBSyxnQkFBZ0IsQ0FBQyxJQUFJLFNBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxBQUFDO0FBQ3hELHlCQUFXLEVBQUUsT0FBSyxpQkFBaUIsQ0FBQyxJQUFJLFNBQU8sQ0FBQyxDQUFDLEFBQUM7QUFDbEQsaUJBQUcsRUFBRSxVQUFVLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxBQUFDO1lBQ3pDLFdBQVc7WUFDWjs7Z0JBQVEsU0FBUyxFQUFDLGdCQUFnQjtjQUFFLGdCQUFnQjthQUFVO1lBQzdELFVBQVU7V0FDUixDQUNMO1NBQ0gsQ0FBQyxFQUFDLENBQUM7O0FBRUosWUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbkIsaUJBQU8sQ0FBQyxJQUFJLENBQ1Y7O2NBQUksU0FBUyxFQUFDLGFBQWEsRUFBQyxHQUFHLEVBQUMsa0JBQWtCOztXQUU3QyxDQUNOLENBQUM7U0FDSDs7QUFFRCx3QkFBZ0IsR0FDZDs7WUFBSSxTQUFTLEVBQUMsWUFBWTtVQUN2QixPQUFPO1NBQ0wsQUFDTixDQUFDO09BQ0g7O21CQU9HLElBQUksQ0FBQyxLQUFLO1VBSlosZ0JBQWdCLFVBQWhCLGdCQUFnQjtVQUNoQixlQUFlLFVBQWYsZUFBZTtVQUNmLElBQUksVUFBSixJQUFJO1VBQ0osS0FBSyxVQUFMLEtBQUs7O0FBRVAsYUFDRTs7VUFBSyxTQUFTLEVBQUUsK0NBQStDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7QUFDbEYsZUFBSyxFQUFFLEVBQUMsS0FBSyxFQUFLLEtBQUssT0FBSSxFQUFDLEFBQUM7UUFDaEMsb0JBQUMsU0FBUztBQUNSLHNCQUFZLEVBQUUsZ0JBQWdCLEFBQUM7QUFDL0IsZ0JBQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEFBQUM7QUFDOUIsaUJBQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEFBQUM7QUFDaEMseUJBQWUsRUFBRSxlQUFlLEFBQUM7QUFDakMsYUFBRyxFQUFDLGVBQWU7QUFDbkIsY0FBSSxFQUFFLElBQUksQUFBQztBQUNYLGVBQUssRUFBRSxLQUFLLEFBQUM7VUFDYjtRQUNELGdCQUFnQjtPQUNiLENBQ047S0FDSDs7O1NBalVHLFlBQVk7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFxVTFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkF0b21Db21ib0JveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgQ29tYm9ib3hPcHRpb24gPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHZhbHVlTG93ZXJjYXNlOiBzdHJpbmc7XG4gIG1hdGNoSW5kZXg6IG51bWJlcjtcbn07XG5cbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtdWktYXRvbS1pbnB1dCcpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3QgZW1wdHlmdW5jdGlvbiA9IHJlcXVpcmUoJ2VtcHR5ZnVuY3Rpb24nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBTdGF0ZSA9IHtcbiAgZXJyb3I6ID9FcnJvcjtcbiAgZmlsdGVyZWRPcHRpb25zOiBBcnJheTxPYmplY3Q+O1xuICBsb2FkaW5nT3B0aW9uczogYm9vbGVhbjtcbiAgb3B0aW9uczogQXJyYXk8c3RyaW5nPjtcbiAgb3B0aW9uc1Zpc2libGU6IGJvb2xlYW47XG4gIHNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgdGV4dElucHV0OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgQ29tYm8gQm94LlxuICogVE9ETyBhbGxvdyBtYWtpbmcgdGV4dCBpbnB1dCBub24tZWRpdGFibGUgdmlhIHByb3BzXG4gKiBUT0RPIG9wZW4vY2xvc2Ugb3B0aW9ucyBkcm9wZG93biB1cG9uIGZvY3VzL2JsdXJcbiAqIFRPRE8gYWRkIHB1YmxpYyBnZXR0ZXIvc2V0dGVyIGZvciB0ZXh0SW5wdXRcbiAqIFRPRE8gdXNlIGdlbmVyaWMgc2VhcmNoIHByb3ZpZGVyXG4gKiBUT0RPIG1vdmUgY29tYm9ib3ggdG8gc2VwYXJhdGUgcGFja2FnZS5cbiAqL1xuY2xhc3MgQXRvbUNvbWJvQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGU6IFN0YXRlO1xuICBfdXBkYXRlU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIGZvcm1hdFJlcXVlc3RPcHRpb25zRXJyb3JNZXNzYWdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBpbml0aWFsVGV4dElucHV0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGxvYWRpbmdNZXNzYWdlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtYXhPcHRpb25Db3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uUmVxdWVzdE9wdGlvbnNFcnJvcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25TZWxlY3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLyoqXG4gICAgICogcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb247IEdldHMgY2FsbGVkIHdpdGhcbiAgICAgKiB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgaW5wdXQgZmllbGQgYXMgaXRzIG9ubHkgYXJndW1lbnRcbiAgICAgKi9cbiAgICByZXF1ZXN0T3B0aW9uczogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaXplOiBQcm9wVHlwZXMub25lT2YoWyd4cycsICdzbScsICdsZyddKSxcbiAgICB3aWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNsYXNzTmFtZTogJycsXG4gICAgbWF4T3B0aW9uQ291bnQ6IDEwLFxuICAgIG9uQ2hhbmdlOiBlbXB0eWZ1bmN0aW9uLFxuICAgIG9uU2VsZWN0OiBlbXB0eWZ1bmN0aW9uLFxuICAgIHdpZHRoOiAyMDAsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZXJyb3I6IG51bGwsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IFtdLFxuICAgICAgbG9hZGluZ09wdGlvbnM6IGZhbHNlLFxuICAgICAgb3B0aW9uczogW10sXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIHRleHRJbnB1dDogcHJvcHMuaW5pdGlhbFRleHRJbnB1dCxcbiAgICB9O1xuICAgICh0aGlzOiBhbnkpLnJlY2VpdmVVcGRhdGUgPSB0aGlzLnJlY2VpdmVVcGRhdGUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlVGV4dElucHV0Q2hhbmdlID0gdGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUlucHV0Qmx1ciA9IHRoaXMuX2hhbmRsZUlucHV0Qmx1ci5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVJbnB1dEZvY3VzID0gdGhpcy5faGFuZGxlSW5wdXRGb2N1cy5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVNb3ZlRG93biA9IHRoaXMuX2hhbmRsZU1vdmVEb3duLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZU1vdmVVcCA9IHRoaXMuX2hhbmRsZU1vdmVVcC5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVDYW5jZWwgPSB0aGlzLl9oYW5kbGVDYW5jZWwuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlQ29uZmlybSA9IHRoaXMuX2hhbmRsZUNvbmZpcm0uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkID1cbiAgICAgIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS11cCcsIHRoaXMuX2hhbmRsZU1vdmVVcCksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLl9oYW5kbGVNb3ZlRG93biksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTpjYW5jZWwnLCB0aGlzLl9oYW5kbGVDYW5jZWwpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2hhbmRsZUNvbmZpcm0pLFxuICAgICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10ub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKVxuICAgICk7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl91cGRhdGVTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fdXBkYXRlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICByZXF1ZXN0VXBkYXRlKCk6IHZvaWQge1xuICAgIC8vIENhbmNlbCBwZW5kaW5nIHVwZGF0ZS5cbiAgICBpZiAodGhpcy5fdXBkYXRlU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7ZXJyb3I6IG51bGwsIGxvYWRpbmdPcHRpb25zOiB0cnVlfSk7XG5cbiAgICB0aGlzLl91cGRhdGVTdWJzY3JpcHRpb24gPSBSeC5PYnNlcnZhYmxlLmZyb21Qcm9taXNlKFxuICAgICAgdGhpcy5wcm9wcy5yZXF1ZXN0T3B0aW9ucyh0aGlzLnN0YXRlLnRleHRJbnB1dClcbiAgICApXG4gICAgICAuc3Vic2NyaWJlKFxuICAgICAgICBvcHRpb25zID0+IHRoaXMucmVjZWl2ZVVwZGF0ZShvcHRpb25zKSxcbiAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnJvcjogZXJyLCBsb2FkaW5nT3B0aW9uczogZmFsc2V9KTtcbiAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlcXVlc3RPcHRpb25zRXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlcXVlc3RPcHRpb25zRXJyb3IoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuICB9XG5cbiAgcmVjZWl2ZVVwZGF0ZShuZXdPcHRpb25zOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5fZ2V0RmlsdGVyZWRPcHRpb25zKG5ld09wdGlvbnMsIHRoaXMuc3RhdGUudGV4dElucHV0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgbG9hZGluZ09wdGlvbnM6IGZhbHNlLFxuICAgICAgb3B0aW9uczogbmV3T3B0aW9ucyxcbiAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0VmFsdWUobmV3VmFsdWU6IHN0cmluZywgZGlkUmVuZGVyQ2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10uc2V0VGV4dChuZXdWYWx1ZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0ZXh0SW5wdXQ6IG5ld1ZhbHVlLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgfSwgZGlkUmVuZGVyQ2FsbGJhY2spO1xuICAgIHRoaXMucHJvcHMub25TZWxlY3QobmV3VmFsdWUpO1xuICAgIC8vIFNlbGVjdGluZyBhIHZhbHVlIGluIHRoZSBkcm9wZG93biBjaGFuZ2VzIHRoZSB0ZXh0IGFzIHdlbGwuIENhbGwgdGhlIGNhbGxiYWNrIGFjY29yZGluZ2x5LlxuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXS5nZXRUZXh0KCk7XG4gIH1cblxuICAvLyBUT0RPIHVzZSBuYXRpdmUgKGZ1enp5L3N0cmljdCAtIGNvbmZpZ3VyYWJsZT8pIGZpbHRlciBwcm92aWRlclxuICBfZ2V0RmlsdGVyZWRPcHRpb25zKG9wdGlvbnM6IEFycmF5PHN0cmluZz4sIGZpbHRlclZhbHVlOiBzdHJpbmcpOiBBcnJheTxDb21ib2JveE9wdGlvbj4ge1xuICAgIGNvbnN0IGxvd2VyQ2FzZVN0YXRlID0gZmlsdGVyVmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICByZXR1cm4gb3B0aW9uc1xuICAgICAgLm1hcChcbiAgICAgICAgb3B0aW9uID0+IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZUxvd2VyY2FzZSA9IG9wdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogb3B0aW9uLFxuICAgICAgICAgICAgdmFsdWVMb3dlcmNhc2U6IHZhbHVlTG93ZXJjYXNlLFxuICAgICAgICAgICAgbWF0Y2hJbmRleDogdmFsdWVMb3dlcmNhc2UuaW5kZXhPZihsb3dlckNhc2VTdGF0ZSksXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgKS5maWx0ZXIoXG4gICAgICAgIG9wdGlvbiA9PiBvcHRpb24ubWF0Y2hJbmRleCAhPT0gLTFcbiAgICAgICkuc2xpY2UoMCwgdGhpcy5wcm9wcy5tYXhPcHRpb25Db3VudCk7XG4gIH1cblxuICBfaGFuZGxlVGV4dElucHV0Q2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IG5ld1RleHQgPSB0aGlzLnJlZnMuZnJlZWZvcm1JbnB1dC5nZXRUZXh0KCk7XG4gICAgaWYgKG5ld1RleHQgPT09IHRoaXMuc3RhdGUudGV4dElucHV0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgIGNvbnN0IGZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuX2dldEZpbHRlcmVkT3B0aW9ucyh0aGlzLnN0YXRlLm9wdGlvbnMsIG5ld1RleHQpO1xuICAgIGxldCBzZWxlY3RlZEluZGV4O1xuICAgIGlmIChmaWx0ZXJlZE9wdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmVuJ3QgYW55IG9wdGlvbnMsIGRvbid0IHNlbGVjdCBhbnl0aGluZy5cbiAgICAgIHNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA9PT0gLTEgfHxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID49IGZpbHRlcmVkT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBvcHRpb25zIGFuZCB0aGUgc2VsZWN0ZWQgaW5kZXggaXMgb3V0IG9mIGJvdW5kcyxcbiAgICAgIC8vIGRlZmF1bHQgdG8gdGhlIGZpcnN0IGl0ZW0uXG4gICAgICBzZWxlY3RlZEluZGV4ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleDtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB0ZXh0SW5wdXQ6IG5ld1RleHQsXG4gICAgICBvcHRpb25zVmlzaWJsZTogdHJ1ZSxcbiAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgICAgc2VsZWN0ZWRJbmRleCxcbiAgICB9KTtcbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1RleHQpO1xuICB9XG5cbiAgX2hhbmRsZUlucHV0Rm9jdXMoKTogdm9pZCB7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7b3B0aW9uc1Zpc2libGU6IHRydWV9KTtcbiAgfVxuXG4gIF9oYW5kbGVJbnB1dEJsdXIoKTogdm9pZCB7XG4gICAgLy8gRGVsYXkgaGlkaW5nIHRoZSBjb21ib2JveCBsb25nIGVub3VnaCBmb3IgYSBjbGljayBpbnNpZGUgdGhlIGNvbWJvYm94IHRvIHRyaWdnZXIgb24gaXQgaW5cbiAgICAvLyBjYXNlIHRoZSBibHVyIHdhcyBjYXVzZWQgYnkgYSBjbGljayBpbnNpZGUgdGhlIGNvbWJvYm94LiAxNTBtcyBpcyBlbXBpcmljYWxseSBsb25nIGVub3VnaCB0b1xuICAgIC8vIGxldCB0aGUgc3RhY2sgY2xlYXIgZnJvbSB0aGlzIGJsdXIgZXZlbnQgYW5kIGZvciB0aGUgY2xpY2sgZXZlbnQgdG8gdHJpZ2dlci5cbiAgICBzZXRUaW1lb3V0KHRoaXMuX2hhbmRsZUNhbmNlbCwgMTUwKTtcbiAgfVxuXG4gIF9oYW5kbGVJdGVtQ2xpY2soc2VsZWN0ZWRWYWx1ZTogc3RyaW5nLCBldmVudDogYW55KSB7XG4gICAgdGhpcy5zZWxlY3RWYWx1ZShzZWxlY3RlZFZhbHVlLCAoKSA9PiB7XG4gICAgICAvLyBGb2N1cyB0aGUgaW5wdXQgYWdhaW4gYmVjYXVzZSB0aGUgY2xpY2sgd2lsbCBjYXVzZSB0aGUgaW5wdXQgdG8gYmx1ci4gVGhpcyBtaW1pY3MgbmF0aXZlXG4gICAgICAvLyA8c2VsZWN0PiBiZWhhdmlvciBieSBrZWVwaW5nIGZvY3VzIGluIHRoZSBmb3JtIGJlaW5nIGVkaXRlZC5cbiAgICAgIGNvbnN0IGlucHV0ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10pO1xuICAgICAgaWYgKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlTW92ZURvd24oKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBNYXRoLm1pbihcbiAgICAgICAgdGhpcy5wcm9wcy5tYXhPcHRpb25Db3VudCAtIDEsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCArIDEsXG4gICAgICAgIHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zLmxlbmd0aCAtIDEsXG4gICAgICApLFxuICAgIH0sIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCk7XG4gIH1cblxuICBfaGFuZGxlTW92ZVVwKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRJbmRleDogTWF0aC5tYXgoXG4gICAgICAgIDAsXG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCAtIDEsXG4gICAgICApLFxuICAgIH0sIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCk7XG4gIH1cblxuICBfaGFuZGxlQ2FuY2VsKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZUNvbmZpcm0oKSB7XG4gICAgY29uc3Qgb3B0aW9uID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnNbdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4XTtcbiAgICBpZiAob3B0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc2VsZWN0VmFsdWUob3B0aW9uLnZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBfc2V0U2VsZWN0ZWRJbmRleChzZWxlY3RlZEluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEluZGV4fSk7XG4gIH1cblxuICBfc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzWydzZWxlY3RlZE9wdGlvbiddKTtcbiAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgIHNlbGVjdGVkT3B0aW9uLnNjcm9sbEludG9WaWV3SWZOZWVkZWQoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgb3B0aW9uc0NvbnRhaW5lcjtcbiAgICBjb25zdCBvcHRpb25zID0gW107XG5cbiAgICBpZiAodGhpcy5wcm9wcy5sb2FkaW5nTWVzc2FnZSAmJiB0aGlzLnN0YXRlLmxvYWRpbmdPcHRpb25zKSB7XG4gICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIDxsaSBrZXk9XCJsb2FkaW5nLXRleHRcIiBjbGFzc05hbWU9XCJsb2FkaW5nXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibG9hZGluZy1tZXNzYWdlXCI+e3RoaXMucHJvcHMubG9hZGluZ01lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8L2xpPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAhPSBudWxsICYmIHRoaXMucHJvcHMuZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UgIT0gbnVsbCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMucHJvcHMuZm9ybWF0UmVxdWVzdE9wdGlvbnNFcnJvck1lc3NhZ2UodGhpcy5zdGF0ZS5lcnJvcik7XG4gICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgIDxsaSBjbGFzc05hbWU9XCJ0ZXh0LWVycm9yXCI+XG4gICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgIDwvbGk+XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN0YXRlLm9wdGlvbnNWaXNpYmxlKSB7XG4gICAgICBvcHRpb25zLnB1c2goLi4udGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubWFwKChvcHRpb24sIGkpID0+IHtcbiAgICAgICAgY29uc3QgYmVmb3JlTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKDAsIG9wdGlvbi5tYXRjaEluZGV4KTtcbiAgICAgICAgY29uc3QgZW5kT2ZNYXRjaEluZGV4ID0gb3B0aW9uLm1hdGNoSW5kZXggKyB0aGlzLnN0YXRlLnRleHRJbnB1dC5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgIG9wdGlvbi5tYXRjaEluZGV4LFxuICAgICAgICAgIGVuZE9mTWF0Y2hJbmRleFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhZnRlck1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICBlbmRPZk1hdGNoSW5kZXgsXG4gICAgICAgICAgb3B0aW9uLnZhbHVlLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gaSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkJyA6IG51bGx9XG4gICAgICAgICAgICBrZXk9e29wdGlvbi52YWx1ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMsIG9wdGlvbi52YWx1ZSl9XG4gICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5fc2V0U2VsZWN0ZWRJbmRleC5iaW5kKHRoaXMsIGkpfVxuICAgICAgICAgICAgcmVmPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkT3B0aW9uJyA6IG51bGx9PlxuICAgICAgICAgICAge2JlZm9yZU1hdGNofVxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ0ZXh0LWhpZ2hsaWdodFwiPntoaWdobGlnaHRlZE1hdGNofTwvc3Ryb25nPlxuICAgICAgICAgICAge2FmdGVyTWF0Y2h9XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH0pKTtcblxuICAgICAgaWYgKCFvcHRpb25zLmxlbmd0aCkge1xuICAgICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT1cInRleHQtc3VidGxlXCIga2V5PVwibm8tcmVzdWx0cy1mb3VuZFwiPlxuICAgICAgICAgICAgTm8gcmVzdWx0cyBmb3VuZFxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnNDb250YWluZXIgPSAoXG4gICAgICAgIDxvbCBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCI+XG4gICAgICAgICAge29wdGlvbnN9XG4gICAgICAgIDwvb2w+XG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGluaXRpYWxUZXh0SW5wdXQsXG4gICAgICBwbGFjZWhvbGRlclRleHQsXG4gICAgICBzaXplLFxuICAgICAgd2lkdGgsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnc2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IHBvcG92ZXItbGlzdC1zdWJ0bGUgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICAgICBzdHlsZT17e3dpZHRoOiBgJHt3aWR0aH1weGB9fT5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17aW5pdGlhbFRleHRJbnB1dH1cbiAgICAgICAgICBvbkJsdXI9e3RoaXMuX2hhbmRsZUlucHV0Qmx1cn1cbiAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9oYW5kbGVJbnB1dEZvY3VzfVxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD17cGxhY2Vob2xkZXJUZXh0fVxuICAgICAgICAgIHJlZj1cImZyZWVmb3JtSW5wdXRcIlxuICAgICAgICAgIHNpemU9e3NpemV9XG4gICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAvPlxuICAgICAgICB7b3B0aW9uc0NvbnRhaW5lcn1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21Db21ib0JveDtcbiJdfQ==