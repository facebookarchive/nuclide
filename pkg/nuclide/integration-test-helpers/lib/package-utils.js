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
  var whitelist = ['autocomplete-plus', 'hyperclick', 'status-bar'];

  // TODO(jonaldislarry) These package(s) cannot be activated manually -- t9243542.
  ['nuclide-fuzzy-filename-provider'].forEach(function (name) {
    return (0, _.__testUseOnly_removeFeature)(name);
  });

  var packageNames = atom.packages.getAvailablePackageNames().filter(function (name) {
    var pack = atom.packages.loadPackage(name);
    (0, _assert2['default'])(pack != null);
    var isActivationDeferred = pack.hasActivationCommands() || pack.hasActivationHooks();
    var isLanguagePackage = name.startsWith('language-');
    var inWhitelist = whitelist.indexOf(name) >= 0;
    return (isLanguagePackage || inWhitelist) && !isActivationDeferred;
  });

  // Ensure 3rd-party packages are not installed via the 'atom-package-deps' package when the
  // 'nuclide' package is activated. It makes network requests that never return in a test env.
  _featureConfig2['default'].set('installRecommendedPackages', false);

  // Include the path to the nuclide package.
  packageNames.push(_path2['default'].join(__dirname, '../../../..'));
  yield Promise.all(packageNames.map(function (pack) {
    return atom.packages.activatePackage(pack);
  }));
  return atom.packages.getActivePackages().map(function (pack) {
    return pack.name;
  });
});

exports.activateAllPackages = activateAllPackages;
exports.deactivateAllPackages = deactivateAllPackages;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../../../../');

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2thZ2UtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBdUJzQixtQkFBbUIscUJBQWxDLGFBQTZEOzs7QUFHbEUsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixZQUFZLENBQ2IsQ0FBQzs7O0FBR0YsR0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7V0FBSSxtQ0FBNEIsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFDOztBQUV2RixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzNFLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLDZCQUFVLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUN4QixRQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3ZGLFFBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2RCxRQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxXQUFPLENBQUMsaUJBQWlCLElBQUksV0FBVyxDQUFBLElBQUssQ0FBQyxvQkFBb0IsQ0FBQztHQUNwRSxDQUFDLENBQUM7Ozs7QUFJSCw2QkFBYyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7OztBQUd2RCxjQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUN2RCxRQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7R0FBQSxDQUFDLENBQUMsQ0FBQztBQUNqRixTQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLElBQUk7R0FBQSxDQUFDLENBQUM7Q0FDakU7Ozs7Ozs7Ozs7Ozs7Ozs7OzZCQXpDeUIsc0JBQXNCOzs7O3NCQUMxQixRQUFROzs7O29CQUNiLE1BQU07Ozs7Z0JBQ21CLGNBQWM7O0FBd0NqRCxTQUFTLHFCQUFxQixHQUFTO0FBQzVDLE1BQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNuQyxNQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQ2hDIiwiZmlsZSI6InBhY2thZ2UtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7X190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlfSBmcm9tICcuLi8uLi8uLi8uLi8nO1xuXG4vKipcbiAqIEFjdGl2YXRlcyBhbGwgbnVjbGlkZSBhbmQgZmIgYXRvbSBwYWNrYWdlcyB0aGF0IGRvIG5vdCBkZWZlciB0aGVpciBvd24gYWN0aXZhdGlvbiB1bnRpbCBhXG4gKiBjZXJ0YWluIGNvbW1hbmQgb3IgaG9vayBpcyBleGVjdXRlZC5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhcnJheSBvZiBzdHJpbmdzLCB3aGljaCBhcmUgdGhlIG5hbWVzIG9mIGFsbCB0aGUgcGFja2FnZXNcbiAqICAgdGhhdCB0aGlzIGZ1bmN0aW9uIGFjdGl2YXRlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlQWxsUGFja2FnZXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIC8vIFRoZXNlIGFyZSBwYWNrYWdlcyB3ZSB3YW50IHRvIGFjdGl2YXRlLCBpbmNsdWRpbmcgc29tZSB3aGljaCBjb21lIGJ1bmRsZWQgd2l0aCBhdG9tLFxuICAvLyBvciBvbmVzIHdpZGVseSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggbnVjbGlkZS5cbiAgY29uc3Qgd2hpdGVsaXN0ID0gW1xuICAgICdhdXRvY29tcGxldGUtcGx1cycsXG4gICAgJ2h5cGVyY2xpY2snLFxuICAgICdzdGF0dXMtYmFyJyxcbiAgXTtcblxuICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpIFRoZXNlIHBhY2thZ2UocykgY2Fubm90IGJlIGFjdGl2YXRlZCBtYW51YWxseSAtLSB0OTI0MzU0Mi5cbiAgWydudWNsaWRlLWZ1enp5LWZpbGVuYW1lLXByb3ZpZGVyJ10uZm9yRWFjaChuYW1lID0+IF9fdGVzdFVzZU9ubHlfcmVtb3ZlRmVhdHVyZShuYW1lKSk7XG5cbiAgY29uc3QgcGFja2FnZU5hbWVzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKS5maWx0ZXIobmFtZSA9PiB7XG4gICAgY29uc3QgcGFjayA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UobmFtZSk7XG4gICAgaW52YXJpYW50KHBhY2sgIT0gbnVsbCk7XG4gICAgY29uc3QgaXNBY3RpdmF0aW9uRGVmZXJyZWQgPSBwYWNrLmhhc0FjdGl2YXRpb25Db21tYW5kcygpIHx8IHBhY2suaGFzQWN0aXZhdGlvbkhvb2tzKCk7XG4gICAgY29uc3QgaXNMYW5ndWFnZVBhY2thZ2UgPSBuYW1lLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLScpO1xuICAgIGNvbnN0IGluV2hpdGVsaXN0ID0gd2hpdGVsaXN0LmluZGV4T2YobmFtZSkgPj0gMDtcbiAgICByZXR1cm4gKGlzTGFuZ3VhZ2VQYWNrYWdlIHx8IGluV2hpdGVsaXN0KSAmJiAhaXNBY3RpdmF0aW9uRGVmZXJyZWQ7XG4gIH0pO1xuXG4gIC8vIEVuc3VyZSAzcmQtcGFydHkgcGFja2FnZXMgYXJlIG5vdCBpbnN0YWxsZWQgdmlhIHRoZSAnYXRvbS1wYWNrYWdlLWRlcHMnIHBhY2thZ2Ugd2hlbiB0aGVcbiAgLy8gJ251Y2xpZGUnIHBhY2thZ2UgaXMgYWN0aXZhdGVkLiBJdCBtYWtlcyBuZXR3b3JrIHJlcXVlc3RzIHRoYXQgbmV2ZXIgcmV0dXJuIGluIGEgdGVzdCBlbnYuXG4gIGZlYXR1cmVDb25maWcuc2V0KCdpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlcycsIGZhbHNlKTtcblxuICAvLyBJbmNsdWRlIHRoZSBwYXRoIHRvIHRoZSBudWNsaWRlIHBhY2thZ2UuXG4gIHBhY2thZ2VOYW1lcy5wdXNoKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8uLicpKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwocGFja2FnZU5hbWVzLm1hcChwYWNrID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spKSk7XG4gIHJldHVybiBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2VzKCkubWFwKHBhY2sgPT4gcGFjay5uYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGVBbGxQYWNrYWdlcygpOiB2b2lkIHtcbiAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZXMoKTtcbiAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlcygpO1xufVxuIl19