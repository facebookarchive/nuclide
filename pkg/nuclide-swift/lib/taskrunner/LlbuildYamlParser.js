'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readCompileCommands = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Reads an llbuild YAML file and returns a mapping, with source files as keys,
 * and the Swift compiler arguments used to compile those files as values.
 * If the file does not exist or cannot be read from, returns an empty mapping.
 * If the file contains invalid YAML, throws an exception.
 */
let readCompileCommands = exports.readCompileCommands = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (path) {
    // Read the YAML file into memory.
    let data;
    try {
      data = yield (_fsPromise || _load_fsPromise()).default.readFile(path, 'utf8');
    } catch (e) {
      return new Map();
    }

    // Attempt to parse the YAML, or bail if a parsing error occurs.
    const llbuildYaml = (_jsYaml || _load_jsYaml()).default.safeLoad(data);

    const compileCommands = new Map();
    for (const llbuildCommandKey in llbuildYaml.commands) {
      const llbuildCommand = llbuildYaml.commands[llbuildCommandKey];
      // Not all commands contain source files -- some just link a bunch of
      // prebuilt object files, for example. If there are no source files to
      // gather compile commands for, skip this llbuild command.
      if (!llbuildCommand.sources) {
        continue;
      }

      // If we find source files, map each to a string used to compile it.
      // This string is composed of the compiler arguments ("other-args"),
      // plus all of the Swift source files that need to be compiled together.
      llbuildCommand.sources.forEach(function (source) {
        const otherArgs = llbuildCommand['other-args'] ? llbuildCommand['other-args'] : [];
        compileCommands.set(source, otherArgs.concat(llbuildCommand.sources).join(' '));
      });
    }

    return compileCommands;
  });

  return function readCompileCommands(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * SwiftPM generates YAML, which is then consumed by llbuild. However, it
 * can generate that YAML at one of several paths:
 *
 *   - If the build configuration is 'debug', it generates a 'debug.yaml'.
 *   - If the build configuration is 'release', it generates a 'release.yaml'.
 *   - If no --build-path is specified, it generates
 *     '.build/{debug|release}.yaml'.
 *   - If a --build-path is specified, it generates
 *     '/path/to/build/path/{debug|release.yaml}'.
 *
 * This function returns the path to YAML file that will be generated if a
 * build task is begun with the current store's settings.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

exports.llbuildYamlPath = llbuildYamlPath;

var _jsYaml;

function _load_jsYaml() {
  return _jsYaml = _interopRequireDefault(require('js-yaml'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function llbuildYamlPath(chdir, configuration, buildPath) {
  const yamlFileName = `${configuration}.yaml`;
  if (buildPath.length > 0) {
    return (_nuclideUri || _load_nuclideUri()).default.join(buildPath, yamlFileName);
  } else {
    return (_nuclideUri || _load_nuclideUri()).default.join(chdir, '.build', yamlFileName);
  }
}