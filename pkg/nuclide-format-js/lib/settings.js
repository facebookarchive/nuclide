'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ModuleMap from '../../nuclide-format-js-common/lib/state/ModuleMap';
import type {SourceOptions} from '../../nuclide-format-js-common/lib/options/SourceOptions';
import type {TransformKey} from '../../nuclide-format-js-common/lib/types/transforms';

import featureConfig from '../../commons-atom/featureConfig';
import formatJSBase from '../../nuclide-format-js-common';

// Nuclide package settings used to calculate the module map,
// the blacklist, and control the plugin behavior.
export type Settings = {
  aliases: Array<[string, string]>,
  builtIns: Array<string>,
  builtInTypes: Array<string>,
  nuclideFixHeader: boolean,
  requiresTransferComments: boolean,
  requiresRemoveUnusedRequires: boolean,
  requiresAddMissingRequires: boolean,
  requiresRemoveUnusedTypes: boolean,
  requiresAddMissingTypes: boolean,
  requiresFormatRequires: boolean,
  runOnSave: boolean,
};

const {createModuleMap} = formatJSBase;
// We need this in array formats.
const defaultAliases = Array.from(formatJSBase.defaultAliases);
const defaultBuiltIns = Array.from(formatJSBase.defaultBuiltIns);
const defaultBuiltInTypes = Array.from(formatJSBase.defaultBuiltInTypes);

/**
 * Observes the relevant Nuclide package settings.
 */
export function observeSettings(callback: (value: Settings) => void): IDisposable {
  return featureConfig.observe('nuclide-format-js', settings =>
    callback({
      ...settings,
      aliases: fixAliases(settings.aliases),
    }),
  );
}

/**
 * Calculates the current options according to the Nuclide configuration object.
 * This may get expensive in the future as the module map becomes smarter.
 */
export function calculateOptions(settings: Settings): SourceOptions {
  return {
    blacklist: calculateBlacklist(settings),
    moduleMap: calculateModuleMap(settings),
  };
}

/**
 * Calculates a module map from the settings.
 */
function calculateModuleMap(settings: Settings): ModuleMap {
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

  // And then calculate the module map.
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
 * Calculates the blacklist from the settings.
 */
function calculateBlacklist(settings: Settings): Set<TransformKey> {
  const blacklist = new Set();
  if (!settings.nuclideFixHeader) {
    blacklist.add('nuclide.fixHeader');
  }
  if (!settings.requiresTransferComments) {
    blacklist.add('requires.transferComments');
  }
  if (!settings.requiresRemoveUnusedRequires) {
    blacklist.add('requires.removeUnusedRequires');
  }
  if (!settings.requiresAddMissingRequires) {
    blacklist.add('requires.addMissingRequires');
  }
  if (!settings.requiresRemoveUnusedTypes) {
    blacklist.add('requires.removeUnusedTypes');
  }
  if (!settings.requiresAddMissingTypes) {
    blacklist.add('requires.addMissingTypes');
  }
  if (!settings.requiresFormatRequires) {
    blacklist.add('requires.formatRequires');
  }
  return blacklist;
}

// Some small helper functions.

/**
 * Nuclide can't handle nested arrays well in settings, so we save it in a
 * flat array and fix up each pair or entries before using it in the transform
 */
function fixAliases(aliases_: ?Array<string>): Array<[string, string]> {
  let aliases = aliases_;
  aliases = aliases || [];
  const pairs = [];
  for (let i = 0; i < aliases.length - 1; i += 2) {
    pairs.push([aliases[i], aliases[i + 1]]);
  }
  return pairs;
}
