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
//# sourceMappingURL=data:application/json;base64,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QUksRUFBRTtBQUM5QixRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDbkQ7O0FBRUQsK0JBQTZCLEVBQUEsdUNBQUMsSUFBSSxFQUFFO0FBQ2xDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN2RDs7QUFFRCxpQ0FBK0IsRUFBQSx5Q0FBQyxJQUFJLEVBQUU7QUFDcEMsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzlDOztBQUVELDZCQUEyQixFQUFBLHFDQUFDLElBQUksRUFBRTtBQUNoQyxXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2QjtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJO0FBQ0YsUUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2QyxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osV0FBTyxDQUFDLEtBQUssMEJBQXdCLElBQUksUUFBSyxHQUFHLENBQUMsQ0FBQztHQUNwRCxTQUFTO0FBQ1IsWUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7R0FDckM7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAbm9mbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqICAgICAgICAgICAgICAgICAgXyAgXyBfICBfIF9fX18gXyAgICBfIF9fXyAgX19fX1xuICogICAgICAgICAgICAgICAgICB8XFwgfCB8ICB8IHwgICAgfCAgICB8IHwgIFxcIHxfX19cbiAqICAgICAgICAgICAgICAgICAgfCBcXHwgfF9ffCB8X19fIHxfX18gfCB8X18vIHxfX19cbiAqIF8gIF8gXyAgXyBfIF9fX18gXyBfX19fIF9fXyAgICAgX19fICBfX19fIF9fX18gXyAgXyBfX19fIF9fX18gX19fX1xuICogfCAgfCB8XFwgfCB8IHxfX18gfCB8X19fIHwgIFxcICAgIHxfX10gfF9ffCB8ICAgIHxfLyAgfF9ffCB8IF9fIHxfX19cbiAqIHxfX3wgfCBcXHwgfCB8ICAgIHwgfF9fXyB8X18vICAgIHwgICAgfCAgfCB8X19fIHwgXFxfIHwgIHwgfF9fXSB8X19fXG4gKlxuICovXG5cbmlmICh0eXBlb2YgYXRvbSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGlzIGFuIEF0b20gcGFja2FnZS4gRGlkIHlvdSBtZWFuIHRvIHJ1biB0aGUgc2VydmVyPycpO1xufVxuXG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vcGtnL251Y2xpZGUvZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xubGV0IG51Y2xpZGVGZWF0dXJlcyA9IHJlcXVpcmUoJy4vbnVjbGlkZUZlYXR1cmVzJyk7XG5jb25zdCBudWNsaWRlTWlncmF0aW9ucyA9IHJlcXVpcmUoJy4vbnVjbGlkZU1pZ3JhdGlvbnMnKTtcbmNvbnN0IG51Y2xpZGVVbmluc3RhbGxlciA9IHJlcXVpcmUoJy4vbnVjbGlkZVVuaW5zdGFsbGVyJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgdGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbi8vIElmIHdlIGFyZSBpbiBhIHRlc3RpbmcgZW52aXJvbm1lbnQgdGhlbiB3ZSB3YW50IHRvIHVzZSBhIGRlZmF1bHQgYXRvbSBjb25maWcuXG5pZiAoYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgY29uc3QgdGVtcERpclBhdGggPSB0ZW1wLm1rZGlyU3luYygnYXRvbV9ob21lJyk7XG4gIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggPSB0ZW1wRGlyUGF0aDtcbiAgYXRvbS5jb25maWcuY29uZmlnRmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcERpclBhdGgsICdjb25maWcuY3NvbicpO1xufVxuXG4vLyBFeHBvcnRlZCBcImNvbmZpZ1wiIG9iamVjdFxuY29uc3QgY29uZmlnID0ge1xuICBpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlczoge1xuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ09uIHN0YXJ0IHVwLCBjaGVjayBmb3IgYW5kIGluc3RhbGwgQXRvbSBwYWNrYWdlcyByZWNvbW1lbmRlZCBmb3IgdXNlIHdpdGggTnVjbGlkZS4gVGhlJ1xuICAgICAgKyAnIGxpc3Qgb2YgcGFja2FnZXMgY2FuIGJlIGZvdW5kIGluIHRoZSA8Y29kZT5wYWNrYWdlLWRlcHM8L2NvZGU+IHNldHRpbmcgaW4gdGhpcyBwYWNrYWdlXFwncydcbiAgICAgICsgJyBcInBhY2thZ2UuanNvblwiIGZpbGUuIERpc2FibGluZyB0aGlzIHNldHRpbmcgd2lsbCBub3QgdW5pbnN0YWxsIHBhY2thZ2VzIGl0IHByZXZpb3VzbHknXG4gICAgICArICcgaW5zdGFsbGVkLiBSZXN0YXJ0IEF0b20gYWZ0ZXIgY2hhbmdpbmcgdGhpcyBzZXR0aW5nIGZvciBpdCB0byB0YWtlIGVmZmVjdC4nLFxuICAgIHRpdGxlOiAnSW5zdGFsbCBSZWNvbW1lbmRlZCBQYWNrYWdlcyBvbiBTdGFydHVwJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHVzZToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHt9LFxuICB9LFxufTtcblxuLy8gTnVjbGlkZSBwYWNrYWdlcyBmb3IgQXRvbSBhcmUgY2FsbGVkIFwiZmVhdHVyZXNcIlxuY29uc3QgRkVBVFVSRVNfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BrZycpO1xuY29uc3QgZmVhdHVyZXMgPSB7fTtcblxubGV0IGRpc3Bvc2FibGVzO1xuXG4vKipcbiAqIEdldCB0aGUgXCJwYWNrYWdlLmpzb25cIiBvZiBhbGwgdGhlIGZlYXR1cmVzLlxuICovXG4oZnVuY3Rpb24gdHJhdmVyc2UoZGlybmFtZSkge1xuICAvLyBQZXJmb3JtIGEgZGVwdGgtZmlyc3Qgc2VhcmNoIGZvciBmaXJzdC1sZXZlbCBcInBhY2thZ2UuanNvblwiIGZpbGVzXG4gIHRyeSB7XG4gICAgY29uc3QgbGlzdCA9IGZzLnJlYWRkaXJTeW5jKGRpcm5hbWUpO1xuICAgIGlmIChsaXN0LmluZGV4T2YoJ3BhY2thZ2UuanNvbicpICE9PSAtMSkge1xuICAgICAgY29uc3QgZmlsZW5hbWUgPSBwYXRoLmpvaW4oZGlybmFtZSwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgY29uc3Qgc3JjID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpO1xuICAgICAgLy8gT3B0aW1pemF0aW9uOiBBdm9pZCBKU09OIHBhcnNpbmcgaWYgaXQgY2FuJ3QgcmVhc29uYWJseSBiZSBhbiBBdG9tIHBhY2thZ2VcbiAgICAgIGlmIChzcmMuaW5kZXhPZignXCJBdG9tXCInKSA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcGtnID0gSlNPTi5wYXJzZShzcmMpO1xuICAgICAgaWYgKHBrZy5udWNsaWRlICYmIHBrZy5udWNsaWRlLnBhY2thZ2VUeXBlID09PSAnQXRvbScpIHtcbiAgICAgICAgaW52YXJpYW50KHBrZy5uYW1lKTtcbiAgICAgICAgZmVhdHVyZXNbcGtnLm5hbWVdID0ge1xuICAgICAgICAgIHBrZyxcbiAgICAgICAgICBkaXJuYW1lLFxuICAgICAgICAgIHVzZUtleVBhdGg6IGBudWNsaWRlLnVzZS4ke3BrZy5uYW1lfWAsXG4gICAgICAgICAgcGFja2FnZU1vZHVsZTogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGxpc3QpIHtcbiAgICAgICAgLy8gRXhjbHVkZSB0aGUgXCJzYW1wbGVcIiBkaXJlY3RvcnlcbiAgICAgICAgaWYgKGl0ZW0gPT09ICdzYW1wbGUnICYmIEZFQVRVUkVTX0RJUiA9PT0gZGlybmFtZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9wdGltaXphdGlvbjogT3VyIGRpcmVjdG9yaWVzIGRvbid0IGhhdmUgcGVyaW9kcyAtIHRoaXMgbXVzdCBiZSBhIGZpbGVcbiAgICAgICAgaWYgKGl0ZW0uaW5kZXhPZignLicpICE9PSAtMSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5leHQgPSBwYXRoLmpvaW4oZGlybmFtZSwgaXRlbSk7XG4gICAgICAgIHRyYXZlcnNlKG5leHQpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyci5jb2RlICE9PSAnRU5PVERJUicpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cbn0pKEZFQVRVUkVTX0RJUik7XG5cbi8qKlxuICogTWlncmF0ZSB1c2VycyBvZiBvdXRkYXRlZCBOdWNsaWRlIHBhY2thZ2VzIHRvIHRoZSBOdWNsaWRlIFVuaWZpZWQgUGFja2FnZS5cbiAqXG4gKiAtIE1pZ3JhdGUgc2V0dGluZ3MgdG8gdGhlaXIgbmV3IGtleXMgaW4gdGhlICdudWNsaWRlLicgbmFtZXNwYWNlIGlmIG5lY2Vzc2FyeS5cbiAqIC0gRGlzYWJsZSBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiByZXBsYWNlZCBieSB0aGUgJ251Y2xpZGUnIHBhY2thZ2UuXG4gKi9cbm51Y2xpZGVNaWdyYXRpb25zLm1pZ3JhdGVDb25maWcoKTtcbm51Y2xpZGVVbmluc3RhbGxlci5kaXNhYmxlT3V0ZGF0ZWRQYWNrYWdlcygpO1xuXG4vKipcbiAqIEJ1aWxkIHRoZSBcImNvbmZpZ1wiIG9iamVjdC4gVGhpcyBkZXRlcm1pbmVzIHRoZSBjb25maWcgZGVmYXVsdHMgYW5kXG4gKiBpdCdzIHdoYXQgaXMgc2hvd24gYnkgdGhlIFNldHRpbmdzIHZpZXcuIEl0IGluY2x1ZGVzOlxuICogKDEpIEFuIGVudHJ5IHRvIGVuYWJsZS9kaXNhYmxlIGVhY2ggZmVhdHVyZSAtIGNhbGxlZCBcIm51Y2xpZGUudXNlLipcIi5cbiAqICgyKSBFYWNoIGZlYXR1cmUncyBtZXJnZWQgY29uZmlnLlxuICpcbiAqIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvQ29uZmlnXG4gKi9cbk9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICBjb25zdCB7cGtnfSA9IGZlYXR1cmVzW25hbWVdO1xuXG4gIC8vIEVudHJ5IGZvciBlbmFibGluZy9kaXNhYmxpbmcgdGhlIGZlYXR1cmVcbiAgY29uc3Qgc2V0dGluZyA9IHtcbiAgICB0aXRsZTogYEVuYWJsZSB0aGUgXCIke25hbWV9XCIgZmVhdHVyZWAsXG4gICAgZGVzY3JpcHRpb246IHBrZy5kZXNjcmlwdGlvbiB8fCAnJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgfTtcbiAgaWYgKHBrZy5wcm92aWRlZFNlcnZpY2VzKSB7XG4gICAgY29uc3QgcHJvdmlkZXMgPSBPYmplY3Qua2V5cyhwa2cucHJvdmlkZWRTZXJ2aWNlcykuam9pbignLCAnKTtcbiAgICBzZXR0aW5nLmRlc2NyaXB0aW9uICs9IGA8YnIvPioqUHJvdmlkZXM6KiogXyR7cHJvdmlkZXN9X2A7XG4gIH1cbiAgaWYgKHBrZy5jb25zdW1lZFNlcnZpY2VzKSB7XG4gICAgY29uc3QgY29uc3VtZXMgPSBPYmplY3Qua2V5cyhwa2cuY29uc3VtZWRTZXJ2aWNlcykuam9pbignLCAnKTtcbiAgICBzZXR0aW5nLmRlc2NyaXB0aW9uICs9IGA8YnIvPioqQ29uc3VtZXM6KiogXyR7Y29uc3VtZXN9X2A7XG4gIH1cbiAgY29uZmlnLnVzZS5wcm9wZXJ0aWVzW25hbWVdID0gc2V0dGluZztcblxuICAvLyBNZXJnZSBpbiB0aGUgZmVhdHVyZSdzIGNvbmZpZ1xuICBjb25zdCBwa2dDb25maWcgPSBwa2cubnVjbGlkZS5jb25maWc7XG4gIGlmIChwa2dDb25maWcpIHtcbiAgICBjb25maWdbbmFtZV0gPSB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgIH07XG4gICAgT2JqZWN0LmtleXMocGtnQ29uZmlnKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBjb25maWdbbmFtZV0ucHJvcGVydGllc1trZXldID0ge1xuICAgICAgICAuLi5wa2dDb25maWdba2V5XSxcbiAgICAgICAgdGl0bGU6IG5hbWUgKyAnOiAnICsgKHBrZ0NvbmZpZ1trZXldLnRpdGxlIHx8IGtleSksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59KTtcblxuLyoqXG4gKiBMb2FkIGZlYXR1cmUgZGVzZXJpYWxpemVycyBhbmQgcmVxdWlyZSB0aGVtLlxuICogVGhpcyBpcyBjb21pbmcgaW4gQXRvbSAxLjQuMCAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzk5NzRcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2csIGRpcm5hbWV9ID0gZmVhdHVyZXNbbmFtZV07XG4gIGlmIChwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzKSB7XG4gICAgT2JqZWN0LmtleXMocGtnLm51Y2xpZGUuZGVzZXJpYWxpemVycykuZm9yRWFjaChkZXNlcmlhbGl6ZXJOYW1lID0+IHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplclBhdGggPSBwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzW2Rlc2VyaWFsaXplck5hbWVdO1xuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IHBhdGguam9pbihkaXJuYW1lLCBkZXNlcmlhbGl6ZXJQYXRoKTtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplciA9IHJlcXVpcmUobW9kdWxlUGF0aCk7XG4gICAgICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkKHtcbiAgICAgICAgbmFtZTogZGVzZXJpYWxpemVyTmFtZSxcbiAgICAgICAgZGVzZXJpYWxpemU6IGRlc2VyaWFsaXplcixcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcblxuY29uc3QgVVBMb2FkZXIgPSB7XG4gIGNvbmZpZyxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICBpbnZhcmlhbnQoIWRpc3Bvc2FibGVzKTtcbiAgICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBMb2FkaW5nIGFsbCBvZiB0aGUgZmVhdHVyZXMsIHRoZW4gYWN0aXZhdGluZyB0aGVtIHdoYXQgQXRvbSBkb2VzIG9uIGluaXQ6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL3YxLjEuMC9zcmMvYXRvbS1lbnZpcm9ubWVudC5jb2ZmZWUjTDYyNS1MNjMxXG4gICAgLy8gaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9QYWNrYWdlTWFuYWdlclxuICAgIGNvbnN0IGxvYWRlZCA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKS5tYXAobmFtZSA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgICBjb25zdCBlbmFibGVkID0gYXRvbS5jb25maWcuZ2V0KGZlYXR1cmUudXNlS2V5UGF0aCk7XG4gICAgICBpZiAoZW5hYmxlZCAmJiAhZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgICAgICAgaWYgKGZlYXR1cmUucGFja2FnZU1vZHVsZS5tYWluTW9kdWxlICYmXG4gICAgICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUubWFpbk1vZHVsZS5jb25maWcpIHtcbiAgICAgICAgICAvLyBGZWF0dXJlIGNvbmZpZyBpcyBoYW5kbGVkIGJ5IHRoZSBVUCBsb2FkZXIsIG5vdCBpbmRpdmlkdWFsIGZlYXR1cmVzXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBcIiR7bmFtZX1cIiBleHBvcnRlZCBhIFwiY29uZmlnXCJgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmVhdHVyZS5wYWNrYWdlTW9kdWxlO1xuICAgICAgfVxuICAgIH0pLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGlmIChudWNsaWRlRmVhdHVyZXMpIHtcbiAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRMb2FkSW5pdGlhbEZlYXR1cmVzKCk7XG4gICAgfVxuXG4gICAgLy8gQWN0aXZhdGUgYWxsIG9mIHRoZSBsb2FkZWQgZmVhdHVyZXMuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL3YxLjEuMC9zcmMvcGFja2FnZS1tYW5hZ2VyLmNvZmZlZSNMNDMxLUw0NDBcbiAgICBQcm9taXNlLmFsbChhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZXMobG9hZGVkKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKG51Y2xpZGVGZWF0dXJlcykge1xuICAgICAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaWRBY3RpdmF0ZUluaXRpYWxGZWF0dXJlcygpO1xuXG4gICAgICAgICAgLy8gTm8gbW9yZSBOdWNsaWRlIGV2ZW50cyB3aWxsIGJlIGZpcmVkLiBEaXNwb3NlIHRoZSBFbWl0dGVyIHRvIHJlbGVhc2VcbiAgICAgICAgICAvLyBtZW1vcnkgYW5kIHRvIGluZm9ybSBmdXR1cmUgY2FsbGVycyB0aGF0IHRoZXkncmUgYXR0ZW1wdGluZyB0byBsaXN0ZW5cbiAgICAgICAgICAvLyB0byBldmVudHMgdGhhdCB3aWxsIG5ldmVyIGZpcmUgYWdhaW4uXG4gICAgICAgICAgbnVjbGlkZUZlYXR1cmVzLmRpc3Bvc2UoKTtcbiAgICAgICAgICBudWNsaWRlRmVhdHVyZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIC8vIFdhdGNoIHRoZSBjb25maWcgdG8gbWFuYWdlIHRvZ2dsaW5nIGZlYXR1cmVzXG4gICAgT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgICBjb25zdCB3YXRjaGVyID0gYXRvbS5jb25maWcub25EaWRDaGFuZ2UoZmVhdHVyZS51c2VLZXlQYXRoLCBldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5uZXdWYWx1ZSA9PT0gdHJ1ZSAmJiAhZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZS5hY3RpdmF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50Lm5ld1ZhbHVlID09PSBmYWxzZSAmJiBmZWF0dXJlLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgICBzYWZlRGVhY3RpdmF0ZShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBkaXNwb3NhYmxlcy5hZGQod2F0Y2hlcik7XG4gICAgfSk7XG5cbiAgICAvLyBJbnN0YWxsIHB1YmxpYywgM3JkLXBhcnR5IEF0b20gcGFja2FnZXMgbGlzdGVkIGluIHRoaXMgcGFja2FnZSdzICdwYWNrYWdlLWRlcHMnIHNldHRpbmcuIFJ1blxuICAgIC8vIHRoaXMgKmFmdGVyKiBvdGhlciBwYWNrYWdlcyBhcmUgYWN0aXZhdGVkIHNvIHRoZXkgY2FuIG1vZGlmeSB0aGlzIHNldHRpbmcgaWYgZGVzaXJlZCBiZWZvcmVcbiAgICAvLyBpbnN0YWxsYXRpb24gaXMgYXR0ZW1wdGVkLlxuICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnaW5zdGFsbFJlY29tbWVuZGVkUGFja2FnZXMnKSB8fCBhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdudWNsaWRlJyk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBpZiAoZmVhdHVyZXNbbmFtZV0ucGFja2FnZU1vZHVsZSkge1xuICAgICAgICBzYWZlRGVhY3RpdmF0ZShuYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZGlzcG9zYWJsZXMpIHtcbiAgICAgIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIGRpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZPUiBURVNUSU5HIFBVUlBPU0VTIE9OTFkhXG4gICAqL1xuICBfX3Rlc3RVc2VPbmx5X2dldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmVhdHVyZXMpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfZ2V0QXZhaWxhYmxlUGFja2FnZVBhdGhzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhmZWF0dXJlcykubWFwKG5hbWUgPT4gZmVhdHVyZXNbbmFtZV0uZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9sb2FkUGFja2FnZShuYW1lKSB7XG4gICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9hY3RpdmF0ZVBhY2thZ2UobmFtZSkge1xuICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2RlYWN0aXZhdGVQYWNrYWdlKG5hbWUpIHtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShuYW1lKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X3JlbW92ZUZlYXR1cmUobmFtZSkge1xuICAgIGRlbGV0ZSBmZWF0dXJlc1tuYW1lXTtcbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVVBMb2FkZXI7XG5cbmZ1bmN0aW9uIHNhZmVEZWFjdGl2YXRlKG5hbWUpIHtcbiAgdHJ5IHtcbiAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKG5hbWUpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBkZWFjdGl2YXRpbmcgXCIke25hbWV9XCJgLCBlcnIpOyAvL2VzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9IGZpbmFsbHkge1xuICAgIGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUgPSBudWxsO1xuICB9XG59XG4iXX0=