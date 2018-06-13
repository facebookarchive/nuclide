'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleURI = exports.serialize = exports.deactivate = exports.activate = exports.config = undefined;

var _monkeyPatchProjectConfigs;

function _load_monkeyPatchProjectConfigs() {
  return _monkeyPatchProjectConfigs = _interopRequireDefault(require('./monkeyPatchProjectConfigs'));
}

require('./preload-dependencies');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../modules/nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('../modules/nuclide-commons/promise');
}

var _FeatureLoader;

function _load_FeatureLoader() {
  return _FeatureLoader = _interopRequireDefault(require('../modules/nuclide-commons-atom/FeatureLoader'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../modules/nuclide-commons-atom/feature-config'));
}

var _fs = _interopRequireDefault(require('fs'));

var _electron = _interopRequireDefault(require('electron'));

var _path = _interopRequireDefault(require('path'));

var _atomPackageDeps;

function _load_atomPackageDeps() {
  return _atomPackageDeps = require('atom-package-deps');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _semver;

function _load_semver() {
  return _semver = _interopRequireDefault(require('semver'));
}

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _installErrorReporter;

function _load_installErrorReporter() {
  return _installErrorReporter = _interopRequireDefault(require('./installErrorReporter'));
}

var _installDevTools;

function _load_installDevTools() {
  return _installDevTools = _interopRequireDefault(require('./installDevTools'));
}

var _package;

function _load_package() {
  return _package = _interopRequireDefault(require('../package.json'));
}

var _deepLink;

function _load_deepLink() {
  return _deepLink = require('../pkg/commons-atom/deep-link');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../pkg/nuclide-logging');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../modules/nuclide-commons/UniversalDisposable'));
}

var _featureGroups;

function _load_featureGroups() {
  return _featureGroups = _interopRequireDefault(require('./featureGroups.json'));
}

var _dompurify;

function _load_dompurify() {
  return _dompurify = _interopRequireDefault(require('dompurify'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Monkeypatch project APIs into Atom. This can be removed after this functionality has been
// upstreamed, i.e. when `atom.project.replace()` and `atom.project.getSpecification()` are
// available.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
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

(0, (_monkeyPatchProjectConfigs || _load_monkeyPatchProjectConfigs()).default)();
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri


let featureGroups = (_featureGroups || _load_featureGroups()).default;
try {
  // $eslint-disable-next-line $FlowFB
  const fbFeatureGroups = require('./fb-featureGroups.json');
  featureGroups = mergeFeatureGroups(featureGroups, fbFeatureGroups);
} catch (e) {}

const domPurify = (0, (_dompurify || _load_dompurify()).default)();

// The minimum version of Atom required to run Nuclide. Anything less than this and users will get
// a redbox and Nuclide will not activate.
const MINIMUM_SUPPORTED_ATOM_VERSION = '1.25.0';

// Install the error reporting even before Nuclide is activated.
let errorReporterDisposable = (0, (_installErrorReporter || _load_installErrorReporter()).default)();
// Install the logger config before Nuclide is activated.
(0, (_nuclideLogging || _load_nuclideLogging()).initializeLogging)();

const { remote } = _electron.default;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const baseConfig = {
  installRecommendedPackages: {
    default: false,
    description: 'On start up, check for and install Atom packages recommended for use with Nuclide. The' + " list of packages can be found in the <code>package-deps</code> setting in this package's" + ' "package.json" file. Disabling this setting will not uninstall packages it previously' + ' installed. Restart Atom after changing this setting for it to take effect.',
    title: 'Install Recommended Packages on Startup',
    type: 'boolean',
    order: 0
  },
  useLocalRpc: {
    default: !atom.inSpecMode(),
    description: 'Use a RPC process for local services. This ensures better compatibility between the local' + ' and remote case and improves local performance. Requires restart to take' + ' effect.',
    title: 'Use RPC for local services.',
    type: 'boolean',
    order: 0
  }
};

// Nuclide packages for Atom are called "features"
const FEATURES_DIR = _path.default.join(__dirname, '../pkg');
const features = [];

/**
 * Get the "package.json" of all the features.
 */
_fs.default.readdirSync(FEATURES_DIR).forEach(item => {
  // Optimization: Our directories don't have periods - this must be a file
  if (item.indexOf('.') !== -1) {
    return;
  }
  const featurePath = _path.default.join(FEATURES_DIR, item);
  const filename = _path.default.join(featurePath, 'package.json');
  let src;
  try {
    src = _fs.default.readFileSync(filename, 'utf8');
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
      return;
    }
    throw err;
  }
  // Optimization: Avoid JSON parsing if it can't reasonably be an Atom package
  if (src.indexOf('"Atom"') === -1) {
    return;
  }
  const pkg = JSON.parse(src);
  if (pkg.nuclide && pkg.nuclide.packageType === 'Atom') {
    if (!pkg.name) {
      throw new Error('Invariant violation: "pkg.name"');
    }

    features.push({
      pkg,
      path: featurePath
    });
  }
});

// atom-ide-ui packages are a lot more consistent.
function addFeature(directory, name) {
  const featurePath = _path.default.join(directory, name);
  const filename = _path.default.join(featurePath, 'package.json');
  try {
    const src = _fs.default.readFileSync(filename, 'utf8');
    const pkg = JSON.parse(src);

    if (!pkg.name) {
      throw new Error('Invariant violation: "pkg.name"');
    }

    features.push({
      pkg,
      path: featurePath
    });
  } catch (err) {
    if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
      throw err;
    }
  }
}

const MODULES_DIR = _path.default.join(__dirname, '../modules');
const ATOM_IDE_DIR = _path.default.join(MODULES_DIR, 'atom-ide-ui/pkg');

_fs.default.readdirSync(ATOM_IDE_DIR).forEach(name => addFeature(ATOM_IDE_DIR, name));
_fs.default.readdirSync(MODULES_DIR).filter(name => name.startsWith('atom-ide-debugger-')).forEach(name => addFeature(MODULES_DIR, name));

const shouldInitialize = ensureAtomVersion();

let featureLoader;

if (shouldInitialize) {
  featureLoader = new (_FeatureLoader || _load_FeatureLoader()).default({
    path: _path.default.resolve(__dirname, '..'),
    features,
    featureGroups
  });
  featureLoader.load();
}

const config = exports.config = shouldInitialize ? Object.assign({}, baseConfig, (0, (_nullthrows || _load_nullthrows()).default)(featureLoader).getConfig()) : undefined;

let disposables;
function _activate() {
  // These need to be re-activated after de-activation.
  if (errorReporterDisposable == null) {
    errorReporterDisposable = (0, (_installErrorReporter || _load_installErrorReporter()).default)();
    (_log4js || _load_log4js()).default.configure((0, (_nuclideLogging || _load_nuclideLogging()).getDefaultConfig)());
  }

  if (atom.inDevMode() && process.env.SANDCASTLE == null) {
    (0, (_installDevTools || _load_installDevTools()).default)();
  }

  // Add the "Nuclide" menu, if it's not there already.
  disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.menu.add([{
    // On Windows, menu labels have an & before a letter to indicate which
    // ALT key combination maps to that menu. In our case, Alt+N should open
    // the Nuclide menu.
    label: process.platform === 'win32' ? '&Nuclide' : 'Nuclide',
    submenu: [{
      label: `Version ${(_package || _load_package()).default.version}`,
      enabled: false
    }]
  }, {
    label: process.platform === 'win32' ? '&Go' : 'Go',
    // an empty submenu is required to manipulate its position below
    submenu: []
  }]));

  // Manually manipulate the menu template order.
  const insertIndex = atom.menu.template.findIndex(item => item.role === 'window' || item.role === 'help');
  if (insertIndex !== -1) {
    const nuclideIndex = atom.menu.template.findIndex(item => item.label === 'Nuclide');
    const menuItem = atom.menu.template.splice(nuclideIndex, 1)[0];
    const newIndex = insertIndex > nuclideIndex ? insertIndex - 1 : insertIndex;
    atom.menu.template.splice(newIndex, 0, menuItem);
    atom.menu.update();
  }

  const goInsertIndex = atom.menu.template.findIndex(item => item.label === 'Packages');
  if (goInsertIndex !== -1) {
    const goIndex = atom.menu.template.findIndex(item => item.label === 'Go');
    const menuItem = atom.menu.template.splice(goIndex, 1)[0];
    const newIndex = goInsertIndex > goIndex ? goInsertIndex - 1 : goInsertIndex;
    atom.menu.template.splice(newIndex, 0, menuItem);
    atom.menu.update();
  }

  // Remove all remote directories up front to prevent packages from using remote URIs
  // before they are ready. The nuclide-remote-projects package manually
  // serializes/deserializes and then reloads these during the activation phase.
  atom.project.setPaths(atom.project.getPaths().filter(uri => !(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)));

  // Activate all of the loaded features. Technically, this will be a no-op
  // generally because Atom [will activate all loaded packages][1]. However,
  // that won't happen, for example, with our `activateAllPackages()`
  // integration test helper.
  //
  // [1]: https://github.com/atom/atom/blob/v1.9.0/src/package-manager.coffee#L425
  featureLoader.activate();

  // Install public, 3rd-party Atom packages listed in this package's 'package-deps' setting. Run
  // this *after* other packages are activated so they can modify this setting if desired before
  // installation is attempted.
  if ((_featureConfig || _load_featureConfig()).default.get('installRecommendedPackages')) {
    // Workaround for restoring multiple Atom windows. This prevents having all
    // the windows trying to install the deps at the same time - often clobbering
    // each other's install.
    const firstWindowId = remote.BrowserWindow.getAllWindows()[0].id;
    const currentWindowId = remote.getCurrentWindow().id;
    if (firstWindowId === currentWindowId) {
      (0, (_atomPackageDeps || _load_atomPackageDeps()).install)('nuclide', /* promptUser */false);
    }
  }

  const menusToSort = ['Nuclide', 'View'];
  disposables.add(atom.packages.onDidActivateInitialPackages(() => {
    sortMenuGroups(menusToSort);

    if (!(disposables != null)) {
      throw new Error('Invariant violation: "disposables != null"');
    }

    disposables.add(atom.packages.onDidActivatePackage(() => {
      sortMenuGroups(menusToSort);
    }));
  }));

  patchNotificationManager();
}

function patchNotificationManager() {
  const { addNotification } = atom.notifications;

  // Patch the notification functions to make sure they only display cleaned
  // HTML output.
  // $FlowIgnore - property not writeable
  atom.notifications.addNotification = notification => {
    // $FlowIgnore - internal property
    notification.message = domPurify.sanitize(notification.message);
    return addNotification.bind(atom.notifications)(notification);
  };
}

function sortLabelValue(label) {
  // Ignore the Windows accelerator key hint when sorting, the & doesn't
  // actually appear in the UX so it shouldn't affect the sort.
  return String(label).replace('&', '');
}

function sortSubmenuGroup(menuItems, startIndex, itemCount) {
  // Sort a subset of the items in the menu of length itemCount beginning
  // at startIndex.
  const itemsToSort = menuItems.splice(startIndex, itemCount);
  itemsToSort.sort((a, b) => {
    // Always put the "Version" label up top.
    if (sortLabelValue(a.label).startsWith('Version')) {
      return -1;
    } else {
      return sortLabelValue(a.label).localeCompare(sortLabelValue(b.label));
    }
  });

  menuItems.splice(startIndex, 0, ...itemsToSort);
}

function mergeFeatureGroups(firstGroup, secondGroup) {
  const mergedObject = {};
  for (const key in firstGroup) {
    mergedObject[key] = [...(firstGroup[key] || []), ...(secondGroup[key] || [])];
  }
  for (const key in secondGroup) {
    mergedObject[key] = [...(firstGroup[key] || []), ...(secondGroup[key] || [])];
  }
  return mergedObject;
}

function sortMenuGroups(menuNames) {
  for (const menuName of menuNames) {
    // Sorts the items in a menu alphabetically. If the menu contains one or more
    // separators, then the items within each separator subgroup will be sorted
    // with respect to each other, but items will remain in the same groups, and
    // the separators will not be moved.
    const menu = atom.menu.template.find(m => sortLabelValue(m.label) === menuName);
    if (menu == null) {
      continue;
    }

    // Sort each group of items (separated by a separator) individually.
    let sortStart = 0;
    for (let i = 0; i < menu.submenu.length; i++) {
      if (menu.submenu[i].type === 'separator') {
        sortSubmenuGroup(menu.submenu, sortStart, i - sortStart);
        sortStart = i + 1;
      }
    }

    // Sort any remaining items after the last separator.
    if (sortStart < menu.submenu.length) {
      sortSubmenuGroup(menu.submenu, sortStart, menu.submenu.length - sortStart);
    }
  }

  atom.menu.update();
}

function _deactivate() {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  featureLoader.deactivate();
  disposables.dispose();
  disposables = null;

  if (!(errorReporterDisposable != null)) {
    throw new Error('Invariant violation: "errorReporterDisposable != null"');
  }

  errorReporterDisposable.dispose();
  errorReporterDisposable = null;
  return Promise.race([
  // Prevent Atom from exiting until log4js shutdown completes.
  new Promise(resolve => (_log4js || _load_log4js()).default.shutdown(resolve)),
  // But guard against log4js misbehaving.
  (0, (_promise || _load_promise()).sleep)(1000)]);
}

function _serialize() {
  featureLoader.serialize();
}

function _handleURI({ pathname, query }, uri) {
  if (pathname == null || pathname === '') {
    atom.notifications.addError(`Invalid URI ${uri}: must have a path.`);
    return;
  }
  const message = pathname.substr(1);

  // Atom waits for Nuclide to initialize before sending the URI through.
  // So, at this point it should be fairly safe to delegate to nuclide-deep-link.
  (0, (_deepLink || _load_deepLink()).sendDeepLink)(remote.getCurrentWindow(), message, query || {});
}

function ensureAtomVersion() {
  if ((_semver || _load_semver()).default.lt(atom.getVersion(), MINIMUM_SUPPORTED_ATOM_VERSION)) {
    const notification = atom.notifications.addError('**Atom Upgrade Required**', {
      description: `Nuclide requires Atom ${MINIMUM_SUPPORTED_ATOM_VERSION}. **All of its functionality will` + ' be disabled until you upgrade.**',
      dismissable: true,
      buttons: [{
        text: 'Quit Atom',
        className: 'icon icon-stop',
        onDidClick() {
          atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:quit');
        }
      }, {
        text: 'Continue without Nuclide',
        className: 'nuclide-min-atom-button',
        onDidClick() {
          notification.dismiss();
        }
      }]
    });
    // Hide the normal close button so that people need to use our custom button to close (and are
    // hopefully, as a result, more aware of what we're saying). Unfortunately, Atom doesn't provide
    // access to this view so we have to find it.
    const continueButton = document.querySelector('.nuclide-min-atom-button');
    const notificationEl = continueButton && continueButton.closest('atom-notification');
    const closeButton = notificationEl && notificationEl.querySelector('.close');
    if (closeButton != null) {
      closeButton.style.display = 'none';
    }
    return false;
  }
  return true;
}

const activate = exports.activate = shouldInitialize ? _activate : undefined;
const deactivate = exports.deactivate = shouldInitialize ? _deactivate : undefined;
const serialize = exports.serialize = shouldInitialize ? _serialize : undefined;
const handleURI = exports.handleURI = shouldInitialize ? _handleURI : undefined;