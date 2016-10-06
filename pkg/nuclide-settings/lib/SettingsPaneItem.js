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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _SettingsCategory2;

function _SettingsCategory() {
  return _SettingsCategory2 = _interopRequireDefault(require('./SettingsCategory'));
}

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../nuclide-ui/AtomInput');
}

var _nuclideUiSection2;

function _nuclideUiSection() {
  return _nuclideUiSection2 = require('../../nuclide-ui/Section');
}

var _settingsUtils2;

function _settingsUtils() {
  return _settingsUtils2 = require('./settings-utils');
}

var NuclideSettingsPaneItem = (function (_React$Component) {
  _inherits(NuclideSettingsPaneItem, _React$Component);

  function NuclideSettingsPaneItem(props) {
    _classCallCheck(this, NuclideSettingsPaneItem);

    _get(Object.getPrototypeOf(NuclideSettingsPaneItem.prototype), 'constructor', this).call(this, props);

    // Bind callbacks first since we use these during config data generation.
    this._handleConfigChange = this._handleConfigChange.bind(this);
    this._handleComponentChange = this._handleComponentChange.bind(this);
    this._onFilterTextChanged = this._onFilterTextChanged.bind(this);
    this.state = {
      filter: ''
    };
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
      //     "nuclide-debugger-php": {
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
              var schema = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.getSchema(keyPath);
              var title = getTitle(schema, settingName);
              var description = getDescription(schema);
              if (_this.state == null || (0, (_settingsUtils2 || _settingsUtils()).matchesFilter)(_this.state.filter, title) || (0, (_settingsUtils2 || _settingsUtils()).matchesFilter)(_this.state.filter, description)) {
                settings[settingName] = {
                  name: settingName,
                  description: description,
                  keyPath: keyPath,
                  onChange: function onChange(value) {
                    _this._handleComponentChange(keyPath, value);
                  },
                  order: getOrder(schema),
                  schema: schema,
                  title: title,
                  value: (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get(keyPath)
                };
              }

              if (disposables) {
                var disposable = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.onDidChange(keyPath, _this._handleConfigChange);
                _this._disposables.add(disposable);
              }
            });

            if (Object.keys(settings).length !== 0) {
              packages[pkgName] = {
                title: packageTitle || pkgName,
                settings: settings
              };
            }
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
      (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.set(keyPath, value);
    }
  }, {
    key: 'render',
    value: function render() {
      var elements = [];

      var configData = this._getConfigData();
      Object.keys(configData).sort().forEach(function (categoryName) {
        var packages = configData[categoryName];
        if (Object.keys(packages).length > 0) {
          elements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_SettingsCategory2 || _SettingsCategory()).default, {
            key: categoryName,
            name: categoryName,
            packages: packages
          }));
        }
      });
      var settings = elements.length === 0 ? null : elements;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'pane-item padded settings-gadgets-pane' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'settings-view panels panels-item' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'panels' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'div',
              { className: 'panels-item' },
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'section',
                { className: 'section' },
                (_reactForAtom2 || _reactForAtom()).React.createElement(
                  (_nuclideUiSection2 || _nuclideUiSection()).Section,
                  {
                    headline: 'Filter',
                    collapsable: true },
                  (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
                    size: 'lg',
                    placeholderText: 'Filter by setting title or description',
                    onDidChange: this._onFilterTextChanged
                  })
                )
              ),
              settings
            )
          )
        )
      );
    }
  }, {
    key: '_onFilterTextChanged',
    value: function _onFilterTextChanged(filterText) {
      var filter = filterText != null ? filterText.trim() : '';
      this.setState({
        filter: filter
      });
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
  return typeof schema.order === 'number' ? schema.order : 0;
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