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

import featureConfig from '../pkg/nuclide-feature-config';
import fs from 'fs';
import invariant from 'assert';
import {nuclideFeatures} from './nuclide-features';
import path from 'path';
import {setUseLocalRpc} from '../pkg/nuclide-remote-connection/lib/service-manager';

import {CompositeDisposable} from 'atom';

// Exported "config" object
export const config = {
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
  useLocalRpc: {
    default: false,
    description:
      'Use RPC marshalling for local services. This ensures better compatibility between the local'
      + ' and remote case. Useful for internal Nuclide development. Requires restart to take'
      + ' effect.',
    title: 'Use RPC for local Services.',
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
let hasActivatedOnce = false;

/**
 * Get the "package.json" of all the features.
 */
fs.readdirSync(FEATURES_DIR).forEach(item => {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  const dirname = path.join(FEATURES_DIR, item);
  const filename = path.join(dirname, 'package.json');
  try {
    const stat = fs.statSync(filename);
    invariant(stat.isFile());
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return;
    }
  }
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
});

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

  // Sample packages are disabled by default. They are meant for development
  // use only, and aren't included in Nuclide builds.
  const enabled = !name.startsWith('sample-');

  // Entry for enabling/disabling the feature
  const setting = {
    title: `Enable the "${name}" feature`,
    description: pkg.description || '',
    type: 'boolean',
    default: enabled,
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
        title: (pkgConfig[key].title || key),
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

export function activate() {
  invariant(!disposables);
  disposables = new CompositeDisposable();

  // Add the "Nuclide" menu, if it's not there already.
  disposables.add(
    atom.menu.add([{
      label: 'Nuclide',
      submenu: [],
    }])
  );

  // Manually manipulate the menu template order.
  const insertIndex =
    atom.menu.template.findIndex(item => item.role === 'window' || item.role === 'help');
  if (insertIndex !== -1) {
    const nuclideIndex = atom.menu.template.findIndex(item => item.label === 'Nuclide');
    const menuItem = atom.menu.template.splice(nuclideIndex, 1)[0];
    const newIndex = insertIndex > nuclideIndex ? insertIndex - 1 : insertIndex;
    atom.menu.template.splice(newIndex, 0, menuItem);
    atom.menu.update();
  }

  // Loading all of the features, then activating them what Atom does on init:
  // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
  // https://atom.io/docs/api/latest/PackageManager
  const loaded = Object.keys(features).map(name => {
    const feature = features[name];
    const enabled = atom.config.get(feature.useKeyPath);
    // `enabled` may be `undefined` if `atom.config.get` is called before the
    // the default config is built. If the feature is explicitly enabled or
    // disabled, then the config value will be set regardless of when
    // `atom.config.get` is called.
    const shouldEnable = typeof enabled === 'undefined'
      ? config.use.properties[name].enabled
      : enabled;
    if (shouldEnable && !feature.packageModule) {
      feature.packageModule = atom.packages.loadPackage(feature.dirname);
      if (feature.packageModule.mainModule &&
          feature.packageModule.mainModule.config) {
        // Feature config is handled by the UP loader, not individual features
        throw new Error(`"${name}" exported a "config"`);
      }
      return feature.packageModule;
    }
  }).filter(Boolean);

  if (!hasActivatedOnce) {
    nuclideFeatures.didLoadInitialFeatures();
    setUseLocalRpc(featureConfig.get('useLocalRpc'));
  }

  // Activate all of the loaded features.
  // https://github.com/atom/atom/blob/v1.1.0/src/package-manager.coffee#L431-L440
  Promise.all(atom.packages.activatePackages(loaded))
    .then(() => {
      if (!hasActivatedOnce) {
        nuclideFeatures.didActivateInitialFeatures();

        // No more Nuclide events will be fired. Dispose the Emitter to release
        // memory and to inform future callers that they're attempting to listen
        // to events that will never fire again.
        nuclideFeatures.dispose();
        hasActivatedOnce = true;
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

  // Install public, 3rd-party Atom packages listed in this package's 'package-deps' setting. Run
  // this *after* other packages are activated so they can modify this setting if desired before
  // installation is attempted.
  if (featureConfig.get('installRecommendedPackages')) {
    require('atom-package-deps').install('nuclide');
  }
}

export function deactivate() {
  Object.keys(features).forEach(name => {
    if (features[name].packageModule) {
      safeDeactivate(name);
    }
  });
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

/**
 * FOR TESTING PURPOSES ONLY!
 */
export function __testUseOnly_getAvailablePackageNames() {
  return Object.keys(features);
}

export function __testUseOnly_getAvailablePackagePaths() {
  return Object.keys(features).map(name => features[name].dirname);
}

export function __testUseOnly_loadPackage(name) {
  const feature = features[name];
  return atom.packages.loadPackage(feature.dirname);
}

export function __testUseOnly_activatePackage(name) {
  const feature = features[name];
  return atom.packages.activatePackage(feature.dirname);
}

export function __testUseOnly_deactivatePackage(name) {
  return atom.packages.deactivatePackage(name);
}

export function __testUseOnly_removeFeature(name) {
  delete features[name];
}

function safeDeactivate(name) {
  try {
    atom.packages.deactivatePackage(name);
  } catch (err) {
    //eslint-disable-next-line no-console
    console.error(`Error deactivating "${name}": ${err.message}`);
  } finally {
    features[name].packageModule = null;
  }
}
