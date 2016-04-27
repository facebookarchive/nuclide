Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.activate = activate;
exports.deactivate = deactivate;
exports.__testUseOnly_getAvailablePackageNames = __testUseOnly_getAvailablePackageNames;
exports.__testUseOnly_getAvailablePackagePaths = __testUseOnly_getAvailablePackagePaths;
exports.__testUseOnly_loadPackage = __testUseOnly_loadPackage;
exports.__testUseOnly_activatePackage = __testUseOnly_activatePackage;
exports.__testUseOnly_deactivatePackage = __testUseOnly_deactivatePackage;
exports.__testUseOnly_removeFeature = __testUseOnly_removeFeature;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pkgNuclideFeatureConfig = require('../pkg/nuclide-feature-config');

var _pkgNuclideFeatureConfig2 = _interopRequireDefault(_pkgNuclideFeatureConfig);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideFeatures = require('./nuclide-features');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atom = require('atom');

// If we are in a testing environment then we want to use a default atom config.

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

if (atom.inSpecMode()) {
  _temp2['default'].track();
  var tempDirPath = _temp2['default'].mkdirSync('atom_home');
  atom.config.configDirPath = tempDirPath;
  atom.config.configFilePath = _path2['default'].join(tempDirPath, 'config.cson');
}

// Exported "config" object
var config = {
  installRecommendedPackages: {
    'default': false,
    description: 'On start up, check for and install Atom packages recommended for use with Nuclide. The' + ' list of packages can be found in the <code>package-deps</code> setting in this package\'s' + ' "package.json" file. Disabling this setting will not uninstall packages it previously' + ' installed. Restart Atom after changing this setting for it to take effect.',
    title: 'Install Recommended Packages on Startup',
    type: 'boolean'
  },
  use: {
    type: 'object',
    properties: {}
  }
};

exports.config = config;
// Nuclide packages for Atom are called "features"
var FEATURES_DIR = _path2['default'].join(__dirname, '../pkg');
var features = {};

var disposables = undefined;
var hasActivatedOnce = false;

/**
 * Get the "package.json" of all the features.
 */
_fs2['default'].readdirSync(FEATURES_DIR).forEach(function (item) {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  var dirname = _path2['default'].join(FEATURES_DIR, item);
  var filename = _path2['default'].join(dirname, 'package.json');
  try {
    var stat = _fs2['default'].statSync(filename);
    (0, _assert2['default'])(stat.isFile());
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return;
    }
  }
  var src = _fs2['default'].readFileSync(filename, 'utf8');
  // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
  if (src.indexOf('"Atom"') === -1) {
    return;
  }
  var pkg = JSON.parse(src);
  if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
    (0, _assert2['default'])(pkg.name);
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
      var modulePath = _path2['default'].join(dirname, deserializerPath);
      var deserializer = require(modulePath);
      atom.deserializers.add({
        name: deserializerName,
        deserialize: deserializer
      });
    });
  }
});

function activate() {
  (0, _assert2['default'])(!disposables);
  disposables = new _atom.CompositeDisposable();

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
    _nuclideFeatures.nuclideFeatures.didLoadInitialFeatures();
  }

  // Activate all of the loaded features.
  // https://github.com/atom/atom/blob/v1.1.0/src/package-manager.coffee#L431-L440
  Promise.all(atom.packages.activatePackages(loaded)).then(function () {
    if (!hasActivatedOnce) {
      _nuclideFeatures.nuclideFeatures.didActivateInitialFeatures();

      // No more Nuclide events will be fired. Dispose the Emitter to release
      // memory and to inform future callers that they're attempting to listen
      // to events that will never fire again.
      _nuclideFeatures.nuclideFeatures.dispose();
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
  if (_pkgNuclideFeatureConfig2['default'].get('installRecommendedPackages') || atom.inSpecMode()) {
    require('atom-package-deps').install('nuclide');
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

/**
 * FOR TESTING PURPOSES ONLY!
 */

function __testUseOnly_getAvailablePackageNames() {
  return Object.keys(features);
}

function __testUseOnly_getAvailablePackagePaths() {
  return Object.keys(features).map(function (name) {
    return features[name].dirname;
  });
}

function __testUseOnly_loadPackage(name) {
  var feature = features[name];
  return atom.packages.loadPackage(feature.dirname);
}

function __testUseOnly_activatePackage(name) {
  var feature = features[name];
  return atom.packages.activatePackage(feature.dirname);
}

function __testUseOnly_deactivatePackage(name) {
  return atom.packages.deactivatePackage(name);
}

function __testUseOnly_removeFeature(name) {
  delete features[name];
}

function safeDeactivate(name) {
  try {
    atom.packages.deactivatePackage(name);
  } catch (err) {
    console.error('Error deactivating "' + name + '"', err); //eslint-disable-line no-console
  } finally {
    features[name].packageModule = null;
  }
}