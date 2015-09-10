'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  createModuleMap,
  defaultAliases,
  defaultBuiltIns,
  defaultBuiltInTypes,
} = require('nuclide-format-js-base');

// Sets up the default module map.
var moduleMap = createModuleMap({
  paths: [],
  pathsToRelativize: [],
  aliases: defaultAliases,
  aliasesToRelativize: new Map(),
  builtIns: defaultBuiltIns,
  builtInTypes: defaultBuiltInTypes,
});

/**
 * Small getter function to expose the saved module map.
 */
function getModuleMap(): Object {
  return moduleMap;
}

/**
 * Whenever the options change we need to update the module map.
 */
function refreshOptions(): void {
  // Get all the options from atom config.
  var options = {
    aliases: fixAliases((atom.config.get('nuclide-format-js.aliases'): any)),
    builtIns: atom.config.get('nuclide-format-js.builtIns'),
    builtInTypes: atom.config.get('nuclide-format-js.builtInTypes'),
  };

  // Construct the aliases.
  var aliases = new Map(options.aliases);
  for (var entry of defaultAliases) {
    var [key, value] = entry;
    if (!aliases.has(key)) {
      aliases.set(key, value);
    }
  }

  // Construct the built ins.
  var builtIns = new Set(defaultBuiltIns);
  for (var builtIn of options.builtIns) {
    builtIns.add(builtIn);
  }

  // Construct built in types.
  var builtInTypes = new Set(defaultBuiltInTypes);
  for (var builtInType of options.builtInTypes) {
    builtInTypes.add(builtInType);
  }

  // And then update the module map.
  moduleMap = createModuleMap({
    paths: [],
    pathsToRelativize: [],
    aliases,
    aliasesToRelativize: new Map(),
    builtIns,
    builtInTypes,
  });
}

/**
 * Nuclide can't handle nested arrays well in settings, so we save it in a
 * flat array and fix up each pair or entries before using it in the transform
 */
function fixAliases(aliases: ?Array<string>): Array<[string, string]> {
  aliases = aliases || [];
  var pairs = [];
  for (var i = 0; i < aliases.length - 1; i += 2) {
    pairs.push([aliases[i], aliases[i + 1]]);
  }
  return pairs;
}

/**
 * Construct the blacklist from the settings.
 */
function getBlacklist(): Set<string> {
  var blacklist = new Set();
  if (!atom.config.get('nuclide-format-js.requiresTransferComments')) {
    blacklist.add('requires.transferComments');
  }
  if (!atom.config.get('nuclide-format-js.requiresRemoveUnusedRequires')) {
    blacklist.add('requires.removeUnusedRequires');
  }
  if (!atom.config.get('nuclide-format-js.requiresAddMissingRequires')) {
    blacklist.add('requires.addMissingRequires');
  }
  if (!atom.config.get('nuclide-format-js.requiresRemoveUnusedTypes')) {
    blacklist.add('requires.removeUnusedTypes');
  }
  if (!atom.config.get('nuclide-format-js.requiresAddMissingTypes')) {
    blacklist.add('requires.addMissingTypes');
  }
  if (!atom.config.get('nuclide-format-js.requiresFormatRequires')) {
    blacklist.add('requires.formatRequires');
  }
  return blacklist;
}

module.exports = {getModuleMap, getBlacklist, refreshOptions};
