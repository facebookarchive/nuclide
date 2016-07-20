Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Activates all nuclide and fb atom packages that do not defer their own activation until a
 * certain command or hook is executed.
 *
 * @returns A promise that resolves to an array of strings, which are the names of all the packages
 *   that this function activates.
 */

var activateAllPackages = _asyncToGenerator(function* () {
  // These are packages we want to activate, including some which come bundled with atom,
  // or ones widely used in conjunction with nuclide.
  var whitelist = ['autocomplete-plus', 'hyperclick', 'status-bar', 'tool-bar'];

  // Manually call `triggerDeferredActivationHooks` since Atom doesn't call it via
  // `atom.packages.activate()` during tests. Calling this before we activate
  // Nuclide packages sets `deferredActivationHooks` to `null`, so that deferred
  // activation hooks are triggered as needed instead of batched.
  // https://github.com/atom/atom/blob/v1.8.0/src/package-manager.coffee#L467-L472
  atom.packages.triggerDeferredActivationHooks();

  var packageNames = atom.packages.getAvailablePackageNames().filter(function (name) {
    var pack = atom.packages.loadPackage(name);
    if (pack == null) {
      return false;
    }
    var isActivationDeferred = pack.hasActivationCommands() || pack.hasActivationHooks();
    var isLanguagePackage = name.startsWith('language-');
    var inWhitelist = whitelist.indexOf(name) >= 0;
    return (isLanguagePackage || inWhitelist) && !isActivationDeferred;
  });

  // Include the path to the nuclide package.
  packageNames.push((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(require.resolve('../../../package.json')));
  // Include the path to the tool-bar package
  packageNames.push((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(String(process.env.ATOM_HOME), 'packages/tool-bar'));

  yield Promise.all(packageNames.map(function (pack) {
    return atom.packages.activatePackage(pack);
  }));
  return atom.packages.getActivePackages().map(function (pack) {
    return pack.name;
  });
});

exports.activateAllPackages = activateAllPackages;
exports.deactivateAllPackages = deactivateAllPackages;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();

  // TODO(asuarez): Switch to using ReactComponentTreeDevtool when we upgrade
  // React. If this is ever missing, make sure we're not testing with the bundled
  // version of React. And if it's still missing, then retire this test.

  var ReactMountPath = Object.keys(require.cache).find(function (x) {
    return x.endsWith('react/lib/ReactMount.js');
  });
  expect(typeof ReactMountPath).toBe('string');

  var ReactMount = require.cache[ReactMountPath].exports;
  expect(ReactMount).not.toBeUndefined();
  expect(ReactMount._instancesByReactRootID).not.toBeUndefined();

  var instances = Object.keys(ReactMount._instancesByReactRootID).map(function (x) {
    return ReactMount._instancesByReactRootID[x];
  });

  instances.forEach(function (inst) {
    var currElement = inst._renderedComponent._currentElement;
    // eslint-disable-next-line no-console
    console.error('Found a mounted component. ' + ('Did you forget to call React.unmountComponentAtNode on "' + (currElement.type.displayName || currElement.type.name) + '"?'));
  });

  if (instances.length) {
    // eslint-disable-next-line no-console
    console.error('+------------------------------------------------------------------------------+\n| Dear Developer, if you find yourself trying to figure why this is failing    |\n| with such an unhelpful message, try:                                         |\n|                                                                              |\n|   1. Load Atom with "atom --dev",                                            |\n|   2. Perform the steps you\'re testing,                                       |\n|   3. Disable the Nuclide package,                                            |\n|   4. Run:                                                                    |\n|       require.cache[                                                         |\n|         Object.keys(require.cache).find(x => x.endsWith(\'/ReactMount.js\'))   |\n|       ].exports._instancesByReactRootID                                      |\n|                                                                              |\n| That should give you some clues on finding out what isn\'t getting unmounted. |\n|                                                                              |\n| Good luck!                                                                   |\n+------------------------------------------------------------------------------+\n    ');
  }

  expect(instances.length).toBe(0);
}