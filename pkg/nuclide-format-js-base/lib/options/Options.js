function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

/**
 * Valides the options used to construct a module map.
 */
function validateModuleMapOptions(options) {
  (0, (_assert2 || _assert()).default)(options, 'Invalid (undefined) ModuleMapOptions given.');

  // Validate presence of correct fields.
  (0, (_assert2 || _assert()).default)(options.paths, '`paths` must be provided.');
  (0, (_assert2 || _assert()).default)(options.pathsToRelativize, '`pathsToRelativze` must be provided.');
  (0, (_assert2 || _assert()).default)(options.aliases, '`aliases` must be provided.');
  (0, (_assert2 || _assert()).default)(options.aliasesToRelativize, '`aliasesToRelativze` must be provided.');
  (0, (_assert2 || _assert()).default)(options.builtIns, '`builtIns` must be provided.');
  (0, (_assert2 || _assert()).default)(options.builtInTypes, '`builtInTypes` must be provided.');

  // TODO: Use let.
  var filePath = undefined;
  for (filePath of options.paths) {
    (0, (_assert2 || _assert()).default)(isAbsolute(filePath), 'All paths must be absolute.');
  }
  for (filePath of options.pathsToRelativize) {
    (0, (_assert2 || _assert()).default)(isAbsolute(filePath), 'All paths must be absolute.');
  }
}

/**
 * Valides the options used to get requires out of a module map.
 */
function validateRequireOptions(options) {
  (0, (_assert2 || _assert()).default)(options, 'Invalid (undefined) RequireOptions given.');
}

/**
 * Validates the options given as input to transform.
 */
function validateSourceOptions(options) {
  (0, (_assert2 || _assert()).default)(options, 'Invalid (undefined) SourceOptions given.');
  if (options.sourcePath != null) {
    (0, (_assert2 || _assert()).default)(isAbsolute(options.sourcePath), 'If a "sourcePath" is given it must be an absolute path.');
  }
  (0, (_assert2 || _assert()).default)(options.moduleMap, 'A "moduleMap" must be provided in order to transform the source.');
}

/**
 * Small helper function to validate that a path is absolute. We also need to
 * allow remote nuclide files.
 */
function isAbsolute(sourcePath) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(sourcePath));
}

var Options = {
  validateModuleMapOptions: validateModuleMapOptions,
  validateRequireOptions: validateRequireOptions,
  validateSourceOptions: validateSourceOptions
};

module.exports = Options;