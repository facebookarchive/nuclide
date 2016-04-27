var _require = require('../../../nuclide-remote-uri');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getPath = _require.getPath;

var invariant = require('assert');
var path = require('path');

/**
 * Valides the options used to construct a module map.
 */
function validateModuleMapOptions(options) {
  invariant(options, 'Invalid (undefined) ModuleMapOptions given.');

  // Validate presence of correct fields.
  invariant(options.paths, '`paths` must be provided.');
  invariant(options.pathsToRelativize, '`pathsToRelativze` must be provided.');
  invariant(options.aliases, '`aliases` must be provided.');
  invariant(options.aliasesToRelativize, '`aliasesToRelativze` must be provided.');
  invariant(options.builtIns, '`builtIns` must be provided.');
  invariant(options.builtInTypes, '`builtInTypes` must be provided.');

  // TODO: Use let.
  var filePath = undefined;
  for (filePath of options.paths) {
    invariant(isAbsolute(filePath), 'All paths must be absolute.');
  }
  for (filePath of options.pathsToRelativize) {
    invariant(isAbsolute(filePath), 'All paths must be absolute.');
  }
}

/**
 * Valides the options used to get requires out of a module map.
 */
function validateRequireOptions(options) {
  invariant(options, 'Invalid (undefined) RequireOptions given.');
}

/**
 * Validates the options given as input to transform.
 */
function validateSourceOptions(options) {
  invariant(options, 'Invalid (undefined) SourceOptions given.');
  if (options.sourcePath != null) {
    invariant(isAbsolute(options.sourcePath), 'If a "sourcePath" is given it must be an absolute path.');
  }
  invariant(options.moduleMap, 'A "moduleMap" must be provided in order to transform the source.');
}

/**
 * Small helper function to validate that a path is absolute. We also need to
 * allow remote nuclide files.
 */
function isAbsolute(sourcePath) {
  return path.isAbsolute(getPath(sourcePath));
}

var Options = {
  validateModuleMapOptions: validateModuleMapOptions,
  validateRequireOptions: validateRequireOptions,
  validateSourceOptions: validateSourceOptions
};

module.exports = Options;