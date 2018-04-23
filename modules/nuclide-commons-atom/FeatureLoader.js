'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _idx;














function _load_idx() {return _idx = _interopRequireDefault(require('idx'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _featureConfig;
function _load_featureConfig() {return _featureConfig = _interopRequireDefault(require('./feature-config'));}
var _path2 = _interopRequireDefault(require('path'));var _collection;
function _load_collection() {return _collection = require('nuclide-commons/collection');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


























const ALWAYS_ENABLED = 'always'; // eslint-disable-line rulesdir/prefer-nuclide-uri
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
 */ /* global localStorage */const NEVER_ENABLED = 'never';const DEFAULT = 'default';const { devMode } = atom.getLoadSettings();class FeatureLoader {






  constructor({ features, path: _path, featureGroups }) {this._featureGroupMap = new (_collection || _load_collection()).MultiMap();this._currentPackageState = new Set();
    this._path = _path;
    this._features = features;
    this._loadDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._pkgName = packageNameFromPath(this._path);
    this._featureGroups = featureGroups == null ? {} : featureGroups;

    // Constructs the map from feature groups to features.
    this.constructFeatureGroupMap();
    this._config = {
      use: {
        title: 'Enabled Features',
        description: 'Enable and disable individual features',
        type: 'object',
        collapsed: true,
        properties: {} } };


  }

  // Build the config. Should occur with root package's load
  load() {if (!
    !this._loadDisposable.disposed) {throw new Error('Invariant violation: "!this._loadDisposable.disposed"');}

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
    this._loadDisposable.add(
    atom.deserializers.add({
      name: `${this._pkgName}.ForceMainModuleLoad`,
      deserialize() {} }));



    //
    // Build the "config" object. This determines the config defaults and
    // it's what is shown by the Settings view. It includes:
    // (1) An entry to enable/disable each feature - called "${pkgName}.use.*".
    // (2) Each feature's merged config.
    //
    // https://atom.io/docs/api/latest/Config
    //
    this._features.forEach(feature => {
      const featurePkg = feature.pkg;
      const name = packageNameFromPath(feature.path);

      // Migrate the current feature (from boolean on/off to enumerated states).
      this.migrateFeature(feature);

      const setting = {
        title:
        featurePkg.displayName == null ?
        `Enable the "${name}" feature` :
        `Enable ${featurePkg.displayName}`,
        description: featurePkg.description || '',
        type: 'string',
        enum: [
        { value: ALWAYS_ENABLED, description: 'Always enabled' },
        { value: NEVER_ENABLED, description: 'Never enabled' },
        {
          value: DEFAULT,
          description: 'Only when in an enabled package group' }],


        default: getFeatureDefaultValue(feature) };


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

      this._config.use.properties[name] = setting;

      // Merge in the feature's config
      const featurePkgConfig =
      featurePkg.atomConfig ||
      featurePkg.nuclide && featurePkg.nuclide.config;

      if (featurePkgConfig) {
        this._config[name] = {
          type: 'object',
          title: featurePkg.displayName,
          description: featurePkg.description,
          collapsed: true,
          properties: {} };

        Object.keys(featurePkgConfig).forEach(key => {
          this._config[name].properties[key] = Object.assign({},
          featurePkgConfig[key], {
            title: featurePkgConfig[key].title || key });

        });
      }
    });

    (_featureConfig || _load_featureConfig()).default.setPackageName(this._pkgName);

    // Nesting loads within loads leads to reverse activation order- that is, if
    // the root package loads feature packages, then the feature package activations will
    // happen before the root package's. So we wait until the root package is done loading,
    // but before it activates, to load the features.
    const initialLoadDisposable = atom.packages.onDidLoadPackage(pack => {
      if (pack.name !== this._pkgName) {
        return;
      }

      // Load all the features. This needs to be done during Atom's load phase to
      // make sure that deserializers are registered, etc.
      // https://github.com/atom/atom/blob/v1.1.0/src/atom-environment.coffee#L625-L631
      // https://atom.io/docs/api/latest/PackageManager
      this._features.forEach(feature => {
        if (this.shouldEnable(feature)) {
          atom.packages.loadPackage(feature.path);
        }
      });if (!(

      initialLoadDisposable != null)) {throw new Error('Invariant violation: "initialLoadDisposable != null"');}
      this._loadDisposable.remove(initialLoadDisposable);
      initialLoadDisposable.dispose();
    });

    this._loadDisposable.add(initialLoadDisposable);
  }

  activate() {if (!(
    this._activationDisposable == null)) {throw new Error('Invariant violation: "this._activationDisposable == null"');}
    const rootPackage = atom.packages.getLoadedPackage(this._pkgName);if (!(
    rootPackage != null)) {throw new Error('Invariant violation: "rootPackage != null"');}

    // This is a failsafe in case the `.ForceMainModuleLoad` deserializer
    // defined above does not register in time, or if the defer key has been set
    // w/o our knowledge. This can happen during OSS upgrades.
    localStorage.removeItem(
    rootPackage.getCanDeferMainModuleRequireStorageKey());


    // Hack time!! Atom's repository APIs are synchronous. Any package that tries to use them before
    // we've had a chance to provide our implementation are going to get wrong answers. The correct
    // thing to do would be to always go through an async API that awaits until
    // `atom.packages.onDidActivateInitialPackages()` completes. However, we have some legacy sync
    // codepaths that make that difficult. As a temporary (I hope) workaround, we prioritize
    // activation of the features that provide this service.
    const originalOrder = new Map(
    this._features.map((feature, i) => [feature, i]));

    this._features.sort((a, b) => {
      const aIsRepoProvider = packageIsRepositoryProvider(a.pkg);
      const bIsRepoProvider = packageIsRepositoryProvider(b.pkg);
      if (aIsRepoProvider !== bIsRepoProvider) {
        return aIsRepoProvider ? -1 : 1;
      }
      const aIndex = (0, (_nullthrows || _load_nullthrows()).default)(originalOrder.get(a));
      const bIndex = (0, (_nullthrows || _load_nullthrows()).default)(originalOrder.get(b));
      return aIndex - bIndex;
    });

    this._features.forEach(feature => {
      // Since the migration from bool to enum occurs before the config defaults
      // are changed, the user's config gets filled with every Nuclide feature.
      // Since these values are already the default, this `config.set`
      // removes these uneccessary values from the user's config file.
      // TODO: When enough users have migrated, this should be removed along with the enum migration.
      atom.config.set(
      this.useKeyPathForFeature(feature),
      atom.config.get(this.useKeyPathForFeature(feature)));


      if (this.shouldEnable(feature)) {
        atom.packages.activatePackage(feature.path);
      }
    });

    // Watch the config to manage toggling features
    this._activationDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    atom.config.onDidChange(this.useKeyPath(), event =>
    this.updateActiveFeatures()),

    atom.config.onDidChange(this.useKeyPathForFeatureGroup(), event =>
    this.updateActiveFeatures()));



    this.updateActiveFeatures();
  }

  updateActiveFeatures() {
    const featureState = atom.config.get(this.useKeyPath());
    const featureGroupState = atom.config.get(this.useKeyPathForFeatureGroup());

    // we know featureGroupState must be ?Array, and featureState must
    // be ?Object, since it's in our schema. However, flow thinks it's a mixed type,
    // since it doesn't know about the schema enforcements. $FlowIgnore.
    const desiredState = this.getDesiredState(featureState, featureGroupState);

    // Enable all packages in desiredState but not in currentState.
    // Disable all packages not in desiredState but in currentState.
    for (const feature of desiredState) {
      if (!this._currentPackageState.has(feature)) {
        atom.packages.activatePackage(feature.path);
      }
    }

    for (const feature of this._currentPackageState) {
      if (!desiredState.has(feature)) {
        safeDeactivate(feature);
      }
    }

    this._currentPackageState = desiredState;
  }

  deactivate() {if (!(

    this._activationDisposable && !this._activationDisposable.disposed)) {throw new Error('Invariant violation: "this._activationDisposable && !this._activationDisposable.disposed"');}


    this._features.forEach(feature => {
      // Deactivate the package, but don't serialize. That needs to be done in a separate phase so that
      // we don't end up disconnecting a service and then serializing the disconnected state.
      safeDeactivate(feature, true);
    });if (!

    this._activationDisposable) {throw new Error('Invariant violation: "this._activationDisposable"');} // reasserting for flow
    this._activationDisposable.dispose();
    this._activationDisposable = null;
  }

  getDesiredState(
  featureState,
  featureGroupState)
  {
    // Figure out which features should be enabled:
    //  * Add all packages in nuclide.use
    //  * Remove any feature not in an active featureGroup.
    let groupedPackages;
    if (featureGroupState != null) {
      groupedPackages = (0, (_collection || _load_collection()).setUnion)(
      ...featureGroupState.map(featureGroup =>
      this._featureGroupMap.get(featureGroup)));


    } else {
      // If featuregroups is empty or undefined, assume all features should be enabled.
      groupedPackages = new Set(this._features);
    }

    // If a feature is "always enabled", it should be on whether or not a feature-group includes it.
    // If a feature is "default", it should be on if and only if a feature-group includes it.
    return new Set(
    this._features.filter(feature => {
      const state = featureState[packageNameFromPath(feature.path)];
      return (
        state === ALWAYS_ENABLED ||
        groupedPackages.has(feature) && state === DEFAULT ||
        state === true);

    }));

  }

  constructFeatureGroupMap() {
    /*
                               * Construct a map from feature name to feature. The _featureGroupMap
                               * must contain the true feature objects, but featureGroups.cson only has
                               * the feature names.
                               */
    const featureMap = new Map();
    this._features.forEach(feature => {
      featureMap.set(_path2.default.basename(feature.path), feature);
    });

    for (const key of Object.keys(this._featureGroups)) {
      if (Array.isArray(this._featureGroups[key])) {
        const featuresForKey = this._featureGroups[key].
        map(featureName => featureMap.get(featureName)).
        filter(Boolean);
        if (featuresForKey != null) {
          this._featureGroupMap.set(key, featuresForKey);
        }
      }
    }
  }

  getFeatureGroups() {
    return this._featureGroupMap;
  }

  getConfig() {
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

  useKeyPathForFeature(feature) {
    return `${this._pkgName}.use.${packageNameFromPath(feature.path)}`;
  }

  useKeyPath() {
    return `${this._pkgName}.use`;
  }

  useKeyPathForFeatureGroup() {
    return `${this._pkgName}.enabledFeatureGroups`;
  }

  shouldEnable(feature) {
    const name = packageNameFromPath(feature.path);
    const currentState = atom.config.get(this.useKeyPathForFeature(feature));
    switch (currentState) {
      // Previously, this setting was a boolean. They should be migrated but handle it just in case.
      case true:
      case false:
        return currentState;
      case ALWAYS_ENABLED:
        return true;
      case NEVER_ENABLED:
        return false;
      case DEFAULT:
        // TODO: This will become dependent on project configuration.
        return true;
      default:
        // This default will trigger if the user explicitly
        // sets a package's state to undefined or to a non-enum value.
        // If this is the case, set to false if it begins with sample- and true otherwise.
        return !name.startsWith('sample-');}

  }

  migrateFeature(feature) {
    const keyPath = this.useKeyPathForFeature(feature);
    const currentState = atom.config.get(keyPath);
    const setTo = this.getValueForFeatureToEnumMigration(currentState, feature);
    if (setTo !== currentState) {
      atom.config.set(keyPath, setTo);
    }
  }

  getValueForFeatureToEnumMigration(
  currentState,
  feature)
  {
    const name = packageNameFromPath(feature.path);

    switch (currentState) {
      case true:
        return name.startsWith('sample-') ? ALWAYS_ENABLED : DEFAULT;
      case false:
        return name.startsWith('sample-') ? DEFAULT : NEVER_ENABLED;
      case ALWAYS_ENABLED:
      case NEVER_ENABLED:
      case DEFAULT:if (!(
        typeof currentState === 'string')) {throw new Error('Invariant violation: "typeof currentState === \'string\'"');}
        return currentState;
      default:
        return getFeatureDefaultValue(feature);}

  }}exports.default = FeatureLoader;


function safeDeactivate(
feature,
suppressSerialization = false)
{
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
  return name.startsWith('sample-') ? NEVER_ENABLED : DEFAULT;
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
}

// this could be inlined into its use above, but this makes the intent more
// explicit, and unifies it in the case this ever needs to change.
function packageNameFromPath(pkgPath) {
  return _path2.default.basename(pkgPath);
}

function packageIsRepositoryProvider(pkg) {var _ref, _ref2;
  return Boolean((_ref = pkg) != null ? (_ref2 = _ref.providedServices) != null ? _ref2['atom.repository-provider'] : _ref2 : _ref);
}