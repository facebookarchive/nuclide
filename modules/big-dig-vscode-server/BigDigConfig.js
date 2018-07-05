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

import * as proto from './Protocol';
import * as pathModule from 'path';
import fs from 'big-dig/src/common/fs';
import toml from 'toml';

/** Name of a Big Dig configuration file. */
const CONFIG_FILE_NAME = '.bigdig.toml';

/**
 * Looks in directory and its parent directories until it finds one with a
 * .bigdig.toml file. If it finds one, it parses it and returns a BigDigConfig
 * with its parsed contents; otherwise, returns null.
 */
export async function findBigDigConfig(
  directory: string,
): Promise<?BigDigConfig> {
  const file = await fs.findNearestFile(CONFIG_FILE_NAME, directory);
  if (file == null) {
    return null;
  }

  const contents = await fs.readFileAsString(file);
  const data = toml.parse(contents);
  return new BigDigConfig(file, data);
}

/**
 * This represents a .bigdig.toml file that has been processed. All of the
 * configuration data is stored in this class, which is why its getter methods
 * are synchronous.
 */
class BigDigConfig {
  _file: string;
  _dir: string;
  _data: Object;

  constructor(file: string, data: Object) {
    this._file = file;
    this._dir = pathModule.dirname(file);
    this._data = data;
  }

  getFile() {
    return this._file;
  }

  getLspConfigs(): {[name: string]: proto.LspConfig} {
    const {lsp} = this._data;
    if (lsp == null) {
      return {};
    }

    const configs = {};
    for (const [key, value] of Object.entries(lsp)) {
      const config = this._parseCommonExecArgs(value);
      const rootPath =
        (value: any).rootPath != null
          ? pathModule.resolve(this._dir, (value: any).rootPath)
          : null;
      configs[key] = {...config, rootPath};
    }
    return configs;
  }

  getDebuggerConfigs(): {[name: string]: proto.DebuggerConfig} {
    // "debugger" is a reserved word, hence the rename.
    const {debugger: _debugger} = this._data;
    if (_debugger == null) {
      return {};
    }

    const configs = {};
    for (const [key, value] of Object.entries(_debugger)) {
      const config = this._parseCommonExecArgs(value);
      const request = (value: any).request === 'launch' ? 'launch' : 'attach';
      configs[key] = {...config, request};
    }
    return configs;
  }

  _parseCommonExecArgs(value: mixed) {
    const {language, command, args, cwd: _cwd} = (value: any);
    let cwd;
    if (_cwd == null) {
      cwd = this._dir;
    } else if (pathModule.isAbsolute(_cwd)) {
      cwd = _cwd;
    } else {
      cwd = pathModule.join(this._dir, _cwd);
    }

    return {
      language: asArrayOfStrings(language),
      command: typeof command === 'string' ? command : '',
      args: asArrayOfStrings(args),
      cwd,
    };
  }
}

/**
 * If `value` is an array where all of the elements are strings, returns value;
 * otherwise, returns an empty array.
 */
function asArrayOfStrings(value: any): Array<string> {
  if (Array.isArray(value) && value.every(x => typeof x === 'string')) {
    return value;
  }
  return [];
}
