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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../../../../');

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2thZ2UtdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBc0JzQixtQkFBbUIscUJBQWxDLGFBQTZEOzs7QUFHbEUsTUFBTSxTQUFTLEdBQUcsQ0FDaEIsbUJBQW1CLEVBQ25CLFlBQVksRUFDWixZQUFZLEVBQ1osVUFBVSxDQUNYLENBQUM7OztBQUdGLEdBQUMsaUNBQWlDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1dBQUksbUNBQTRCLElBQUksQ0FBQztHQUFBLENBQUMsQ0FBQzs7QUFFdkYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzRSxRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxRQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFFBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdkYsUUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZELFFBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pELFdBQU8sQ0FBQyxpQkFBaUIsSUFBSSxXQUFXLENBQUEsSUFBSyxDQUFDLG9CQUFvQixDQUFDO0dBQ3BFLENBQUMsQ0FBQzs7OztBQUlILDZCQUFjLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQzs7O0FBR3ZELGNBQVksQ0FBQyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFFBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtXQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztHQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFNBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLENBQUMsSUFBSTtHQUFBLENBQUMsQ0FBQztDQUNqRTs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBM0N5QixzQkFBc0I7Ozs7b0JBQy9CLE1BQU07Ozs7Z0JBQ21CLGNBQWM7O0FBMkNqRCxTQUFTLHFCQUFxQixHQUFTO0FBQzVDLE1BQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNuQyxNQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQ2hDIiwiZmlsZSI6InBhY2thZ2UtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9mZWF0dXJlLWNvbmZpZyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7X190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlfSBmcm9tICcuLi8uLi8uLi8uLi8nO1xuXG4vKipcbiAqIEFjdGl2YXRlcyBhbGwgbnVjbGlkZSBhbmQgZmIgYXRvbSBwYWNrYWdlcyB0aGF0IGRvIG5vdCBkZWZlciB0aGVpciBvd24gYWN0aXZhdGlvbiB1bnRpbCBhXG4gKiBjZXJ0YWluIGNvbW1hbmQgb3IgaG9vayBpcyBleGVjdXRlZC5cbiAqXG4gKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBhcnJheSBvZiBzdHJpbmdzLCB3aGljaCBhcmUgdGhlIG5hbWVzIG9mIGFsbCB0aGUgcGFja2FnZXNcbiAqICAgdGhhdCB0aGlzIGZ1bmN0aW9uIGFjdGl2YXRlcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFjdGl2YXRlQWxsUGFja2FnZXMoKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIC8vIFRoZXNlIGFyZSBwYWNrYWdlcyB3ZSB3YW50IHRvIGFjdGl2YXRlLCBpbmNsdWRpbmcgc29tZSB3aGljaCBjb21lIGJ1bmRsZWQgd2l0aCBhdG9tLFxuICAvLyBvciBvbmVzIHdpZGVseSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggbnVjbGlkZS5cbiAgY29uc3Qgd2hpdGVsaXN0ID0gW1xuICAgICdhdXRvY29tcGxldGUtcGx1cycsXG4gICAgJ2h5cGVyY2xpY2snLFxuICAgICdzdGF0dXMtYmFyJyxcbiAgICAndG9vbC1iYXInLFxuICBdO1xuXG4gIC8vIFRPRE8oam9uYWxkaXNsYXJyeSkgVGhlc2UgcGFja2FnZShzKSBjYW5ub3QgYmUgYWN0aXZhdGVkIG1hbnVhbGx5IC0tIHQ5MjQzNTQyLlxuICBbJ251Y2xpZGUtZnV6enktZmlsZW5hbWUtcHJvdmlkZXInXS5mb3JFYWNoKG5hbWUgPT4gX190ZXN0VXNlT25seV9yZW1vdmVGZWF0dXJlKG5hbWUpKTtcblxuICBjb25zdCBwYWNrYWdlTmFtZXMgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpLmZpbHRlcihuYW1lID0+IHtcbiAgICBjb25zdCBwYWNrID0gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShuYW1lKTtcbiAgICBpZiAocGFjayA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGlzQWN0aXZhdGlvbkRlZmVycmVkID0gcGFjay5oYXNBY3RpdmF0aW9uQ29tbWFuZHMoKSB8fCBwYWNrLmhhc0FjdGl2YXRpb25Ib29rcygpO1xuICAgIGNvbnN0IGlzTGFuZ3VhZ2VQYWNrYWdlID0gbmFtZS5zdGFydHNXaXRoKCdsYW5ndWFnZS0nKTtcbiAgICBjb25zdCBpbldoaXRlbGlzdCA9IHdoaXRlbGlzdC5pbmRleE9mKG5hbWUpID49IDA7XG4gICAgcmV0dXJuIChpc0xhbmd1YWdlUGFja2FnZSB8fCBpbldoaXRlbGlzdCkgJiYgIWlzQWN0aXZhdGlvbkRlZmVycmVkO1xuICB9KTtcblxuICAvLyBFbnN1cmUgM3JkLXBhcnR5IHBhY2thZ2VzIGFyZSBub3QgaW5zdGFsbGVkIHZpYSB0aGUgJ2F0b20tcGFja2FnZS1kZXBzJyBwYWNrYWdlIHdoZW4gdGhlXG4gIC8vICdudWNsaWRlJyBwYWNrYWdlIGlzIGFjdGl2YXRlZC4gSXQgbWFrZXMgbmV0d29yayByZXF1ZXN0cyB0aGF0IG5ldmVyIHJldHVybiBpbiBhIHRlc3QgZW52LlxuICBmZWF0dXJlQ29uZmlnLnNldCgnaW5zdGFsbFJlY29tbWVuZGVkUGFja2FnZXMnLCBmYWxzZSk7XG5cbiAgLy8gSW5jbHVkZSB0aGUgcGF0aCB0byB0aGUgbnVjbGlkZSBwYWNrYWdlLlxuICBwYWNrYWdlTmFtZXMucHVzaChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vLi4nKSk7XG4gIGF3YWl0IFByb21pc2UuYWxsKHBhY2thZ2VOYW1lcy5tYXAocGFjayA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKSkpO1xuICByZXR1cm4gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlcygpLm1hcChwYWNrID0+IHBhY2submFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlQWxsUGFja2FnZXMoKTogdm9pZCB7XG4gIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2VzKCk7XG4gIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZXMoKTtcbn1cbiJdfQ==