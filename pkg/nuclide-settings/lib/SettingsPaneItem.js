Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _SettingsCategory2;

function _SettingsCategory() {
  return _SettingsCategory2 = _interopRequireDefault(require('./SettingsCategory'));
}

var NuclideSettingsPaneItem = (function (_React$Component) {
  _inherits(NuclideSettingsPaneItem, _React$Component);

  _createClass(NuclideSettingsPaneItem, null, [{
    key: 'gadgetId',
    value: 'nuclide-settings',
    enumerable: true
  }, {
    key: 'defaultLocation',
    value: 'active-pane',
    enumerable: true
  }]);

  function NuclideSettingsPaneItem(props) {
    _classCallCheck(this, NuclideSettingsPaneItem);

    _get(Object.getPrototypeOf(NuclideSettingsPaneItem.prototype), 'constructor', this).call(this, props);

    // Bind callbacks first since we use these during config data generation.
    this._handleConfigChange = this._handleConfigChange.bind(this);
    this._handleComponentChange = this._handleComponentChange.bind(this);

    this.state = this._getConfigData();
  }

  _createClass(NuclideSettingsPaneItem, [{
    key: '_getConfigData',
    value: function _getConfigData() {
      var _this = this;

      // Only need to add config listeners once.
      var disposables = null;
      if (!this._disposables) {
        this._disposables = disposables = new (_atom2 || _atom()).CompositeDisposable();
      }

      var configData = {};
      var nuclidePackages = atom.packages.getLoadedPackages().filter(function (pkg) {
        return pkg.metadata && pkg.metadata.nuclide;
      });

      // Config data is organized as a series of nested objects. First, by category
      // and then by packages in each category. Each package contains a title and an
      // object for each setting in that package. Each setting also contains an
      // onChange callback for components. We also listen for atom.config.onDidChange.
      //
      // ```
      // configData = {
      //   "Debugger": {
      //     "nuclide-debugger-hhvm": {
      //       "title": "HHVM",
      //       "settings": {
      //         "idekeyRegex": {
      //           name: "idekeyRegex",
      //           value: false"",
      //           ...
      //         },
      //          ...
      //       }
      //     },
      //     ...
      //   },
      // }
      // ```
      nuclidePackages.forEach(function (pkg) {
        var pkgName = pkg.name;
        var nuclide = pkg.metadata.nuclide;

        if (nuclide.config && nuclide.configMetadata) {
          (function () {
            var pathComponents = nuclide.configMetadata.pathComponents;

            var categoryName = pathComponents[0];
            var packageTitle = pathComponents[1];

            // Group packages according to their category.
            var packages = configData[categoryName];
            if (packages == null) {
              packages = {};
              configData[categoryName] = packages;
            }

            // Create settingData for each setting.
            var settings = {};
            Object.keys(nuclide.config).forEach(function (settingName) {
              var keyPath = pkgName + '.' + settingName;
              var schema = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.getSchema(keyPath);
              settings[settingName] = {
                keyPath: keyPath,
                value: (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get(keyPath),
                onChange: function onChange(value) {
                  _this._handleComponentChange(keyPath, value);
                },
                schema: _extends({}, schema, {
                  description: getDescription(schema),
                  order: getOrder(schema),
                  title: getTitle(schema, settingName)
                })
              };

              if (disposables) {
                var disposable = (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.onDidChange(keyPath, _this._handleConfigChange);
                _this._disposables.add(disposable);
              }
            });

            packages[pkgName] = {
              title: packageTitle || pkgName,
              settings: settings
            };
          })();
        }
      });

      return configData;
    }
  }, {
    key: '_handleConfigChange',
    value: function _handleConfigChange(event) {
      var _this2 = this;

      // Workaround: Defer this._getConfigData() as it registers new config.onDidChange() callbacks
      // The issue is that Atom invokes these new callbacks for the current onDidChange event,
      // instead of only for *future* events.
      setTimeout(function () {
        return _this2.setState(_this2._getConfigData());
      });
    }
  }, {
    key: '_handleComponentChange',
    value: function _handleComponentChange(keyPath, value) {
      (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set(keyPath, value);
    }
  }, {
    key: 'render',
    value: function render() {
      var elements = [];

      var configData = this.state;
      Object.keys(configData).sort().forEach(function (categoryName) {
        var packages = configData[categoryName];
        elements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsCategory2 || _SettingsCategory()).default, { key: categoryName, name: categoryName, packages: packages }));
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item padded settings-gadgets-pane' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'settings-view' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'panels' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'panels-item' },
              (_reactForAtom2 || _reactForAtom()).React.createElement('form', { className: 'general-panel section' }),
              elements
            )
          )
        )
      );
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Nuclide Settings';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'tools';
    }

    // Prevent the tab getting split.
  }, {
    key: 'copy',
    value: function copy() {
      return false;
    }
  }]);

  return NuclideSettingsPaneItem;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = NuclideSettingsPaneItem;

function getOrder(schema) {
  return schema.order ? schema.order : 0;
}

function getTitle(schema, settingName) {
  var title = schema.title;
  if (!title) {
    title = settingName.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase();
    }).split('.').join(' ');
  }
  return title;
}

function getDescription(schema) {
  return schema.description || '';
}
module.exports = exports.default;