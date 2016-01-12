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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../../../../');

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2thZ2UtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBc0JzQixtQkFBbUIscUJBQWxDLGFBQTZEOzs7QUFHbEUsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixZQUFZLENBQ2IsQ0FBQzs7O0FBR0YsR0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7V0FBSSxtQ0FBNEIsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFDOztBQUV2RixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzNFLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLDZCQUFVLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUN4QixRQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3ZGLFFBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2RCxRQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqRCxXQUFPLENBQUMsaUJBQWlCLElBQUksV0FBVyxDQUFBLElBQUssQ0FBQyxvQkFBb0IsQ0FBQztHQUNwRSxDQUFDLENBQUM7O0FBRUgsY0FBWSxDQUFDLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDdkQsUUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO1dBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUM7QUFDakYsU0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDO0NBQ2pFOzs7Ozs7Ozs7Ozs7Ozs7OztzQkFuQ3FCLFFBQVE7Ozs7b0JBQ2IsTUFBTTs7OztnQkFDbUIsY0FBYzs7QUFtQ2pELFNBQVMscUJBQXFCLEdBQVM7QUFDNUMsTUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ25DLE1BQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7Q0FDaEMiLCJmaWxlIjoicGFja2FnZS11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtfX3Rlc3RVc2VPbmx5X3JlbW92ZUZlYXR1cmV9IGZyb20gJy4uLy4uLy4uLy4uLyc7XG5cbi8qKlxuICogQWN0aXZhdGVzIGFsbCBudWNsaWRlIGFuZCBmYiBhdG9tIHBhY2thZ2VzIHRoYXQgZG8gbm90IGRlZmVyIHRoZWlyIG93biBhY3RpdmF0aW9uIHVudGlsIGFcbiAqIGNlcnRhaW4gY29tbWFuZCBvciBob29rIGlzIGV4ZWN1dGVkLlxuICpcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGFycmF5IG9mIHN0cmluZ3MsIHdoaWNoIGFyZSB0aGUgbmFtZXMgb2YgYWxsIHRoZSBwYWNrYWdlc1xuICogICB0aGF0IHRoaXMgZnVuY3Rpb24gYWN0aXZhdGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGVBbGxQYWNrYWdlcygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgLy8gVGhlc2UgYXJlIHBhY2thZ2VzIHdlIHdhbnQgdG8gYWN0aXZhdGUsIGluY2x1ZGluZyBzb21lIHdoaWNoIGNvbWUgYnVuZGxlZCB3aXRoIGF0b20sXG4gIC8vIG9yIG9uZXMgd2lkZWx5IHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBudWNsaWRlLlxuICBjb25zdCB3aGl0ZWxpc3QgPSBbXG4gICAgJ2F1dG9jb21wbGV0ZS1wbHVzJyxcbiAgICAnaHlwZXJjbGljaycsXG4gICAgJ3N0YXR1cy1iYXInLFxuICBdO1xuXG4gIC8vIFRPRE8oam9uYWxkaXNsYXJyeSkgVGhlc2UgcGFja2FnZShzKSBjYW5ub3QgYmUgYWN0aXZhdGVkIG1hbnVhbGx5IC0tIHQ5MjQzNTQyLlxuICBbJ251Y2xpZGUtZnV6enktZmlsZW5hbWUtcHJvdmlkZXInXS5mb3JFYWNoKG5hbWUgPT4gX190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlKG5hbWUpKTtcblxuICBjb25zdCBwYWNrYWdlTmFtZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpLmZpbHRlcihuYW1lID0+IHtcbiAgICBjb25zdCBwYWNrID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShuYW1lKTtcbiAgICBpbnZhcmlhbnQocGFjayAhPSBudWxsKTtcbiAgICBjb25zdCBpc0FjdGl2YXRpb25EZWZlcnJlZCA9IHBhY2suaGFzQWN0aXZhdGlvbkNvbW1hbmRzKCkgfHwgcGFjay5oYXNBY3RpdmF0aW9uSG9va3MoKTtcbiAgICBjb25zdCBpc0xhbmd1YWdlUGFja2FnZSA9IG5hbWUuc3RhcnRzV2l0aCgnbGFuZ3VhZ2UtJyk7XG4gICAgY29uc3QgaW5XaGl0ZWxpc3QgPSB3aGl0ZWxpc3QuaW5kZXhPZihuYW1lKSA+PSAwO1xuICAgIHJldHVybiAoaXNMYW5ndWFnZVBhY2thZ2UgfHwgaW5XaGl0ZWxpc3QpICYmICFpc0FjdGl2YXRpb25EZWZlcnJlZDtcbiAgfSk7XG4gIC8vIEluY2x1ZGUgdGhlIHBhdGggdG8gdGhlIG51Y2xpZGUgcGFja2FnZS5cbiAgcGFja2FnZU5hbWVzLnB1c2gocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uLy4uJykpO1xuICBhd2FpdCBQcm9taXNlLmFsbChwYWNrYWdlTmFtZXMubWFwKHBhY2sgPT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaykpKTtcbiAgcmV0dXJuIGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZXMoKS5tYXAocGFjayA9PiBwYWNrLm5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZUFsbFBhY2thZ2VzKCk6IHZvaWQge1xuICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlcygpO1xuICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2VzKCk7XG59XG4iXX0=