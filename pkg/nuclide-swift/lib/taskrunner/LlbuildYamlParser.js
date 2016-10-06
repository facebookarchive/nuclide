Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Reads an llbuild YAML file and returns a mapping, with source files as keys,
 * and the Swift compiler arguments used to compile those files as values.
 * If the file does not exist or cannot be read from, returns an empty mapping.
 * If the file contains invalid YAML, throws an exception.
 */

var readCompileCommands = _asyncToGenerator(function* (path) {
  // Read the YAML file into memory.
  var data = undefined;
  try {
    data = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.readFile(path, 'utf8');
  } catch (e) {
    return new Map();
  }

  // Attempt to parse the YAML, or bail if a parsing error occurs.
  var llbuildYaml = (_jsYaml2 || _jsYaml()).default.safeLoad(data);

  var compileCommands = new Map();

  var _loop = function (llbuildCommandKey) {
    var llbuildCommand = llbuildYaml.commands[llbuildCommandKey];
    // Not all commands contain source files -- some just link a bunch of
    // prebuilt object files, for example. If there are no source files to
    // gather compile commands for, skip this llbuild command.
    if (!llbuildCommand.sources) {
      return 'continue';
    }

    // If we find source files, map each to a string used to compile it.
    // This string is composed of the compiler arguments ("other-args"),
    // plus all of the Swift source files that need to be compiled together.
    llbuildCommand.sources.forEach(function (source) {
      var otherArgs = llbuildCommand['other-args'] ? llbuildCommand['other-args'] : [];
      compileCommands.set(source, otherArgs.concat(llbuildCommand.sources).join(' '));
    });
  };

  for (var llbuildCommandKey in llbuildYaml.commands) {
    var _ret = _loop(llbuildCommandKey);

    if (_ret === 'continue') continue;
  }

  return compileCommands;
}

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
);

exports.readCompileCommands = readCompileCommands;
exports.llbuildYamlPath = llbuildYamlPath;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _jsYaml2;

function _jsYaml() {
  return _jsYaml2 = _interopRequireDefault(require('js-yaml'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../../commons-node/fsPromise'));
}

function llbuildYamlPath(chdir, configuration, buildPath) {
  var yamlFileName = configuration + '.yaml';
  if (buildPath.length > 0) {
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(buildPath, yamlFileName);
  } else {
    return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(chdir, '.build', yamlFileName);
  }
}