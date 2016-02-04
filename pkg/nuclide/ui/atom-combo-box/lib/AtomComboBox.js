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
        var options = this.state.filteredOptions.map(function (option, i) {
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
//# sourceMappingURL=data:application/json;base64,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Z0JBQWdCO09BQ2IsQ0FDTjtLQUNIOzs7U0F2UUcsWUFBWTtHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTJRMUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoiQXRvbUNvbWJvQm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudHlwZSBDb21ib2JveE9wdGlvbiA9IHtcbiAgdmFsdWU6IHN0cmluZztcbiAgdmFsdWVMb3dlcmNhc2U6IHN0cmluZztcbiAgbWF0Y2hJbmRleDogbnVtYmVyO1xufTtcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgQXRvbUlucHV0ID0gcmVxdWlyZSgnLi4vLi4vYXRvbS1pbnB1dCcpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3QgZW1wdHlmdW5jdGlvbiA9IHJlcXVpcmUoJ2VtcHR5ZnVuY3Rpb24nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuLyoqXG4gKiBBIENvbWJvIEJveC5cbiAqIFRPRE8gYWxsb3cgbWFraW5nIHRleHQgaW5wdXQgbm9uLWVkaXRhYmxlIHZpYSBwcm9wc1xuICogVE9ETyBvcGVuL2Nsb3NlIG9wdGlvbnMgZHJvcGRvd24gdXBvbiBmb2N1cy9ibHVyXG4gKiBUT0RPIGFkZCBwdWJsaWMgZ2V0dGVyL3NldHRlciBmb3IgdGV4dElucHV0XG4gKiBUT0RPIHVzZSBnZW5lcmljIHNlYXJjaCBwcm92aWRlclxuICogVE9ETyBtb3ZlIGNvbWJvYm94IHRvIHNlcGFyYXRlIHBhY2thZ2UuXG4gKi9cbmNsYXNzIEF0b21Db21ib0JveCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3N1YnNjcmlwdGlvbnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgaW5pdGlhbFRleHRJbnB1dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBwbGFjZWhvbGRlclRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgbWF4T3B0aW9uQ291bnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvblNlbGVjdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvKipcbiAgICAgKiBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbjsgR2V0cyBjYWxsZWQgd2l0aFxuICAgICAqIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBpbnB1dCBmaWVsZCBhcyBpdHMgb25seSBhcmd1bWVudFxuICAgICAqL1xuICAgIHJlcXVlc3RPcHRpb25zOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBtYXhPcHRpb25Db3VudDogMTAsXG4gICAgb25DaGFuZ2U6IGVtcHR5ZnVuY3Rpb24sXG4gICAgb25TZWxlY3Q6IGVtcHR5ZnVuY3Rpb24sXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZmlsdGVyZWRPcHRpb25zOiBbXSxcbiAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgICAgc2VsZWN0ZWRJbmRleDogLTEsXG4gICAgICB0ZXh0SW5wdXQ6IHByb3BzLmluaXRpYWxUZXh0SW5wdXQsXG4gICAgfTtcbiAgICB0aGlzLnJlY2VpdmVVcGRhdGUgPSB0aGlzLnJlY2VpdmVVcGRhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UgPSB0aGlzLl9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVJbnB1dEJsdXIgPSB0aGlzLl9oYW5kbGVJbnB1dEJsdXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVJbnB1dEZvY3VzID0gdGhpcy5faGFuZGxlSW5wdXRGb2N1cy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZU1vdmVEb3duID0gdGhpcy5faGFuZGxlTW92ZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVNb3ZlVXAgPSB0aGlzLl9oYW5kbGVNb3ZlVXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVDYW5jZWwgPSB0aGlzLl9oYW5kbGVDYW5jZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVDb25maXJtID0gdGhpcy5faGFuZGxlQ29uZmlybS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCA9XG4gICAgICB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IG5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBjb25zdCBfc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIF9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOm1vdmUtdXAnLCB0aGlzLl9oYW5kbGVNb3ZlVXApLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS1kb3duJywgdGhpcy5faGFuZGxlTW92ZURvd24pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y2FuY2VsJywgdGhpcy5faGFuZGxlQ2FuY2VsKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKG5vZGUsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9oYW5kbGVDb25maXJtKSxcbiAgICAgIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLm9uRGlkQ2hhbmdlKHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSlcbiAgICApO1xuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHJlcXVlc3RVcGRhdGUoKSB7XG4gICAgdGhpcy5wcm9wcy5yZXF1ZXN0T3B0aW9ucyh0aGlzLnN0YXRlLnRleHRJbnB1dCkudGhlbih0aGlzLnJlY2VpdmVVcGRhdGUpO1xuICB9XG5cbiAgcmVjZWl2ZVVwZGF0ZShuZXdPcHRpb25zOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgY29uc3QgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5fZ2V0RmlsdGVyZWRPcHRpb25zKG5ld09wdGlvbnMsIHRoaXMuc3RhdGUudGV4dElucHV0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wdGlvbnM6IG5ld09wdGlvbnMsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdFZhbHVlKG5ld1ZhbHVlOiBzdHJpbmcsIGRpZFJlbmRlckNhbGxiYWNrPzogKCkgPT4gbWl4ZWQpIHtcbiAgICB0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXS5zZXRUZXh0KG5ld1ZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VmFsdWUsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICB9LCBkaWRSZW5kZXJDYWxsYmFjayk7XG4gICAgdGhpcy5wcm9wcy5vblNlbGVjdChuZXdWYWx1ZSk7XG4gICAgLy8gU2VsZWN0aW5nIGEgdmFsdWUgaW4gdGhlIGRyb3Bkb3duIGNoYW5nZXMgdGhlIHRleHQgYXMgd2VsbC4gQ2FsbCB0aGUgY2FsbGJhY2sgYWNjb3JkaW5nbHkuXG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLmdldFRleHQoKTtcbiAgfVxuXG4gIC8vIFRPRE8gdXNlIG5hdGl2ZSAoZnV6enkvc3RyaWN0IC0gY29uZmlndXJhYmxlPykgZmlsdGVyIHByb3ZpZGVyXG4gIF9nZXRGaWx0ZXJlZE9wdGlvbnMob3B0aW9uczogQXJyYXk8c3RyaW5nPiwgZmlsdGVyVmFsdWU6IHN0cmluZyk6IEFycmF5PENvbWJvYm94T3B0aW9uPiB7XG4gICAgY29uc3QgbG93ZXJDYXNlU3RhdGUgPSBmaWx0ZXJWYWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiBvcHRpb25zXG4gICAgICAubWFwKFxuICAgICAgICBvcHRpb24gPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbHVlTG93ZXJjYXNlID0gb3B0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24sXG4gICAgICAgICAgICB2YWx1ZUxvd2VyY2FzZTogdmFsdWVMb3dlcmNhc2UsXG4gICAgICAgICAgICBtYXRjaEluZGV4OiB2YWx1ZUxvd2VyY2FzZS5pbmRleE9mKGxvd2VyQ2FzZVN0YXRlKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICApLmZpbHRlcihcbiAgICAgICAgb3B0aW9uID0+IG9wdGlvbi5tYXRjaEluZGV4ICE9PSAtMVxuICAgICAgKS5zbGljZSgwLCB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50KTtcbiAgfVxuXG4gIF9oYW5kbGVUZXh0SW5wdXRDaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgbmV3VGV4dCA9IHRoaXMucmVmcy5mcmVlZm9ybUlucHV0LmdldFRleHQoKTtcbiAgICBpZiAobmV3VGV4dCA9PT0gdGhpcy5zdGF0ZS50ZXh0SW5wdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gICAgY29uc3QgZmlsdGVyZWRPcHRpb25zID0gdGhpcy5fZ2V0RmlsdGVyZWRPcHRpb25zKHRoaXMuc3RhdGUub3B0aW9ucywgbmV3VGV4dCk7XG4gICAgbGV0IHNlbGVjdGVkSW5kZXg7XG4gICAgaWYgKGZpbHRlcmVkT3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZW4ndCBhbnkgb3B0aW9ucywgZG9uJ3Qgc2VsZWN0IGFueXRoaW5nLlxuICAgICAgc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ID09PSAtMSB8fFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPj0gZmlsdGVyZWRPcHRpb25zLmxlbmd0aCkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlIG9wdGlvbnMgYW5kIHRoZSBzZWxlY3RlZCBpbmRleCBpcyBvdXQgb2YgYm91bmRzLFxuICAgICAgLy8gZGVmYXVsdCB0byB0aGUgZmlyc3QgaXRlbS5cbiAgICAgIHNlbGVjdGVkSW5kZXggPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZEluZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRleHRJbnB1dDogbmV3VGV4dCxcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiB0cnVlLFxuICAgICAgZmlsdGVyZWRPcHRpb25zOiBmaWx0ZXJlZE9wdGlvbnMsXG4gICAgICBzZWxlY3RlZEluZGV4LFxuICAgIH0pO1xuICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VGV4dCk7XG4gIH1cblxuICBfaGFuZGxlSW5wdXRGb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zVmlzaWJsZTogdHJ1ZX0pO1xuICB9XG5cbiAgX2hhbmRsZUlucHV0Qmx1cigpOiB2b2lkIHtcbiAgICAvLyBEZWxheSBoaWRpbmcgdGhlIGNvbWJvYm94IGxvbmcgZW5vdWdoIGZvciBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3ggdG8gdHJpZ2dlciBvbiBpdCBpblxuICAgIC8vIGNhc2UgdGhlIGJsdXIgd2FzIGNhdXNlZCBieSBhIGNsaWNrIGluc2lkZSB0aGUgY29tYm9ib3guIDE1MG1zIGlzIGVtcGlyaWNhbGx5IGxvbmcgZW5vdWdoIHRvXG4gICAgLy8gbGV0IHRoZSBzdGFjayBjbGVhciBmcm9tIHRoaXMgYmx1ciBldmVudCBhbmQgZm9yIHRoZSBjbGljayBldmVudCB0byB0cmlnZ2VyLlxuICAgIHNldFRpbWVvdXQodGhpcy5faGFuZGxlQ2FuY2VsLCAxNTApO1xuICB9XG5cbiAgX2hhbmRsZUl0ZW1DbGljayhzZWxlY3RlZFZhbHVlOiBzdHJpbmcsIGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnNlbGVjdFZhbHVlKHNlbGVjdGVkVmFsdWUsICgpID0+IHtcbiAgICAgIC8vIEZvY3VzIHRoZSBpbnB1dCBhZ2FpbiBiZWNhdXNlIHRoZSBjbGljayB3aWxsIGNhdXNlIHRoZSBpbnB1dCB0byBibHVyLiBUaGlzIG1pbWljcyBuYXRpdmVcbiAgICAgIC8vIDxzZWxlY3Q+IGJlaGF2aW9yIGJ5IGtlZXBpbmcgZm9jdXMgaW4gdGhlIGZvcm0gYmVpbmcgZWRpdGVkLlxuICAgICAgY29uc3QgaW5wdXQgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ2ZyZWVmb3JtSW5wdXQnXSk7XG4gICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgaW5wdXQuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlRG93bigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IE1hdGgubWluKFxuICAgICAgICB0aGlzLnByb3BzLm1heE9wdGlvbkNvdW50IC0gMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4ICsgMSxcbiAgICAgICAgdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubGVuZ3RoIC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVNb3ZlVXAoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZEluZGV4OiBNYXRoLm1heChcbiAgICAgICAgMCxcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4IC0gMSxcbiAgICAgICksXG4gICAgfSwgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkKTtcbiAgfVxuXG4gIF9oYW5kbGVDYW5jZWwoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlQ29uZmlybSgpIHtcbiAgICBjb25zdCBvcHRpb24gPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9uc1t0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXhdO1xuICAgIGlmIChvcHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5zZWxlY3RWYWx1ZShvcHRpb24udmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEluZGV4KHNlbGVjdGVkSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkSW5kZXh9KTtcbiAgfVxuXG4gIF9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQoKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzLnJlZnNbJ3NlbGVjdGVkT3B0aW9uJ10pO1xuICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgc2VsZWN0ZWRPcHRpb24uc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBvcHRpb25zQ29udGFpbmVyO1xuICAgIGlmICh0aGlzLnN0YXRlLm9wdGlvbnNWaXNpYmxlKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5zdGF0ZS5maWx0ZXJlZE9wdGlvbnMubWFwKChvcHRpb24sIGkpID0+IHtcbiAgICAgICAgY29uc3QgYmVmb3JlTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKDAsIG9wdGlvbi5tYXRjaEluZGV4KTtcbiAgICAgICAgY29uc3QgZW5kT2ZNYXRjaEluZGV4ID0gb3B0aW9uLm1hdGNoSW5kZXggKyB0aGlzLnN0YXRlLnRleHRJbnB1dC5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodGVkTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgIG9wdGlvbi5tYXRjaEluZGV4LFxuICAgICAgICAgIGVuZE9mTWF0Y2hJbmRleFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhZnRlck1hdGNoID0gb3B0aW9uLnZhbHVlLnN1YnN0cmluZyhcbiAgICAgICAgICBlbmRPZk1hdGNoSW5kZXgsXG4gICAgICAgICAgb3B0aW9uLnZhbHVlLmxlbmd0aFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gaSA9PT0gdGhpcy5zdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkJyA6IG51bGx9XG4gICAgICAgICAgICBrZXk9e29wdGlvbi52YWx1ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZUl0ZW1DbGljay5iaW5kKHRoaXMsIG9wdGlvbi52YWx1ZSl9XG4gICAgICAgICAgICBvbk1vdXNlT3Zlcj17dGhpcy5fc2V0U2VsZWN0ZWRJbmRleC5iaW5kKHRoaXMsIGkpfVxuICAgICAgICAgICAgcmVmPXtpc1NlbGVjdGVkID8gJ3NlbGVjdGVkT3B0aW9uJyA6IG51bGx9PlxuICAgICAgICAgICAge2JlZm9yZU1hdGNofVxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ0ZXh0LWhpZ2hsaWdodFwiPntoaWdobGlnaHRlZE1hdGNofTwvc3Ryb25nPlxuICAgICAgICAgICAge2FmdGVyTWF0Y2h9XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIG9wdGlvbnMucHVzaChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwidGV4dC1zdWJ0bGVcIiBrZXk9XCJuby1yZXN1bHRzLWZvdW5kXCI+XG4gICAgICAgICAgICBObyByZXN1bHRzIGZvdW5kXG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgb3B0aW9uc0NvbnRhaW5lciA9IChcbiAgICAgICAgPG9sIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICB7b3B0aW9uc31cbiAgICAgICAgPC9vbD5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXsnc2VsZWN0LWxpc3QgcG9wb3Zlci1saXN0IHBvcG92ZXItbGlzdC1zdWJ0bGUgJyArIHRoaXMucHJvcHMuY2xhc3NOYW1lfT5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVGV4dElucHV0fVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5faGFuZGxlSW5wdXRCbHVyfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuX2hhbmRsZUlucHV0Rm9jdXN9XG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyVGV4dH1cbiAgICAgICAgICByZWY9XCJmcmVlZm9ybUlucHV0XCJcbiAgICAgICAgICBzaXplPXt0aGlzLnByb3BzLnNpemV9XG4gICAgICAgIC8+XG4gICAgICAgIHtvcHRpb25zQ29udGFpbmVyfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXRvbUNvbWJvQm94O1xuIl19