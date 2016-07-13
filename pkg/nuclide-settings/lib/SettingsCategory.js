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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _SettingsControl2;

function _SettingsControl() {
  return _SettingsControl2 = _interopRequireDefault(require('./SettingsControl'));
}

var SettingsCategory = (function (_React$Component) {
  _inherits(SettingsCategory, _React$Component);

  function SettingsCategory() {
    _classCallCheck(this, SettingsCategory);

    _get(Object.getPrototypeOf(SettingsCategory.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SettingsCategory, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var children = Object.keys(this.props.packages).sort().map(function (pkgName) {
        var pkgData = _this.props.packages[pkgName];
        var settingsArray = getSortedSettingsArray(pkgData.settings, pkgName);
        var elements = settingsArray.map(function (settingName) {
          var settingData = pkgData.settings[settingName];
          return (_reactForAtom2 || _reactForAtom()).React.createElement(
            ControlGroup,
            { key: settingName },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsControl2 || _SettingsControl()).default, {
              keyPath: settingData.keyPath,
              value: settingData.value,
              onChange: settingData.onChange,
              schema: settingData.schema
            })
          );
        });
        // We create a control group for the whole group of controls and then another for each
        // individual one. Why? Because that's what Atom does in its settings view.
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          ControlGroup,
          { key: pkgName },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'section',
            { className: 'sub-section' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'h2',
              { className: 'sub-section-heading' },
              pkgData.title
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'sub-section-body' },
              elements
            )
          )
        );
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'section',
        { className: 'section settings-panel' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'h1',
          { className: 'block section-heading icon icon-gear' },
          this.props.name,
          ' Settings'
        ),
        children
      );
    }
  }]);

  return SettingsCategory;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SettingsCategory;

function ControlGroup(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'control-group' },
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { className: 'controls' },
      props.children
    )
  );
}

function getSortedSettingsArray(settings, pkgName) {
  // Sort the package's settings by name, then by order.
  var settingsArray = Object.keys(settings);
  settingsArray.sort().sort(function (a, b) {
    return settings[a].order - settings[b].order;
  });
  return settingsArray;
}
module.exports = exports.default;
/* Package title. */ /* Category Title */