'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../nuclide-commons/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../nuclide-commons/collection');
}

var _debuggerRegistry;

function _load_debuggerRegistry() {
  return _debuggerRegistry = require('../../nuclide-debugger-common/debugger-registry');
}

var _VSPOptionsParser;

function _load_VSPOptionsParser() {
  return _VSPOptionsParser = _interopRequireDefault(require('./VSPOptionsParser'));
}

var _HHVMDebugAdapter;

function _load_HHVMDebugAdapter() {
  return _HHVMDebugAdapter = _interopRequireDefault(require('./adapters/HHVMDebugAdapter'));
}

var _NativeGdbDebugAdapter;

function _load_NativeGdbDebugAdapter() {
  return _NativeGdbDebugAdapter = _interopRequireDefault(require('./adapters/NativeGdbDebugAdapter'));
}

var _NodeDebugAdapter;

function _load_NodeDebugAdapter() {
  return _NodeDebugAdapter = _interopRequireDefault(require('./adapters/NodeDebugAdapter'));
}

var _OCamlDebugAdapter;

function _load_OCamlDebugAdapter() {
  return _OCamlDebugAdapter = _interopRequireDefault(require('./adapters/OCamlDebugAdapter'));
}

var _PythonDebugAdapter;

function _load_PythonDebugAdapter() {
  return _PythonDebugAdapter = _interopRequireDefault(require('./adapters/PythonDebugAdapter'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class DebuggerAdapterFactory {
  constructor() {
    this._debugAdapters = [new (_HHVMDebugAdapter || _load_HHVMDebugAdapter()).default(), new (_NativeGdbDebugAdapter || _load_NativeGdbDebugAdapter()).default(), new (_NodeDebugAdapter || _load_NodeDebugAdapter()).default(), new (_OCamlDebugAdapter || _load_OCamlDebugAdapter()).default(), new (_PythonDebugAdapter || _load_PythonDebugAdapter()).default()];
  }

  adapterFromArguments(args) {
    let adapter;

    if (args.attach) {
      adapter = this._parseAttachArguments(args);
    } else {
      adapter = this._parseLaunchArguments(args);
    }

    return adapter;
  }

  contextSensitiveHelp(args) {
    const adapter = this._adapterFromCommandLine(args);
    if (adapter == null) {
      return [];
    }

    const root = (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterPackageRoot)(adapter.key);
    const optionsParser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const action = args.attach ? 'attach' : 'launch';

    return optionsParser.commandLineHelp(adapter.type, action, adapter.excludedOptions, adapter.customArguments);
  }

  _parseAttachArguments(args) {
    const adapter = this._adapterFromCommandLine(args);

    if (adapter == null) {
      throw new Error('Debugger type not specified; please use "--type" to specify it.');
    }

    const commandLineArgs = adapter.parseArguments(args);

    return {
      action: 'attach',
      type: adapter.key,
      adapterInfo: (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterExecutable)(adapter.key),
      attachArgs: (0, (_collection || _load_collection()).objectFromMap)(commandLineArgs),
      adapter
    };
  }

  _parseLaunchArguments(args) {
    const launchArgs = args._;
    const program = launchArgs[0];

    if (program == null) {
      throw new Error('--attach not specified and no program to debug specified on the command line.');
    }

    const adapter = this._adapterFromCommandLine(args) || this._adapterFromProgramName(program);

    if (adapter == null) {
      throw new Error('Could not determine the type of program being debugged. Please specifiy with the "--type" option.');
    }

    const commandLineArgs = adapter.parseArguments(args);

    return {
      action: 'launch',
      type: adapter.key,
      adapterInfo: (0, (_debuggerRegistry || _load_debuggerRegistry()).getAdapterExecutable)(adapter.key),
      launchArgs: (0, (_collection || _load_collection()).objectFromMap)(commandLineArgs),
      adapter
    };
  }

  _adapterFromCommandLine(args) {
    const type = args.type;
    if (type != null) {
      const adapter = this._debugAdapters.find(a => a.key === type);

      if (adapter == null) {
        const validAdapters = this._debugAdapters.map(a => a.key).join('", "');
        throw new Error(`Invalid target type "${type}"; valid types are "${validAdapters}".`);
      }

      return adapter;
    }

    return null;
  }

  _adapterFromProgramName(program) {
    const programUri = (_nuclideUri || _load_nuclideUri()).default.parsePath(program);
    const ext = programUri.ext;

    const adapters = this._debugAdapters.filter(a => a.extensions.has(ext));

    if (adapters.length > 1) {
      throw new Error(`Multiple debuggers can debug programs with extension ${ext}. Please explicitly specify one with '--type'`);
    }

    return adapters[0];
  }
}
exports.default = DebuggerAdapterFactory;