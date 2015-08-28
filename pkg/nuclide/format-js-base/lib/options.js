'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AbsolutePath, RootPath} from './types/common';
import type {Options, ExternalOptions} from './types/options';

var ModuleMap = require('./state/ModuleMap');

var convertOptions = require('./utils/convertOptions');
var path = require('path');

// Options

var DEFAULT_OPTIONS: Options = convertOptions({});
var options: Map<RootPath, Options> = new Map();

/**
 * Build the options (from formatjs.json) for a given root path.
 *
 * Building consitutes saving the resulting options in a global cache as a
 * side-effect of calling this method.
 */
function buildOptions(
  rootPath: RootPath,
  externalOptions: ExternalOptions
): void {
  options.set(rootPath, convertOptions(externalOptions));
}

/**
 * Finds the correct options that correspond to the given source path.
 *
 * buildOptions() should be called with a rootPath that is an ancestor of the
 * given sourcePath before calling this.
 */
function findOptions(sourcePath: AbsolutePath): Options {
  var rootPath = findRootPath(sourcePath);
  if (!rootPath || !options.has(rootPath)) {
    return DEFAULT_OPTIONS;
  }
  return options.get(rootPath);
}

// Helpers for dealing with module maps.

var FAKE_MODULE_MAP = new ModuleMap(
  /* root */ null,
  /* filePaths */ null,
  DEFAULT_OPTIONS,
);
var moduleMaps: Map<RootPath, ModuleMap> = new Map();

/**
 * Build the module map.
 *
 * Building consitutes saving the resulting module map in a global cache as a
 * side-effect of calling this method.
 */
function buildModuleMap(
  rootPath: RootPath,
  filePaths: Array<AbsolutePath>,
): void {
  var moduleMap = new ModuleMap(rootPath, filePaths, findOptions(rootPath));
  moduleMaps.set(rootPath, moduleMap);
}

/**
 * Finds the correct ModuleMap that corresponds to the given source path.
 *
 * buildModuleMap() should be called with a rootPath that is an ancestor of the
 * given sourcePath before calling this.
 */
function findModuleMap(sourcePath: AbsolutePath): ModuleMap {
  var rootPath = findRootPath(sourcePath);
  if (!rootPath || !moduleMaps.has(rootPath)) {
    // TODO: Return a default module map with sane defaults.
    return FAKE_MODULE_MAP;
  }
  return moduleMaps.get(rootPath);
}

/**
 * Finds the root path for the given file. Everything is cached based on the
 * root path.
 */
function findRootPath(sourcePath: AbsolutePath): ?RootPath {
  while (!options.has(sourcePath)) {
    var nextPath = path.dirname(sourcePath);
    // Check if we have hit the root directory to avoid an infinite loop.
    if (nextPath === sourcePath) {
      return null;
    }
    sourcePath = nextPath;
  }
  return sourcePath;
}

module.exports = {
  buildModuleMap,
  buildOptions,
  findModuleMap,
  findOptions,
};
