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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2thZ2UtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBdUJzQixtQkFBbUIscUJBQWxDLGFBQTZEOzs7QUFHbEUsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixZQUFZLEVBQ1osVUFBVSxDQUNYLENBQUM7OztBQUdGLEdBQUMsaUNBQWlDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1dBQUksbUNBQTRCLElBQUksQ0FBQztHQUFBLENBQUMsQ0FBQzs7QUFFdkYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzRSxRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3Qyw2QkFBVSxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7QUFDeEIsUUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUN2RixRQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkQsUUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsV0FBTyxDQUFDLGlCQUFpQixJQUFJLFdBQVcsQ0FBQSxJQUFLLENBQUMsb0JBQW9CLENBQUM7R0FDcEUsQ0FBQyxDQUFDOzs7O0FBSUgsNkJBQWMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDOzs7QUFHdkQsY0FBWSxDQUFDLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDdkQsUUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUM7QUFDakYsU0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDO0NBQ2pFOzs7Ozs7Ozs7Ozs7Ozs7Ozs2QkExQ3lCLHNCQUFzQjs7OztzQkFDMUIsUUFBUTs7OztvQkFDYixNQUFNOzs7O2dCQUNtQixjQUFjOztBQXlDakQsU0FBUyxxQkFBcUIsR0FBUztBQUM1QyxNQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDbkMsTUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUNoQyIsImZpbGUiOiJwYWNrYWdlLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge19fdGVzdFVzZU9ubHlfcmVtb3ZlRmVhdHVyZX0gZnJvbSAnLi4vLi4vLi4vLi4vJztcblxuLyoqXG4gKiBBY3RpdmF0ZXMgYWxsIG51Y2xpZGUgYW5kIGZiIGF0b20gcGFja2FnZXMgdGhhdCBkbyBub3QgZGVmZXIgdGhlaXIgb3duIGFjdGl2YXRpb24gdW50aWwgYVxuICogY2VydGFpbiBjb21tYW5kIG9yIGhvb2sgaXMgZXhlY3V0ZWQuXG4gKlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygc3RyaW5ncywgd2hpY2ggYXJlIHRoZSBuYW1lcyBvZiBhbGwgdGhlIHBhY2thZ2VzXG4gKiAgIHRoYXQgdGhpcyBmdW5jdGlvbiBhY3RpdmF0ZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY3RpdmF0ZUFsbFBhY2thZ2VzKCk6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICAvLyBUaGVzZSBhcmUgcGFja2FnZXMgd2Ugd2FudCB0byBhY3RpdmF0ZSwgaW5jbHVkaW5nIHNvbWUgd2hpY2ggY29tZSBidW5kbGVkIHdpdGggYXRvbSxcbiAgLy8gb3Igb25lcyB3aWRlbHkgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIG51Y2xpZGUuXG4gIGNvbnN0IHdoaXRlbGlzdCA9IFtcbiAgICAnYXV0b2NvbXBsZXRlLXBsdXMnLFxuICAgICdoeXBlcmNsaWNrJyxcbiAgICAnc3RhdHVzLWJhcicsXG4gICAgJ3Rvb2wtYmFyJyxcbiAgXTtcblxuICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpIFRoZXNlIHBhY2thZ2UocykgY2Fubm90IGJlIGFjdGl2YXRlZCBtYW51YWxseSAtLSB0OTI0MzU0Mi5cbiAgWydudWNsaWRlLWZ1enp5LWZpbGVuYW1lLXByb3ZpZGVyJ10uZm9yRWFjaChuYW1lID0+IF9fdGVzdFVzZU9ubHlfcmVtb3ZlRmVhdHVyZShuYW1lKSk7XG5cbiAgY29uc3QgcGFja2FnZU5hbWVzID0gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlTmFtZXMoKS5maWx0ZXIobmFtZSA9PiB7XG4gICAgY29uc3QgcGFjayA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UobmFtZSk7XG4gICAgaW52YXJpYW50KHBhY2sgIT0gbnVsbCk7XG4gICAgY29uc3QgaXNBY3RpdmF0aW9uRGVmZXJyZWQgPSBwYWNrLmhhc0FjdGl2YXRpb25Db21tYW5kcygpIHx8IHBhY2suaGFzQWN0aXZhdGlvbkhvb2tzKCk7XG4gICAgY29uc3QgaXNMYW5ndWFnZVBhY2thZ2UgPSBuYW1lLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLScpO1xuICAgIGNvbnN0IGluV2hpdGVsaXN0ID0gd2hpdGVsaXN0LmluZGV4T2YobmFtZSkgPj0gMDtcbiAgICByZXR1cm4gKGlzTGFuZ3VhZ2VQYWNrYWdlIHx8IGluV2hpdGVsaXN0KSAmJiAhaXNBY3RpdmF0aW9uRGVmZXJyZWQ7XG4gIH0pO1xuXG4gIC8vIEVuc3VyZSAzcmQtcGFydHkgcGFja2FnZXMgYXJlIG5vdCBpbnN0YWxsZWQgdmlhIHRoZSAnYXRvbS1wYWNrYWdlLWRlcHMnIHBhY2thZ2Ugd2hlbiB0aGVcbiAgLy8gJ251Y2xpZGUnIHBhY2thZ2UgaXMgYWN0aXZhdGVkLiBJdCBtYWtlcyBuZXR3b3JrIHJlcXVlc3RzIHRoYXQgbmV2ZXIgcmV0dXJuIGluIGEgdGVzdCBlbnYuXG4gIGZlYXR1cmVDb25maWcuc2V0KCdpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlcycsIGZhbHNlKTtcblxuICAvLyBJbmNsdWRlIHRoZSBwYXRoIHRvIHRoZSBudWNsaWRlIHBhY2thZ2UuXG4gIHBhY2thZ2VOYW1lcy5wdXNoKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8uLicpKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwocGFja2FnZU5hbWVzLm1hcChwYWNrID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spKSk7XG4gIHJldHVybiBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2VzKCkubWFwKHBhY2sgPT4gcGFjay5uYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGVBbGxQYWNrYWdlcygpOiB2b2lkIHtcbiAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZXMoKTtcbiAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlcygpO1xufVxuIl19