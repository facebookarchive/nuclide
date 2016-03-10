var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var featureConfig = require('../pkg/nuclide/feature-config');
var fs = require('fs');
var invariant = require('assert');
var nuclideFeatures = require('./nuclideFeatures');
var nuclideMigrations = require('./nuclideMigrations');
var nuclideUninstaller = require('./nuclideUninstaller');
var path = require('path');
var temp = require('temp').track();

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

// If we are in a testing environment then we want to use a default atom config.
if (atom.inSpecMode()) {
  var tempDirPath = temp.mkdirSync('atom_home');
  atom.config.configDirPath = tempDirPath;
  atom.config.configFilePath = path.join(tempDirPath, 'config.cson');
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

// Nuclide packages for Atom are called "features"
var FEATURES_DIR = path.join(__dirname, '../pkg');
var features = {};

var disposables = undefined;

/**
 * Get the "package.json" of all the features.
 */
(function traverse(dirname) {
  // Perform a depth-first search for first-level "package.json" files
  try {
    var list = fs.readdirSync(dirname);
    if (list.indexOf('package.json') !== -1) {
      var filename = path.join(dirname, 'package.json');
      var src = fs.readFileSync(filename, 'utf8');
      // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
      if (src.indexOf('"Atom"') === -1) {
        return;
      }
      var pkg = JSON.parse(src);
      if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
        invariant(pkg.name);
        features[pkg.name] = {
          pkg: pkg,
          dirname: dirname,
          useKeyPath: 'nuclide.use.' + pkg.name,
          packageModule: null
        };
      }
    } else {
      for (var item of list) {
        // Exclude the "sample" directory
        if (item === 'sample' && FEATURES_DIR === dirname) {
          continue;
        }
        // Optimization: Our directories don't have periods - this must be a file
        if (item.indexOf('.') !== -1) {
          continue;
        }
        var next = path.join(dirname, item);
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
Object.keys(features).forEach(function (name) {
  var pkg = features[name].pkg;

  // Entry for enabling/disabling the feature
  var setting = {
    title: 'Enable the "' + name + '" feature',
    description: pkg.description || '',
    type: 'boolean',
    'default': true
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
        title: name + ': ' + (pkgConfig[key].title || key)
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
      var modulePath = path.join(dirname, deserializerPath);
      var deserializer = require(modulePath);
      atom.deserializers.add({
        name: deserializerName,
        deserialize: deserializer
      });
    });
  }
});

var UPLoader = {
  config: config,

  activate: function activate() {
    invariant(!disposables);
    disposables = new CompositeDisposable();

    // Loading all of the features, then activating them what Atom does on init:
    // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
    // https://atom.io/docs/api/latest/PackageManager
    var loaded = Object.keys(features).map(function (name) {
      var feature = features[name];
      var enabled = atom.config.get(feature.useKeyPath);
      // `enabled` may be `undefined` if `atom.config.get` is called before the
      // default config is built. If a feature is disabled, `enabled` will be
      // `false`, regardless of when `atom.config.get` is called.
      if ((enabled === true || enabled === undefined) && !feature.packageModule) {
        feature.packageModule = atom.packages.loadPackage(feature.dirname);
        if (feature.packageModule.mainModule && feature.packageModule.mainModule.config) {
          // Feature config is handled by the UP loader, not individual features
          throw new Error('"' + name + '" exported a "config"');
        }
        return feature.packageModule;
      }
    }).filter(Boolean);

    if (nuclideFeatures) {
      nuclideFeatures.didLoadInitialFeatures();
    }

    // Activate all of the loaded features.
    // https://github.com/atom/atom/blob/v1.1.0/src/package-manager.coffee#L431-L440
    Promise.all(atom.packages.activatePackages(loaded)).then(function () {
      if (nuclideFeatures) {
        nuclideFeatures.didActivateInitialFeatures();

        // No more Nuclide events will be fired. Dispose the Emitter to release
        // memory and to inform future callers that they're attempting to listen
        // to events that will never fire again.
        nuclideFeatures.dispose();
        nuclideFeatures = null;
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
    if (featureConfig.get('installRecommendedPackages') || atom.inSpecMode()) {
      require('atom-package-deps').install('nuclide');
    }
  },

  deactivate: function deactivate() {
    Object.keys(features).forEach(function (name) {
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
  __testUseOnly_getAvailablePackageNames: function __testUseOnly_getAvailablePackageNames() {
    return Object.keys(features);
  },

  __testUseOnly_getAvailablePackagePaths: function __testUseOnly_getAvailablePackagePaths() {
    return Object.keys(features).map(function (name) {
      return features[name].dirname;
    });
  },

  __testUseOnly_loadPackage: function __testUseOnly_loadPackage(name) {
    var feature = features[name];
    return atom.packages.loadPackage(feature.dirname);
  },

  __testUseOnly_activatePackage: function __testUseOnly_activatePackage(name) {
    var feature = features[name];
    return atom.packages.activatePackage(feature.dirname);
  },

  __testUseOnly_deactivatePackage: function __testUseOnly_deactivatePackage(name) {
    return atom.packages.deactivatePackage(name);
  },

  __testUseOnly_removeFeature: function __testUseOnly_removeFeature(name) {
    delete features[name];
  }
};

module.exports = UPLoader;

function safeDeactivate(name) {
  try {
    atom.packages.deactivatePackage(name);
  } catch (err) {
    console.error('Error deactivating "' + name + '"', err); //eslint-disable-line no-console
  } finally {
    features[name].packageModule = null;
  }
}
//# sourceMappingURL=data:application/json;base64,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LENBQUMsQ0FBQztHQUNsRTs7QUFFRCwyQkFBeUIsRUFBQSxtQ0FBQyxJQUFJLEVBQUU7QUFDOUIsUUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ25EOztBQUVELCtCQUE2QixFQUFBLHVDQUFDLElBQUksRUFBRTtBQUNsQyxRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDdkQ7O0FBRUQsaUNBQStCLEVBQUEseUNBQUMsSUFBSSxFQUFFO0FBQ3BDLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCw2QkFBMkIsRUFBQSxxQ0FBQyxJQUFJLEVBQUU7QUFDaEMsV0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkI7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDOztBQUUxQixTQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsTUFBSTtBQUNGLFFBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkMsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLFdBQU8sQ0FBQyxLQUFLLDBCQUF3QixJQUFJLFFBQUssR0FBRyxDQUFDLENBQUM7R0FDcEQsU0FBUztBQUNSLFlBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0dBQ3JDO0NBQ0YiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQG5vZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyoqXG4gKiAgICAgICAgICAgICAgICAgIF8gIF8gXyAgXyBfX19fIF8gICAgXyBfX18gIF9fX19cbiAqICAgICAgICAgICAgICAgICAgfFxcIHwgfCAgfCB8ICAgIHwgICAgfCB8ICBcXCB8X19fXG4gKiAgICAgICAgICAgICAgICAgIHwgXFx8IHxfX3wgfF9fXyB8X19fIHwgfF9fLyB8X19fXG4gKiBfICBfIF8gIF8gXyBfX19fIF8gX19fXyBfX18gICAgIF9fXyAgX19fXyBfX19fIF8gIF8gX19fXyBfX19fIF9fX19cbiAqIHwgIHwgfFxcIHwgfCB8X19fIHwgfF9fXyB8ICBcXCAgICB8X19dIHxfX3wgfCAgICB8Xy8gIHxfX3wgfCBfXyB8X19fXG4gKiB8X198IHwgXFx8IHwgfCAgICB8IHxfX18gfF9fLyAgICB8ICAgIHwgIHwgfF9fXyB8IFxcXyB8ICB8IHxfX10gfF9fX1xuICpcbiAqL1xuXG5pZiAodHlwZW9mIGF0b20gPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93IG5ldyBFcnJvcignVGhpcyBpcyBhbiBBdG9tIHBhY2thZ2UuIERpZCB5b3UgbWVhbiB0byBydW4gdGhlIHNlcnZlcj8nKTtcbn1cblxuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uL3BrZy9udWNsaWRlL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmxldCBudWNsaWRlRmVhdHVyZXMgPSByZXF1aXJlKCcuL251Y2xpZGVGZWF0dXJlcycpO1xuY29uc3QgbnVjbGlkZU1pZ3JhdGlvbnMgPSByZXF1aXJlKCcuL251Y2xpZGVNaWdyYXRpb25zJyk7XG5jb25zdCBudWNsaWRlVW5pbnN0YWxsZXIgPSByZXF1aXJlKCcuL251Y2xpZGVVbmluc3RhbGxlcicpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHRlbXAgPSByZXF1aXJlKCd0ZW1wJykudHJhY2soKTtcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG4vLyBJZiB3ZSBhcmUgaW4gYSB0ZXN0aW5nIGVudmlyb25tZW50IHRoZW4gd2Ugd2FudCB0byB1c2UgYSBkZWZhdWx0IGF0b20gY29uZmlnLlxuaWYgKGF0b20uaW5TcGVjTW9kZSgpKSB7XG4gIGNvbnN0IHRlbXBEaXJQYXRoID0gdGVtcC5ta2RpclN5bmMoJ2F0b21faG9tZScpO1xuICBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoID0gdGVtcERpclBhdGg7XG4gIGF0b20uY29uZmlnLmNvbmZpZ0ZpbGVQYXRoID0gcGF0aC5qb2luKHRlbXBEaXJQYXRoLCAnY29uZmlnLmNzb24nKTtcbn1cblxuLy8gRXhwb3J0ZWQgXCJjb25maWdcIiBvYmplY3RcbmNvbnN0IGNvbmZpZyA9IHtcbiAgaW5zdGFsbFJlY29tbWVuZGVkUGFja2FnZXM6IHtcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdPbiBzdGFydCB1cCwgY2hlY2sgZm9yIGFuZCBpbnN0YWxsIEF0b20gcGFja2FnZXMgcmVjb21tZW5kZWQgZm9yIHVzZSB3aXRoIE51Y2xpZGUuIFRoZSdcbiAgICAgICsgJyBsaXN0IG9mIHBhY2thZ2VzIGNhbiBiZSBmb3VuZCBpbiB0aGUgPGNvZGU+cGFja2FnZS1kZXBzPC9jb2RlPiBzZXR0aW5nIGluIHRoaXMgcGFja2FnZVxcJ3MnXG4gICAgICArICcgXCJwYWNrYWdlLmpzb25cIiBmaWxlLiBEaXNhYmxpbmcgdGhpcyBzZXR0aW5nIHdpbGwgbm90IHVuaW5zdGFsbCBwYWNrYWdlcyBpdCBwcmV2aW91c2x5J1xuICAgICAgKyAnIGluc3RhbGxlZC4gUmVzdGFydCBBdG9tIGFmdGVyIGNoYW5naW5nIHRoaXMgc2V0dGluZyBmb3IgaXQgdG8gdGFrZSBlZmZlY3QuJyxcbiAgICB0aXRsZTogJ0luc3RhbGwgUmVjb21tZW5kZWQgUGFja2FnZXMgb24gU3RhcnR1cCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICB9LFxuICB1c2U6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgfSxcbn07XG5cbi8vIE51Y2xpZGUgcGFja2FnZXMgZm9yIEF0b20gYXJlIGNhbGxlZCBcImZlYXR1cmVzXCJcbmNvbnN0IEZFQVRVUkVTX0RJUiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9wa2cnKTtcbmNvbnN0IGZlYXR1cmVzID0ge307XG5cbmxldCBkaXNwb3NhYmxlcztcblxuLyoqXG4gKiBHZXQgdGhlIFwicGFja2FnZS5qc29uXCIgb2YgYWxsIHRoZSBmZWF0dXJlcy5cbiAqL1xuKGZ1bmN0aW9uIHRyYXZlcnNlKGRpcm5hbWUpIHtcbiAgLy8gUGVyZm9ybSBhIGRlcHRoLWZpcnN0IHNlYXJjaCBmb3IgZmlyc3QtbGV2ZWwgXCJwYWNrYWdlLmpzb25cIiBmaWxlc1xuICB0cnkge1xuICAgIGNvbnN0IGxpc3QgPSBmcy5yZWFkZGlyU3luYyhkaXJuYW1lKTtcbiAgICBpZiAobGlzdC5pbmRleE9mKCdwYWNrYWdlLmpzb24nKSAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5qb2luKGRpcm5hbWUsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbiAgICAgIC8vIE9wdGltaXphdGlvbjogQXZvaWQgSlNPTiBwYXJzaW5nIGlmIGl0IGNhbid0IHJlYXNvbmFibHkgYmUgYW4gQXRvbSBwYWNrYWdlXG4gICAgICBpZiAoc3JjLmluZGV4T2YoJ1wiQXRvbVwiJykgPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2Uoc3JjKTtcbiAgICAgIGlmIChwa2cubnVjbGlkZSAmJiBwa2cubnVjbGlkZS5wYWNrYWdlVHlwZSA9PT0gJ0F0b20nKSB7XG4gICAgICAgIGludmFyaWFudChwa2cubmFtZSk7XG4gICAgICAgIGZlYXR1cmVzW3BrZy5uYW1lXSA9IHtcbiAgICAgICAgICBwa2csXG4gICAgICAgICAgZGlybmFtZSxcbiAgICAgICAgICB1c2VLZXlQYXRoOiBgbnVjbGlkZS51c2UuJHtwa2cubmFtZX1gLFxuICAgICAgICAgIHBhY2thZ2VNb2R1bGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBsaXN0KSB7XG4gICAgICAgIC8vIEV4Y2x1ZGUgdGhlIFwic2FtcGxlXCIgZGlyZWN0b3J5XG4gICAgICAgIGlmIChpdGVtID09PSAnc2FtcGxlJyAmJiBGRUFUVVJFU19ESVIgPT09IGRpcm5hbWUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IE91ciBkaXJlY3RvcmllcyBkb24ndCBoYXZlIHBlcmlvZHMgLSB0aGlzIG11c3QgYmUgYSBmaWxlXG4gICAgICAgIGlmIChpdGVtLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXh0ID0gcGF0aC5qb2luKGRpcm5hbWUsIGl0ZW0pO1xuICAgICAgICB0cmF2ZXJzZShuZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIuY29kZSAhPT0gJ0VOT1RESVInKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG59KShGRUFUVVJFU19ESVIpO1xuXG4vKipcbiAqIE1pZ3JhdGUgdXNlcnMgb2Ygb3V0ZGF0ZWQgTnVjbGlkZSBwYWNrYWdlcyB0byB0aGUgTnVjbGlkZSBVbmlmaWVkIFBhY2thZ2UuXG4gKlxuICogLSBNaWdyYXRlIHNldHRpbmdzIHRvIHRoZWlyIG5ldyBrZXlzIGluIHRoZSAnbnVjbGlkZS4nIG5hbWVzcGFjZSBpZiBuZWNlc3NhcnkuXG4gKiAtIERpc2FibGUgcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gcmVwbGFjZWQgYnkgdGhlICdudWNsaWRlJyBwYWNrYWdlLlxuICovXG5udWNsaWRlTWlncmF0aW9ucy5taWdyYXRlQ29uZmlnKCk7XG5udWNsaWRlVW5pbnN0YWxsZXIuZGlzYWJsZU91dGRhdGVkUGFja2FnZXMoKTtcblxuLyoqXG4gKiBCdWlsZCB0aGUgXCJjb25maWdcIiBvYmplY3QuIFRoaXMgZGV0ZXJtaW5lcyB0aGUgY29uZmlnIGRlZmF1bHRzIGFuZFxuICogaXQncyB3aGF0IGlzIHNob3duIGJ5IHRoZSBTZXR0aW5ncyB2aWV3LiBJdCBpbmNsdWRlczpcbiAqICgxKSBBbiBlbnRyeSB0byBlbmFibGUvZGlzYWJsZSBlYWNoIGZlYXR1cmUgLSBjYWxsZWQgXCJudWNsaWRlLnVzZS4qXCIuXG4gKiAoMikgRWFjaCBmZWF0dXJlJ3MgbWVyZ2VkIGNvbmZpZy5cbiAqXG4gKiBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0NvbmZpZ1xuICovXG5PYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgY29uc3Qge3BrZ30gPSBmZWF0dXJlc1tuYW1lXTtcblxuICAvLyBFbnRyeSBmb3IgZW5hYmxpbmcvZGlzYWJsaW5nIHRoZSBmZWF0dXJlXG4gIGNvbnN0IHNldHRpbmcgPSB7XG4gICAgdGl0bGU6IGBFbmFibGUgdGhlIFwiJHtuYW1lfVwiIGZlYXR1cmVgLFxuICAgIGRlc2NyaXB0aW9uOiBwa2cuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gIH07XG4gIGlmIChwa2cucHJvdmlkZWRTZXJ2aWNlcykge1xuICAgIGNvbnN0IHByb3ZpZGVzID0gT2JqZWN0LmtleXMocGtnLnByb3ZpZGVkU2VydmljZXMpLmpvaW4oJywgJyk7XG4gICAgc2V0dGluZy5kZXNjcmlwdGlvbiArPSBgPGJyLz4qKlByb3ZpZGVzOioqIF8ke3Byb3ZpZGVzfV9gO1xuICB9XG4gIGlmIChwa2cuY29uc3VtZWRTZXJ2aWNlcykge1xuICAgIGNvbnN0IGNvbnN1bWVzID0gT2JqZWN0LmtleXMocGtnLmNvbnN1bWVkU2VydmljZXMpLmpvaW4oJywgJyk7XG4gICAgc2V0dGluZy5kZXNjcmlwdGlvbiArPSBgPGJyLz4qKkNvbnN1bWVzOioqIF8ke2NvbnN1bWVzfV9gO1xuICB9XG4gIGNvbmZpZy51c2UucHJvcGVydGllc1tuYW1lXSA9IHNldHRpbmc7XG5cbiAgLy8gTWVyZ2UgaW4gdGhlIGZlYXR1cmUncyBjb25maWdcbiAgY29uc3QgcGtnQ29uZmlnID0gcGtnLm51Y2xpZGUuY29uZmlnO1xuICBpZiAocGtnQ29uZmlnKSB7XG4gICAgY29uZmlnW25hbWVdID0ge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKHBrZ0NvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uZmlnW25hbWVdLnByb3BlcnRpZXNba2V5XSA9IHtcbiAgICAgICAgLi4ucGtnQ29uZmlnW2tleV0sXG4gICAgICAgIHRpdGxlOiBuYW1lICsgJzogJyArIChwa2dDb25maWdba2V5XS50aXRsZSB8fCBrZXkpLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8qKlxuICogTG9hZCBmZWF0dXJlIGRlc2VyaWFsaXplcnMgYW5kIHJlcXVpcmUgdGhlbS5cbiAqIFRoaXMgaXMgY29taW5nIGluIEF0b20gMS40LjAgLSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85OTc0XG4gKi9cbk9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICBjb25zdCB7cGtnLCBkaXJuYW1lfSA9IGZlYXR1cmVzW25hbWVdO1xuICBpZiAocGtnLm51Y2xpZGUuZGVzZXJpYWxpemVycykge1xuICAgIE9iamVjdC5rZXlzKHBrZy5udWNsaWRlLmRlc2VyaWFsaXplcnMpLmZvckVhY2goZGVzZXJpYWxpemVyTmFtZSA9PiB7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXJQYXRoID0gcGtnLm51Y2xpZGUuZGVzZXJpYWxpemVyc1tkZXNlcmlhbGl6ZXJOYW1lXTtcbiAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSBwYXRoLmpvaW4oZGlybmFtZSwgZGVzZXJpYWxpemVyUGF0aCk7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXIgPSByZXF1aXJlKG1vZHVsZVBhdGgpO1xuICAgICAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh7XG4gICAgICAgIG5hbWU6IGRlc2VyaWFsaXplck5hbWUsXG4gICAgICAgIGRlc2VyaWFsaXplOiBkZXNlcmlhbGl6ZXIsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7XG5cbmNvbnN0IFVQTG9hZGVyID0ge1xuICBjb25maWcsXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgaW52YXJpYW50KCFkaXNwb3NhYmxlcyk7XG4gICAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgLy8gTG9hZGluZyBhbGwgb2YgdGhlIGZlYXR1cmVzLCB0aGVuIGFjdGl2YXRpbmcgdGhlbSB3aGF0IEF0b20gZG9lcyBvbiBpbml0OlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi92MS4xLjAvc3JjL2F0b20tZW52aXJvbm1lbnQuY29mZmVlI0w2MjUtTDYzMVxuICAgIC8vIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvUGFja2FnZU1hbmFnZXJcbiAgICBjb25zdCBsb2FkZWQgPSBPYmplY3Qua2V5cyhmZWF0dXJlcykubWFwKG5hbWUgPT4ge1xuICAgICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgICAgY29uc3QgZW5hYmxlZCA9IGF0b20uY29uZmlnLmdldChmZWF0dXJlLnVzZUtleVBhdGgpO1xuICAgICAgLy8gYGVuYWJsZWRgIG1heSBiZSBgdW5kZWZpbmVkYCBpZiBgYXRvbS5jb25maWcuZ2V0YCBpcyBjYWxsZWQgYmVmb3JlIHRoZVxuICAgICAgLy8gZGVmYXVsdCBjb25maWcgaXMgYnVpbHQuIElmIGEgZmVhdHVyZSBpcyBkaXNhYmxlZCwgYGVuYWJsZWRgIHdpbGwgYmVcbiAgICAgIC8vIGBmYWxzZWAsIHJlZ2FyZGxlc3Mgb2Ygd2hlbiBgYXRvbS5jb25maWcuZ2V0YCBpcyBjYWxsZWQuXG4gICAgICBpZiAoKGVuYWJsZWQgPT09IHRydWUgfHwgZW5hYmxlZCA9PT0gdW5kZWZpbmVkKSAmJiAhZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgICAgICAgaWYgKGZlYXR1cmUucGFja2FnZU1vZHVsZS5tYWluTW9kdWxlICYmXG4gICAgICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUubWFpbk1vZHVsZS5jb25maWcpIHtcbiAgICAgICAgICAvLyBGZWF0dXJlIGNvbmZpZyBpcyBoYW5kbGVkIGJ5IHRoZSBVUCBsb2FkZXIsIG5vdCBpbmRpdmlkdWFsIGZlYXR1cmVzXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7bmFtZX1cIiBleHBvcnRlZCBhIFwiY29uZmlnXCJgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmVhdHVyZS5wYWNrYWdlTW9kdWxlO1xuICAgICAgfVxuICAgIH0pLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGlmIChudWNsaWRlRmVhdHVyZXMpIHtcbiAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRMb2FkSW5pdGlhbEZlYXR1cmVzKCk7XG4gICAgfVxuXG4gICAgLy8gQWN0aXZhdGUgYWxsIG9mIHRoZSBsb2FkZWQgZmVhdHVyZXMuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL3YxLjEuMC9zcmMvcGFja2FnZS1tYW5hZ2VyLmNvZmZlZSNMNDMxLUw0NDBcbiAgICBQcm9taXNlLmFsbChhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZXMobG9hZGVkKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG51Y2xpZGVGZWF0dXJlcykge1xuICAgICAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRBY3RpdmF0ZUluaXRpYWxGZWF0dXJlcygpO1xuXG4gICAgICAgICAgLy8gTm8gbW9yZSBOdWNsaWRlIGV2ZW50cyB3aWxsIGJlIGZpcmVkLiBEaXNwb3NlIHRoZSBFbWl0dGVyIHRvIHJlbGVhc2VcbiAgICAgICAgICAvLyBtZW1vcnkgYW5kIHRvIGluZm9ybSBmdXR1cmUgY2FsbGVycyB0aGF0IHRoZXkncmUgYXR0ZW1wdGluZyB0byBsaXN0ZW5cbiAgICAgICAgICAvLyB0byBldmVudHMgdGhhdCB3aWxsIG5ldmVyIGZpcmUgYWdhaW4uXG4gICAgICAgICAgbnVjbGlkZUZlYXR1cmVzLmRpc3Bvc2UoKTtcbiAgICAgICAgICBudWNsaWRlRmVhdHVyZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIC8vIFdhdGNoIHRoZSBjb25maWcgdG8gbWFuYWdlIHRvZ2dsaW5nIGZlYXR1cmVzXG4gICAgT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgICBjb25zdCB3YXRjaGVyID0gYXRvbS5jb25maWcub25EaWRDaGFuZ2UoZmVhdHVyZS51c2VLZXlQYXRoLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5uZXdWYWx1ZSA9PT0gdHJ1ZSAmJiAhZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Lm5ld1ZhbHVlID09PSBmYWxzZSAmJiBmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgICBzYWZlRGVhY3RpdmF0ZShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkaXNwb3NhYmxlcy5hZGQod2F0Y2hlcik7XG4gICAgfSk7XG5cbiAgICAvLyBJbnN0YWxsIHB1YmxpYywgM3JkLXBhcnR5IEF0b20gcGFja2FnZXMgbGlzdGVkIGluIHRoaXMgcGFja2FnZSdzICdwYWNrYWdlLWRlcHMnIHNldHRpbmcuIFJ1blxuICAgIC8vIHRoaXMgKmFmdGVyKiBvdGhlciBwYWNrYWdlcyBhcmUgYWN0aXZhdGVkIHNvIHRoZXkgY2FuIG1vZGlmeSB0aGlzIHNldHRpbmcgaWYgZGVzaXJlZCBiZWZvcmVcbiAgICAvLyBpbnN0YWxsYXRpb24gaXMgYXR0ZW1wdGVkLlxuICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnaW5zdGFsbFJlY29tbWVuZGVkUGFja2FnZXMnKSB8fCBhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdudWNsaWRlJyk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBpZiAoZmVhdHVyZXNbbmFtZV0ucGFja2FnZU1vZHVsZSkge1xuICAgICAgICBzYWZlRGVhY3RpdmF0ZShuYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZGlzcG9zYWJsZXMpIHtcbiAgICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIGRpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZPUiBURVNUSU5HIFBVUlBPU0VTIE9OTFkhXG4gICAqL1xuICBfX3Rlc3RVc2VPbmx5X2dldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmVhdHVyZXMpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfZ2V0QXZhaWxhYmxlUGFja2FnZVBhdGhzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhmZWF0dXJlcykubWFwKG5hbWUgPT4gZmVhdHVyZXNbbmFtZV0uZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9sb2FkUGFja2FnZShuYW1lKSB7XG4gICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9hY3RpdmF0ZVBhY2thZ2UobmFtZSkge1xuICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2RlYWN0aXZhdGVQYWNrYWdlKG5hbWUpIHtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X3JlbW92ZUZlYXR1cmUobmFtZSkge1xuICAgIGRlbGV0ZSBmZWF0dXJlc1tuYW1lXTtcbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVVBMb2FkZXI7XG5cbmZ1bmN0aW9uIHNhZmVEZWFjdGl2YXRlKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKG5hbWUpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBkZWFjdGl2YXRpbmcgXCIke25hbWV9XCJgLCBlcnIpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9IGZpbmFsbHkge1xuICAgIGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUgPSBudWxsO1xuICB9XG59XG4iXX0=