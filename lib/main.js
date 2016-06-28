Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _pkgNuclideFeatureConfig2;

function _pkgNuclideFeatureConfig() {
  return _pkgNuclideFeatureConfig2 = _interopRequireDefault(require('../pkg/nuclide-feature-config'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideFeatures2;

function _nuclideFeatures() {
  return _nuclideFeatures2 = require('./nuclide-features');
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

var _remote2;

function _remote() {
  return _remote2 = _interopRequireDefault(require('remote'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

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
var runningNuclideVersion = require('../package.json').version;

// Nuclide packages for Atom are called "features"
var FEATURES_DIR = (_path2 || _path()).default.join(__dirname, '../pkg');
var features = {};

var disposables = undefined;
var hasActivatedOnce = false;

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
      useKeyPath: 'nuclide.use.' + pkg.name,
      packageModule: null
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
  var enabled = !name.startsWith('sample-')
  // Hackfix to disable packages
   && name !== 'nuclide-context-view' && name !== 'nuclide-nux';

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

/**
 * Load feature deserializers and require them.
 * This is coming in Atom 1.4.0 - https://github.com/atom/atom/issues/9974
 */
Object.keys(features).forEach(function (name) {
  var _features$name = features[name];
  var pkg = _features$name.pkg;
  var dirname = _features$name.dirname;

  if (pkg.nuclide.deserializers) {
    Object.keys(pkg.nuclide.deserializers).forEach(function (deserializerName) {
      var deserializerPath = pkg.nuclide.deserializers[deserializerName];
      var modulePath = (_path2 || _path()).default.join(dirname, deserializerPath);
      var deserializer = require(modulePath);
      atom.deserializers.add({
        name: deserializerName,
        deserialize: deserializer
      });
    });
  }
});

function activate() {
  // This version mismatch happens during OSS updates. After updates, Nuclide is
  // still in the module cache - with all of its glorious state - which usually
  // results in a red box of some kind because the disk content doesn't match
  // the expectations of the code that is in memory.
  var nuclidePack = atom.packages.getLoadedPackage('nuclide');
  var installedPkg = JSON.parse((_fs2 || _fs()).default.readFileSync((_path2 || _path()).default.join(nuclidePack.path, 'package.json')));
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

  (0, (_assert2 || _assert()).default)(!disposables);
  disposables = new (_atom2 || _atom()).CompositeDisposable();

  // Add the "Nuclide" menu, if it's not there already.
  disposables.add(atom.menu.add([{
    label: 'Nuclide',
    submenu: []
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

  // Loading all of the features, then activating them what Atom does on init:
  // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
  // https://atom.io/docs/api/latest/PackageManager
  var loaded = Object.keys(features).map(function (name) {
    var feature = features[name];
    var enabled = atom.config.get(feature.useKeyPath);
    // `enabled` may be `undefined` if `atom.config.get` is called before the
    // the default config is built. If the feature is explicitly enabled or
    // disabled, then the config value will be set regardless of when
    // `atom.config.get` is called.
    var shouldEnable = typeof enabled === 'undefined' ? config.use.properties[name].enabled : enabled;
    if (shouldEnable && !feature.packageModule) {
      feature.packageModule = atom.packages.loadPackage(feature.dirname);
      if (feature.packageModule.mainModule && feature.packageModule.mainModule.config) {
        // Feature config is handled by the UP loader, not individual features
        throw new Error('"' + name + '" exported a "config"');
      }
      return feature.packageModule;
    }
  }).filter(Boolean);

  if (!hasActivatedOnce) {
    (_nuclideFeatures2 || _nuclideFeatures()).nuclideFeatures.didLoadInitialFeatures();
    (0, (_pkgNuclideRemoteConnectionLibServiceManager2 || _pkgNuclideRemoteConnectionLibServiceManager()).setUseLocalRpc)((_pkgNuclideFeatureConfig2 || _pkgNuclideFeatureConfig()).default.get('useLocalRpc'));
  }

  // Activate all of the loaded features.
  // https://github.com/atom/atom/blob/v1.1.0/src/package-manager.coffee#L431-L440
  Promise.all(atom.packages.activatePackages(loaded)).then(function () {
    if (!hasActivatedOnce) {
      (_nuclideFeatures2 || _nuclideFeatures()).nuclideFeatures.didActivateInitialFeatures();

      // No more Nuclide events will be fired. Dispose the Emitter to release
      // memory and to inform future callers that they're attempting to listen
      // to events that will never fire again.
      (_nuclideFeatures2 || _nuclideFeatures()).nuclideFeatures.dispose();
      hasActivatedOnce = true;
    }
  });

  // Watch the config to manage toggling features
  Object.keys(features).forEach(function (name) {
    var feature = features[name];
    var watcher = atom.config.onDidChange(feature.useKeyPath, function (event) {
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
  if ((_pkgNuclideFeatureConfig2 || _pkgNuclideFeatureConfig()).default.get('installRecommendedPackages')) {
    // Workaround for restoring multiple Atom windows. This prevents having all
    // the windows trying to install the deps at the same time - often clobbering
    // each other's install.
    var firstWindowId = (_remote2 || _remote()).default.BrowserWindow.getAllWindows()[0].id;
    var currentWindowId = (_remote2 || _remote()).default.getCurrentWindow().id;
    if (firstWindowId === currentWindowId) {
      require('atom-package-deps').install('nuclide');
    }
  }
}

function deactivate() {
  Object.keys(features).forEach(function (name) {
    if (features[name].packageModule) {
      safeDeactivate(name);
    }
  });
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

function safeDeactivate(name) {
  try {
    atom.packages.deactivatePackage(name);
  } catch (err) {
    //eslint-disable-next-line no-console
    console.error('Error deactivating "' + name + '": ' + err.message);
  } finally {
    features[name].packageModule = null;
  }
}