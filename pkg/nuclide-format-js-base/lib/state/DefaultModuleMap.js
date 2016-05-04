function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ModuleMap = require('./ModuleMap');

var _ModuleMap2 = _interopRequireDefault(_ModuleMap);

var DefaultModuleMap = new _ModuleMap2.default({
  paths: [],
  pathsToRelativize: [],
  aliases: require('../constants/commonAliases'),
  aliasesToRelativize: new Map(),
  builtIns: require('../constants/builtIns'),
  builtInTypes: require('../constants/builtInTypes')
});

module.exports = DefaultModuleMap;