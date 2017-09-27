'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _react = _interopRequireWildcard(require('react'));

var _SettingsCategory;

function _load_SettingsCategory() {
  return _SettingsCategory = _interopRequireDefault(require('./SettingsCategory'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Section;

function _load_Section() {
  return _Section = require('../../nuclide-ui/Section');
}

var _settingsUtils;

function _load_settingsUtils() {
  return _settingsUtils = require('./settings-utils');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/settings'; /**
                                                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                                                    * All rights reserved.
                                                                                    *
                                                                                    * This source code is licensed under the license found in the LICENSE file in
                                                                                    * the root directory of this source tree.
                                                                                    *
                                                                                    * 
                                                                                    * @format
                                                                                    */

class NuclideSettingsPaneItem extends _react.Component {

  constructor(props) {
    super(props);

    this._handleConfigChange = event => {
      // Workaround: Defer this._getConfigData() as it registers new config.onDidChange() callbacks
      // The issue is that Atom invokes these new callbacks for the current onDidChange event,
      // instead of only for *future* events.
      setTimeout(() => this.setState(this._getConfigData()));
    };

    this._handleComponentChange = (keyPath, value) => {
      (_featureConfig || _load_featureConfig()).default.set(keyPath, value);
    };

    this._onFilterTextChanged = filterText => {
      const filter = filterText != null ? filterText.trim() : '';
      this.setState({
        filter
      });
    };

    this.state = {
      filter: ''
    };
  }

  _getConfigData() {
    // Only need to add config listeners once.
    let disposables = null;
    if (!this._disposables) {
      this._disposables = disposables = new _atom.CompositeDisposable();
    }

    const configData = {};
    const nuclidePackages = atom.packages.getLoadedPackages().filter(pkg => pkg.metadata && pkg.metadata.nuclide);

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
    nuclidePackages.forEach(pkg => {
      const pkgName = pkg.name;
      const { nuclide } = pkg.metadata;
      const config = pkg.metadata.atomConfig || nuclide.config;

      if (config && nuclide.configMetadata) {
        const { pathComponents } = nuclide.configMetadata;
        const categoryName = pathComponents[0];
        const packageTitle = pathComponents[1] || pkgName;
        const categoryMatches = this.state == null || (0, (_settingsUtils || _load_settingsUtils()).matchesFilter)(this.state.filter, categoryName);
        const packageMatches = this.state == null || (0, (_settingsUtils || _load_settingsUtils()).matchesFilter)(this.state.filter, packageTitle);

        // Group packages according to their category.
        let packages = configData[categoryName];
        if (packages == null) {
          packages = {};
          configData[categoryName] = packages;
        }

        // Create settingData for each setting.
        const settings = {};
        Object.keys(config).forEach(settingName => {
          const keyPath = pkgName + '.' + settingName;
          const schema = (_featureConfig || _load_featureConfig()).default.getSchema(keyPath);
          const title = getTitle(schema, settingName);
          const description = getDescription(schema);
          if (this.state == null || categoryMatches || packageMatches || (0, (_settingsUtils || _load_settingsUtils()).matchesFilter)(this.state.filter, title) || (0, (_settingsUtils || _load_settingsUtils()).matchesFilter)(this.state.filter, description)) {
            settings[settingName] = {
              name: settingName,
              description,
              keyPath,
              onChange: value => {
                this._handleComponentChange(keyPath, value);
              },
              order: getOrder(schema),
              schema,
              title,
              value: (_featureConfig || _load_featureConfig()).default.get(keyPath)
            };
          }

          if (disposables) {
            const disposable = (_featureConfig || _load_featureConfig()).default.onDidChange(keyPath, this._handleConfigChange);
            this._disposables.add(disposable);
          }
        });

        if (Object.keys(settings).length !== 0) {
          packages[pkgName] = {
            title: packageTitle,
            settings
          };
        }
      }
    });
    return configData;
  }

  render() {
    const elements = [];

    const configData = this._getConfigData();
    Object.keys(configData).sort().forEach(categoryName => {
      const packages = configData[categoryName];
      if (Object.keys(packages).length > 0) {
        elements.push(_react.createElement((_SettingsCategory || _load_SettingsCategory()).default, {
          key: categoryName,
          name: categoryName,
          packages: packages
        }));
      }
    });
    const settings = elements.length === 0 ? null : elements;
    return _react.createElement(
      'div',
      { className: 'pane-item padded settings-gadgets-pane' },
      _react.createElement(
        'div',
        { className: 'settings-view panels panels-item' },
        _react.createElement(
          'div',
          { className: 'panels' },
          _react.createElement(
            'div',
            { className: 'panels-item' },
            _react.createElement(
              'section',
              { className: 'section' },
              _react.createElement(
                (_Section || _load_Section()).Section,
                { headline: 'Filter', collapsable: true },
                _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
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

  getTitle() {
    return 'Nuclide Settings';
  }

  getIconName() {
    return 'tools';
  }

  getDefaultLocation() {
    return 'center';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  // Prevent the tab getting split.
  copy() {
    return false;
  }
}

exports.default = NuclideSettingsPaneItem;
function getOrder(schema) {
  return typeof schema.order === 'number' ? schema.order : 0;
}

function getTitle(schema, settingName) {
  let title = schema.title;
  // flowlint-next-line sketchy-null-string:off
  if (!title) {
    title = settingName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).split('.').join(' ');
  }
  return title;
}

function getDescription(schema) {
  return schema.description || '';
}