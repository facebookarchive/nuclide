Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.default = configMigrator;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var PACKAGE_RENAMES = new Map([['nuclide-clang-atom', 'nuclide-clang'], ['nuclide-debugger-hhvm', 'nuclide-debugger-php'], ['nuclide-debugger-lldb-client', 'nuclide-debugger-native'], ['nuclide-remote-ctags', 'nuclide-ctags']]);

function configMigrator() {
  // Get the config as it exists in `config.cson` - without defaults
  var allNuclideConfigs = atom.config.getRawValue('nuclide', {
    sources: atom.config.getUserConfigPath()
  });

  // Migrate only if there are settings for Nuclide.
  if (typeof allNuclideConfigs !== 'object' || allNuclideConfigs == null) {
    return;
  }

  for (var _ref3 of PACKAGE_RENAMES) {
    var _ref2 = _slicedToArray(_ref3, 2);

    var before = _ref2[0];
    var after = _ref2[1];

    var configValue = allNuclideConfigs[before];
    if (configValue != null) {
      var oldKey = 'nuclide.' + before;
      var newKey = 'nuclide.' + after;

      // Only migrate settings with values.
      if (typeof configValue === 'object' && Object.keys(configValue).length) {
        atom.config.setRawValue(newKey, configValue);
      }

      // Remove old setting so it is not migrated again.
      atom.config.unset(oldKey);
    }
  }
}

module.exports = exports.default;