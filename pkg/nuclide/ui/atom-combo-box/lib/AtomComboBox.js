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
      var node = React.findDOMNode(this);
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
        var input = React.findDOMNode(_this.refs['freeformInput']);
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
      var selectedOption = React.findDOMNode(this.refs['selectedOption']);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0b21Db21ib0JveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2VBaUI4QixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF0QyxtQkFBbUIsWUFBbkIsbUJBQW1COztBQUMxQixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7Z0JBQzlCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBbEMsS0FBSyxhQUFMLEtBQUs7O0FBRVosSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztJQUV4QyxTQUFTLEdBQUksS0FBSyxDQUFsQixTQUFTOzs7Ozs7Ozs7OztJQVVWLFlBQVk7WUFBWixZQUFZOztlQUFaLFlBQVk7O1dBSUc7QUFDakIsZUFBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtBQUN0QyxzQkFBZ0IsRUFBRSxTQUFTLENBQUMsTUFBTTtBQUNsQyxxQkFBZSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ2pDLG9CQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQzNDLGNBQVEsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDbkMsY0FBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTs7Ozs7QUFLbkMsb0JBQWMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVU7QUFDekMsVUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzFDOzs7O1dBRXFCO0FBQ3BCLGVBQVMsRUFBRSxFQUFFO0FBQ2Isb0JBQWMsRUFBRSxFQUFFO0FBQ2xCLGNBQVEsRUFBRSxhQUFhO0FBQ3ZCLGNBQVEsRUFBRSxhQUFhO0tBQ3hCOzs7O0FBRVUsV0ExQlAsWUFBWSxDQTBCSixLQUFhLEVBQUU7MEJBMUJ2QixZQUFZOztBQTJCZCwrQkEzQkUsWUFBWSw2Q0EyQlIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLHFCQUFlLEVBQUUsRUFBRTtBQUNuQixhQUFPLEVBQUUsRUFBRTtBQUNYLG9CQUFjLEVBQUUsS0FBSztBQUNyQixtQkFBYSxFQUFFLENBQUMsQ0FBQztBQUNqQixlQUFTLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtLQUNsQyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRSxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRCxRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFFBQUksQ0FBQyxxQ0FBcUMsR0FDeEMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN6RDs7ZUE3Q0csWUFBWTs7V0ErQ0MsNkJBQUc7QUFDbEIsVUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQyxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUN2RSxvQkFBYyxDQUFDLEdBQUcsQ0FDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFDNUQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQ3BFLENBQUM7QUFDRixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDdEI7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUMvQjtLQUNGOzs7V0FFWSx5QkFBRztBQUNkLFVBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUMxRTs7O1dBRVksdUJBQUMsVUFBeUIsRUFBRTtBQUN2QyxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkYsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLGVBQU8sRUFBRSxVQUFVO0FBQ25CLHVCQUFlLEVBQUUsZUFBZTtPQUNqQyxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsUUFBZ0IsRUFBRSxpQkFBK0IsRUFBRTtBQUM3RCxVQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQVMsRUFBRSxRQUFRO0FBQ25CLHFCQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLHNCQUFjLEVBQUUsS0FBSztPQUN0QixFQUFFLGlCQUFpQixDQUFDLENBQUM7QUFDdEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTlCLFVBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQy9COzs7V0FFTSxtQkFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0M7Ozs7O1dBR2tCLDZCQUFDLE9BQXNCLEVBQUUsV0FBbUIsRUFBeUI7QUFDdEYsVUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pELGFBQU8sT0FBTyxDQUNYLEdBQUcsQ0FDRixVQUFBLE1BQU0sRUFBSTtBQUNSLFlBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM1QyxlQUFPO0FBQ0wsZUFBSyxFQUFFLE1BQU07QUFDYix3QkFBYyxFQUFFLGNBQWM7QUFDOUIsb0JBQVUsRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztTQUNuRCxDQUFDO09BQ0gsQ0FDRixDQUFDLE1BQU0sQ0FDTixVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQztPQUFBLENBQ25DLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDOzs7V0FFcUIsa0NBQVM7QUFDN0IsVUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEQsVUFBSSxPQUFPLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7QUFDcEMsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RSxVQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLFVBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWhDLHFCQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDcEIsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxJQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFOzs7QUFHdEQscUJBQWEsR0FBRyxDQUFDLENBQUM7T0FDbkIsTUFBTTtBQUNMLHFCQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7T0FDMUM7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDO0FBQ1osaUJBQVMsRUFBRSxPQUFPO0FBQ2xCLHNCQUFjLEVBQUUsSUFBSTtBQUNwQix1QkFBZSxFQUFFLGVBQWU7QUFDaEMscUJBQWEsRUFBYixhQUFhO09BQ2QsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDOUI7OztXQUVnQiw2QkFBUztBQUN4QixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDckIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFZSw0QkFBUzs7OztBQUl2QixnQkFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckM7OztXQUVlLDBCQUFDLGFBQXFCLEVBQUUsS0FBVSxFQUFFOzs7QUFDbEQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsWUFBTTs7O0FBR3BDLFlBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUM1RCxZQUFJLEtBQUssRUFBRTtBQUNULGVBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNmO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLDJCQUFHO0FBQ2hCLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixxQkFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLENBQUMsRUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUN0QztPQUNGLEVBQUUsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7S0FDaEQ7OztXQUVZLHlCQUFHO0FBQ2QsVUFBSSxDQUFDLFFBQVEsQ0FBQztBQUNaLHFCQUFhLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FDckIsQ0FBQyxFQUNELElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FDN0I7T0FDRixFQUFFLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFWSx5QkFBRztBQUNkLFVBQUksQ0FBQyxRQUFRLENBQUM7QUFDWixzQkFBYyxFQUFFLEtBQUs7T0FDdEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVhLDBCQUFHO0FBQ2YsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNwRSxVQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDeEIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDaEM7S0FDRjs7O1dBRWdCLDJCQUFDLGFBQXFCLEVBQUU7QUFDdkMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLGFBQWEsRUFBYixhQUFhLEVBQUMsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFb0MsaURBQVM7QUFDNUMsVUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUN0RSxVQUFJLGNBQWMsRUFBRTtBQUNsQixzQkFBYyxDQUFDLHNCQUFzQixFQUFFLENBQUM7T0FDekM7S0FDRjs7O1dBRUssa0JBQWlCOzs7QUFDckIsVUFBSSxnQkFBZ0IsWUFBQSxDQUFDO0FBQ3JCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDN0IsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBSztBQUM1RCxjQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pFLGNBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBSyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUN4RSxjQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUM3QyxNQUFNLENBQUMsVUFBVSxFQUNqQixlQUFlLENBQ2hCLENBQUM7QUFDRixjQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDdkMsZUFBZSxFQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUNwQixDQUFDO0FBQ0YsY0FBTSxVQUFVLEdBQUcsQ0FBQyxLQUFLLE9BQUssS0FBSyxDQUFDLGFBQWEsQ0FBQztBQUNsRCxpQkFDRTs7O0FBQ0UsdUJBQVMsRUFBRSxVQUFVLEdBQUcsVUFBVSxHQUFHLElBQUksQUFBQztBQUMxQyxpQkFBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEFBQUM7QUFDbEIscUJBQU8sRUFBRSxPQUFLLGdCQUFnQixDQUFDLElBQUksU0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEFBQUM7QUFDeEQseUJBQVcsRUFBRSxPQUFLLGlCQUFpQixDQUFDLElBQUksU0FBTyxDQUFDLENBQUMsQUFBQztBQUNsRCxpQkFBRyxFQUFFLFVBQVUsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLEFBQUM7WUFDekMsV0FBVztZQUNaOztnQkFBUSxTQUFTLEVBQUMsZ0JBQWdCO2NBQUUsZ0JBQWdCO2FBQVU7WUFDN0QsVUFBVTtXQUNSLENBQ0w7U0FDSCxDQUFDLENBQUM7O0FBRUgsWUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDbkIsaUJBQU8sQ0FBQyxJQUFJLENBQ1Y7O2NBQUksU0FBUyxFQUFDLGFBQWEsRUFBQyxHQUFHLEVBQUMsa0JBQWtCOztXQUU3QyxDQUNOLENBQUM7U0FDSDs7QUFFRCx3QkFBZ0IsR0FDZDs7WUFBSSxTQUFTLEVBQUMsWUFBWTtVQUN2QixPQUFPO1NBQ0wsQUFDTixDQUFDO09BQ0g7O0FBRUQsYUFDRTs7VUFBSyxTQUFTLEVBQUUsK0NBQStDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEFBQUM7UUFDckYsb0JBQUMsU0FBUztBQUNSLHNCQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQUFBQztBQUMxQyxnQkFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQUFBQztBQUM5QixpQkFBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQztBQUNoQyx5QkFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxBQUFDO0FBQzVDLGFBQUcsRUFBQyxlQUFlO0FBQ25CLGNBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQUFBQztVQUN0QjtRQUNELGdCQUFnQjtPQUNiLENBQ047S0FDSDs7O1NBdlFHLFlBQVk7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUEyUTFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6IkF0b21Db21ib0JveC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnR5cGUgQ29tYm9ib3hPcHRpb24gPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIHZhbHVlTG93ZXJjYXNlOiBzdHJpbmc7XG4gIG1hdGNoSW5kZXg6IG51bWJlcjtcbn07XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IEF0b21JbnB1dCA9IHJlcXVpcmUoJy4uLy4uL2F0b20taW5wdXQnKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCBlbXB0eWZ1bmN0aW9uID0gcmVxdWlyZSgnZW1wdHlmdW5jdGlvbicpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIEEgQ29tYm8gQm94LlxuICogVE9ETyBhbGxvdyBtYWtpbmcgdGV4dCBpbnB1dCBub24tZWRpdGFibGUgdmlhIHByb3BzXG4gKiBUT0RPIG9wZW4vY2xvc2Ugb3B0aW9ucyBkcm9wZG93biB1cG9uIGZvY3VzL2JsdXJcbiAqIFRPRE8gYWRkIHB1YmxpYyBnZXR0ZXIvc2V0dGVyIGZvciB0ZXh0SW5wdXRcbiAqIFRPRE8gdXNlIGdlbmVyaWMgc2VhcmNoIHByb3ZpZGVyXG4gKiBUT0RPIG1vdmUgY29tYm9ib3ggdG8gc2VwYXJhdGUgcGFja2FnZS5cbiAqL1xuY2xhc3MgQXRvbUNvbWJvQm94IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBpbml0aWFsVGV4dElucHV0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBtYXhPcHRpb25Db3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIG9uU2VsZWN0OiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8qKlxuICAgICAqIHByb21pc2UtcmV0dXJuaW5nIGZ1bmN0aW9uOyBHZXRzIGNhbGxlZCB3aXRoXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGlucHV0IGZpZWxkIGFzIGl0cyBvbmx5IGFyZ3VtZW50XG4gICAgICovXG4gICAgcmVxdWVzdE9wdGlvbnM6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgc2l6ZTogUHJvcFR5cGVzLm9uZU9mKFsneHMnLCAnc20nLCAnbGcnXSksXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIG1heE9wdGlvbkNvdW50OiAxMCxcbiAgICBvbkNoYW5nZTogZW1wdHlmdW5jdGlvbixcbiAgICBvblNlbGVjdDogZW1wdHlmdW5jdGlvbixcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IFtdLFxuICAgICAgb3B0aW9uczogW10sXG4gICAgICBvcHRpb25zVmlzaWJsZTogZmFsc2UsXG4gICAgICBzZWxlY3RlZEluZGV4OiAtMSxcbiAgICAgIHRleHRJbnB1dDogcHJvcHMuaW5pdGlhbFRleHRJbnB1dCxcbiAgICB9O1xuICAgIHRoaXMucmVjZWl2ZVVwZGF0ZSA9IHRoaXMucmVjZWl2ZVVwZGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZSA9IHRoaXMuX2hhbmRsZVRleHRJbnB1dENoYW5nZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZUlucHV0Qmx1ciA9IHRoaXMuX2hhbmRsZUlucHV0Qmx1ci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZUlucHV0Rm9jdXMgPSB0aGlzLl9oYW5kbGVJbnB1dEZvY3VzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlTW92ZURvd24gPSB0aGlzLl9oYW5kbGVNb3ZlRG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZU1vdmVVcCA9IHRoaXMuX2hhbmRsZU1vdmVVcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZUNhbmNlbCA9IHRoaXMuX2hhbmRsZUNhbmNlbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZUNvbmZpcm0gPSB0aGlzLl9oYW5kbGVDb25maXJtLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc2Nyb2xsU2VsZWN0ZWRPcHRpb25JbnRvVmlld0lmTmVlZGVkID1cbiAgICAgIHRoaXMuX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qgbm9kZSA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIGNvbnN0IF9zdWJzY3JpcHRpb25zID0gdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6bW92ZS11cCcsIHRoaXMuX2hhbmRsZU1vdmVVcCksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTptb3ZlLWRvd24nLCB0aGlzLl9oYW5kbGVNb3ZlRG93biksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChub2RlLCAnY29yZTpjYW5jZWwnLCB0aGlzLl9oYW5kbGVDYW5jZWwpLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQobm9kZSwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2hhbmRsZUNvbmZpcm0pLFxuICAgICAgdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10ub25EaWRDaGFuZ2UodGhpcy5faGFuZGxlVGV4dElucHV0Q2hhbmdlKVxuICAgICk7XG4gICAgdGhpcy5yZXF1ZXN0VXBkYXRlKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdFVwZGF0ZSgpIHtcbiAgICB0aGlzLnByb3BzLnJlcXVlc3RPcHRpb25zKHRoaXMuc3RhdGUudGV4dElucHV0KS50aGVuKHRoaXMucmVjZWl2ZVVwZGF0ZSk7XG4gIH1cblxuICByZWNlaXZlVXBkYXRlKG5ld09wdGlvbnM6IEFycmF5PHN0cmluZz4pIHtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnMobmV3T3B0aW9ucywgdGhpcy5zdGF0ZS50ZXh0SW5wdXQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgb3B0aW9uczogbmV3T3B0aW9ucyxcbiAgICAgIGZpbHRlcmVkT3B0aW9uczogZmlsdGVyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0VmFsdWUobmV3VmFsdWU6IHN0cmluZywgZGlkUmVuZGVyQ2FsbGJhY2s/OiAoKSA9PiBtaXhlZCkge1xuICAgIHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddLnNldFRleHQobmV3VmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdGV4dElucHV0OiBuZXdWYWx1ZSxcbiAgICAgIHNlbGVjdGVkSW5kZXg6IC0xLFxuICAgICAgb3B0aW9uc1Zpc2libGU6IGZhbHNlLFxuICAgIH0sIGRpZFJlbmRlckNhbGxiYWNrKTtcbiAgICB0aGlzLnByb3BzLm9uU2VsZWN0KG5ld1ZhbHVlKTtcbiAgICAvLyBTZWxlY3RpbmcgYSB2YWx1ZSBpbiB0aGUgZHJvcGRvd24gY2hhbmdlcyB0aGUgdGV4dCBhcyB3ZWxsLiBDYWxsIHRoZSBjYWxsYmFjayBhY2NvcmRpbmdseS5cbiAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgfVxuXG4gIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydmcmVlZm9ybUlucHV0J10uZ2V0VGV4dCgpO1xuICB9XG5cbiAgLy8gVE9ETyB1c2UgbmF0aXZlIChmdXp6eS9zdHJpY3QgLSBjb25maWd1cmFibGU/KSBmaWx0ZXIgcHJvdmlkZXJcbiAgX2dldEZpbHRlcmVkT3B0aW9ucyhvcHRpb25zOiBBcnJheTxzdHJpbmc+LCBmaWx0ZXJWYWx1ZTogc3RyaW5nKTogQXJyYXk8Q29tYm9ib3hPcHRpb24+IHtcbiAgICBjb25zdCBsb3dlckNhc2VTdGF0ZSA9IGZpbHRlclZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgICAgIC5tYXAoXG4gICAgICAgIG9wdGlvbiA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWVMb3dlcmNhc2UgPSBvcHRpb24udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IG9wdGlvbixcbiAgICAgICAgICAgIHZhbHVlTG93ZXJjYXNlOiB2YWx1ZUxvd2VyY2FzZSxcbiAgICAgICAgICAgIG1hdGNoSW5kZXg6IHZhbHVlTG93ZXJjYXNlLmluZGV4T2YobG93ZXJDYXNlU3RhdGUpLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICkuZmlsdGVyKFxuICAgICAgICBvcHRpb24gPT4gb3B0aW9uLm1hdGNoSW5kZXggIT09IC0xXG4gICAgICApLnNsaWNlKDAsIHRoaXMucHJvcHMubWF4T3B0aW9uQ291bnQpO1xuICB9XG5cbiAgX2hhbmRsZVRleHRJbnB1dENoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy5yZWZzLmZyZWVmb3JtSW5wdXQuZ2V0VGV4dCgpO1xuICAgIGlmIChuZXdUZXh0ID09PSB0aGlzLnN0YXRlLnRleHRJbnB1dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlcXVlc3RVcGRhdGUoKTtcbiAgICBjb25zdCBmaWx0ZXJlZE9wdGlvbnMgPSB0aGlzLl9nZXRGaWx0ZXJlZE9wdGlvbnModGhpcy5zdGF0ZS5vcHRpb25zLCBuZXdUZXh0KTtcbiAgICBsZXQgc2VsZWN0ZWRJbmRleDtcbiAgICBpZiAoZmlsdGVyZWRPcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlbid0IGFueSBvcHRpb25zLCBkb24ndCBzZWxlY3QgYW55dGhpbmcuXG4gICAgICBzZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggPT09IC0xIHx8XG4gICAgICAgIHRoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleCA+PSBmaWx0ZXJlZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgb3B0aW9ucyBhbmQgdGhlIHNlbGVjdGVkIGluZGV4IGlzIG91dCBvZiBib3VuZHMsXG4gICAgICAvLyBkZWZhdWx0IHRvIHRoZSBmaXJzdCBpdGVtLlxuICAgICAgc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkSW5kZXggPSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdGV4dElucHV0OiBuZXdUZXh0LFxuICAgICAgb3B0aW9uc1Zpc2libGU6IHRydWUsXG4gICAgICBmaWx0ZXJlZE9wdGlvbnM6IGZpbHRlcmVkT3B0aW9ucyxcbiAgICAgIHNlbGVjdGVkSW5kZXgsXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdUZXh0KTtcbiAgfVxuXG4gIF9oYW5kbGVJbnB1dEZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMucmVxdWVzdFVwZGF0ZSgpO1xuICAgIHRoaXMuc2V0U3RhdGUoe29wdGlvbnNWaXNpYmxlOiB0cnVlfSk7XG4gIH1cblxuICBfaGFuZGxlSW5wdXRCbHVyKCk6IHZvaWQge1xuICAgIC8vIERlbGF5IGhpZGluZyB0aGUgY29tYm9ib3ggbG9uZyBlbm91Z2ggZm9yIGEgY2xpY2sgaW5zaWRlIHRoZSBjb21ib2JveCB0byB0cmlnZ2VyIG9uIGl0IGluXG4gICAgLy8gY2FzZSB0aGUgYmx1ciB3YXMgY2F1c2VkIGJ5IGEgY2xpY2sgaW5zaWRlIHRoZSBjb21ib2JveC4gMTUwbXMgaXMgZW1waXJpY2FsbHkgbG9uZyBlbm91Z2ggdG9cbiAgICAvLyBsZXQgdGhlIHN0YWNrIGNsZWFyIGZyb20gdGhpcyBibHVyIGV2ZW50IGFuZCBmb3IgdGhlIGNsaWNrIGV2ZW50IHRvIHRyaWdnZXIuXG4gICAgc2V0VGltZW91dCh0aGlzLl9oYW5kbGVDYW5jZWwsIDE1MCk7XG4gIH1cblxuICBfaGFuZGxlSXRlbUNsaWNrKHNlbGVjdGVkVmFsdWU6IHN0cmluZywgZXZlbnQ6IGFueSkge1xuICAgIHRoaXMuc2VsZWN0VmFsdWUoc2VsZWN0ZWRWYWx1ZSwgKCkgPT4ge1xuICAgICAgLy8gRm9jdXMgdGhlIGlucHV0IGFnYWluIGJlY2F1c2UgdGhlIGNsaWNrIHdpbGwgY2F1c2UgdGhlIGlucHV0IHRvIGJsdXIuIFRoaXMgbWltaWNzIG5hdGl2ZVxuICAgICAgLy8gPHNlbGVjdD4gYmVoYXZpb3IgYnkga2VlcGluZyBmb2N1cyBpbiB0aGUgZm9ybSBiZWluZyBlZGl0ZWQuXG4gICAgICBjb25zdCBpbnB1dCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snZnJlZWZvcm1JbnB1dCddKTtcbiAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICBpbnB1dC5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZU1vdmVEb3duKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWRJbmRleDogTWF0aC5taW4oXG4gICAgICAgIHRoaXMucHJvcHMubWF4T3B0aW9uQ291bnQgLSAxLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggKyAxLFxuICAgICAgICB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5sZW5ndGggLSAxLFxuICAgICAgKSxcbiAgICB9LCB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQpO1xuICB9XG5cbiAgX2hhbmRsZU1vdmVVcCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkSW5kZXg6IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXggLSAxLFxuICAgICAgKSxcbiAgICB9LCB0aGlzLl9zY3JvbGxTZWxlY3RlZE9wdGlvbkludG9WaWV3SWZOZWVkZWQpO1xuICB9XG5cbiAgX2hhbmRsZUNhbmNlbCgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG9wdGlvbnNWaXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVDb25maXJtKCkge1xuICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuc3RhdGUuZmlsdGVyZWRPcHRpb25zW3RoaXMuc3RhdGUuc2VsZWN0ZWRJbmRleF07XG4gICAgaWYgKG9wdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNlbGVjdFZhbHVlKG9wdGlvbi52YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgX3NldFNlbGVjdGVkSW5kZXgoc2VsZWN0ZWRJbmRleDogbnVtYmVyKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRJbmRleH0pO1xuICB9XG5cbiAgX3Njcm9sbFNlbGVjdGVkT3B0aW9uSW50b1ZpZXdJZk5lZWRlZCgpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMucmVmc1snc2VsZWN0ZWRPcHRpb24nXSk7XG4gICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICBzZWxlY3RlZE9wdGlvbi5zY3JvbGxJbnRvVmlld0lmTmVlZGVkKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IG9wdGlvbnNDb250YWluZXI7XG4gICAgaWYgKHRoaXMuc3RhdGUub3B0aW9uc1Zpc2libGUpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnN0YXRlLmZpbHRlcmVkT3B0aW9ucy5tYXAoKG9wdGlvbiwgaSkgPT4ge1xuICAgICAgICBjb25zdCBiZWZvcmVNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoMCwgb3B0aW9uLm1hdGNoSW5kZXgpO1xuICAgICAgICBjb25zdCBlbmRPZk1hdGNoSW5kZXggPSBvcHRpb24ubWF0Y2hJbmRleCArIHRoaXMuc3RhdGUudGV4dElucHV0Lmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZWRNYXRjaCA9IG9wdGlvbi52YWx1ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgb3B0aW9uLm1hdGNoSW5kZXgsXG4gICAgICAgICAgZW5kT2ZNYXRjaEluZGV4XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGFmdGVyTWF0Y2ggPSBvcHRpb24udmFsdWUuc3Vic3RyaW5nKFxuICAgICAgICAgIGVuZE9mTWF0Y2hJbmRleCxcbiAgICAgICAgICBvcHRpb24udmFsdWUubGVuZ3RoXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGlzU2VsZWN0ZWQgPSBpID09PSB0aGlzLnN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpXG4gICAgICAgICAgICBjbGFzc05hbWU9e2lzU2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogbnVsbH1cbiAgICAgICAgICAgIGtleT17b3B0aW9uLnZhbHVlfVxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5faGFuZGxlSXRlbUNsaWNrLmJpbmQodGhpcywgb3B0aW9uLnZhbHVlKX1cbiAgICAgICAgICAgIG9uTW91c2VPdmVyPXt0aGlzLl9zZXRTZWxlY3RlZEluZGV4LmJpbmQodGhpcywgaSl9XG4gICAgICAgICAgICByZWY9e2lzU2VsZWN0ZWQgPyAnc2VsZWN0ZWRPcHRpb24nIDogbnVsbH0+XG4gICAgICAgICAgICB7YmVmb3JlTWF0Y2h9XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInRleHQtaGlnaGxpZ2h0XCI+e2hpZ2hsaWdodGVkTWF0Y2h9PC9zdHJvbmc+XG4gICAgICAgICAgICB7YWZ0ZXJNYXRjaH1cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghb3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgb3B0aW9ucy5wdXNoKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ0ZXh0LXN1YnRsZVwiIGtleT1cIm5vLXJlc3VsdHMtZm91bmRcIj5cbiAgICAgICAgICAgIE5vIHJlc3VsdHMgZm91bmRcbiAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zQ29udGFpbmVyID0gKFxuICAgICAgICA8b2wgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIHtvcHRpb25zfVxuICAgICAgICA8L29sPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9eydzZWxlY3QtbGlzdCBwb3BvdmVyLWxpc3QgcG9wb3Zlci1saXN0LXN1YnRsZSAnICsgdGhpcy5wcm9wcy5jbGFzc05hbWV9PlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxUZXh0SW5wdXR9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLl9oYW5kbGVJbnB1dEJsdXJ9XG4gICAgICAgICAgb25Gb2N1cz17dGhpcy5faGFuZGxlSW5wdXRGb2N1c31cbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJUZXh0fVxuICAgICAgICAgIHJlZj1cImZyZWVmb3JtSW5wdXRcIlxuICAgICAgICAgIHNpemU9e3RoaXMucHJvcHMuc2l6ZX1cbiAgICAgICAgLz5cbiAgICAgICAge29wdGlvbnNDb250YWluZXJ9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tQ29tYm9Cb3g7XG4iXX0=