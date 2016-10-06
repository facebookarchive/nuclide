

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