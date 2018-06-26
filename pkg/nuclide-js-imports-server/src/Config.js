'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeConfig = serializeConfig;
exports.getEslintGlobals = getEslintGlobals;
exports.getConfigFromFlow = getConfigFromFlow;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

var _globals;

function _load_globals() {
  return _globals = _interopRequireWildcard(require('globals'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _vm = _interopRequireDefault(require('vm'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ALL_ENVS = Object.keys(_globals || _load_globals());

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

function serializeConfig(config) {
  const { moduleDirs, hasteSettings: settings } = config;
  // RegExps aren't normally stringifyable.
  return JSON.stringify({
    moduleDirs,
    hasteSettings: {
      isHaste: settings.isHaste,
      useNameReducers: settings.useNameReducers,
      nameReducers: settings.nameReducers.map(reducer => ({
        regexp: reducer.regexp.toString(),
        replacement: reducer.replacement
      })),
      nameReducerBlacklist: settings.nameReducerBlacklist.map(String),
      nameReducerWhitelist: settings.nameReducerWhitelist.map(String)
    }
  });
}

function getEslintGlobals(root) {
  return parseEslintrc((_nuclideUri || _load_nuclideUri()).default.join(root, '.eslintrc')) || parseEslintrcJs((_nuclideUri || _load_nuclideUri()).default.join(root, '.eslintrc.js')) || packageJsonEslintConfig((_nuclideUri || _load_nuclideUri()).default.join(root, 'package.json')) || Array.from(getGlobalsForEnvs(ALL_ENVS));
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
    moduleDirs = flowConfigToResolveDirnames(flowFile, flowConfigContents).concat(getYarnWorkspaces(root));
    hasteSettings = flowConfigToHasteSettings(root, flowConfigContents);
  } catch (error) {}
  return {
    moduleDirs,
    hasteSettings
  };
}

function flowConfigToResolveDirnames(flowFile, flowFileContents) {
  const resolveDirs = flowFileContents.match(/module.system.node.resolve_dirname=([^\s]+)/g);
  return resolveDirs ? resolveDirs.map(dirString => (_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(flowFile), dirString.split('=')[1])) : [(_nuclideUri || _load_nuclideUri()).default.join((_nuclideUri || _load_nuclideUri()).default.dirname(flowFile), 'node_modules')];
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

function parseEslintrc(eslintFile) {
  try {
    const json = JSON.parse(_fs.default.readFileSync(eslintFile, 'utf8'));
    return parseEslintConfig(json);
  } catch (err) {}
  return null;
}

function parseEslintrcJs(eslintFile) {
  try {
    const js = _fs.default.readFileSync(eslintFile, 'utf8');
    // Hopefully .eslintrc.js doesn't require very much.
    const sandbox = { module: {}, require };
    const context = _vm.default.createContext(sandbox);
    _vm.default.runInContext(js, context);
    if (sandbox.module.exports) {
      return parseEslintConfig(sandbox.module.exports);
    } else if (sandbox.exports) {
      return parseEslintConfig(sandbox.exports);
    }
  } catch (err) {}
  return null;
}

function packageJsonEslintConfig(packageJsonFile) {
  try {
    const json = JSON.parse(_fs.default.readFileSync(packageJsonFile, 'utf8'));
    if (json.eslintConfig) {
      return parseEslintConfig(json.eslintConfig);
    }
  } catch (err) {}
  return null;
}

function parseEslintConfig(config) {
  let globals = new Set();
  if (config.globals && typeof config.globals === 'object') {
    globals = new Set(Object.keys(config.globals));
  }
  let envs = ALL_ENVS;
  if (config.env && typeof config.env === 'object') {
    envs = Object.keys(config.env).filter(key => config.env[key]);
  }
  getGlobalsForEnvs(envs).forEach(x => globals.add(x));
  return Array.from(globals);
}

function getGlobalsForEnvs(envs) {
  const globals = new Set();
  envs.forEach(env => {
    if ((_globals || _load_globals())[env]) {
      Object.keys((_globals || _load_globals())[env]).forEach(x => globals.add(x));
    }
  });
  return globals;
}

function getYarnWorkspaces(root) {
  try {
    const packageJsonFile = (_nuclideUri || _load_nuclideUri()).default.join(root, 'package.json');
    const json = JSON.parse(_fs.default.readFileSync(packageJsonFile, 'utf8'));
    if (Array.isArray(json.workspaces)) {
      return Array.from(new Set(json.workspaces.map(workspace => {
        // Yarn workspaces can be a glob pattern (folder/*) or specific paths.
        // Either way, getting the dirname should work for most cases.
        if (typeof workspace === 'string') {
          try {
            return (_nuclideUri || _load_nuclideUri()).default.resolve(root, (_nuclideUri || _load_nuclideUri()).default.dirname(workspace));
          } catch (err) {
            (0, (_log4js || _load_log4js()).getLogger)('js-imports-server').error(`Could not parse Yarn workspace: ${workspace}`, err);
            return null;
          }
        }
      }).filter(Boolean)));
    }
  } catch (err) {}
  return [];
}