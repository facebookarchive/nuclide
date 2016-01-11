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
if (process.env.NODE_ENV !== 'production' && jasmine !== undefined) {
  var tempDirPath = temp.mkdirSync('atom_home');
  atom.config.configDirPath = tempDirPath;
  atom.config.configFilePath = path.join(tempDirPath, 'config.cson');
}

// Exported "config" object
var config = {
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
    Object.keys(features).forEach(function (name) {
      var feature = features[name];
      var enabled = atom.config.get(feature.useKeyPath);
      if (enabled && !feature.packageModule) {
        feature.packageModule = atom.packages.loadPackage(feature.dirname);
        if (feature.packageModule.mainModule && feature.packageModule.mainModule.config) {
          // Feature config is handled by the UP loader, not individual features
          throw new Error('"' + name + '" exported a "config"');
        }
      }
    });

    if (nuclideFeatures) {
      nuclideFeatures.didLoadInitialFeatures();
    }

    Object.keys(features).forEach(function (name) {
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
//# sourceMappingURL=data:application/json;base64,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LHlDQUFDLElBQUksRUFBRTtBQUNwQyxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDOUM7O0FBRUQsNkJBQTJCLEVBQUEscUNBQUMsSUFBSSxFQUFFO0FBQ2hDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZCO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsU0FBUyxjQUFjLENBQUMsSUFBSSxFQUFFO0FBQzVCLE1BQUk7QUFDRixRQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixXQUFPLENBQUMsS0FBSywwQkFBd0IsSUFBSSxRQUFLLEdBQUcsQ0FBQyxDQUFDO0dBQ3BELFNBQVM7QUFDUixZQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUNyQztDQUNGIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBub2Zsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogICAgICAgICAgICAgICAgICBfICBfIF8gIF8gX19fXyBfICAgIF8gX19fICBfX19fXG4gKiAgICAgICAgICAgICAgICAgIHxcXCB8IHwgIHwgfCAgICB8ICAgIHwgfCAgXFwgfF9fX1xuICogICAgICAgICAgICAgICAgICB8IFxcfCB8X198IHxfX18gfF9fXyB8IHxfXy8gfF9fX1xuICogXyAgXyBfICBfIF8gX19fXyBfIF9fX18gX19fICAgICBfX18gIF9fX18gX19fXyBfICBfIF9fX18gX19fXyBfX19fXG4gKiB8ICB8IHxcXCB8IHwgfF9fXyB8IHxfX18gfCAgXFwgICAgfF9fXSB8X198IHwgICAgfF8vICB8X198IHwgX18gfF9fX1xuICogfF9ffCB8IFxcfCB8IHwgICAgfCB8X19fIHxfXy8gICAgfCAgICB8ICB8IHxfX18gfCBcXF8gfCAgfCB8X19dIHxfX19cbiAqXG4gKi9cblxuaWYgKHR5cGVvZiBhdG9tID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgaXMgYW4gQXRvbSBwYWNrYWdlLiBEaWQgeW91IG1lYW4gdG8gcnVuIHRoZSBzZXJ2ZXI/Jyk7XG59XG5cbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xubGV0IG51Y2xpZGVGZWF0dXJlcyA9IHJlcXVpcmUoJy4vbnVjbGlkZUZlYXR1cmVzJyk7XG5jb25zdCBudWNsaWRlTWlncmF0aW9ucyA9IHJlcXVpcmUoJy4vbnVjbGlkZU1pZ3JhdGlvbnMnKTtcbmNvbnN0IG51Y2xpZGVVbmluc3RhbGxlciA9IHJlcXVpcmUoJy4vbnVjbGlkZVVuaW5zdGFsbGVyJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgdGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbi8vIElmIHdlIGFyZSBpbiBhIHRlc3RpbmcgZW52aXJvbm1lbnQgdGhlbiB3ZSB3YW50IHRvIHVzZSBhIGRlZmF1bHQgYXRvbSBjb25maWcuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBqYXNtaW5lICE9PSB1bmRlZmluZWQpIHtcbiAgY29uc3QgdGVtcERpclBhdGggPSB0ZW1wLm1rZGlyU3luYygnYXRvbV9ob21lJyk7XG4gIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggPSB0ZW1wRGlyUGF0aDtcbiAgYXRvbS5jb25maWcuY29uZmlnRmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcERpclBhdGgsICdjb25maWcuY3NvbicpO1xufVxuXG4vLyBFeHBvcnRlZCBcImNvbmZpZ1wiIG9iamVjdFxuY29uc3QgY29uZmlnID0ge1xuICB1c2U6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgfSxcbn07XG5cbi8vIE51Y2xpZGUgcGFja2FnZXMgZm9yIEF0b20gYXJlIGNhbGxlZCBcImZlYXR1cmVzXCJcbmNvbnN0IEZFQVRVUkVTX0RJUiA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9wa2cnKTtcbmNvbnN0IGZlYXR1cmVzID0ge307XG5cbmxldCBkaXNwb3NhYmxlcztcblxuLyoqXG4gKiBHZXQgdGhlIFwicGFja2FnZS5qc29uXCIgb2YgYWxsIHRoZSBmZWF0dXJlcy5cbiAqL1xuKGZ1bmN0aW9uIHRyYXZlcnNlKGRpcm5hbWUpIHtcbiAgLy8gUGVyZm9ybSBhIGRlcHRoLWZpcnN0IHNlYXJjaCBmb3IgZmlyc3QtbGV2ZWwgXCJwYWNrYWdlLmpzb25cIiBmaWxlc1xuICB0cnkge1xuICAgIGNvbnN0IGxpc3QgPSBmcy5yZWFkZGlyU3luYyhkaXJuYW1lKTtcbiAgICBpZiAobGlzdC5pbmRleE9mKCdwYWNrYWdlLmpzb24nKSAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5qb2luKGRpcm5hbWUsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHNyYyA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSwgJ3V0ZjgnKTtcbiAgICAgIC8vIE9wdGltaXphdGlvbjogQXZvaWQgSlNPTiBwYXJzaW5nIGlmIGl0IGNhbid0IHJlYXNvbmFibHkgYmUgYW4gQXRvbSBwYWNrYWdlXG4gICAgICBpZiAoc3JjLmluZGV4T2YoJ1wiQXRvbVwiJykgPT09IC0xKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBrZyA9IEpTT04ucGFyc2Uoc3JjKTtcbiAgICAgIGlmIChwa2cubnVjbGlkZSAmJiBwa2cubnVjbGlkZS5wYWNrYWdlVHlwZSA9PT0gJ0F0b20nKSB7XG4gICAgICAgIGludmFyaWFudChwa2cubmFtZSk7XG4gICAgICAgIGZlYXR1cmVzW3BrZy5uYW1lXSA9IHtcbiAgICAgICAgICBwa2csXG4gICAgICAgICAgZGlybmFtZSxcbiAgICAgICAgICB1c2VLZXlQYXRoOiBgbnVjbGlkZS51c2UuJHtwa2cubmFtZX1gLFxuICAgICAgICAgIHBhY2thZ2VNb2R1bGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBsaXN0KSB7XG4gICAgICAgIC8vIEV4Y2x1ZGUgdGhlIFwic2FtcGxlXCIgZGlyZWN0b3J5XG4gICAgICAgIGlmIChpdGVtID09PSAnc2FtcGxlJyAmJiBGRUFUVVJFU19ESVIgPT09IGRpcm5hbWUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPcHRpbWl6YXRpb246IE91ciBkaXJlY3RvcmllcyBkb24ndCBoYXZlIHBlcmlvZHMgLSB0aGlzIG11c3QgYmUgYSBmaWxlXG4gICAgICAgIGlmIChpdGVtLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuZXh0ID0gcGF0aC5qb2luKGRpcm5hbWUsIGl0ZW0pO1xuICAgICAgICB0cmF2ZXJzZShuZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIuY29kZSAhPT0gJ0VOT1RESVInKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG59KShGRUFUVVJFU19ESVIpO1xuXG4vKipcbiAqIE1pZ3JhdGUgdXNlcnMgb2Ygb3V0ZGF0ZWQgTnVjbGlkZSBwYWNrYWdlcyB0byB0aGUgTnVjbGlkZSBVbmlmaWVkIFBhY2thZ2UuXG4gKlxuICogLSBNaWdyYXRlIHNldHRpbmdzIHRvIHRoZWlyIG5ldyBrZXlzIGluIHRoZSAnbnVjbGlkZS4nIG5hbWVzcGFjZSBpZiBuZWNlc3NhcnkuXG4gKiAtIERpc2FibGUgcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gcmVwbGFjZWQgYnkgdGhlICdudWNsaWRlJyBwYWNrYWdlLlxuICovXG5udWNsaWRlTWlncmF0aW9ucy5taWdyYXRlQ29uZmlnKCk7XG5udWNsaWRlVW5pbnN0YWxsZXIuZGlzYWJsZU91dGRhdGVkUGFja2FnZXMoKTtcblxuLyoqXG4gKiBCdWlsZCB0aGUgXCJjb25maWdcIiBvYmplY3QuIFRoaXMgZGV0ZXJtaW5lcyB0aGUgY29uZmlnIGRlZmF1bHRzIGFuZFxuICogaXQncyB3aGF0IGlzIHNob3duIGJ5IHRoZSBTZXR0aW5ncyB2aWV3LiBJdCBpbmNsdWRlczpcbiAqICgxKSBBbiBlbnRyeSB0byBlbmFibGUvZGlzYWJsZSBlYWNoIGZlYXR1cmUgLSBjYWxsZWQgXCJudWNsaWRlLnVzZS4qXCIuXG4gKiAoMikgRWFjaCBmZWF0dXJlJ3MgbWVyZ2VkIGNvbmZpZy5cbiAqXG4gKiBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L0NvbmZpZ1xuICovXG5PYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgY29uc3Qge3BrZ30gPSBmZWF0dXJlc1tuYW1lXTtcblxuICAvLyBFbnRyeSBmb3IgZW5hYmxpbmcvZGlzYWJsaW5nIHRoZSBmZWF0dXJlXG4gIGNvbnN0IHNldHRpbmcgPSB7XG4gICAgdGl0bGU6IGBFbmFibGUgdGhlIFwiJHtuYW1lfVwiIGZlYXR1cmVgLFxuICAgIGRlc2NyaXB0aW9uOiBwa2cuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gIH07XG4gIGlmIChwa2cucHJvdmlkZWRTZXJ2aWNlcykge1xuICAgIGNvbnN0IHByb3ZpZGVzID0gT2JqZWN0LmtleXMocGtnLnByb3ZpZGVkU2VydmljZXMpLmpvaW4oJywgJyk7XG4gICAgc2V0dGluZy5kZXNjcmlwdGlvbiArPSBgPGJyLz4qKlByb3ZpZGVzOioqIF8ke3Byb3ZpZGVzfV9gO1xuICB9XG4gIGlmIChwa2cuY29uc3VtZWRTZXJ2aWNlcykge1xuICAgIGNvbnN0IGNvbnN1bWVzID0gT2JqZWN0LmtleXMocGtnLmNvbnN1bWVkU2VydmljZXMpLmpvaW4oJywgJyk7XG4gICAgc2V0dGluZy5kZXNjcmlwdGlvbiArPSBgPGJyLz4qKkNvbnN1bWVzOioqIF8ke2NvbnN1bWVzfV9gO1xuICB9XG4gIGNvbmZpZy51c2UucHJvcGVydGllc1tuYW1lXSA9IHNldHRpbmc7XG5cbiAgLy8gTWVyZ2UgaW4gdGhlIGZlYXR1cmUncyBjb25maWdcbiAgY29uc3QgcGtnQ29uZmlnID0gcGtnLm51Y2xpZGUuY29uZmlnO1xuICBpZiAocGtnQ29uZmlnKSB7XG4gICAgY29uZmlnW25hbWVdID0ge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKHBrZ0NvbmZpZykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uZmlnW25hbWVdLnByb3BlcnRpZXNba2V5XSA9IHtcbiAgICAgICAgLi4ucGtnQ29uZmlnW2tleV0sXG4gICAgICAgIHRpdGxlOiBuYW1lICsgJzogJyArIChwa2dDb25maWdba2V5XS50aXRsZSB8fCBrZXkpLFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8qKlxuICogTG9hZCBmZWF0dXJlIGRlc2VyaWFsaXplcnMgYW5kIHJlcXVpcmUgdGhlbS5cbiAqIFRoaXMgaXMgY29taW5nIGluIEF0b20gMS40LjAgLSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy85OTc0XG4gKi9cbk9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICBjb25zdCB7cGtnLCBkaXJuYW1lfSA9IGZlYXR1cmVzW25hbWVdO1xuICBpZiAocGtnLm51Y2xpZGUuZGVzZXJpYWxpemVycykge1xuICAgIE9iamVjdC5rZXlzKHBrZy5udWNsaWRlLmRlc2VyaWFsaXplcnMpLmZvckVhY2goZGVzZXJpYWxpemVyTmFtZSA9PiB7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXJQYXRoID0gcGtnLm51Y2xpZGUuZGVzZXJpYWxpemVyc1tkZXNlcmlhbGl6ZXJOYW1lXTtcbiAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSBwYXRoLmpvaW4oZGlybmFtZSwgZGVzZXJpYWxpemVyUGF0aCk7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXIgPSByZXF1aXJlKG1vZHVsZVBhdGgpO1xuICAgICAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh7XG4gICAgICAgIG5hbWU6IGRlc2VyaWFsaXplck5hbWUsXG4gICAgICAgIGRlc2VyaWFsaXplOiBkZXNlcmlhbGl6ZXIsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7XG5cbmNvbnN0IFVQTG9hZGVyID0ge1xuICBjb25maWcsXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgaW52YXJpYW50KCFkaXNwb3NhYmxlcyk7XG4gICAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgLy8gTG9hZGluZyBhbGwgb2YgdGhlIGZlYXR1cmVzLCB0aGVuIGFjdGl2YXRpbmcgdGhlbSB3aGF0IEF0b20gZG9lcyBvbiBpbml0OlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi92MS4xLjAvc3JjL2F0b20tZW52aXJvbm1lbnQuY29mZmVlI0w2MjUtTDYzMVxuICAgIC8vIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvUGFja2FnZU1hbmFnZXJcbiAgICBPYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoZmVhdHVyZS51c2VLZXlQYXRoKTtcbiAgICAgIGlmIChlbmFibGVkICYmICFmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICAgICAgICBpZiAoZmVhdHVyZS5wYWNrYWdlTW9kdWxlLm1haW5Nb2R1bGUgJiZcbiAgICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5tYWluTW9kdWxlLmNvbmZpZykge1xuICAgICAgICAgIC8vIEZlYXR1cmUgY29uZmlnIGlzIGhhbmRsZWQgYnkgdGhlIFVQIGxvYWRlciwgbm90IGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtuYW1lfVwiIGV4cG9ydGVkIGEgXCJjb25maWdcImApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAobnVjbGlkZUZlYXR1cmVzKSB7XG4gICAgICBudWNsaWRlRmVhdHVyZXMuZGlkTG9hZEluaXRpYWxGZWF0dXJlcygpO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgaWYgKGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UobmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAobnVjbGlkZUZlYXR1cmVzKSB7XG4gICAgICBudWNsaWRlRmVhdHVyZXMuZGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKTtcblxuICAgICAgLy8gTm8gbW9yZSBOdWNsaWRlIGV2ZW50cyB3aWxsIGJlIGZpcmVkLiBEaXNwb3NlIHRoZSBFbWl0dGVyIHRvIHJlbGVhc2VcbiAgICAgIC8vIG1lbW9yeSBhbmQgdG8gaW5mb3JtIGZ1dHVyZSBjYWxsZXJzIHRoYXQgdGhleSdyZSBhdHRlbXB0aW5nIHRvIGxpc3RlblxuICAgICAgLy8gdG8gZXZlbnRzIHRoYXQgd2lsbCBuZXZlciBmaXJlIGFnYWluLlxuICAgICAgbnVjbGlkZUZlYXR1cmVzLmRpc3Bvc2UoKTtcbiAgICAgIG51Y2xpZGVGZWF0dXJlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2F0Y2ggdGhlIGNvbmZpZyB0byBtYW5hZ2UgdG9nZ2xpbmcgZmVhdHVyZXNcbiAgICBPYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICAgIGNvbnN0IHdhdGNoZXIgPSBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShmZWF0dXJlLnVzZUtleVBhdGgsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50Lm5ld1ZhbHVlID09PSB0cnVlICYmICFmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gICAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlLmFjdGl2YXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQubmV3VmFsdWUgPT09IGZhbHNlICYmIGZlYXR1cmUucGFja2FnZU1vZHVsZSkge1xuICAgICAgICAgIHNhZmVEZWFjdGl2YXRlKG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpc3Bvc2FibGVzLmFkZCh3YXRjaGVyKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgaWYgKGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgc2FmZURlYWN0aXZhdGUobmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGRpc3Bvc2FibGVzKSB7XG4gICAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICBkaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGT1IgVEVTVElORyBQVVJQT1NFUyBPTkxZIVxuICAgKi9cbiAgX190ZXN0VXNlT25seV9nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2dldEF2YWlsYWJsZVBhY2thZ2VQYXRocygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmVhdHVyZXMpLm1hcChuYW1lID0+IGZlYXR1cmVzW25hbWVdLmRpcm5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfbG9hZFBhY2thZ2UobmFtZSkge1xuICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfYWN0aXZhdGVQYWNrYWdlKG5hbWUpIHtcbiAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9kZWFjdGl2YXRlUGFja2FnZShuYW1lKSB7XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlKG5hbWUpIHtcbiAgICBkZWxldGUgZmVhdHVyZXNbbmFtZV07XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVQTG9hZGVyO1xuXG5mdW5jdGlvbiBzYWZlRGVhY3RpdmF0ZShuYW1lKSB7XG4gIHRyeSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShuYW1lKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZGVhY3RpdmF0aW5nIFwiJHtuYW1lfVwiYCwgZXJyKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgfSBmaW5hbGx5IHtcbiAgICBmZWF0dXJlc1tuYW1lXS5wYWNrYWdlTW9kdWxlID0gbnVsbDtcbiAgfVxufVxuIl19