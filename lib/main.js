Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _pkgCommonsAtomFeatureConfig2;

function _pkgCommonsAtomFeatureConfig() {
  return _pkgCommonsAtomFeatureConfig2 = _interopRequireDefault(require('../pkg/commons-atom/featureConfig'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _pkgNuclideRemoteConnectionLibServiceManager2;

function _pkgNuclideRemoteConnectionLibServiceManager() {
  return _pkgNuclideRemoteConnectionLibServiceManager2 = require('../pkg/nuclide-remote-connection/lib/service-manager');
}

var _electron2;

function _electron() {
  return _electron2 = _interopRequireDefault(require('electron'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _atomPackageDeps2;

function _atomPackageDeps() {
  return _atomPackageDeps2 = require('atom-package-deps');
}

var _packageJson2;

function _packageJson() {
  return _packageJson2 = _interopRequireDefault(require('../package.json'));
}

var _configMigrator2;

function _configMigrator() {
  return _configMigrator2 = _interopRequireDefault(require('./configMigrator'));
}

var remote = (_electron2 || _electron()).default.remote;

(0, (_assert2 || _assert()).default)(remote != null);

// Add a dummy deserializer. This forces Atom to load Nuclide's main module
// (this file) when the package is loaded, which is super important because
// this module loads all of the Nuclide features. We could accomplish the same
// thing by unsetting [the local storage value][1] that Atom uses to indicate
// whether the main module load can be deferred, however, that would mean that
// (for a brief time, at least), the flag would be set. If there were an error
// during that time and we never got a chance to unset the flag, Nuclide
// features would never load again!
//
// [1] https://github.com/atom/atom/blob/v1.9.8/src/package.coffee#L442
atom.deserializers.add({
  name: 'nuclide.ForceMainModuleLoad',
  deserialize: function deserialize() {}
});

// Run settings migrations
(0, (_configMigrator2 || _configMigrator()).default)();

// Exported "config" object
var config = {
  installRecommendedPackages: {
    'default': false,
    description: 'On start up, check for and install Atom packages recommended for use with Nuclide. The' + ' list of packages can be found in the <code>package-deps</code> setting in this package\'s' + ' "package.json" file. Disabling this setting will not uninstall packages it previously' + ' installed. Restart Atom after changing this setting for it to take effect.',
    title: 'Install Recommended Packages on Startup',
    type: 'boolean'
  },
  useLocalRpc: {
    'default': false,
    description: 'Use RPC marshalling for local services. This ensures better compatibility between the local' + ' and remote case. Useful for internal Nuclide development. Requires restart to take' + ' effect.',
    title: 'Use RPC for local Services.',
    type: 'boolean'
  },
  use: {
    type: 'object',
    properties: {}
  }
};

exports.config = config;
// `setUseLocalRpc` can only be called once, so it's set out here during load.
var _useLocalRpc = atom.config.get('nuclide.useLocalRpc');
var _shouldUseLocalRpc = typeof _useLocalRpc !== 'boolean' ? config.useLocalRpc.default : _useLocalRpc;
(0, (_pkgNuclideRemoteConnectionLibServiceManager2 || _pkgNuclideRemoteConnectionLibServiceManager()).setUseLocalRpc)(_shouldUseLocalRpc);

var runningNuclideVersion = (_packageJson2 || _packageJson()).default.version;

// Nuclide packages for Atom are called "features"
var FEATURES_DIR = (_path2 || _path()).default.join(__dirname, '../pkg');
var features = {};

var disposables = undefined;

/**
 * Get the "package.json" of all the features.
 */
(_fs2 || _fs()).default.readdirSync(FEATURES_DIR).forEach(function (item) {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  var dirname = (_path2 || _path()).default.join(FEATURES_DIR, item);
  var filename = (_path2 || _path()).default.join(dirname, 'package.json');
  try {
    var stat = (_fs2 || _fs()).default.statSync(filename);
    (0, (_assert2 || _assert()).default)(stat.isFile());
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return;
    }
  }
  var src = (_fs2 || _fs()).default.readFileSync(filename, 'utf8');
  // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
  if (src.indexOf('"Atom"') === -1) {
    return;
  }
  var pkg = JSON.parse(src);
  if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
    (0, (_assert2 || _assert()).default)(pkg.name);
    features[pkg.name] = {
      pkg: pkg,
      dirname: dirname,
      useKeyPath: 'nuclide.use.' + pkg.name
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
Object.keys(features).forEach(function (name) {
  var pkg = features[name].pkg;

  // Sample packages are disabled by default. They are meant for development
  // use only, and aren't included in Nuclide builds.
  var enabled = !name.startsWith('sample-');

  // Entry for enabling/disabling the feature
  var setting = {
    title: 'Enable the "' + name + '" feature',
    description: pkg.description || '',
    type: 'boolean',
    'default': enabled
  };
  if (pkg.providedServices) {
    var provides = Object.keys(pkg.providedServices).join(', ');
    setting.description += '<br/>**Provides:** _' + provides + '_';
  }
  if (pkg.consumedServices) {
    var consumes = Object.keys(pkg.consumedServices).join(', ');
    setting.description += '<br/>**Consumes:** _' + consumes + '_';
  }
  config.use.properties[name] = setting;

  // Merge in the feature's config
  var pkgConfig = pkg.nuclide.config;
  if (pkgConfig) {
    config[name] = {
      type: 'object',
      properties: {}
    };
    Object.keys(pkgConfig).forEach(function (key) {
      config[name].properties[key] = _extends({}, pkgConfig[key], {
        title: pkgConfig[key].title || key
      });
    });
  }
});

// Nesting loads within loads leads to reverse activation order- that is, if
// Nuclide loads feature packages, then the feature package activations will
// happen before Nuclide's. So we wait until Nuclide is done loading, but before
// it activates, to load the features.
var initialLoadDisposable = atom.packages.onDidLoadPackage(function (pack) {
  if (pack.name !== 'nuclide') {
    return;
  }

  // Load all the features. This needs to be done during Atom's load phase to
  // make sure that deserializers are registered, etc.
  // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
  // https://atom.io/docs/api/latest/PackageManager
  Object.keys(features).forEach(function (name) {
    var feature = features[name];
    // Config defaults are not merged with user defaults until activate. At
    // this point `atom.config.get` returns the user set value. If it's
    // `undefined`, then the user has not set it.
    var _enabled = atom.config.get(feature.useKeyPath);
    var _shouldEnable = typeof _enabled === 'undefined' ? config.use.properties[name].default : _enabled;
    if (_shouldEnable) {
      atom.packages.loadPackage(feature.dirname);
    }
  });

  (0, (_assert2 || _assert()).default)(initialLoadDisposable != null);
  initialLoadDisposable.dispose();
  initialLoadDisposable = null;
});

function activate() {
  var nuclidePack = atom.packages.getLoadedPackage('nuclide');
  (0, (_assert2 || _assert()).default)(nuclidePack != null);

  // This is a failsafe in case the `nuclide.ForceMainModuleLoad` deserializer
  // defined above does not register in time, or if the defer key has been set
  // w/o our knowledge. This can happen during OSS upgrades.
  window.localStorage.removeItem(nuclidePack.getCanDeferMainModuleRequireStorageKey());

  // This version mismatch happens during OSS updates. After updates, Nuclide is
  // still in the module cache - with all of its glorious state - which usually
  // results in a red box of some kind because the disk content doesn't match
  // the expectations of the code that is in memory.
  var pkgJsonPath = (_path2 || _path()).default.join(nuclidePack.path, 'package.json');
  var installedPkg = JSON.parse((_fs2 || _fs()).default.readFileSync(pkgJsonPath, 'utf8'));
  var installedNuclideVersion = installedPkg.version;
  if (installedNuclideVersion !== runningNuclideVersion) {
    atom.notifications.addWarning('Nuclide\'s version has changed from\n      v' + runningNuclideVersion + ' to v' + installedNuclideVersion + '.\n      Reload Atom to use the new version.', {
      buttons: [{
        className: 'icon icon-zap',
        onDidClick: function onDidClick() {
          atom.reload();
        },
        text: 'Reload Atom'
      }],
      dismissable: true
    });
    return;
  }

  disposables = new (_atom2 || _atom()).CompositeDisposable();

  // Add the "Nuclide" menu, if it's not there already.
  disposables.add(atom.menu.add([{
    label: 'Nuclide',
    submenu: [{
      label: 'Version ' + runningNuclideVersion,
      enabled: false
    }]
  }]));

  // Manually manipulate the menu template order.
  var insertIndex = atom.menu.template.findIndex(function (item) {
    return item.role === 'window' || item.role === 'help';
  });
  if (insertIndex !== -1) {
    var nuclideIndex = atom.menu.template.findIndex(function (item) {
      return item.label === 'Nuclide';
    });
    var menuItem = atom.menu.template.splice(nuclideIndex, 1)[0];
    var newIndex = insertIndex > nuclideIndex ? insertIndex - 1 : insertIndex;
    atom.menu.template.splice(newIndex, 0, menuItem);
    atom.menu.update();
  }

  // Activate all of the loaded features. Technically, this will be a no-op
  // generally because Atom [will activate all loaded packages][1]. However,
  // that won't happen, for example, with our `activateAllPackages()`
  // integration test helper.
  //
  // [1]: https://github.com/atom/atom/blob/v1.9.0/src/package-manager.coffee#L425
  Object.keys(features).forEach(function (name) {
    var feature = features[name];
    if (atom.config.get(feature.useKeyPath)) {
      atom.packages.activatePackage(feature.dirname);
    }
  });

  // Watch the config to manage toggling features
  Object.keys(features).forEach(function (name) {
    var feature = features[name];
    var watcher = atom.config.onDidChange(feature.useKeyPath, function (event) {
      if (event.newValue === true) {
        atom.packages.activatePackage(feature.dirname);
      } else if (event.newValue === false) {
        safeDeactivate(name);
      }
    });
    (0, (_assert2 || _assert()).default)(disposables != null);
    disposables.add(watcher);
  });

  // Install public, 3rd-party Atom packages listed in this package's 'package-deps' setting. Run
  // this *after* other packages are activated so they can modify this setting if desired before
  // installation is attempted.
  if ((_pkgCommonsAtomFeatureConfig2 || _pkgCommonsAtomFeatureConfig()).default.get('installRecommendedPackages')) {
    // Workaround for restoring multiple Atom windows. This prevents having all
    // the windows trying to install the deps at the same time - often clobbering
    // each other's install.
    var firstWindowId = remote.BrowserWindow.getAllWindows()[0].id;
    var currentWindowId = remote.getCurrentWindow().id;
    if (firstWindowId === currentWindowId) {
      (0, (_atomPackageDeps2 || _atomPackageDeps()).install)('nuclide');
    }
  }
}

function deactivate() {
  Object.keys(features).forEach(function (name) {
    safeDeactivate(name);
  });
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function safeDeactivate(name) {
  try {
    var pack = atom.packages.getActivePackage(name);
    if (pack != null) {
      // TODO: Atom does not unregister its activation hooks on package deactivation!
      // Do it manually until https://github.com/atom/atom/pull/12237 is merged.
      if (pack.activationHookSubscriptions != null) {
        // $FlowIgnore: This code is going away in the Atom 1.11.0 upgrade.
        pack.activationHookSubscriptions.dispose();
      }
      atom.packages.deactivatePackage(name);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error deactivating "' + name + '": ' + err.message);
  }
}