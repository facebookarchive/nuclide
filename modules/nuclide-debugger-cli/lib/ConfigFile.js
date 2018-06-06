'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = _interopRequireDefault(require('fs'));

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

var _yargs;

function _load_yargs() {
  return _yargs = _interopRequireDefault(require('yargs'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ConfigFile {

  constructor() {
    const configFiles = ['/usr/local/share/fbdbg/config.json', (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), '.fbdbg', 'config.json')];
    // $FlowFixMe Flow doesn't understand Object.assign
    this._config = configFiles.filter(fname => _fs.default.existsSync(fname)).reduce((agg, fname) => {
      try {
        const contents = _fs.default.readFileSync(fname, 'utf8');
        const presets = JSON.parse(contents);
        const combined = { presets: {} };
        Object.assign(combined, agg, presets);
        return combined;
      } catch (_) {
        throw new Error(`Invalid JSON in config file ${fname}.`);
      }
    }, {});
  }

  getPresetFromArguments() {
    const name = (_yargs || _load_yargs()).default.argv.preset;
    if (name != null) {
      const preset = this._config.presets[name];
      if (preset == null) {
        throw new Error(`Preset '${name}' not found -- check config files.`);
      }

      return preset;
    }

    return null;
  }

  applyPresetToArguments(preset) {
    // we want to put the args from the preset first, so the user can override
    // them on the command line.
    // for now, only replace $USER instead of doing a global environment check
    //
    const user = _os.default.userInfo().username;
    const args = preset.args.map(arg => arg.replace(/\$USER/g, user));
    return args.concat(process.argv.splice(2));
  }

  resolveAliasesForPreset(preset) {
    const aliases = this._config.aliases || {};
    const presetAliases = preset && preset.aliases || {};
    const resolved = Object.assign(aliases, aliases, presetAliases);

    return (0, (_collection || _load_collection()).mapFromObject)(resolved);
  }

  presets() {
    const keys = Object.keys(this._config.presets);
    keys.sort();

    return keys.map(name => ({
      name,
      description: this._config.presets[name].description
    }));
  }
}
exports.default = ConfigFile; /**
                               * Copyright (c) 2017-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the BSD-style license found in the
                               * LICENSE file in the root directory of this source tree. An additional grant
                               * of patent rights can be found in the PATENTS file in the same directory.
                               *
                               * 
                               * @format
                               */