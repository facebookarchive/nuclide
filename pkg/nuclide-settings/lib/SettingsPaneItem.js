"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WORKSPACE_VIEW_URI = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _SettingsCategory() {
  const data = _interopRequireDefault(require("./SettingsCategory"));

  _SettingsCategory = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Section() {
  const data = require("../../../modules/nuclide-commons-ui/Section");

  _Section = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/settings';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class SettingsPaneItem extends React.Component {
  constructor(props) {
    super(props);

    this._handleComponentChange = (keyPath, value) => {
      _featureConfig().default.set(keyPath, value);
    };

    this._onFilterTextChanged = filterText => {
      const filter = filterText != null ? filterText.trim() : '';
      this.setState({
        filter
      });
    };

    this.state = {
      filter: props.initialFilter || ''
    };
  }

  _getConfigData() {
    const configData = {};
    const nuclidePackages = atom.packages.getLoadedPackages().filter(pkg => pkg.metadata && pkg.metadata.nuclide); // Config data is organized as a series of nested objects. First, by category
    // and then by packages in each category. Each package contains a title and an
    // object for each setting in that package. Each setting also contains an
    // onChange callback for components.
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
      const {
        nuclide
      } = pkg.metadata;
      const config = pkg.metadata.atomConfig || nuclide.config;

      if (config && nuclide.configMetadata) {
        const {
          pathComponents
        } = nuclide.configMetadata;
        const categoryName = pathComponents[0];
        const packageTitle = pathComponents[1] || pkgName; // Group packages according to their category.

        let packages = configData[categoryName];

        if (packages == null) {
          packages = {};
          configData[categoryName] = packages;
        } // Create settingData for each setting.


        const settings = {};
        Object.keys(config).forEach(settingName => {
          const keyPath = pkgName + '.' + settingName;

          const schema = _featureConfig().default.getSchema(keyPath);

          const title = getTitle(schema, settingName);
          const description = getDescription(schema);

          if (this.state == null || matchesFilter(this.state.filter, categoryName) || matchesFilter(this.state.filter, packageTitle) || matchesFilter(this.state.filter, title) || matchesFilter(this.state.filter, description) || matchesFilter(this.state.filter, keyPath)) {
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
              value: _featureConfig().default.get(keyPath)
            };
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

  _getSettingsKeyPaths() {
    const keyPaths = [];
    const nuclidePackages = atom.packages.getLoadedPackages().filter(pkg => pkg.metadata && pkg.metadata.nuclide);
    nuclidePackages.forEach(pkg => {
      const pkgName = pkg.name;
      const {
        nuclide
      } = pkg.metadata;
      const config = pkg.metadata.atomConfig || nuclide.config;

      if (config != null) {
        Object.keys(config).forEach(settingName => keyPaths.push(pkgName + '.' + settingName));
      }
    });
    return keyPaths;
  }

  componentDidMount() {
    const settingsKeyPaths = this._getSettingsKeyPaths();

    const changedSettings = settingsKeyPaths.map(keyPath => _featureConfig().default.observeAsStream(keyPath));
    this._disposables = new (_UniversalDisposable().default)((0, _observePaneItemVisibility().default)(this).filter(Boolean).delay(0, _RxMin.Scheduler.animationFrame).subscribe(() => {
      if (this._filterInput != null) {
        this._filterInput.focus();
      }
    }), _RxMin.Observable.merge(...changedSettings) // throttle to prevent rerendering for each change if changes occur in
    // rapid succession
    .throttleTime(50).subscribe(() => {
      this.setState(this._getConfigData());
    }));
  }

  render() {
    const elements = [];

    const configData = this._getConfigData();

    Object.keys(configData).sort().forEach(categoryName => {
      const packages = configData[categoryName];

      if (Object.keys(packages).length > 0) {
        elements.push(React.createElement(_SettingsCategory().default, {
          key: categoryName,
          name: categoryName,
          packages: packages
        }));
      }
    });
    const settings = elements.length === 0 ? null : elements;
    return React.createElement("div", {
      className: "pane-item padded settings-gadgets-pane"
    }, React.createElement("div", {
      className: "settings-view panels panels-item"
    }, React.createElement("div", {
      className: "panels"
    }, React.createElement("div", {
      className: "panels-item"
    }, React.createElement("section", {
      className: "section"
    }, React.createElement(_Section().Section, {
      headline: "Filter",
      collapsable: true
    }, React.createElement(_AtomInput().AtomInput, {
      ref: component => {
        this._filterInput = component;
      },
      size: "lg",
      placeholderText: "Filter by setting title or description",
      initialValue: this.props.initialFilter,
      onDidChange: this._onFilterTextChanged
    }))), settings))));
  }

  componentWillUnmount() {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
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
  } // Prevent the tab getting split.


  copy() {
    return false;
  }

}

exports.default = SettingsPaneItem;

function getOrder(schema) {
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  return typeof schema.order === 'number' ? schema.order : 0;
}

function getTitle(schema, settingName) {
  let title = schema.title; // flowlint-next-line sketchy-null-string:off

  if (!title) {
    title = settingName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).split('.').join(' ');
  }

  return title;
}

function getDescription(schema) {
  return schema.description || '';
} // Remove spaces and hyphens


function strip(str) {
  return str.replace(/\s+/g, '').replace(/-+/g, '');
}
/** Returns true if filter matches search string. Return true if filter is empty. */


function matchesFilter(filter, searchString) {
  if (filter.length === 0) {
    return true;
  }

  const needle = strip(filter.toLowerCase());
  const hay = strip(searchString.toLowerCase());
  return hay.indexOf(needle) !== -1;
}