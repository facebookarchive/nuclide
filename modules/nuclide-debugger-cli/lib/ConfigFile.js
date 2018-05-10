/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import fs from 'fs';
import os from 'os';
import nuclideUri from 'nuclide-commons/nuclideUri';
import yargs from 'yargs';
import {mapFromObject} from 'nuclide-commons/collection';

export type Preset = {
  description: string,
  args: Array<string>,
  aliases: {[string]: string},
};

type PresetSummary = {
  name: string,
  description: string,
};

type ConfigFileContents = {
  aliases?: {[string]: string},
  presets: {
    [string]: Preset,
  },
};

export default class ConfigFile {
  _config: ConfigFileContents;

  constructor() {
    const configFiles = [
      '/usr/local/share/fbdbg/config.json',
      nuclideUri.join(os.homedir(), '.fbdbg', 'config.json'),
    ];
    // $FlowFixMe Flow doesn't understand Object.assign
    this._config = configFiles
      .filter(fname => fs.existsSync(fname))
      .reduce((agg, fname) => {
        try {
          const contents = fs.readFileSync(fname, 'utf8');
          const presets = JSON.parse(contents);
          const combined = {presets: {}};
          Object.assign(combined, agg, presets);
          return combined;
        } catch (_) {
          throw new Error(`Invalid JSON in config file ${fname}.`);
        }
      }, {});
  }

  getPresetFromArguments(): ?Preset {
    const name = yargs.argv.preset;
    if (name != null) {
      const preset = this._config.presets[name];
      if (preset == null) {
        throw new Error(`Preset '${name}' not found -- check config files.`);
      }

      return preset;
    }

    return null;
  }

  applyPresetToArguments(preset: Preset): Array<string> {
    // we want to put the args from the preset first, so the user can override
    // them on the command line.
    // for now, only replace $USER instead of doing a global environment check
    //
    const user = os.userInfo().username;
    const args = preset.args.map(arg => arg.replace(/\$USER/g, user));
    return args.concat(process.argv.splice(2));
  }

  resolveAliasesForPreset(preset: ?Preset): Map<string, string> {
    const aliases = this._config.aliases || {};
    const presetAliases = (preset && preset.aliases) || {};
    const resolved = Object.assign(aliases, aliases, presetAliases);

    return mapFromObject(resolved);
  }

  presets(): Array<PresetSummary> {
    const keys = Object.keys(this._config.presets);
    keys.sort();

    return keys.map(name => ({
      name,
      description: this._config.presets[name].description,
    }));
  }
}
