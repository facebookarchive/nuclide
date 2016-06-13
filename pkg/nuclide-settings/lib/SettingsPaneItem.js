'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SettingsEvent} from './types';

import {CompositeDisposable} from 'atom';
import featureConfig from '../../nuclide-feature-config';
import {React} from 'react-for-atom';
import SettingsCategory from './SettingsCategory';

export default class NuclideSettingsPaneItem extends React.Component {
  static gadgetId = 'nuclide-settings';
  static defaultLocation = 'active-pane';

  _disposables: CompositeDisposable;
  state: Object;

  constructor(props: Object) {
    super(props);

    // Bind callbacks first since we use these during config data generation.
    (this: any)._onConfigChanged = this._onConfigChanged.bind(this);
    (this: any)._onComponentChanged = this._onComponentChanged.bind(this);

    this.state = this._getConfigData();
  }

  _getConfigData(): Object {
    // Only need to add config listeners once.
    let disposables = null;
    if (!this._disposables) {
      this._disposables = disposables = new CompositeDisposable();
    }

    const configData = {};
    const nuclidePackages =
      atom.packages.getActivePackages().filter(pkg => pkg.metadata && pkg.metadata.nuclide);

    // Config data is organized as a series of nested objects. First, by category
    // and then by packages in each category. Each package contains a title and an
    // object for each setting in that package. Each setting also contains an
    // onChanged callback for components. We also listen for atom.config.onDidChange.
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
    nuclidePackages.forEach(pkg => {
      const pkgName = pkg.name;
      const {nuclide} = pkg.metadata;

      if (nuclide.config && nuclide.configMetadata) {
        const {pathComponents} = nuclide.configMetadata;
        const categoryName = pathComponents[0];
        const packageTitle = pathComponents[1];

        // Group packages according to their category.
        let packages = configData[categoryName];
        if (packages == null) {
          packages = {};
          configData[categoryName] = packages;
        }

        // Create settingData for each setting.
        const settings = {};
        Object.keys(nuclide.config).forEach(settingName => {
          const keyPath = pkgName + '.' + settingName;
          const schema = featureConfig.getSchema(keyPath);
          settings[settingName] = {
            name: settingName,
            description: getDescription(schema),
            keyPath,
            onChanged: this._onComponentChanged,
            order: getOrder(schema),
            title: getTitle(schema, settingName),
            value: featureConfig.get(keyPath),
          };

          if (disposables) {
            const disposable = featureConfig.onDidChange(keyPath, this._onConfigChanged);
            this._disposables.add(disposable);
          }
        });

        packages[pkgName] = {
          title: packageTitle || pkgName,
          settings,
        };
      }
    });

    return configData;
  }

  _onConfigChanged(event: Object) {
    // Workaround: Defer this._getConfigData() as it registers new config.onDidChange() callbacks
    // The issue is that Atom invokes these new callbacks for the current onDidChange event,
    // instead of only for *future* events.
    setTimeout(() => this.setState(this._getConfigData()));
  }

  _onComponentChanged(event: SettingsEvent) {
    featureConfig.set(event.keyPath, event.newValue);
  }

  render(): React.Element<any> {
    const elements = [];

    const configData = this.state;
    Object.keys(configData).sort().forEach(categoryName => {
      const packages = configData[categoryName];
      elements.push(
        <SettingsCategory key={categoryName} name={categoryName} packages={packages} />
      );
    });

    return (
      <div className="pane-item padded settings-gadgets-pane">
        <div className="settings-view">
          <div className="settings-panel">
            {elements}
          </div>
        </div>
      </div>
    );
  }

  getTitle(): string {
    return 'Nuclide Settings';
  }

  getIconName(): string {
    return 'tools';
  }

  // Prevent the tab getting split.
  copy(): boolean {
    return false;
  }
}

function getOrder(schema: atom$ConfigSchema): number {
  return (schema.order ? schema.order : 0);
}

function getTitle(schema: atom$ConfigSchema, settingName: string): string {
  let title = schema.title;
  if (!title) {
    title = settingName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .split('.')
      .join(' ');
  }
  return title;
}

function getDescription(schema: atom$ConfigSchema): string {
  return schema.description || '';
}
