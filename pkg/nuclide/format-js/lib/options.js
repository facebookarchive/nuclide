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

const {Directory, File} = require('atom');
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
 * Single entry point to get the options for a source file. Deals with finding
 * the configuration file and caching.
 */
async function getOptions(sourcePath: string): SourceOptions {
  const jsonFile = getJSON(sourcePath);
  if (!jsonFile) {
    return getNuclideOptions(sourcePath);
  }

  // Parse the json.
  const json = JSON.parse(await jsonFile.read());

  // Construct the blacklist.
  const blacklist = getNuclideBlacklist();
  if (json.blacklist) {
    json.blacklist.forEach(transform => blacklist.add(transform));
  }

  // Construct the module map.
  const rootDir = jsonFile.getParent();
  const nuclideSettings = getNuclideSettings();
  const jsonSettings = getJSONSettings(json);

  const aliases = new Map([
    ...defaultAliases,
    ...nuclideSettings.aliases,
    ...jsonSettings.aliases,
  ]);
  const builtIns = new Set([
    ...defaultBuiltIns,
    ...nuclideSettings.builtIns,
    ...jsonSettings.builtIns,
  ]);
  const builtInTypes = new Set([
    ...defaultBuiltInTypes,
    ...nuclideSettings.builtInTypes,
    ...jsonSettings.builtInTypes,
  ]);

  const moduleMapOptions = {
    paths: [],
    pathsToRelativize: [],
    aliases,
    aliasesToRelativize: new Map(),
    builtIns,
    builtInTypes,
  };

  // Add the paths to the module map options. Make sure to take into account
  // relativization.
  const paths = getPaths(rootDir, json);

  if (json.relativize) {
    moduleMapOptions.pathsToRelativize = paths;
  } else {
    moduleMapOptions.paths = paths;
  }

  const moduleMap = createModuleMap(moduleMapOptions);

  // Put everything together in the source options object.
  return {
    blacklist,
    moduleMap,
    sourcePath,
  };
}

/**
 * Gets the JSON file that has configuration information for the given source
 * file.
 *
 * TODO: Cache things.
 */
function getJSON(sourcePath: string): ?File {
  const startFile = new File(sourcePath);
  let current = startFile.getParent();
  while (true) {
    const jsonFile = current.getFile('formatjs.json');
    if (jsonFile.existsSync()) {
      return jsonFile;
    }
    // Make sure to perform the root check after testing for the file.
    if (current.isRoot()) {
      return undefined;
    }
    current = current.getParent();
  }
}

function getJSONSettings(json: Object): Settings {
  return {
    aliases: fixAliases(json.aliases),
    builtIns: json.builtIns || [],
    builtInTypes: json.builtInTypes || [],
  };
}

function getPaths(directory: Directory, json: Object): Array<string> {
  const pathGroups: Array<Array<string>> = [];
  const entries = directory.getEntriesSync();
  for (const entry of entries) {
    const path = entry.getRealPathSync();

    // Check if we should ignore the path.
    if (
      json.ignorePatterns &&
      json.ignorePatterns.length > 0 &&
      json.ignorePatterns.some(pattern => path.indexOf(pattern) >= 0)
    ) {
      continue;
    }

    // Add appropriate paths to pathGroups.
    if (entry.isFile()) {
      // TODO: Make this configurable.
      if (path.endsWith('.js')) {
        pathGroups.push([path]);
      }
    } else if (entry.isDirectory()) {
      pathGroups.push(getPaths(entry, json));
    }
  }

  return Array.prototype.concat.apply([], pathGroups);
}

// Functions for getting default options based purely on Nuclide's settings.

/**
 * Returns default options based on Nuclide's settings when tehre isn't a
 * configuration file present.
 */
function getNuclideOptions(sourcePath: string): SourceOptions {
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
