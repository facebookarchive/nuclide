'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ModuleMap from '../../format-js-base/lib/state/ModuleMap';
import type {SourceOptions} from '../../format-js-base/lib/options/SourceOptions';

const NuclideCommons = require('../../commons');

const featureConfig = require('../../feature-config');
const formatJSBase = require('../../format-js-base');

// These are the common settings needed to construct a module map.
type Settings = {
  aliases: Array<[string, string]>,
  builtIns: Array<string>,
  builtInTypes: Array<string>,
};

const arrayFrom = NuclideCommons.array.from;

const {createModuleMap} = formatJSBase;
// We need this in array formats.
const defaultAliases = arrayFrom(formatJSBase.defaultAliases);
const defaultBuiltIns = arrayFrom(formatJSBase.defaultBuiltIns);
const defaultBuiltInTypes = arrayFrom(formatJSBase.defaultBuiltInTypes);

/**
 * Single entry point to get the options for a source file.
 * Currently, it only looks at the Nuclide settings, but we may
 * extend it to look at the project-specific configuration file later.
 */
async function getOptions(sourcePath: string): SourceOptions {
  return {
    blacklist: getNuclideBlacklist(),
    moduleMap: getNuclideModuleMap(),
    sourcePath,
  };
}

/**
 * Gets some of the important settings from Nuclide.
 */
function getNuclideSettings(): Settings {
  return {
    aliases: fixAliases((featureConfig.get('nuclide-format-js.aliases'): any)),
    builtIns: featureConfig.get('nuclide-format-js.builtIns'),
    builtInTypes: featureConfig.get('nuclide-format-js.builtInTypes'),
  };
}

/**
 * Constructs a module map from the settings.
 *
 * TODO: Cache things.
 */
function getNuclideModuleMap(): ModuleMap {
  // Get all the options from atom config.
  const settings = getNuclideSettings();

  // Construct the aliases.
  const aliases = new Map(settings.aliases);
  for (const entry of defaultAliases) {
    const [key, value] = entry;
    if (!aliases.has(key)) {
      aliases.set(key, value);
    }
  }

  // Construct the built ins.
  const builtIns = new Set(defaultBuiltIns);
  for (const builtIn of settings.builtIns) {
    builtIns.add(builtIn);
  }

  // Construct built in types.
  const builtInTypes = new Set(defaultBuiltInTypes);
  for (const builtInType of settings.builtInTypes) {
    builtInTypes.add(builtInType);
  }

  // And then construct the module map.
  return createModuleMap({
    paths: [],
    pathsToRelativize: [],
    aliases,
    aliasesToRelativize: new Map(),
    builtIns,
    builtInTypes,
  });
}

/**
 * Construct the blacklist from the settings.
 */
function getNuclideBlacklist(): Set<string> {
  const blacklist = new Set();
  if (!featureConfig.get('nuclide-format-js.nuclideFixHeader')) {
    blacklist.add('nuclide.fixHeader');
  }
  if (!featureConfig.get('nuclide-format-js.requiresTransferComments')) {
    blacklist.add('requires.transferComments');
  }
  if (!featureConfig.get('nuclide-format-js.requiresRemoveUnusedRequires')) {
    blacklist.add('requires.removeUnusedRequires');
  }
  if (!featureConfig.get('nuclide-format-js.requiresAddMissingRequires')) {
    blacklist.add('requires.addMissingRequires');
  }
  if (!featureConfig.get('nuclide-format-js.requiresRemoveUnusedTypes')) {
    blacklist.add('requires.removeUnusedTypes');
  }
  if (!featureConfig.get('nuclide-format-js.requiresAddMissingTypes')) {
    blacklist.add('requires.addMissingTypes');
  }
  if (!featureConfig.get('nuclide-format-js.requiresFormatRequires')) {
    blacklist.add('requires.formatRequires');
  }
  return blacklist;
}

// Some small helper functions.

/**
 * Nuclide can't handle nested arrays well in settings, so we save it in a
 * flat array and fix up each pair or entries before using it in the transform
 */
function fixAliases(aliases: ?Array<string>): Array<[string, string]> {
  aliases = aliases || [];
  const pairs = [];
  for (let i = 0; i < aliases.length - 1; i += 2) {
    pairs.push([aliases[i], aliases[i + 1]]);
  }
  return pairs;
}

module.exports = {getOptions};
