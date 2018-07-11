"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.INITIAL_FEATURE_GROUP = exports.REQUIRED_FEATURE_GROUP = void 0;

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _activatePackages() {
  const data = _interopRequireDefault(require("./experimental-packages/activatePackages"));

  _activatePackages = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("./feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

var _path2 = _interopRequireDefault(require("path"));

function _collection() {
  const data = require("../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/* global localStorage */
// eslint-disable-line nuclide-internal/prefer-nuclide-uri
const ALWAYS_ENABLED = 'always';
const NEVER_ENABLED = 'never';
const DEFAULT = 'default';
const {
  devMode
} = atom.getLoadSettings();
const REQUIRED_FEATURE_GROUP = 'nuclide-required';
exports.REQUIRED_FEATURE_GROUP = REQUIRED_FEATURE_GROUP;
const INITIAL_FEATURE_GROUP = 'nuclide-core';
exports.INITIAL_FEATURE_GROUP = INITIAL_FEATURE_GROUP;

class FeatureLoader {
  constructor({
    features,
    path: _path,
    featureGroups
  }) {
    this._deferringFeatureActivation = true;
    this._currentlyActiveFeatures = new Set();
    this._path = _path;
    this._features = reorderFeatures(features);
    this._loadDisposable = new (_UniversalDisposable().default)();
    this._pkgName = packageNameFromPath(this._path);
    this._featureGroups = groupFeatures(this._features, featureGroups == null ? {} : featureGroups);
  } // Build the config. Should occur with root package's load


  load() {
    if (!!this._loadDisposable.disposed) {
      throw new Error("Invariant violation: \"!this._loadDisposable.disposed\"");
    }

    patchPackageManager(); // Add a dummy deserializer. This forces Atom to load Nuclide's main module
    // (this file) when the package is loaded, which is super important because
    // this module loads all of the Nuclide features. We could accomplish the same
    // thing by unsetting [the local storage value][1] that Atom uses to indicate
    // whether the main module load can be deferred, however, that would mean that
    // (for a brief time, at least), the flag would be set. If there were an error
    // during that time and we never got a chance to unset the flag, Nuclide
    // features would never load again!
    //
    // [1] https://github.com/atom/atom/blob/v1.9.8/src/package.coffee#L442

    this._loadDisposable.add(atom.deserializers.add({
      name: `${this._pkgName}.ForceMainModuleLoad`,

      deserialize() {}

    }));

    _featureConfig().default.setPackageName(this._pkgName); //
    // Build the "config" object. This determines the config defaults and
    // it's what is shown by the Settings view. It includes:
    // (1) An entry to enable/disable each feature - called "${pkgName}.use.*".
    // (2) Each feature's merged config.
    //
    // https://atom.io/docs/api/latest/Config
    //


    this._config = buildConfig(this._features); // Load enabled features. This needs to be done during Atom's load phase to
    // make sure that deserializers are registered, etc.
    // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
    // https://atom.io/docs/api/latest/PackageManager

    const featuresToLoad = this.getEnabledFeatures();

    this._loadDisposable.add( // Nesting loads within loads leads to reverse activation order- that is, if
    // the root package loads feature packages, then the feature package activations will
    // happen before the root package's. So we wait until the root package is done loading,
    // but before it activates, to load the features.
    didLoadPackage(this._pkgName).subscribe(() => {
      // Load "regular" feature packages.
      featuresToLoad.forEach(feature => {
        atom.packages.loadPackage(feature.path);
      });
    }), // Load "experimental" format packages.
    didLoadPackage(this._pkgName).switchMap(() => _RxMin.Observable.create(() => new (_UniversalDisposable().default)((0, _activatePackages().default)([...featuresToLoad])))).subscribe());

    const featureNames = new Set(this._features.map(feature => feature.pkg.name)); // Ensure that the root package is initialized before all of its features. This is important
    // because the root package defines the config for all managed features and we need to make
    // sure that it's present before they're initialized (i.e. before their deserializers are
    // called).
    // $FlowIssue: Need to upstream this.

    const onWillInitializePackageDisposable = atom.packages.onWillInitializePackage(pack => {
      if (featureNames.has(pack.name)) {
        onWillInitializePackageDisposable.dispose();
        const rootPackage = atom.packages.getLoadedPackage(this._pkgName);
        (0, _nullthrows().default)(rootPackage).initializeIfNeeded();
      }
    });

    this._loadDisposable.add(onWillInitializePackageDisposable); // Clean up when the package is unloaded.


    this._loadDisposable.add(atom.packages.onDidUnloadPackage(pack => {
      if (pack.name === this._pkgName) {
        this._loadDisposable.dispose();
      }
    }));
  }

  activate() {
    if (!(this._activationDisposable == null)) {
      throw new Error("Invariant violation: \"this._activationDisposable == null\"");
    }

    const rootPackage = atom.packages.getLoadedPackage(this._pkgName);

    if (!(rootPackage != null)) {
      throw new Error("Invariant violation: \"rootPackage != null\"");
    } // This is a failsafe in case the `.ForceMainModuleLoad` deserializer
    // defined above does not register in time, or if the defer key has been set
    // w/o our knowledge. This can happen during OSS upgrades.


    localStorage.removeItem(rootPackage.getCanDeferMainModuleRequireStorageKey());
    this.updateActiveFeatures(); // Watch things that should trigger reevaluation of active features. Note that we do this
    // *after* the initial `updateActiveFeatures()` call because that could trigger one of these
    // events.

    this._activationDisposable = new (_UniversalDisposable().default)(atom.config.onDidChange(this.getUseKeyPath(), () => {
      this.updateActiveFeatures();
    }), atom.config.onDidChange(this.getEnabledFeatureGroupsKeyPath(), () => {
      this.updateActiveFeatures();
    }), _RxMin.Observable.merge(didAddFirstPath, didAddFirstTextEditor).take(1).subscribe(() => {
      // Hopefully we've opened a project so we don't have to load all the features.
      this._deferringFeatureActivation = false;
      this.updateActiveFeatures();
    }));
  }

  updateActiveFeatures() {
    // `updateActiveFeatures()` can't be called recursively. If it is, just warn and bail.
    if (this._featureBeingActivated != null) {
      // eslint-disable-next-line no-console
      console.warn(`Activating ${this._featureBeingActivated.pkg.name} caused a` + ' reevaluation of active features.');
      return;
    }

    if (this._featureBeingDeactivated != null) {
      // eslint-disable-next-line no-console
      console.warn(`Deactivating ${this._featureBeingDeactivated.pkg.name} caused a` + ' reevaluation of active features.');
      return;
    }

    this.updateActiveFeaturesNow();
  }
  /**
   * Enable and disable the correct features according to the current configuration.
   */


  updateActiveFeaturesNow() {
    const enabledFeatures = this.getEnabledFeatures();
    const featuresToActivate = (0, _collection().setUnion)(this._featureGroups.get(REQUIRED_FEATURE_GROUP), this._deferringFeatureActivation ? (0, _collection().setIntersect)(enabledFeatures, this._featureGroups.get(INITIAL_FEATURE_GROUP)) : enabledFeatures); // Enable all packages in featuresToActivate but not in currentState.
    // Disable all packages not in featuresToActivate but in currentState.

    for (const feature of featuresToActivate) {
      if (!this._currentlyActiveFeatures.has(feature)) {
        this._featureBeingActivated = feature;
        atom.packages.activatePackage(feature.path);
        this._featureBeingActivated = null;
      }
    }

    for (const feature of this._currentlyActiveFeatures) {
      if (!featuresToActivate.has(feature)) {
        this._featureBeingDeactivated = feature;
        safeDeactivate(feature);
        this._featureBeingDeactivated = null;
      }
    }

    this._currentlyActiveFeatures = featuresToActivate;
  }

  deactivate() {
    if (!(this._activationDisposable && !this._activationDisposable.disposed)) {
      throw new Error("Invariant violation: \"this._activationDisposable && !this._activationDisposable.disposed\"");
    }

    this._currentlyActiveFeatures.forEach(feature => {
      // Deactivate the package, but don't serialize. That needs to be done in a separate phase so that
      // we don't end up disconnecting a service and then serializing the disconnected state.
      safeDeactivate(feature, true);
    });

    this._currentlyActiveFeatures = new Set();

    if (!this._activationDisposable) {
      throw new Error("Invariant violation: \"this._activationDisposable\"");
    } // reasserting for flow


    this._activationDisposable.dispose();

    this._activationDisposable = null;
  }
  /**
   * Determine which features are enabled based on the current state of the configuration. This set
   * is then used to load and activate the features.
   */


  getEnabledFeatures() {
    // we know enabledFeatureGroups must be ?Array, and useFeatureRules must be ?UseFeatureRules,
    // since it's in our schema. However, flow thinks it's a mixed type, since it doesn't know about
    const useFeatureRules = atom.config.get(this.getUseKeyPath());
    const enabledFeatureGroups = atom.config.get(this.getEnabledFeatureGroupsKeyPath());
    const featuresInEnabledGroups = enabledFeatureGroups == null ? new Set(this._features) // If featuregroups is undefined, assume all features should be enabled.
    : (0, _collection().setUnion)(...enabledFeatureGroups.map(featureGroup => this._featureGroups.get(featureGroup)));
    const requiredFeatures = this._featureGroups.get(REQUIRED_FEATURE_GROUP) || new Set(); // If a feature is "always enabled", it should be on whether or not a feature-group includes it.
    // If a feature is "default", it should be on if and only if a feature-group includes it.

    return new Set(this._features.filter(feature => {
      var _ref;

      const featureName = packageNameFromPath(feature.path);
      const rawRule = (_ref = useFeatureRules) != null ? _ref[featureName] : _ref;
      const rule = rawRule == null ? getFeatureDefaultValue(feature) : rawRule;
      return rule === ALWAYS_ENABLED || rule === true || featuresInEnabledGroups.has(feature) && rule === DEFAULT || requiredFeatures.has(feature);
    }));
  }

  getConfig() {
    if (!(this._config != null)) {
      throw new Error("Invariant violation: \"this._config != null\"");
    }

    return this._config;
  }

  serialize() {
    // When the root package is serialized, all of its features need to be serialized. This is an abuse of
    // `serialize()` since we're using it to do side effects instead of returning the serialization,
    // but it ensures that serialization of the Atom packages happens at the right point in the
    // package lifecycle. Unfortunately, it also means that Nuclide features will be serialized twice
    // on deactivation.
    this._features.forEach(safeSerialize);
  }

  getUseKeyPath() {
    return `${this._pkgName}.use`;
  }

  getEnabledFeatureGroupsKeyPath() {
    return `${this._pkgName}.enabledFeatureGroups`;
  }

}

exports.default = FeatureLoader;

function safeDeactivate(feature, suppressSerialization = false) {
  const name = packageNameFromPath(feature.path);

  try {
    const pack = atom.packages.getLoadedPackage(name);

    if (pack != null) {
      atom.packages.deactivatePackage(name, suppressSerialization);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error deactivating "${name}": ${err.message}`);
  }
}

function getFeatureDefaultValue(feature) {
  const name = packageNameFromPath(feature.path);
  return name.startsWith('sample-') || name.startsWith('fb-sample-') ? NEVER_ENABLED : DEFAULT;
}

function safeSerialize(feature) {
  const name = packageNameFromPath(feature.path);

  try {
    const pack = atom.packages.getActivePackage(name);

    if (pack != null) {
      // Serialize the package
      atom.packages.serializePackage(pack);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error serializing "${name}": ${err.message}`);
  }
} // this could be inlined into its use above, but this makes the intent more
// explicit, and unifies it in the case this ever needs to change.


function packageNameFromPath(pkgPath) {
  return _path2.default.basename(pkgPath);
}

function packageIsRepositoryProvider(pkg) {
  var _ref2;

  return Boolean((_ref2 = pkg) != null ? (_ref2 = _ref2.providedServices) != null ? _ref2['atom.repository-provider'] : _ref2 : _ref2);
}

function buildConfig(features) {
  const config = {
    use: {
      title: 'Enabled Features',
      description: 'Enable and disable individual features',
      type: 'object',
      collapsed: true,
      properties: {}
    }
  };
  features.forEach(feature => {
    const featurePkg = feature.pkg;
    const name = packageNameFromPath(feature.path);
    const setting = {
      title: featurePkg.displayName == null ? `Enable the "${name}" feature` : `Enable ${featurePkg.displayName}`,
      description: featurePkg.description || '',
      type: 'string',
      enum: [{
        value: ALWAYS_ENABLED,
        description: 'Always enabled'
      }, {
        value: NEVER_ENABLED,
        description: 'Never enabled'
      }, {
        value: DEFAULT,
        description: 'Only when in an enabled package group'
      }],
      default: getFeatureDefaultValue(feature)
    };

    if (devMode) {
      if (featurePkg.providedServices) {
        const provides = Object.keys(featurePkg.providedServices).join(', ');
        setting.description += `<br/>**Provides:** _${provides}_`;
      }

      if (featurePkg.consumedServices) {
        const consumes = Object.keys(featurePkg.consumedServices).join(', ');
        setting.description += `<br/>**Consumes:** _${consumes}_`;
      }
    }

    config.use.properties[name] = setting; // Merge in the feature's config

    const featurePkgConfig = featurePkg.atomConfig || featurePkg.nuclide && featurePkg.nuclide.config;

    if (featurePkgConfig) {
      config[name] = {
        type: 'object',
        title: featurePkg.displayName,
        description: featurePkg.description,
        collapsed: true,
        properties: {}
      };
      Object.keys(featurePkgConfig).forEach(key => {
        config[name].properties[key] = Object.assign({}, featurePkgConfig[key], {
          title: featurePkgConfig[key].title || key
        });
      });
    }
  });
  return config;
}
/**
 * Hack time!! Atom's repository APIs are synchronous. Any package that tries to use them before
 * we've had a chance to provide our implementation are going to get wrong answers. The correct
 * thing to do would be to always go through an async API that awaits until
 * `atom.packages.onDidActivateInitialPackages()` completes. However, we have some legacy sync
 * codepaths that make that difficult. As a temporary (I hope) workaround, we prioritize
 * activation of the features that provide this service.
 */


function reorderFeatures(features_) {
  const features = features_.slice();
  const originalOrder = new Map(features.map((feature, i) => [feature, i]));
  features.sort((a, b) => {
    const aIsRepoProvider = packageIsRepositoryProvider(a.pkg);
    const bIsRepoProvider = packageIsRepositoryProvider(b.pkg);

    if (aIsRepoProvider !== bIsRepoProvider) {
      return aIsRepoProvider ? -1 : 1;
    }

    const aIndex = (0, _nullthrows().default)(originalOrder.get(a));
    const bIndex = (0, _nullthrows().default)(originalOrder.get(b));
    return aIndex - bIndex;
  });
  return features;
}
/**
 * Construct a map whose keys are feature group names and values are sets of features belonging to
 * the group.
 */


function groupFeatures(features, rawFeatureGroups) {
  const namesToFeatures = new Map();
  features.forEach(feature => {
    namesToFeatures.set(_path2.default.basename(feature.path), feature);
  });
  const featureGroups = new (_collection().MultiMap)();

  for (const key of Object.keys(rawFeatureGroups)) {
    if (Array.isArray(rawFeatureGroups[key])) {
      const featuresForKey = rawFeatureGroups[key].map(featureName => namesToFeatures.get(featureName)).filter(Boolean);

      if (featuresForKey != null) {
        featureGroups.set(key, featuresForKey);
      }
    }
  }

  return featureGroups;
}
/**
 * Patch the package manager and packages to (1) implement `onWillInitializePackage` and (2) call
 * `registerConfigSchemaFromMainModule()` when a package is initialized (to guarantee its config
 * schema is ready when its deserializers are called). This should be removed once these changes
 * are upstreamed.
 */


function patchPackageManager() {
  if (atom.packages.onWillInitializePackage == null && !atom.packages.__onWillInitializePackagePatched) {
    atom.packages.onWillInitializePackage = function (callback) {
      atom.packages.__onWillInitializePackagePatched = true;
      return this.emitter.on('will-initialize-package', callback);
    };
  }

  if (!atom.packages.__packageLookupPatched) {
    atom.packages.__packageLookupPatched = true;
    const loadPackage = atom.packages.loadPackage;

    atom.packages.loadPackage = function (nameOrPath, ...args) {
      const pack = loadPackage.call(this, nameOrPath, ...args);

      if (pack == null) {
        return null;
      }

      patchPackage(pack);
      return pack;
    };

    const getLoadedPackage = atom.packages.getLoadedPackage;

    atom.packages.getLoadedPackage = function (name, ...args) {
      const pack = getLoadedPackage.call(this, name, ...args);

      if (pack == null) {
        return null;
      }

      patchPackage(pack);
      return pack;
    };
  }
}

function patchPackage(pack) {
  if (pack.__initializeIfNeededPatched) {
    return;
  }

  pack.__initializeIfNeededPatched = true;
  const initializeIfNeeded = pack.initializeIfNeeded;

  pack.initializeIfNeeded = function () {
    if (this.mainInitialized) {
      return;
    }

    if (atom.packages.__onWillInitializePackagePatched) {
      // If we didn't apply our patch for this, Atom is already dispatching the event.
      atom.packages.emitter.emit('will-initialize-package', pack);
    }

    this.registerConfigSchemaFromMainModule();
    return initializeIfNeeded.call(this);
  };
}

const didLoadPackage = pkgName => (0, _event().observableFromSubscribeFunction)(cb => atom.packages.onDidLoadPackage(cb)).startWith(null).filter(() => atom.packages.getLoadedPackage(pkgName) != null).take(1);

const didAddFirstPath = (0, _event().observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).startWith(null).filter(() => atom.project.getDirectories().length > 0).take(1);
const didAddFirstTextEditor = (0, _event().observableFromSubscribeFunction)(cb => atom.workspace.getCenter().onDidAddTextEditor(cb)).startWith(null).filter(() => atom.workspace.getCenter().getTextEditors().length > 0).take(1);