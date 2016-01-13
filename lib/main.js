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

const featureConfig = require('../pkg/nuclide/feature-config');
const fs = require('fs');
const invariant = require('assert');
let nuclideFeatures = require('./nuclideFeatures');
const nuclideMigrations = require('./nuclideMigrations');
const nuclideUninstaller = require('./nuclideUninstaller');
const path = require('path');
const temp = require('temp').track();

const {CompositeDisposable} = require('atom');

// If we are in a testing environment then we want to use a default atom config.
if (process.env.NODE_ENV !== 'production' && typeof jasmine !== 'undefined') {
  const tempDirPath = temp.mkdirSync('atom_home');
  atom.config.configDirPath = tempDirPath;
  atom.config.configFilePath = path.join(tempDirPath, 'config.cson');
}

// Exported "config" object
const config = {
  installRecommendedPackages: {
    default: false,
    description:
      'On start up, check for and install Atom packages recommended for use with Nuclide. The'
      + ' list of packages can be found in the <code>package-deps</code> setting in this package\'s'
      + ' "package.json" file. Disabling this setting will not uninstall packages it previously'
      + ' installed. Restart Atom after changing this setting for it to take effect.',
    title: 'Install Recommended Packages on Startup',
    type: 'boolean',
  },
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
 * Migrate users of outdated Nuclide packages to the Nuclide Unified Package.
 *
 * - Migrate settings to their new keys in the 'nuclide.' namespace if necessary.
 * - Disable packages that have been replaced by the 'nuclide' package.
 */
nuclideMigrations.migrateConfig();
nuclideUninstaller.disableOutdatedPackages();

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
        title: name + ': ' + (pkgConfig[key].title || key),
      };
    });
  }
});

/**
 * Load feature deserializers and require them.
 * This is coming in Atom 1.4.0 - https://github.com/atom/atom/issues/9974
 */
Object.keys(features).forEach(name => {
  const {pkg, dirname} = features[name];
  if (pkg.nuclide.deserializers) {
    Object.keys(pkg.nuclide.deserializers).forEach(deserializerName => {
      const deserializerPath = pkg.nuclide.deserializers[deserializerName];
      const modulePath = path.join(dirname, deserializerPath);
      const deserializer = require(modulePath);
      atom.deserializers.add({
        name: deserializerName,
        deserialize: deserializer,
      });
    });
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
        if (feature.packageModule.mainModule &&
            feature.packageModule.mainModule.config) {
          // Feature config is handled by the UP loader, not individual features
          throw new Error(`"${name}" exported a "config"`);
        }
      }
    });

    if (nuclideFeatures) {
      nuclideFeatures.didLoadInitialFeatures();
    }

    Object.keys(features).forEach(name => {
      if (features[name].packageModule) {
        atom.packages.activatePackage(name);
      }
    });

    if (nuclideFeatures) {
      nuclideFeatures.didActivateInitialFeatures();

      // No more Nuclide events will be fired. Dispose the Emitter to release
      // memory and to inform future callers that they're attempting to listen
      // to events that will never fire again.
      nuclideFeatures.dispose();
      nuclideFeatures = null;
    }

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

    // Install public, 3rd-party Atom packages listed in this package's 'package-deps' setting. Run
    // this *after* other packages are activated so they can modify this setting if desired before
    // installation is attempted.
    if (featureConfig.get('installRecommendedPackages')) {
      require('atom-package-deps').install('nuclide');
    }
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

  __testUseOnly_removeFeature(name) {
    delete features[name];
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
