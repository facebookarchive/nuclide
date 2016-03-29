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

var featureConfig = require('../pkg/nuclide-feature-config');
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
fs.readdirSync(FEATURES_DIR).forEach(function (item) {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  var dirname = path.join(FEATURES_DIR, item);
  var filename = path.join(dirname, 'package.json');
  try {
    var stat = fs.statSync(filename);
    invariant(stat.isFile());
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return;
    }
  }
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
});

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
//# sourceMappingURL=data:application/json;base64,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RTtBQUM5QixRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDbkQ7O0FBRUQsK0JBQTZCLEVBQUEsdUNBQUMsSUFBSSxFQUFFO0FBQ2xDLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixXQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN2RDs7QUFFRCxpQ0FBK0IsRUFBQSx5Q0FBQyxJQUFJLEVBQUU7QUFDcEMsV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzlDOztBQUVELDZCQUEyQixFQUFBLHFDQUFDLElBQUksRUFBRTtBQUNoQyxXQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2QjtDQUNGLENBQUM7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7O0FBRTFCLFNBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixNQUFJO0FBQ0YsUUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2QyxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osV0FBTyxDQUFDLEtBQUssMEJBQXdCLElBQUksUUFBSyxHQUFHLENBQUMsQ0FBQztHQUNwRCxTQUFTO0FBQ1IsWUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7R0FDckM7Q0FDRiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAbm9mbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqICAgICAgICAgICAgICAgICAgXyAgXyBfICBfIF9fX18gXyAgICBfIF9fXyAgX19fX1xuICogICAgICAgICAgICAgICAgICB8XFwgfCB8ICB8IHwgICAgfCAgICB8IHwgIFxcIHxfX19cbiAqICAgICAgICAgICAgICAgICAgfCBcXHwgfF9ffCB8X19fIHxfX18gfCB8X18vIHxfX19cbiAqIF8gIF8gXyAgXyBfIF9fX18gXyBfX19fIF9fXyAgICAgX19fICBfX19fIF9fX18gXyAgXyBfX19fIF9fX18gX19fX1xuICogfCAgfCB8XFwgfCB8IHxfX18gfCB8X19fIHwgIFxcICAgIHxfX10gfF9ffCB8ICAgIHxfLyAgfF9ffCB8IF9fIHxfX19cbiAqIHxfX3wgfCBcXHwgfCB8ICAgIHwgfF9fXyB8X18vICAgIHwgICAgfCAgfCB8X19fIHwgXFxfIHwgIHwgfF9fXSB8X19fXG4gKlxuICovXG5cbmlmICh0eXBlb2YgYXRvbSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGlzIGFuIEF0b20gcGFja2FnZS4gRGlkIHlvdSBtZWFuIHRvIHJ1biB0aGUgc2VydmVyPycpO1xufVxuXG5jb25zdCBmZWF0dXJlQ29uZmlnID0gcmVxdWlyZSgnLi4vcGtnL251Y2xpZGUtZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xubGV0IG51Y2xpZGVGZWF0dXJlcyA9IHJlcXVpcmUoJy4vbnVjbGlkZUZlYXR1cmVzJyk7XG5jb25zdCBudWNsaWRlTWlncmF0aW9ucyA9IHJlcXVpcmUoJy4vbnVjbGlkZU1pZ3JhdGlvbnMnKTtcbmNvbnN0IG51Y2xpZGVVbmluc3RhbGxlciA9IHJlcXVpcmUoJy4vbnVjbGlkZVVuaW5zdGFsbGVyJyk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgdGVtcCA9IHJlcXVpcmUoJ3RlbXAnKS50cmFjaygpO1xuXG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbi8vIElmIHdlIGFyZSBpbiBhIHRlc3RpbmcgZW52aXJvbm1lbnQgdGhlbiB3ZSB3YW50IHRvIHVzZSBhIGRlZmF1bHQgYXRvbSBjb25maWcuXG5pZiAoYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgY29uc3QgdGVtcERpclBhdGggPSB0ZW1wLm1rZGlyU3luYygnYXRvbV9ob21lJyk7XG4gIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggPSB0ZW1wRGlyUGF0aDtcbiAgYXRvbS5jb25maWcuY29uZmlnRmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcERpclBhdGgsICdjb25maWcuY3NvbicpO1xufVxuXG4vLyBFeHBvcnRlZCBcImNvbmZpZ1wiIG9iamVjdFxuY29uc3QgY29uZmlnID0ge1xuICBpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlczoge1xuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ09uIHN0YXJ0IHVwLCBjaGVjayBmb3IgYW5kIGluc3RhbGwgQXRvbSBwYWNrYWdlcyByZWNvbW1lbmRlZCBmb3IgdXNlIHdpdGggTnVjbGlkZS4gVGhlJ1xuICAgICAgKyAnIGxpc3Qgb2YgcGFja2FnZXMgY2FuIGJlIGZvdW5kIGluIHRoZSA8Y29kZT5wYWNrYWdlLWRlcHM8L2NvZGU+IHNldHRpbmcgaW4gdGhpcyBwYWNrYWdlXFwncydcbiAgICAgICsgJyBcInBhY2thZ2UuanNvblwiIGZpbGUuIERpc2FibGluZyB0aGlzIHNldHRpbmcgd2lsbCBub3QgdW5pbnN0YWxsIHBhY2thZ2VzIGl0IHByZXZpb3VzbHknXG4gICAgICArICcgaW5zdGFsbGVkLiBSZXN0YXJ0IEF0b20gYWZ0ZXIgY2hhbmdpbmcgdGhpcyBzZXR0aW5nIGZvciBpdCB0byB0YWtlIGVmZmVjdC4nLFxuICAgIHRpdGxlOiAnSW5zdGFsbCBSZWNvbW1lbmRlZCBQYWNrYWdlcyBvbiBTdGFydHVwJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG4gIHVzZToge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHt9LFxuICB9LFxufTtcblxuLy8gTnVjbGlkZSBwYWNrYWdlcyBmb3IgQXRvbSBhcmUgY2FsbGVkIFwiZmVhdHVyZXNcIlxuY29uc3QgRkVBVFVSRVNfRElSID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BrZycpO1xuY29uc3QgZmVhdHVyZXMgPSB7fTtcblxubGV0IGRpc3Bvc2FibGVzO1xuXG4vKipcbiAqIEdldCB0aGUgXCJwYWNrYWdlLmpzb25cIiBvZiBhbGwgdGhlIGZlYXR1cmVzLlxuICovXG5mcy5yZWFkZGlyU3luYyhGRUFUVVJFU19ESVIpLmZvckVhY2goaXRlbSA9PiB7XG4gIC8vIE9wdGltaXphdGlvbjogT3VyIGRpcmVjdG9yaWVzIGRvbid0IGhhdmUgcGVyaW9kcyAtIHRoaXMgbXVzdCBiZSBhIGZpbGVcbiAgaWYgKGl0ZW0uaW5kZXhPZignLicpICE9PSAtMSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkaXJuYW1lID0gcGF0aC5qb2luKEZFQVRVUkVTX0RJUiwgaXRlbSk7XG4gIGNvbnN0IGZpbGVuYW1lID0gcGF0aC5qb2luKGRpcm5hbWUsICdwYWNrYWdlLmpzb24nKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZW5hbWUpO1xuICAgIGludmFyaWFudChzdGF0LmlzRmlsZSgpKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyciAmJiBlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgY29uc3Qgc3JjID0gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCAndXRmOCcpO1xuICAvLyBPcHRpbWl6YXRpb246IEF2b2lkIEpTT04gcGFyc2luZyBpZiBpdCBjYW4ndCByZWFzb25hYmx5IGJlIGFuIEF0b20gcGFja2FnZVxuICBpZiAoc3JjLmluZGV4T2YoJ1wiQXRvbVwiJykgPT09IC0xKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHBrZyA9IEpTT04ucGFyc2Uoc3JjKTtcbiAgaWYgKHBrZy5udWNsaWRlICYmIHBrZy5udWNsaWRlLnBhY2thZ2VUeXBlID09PSAnQXRvbScpIHtcbiAgICBpbnZhcmlhbnQocGtnLm5hbWUpO1xuICAgIGZlYXR1cmVzW3BrZy5uYW1lXSA9IHtcbiAgICAgIHBrZyxcbiAgICAgIGRpcm5hbWUsXG4gICAgICB1c2VLZXlQYXRoOiBgbnVjbGlkZS51c2UuJHtwa2cubmFtZX1gLFxuICAgICAgcGFja2FnZU1vZHVsZTogbnVsbCxcbiAgICB9O1xuICB9XG59KTtcblxuLyoqXG4gKiBNaWdyYXRlIHVzZXJzIG9mIG91dGRhdGVkIE51Y2xpZGUgcGFja2FnZXMgdG8gdGhlIE51Y2xpZGUgVW5pZmllZCBQYWNrYWdlLlxuICpcbiAqIC0gTWlncmF0ZSBzZXR0aW5ncyB0byB0aGVpciBuZXcga2V5cyBpbiB0aGUgJ251Y2xpZGUuJyBuYW1lc3BhY2UgaWYgbmVjZXNzYXJ5LlxuICogLSBEaXNhYmxlIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIHJlcGxhY2VkIGJ5IHRoZSAnbnVjbGlkZScgcGFja2FnZS5cbiAqL1xubnVjbGlkZU1pZ3JhdGlvbnMubWlncmF0ZUNvbmZpZygpO1xubnVjbGlkZVVuaW5zdGFsbGVyLmRpc2FibGVPdXRkYXRlZFBhY2thZ2VzKCk7XG5cbi8qKlxuICogQnVpbGQgdGhlIFwiY29uZmlnXCIgb2JqZWN0LiBUaGlzIGRldGVybWluZXMgdGhlIGNvbmZpZyBkZWZhdWx0cyBhbmRcbiAqIGl0J3Mgd2hhdCBpcyBzaG93biBieSB0aGUgU2V0dGluZ3Mgdmlldy4gSXQgaW5jbHVkZXM6XG4gKiAoMSkgQW4gZW50cnkgdG8gZW5hYmxlL2Rpc2FibGUgZWFjaCBmZWF0dXJlIC0gY2FsbGVkIFwibnVjbGlkZS51c2UuKlwiLlxuICogKDIpIEVhY2ggZmVhdHVyZSdzIG1lcmdlZCBjb25maWcuXG4gKlxuICogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9Db25maWdcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2d9ID0gZmVhdHVyZXNbbmFtZV07XG5cbiAgLy8gU2FtcGxlIHBhY2thZ2VzIGFyZSBkaXNhYmxlZCBieSBkZWZhdWx0LiBUaGV5IGFyZSBtZWFudCBmb3IgZGV2ZWxvcG1lbnRcbiAgLy8gdXNlIG9ubHksIGFuZCBhcmVuJ3QgaW5jbHVkZWQgaW4gTnVjbGlkZSBidWlsZHMuXG4gIGNvbnN0IGVuYWJsZWQgPSAhbmFtZS5zdGFydHNXaXRoKCdzYW1wbGUtJyk7XG5cbiAgLy8gRW50cnkgZm9yIGVuYWJsaW5nL2Rpc2FibGluZyB0aGUgZmVhdHVyZVxuICBjb25zdCBzZXR0aW5nID0ge1xuICAgIHRpdGxlOiBgRW5hYmxlIHRoZSBcIiR7bmFtZX1cIiBmZWF0dXJlYCxcbiAgICBkZXNjcmlwdGlvbjogcGtnLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBlbmFibGVkLFxuICB9O1xuICBpZiAocGtnLnByb3ZpZGVkU2VydmljZXMpIHtcbiAgICBjb25zdCBwcm92aWRlcyA9IE9iamVjdC5rZXlzKHBrZy5wcm92aWRlZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipQcm92aWRlczoqKiBfJHtwcm92aWRlc31fYDtcbiAgfVxuICBpZiAocGtnLmNvbnN1bWVkU2VydmljZXMpIHtcbiAgICBjb25zdCBjb25zdW1lcyA9IE9iamVjdC5rZXlzKHBrZy5jb25zdW1lZFNlcnZpY2VzKS5qb2luKCcsICcpO1xuICAgIHNldHRpbmcuZGVzY3JpcHRpb24gKz0gYDxici8+KipDb25zdW1lczoqKiBfJHtjb25zdW1lc31fYDtcbiAgfVxuICBjb25maWcudXNlLnByb3BlcnRpZXNbbmFtZV0gPSBzZXR0aW5nO1xuXG4gIC8vIE1lcmdlIGluIHRoZSBmZWF0dXJlJ3MgY29uZmlnXG4gIGNvbnN0IHBrZ0NvbmZpZyA9IHBrZy5udWNsaWRlLmNvbmZpZztcbiAgaWYgKHBrZ0NvbmZpZykge1xuICAgIGNvbmZpZ1tuYW1lXSA9IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhwa2dDb25maWcpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbmZpZ1tuYW1lXS5wcm9wZXJ0aWVzW2tleV0gPSB7XG4gICAgICAgIC4uLnBrZ0NvbmZpZ1trZXldLFxuICAgICAgICB0aXRsZTogKHBrZ0NvbmZpZ1trZXldLnRpdGxlIHx8IGtleSksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59KTtcblxuLyoqXG4gKiBMb2FkIGZlYXR1cmUgZGVzZXJpYWxpemVycyBhbmQgcmVxdWlyZSB0aGVtLlxuICogVGhpcyBpcyBjb21pbmcgaW4gQXRvbSAxLjQuMCAtIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzk5NzRcbiAqL1xuT2JqZWN0LmtleXMoZmVhdHVyZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gIGNvbnN0IHtwa2csIGRpcm5hbWV9ID0gZmVhdHVyZXNbbmFtZV07XG4gIGlmIChwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzKSB7XG4gICAgT2JqZWN0LmtleXMocGtnLm51Y2xpZGUuZGVzZXJpYWxpemVycykuZm9yRWFjaChkZXNlcmlhbGl6ZXJOYW1lID0+IHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplclBhdGggPSBwa2cubnVjbGlkZS5kZXNlcmlhbGl6ZXJzW2Rlc2VyaWFsaXplck5hbWVdO1xuICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IHBhdGguam9pbihkaXJuYW1lLCBkZXNlcmlhbGl6ZXJQYXRoKTtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplciA9IHJlcXVpcmUobW9kdWxlUGF0aCk7XG4gICAgICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkKHtcbiAgICAgICAgbmFtZTogZGVzZXJpYWxpemVyTmFtZSxcbiAgICAgICAgZGVzZXJpYWxpemU6IGRlc2VyaWFsaXplcixcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTtcblxuY29uc3QgVVBMb2FkZXIgPSB7XG4gIGNvbmZpZyxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICBpbnZhcmlhbnQoIWRpc3Bvc2FibGVzKTtcbiAgICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBMb2FkaW5nIGFsbCBvZiB0aGUgZmVhdHVyZXMsIHRoZW4gYWN0aXZhdGluZyB0aGVtIHdoYXQgQXRvbSBkb2VzIG9uIGluaXQ6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9ibG9iL3YxLjEuMC9zcmMvYXRvbS1lbnZpcm9ubWVudC5jb2ZmZWUjTDYyNS1MNjMxXG4gICAgLy8gaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9QYWNrYWdlTWFuYWdlclxuICAgIGNvbnN0IGxvYWRlZCA9IE9iamVjdC5rZXlzKGZlYXR1cmVzKS5tYXAobmFtZSA9PiB7XG4gICAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgICBjb25zdCBlbmFibGVkID0gYXRvbS5jb25maWcuZ2V0KGZlYXR1cmUudXNlS2V5UGF0aCk7XG4gICAgICAvLyBgZW5hYmxlZGAgbWF5IGJlIGB1bmRlZmluZWRgIGlmIGBhdG9tLmNvbmZpZy5nZXRgIGlzIGNhbGxlZCBiZWZvcmUgdGhlXG4gICAgICAvLyB0aGUgZGVmYXVsdCBjb25maWcgaXMgYnVpbHQuIElmIHRoZSBmZWF0dXJlIGlzIGV4cGxpY2l0bHkgZW5hYmxlZCBvclxuICAgICAgLy8gZGlzYWJsZWQsIHRoZW4gdGhlIGNvbmZpZyB2YWx1ZSB3aWxsIGJlIHNldCByZWdhcmRsZXNzIG9mIHdoZW5cbiAgICAgIC8vIGBhdG9tLmNvbmZpZy5nZXRgIGlzIGNhbGxlZC5cbiAgICAgIGNvbnN0IHNob3VsZEVuYWJsZSA9IHR5cGVvZiBlbmFibGVkID09PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IGNvbmZpZy51c2UucHJvcGVydGllc1tuYW1lXS5lbmFibGVkXG4gICAgICAgIDogZW5hYmxlZDtcbiAgICAgIGlmIChzaG91bGRFbmFibGUgJiYgIWZlYXR1cmUucGFja2FnZU1vZHVsZSkge1xuICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gICAgICAgIGlmIChmZWF0dXJlLnBhY2thZ2VNb2R1bGUubWFpbk1vZHVsZSAmJlxuICAgICAgICAgICAgZmVhdHVyZS5wYWNrYWdlTW9kdWxlLm1haW5Nb2R1bGUuY29uZmlnKSB7XG4gICAgICAgICAgLy8gRmVhdHVyZSBjb25maWcgaXMgaGFuZGxlZCBieSB0aGUgVVAgbG9hZGVyLCBub3QgaW5kaXZpZHVhbCBmZWF0dXJlc1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke25hbWV9XCIgZXhwb3J0ZWQgYSBcImNvbmZpZ1wiYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZlYXR1cmUucGFja2FnZU1vZHVsZTtcbiAgICAgIH1cbiAgICB9KS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICBpZiAobnVjbGlkZUZlYXR1cmVzKSB7XG4gICAgICBudWNsaWRlRmVhdHVyZXMuZGlkTG9hZEluaXRpYWxGZWF0dXJlcygpO1xuICAgIH1cblxuICAgIC8vIEFjdGl2YXRlIGFsbCBvZiB0aGUgbG9hZGVkIGZlYXR1cmVzLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vYmxvYi92MS4xLjAvc3JjL3BhY2thZ2UtbWFuYWdlci5jb2ZmZWUjTDQzMS1MNDQwXG4gICAgUHJvbWlzZS5hbGwoYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2VzKGxvYWRlZCkpXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChudWNsaWRlRmVhdHVyZXMpIHtcbiAgICAgICAgICBudWNsaWRlRmVhdHVyZXMuZGlkQWN0aXZhdGVJbml0aWFsRmVhdHVyZXMoKTtcblxuICAgICAgICAgIC8vIE5vIG1vcmUgTnVjbGlkZSBldmVudHMgd2lsbCBiZSBmaXJlZC4gRGlzcG9zZSB0aGUgRW1pdHRlciB0byByZWxlYXNlXG4gICAgICAgICAgLy8gbWVtb3J5IGFuZCB0byBpbmZvcm0gZnV0dXJlIGNhbGxlcnMgdGhhdCB0aGV5J3JlIGF0dGVtcHRpbmcgdG8gbGlzdGVuXG4gICAgICAgICAgLy8gdG8gZXZlbnRzIHRoYXQgd2lsbCBuZXZlciBmaXJlIGFnYWluLlxuICAgICAgICAgIG51Y2xpZGVGZWF0dXJlcy5kaXNwb3NlKCk7XG4gICAgICAgICAgbnVjbGlkZUZlYXR1cmVzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAvLyBXYXRjaCB0aGUgY29uZmlnIHRvIG1hbmFnZSB0b2dnbGluZyBmZWF0dXJlc1xuICAgIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgZmVhdHVyZSA9IGZlYXR1cmVzW25hbWVdO1xuICAgICAgY29uc3Qgd2F0Y2hlciA9IGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKGZlYXR1cmUudXNlS2V5UGF0aCwgZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQubmV3VmFsdWUgPT09IHRydWUgJiYgIWZlYXR1cmUucGFja2FnZU1vZHVsZSkge1xuICAgICAgICAgIGZlYXR1cmUucGFja2FnZU1vZHVsZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoZmVhdHVyZS5kaXJuYW1lKTtcbiAgICAgICAgICBmZWF0dXJlLnBhY2thZ2VNb2R1bGUuYWN0aXZhdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5uZXdWYWx1ZSA9PT0gZmFsc2UgJiYgZmVhdHVyZS5wYWNrYWdlTW9kdWxlKSB7XG4gICAgICAgICAgc2FmZURlYWN0aXZhdGUobmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGlzcG9zYWJsZXMuYWRkKHdhdGNoZXIpO1xuICAgIH0pO1xuXG4gICAgLy8gSW5zdGFsbCBwdWJsaWMsIDNyZC1wYXJ0eSBBdG9tIHBhY2thZ2VzIGxpc3RlZCBpbiB0aGlzIHBhY2thZ2UncyAncGFja2FnZS1kZXBzJyBzZXR0aW5nLiBSdW5cbiAgICAvLyB0aGlzICphZnRlciogb3RoZXIgcGFja2FnZXMgYXJlIGFjdGl2YXRlZCBzbyB0aGV5IGNhbiBtb2RpZnkgdGhpcyBzZXR0aW5nIGlmIGRlc2lyZWQgYmVmb3JlXG4gICAgLy8gaW5zdGFsbGF0aW9uIGlzIGF0dGVtcHRlZC5cbiAgICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoJ2luc3RhbGxSZWNvbW1lbmRlZFBhY2thZ2VzJykgfHwgYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbnVjbGlkZScpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIE9iamVjdC5rZXlzKGZlYXR1cmVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgaWYgKGZlYXR1cmVzW25hbWVdLnBhY2thZ2VNb2R1bGUpIHtcbiAgICAgICAgc2FmZURlYWN0aXZhdGUobmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGRpc3Bvc2FibGVzKSB7XG4gICAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICBkaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGT1IgVEVTVElORyBQVVJQT1NFUyBPTkxZIVxuICAgKi9cbiAgX190ZXN0VXNlT25seV9nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZlYXR1cmVzKTtcbiAgfSxcblxuICBfX3Rlc3RVc2VPbmx5X2dldEF2YWlsYWJsZVBhY2thZ2VQYXRocygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZmVhdHVyZXMpLm1hcChuYW1lID0+IGZlYXR1cmVzW25hbWVdLmRpcm5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfbG9hZFBhY2thZ2UobmFtZSkge1xuICAgIGNvbnN0IGZlYXR1cmUgPSBmZWF0dXJlc1tuYW1lXTtcbiAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShmZWF0dXJlLmRpcm5hbWUpO1xuICB9LFxuXG4gIF9fdGVzdFVzZU9ubHlfYWN0aXZhdGVQYWNrYWdlKG5hbWUpIHtcbiAgICBjb25zdCBmZWF0dXJlID0gZmVhdHVyZXNbbmFtZV07XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKGZlYXR1cmUuZGlybmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9kZWFjdGl2YXRlUGFja2FnZShuYW1lKSB7XG4gICAgcmV0dXJuIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSk7XG4gIH0sXG5cbiAgX190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlKG5hbWUpIHtcbiAgICBkZWxldGUgZmVhdHVyZXNbbmFtZV07XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVQTG9hZGVyO1xuXG5mdW5jdGlvbiBzYWZlRGVhY3RpdmF0ZShuYW1lKSB7XG4gIHRyeSB7XG4gICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShuYW1lKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgZGVhY3RpdmF0aW5nIFwiJHtuYW1lfVwiYCwgZXJyKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgfSBmaW5hbGx5IHtcbiAgICBmZWF0dXJlc1tuYW1lXS5wYWNrYWdlTW9kdWxlID0gbnVsbDtcbiAgfVxufVxuIl19