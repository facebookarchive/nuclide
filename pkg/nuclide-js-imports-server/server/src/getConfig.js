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

const ALL_ENVS = Object.keys((_globals || _load_globals()).default); /**
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
    blacklistedDirs: []
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
  const resolveDirs = flowFileContents.match(/module.system.haste.paths.blacklist=([^\s]+)/g);
  return {
    isHaste,
    blacklistedDirs: isHaste && resolveDirs ? resolveDirs.map(dirString => dirString.split('=')[1]).map(line => line.replace('<PROJECT_ROOT>', root)) : []
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