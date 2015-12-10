'use babel';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 *                  _  _ _  _ ____ _    _ ___  ____
 *                  |\ | |  | |    |    | |  \ |___
 *                  | \| |__| |___ |___ | |__/ |___
 * _  _ _  _ _ ____ _ ____ ___     ___  ____ ____ _  _ ____ ____ ____
 * |  | |\ | | |___ | |___ |  \    |__] |__| |    |_/  |__| | __ |___
 * |__| | \| | |    | |___ |__/    |    |  | |___ | \_ |  | |__] |___
 *
 */

if (typeof atom === 'undefined') {
  throw new Error('This is an Atom package. Did you mean to run the server?');
}

const fs = require('fs');
const invariant = require('assert');
const path = require('path');
const {CompositeDisposable} = require('atom');

// Exported "config" object
const config = {
  use: {
    type: 'object',
    properties: {},
  },
};

// Nuclide packages for Atom are called "features"
const FEATURES_DIR = path.join(__dirname, '../pkg');
const features = {};

let disposables;

/**
 * Get the "package.json" of all the features.
 */
(function traverse(dirname) {
  // Perform a depth-first search for first-level "package.json" files
  try {
    const list = fs.readdirSync(dirname);
    if (list.indexOf('package.json') !== -1) {
      const filename = path.join(dirname, 'package.json');
      const src = fs.readFileSync(filename, 'utf8');
      // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
      if (src.indexOf('"Atom"') === -1) {
        return;
      }
      const pkg = JSON.parse(src);
      if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
        invariant(pkg.name);
        features[pkg.name] = {
          pkg,
          dirname,
          useKeyPath: `nuclide.use.${pkg.name}`,
          packageModule: null,
        };
      }
    } else {
      for (const item of list) {
        // Exclude the "sample" directory
        if (item === 'sample' && FEATURES_DIR === dirname) {
          continue;
        }
        // Optimization: Our directories don't have periods - this must be a file
        if (item.indexOf('.') !== -1) {
          continue;
        }
        const next = path.join(dirname, item);
        traverse(next);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOTDIR') {
      throw err;
    }
  }
})(FEATURES_DIR);


/**
 * Build the "config" object. This determines the config defaults and
 * it's what is shown by the Settings view. It includes:
 * (1) An entry to enable/disable each feature - called "nuclide.use.*".
 * (2) Each feature's merged config.
 *
 * https://atom.io/docs/api/latest/Config
 */
Object.keys(features).forEach(name => {
  const {pkg} = features[name];

  // Entry for enabling/disabling the feature
  const setting = {
    title: `Enable the "${name}" feature`,
    description: pkg.description || '',
    type: 'boolean',
    default: true,
  };
  if (pkg.providedServices) {
    const provides = Object.keys(pkg.providedServices).join(', ');
    setting.description += `<br/>**Provides:** _${provides}_`;
  }
  if (pkg.consumedServices) {
    const consumes = Object.keys(pkg.consumedServices).join(', ');
    setting.description += `<br/>**Consumes:** _${consumes}_`;
  }
  config.use.properties[name] = setting;

  // Merge in the feature's config
  const pkgConfig = pkg.nuclide.config;
  if (pkgConfig) {
    config[name] = {
      type: 'object',
      properties: {},
    };
    Object.keys(pkgConfig).forEach(key => {
      config[name].properties[key] = {
        ...pkgConfig[key],
        title: `${name}: ${pkgConfig[key].title || key}`,
      };
    });

    // $UPFixMe: Temporary hack so we don't have to remove the
    // `require('../package.json').nuclide.config` from each package
    const realPkg = require(path.join(features[name].dirname, 'package.json'));
    delete realPkg.nuclide.config;
  }
});


const UPLoader = {
  config,

  activate() {
    invariant(!disposables);
    disposables = new CompositeDisposable();

    // Loading all of the features, then activating them what Atom does on init:
    // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
    // https://atom.io/docs/api/latest/PackageManager
    Object.keys(features).forEach(name => {
      const feature = features[name];
      const enabled = atom.config.get(feature.useKeyPath);
      if (enabled && !feature.packageModule) {
        feature.packageModule = atom.packages.loadPackage(feature.dirname);
      }
    });
    Object.keys(features).forEach(name => {
      if (features[name].packageModule) {
        atom.packages.activatePackage(name);
      }
    });

    // Watch the config to manage toggling features
    Object.keys(features).forEach(name => {
      const feature = features[name];
      const watcher = atom.config.onDidChange(feature.useKeyPath, event => {
        if (event.newValue === true && !feature.packageModule) {
          feature.packageModule = atom.packages.loadPackage(feature.dirname);
          feature.packageModule.activate();
        } else if (event.newValue === false && feature.packageModule) {
          safeDeactivate(name);
        }
      });
      disposables.add(watcher);
    });
  },

  deactivate() {
    Object.keys(features).forEach(name => {
      if (features[name].packageModule) {
        safeDeactivate(name);
      }
    });
    if (disposables) {
      disposables.dispose();
      disposables = null;
    }
  },

  /**
   * FOR TESTING PURPOSES ONLY!
   */
  __testUseOnly_getAvailablePackageNames() {
    return Object.keys(features);
  },

  __testUseOnly_getAvailablePackagePaths() {
    return Object.keys(features).map(name => features[name].dirname);
  },

  __testUseOnly_loadPackage(name) {
    const feature = features[name];
    return atom.packages.loadPackage(feature.dirname);
  },

  __testUseOnly_activatePackage(name) {
    const feature = features[name];
    return atom.packages.activatePackage(feature.dirname);
  },

  __testUseOnly_deactivatePackage(name) {
    return atom.packages.deactivatePackage(name);
  },
};

module.exports = UPLoader;

function safeDeactivate(name) {
  try {
    atom.packages.deactivatePackage(name);
  } catch (err) {
    console.error(`Error deactivating "${name}"`, err); //eslint-disable-line no-console
  } finally {
    features[name].packageModule = null;
  }
}
