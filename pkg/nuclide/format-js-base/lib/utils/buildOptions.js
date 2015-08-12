'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExternalOptions, Options} from '../types/options';

var constantBuiltInTypes = require('../constants/builtInTypes');
var constantBuiltIns = require('../constants/builtIns');
var constantCommonAliases = require('../constants/commonAliases');

function buildOptions(options: ?ExternalOptions): Options {
  options = options || {};

  // Pull out everything so it's safe to use
  var optionsBuiltIns = options.builtIns || [];
  var optionsBuiltInBlacklist = options.builtInBlacklist || [];
  var optionsBuiltInTypes = options.builtInTypes || [];
  var optionsBuiltInTypeBlacklist = options.builtInTypeBlacklist || [];
  var optionsCommonAliases = options.commonAliases || [];

  // Construct builtIns
  var builtIns = new Set(constantBuiltIns);
  for (var addBuiltIn of optionsBuiltIns) {
    builtIns.add(addBuiltIn);
  }
  for (var deleteBuiltIn of optionsBuiltInBlacklist) {
    builtIns.delete(deleteBuiltIn);
  }

  // Construct builInTypes
  var builtInTypes = new Set(constantBuiltInTypes);
  for (var addBuiltInType of optionsBuiltInTypes) {
    builtInTypes.add(addBuiltInType);
  }
  for (var deleteBuiltInType of optionsBuiltInTypeBlacklist) {
    builtInTypes.delete(deleteBuiltInType);
  }

  // Construct common aliases
  var commonAliases = new Map();
  for (var entry of constantCommonAliases) {
    var [key, value] = entry;
    commonAliases.set(key, value);
  }
  for (var entry of optionsCommonAliases) {
    var [key, value] = entry;
    commonAliases.set(key, value);
  }

  // TODO: Freeze this, can I use Object.freeze()?
  return {builtIns, builtInTypes, commonAliases};
}

module.exports = buildOptions;
