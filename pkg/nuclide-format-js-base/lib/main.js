

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = Object.defineProperties({

  createModuleMap: function createModuleMap(options) {
    var ModuleMapClass = require('./state/ModuleMap');
    return new ModuleMapClass(options);
  }

}, {
  transform: {
    get: function get() {
      return require('./transform');
    },
    configurable: true,
    enumerable: true
  },
  defaultBuiltIns: { // Some easy to use defaults to construct ModuleMapOptions with.

    get: function get() {
      return require('./constants/builtIns');
    },
    configurable: true,
    enumerable: true
  },
  defaultBuiltInTypes: {
    get: function get() {
      return require('./constants/builtInTypes');
    },
    configurable: true,
    enumerable: true
  },
  defaultAliases: {
    get: function get() {
      return require('./constants/commonAliases');
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQWNBLE1BQU0sQ0FBQyxPQUFPLDJCQUFHOztBQUtmLGlCQUFlLEVBQUEseUJBQUMsT0FBeUIsRUFBYTtBQUNwRCxRQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNwRCxXQUFPLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3BDOztDQVlGO0FBbkJLLFdBQVM7U0FBQSxlQUFHO0FBQ2QsYUFBTyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDL0I7Ozs7QUFRRyxpQkFBZTs7U0FBQSxlQUFHO0FBQ3BCLGFBQU8sT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7S0FDeEM7Ozs7QUFDRyxxQkFBbUI7U0FBQSxlQUFHO0FBQ3hCLGFBQU8sT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDNUM7Ozs7QUFDRyxnQkFBYztTQUFBLGVBQUc7QUFDbkIsYUFBTyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUM3Qzs7OztFQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIE1vZHVsZU1hcCBmcm9tICcuL3N0YXRlL01vZHVsZU1hcCc7XG5pbXBvcnQgdHlwZSB7TW9kdWxlTWFwT3B0aW9uc30gZnJvbSAnLi9vcHRpb25zL01vZHVsZU1hcE9wdGlvbnMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0IHRyYW5zZm9ybSgpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKTtcbiAgfSxcblxuICBjcmVhdGVNb2R1bGVNYXAob3B0aW9uczogTW9kdWxlTWFwT3B0aW9ucyk6IE1vZHVsZU1hcCB7XG4gICAgY29uc3QgTW9kdWxlTWFwQ2xhc3MgPSByZXF1aXJlKCcuL3N0YXRlL01vZHVsZU1hcCcpO1xuICAgIHJldHVybiBuZXcgTW9kdWxlTWFwQ2xhc3Mob3B0aW9ucyk7XG4gIH0sXG5cbiAgLy8gU29tZSBlYXN5IHRvIHVzZSBkZWZhdWx0cyB0byBjb25zdHJ1Y3QgTW9kdWxlTWFwT3B0aW9ucyB3aXRoLlxuICBnZXQgZGVmYXVsdEJ1aWx0SW5zKCkge1xuICAgIHJldHVybiByZXF1aXJlKCcuL2NvbnN0YW50cy9idWlsdElucycpO1xuICB9LFxuICBnZXQgZGVmYXVsdEJ1aWx0SW5UeXBlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi9jb25zdGFudHMvYnVpbHRJblR5cGVzJyk7XG4gIH0sXG4gIGdldCBkZWZhdWx0QWxpYXNlcygpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnLi9jb25zdGFudHMvY29tbW9uQWxpYXNlcycpO1xuICB9LFxufTtcbiJdfQ==