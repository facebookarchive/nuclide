Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _settingsUtils2;

function _settingsUtils() {
  return _settingsUtils2 = require('./settings-utils');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var SettingsSelect = (function (_React$Component) {
  _inherits(SettingsSelect, _React$Component);

  function SettingsSelect(props) {
    _classCallCheck(this, SettingsSelect);

    _get(Object.getPrototypeOf(SettingsSelect.prototype), 'constructor', this).call(this, props);
    this._handleChange = this._handleChange.bind(this);
  }

  _createClass(SettingsSelect, [{
    key: '_handleChange',
    value: function _handleChange(event) {
      var value = event.target.value;
      this.props.onChange(value);
    }
  }, {
    key: 'render',
    value: function render() {
      var keyPath = this.props.keyPath;
      var id = (0, (_settingsUtils2 || _settingsUtils()).normalizeIdentifier)(keyPath);
      var title = this.props.title;
      var description = this.props.description;
      var value = this.props.value;

      var options = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.getSchema(keyPath);

      var optionElements = [];
      if (options.enum) {
        options.enum.forEach(function (option, i) {
          optionElements.push((_reactForAtom2 || _reactForAtom()).React.createElement(
            'option',
            { value: option, key: i },
            option
          ));
        });
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          { className: 'control-label' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'setting-title' },
            title
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'setting-description' },
            description
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'select',
          {
            className: 'form-control',
            id: id,
            onChange: this._handleChange,
            value: value },
          optionElements
        )
      );
    }
  }]);

  return SettingsSelect;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SettingsSelect;
module.exports = exports.default;