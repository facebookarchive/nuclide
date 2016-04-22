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
    return (0, _libMain.__testUseOnly_removeFeature)(name);
  });

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

  // Ensure 3rd-party packages are not installed via the 'atom-package-deps' package when the
  // 'nuclide' package is activated. It makes network requests that never return in a test env.
  _nuclideFeatureConfig2['default'].set('installRecommendedPackages', false);

  // Include the path to the nuclide package.
  packageNames.push(_path2['default'].dirname(require.resolve('../../../package.json')));
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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libMain = require('../../../lib/main');

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2thZ2UtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBc0JzQixtQkFBbUIscUJBQWxDLGFBQTZEOzs7QUFHbEUsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixZQUFZLEVBQ1osVUFBVSxDQUNYLENBQUM7OztBQUdGLEdBQUMsaUNBQWlDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1dBQUksMENBQTRCLElBQUksQ0FBQztHQUFBLENBQUMsQ0FBQzs7QUFFdkYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzRSxRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxRQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFFBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdkYsUUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZELFFBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELFdBQU8sQ0FBQyxpQkFBaUIsSUFBSSxXQUFXLENBQUEsSUFBSyxDQUFDLG9CQUFvQixDQUFDO0dBQ3BFLENBQUMsQ0FBQzs7OztBQUlILG9DQUFjLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQzs7O0FBR3ZELGNBQVksQ0FBQyxJQUFJLENBQUMsa0JBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsUUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUM7QUFDakYsU0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDO0NBQ2pFOzs7Ozs7Ozs7Ozs7Ozs7OztvQ0EzQ3lCLDhCQUE4Qjs7OztvQkFDdkMsTUFBTTs7Ozt1QkFDbUIsbUJBQW1COztBQTJDdEQsU0FBUyxxQkFBcUIsR0FBUztBQUM1QyxNQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDbkMsTUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztDQUNoQyIsImZpbGUiOiJwYWNrYWdlLXV0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7X190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlfSBmcm9tICcuLi8uLi8uLi9saWIvbWFpbic7XG5cbi8qKlxuICogQWN0aXZhdGVzIGFsbCBudWNsaWRlIGFuZCBmYiBhdG9tIHBhY2thZ2VzIHRoYXQgZG8gbm90IGRlZmVyIHRoZWlyIG93biBhY3RpdmF0aW9uIHVudGlsIGFcbiAqIGNlcnRhaW4gY29tbWFuZCBvciBob29rIGlzIGV4ZWN1dGVkLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIHN0cmluZ3MsIHdoaWNoIGFyZSB0aGUgbmFtZXMgb2YgYWxsIHRoZSBwYWNrYWdlc1xuICogICB0aGF0IHRoaXMgZnVuY3Rpb24gYWN0aXZhdGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGVBbGxQYWNrYWdlcygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgLy8gVGhlc2UgYXJlIHBhY2thZ2VzIHdlIHdhbnQgdG8gYWN0aXZhdGUsIGluY2x1ZGluZyBzb21lIHdoaWNoIGNvbWUgYnVuZGxlZCB3aXRoIGF0b20sXG4gIC8vIG9yIG9uZXMgd2lkZWx5IHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBudWNsaWRlLlxuICBjb25zdCB3aGl0ZWxpc3QgPSBbXG4gICAgJ2F1dG9jb21wbGV0ZS1wbHVzJyxcbiAgICAnaHlwZXJjbGljaycsXG4gICAgJ3N0YXR1cy1iYXInLFxuICAgICd0b29sLWJhcicsXG4gIF07XG5cbiAgLy8gVE9ETyhqb25hbGRpc2xhcnJ5KSBUaGVzZSBwYWNrYWdlKHMpIGNhbm5vdCBiZSBhY3RpdmF0ZWQgbWFudWFsbHkgLS0gdDkyNDM1NDIuXG4gIFsnbnVjbGlkZS1mdXp6eS1maWxlbmFtZS1wcm92aWRlciddLmZvckVhY2gobmFtZSA9PiBfX3Rlc3RVc2VPbmx5X3JlbW92ZUZlYXR1cmUobmFtZSkpO1xuXG4gIGNvbnN0IHBhY2thZ2VOYW1lcyA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKCkuZmlsdGVyKG5hbWUgPT4ge1xuICAgIGNvbnN0IHBhY2sgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKG5hbWUpO1xuICAgIGlmIChwYWNrID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgaXNBY3RpdmF0aW9uRGVmZXJyZWQgPSBwYWNrLmhhc0FjdGl2YXRpb25Db21tYW5kcygpIHx8IHBhY2suaGFzQWN0aXZhdGlvbkhvb2tzKCk7XG4gICAgY29uc3QgaXNMYW5ndWFnZVBhY2thZ2UgPSBuYW1lLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLScpO1xuICAgIGNvbnN0IGluV2hpdGVsaXN0ID0gd2hpdGVsaXN0LmluZGV4T2YobmFtZSkgPj0gMDtcbiAgICByZXR1cm4gKGlzTGFuZ3VhZ2VQYWNrYWdlIHx8IGluV2hpdGVsaXN0KSAmJiAhaXNBY3RpdmF0aW9uRGVmZXJyZWQ7XG4gIH0pO1xuXG4gIC8vIEVuc3VyZSAzcmQtcGFydHkgcGFja2FnZXMgYXJlIG5vdCBpbnN0YWxsZWQgdmlhIHRoZSAnYXRvbS1wYWNrYWdlLWRlcHMnIHBhY2thZ2Ugd2hlbiB0aGVcbiAgLy8gJ251Y2xpZGUnIHBhY2thZ2UgaXMgYWN0aXZhdGVkLiBJdCBtYWtlcyBuZXR3b3JrIHJlcXVlc3RzIHRoYXQgbmV2ZXIgcmV0dXJuIGluIGEgdGVzdCBlbnYuXG4gIGZlYXR1cmVDb25maWcuc2V0KCdpbnN0YWxsUmVjb21tZW5kZWRQYWNrYWdlcycsIGZhbHNlKTtcblxuICAvLyBJbmNsdWRlIHRoZSBwYXRoIHRvIHRoZSBudWNsaWRlIHBhY2thZ2UuXG4gIHBhY2thZ2VOYW1lcy5wdXNoKHBhdGguZGlybmFtZShyZXF1aXJlLnJlc29sdmUoJy4uLy4uLy4uL3BhY2thZ2UuanNvbicpKSk7XG4gIGF3YWl0IFByb21pc2UuYWxsKHBhY2thZ2VOYW1lcy5tYXAocGFjayA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKSkpO1xuICByZXR1cm4gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlcygpLm1hcChwYWNrID0+IHBhY2submFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlQWxsUGFja2FnZXMoKTogdm9pZCB7XG4gIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2VzKCk7XG4gIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZXMoKTtcbn1cbiJdfQ==