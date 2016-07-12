Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var _ButtonGroup2;

function _ButtonGroup() {
  return _ButtonGroup2 = require('./ButtonGroup');
}

var _Modal2;

function _Modal() {
  return _Modal2 = require('./Modal');
}

var _MultiSelectList2;

function _MultiSelectList() {
  return _MultiSelectList2 = require('./MultiSelectList');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

// TODO: We really need to be consistent about these. SMALL or sm??

/**
 * A `<select>`-like control that uses an Atom modal for its options. This component uses an API as
 * similar to `Dropdown` as possible, with extra props for customizing display options.
 */

var ModalMultiSelect = (function (_React$Component) {
  _inherits(ModalMultiSelect, _React$Component);

  _createClass(ModalMultiSelect, null, [{
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      labelComponent: DefaultLabelComponent,
      onChange: function onChange(value) {},
      options: [],
      value: [],
      size: (_Button2 || _Button()).ButtonSizes.SMALL
    },
    enumerable: true
  }]);

  function ModalMultiSelect(props) {
    _classCallCheck(this, ModalMultiSelect);

    _get(Object.getPrototypeOf(ModalMultiSelect.prototype), 'constructor', this).call(this, props);
    this._confirmValues = this._confirmValues.bind(this);
    this._dismissModal = this._dismissModal.bind(this);
    this._selectAll = this._selectAll.bind(this);
    this._selectNone = this._selectNone.bind(this);
    this._resetSelection = this._resetSelection.bind(this);
    this._showModal = this._showModal.bind(this);
    this.state = {
      activeValues: props.value,
      showModal: false
    };
  }

  _createClass(ModalMultiSelect, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var LabelComponent = this.props.labelComponent || DefaultLabelComponent;
      var selectedOptions = this.props.options.filter(function (option) {
        return _this.props.value.indexOf(option.value) !== -1;
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Button2 || _Button()).Button,
        {
          className: this.props.className,
          disabled: this.props.disabled,
          size: this.props.size,
          onClick: this._showModal },
        (_reactForAtom2 || _reactForAtom()).React.createElement(LabelComponent, { selectedOptions: selectedOptions }),
        this._renderModal()
      );
    }
  }, {
    key: '_selectAll',
    value: function _selectAll() {
      var allValues = this.props.options.map(function (option) {
        return option.value;
      });
      this.setState({ activeValues: allValues });
    }
  }, {
    key: '_selectNone',
    value: function _selectNone() {
      this.setState({ activeValues: [] });
    }
  }, {
    key: '_resetSelection',
    value: function _resetSelection() {
      this.setState({ activeValues: this.props.value });
    }
  }, {
    key: '_showModal',
    value: function _showModal() {
      this.setState({
        showModal: true,
        // When you show the modal, the initial selection should match the actually selected values.
        activeValues: this.props.value
      });
    }
  }, {
    key: '_dismissModal',
    value: function _dismissModal() {
      this.setState({ showModal: false });
    }
  }, {
    key: '_confirmValues',
    value: function _confirmValues() {
      // TODO (matthewwithanm): Use ctrl-enter to confirm
      this._dismissModal();
      this.props.onChange(this.state.activeValues);
    }
  }, {
    key: '_renderModal',
    value: function _renderModal() {
      var _this2 = this;

      if (!this.state.showModal) {
        return;
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Modal2 || _Modal()).Modal,
        {
          onDismiss: this._dismissModal },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_MultiSelectList2 || _MultiSelectList()).MultiSelectList, {
          commandScope: atom.views.getView(atom.workspace),
          value: this.state.activeValues,
          options: this.props.options,
          optionComponent: this.props.optionComponent,
          onChange: function (activeValues) {
            return _this2.setState({ activeValues: activeValues });
          }
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-modal-multi-select-actions' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Button2 || _Button()).Button,
              { onClick: this._selectNone },
              'None'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Button2 || _Button()).Button,
              { onClick: this._selectAll },
              'All'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Button2 || _Button()).Button,
              { onClick: this._resetSelection },
              'Reset'
            )
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_ButtonGroup2 || _ButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Button2 || _Button()).Button,
              { onClick: this._dismissModal },
              'Cancel'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Button2 || _Button()).Button,
              {
                buttonType: (_Button2 || _Button()).ButtonTypes.PRIMARY,
                onClick: this._confirmValues },
              'Confirm'
            )
          )
        )
      );
    }
  }]);

  return ModalMultiSelect;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ModalMultiSelect = ModalMultiSelect;

function DefaultLabelComponent(props) {
  var count = props.selectedOptions.length;
  var noun = count === 1 ? 'Item' : 'Items';
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    null,
    count + ' ' + noun + ' Selected'
  );
}