'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type ModuleMap from 'nuclide-format-js-base/lib/state/ModuleMap';
import type {SourceOptions} from 'nuclide-format-js-base/lib/options/SourceOptions';

var {Directory, File} = require('atom');
var NuclideCommons = require('nuclide-commons');

var formatJSBase = require('nuclide-format-js-base');

// These are the common settings needed to construct a module map.
type Settings = {
  aliases: Array<[string, string]>,
  builtIns: Array<string>,
  builtInTypes: Array<string>,
};

var arrayFrom = NuclideCommons.array.from;

var {createModuleMap} = formatJSBase;
// We need this in array formats.
var defaultAliases = arrayFrom(formatJSBase.defaultAliases);
var defaultBuiltIns = arrayFrom(formatJSBase.defaultBuiltIns);
var defaultBuiltInTypes = arrayFrom(formatJSBase.defaultBuiltInTypes);

/**
 * Single entry point to get the options for a source file. Deals with finding
 * the configuration file and caching.
 */
async function getOptions(sourcePath: string): SourceOptions {
  var jsonFile = getJSON(sourcePath);
  if (!jsonFile) {
    return getNuclideOptions(sourcePath);
  }

  // Parse the json.
  var json = JSON.parse(await jsonFile.read());

  // Construct the blacklist.
  var blacklist = getNuclideBlacklist();
  if (json.blacklist) {
    json.blacklist.forEach(transform => blacklist.add(transform));
  }

  // Construct the module map.
  var rootDir = jsonFile.getParent();
  var nuclideSettings = getNuclideSettings();
  var jsonSettings = getJSONSettings(json);

  var aliases = new Map([
    ...defaultAliases,
    ...nuclideSettings.aliases,
    ...jsonSettings.aliases,
  ]);
  var builtIns = new Set([
    ...defaultBuiltIns,
    ...nuclideSettings.builtIns,
    ...jsonSettings.builtIns,
  ]);
  var builtInTypes = new Set([
    ...defaultBuiltInTypes,
    ...nuclideSettings.builtInTypes,
    ...jsonSettings.builtInTypes,
  ]);

  var moduleMapOptions = {
    paths: [],
    pathsToRelativize: [],
    aliases,
    aliasesToRelativize: new Map(),
    builtIns,
    builtInTypes,
  };

  // Add the paths to the module map options. Make sure to take into account
  // relativization.
  var paths = getPaths(rootDir, json);

  if (json.relativize) {
    moduleMapOptions.pathsToRelativize = paths;
  } else {
    moduleMapOptions.paths = paths;
  }

  var moduleMap = createModuleMap(moduleMapOptions);

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
  var startFile = new File(sourcePath);
  var current = startFile.getParent();
  while (true) {
    var jsonFile = current.getFile('formatjs.json');
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
  var pathGroups: Array<Array<string>> = [];
  var entries = directory.getEntriesSync();
  for (var entry of entries) {
    var path = entry.getRealPathSync();

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
    aliases: fixAliases((atom.config.get('nuclide-format-js.aliases'): any)),
    builtIns: atom.config.get('nuclide-format-js.builtIns'),
    builtInTypes: atom.config.get('nuclide-format-js.builtInTypes'),
  };
}

/**
 * Constructs a module map from the settings.
 *
 * TODO: Cache things.
 */
function getNuclideModuleMap(): ModuleMap {
  // Get all the options from atom config.
  var settings = getNuclideSettings();

  // Construct the aliases.
  var aliases = new Map(settings.aliases);
  for (var entry of defaultAliases) {
    var [key, value] = entry;
    if (!aliases.has(key)) {
      aliases.set(key, value);
    }
  }

  // Construct the built ins.
  var builtIns = new Set(defaultBuiltIns);
  for (var builtIn of settings.builtIns) {
    builtIns.add(builtIn);
  }

  // Construct built in types.
  var builtInTypes = new Set(defaultBuiltInTypes);
  for (var builtInType of settings.builtInTypes) {
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
  var blacklist = new Set();
  if (!atom.config.get('nuclide-format-js.nuclideFixHeader')) {
    blacklist.add('nuclide.fixHeader');
  }
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

// Some small helper functions.

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

module.exports = {getOptions};
