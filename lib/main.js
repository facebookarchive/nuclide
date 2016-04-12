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

  var onNuclideActivate = atom.packages.onDidActivatePackage(function (pack) {
    if (pack.name === 'nuclide') {
      console.log( // eslint-disable-line no-console
      'Nuclide ready time: ' + (pack.activateTime + pack.loadTime) + 'ms');
      onNuclideActivate.dispose();
    }
  });
  disposables.add(onNuclideActivate);
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDOUM7O0FBRU0sU0FBUywyQkFBMkIsQ0FBQyxJQUFJLEVBQUU7QUFDaEQsU0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkI7O0FBRUQsU0FBUyxjQUFjLENBQUMsSUFBSSxFQUFFO0FBQzVCLE1BQUk7QUFDRixRQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixXQUFPLENBQUMsS0FBSywwQkFBd0IsSUFBSSxRQUFLLEdBQUcsQ0FBQyxDQUFDO0dBQ3BELFNBQVM7QUFDUixZQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUNyQztDQUNGIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBub2Zsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogICAgICAgICAgICAgICAgICBfICBfIF8gIF8gX19fXyBfICAgIF8gX19fICBfX19fXG4gKiAgICAgICAgICAgICAgICAgIHxcXCB8IHwgIHwgfCAgICB8ICAgIHwgfCAgXFwgfF9fX1xuICogICAgICAgICAgICAgICAgICB8IFxcfCB8X198IHxfX18gfF9fXyB8IHxfXy8gfF9fX1xuICogXyAgXyBfICBfIF8gX19fXyBfIF9fX18gX19fICAgICBfX18gIF9fX18gX19fXyBfICBfIF9fX18gX19fXyBfX19fXG4gKiB8ICB8IHxcXCB8IHwgfF9fXyB8IHxfX18gfCAgXFwgICAgfF9fXSB8X198IHwgICAgfF8vICB8X198IHwgX18gfF9fX1xuICogfF9ffCB8IFxcfCB8IHwgICAgfCB8X19fIHxfXy8gICAgfCAgICB8ICB8IHxfX18gfCBcXF8gfCAgfCB8X19dIHxfX19cbiAqXG4gKi9cblxuaWYgKHR5cGVvZiBhdG9tID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgaXMgYW4gQXRvbSBwYWNrYWdlLiBEaWQgeW91IG1lYW4gdG8gcnVuIHRoZSBzZXJ2ZXI/Jyk7XG59XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uL3BrZy9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge251Y2xpZGVGZWF0dXJlc30gZnJvbSAnLi9udWNsaWRlLWZlYXR1cmVzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbi8vIElmIHdlIGFyZSBpbiBhIHRlc3RpbmcgZW52aXJvbm1lbnQgdGhlbiB3ZSB3YW50IHRvIHVzZSBhIGRlZmF1bHQgYXRvbSBjb25maWcuXG5pZiAoYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgdGVtcC50cmFjaygpO1xuICBjb25zdCB0ZW1wRGlyUGF0aCA9IHRlbXAubWtkaXJTeW5jKCdhdG9tX2hvbWUnKTtcbiAgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCA9IHRlbXBEaXJQYXRoO1xuICBhdG9tLmNvbmZpZy5jb25maWdGaWxlUGF0aCA9IHBhdGguam9pbih0ZW1wRGlyUGF0aCwgJ2NvbmZpZy5jc29uJyk7XG59XG5cbi8vIEV4cG9ydGVkIFwiY29uZmlnXCIgb2JqZWN0XG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlczoge1xuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ09uIHN0YXJ0IHVwLCBjaGVjayBmb3IgYW5kIGluc3RhbGwgQXRvbSBwYWNrYWdlcyByZWNvbW1lbmRlZCBmb3IgdXNlIHdpdGggTnVjbGlkZS4gVGhlJ1xuICAgICAgKyAnIGxpc3Qgb2YgcGFja2FnZXMgY2FuIGJlIGZvdW5kIGluIHRoZSA8Y29kZT5wYWNrYWdlLWRlcHM8L2NvZGU+IHNldHRpbmcgaW4gdGhpcyBwYWNrYWdlXFwncydcbiAgICAgICsgJyBcInBhY2thZ2UuanNvblwiIGZpbGUuIERpc2FibGluZyB0aGlzIHNldHRpbmcgd2lsbCBub3QgdW5pbnN0YWxsIHBhY2thZ2VzIGl0IHByZXZpb3VzbHknXG4gICAgICArICcgaW5zdGFsbGVkLiBSZXN0YXJ0IEF0b20gYWZ0ZXIgY2hhbmdpbmcgdGhpcyBzZXR0aW5nIGZvciBpdCB0byB0YWtlIGVmZmVjdC4nLFxuICAgIHRpdGxlOiAnSW5zdGFsbCBSZWNvbW1lbmRlZCBQYWNrYWdlcyBvbiBTdGFydHVwJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHVzZToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHt9LFxuICB9LFxufTtcblxuLy8gTnVjbGlkZSBwYWNrYWdlcyBmb3IgQXRvbSBhcmUgY2FsbGVkIFwiZmVhdHVyZXNcIlxuY29uc3QgRkVBVFVSRVNfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BrZycpO1xuY29uc3QgZmVhdHVyZXMgPSB7fTtcblxubGV0IGRpc3Bvc2FibGVzO1xubGV0IGhhc0FjdGl2YXRlZE9uY2UgPSBmYWxzZTtcblxuLyoqXG4gKiBHZXQgdGhlIFwicGFja2FnZS5qc29uXCIgb2YgYWxsIHRoZSBmZWF0dXJlcy5cbiAqL1xuZnMucmVhZGRpclN5bmMoRkVBVFVSRVNfRElSKS5mb3JFYWNoKGl0ZW0gPT4ge1xuICAvLyBPcHRpbWl6YXRpb246IE91ciBkaXJlY3RvcmllcyBkb24ndCBoYXZlIHBlcmlvZHMgLSB0aGlzIG11c3QgYmUgYSBmaWxlXG4gIGlmIChpdGVtLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZGlybmFtZSA9IHBhdGguam9pbihGRUFUVVJFU19ESVIsIGl0ZW0pO1xuICBjb25zdCBmaWxlbmFtZSA9IHBhdGguam9pbihkaXJuYW1lLCAncGFja2FnZS5qc29uJyk7XG4gIHRyeSB7XG4gICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVuYW1lKTtcbiAgICBpbnZhcmlhbnQoc3RhdC5pc0ZpbGUoKSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIGNvbnN0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbiAgLy8gT3B0aW1pemF0aW9uOiBBdm9pZCBKU09OIHBhcnNpbmcgaWYgaXQgY2FuJ3QgcmVhc29uYWJseSBiZSBhbiBBdG9tIHBhY2thZ2VcbiAgaWYgKHNyYy5pbmRleE9mKCdcIkF0b21cIicpID09PSAtMSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKHNyYyk7XG4gIGlmIChwa2cubnVjbGlkZSAmJiBwa2cubnVjbGlkZS5wYWNrYWdlVHlwZSA9PT0gJ0F0b20nKSB7XG4gICAgaW52YXJpYW50KHBrZy5uYW1lKTtcbiAgICBmZWF0dXJlc1twa2cubmFtZV0gPSB7XG4gICAgICBwa2csXG4gICAgICBkaXJuYW1lLFxuICAgICAgdXNlS2V5UGF0aDogYG51Y2xpZGUudXNlLiR7cGtnLm5hbWV9YCxcbiAgICAgIHBhY2thZ2VNb2R1bGU6IG51bGwsXG4gICAgfTtcbiAgfVxufSk7XG5cbi8qKlxuICogQnVpbGQgdGhlIFwiY29uZmlnXCIgb2JqZWN0LiBUaGlzIGRldGVybWluZXMgdGhlIGNvbmZpZyBkZWZhdWx0cyBhbmRcbiAqIGl0J3Mgd2hhdCBpcyBzaG93biBieSB0aGUgU2V0dGluZ3Mgdmlldy4gSXQgaW5jbHVkZXM6XG4gKiAoMSkgQW4gZW50cnkgdG8gZW5hYmxlL2Rpc2FibGUgZWFjaCBmZWF0dXJlIC0gY2FsbGVkIFwibnVjbGlkZS51c2UuKlwiLlxuICogKDIpIEVhY2ggZmVhdHVyZSdzIG1lcmdlZCBjb25maWcuXG4gKlxuICogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9Db25maWdcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2d9ID0gZmVhdHVyZXNbbmFtZV07XG5cbiAgLy8gU2FtcGxlIHBhY2thZ2VzIGFyZSBkaXNhYmxlZCBieSBkZWZhdWx0LiBUaGV5IGFyZSBtZWFudCBmb3IgZGV2ZWxvcG1lbnRcbiAgLy8gdXNlIG9ubHksIGFuZCBhcmVuJ3QgaW5jbHVkZWQgaW4gTnVjbGlkZSBidWlsZHMuXG4gIGNvbnN0IGVuYWJsZWQgPSAhbmFtZS5zdGFydHNXaXRoKCdzYW1wbGUtJyk7XG5cbiAgLy8gRW50cnkgZm9yIGVuYWJsaW5nL2Rpc2FibGluZyB0aGUgZmVhdHVyZVxuICBjb25zdCBzZXR0aW5nID0ge1xuICAgIHRpdGxlOiBgRW5hYmxlIHRoZSBcIiR7bmFtZX1cIiBmZWF0dXJlYCxcbiAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBlbmFibGVkLFxuICB9O1xuICBpZiAocGtnLnByb3ZpZGVkU2VydmljZXMpIHtcbiAgICBjb25zdCBwcm92aWRlcyA9IE9iamVjdC5rZXlzKHBrZy5wcm92aWRlZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipQcm92aWRlczoqKiBfJHtwcm92aWRlc31fYDtcbiAgfVxuICBpZiAocGtnLmNvbnN1bWVkU2VydmljZXMpIHtcbiAgICBjb25zdCBjb25zdW1lcyA9IE9iamVjdC5rZXlzKHBrZy5jb25zdW1lZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipDb25zdW1lczoqKiBfJHtjb25zdW1lc31fYDtcbiAgfVxuICBjb25maWcudXNlLnByb3BlcnRpZXNbbmFtZV0gPSBzZXR0aW5nO1xuXG4gIC8vIE1lcmdlIGluIHRoZSBmZWF0dXJlJ3MgY29uZmlnXG4gIGNvbnN0IHBrZ0NvbmZpZyA9IHBrZy5udWNsaWRlLmNvbmZpZztcbiAgaWYgKHBrZ0NvbmZpZykge1xuICAgIGNvbmZpZ1tuYW1lXSA9IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhwa2dDb25maWcpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbmZpZ1tuYW1lXS5wcm9wZXJ0aWVzW2tleV0gPSB7XG4gICAgICAgIC4uLnBrZ0NvbmZpZ1trZXldLFxuICAgICAgICB0aXRsZTogKHBrZ0NvbmZpZ1trZXldLnRpdGxlIHx8IGtleSksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59KTtcblxuLyoqXG4gKiBMb2FkIGZlYXR1cmUgZGVzZXJpYWxpemVycyBhbmQgcmVxdWlyZSB0aGVtLlxuICogVGhpcyBpcyBjb21pbmcgaW4gQXRvbSAxLjQuMCAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzk5NzRcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2csIGRpcm5hbWV9ID0gZmVhdHVyZXNbbmFtZV07XG4gIGlmIChwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzKSB7XG4gICAgT2JqZWN0LmtleXMocGtnLm51Y2xpZGUuZGVzZXJpYWxpemVycykuZm9yRWFjaChkZXNlcmlhbGl6ZXJOYW1lID0+IHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplclBhdGggPSBwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzW2Rlc2VyaWFsaXplck5hbWVdO1xuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IHBhdGguam9pbihkaXJuYW1lLCBkZXNlcmlhbGl6ZXJQYXRoKTtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplciA9IHJlcXVpcmUobW9kdWxlUGF0aCk7XG4gICAgICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkKHtcbiAgICAgICAgbmFtZTogZGVzZXJpYWxpemVyTmFtZSxcbiAgICAgICAgZGVzZXJpYWxpemU6IGRlc2VyaWFsaXplcixcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBpbnZhcmlhbnQoIWRpc3Bvc2FibGVzKTtcbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gIC8vIEFkZCB0aGUgXCJOdWNsaWRlXCIgbWVudSwgaWYgaXQncyBub3QgdGhlcmUgYWxyZWFkeS5cbiAgZGlzcG9zYWJsZXMuYWRkKFxuICAgIGF0b20ubWVudS5hZGQoW3tcbiAgICAgIGxhYmVsOiAnTnVjbGlkZScsXG4gICAgICBzdWJtZW51OiBbXSxcbiAgICB9XSlcbiAgKTtcblxuICAvLyBNYW51YWxseSBtYW5pcHVsYXRlIHRoZSBtZW51IHRlbXBsYXRlIG9yZGVyLlxuICBjb25zdCBpbnNlcnRJbmRleCA9XG4gICAgYXRvbS5tZW51LnRlbXBsYXRlLmZpbmRJbmRleChpdGVtID0+IGl0ZW0ucm9sZSA9PT0gJ3dpbmRvdycgfHwgaXRlbS5yb2xlID09PSAnaGVscCcpO1xuICBpZiAoaW5zZXJ0SW5kZXggIT09IC0xKSB7XG4gICAgY29uc3QgbnVjbGlkZUluZGV4ID0gYXRvbS5tZW51LnRlbXBsYXRlLmZpbmRJbmRleChpdGVtID0+IGl0ZW0ubGFiZWwgPT09ICdOdWNsaWRlJyk7XG4gICAgY29uc3QgbWVudUl0ZW0gPSBhdG9tLm1lbnUudGVtcGxhdGUuc3BsaWNlKG51Y2xpZGVJbmRleCwgMSlbMF07XG4gICAgY29uc3QgbmV3SW5kZXggPSBpbnNlcnRJbmRleCA+IG51Y2xpZGVJbmRleCA/IGluc2VydEluZGV4IC0gMSA6IGluc2VydEluZGV4O1xuICAgIGF0b20ubWVudS50ZW1wbGF0ZS5zcGxpY2UobmV3SW5kZXgsIDAsIG1lbnVJdGVtKTtcbiAgICBhdG9tLm1lbnUudXBkYXRlKCk7XG4gIH1cblxuICAvLyBMb2FkaW5nIGFsbCBvZiB0aGUgZmVhdHVyZXMsIHRoZW4gYWN0aXZhdGluZyB0aGVtIHdoYXQgQXRvbSBkb2VzIG9uIGluaXQ6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi92MS4xLjAvc3JjL2F0b20tZW52aXJvbm1lbnQuY29mZmVlI0w2MjUtTDYzMVxuICAvLyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L1BhY2thZ2VNYW5hZ2VyXG4gIGNvbnN0IGxvYWRlZCA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKS5tYXAobmFtZSA9PiB7XG4gICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgIGNvbnN0IGVuYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoZmVhdHVyZS51c2VLZXlQYXRoKTtcbiAgICAvLyBgZW5hYmxlZGAgbWF5IGJlIGB1bmRlZmluZWRgIGlmIGBhdG9tLmNvbmZpZy5nZXRgIGlzIGNhbGxlZCBiZWZvcmUgdGhlXG4gICAgLy8gdGhlIGRlZmF1bHQgY29uZmlnIGlzIGJ1aWx0LiBJZiB0aGUgZmVhdHVyZSBpcyBleHBsaWNpdGx5IGVuYWJsZWQgb3JcbiAgICAvLyBkaXNhYmxlZCwgdGhlbiB0aGUgY29uZmlnIHZhbHVlIHdpbGwgYmUgc2V0IHJlZ2FyZGxlc3Mgb2Ygd2hlblxuICAgIC8vIGBhdG9tLmNvbmZpZy5nZXRgIGlzIGNhbGxlZC5cbiAgICBjb25zdCBzaG91bGRFbmFibGUgPSB0eXBlb2YgZW5hYmxlZCA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gY29uZmlnLnVzZS5wcm9wZXJ0aWVzW25hbWVdLmVuYWJsZWRcbiAgICAgIDogZW5hYmxlZDtcbiAgICBpZiAoc2hvdWxkRW5hYmxlICYmICFmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgICAgIGlmIChmZWF0dXJlLnBhY2thZ2VNb2R1bGUubWFpbk1vZHVsZSAmJlxuICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5tYWluTW9kdWxlLmNvbmZpZykge1xuICAgICAgICAvLyBGZWF0dXJlIGNvbmZpZyBpcyBoYW5kbGVkIGJ5IHRoZSBVUCBsb2FkZXIsIG5vdCBpbmRpdmlkdWFsIGZlYXR1cmVzXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgZXhwb3J0ZWQgYSBcImNvbmZpZ1wiYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmVhdHVyZS5wYWNrYWdlTW9kdWxlO1xuICAgIH1cbiAgfSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gIGlmICghaGFzQWN0aXZhdGVkT25jZSkge1xuICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRMb2FkSW5pdGlhbEZlYXR1cmVzKCk7XG4gIH1cblxuICAvLyBBY3RpdmF0ZSBhbGwgb2YgdGhlIGxvYWRlZCBmZWF0dXJlcy5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL3YxLjEuMC9zcmMvcGFja2FnZS1tYW5hZ2VyLmNvZmZlZSNMNDMxLUw0NDBcbiAgUHJvbWlzZS5hbGwoYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2VzKGxvYWRlZCkpXG4gICAgLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKCFoYXNBY3RpdmF0ZWRPbmNlKSB7XG4gICAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRBY3RpdmF0ZUluaXRpYWxGZWF0dXJlcygpO1xuXG4gICAgICAgIC8vIE5vIG1vcmUgTnVjbGlkZSBldmVudHMgd2lsbCBiZSBmaXJlZC4gRGlzcG9zZSB0aGUgRW1pdHRlciB0byByZWxlYXNlXG4gICAgICAgIC8vIG1lbW9yeSBhbmQgdG8gaW5mb3JtIGZ1dHVyZSBjYWxsZXJzIHRoYXQgdGhleSdyZSBhdHRlbXB0aW5nIHRvIGxpc3RlblxuICAgICAgICAvLyB0byBldmVudHMgdGhhdCB3aWxsIG5ldmVyIGZpcmUgYWdhaW4uXG4gICAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaXNwb3NlKCk7XG4gICAgICAgIGhhc0FjdGl2YXRlZE9uY2UgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIC8vIFdhdGNoIHRoZSBjb25maWcgdG8gbWFuYWdlIHRvZ2dsaW5nIGZlYXR1cmVzXG4gIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICBjb25zdCB3YXRjaGVyID0gYXRvbS5jb25maWcub25EaWRDaGFuZ2UoZmVhdHVyZS51c2VLZXlQYXRoLCBldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQubmV3VmFsdWUgPT09IHRydWUgJiYgIWZlYXR1cmUucGFja2FnZU1vZHVsZSkge1xuICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5hY3RpdmF0ZSgpO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5uZXdWYWx1ZSA9PT0gZmFsc2UgJiYgZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgIHNhZmVEZWFjdGl2YXRlKG5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRpc3Bvc2FibGVzLmFkZCh3YXRjaGVyKTtcbiAgfSk7XG5cbiAgLy8gSW5zdGFsbCBwdWJsaWMsIDNyZC1wYXJ0eSBBdG9tIHBhY2thZ2VzIGxpc3RlZCBpbiB0aGlzIHBhY2thZ2UncyAncGFja2FnZS1kZXBzJyBzZXR0aW5nLiBSdW5cbiAgLy8gdGhpcyAqYWZ0ZXIqIG90aGVyIHBhY2thZ2VzIGFyZSBhY3RpdmF0ZWQgc28gdGhleSBjYW4gbW9kaWZ5IHRoaXMgc2V0dGluZyBpZiBkZXNpcmVkIGJlZm9yZVxuICAvLyBpbnN0YWxsYXRpb24gaXMgYXR0ZW1wdGVkLlxuICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoJ2luc3RhbGxSZWNvbW1lbmRlZFBhY2thZ2VzJykgfHwgYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ251Y2xpZGUnKTtcbiAgfVxuXG4gIGNvbnN0IG9uTnVjbGlkZUFjdGl2YXRlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZShwYWNrID0+IHtcbiAgICBpZiAocGFjay5uYW1lID09PSAnbnVjbGlkZScpIHtcbiAgICAgIGNvbnNvbGUubG9nKCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgYE51Y2xpZGUgcmVhZHkgdGltZTogJHtwYWNrLmFjdGl2YXRlVGltZSArIHBhY2subG9hZFRpbWV9bXNgKTtcbiAgICAgIG9uTnVjbGlkZUFjdGl2YXRlLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH0pO1xuICBkaXNwb3NhYmxlcy5hZGQob25OdWNsaWRlQWN0aXZhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgaWYgKGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgIHNhZmVEZWFjdGl2YXRlKG5hbWUpO1xuICAgIH1cbiAgfSk7XG4gIGlmIChkaXNwb3NhYmxlcykge1xuICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICBkaXNwb3NhYmxlcyA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBGT1IgVEVTVElORyBQVVJQT1NFUyBPTkxZIVxuICovXG5leHBvcnQgZnVuY3Rpb24gX190ZXN0VXNlT25seV9nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhmZWF0dXJlcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Rlc3RVc2VPbmx5X2dldEF2YWlsYWJsZVBhY2thZ2VQYXRocygpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5tYXAobmFtZSA9PiBmZWF0dXJlc1tuYW1lXS5kaXJuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9fdGVzdFVzZU9ubHlfbG9hZFBhY2thZ2UobmFtZSkge1xuICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gIHJldHVybiBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Rlc3RVc2VPbmx5X2FjdGl2YXRlUGFja2FnZShuYW1lKSB7XG4gIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Rlc3RVc2VPbmx5X2RlYWN0aXZhdGVQYWNrYWdlKG5hbWUpIHtcbiAgcmV0dXJuIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfX3Rlc3RVc2VPbmx5X3JlbW92ZUZlYXR1cmUobmFtZSkge1xuICBkZWxldGUgZmVhdHVyZXNbbmFtZV07XG59XG5cbmZ1bmN0aW9uIHNhZmVEZWFjdGl2YXRlKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKG5hbWUpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBkZWFjdGl2YXRpbmcgXCIke25hbWV9XCJgLCBlcnIpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9IGZpbmFsbHkge1xuICAgIGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUgPSBudWxsO1xuICB9XG59XG4iXX0=