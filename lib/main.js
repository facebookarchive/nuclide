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
      if (enabled && !feature.packageModule) {
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
    if (featureConfig.get('installRecommendedPackages')) {
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
//# sourceMappingURL=data:application/json;base64,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QUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuRDs7QUFFRCwrQkFBNkIsRUFBQSx1Q0FBQyxJQUFJLEVBQUU7QUFDbEMsUUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3ZEOztBQUVELGlDQUErQixFQUFBLHlDQUFDLElBQUksRUFBRTtBQUNwQyxXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDOUM7O0FBRUQsNkJBQTJCLEVBQUEscUNBQUMsSUFBSSxFQUFFO0FBQ2hDLFdBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZCO0NBQ0YsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7QUFFMUIsU0FBUyxjQUFjLENBQUMsSUFBSSxFQUFFO0FBQzVCLE1BQUk7QUFDRixRQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3ZDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixXQUFPLENBQUMsS0FBSywwQkFBd0IsSUFBSSxRQUFLLEdBQUcsQ0FBQyxDQUFDO0dBQ3BELFNBQVM7QUFDUixZQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztHQUNyQztDQUNGIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBub2Zsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogICAgICAgICAgICAgICAgICBfICBfIF8gIF8gX19fXyBfICAgIF8gX19fICBfX19fXG4gKiAgICAgICAgICAgICAgICAgIHxcXCB8IHwgIHwgfCAgICB8ICAgIHwgfCAgXFwgfF9fX1xuICogICAgICAgICAgICAgICAgICB8IFxcfCB8X198IHxfX18gfF9fXyB8IHxfXy8gfF9fX1xuICogXyAgXyBfICBfIF8gX19fXyBfIF9fX18gX19fICAgICBfX18gIF9fX18gX19fXyBfICBfIF9fX18gX19fXyBfX19fXG4gKiB8ICB8IHxcXCB8IHwgfF9fXyB8IHxfX18gfCAgXFwgICAgfF9fXSB8X198IHwgICAgfF8vICB8X198IHwgX18gfF9fX1xuICogfF9ffCB8IFxcfCB8IHwgICAgfCB8X19fIHxfXy8gICAgfCAgICB8ICB8IHxfX18gfCBcXF8gfCAgfCB8X19dIHxfX19cbiAqXG4gKi9cblxuaWYgKHR5cGVvZiBhdG9tID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgaXMgYW4gQXRvbSBwYWNrYWdlLiBEaWQgeW91IG1lYW4gdG8gcnVuIHRoZSBzZXJ2ZXI/Jyk7XG59XG5cbmNvbnN0IGZlYXR1cmVDb25maWcgPSByZXF1aXJlKCcuLi9wa2cvbnVjbGlkZS9mZWF0dXJlLWNvbmZpZycpO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5sZXQgbnVjbGlkZUZlYXR1cmVzID0gcmVxdWlyZSgnLi9udWNsaWRlRmVhdHVyZXMnKTtcbmNvbnN0IG51Y2xpZGVNaWdyYXRpb25zID0gcmVxdWlyZSgnLi9udWNsaWRlTWlncmF0aW9ucycpO1xuY29uc3QgbnVjbGlkZVVuaW5zdGFsbGVyID0gcmVxdWlyZSgnLi9udWNsaWRlVW5pbnN0YWxsZXInKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB0ZW1wID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKCk7XG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuLy8gSWYgd2UgYXJlIGluIGEgdGVzdGluZyBlbnZpcm9ubWVudCB0aGVuIHdlIHdhbnQgdG8gdXNlIGEgZGVmYXVsdCBhdG9tIGNvbmZpZy5cbmlmIChhdG9tLmluU3BlY01vZGUoKSkge1xuICBjb25zdCB0ZW1wRGlyUGF0aCA9IHRlbXAubWtkaXJTeW5jKCdhdG9tX2hvbWUnKTtcbiAgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCA9IHRlbXBEaXJQYXRoO1xuICBhdG9tLmNvbmZpZy5jb25maWdGaWxlUGF0aCA9IHBhdGguam9pbih0ZW1wRGlyUGF0aCwgJ2NvbmZpZy5jc29uJyk7XG59XG5cbi8vIEV4cG9ydGVkIFwiY29uZmlnXCIgb2JqZWN0XG5jb25zdCBjb25maWcgPSB7XG4gIGluc3RhbGxSZWNvbW1lbmRlZFBhY2thZ2VzOiB7XG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnT24gc3RhcnQgdXAsIGNoZWNrIGZvciBhbmQgaW5zdGFsbCBBdG9tIHBhY2thZ2VzIHJlY29tbWVuZGVkIGZvciB1c2Ugd2l0aCBOdWNsaWRlLiBUaGUnXG4gICAgICArICcgbGlzdCBvZiBwYWNrYWdlcyBjYW4gYmUgZm91bmQgaW4gdGhlIDxjb2RlPnBhY2thZ2UtZGVwczwvY29kZT4gc2V0dGluZyBpbiB0aGlzIHBhY2thZ2VcXCdzJ1xuICAgICAgKyAnIFwicGFja2FnZS5qc29uXCIgZmlsZS4gRGlzYWJsaW5nIHRoaXMgc2V0dGluZyB3aWxsIG5vdCB1bmluc3RhbGwgcGFja2FnZXMgaXQgcHJldmlvdXNseSdcbiAgICAgICsgJyBpbnN0YWxsZWQuIFJlc3RhcnQgQXRvbSBhZnRlciBjaGFuZ2luZyB0aGlzIHNldHRpbmcgZm9yIGl0IHRvIHRha2UgZWZmZWN0LicsXG4gICAgdGl0bGU6ICdJbnN0YWxsIFJlY29tbWVuZGVkIFBhY2thZ2VzIG9uIFN0YXJ0dXAnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgfSxcbiAgdXNlOiB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgcHJvcGVydGllczoge30sXG4gIH0sXG59O1xuXG4vLyBOdWNsaWRlIHBhY2thZ2VzIGZvciBBdG9tIGFyZSBjYWxsZWQgXCJmZWF0dXJlc1wiXG5jb25zdCBGRUFUVVJFU19ESVIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGtnJyk7XG5jb25zdCBmZWF0dXJlcyA9IHt9O1xuXG5sZXQgZGlzcG9zYWJsZXM7XG5cbi8qKlxuICogR2V0IHRoZSBcInBhY2thZ2UuanNvblwiIG9mIGFsbCB0aGUgZmVhdHVyZXMuXG4gKi9cbihmdW5jdGlvbiB0cmF2ZXJzZShkaXJuYW1lKSB7XG4gIC8vIFBlcmZvcm0gYSBkZXB0aC1maXJzdCBzZWFyY2ggZm9yIGZpcnN0LWxldmVsIFwicGFja2FnZS5qc29uXCIgZmlsZXNcbiAgdHJ5IHtcbiAgICBjb25zdCBsaXN0ID0gZnMucmVhZGRpclN5bmMoZGlybmFtZSk7XG4gICAgaWYgKGxpc3QuaW5kZXhPZigncGFja2FnZS5qc29uJykgIT09IC0xKSB7XG4gICAgICBjb25zdCBmaWxlbmFtZSA9IHBhdGguam9pbihkaXJuYW1lLCAncGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCBzcmMgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZW5hbWUsICd1dGY4Jyk7XG4gICAgICAvLyBPcHRpbWl6YXRpb246IEF2b2lkIEpTT04gcGFyc2luZyBpZiBpdCBjYW4ndCByZWFzb25hYmx5IGJlIGFuIEF0b20gcGFja2FnZVxuICAgICAgaWYgKHNyYy5pbmRleE9mKCdcIkF0b21cIicpID09PSAtMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBwa2cgPSBKU09OLnBhcnNlKHNyYyk7XG4gICAgICBpZiAocGtnLm51Y2xpZGUgJiYgcGtnLm51Y2xpZGUucGFja2FnZVR5cGUgPT09ICdBdG9tJykge1xuICAgICAgICBpbnZhcmlhbnQocGtnLm5hbWUpO1xuICAgICAgICBmZWF0dXJlc1twa2cubmFtZV0gPSB7XG4gICAgICAgICAgcGtnLFxuICAgICAgICAgIGRpcm5hbWUsXG4gICAgICAgICAgdXNlS2V5UGF0aDogYG51Y2xpZGUudXNlLiR7cGtnLm5hbWV9YCxcbiAgICAgICAgICBwYWNrYWdlTW9kdWxlOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgbGlzdCkge1xuICAgICAgICAvLyBFeGNsdWRlIHRoZSBcInNhbXBsZVwiIGRpcmVjdG9yeVxuICAgICAgICBpZiAoaXRlbSA9PT0gJ3NhbXBsZScgJiYgRkVBVFVSRVNfRElSID09PSBkaXJuYW1lKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3B0aW1pemF0aW9uOiBPdXIgZGlyZWN0b3JpZXMgZG9uJ3QgaGF2ZSBwZXJpb2RzIC0gdGhpcyBtdXN0IGJlIGEgZmlsZVxuICAgICAgICBpZiAoaXRlbS5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV4dCA9IHBhdGguam9pbihkaXJuYW1lLCBpdGVtKTtcbiAgICAgICAgdHJhdmVyc2UobmV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyLmNvZGUgIT09ICdFTk9URElSJykge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxufSkoRkVBVFVSRVNfRElSKTtcblxuLyoqXG4gKiBNaWdyYXRlIHVzZXJzIG9mIG91dGRhdGVkIE51Y2xpZGUgcGFja2FnZXMgdG8gdGhlIE51Y2xpZGUgVW5pZmllZCBQYWNrYWdlLlxuICpcbiAqIC0gTWlncmF0ZSBzZXR0aW5ncyB0byB0aGVpciBuZXcga2V5cyBpbiB0aGUgJ251Y2xpZGUuJyBuYW1lc3BhY2UgaWYgbmVjZXNzYXJ5LlxuICogLSBEaXNhYmxlIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIHJlcGxhY2VkIGJ5IHRoZSAnbnVjbGlkZScgcGFja2FnZS5cbiAqL1xubnVjbGlkZU1pZ3JhdGlvbnMubWlncmF0ZUNvbmZpZygpO1xubnVjbGlkZVVuaW5zdGFsbGVyLmRpc2FibGVPdXRkYXRlZFBhY2thZ2VzKCk7XG5cbi8qKlxuICogQnVpbGQgdGhlIFwiY29uZmlnXCIgb2JqZWN0LiBUaGlzIGRldGVybWluZXMgdGhlIGNvbmZpZyBkZWZhdWx0cyBhbmRcbiAqIGl0J3Mgd2hhdCBpcyBzaG93biBieSB0aGUgU2V0dGluZ3Mgdmlldy4gSXQgaW5jbHVkZXM6XG4gKiAoMSkgQW4gZW50cnkgdG8gZW5hYmxlL2Rpc2FibGUgZWFjaCBmZWF0dXJlIC0gY2FsbGVkIFwibnVjbGlkZS51c2UuKlwiLlxuICogKDIpIEVhY2ggZmVhdHVyZSdzIG1lcmdlZCBjb25maWcuXG4gKlxuICogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9Db25maWdcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2d9ID0gZmVhdHVyZXNbbmFtZV07XG5cbiAgLy8gRW50cnkgZm9yIGVuYWJsaW5nL2Rpc2FibGluZyB0aGUgZmVhdHVyZVxuICBjb25zdCBzZXR0aW5nID0ge1xuICAgIHRpdGxlOiBgRW5hYmxlIHRoZSBcIiR7bmFtZX1cIiBmZWF0dXJlYCxcbiAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICB9O1xuICBpZiAocGtnLnByb3ZpZGVkU2VydmljZXMpIHtcbiAgICBjb25zdCBwcm92aWRlcyA9IE9iamVjdC5rZXlzKHBrZy5wcm92aWRlZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipQcm92aWRlczoqKiBfJHtwcm92aWRlc31fYDtcbiAgfVxuICBpZiAocGtnLmNvbnN1bWVkU2VydmljZXMpIHtcbiAgICBjb25zdCBjb25zdW1lcyA9IE9iamVjdC5rZXlzKHBrZy5jb25zdW1lZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipDb25zdW1lczoqKiBfJHtjb25zdW1lc31fYDtcbiAgfVxuICBjb25maWcudXNlLnByb3BlcnRpZXNbbmFtZV0gPSBzZXR0aW5nO1xuXG4gIC8vIE1lcmdlIGluIHRoZSBmZWF0dXJlJ3MgY29uZmlnXG4gIGNvbnN0IHBrZ0NvbmZpZyA9IHBrZy5udWNsaWRlLmNvbmZpZztcbiAgaWYgKHBrZ0NvbmZpZykge1xuICAgIGNvbmZpZ1tuYW1lXSA9IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhwa2dDb25maWcpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbmZpZ1tuYW1lXS5wcm9wZXJ0aWVzW2tleV0gPSB7XG4gICAgICAgIC4uLnBrZ0NvbmZpZ1trZXldLFxuICAgICAgICB0aXRsZTogbmFtZSArICc6ICcgKyAocGtnQ29uZmlnW2tleV0udGl0bGUgfHwga2V5KSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vKipcbiAqIExvYWQgZmVhdHVyZSBkZXNlcmlhbGl6ZXJzIGFuZCByZXF1aXJlIHRoZW0uXG4gKiBUaGlzIGlzIGNvbWluZyBpbiBBdG9tIDEuNC4wIC0gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvOTk3NFxuICovXG5PYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgY29uc3Qge3BrZywgZGlybmFtZX0gPSBmZWF0dXJlc1tuYW1lXTtcbiAgaWYgKHBrZy5udWNsaWRlLmRlc2VyaWFsaXplcnMpIHtcbiAgICBPYmplY3Qua2V5cyhwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzKS5mb3JFYWNoKGRlc2VyaWFsaXplck5hbWUgPT4ge1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVyUGF0aCA9IHBrZy5udWNsaWRlLmRlc2VyaWFsaXplcnNbZGVzZXJpYWxpemVyTmFtZV07XG4gICAgICBjb25zdCBtb2R1bGVQYXRoID0gcGF0aC5qb2luKGRpcm5hbWUsIGRlc2VyaWFsaXplclBhdGgpO1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVyID0gcmVxdWlyZShtb2R1bGVQYXRoKTtcbiAgICAgIGF0b20uZGVzZXJpYWxpemVycy5hZGQoe1xuICAgICAgICBuYW1lOiBkZXNlcmlhbGl6ZXJOYW1lLFxuICAgICAgICBkZXNlcmlhbGl6ZTogZGVzZXJpYWxpemVyLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG5jb25zdCBVUExvYWRlciA9IHtcbiAgY29uZmlnLFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIGludmFyaWFudCghZGlzcG9zYWJsZXMpO1xuICAgIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIExvYWRpbmcgYWxsIG9mIHRoZSBmZWF0dXJlcywgdGhlbiBhY3RpdmF0aW5nIHRoZW0gd2hhdCBBdG9tIGRvZXMgb24gaW5pdDpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvdjEuMS4wL3NyYy9hdG9tLWVudmlyb25tZW50LmNvZmZlZSNMNjI1LUw2MzFcbiAgICAvLyBodHRwczovL2F0b20uaW8vZG9jcy9hcGkvbGF0ZXN0L1BhY2thZ2VNYW5hZ2VyXG4gICAgY29uc3QgbG9hZGVkID0gT2JqZWN0LmtleXMoZmVhdHVyZXMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICAgIGNvbnN0IGVuYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoZmVhdHVyZS51c2VLZXlQYXRoKTtcbiAgICAgIGlmIChlbmFibGVkICYmICFmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICAgICAgICBpZiAoZmVhdHVyZS5wYWNrYWdlTW9kdWxlLm1haW5Nb2R1bGUgJiZcbiAgICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5tYWluTW9kdWxlLmNvbmZpZykge1xuICAgICAgICAgIC8vIEZlYXR1cmUgY29uZmlnIGlzIGhhbmRsZWQgYnkgdGhlIFVQIGxvYWRlciwgbm90IGluZGl2aWR1YWwgZmVhdHVyZXNcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFwiJHtuYW1lfVwiIGV4cG9ydGVkIGEgXCJjb25maWdcImApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmZWF0dXJlLnBhY2thZ2VNb2R1bGU7XG4gICAgICB9XG4gICAgfSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgaWYgKG51Y2xpZGVGZWF0dXJlcykge1xuICAgICAgbnVjbGlkZUZlYXR1cmVzLmRpZExvYWRJbml0aWFsRmVhdHVyZXMoKTtcbiAgICB9XG5cbiAgICAvLyBBY3RpdmF0ZSBhbGwgb2YgdGhlIGxvYWRlZCBmZWF0dXJlcy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2Jsb2IvdjEuMS4wL3NyYy9wYWNrYWdlLW1hbmFnZXIuY29mZmVlI0w0MzEtTDQ0MFxuICAgIFByb21pc2UuYWxsKGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlcyhsb2FkZWQpKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICBpZiAobnVjbGlkZUZlYXR1cmVzKSB7XG4gICAgICAgICAgbnVjbGlkZUZlYXR1cmVzLmRpZEFjdGl2YXRlSW5pdGlhbEZlYXR1cmVzKCk7XG5cbiAgICAgICAgICAvLyBObyBtb3JlIE51Y2xpZGUgZXZlbnRzIHdpbGwgYmUgZmlyZWQuIERpc3Bvc2UgdGhlIEVtaXR0ZXIgdG8gcmVsZWFzZVxuICAgICAgICAgIC8vIG1lbW9yeSBhbmQgdG8gaW5mb3JtIGZ1dHVyZSBjYWxsZXJzIHRoYXQgdGhleSdyZSBhdHRlbXB0aW5nIHRvIGxpc3RlblxuICAgICAgICAgIC8vIHRvIGV2ZW50cyB0aGF0IHdpbGwgbmV2ZXIgZmlyZSBhZ2Fpbi5cbiAgICAgICAgICBudWNsaWRlRmVhdHVyZXMuZGlzcG9zZSgpO1xuICAgICAgICAgIG51Y2xpZGVGZWF0dXJlcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggdGhlIGNvbmZpZyB0byBtYW5hZ2UgdG9nZ2xpbmcgZmVhdHVyZXNcbiAgICBPYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICAgIGNvbnN0IHdhdGNoZXIgPSBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShmZWF0dXJlLnVzZUtleVBhdGgsIGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKGV2ZW50Lm5ld1ZhbHVlID09PSB0cnVlICYmICFmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gICAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlLmFjdGl2YXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQubmV3VmFsdWUgPT09IGZhbHNlICYmIGZlYXR1cmUucGFja2FnZU1vZHVsZSkge1xuICAgICAgICAgIHNhZmVEZWFjdGl2YXRlKG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpc3Bvc2FibGVzLmFkZCh3YXRjaGVyKTtcbiAgICB9KTtcblxuICAgIC8vIEluc3RhbGwgcHVibGljLCAzcmQtcGFydHkgQXRvbSBwYWNrYWdlcyBsaXN0ZWQgaW4gdGhpcyBwYWNrYWdlJ3MgJ3BhY2thZ2UtZGVwcycgc2V0dGluZy4gUnVuXG4gICAgLy8gdGhpcyAqYWZ0ZXIqIG90aGVyIHBhY2thZ2VzIGFyZSBhY3RpdmF0ZWQgc28gdGhleSBjYW4gbW9kaWZ5IHRoaXMgc2V0dGluZyBpZiBkZXNpcmVkIGJlZm9yZVxuICAgIC8vIGluc3RhbGxhdGlvbiBpcyBhdHRlbXB0ZWQuXG4gICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KCdpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlcycpKSB7XG4gICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ251Y2xpZGUnKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBPYmplY3Qua2V5cyhmZWF0dXJlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGlmIChmZWF0dXJlc1tuYW1lXS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgIHNhZmVEZWFjdGl2YXRlKG5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChkaXNwb3NhYmxlcykge1xuICAgICAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgZGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRk9SIFRFU1RJTkcgUFVSUE9TRVMgT05MWSFcbiAgICovXG4gIF9fdGVzdFVzZU9ubHlfZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhmZWF0dXJlcyk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9nZXRBdmFpbGFibGVQYWNrYWdlUGF0aHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5tYXAobmFtZSA9PiBmZWF0dXJlc1tuYW1lXS5kaXJuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2xvYWRQYWNrYWdlKG5hbWUpIHtcbiAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2FjdGl2YXRlUGFja2FnZShuYW1lKSB7XG4gICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSkge1xuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKG5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfcmVtb3ZlRmVhdHVyZShuYW1lKSB7XG4gICAgZGVsZXRlIGZlYXR1cmVzW25hbWVdO1xuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVUExvYWRlcjtcblxuZnVuY3Rpb24gc2FmZURlYWN0aXZhdGUobmFtZSkge1xuICB0cnkge1xuICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGRlYWN0aXZhdGluZyBcIiR7bmFtZX1cImAsIGVycik7IC8vZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gIH0gZmluYWxseSB7XG4gICAgZmVhdHVyZXNbbmFtZV0ucGFja2FnZU1vZHVsZSA9IG51bGw7XG4gIH1cbn1cbiJdfQ==