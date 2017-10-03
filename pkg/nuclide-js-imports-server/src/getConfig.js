'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEslintEnvs = getEslintEnvs;
exports.getConfigFromFlow = getConfigFromFlow;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

var _globals;

function _load_globals() {
  return _globals = _interopRequireDefault(require('globals'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ALL_ENVS = Object.keys((_globals || _load_globals()).default);

/**
 * Haste settings are surprisingly complicated.
 * - isHaste enables haste modules. All files with a @providesModule docblock may be imported
 *   via their module name, without using the full path.
 * - When useNameReducers is enabled, we'll attempt to resolve whitelisted files *without*
 *   @providesModule purely using their name, excluding files in the blacklist.
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

function getEslintEnvs(root) {
  const eslintFile = (_nuclideUri || _load_nuclideUri()).default.join(root, '.eslintrc');
  const packageJsonFile = (_nuclideUri || _load_nuclideUri()).default.join(root, 'package.json');
  return eslintToEnvs(eslintFile) || packageJsonToEnvs(packageJsonFile) || ALL_ENVS;
}

function getConfigFromFlow(root) {
  let moduleDirs = [];
  let hasteSettings = {
    isHaste: false,
    useNameReducers: false,
    nameReducers: [],
    nameReducerWhitelist: [],
    nameReducerBlacklist: []
  };
  try {
    const flowFile = (_nuclideUri || _load_nuclideUri()).default.join(root, '.flowconfig');
    const flowConfigContents = _fs.default.readFileSync(flowFile, 'utf8');
    moduleDirs = flowConfigToResolveDirnames(flowFile, flowConfigContents);
    hasteSettings = flowConfigToHasteSettings(root, flowConfigContents);
  } catch (error) {}
  return {
    moduleDirs,
    hasteSettings
  };
}

function flowConfigToResolveDirnames(flowFile, flowFileContents) {
  const resolveDirs = flowFileContents.match(/module.system.node.resolve_dirname=([^\s]+)/g);
  return resolveDirs ? resolveDirs.map(dirString => (_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(flowFile), dirString.split('=')[1])) : [];
}

function flowConfigToHasteSettings(root, flowFileContents) {
  const isHaste = Boolean(flowFileContents.match(/module.system=haste/));
  const useNameReducers = Boolean(flowFileContents.match(/module.system.haste.use_name_reducers=true/));
  function getPatterns(dirs) {
    return dirs.map(dirString => dirString.split('=')[1]).map(line => new RegExp(line.replace('<PROJECT_ROOT>', root)));
  }
  let nameReducers = [];
  let nameReducerWhitelist = [];
  let nameReducerBlacklist = [];
  if (useNameReducers) {
    const nameReducerMatches = flowFileContents.match(/module.system.haste.name_reducers=(.+)$/gm) || [];
    nameReducers = nameReducerMatches.map(line => {
      const value = line.substr(line.indexOf('=') + 1);
      // Default reducer (example):
      // '^.*/\([a-zA-Z0-9$_.-]+\.js\(\.flow\)?\)$' -> '\1'
      const [regexString, replacementString] = value.split('->').map(x => x.trim());
      const regexp = new RegExp(
      // OCaml regexes escape parentheses.
      regexString.substr(1, regexString.length - 2).replace(/\\([()])/g, '$1'));
      // OCaml uses \1, \2 while JS uses $1, $2...
      const replacement = replacementString.substr(1, replacementString.length - 2).replace(/\\[0-9]/g, '$$1');
      return { regexp, replacement };
    });
    nameReducerWhitelist = getPatterns(flowFileContents.match(/module.system.haste.paths.whitelist=([^\s]+)/g) || []);
    nameReducerBlacklist = getPatterns(flowFileContents.match(/module.system.haste.paths.blacklist=([^\s]+)/g) || []);
  }
  return {
    isHaste,
    useNameReducers,
    nameReducers,
    nameReducerWhitelist,
    nameReducerBlacklist
  };
}

function eslintToEnvs(eslintFile) {
  if (_fs.default.existsSync(eslintFile)) {
    const json = JSON.parse(_fs.default.readFileSync(eslintFile, 'utf8'));
    if (json.env) {
      return Object.keys(json.env).filter(env => json.env[env]);
    }
  }
  return null;
}

function packageJsonToEnvs(packageJsonFile) {
  if (_fs.default.existsSync(packageJsonFile)) {
    const json = JSON.parse(_fs.default.readFileSync(packageJsonFile, 'utf8'));
    if (json.eslintConfig && json.eslintConfig.env) {
      return Object.keys(json.eslintConfig.env).filter(env => json.eslintConfig.env[env]);
    }
  }
  return null;
}