'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ModuleMap from './state/ModuleMap';
import type {ModuleMapOptions} from './options/ModuleMapOptions';

module.exports = {
  get transform() {
    return require('./transform');
  },

  createModuleMap(options: ModuleMapOptions): ModuleMap {
    const ModuleMapClass = require('./state/ModuleMap');
    return new ModuleMapClass(options);
  },

  // Some easy to use defaults to construct ModuleMapOptions with.
  get defaultBuiltIns() {
    return require('./constants/builtIns');
  },
  get defaultBuiltInTypes() {
    return require('./constants/builtInTypes');
  },
  get defaultAliases() {
    return require('./constants/commonAliases');
  },
};
