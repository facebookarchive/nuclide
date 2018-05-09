'use strict';Object.defineProperty(exports, "__esModule", { value: true });











var _fs = _interopRequireDefault(require('fs'));
var _os = _interopRequireDefault(require('os'));var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));}var _yargs;
function _load_yargs() {return _yargs = _interopRequireDefault(require('yargs'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
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







class ConfigFile {


  constructor() {
    const configFile = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), '.fbdbg', 'config.json');
    try {
      const contents = _fs.default.readFileSync(configFile, 'utf8');
      this._presets = JSON.parse(contents);
    } catch (ex) {
      this._presets = {
        presets: {} };

    }
  }

  applyPresets() {
    const name = (_yargs || _load_yargs()).default.argv.preset;
    if (name == null) {
      return process.argv.splice(2);
    }

    const preset = this._presets.presets[name];
    if (preset == null) {
      throw new Error(
      `Preset '${name}' not found -- check ./fbdbg/config.json.`);

    }

    // we want to put the args from the preset first, so the user can override
    // them on the command line.
    // for now, only replace $USER instead of doing a global environment check
    //
    const user = _os.default.userInfo().username;
    const args = preset.args.map(arg => arg.replace(/\$USER/g, user));
    return args.concat(process.argv.splice(2));
  }

  presets() {
    const keys = Object.keys(this._presets.presets);
    keys.sort();

    return keys.map(name => ({
      name,
      description: this._presets.presets[name].description }));

  }}exports.default = ConfigFile;