'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _constants;

function _load_constants() {
  return _constants = require('nuclide-debugger-common/constants');
}

var _main;

function _load_main() {
  return _main = require('nuclide-debugger-vsps/main');
}

var _VSPOptionsParser;

function _load_VSPOptionsParser() {
  return _VSPOptionsParser = _interopRequireDefault(require('./VSPOptionsParser'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebuggerAdapterFactory {
  constructor() {
    this._vspServersByTargetType = new Map([[(_constants || _load_constants()).VsAdapterTypes.PYTHON, {
      key: 'python',
      type: 'python',
      customArguments: new Map()
    }], [(_constants || _load_constants()).VsAdapterTypes.NODE, {
      key: 'node',
      type: 'node2',
      customArguments: new Map([['sourceMapPathOverrides', {
        typeDescription: 'source-pattern replace-pattern ...',
        parseType: 'array',
        parser: _parseNodeSourceMapPathOverrides
      }]])
    }], [(_constants || _load_constants()).VsAdapterTypes.OCAML, {
      key: 'ocaml',
      type: 'ocaml',
      customArguments: new Map()
    }]]);
    this._targetTypeByFileExtension = new Map([['.py', (_constants || _load_constants()).VsAdapterTypes.PYTHON], ['.js', (_constants || _load_constants()).VsAdapterTypes.NODE]]);
    this._excludeOptions = new Set(['args', 'console', 'diagnosticLogging', 'externalConsole', 'noDebug', 'outputCapture', 'program', 'restart', 'trace', 'verboseDiagnosticLogging']);
    this._includeOptions = new Set(['address', 'port']);
  }

  // These are options which are either managed by the debugger or don't
  // make sense to expose via the command line (such as being for debugging
  // the adapter itself.)


  // These are options that we want to include the defaults for explicitly,
  // if they exist


  adapterFromArguments(args) {
    const node = args.usenode == null ? 'node' : args.usenode;
    let adapter;

    if (args.attach) {
      adapter = this._parseAttachArguments(args);
    } else {
      adapter = this._parseLaunchArguments(args);
    }

    if (adapter != null) {
      if (adapter.adapterInfo.command === 'node') {
        adapter.adapterInfo.command = node;
      }
    }

    return adapter;
  }

  showContextSensitiveHelp(args) {
    const targetType = this._typeFromCommandLine(args);
    if (targetType == null) {
      return;
    }

    const adapter = this._vspServersByTargetType.get(targetType);

    if (!(adapter != null)) {
      throw new Error('Adapter server table not properly populated in DebuggerAdapterFactory');
    }

    const root = (0, (_main || _load_main()).getAdapterPackageRoot)(adapter.key);
    const optionsParser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const action = args.attach ? 'attach' : 'launch';

    optionsParser.showCommandLineHelp(adapter.type, action, this._excludeOptions, adapter.customArguments);
  }

  _parseAttachArguments(args) {
    const targetType = this._typeFromCommandLine(args);

    if (targetType == null) {
      const error = 'Could not determine target type. Please use --type to specify it explicitly.';
      throw Error(error);
    }

    const adapter = this._vspServersByTargetType.get(targetType);

    if (!(adapter != null)) {
      throw new Error('Adapter server table not properly populated in DebuggerAdapterFactory');
    }

    const root = (0, (_main || _load_main()).getAdapterPackageRoot)(adapter.key);
    const parser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const commandLineArgs = parser.parseCommandLine(adapter.type, 'attach', this._excludeOptions, this._includeOptions, adapter.customArguments);

    return {
      action: 'attach',
      adapterInfo: (0, (_main || _load_main()).getAdapterExecutable)(adapter.key),
      attachArgs: (0, (_collection || _load_collection()).objectFromMap)(commandLineArgs)
    };
  }

  _parseLaunchArguments(args) {
    const launchArgs = args._;
    const program = launchArgs[0];

    if (program == null) {
      throw new Error('--attach not specified and no program to debug specified on the command line.');
    }

    let targetType = this._typeFromCommandLine(args);
    if (targetType == null) {
      targetType = this._typeFromProgramName(program);
    }

    if (targetType == null) {
      const error = `Could not determine target type from filename "${program}".` + ' Please use --type to specify it explicitly.';
      throw Error(error);
    }

    const adapter = this._vspServersByTargetType.get(targetType);

    if (!(adapter != null)) {
      throw new Error('Adapter server table not properly populated in DebuggerAdapterFactory');
    }

    const root = (0, (_main || _load_main()).getAdapterPackageRoot)(adapter.key);
    const parser = new (_VSPOptionsParser || _load_VSPOptionsParser()).default(root);
    const commandLineArgs = parser.parseCommandLine(adapter.type, 'launch', this._excludeOptions, this._includeOptions, adapter.customArguments);

    // Overrides
    commandLineArgs.set('args', launchArgs.splice(1));
    commandLineArgs.set('program', (_nuclideUri || _load_nuclideUri()).default.resolve(program));
    commandLineArgs.set('noDebug', false);
    commandLineArgs.set('stopOnEntry', true);
    commandLineArgs.set('cwd', (_nuclideUri || _load_nuclideUri()).default.resolve('.'));

    // $TODO refactor this code to not be so hacky about adapter specific
    // arguments
    if (targetType === (_constants || _load_constants()).VsAdapterTypes.NODE && args.usenode != null) {
      commandLineArgs.set('runtimeExecutable', args.usenode);
    }

    return {
      action: 'launch',
      adapterInfo: (0, (_main || _load_main()).getAdapterExecutable)(adapter.key),
      launchArgs: (0, (_collection || _load_collection()).objectFromMap)(commandLineArgs)
    };
  }

  _typeFromCommandLine(args) {
    const type = args.type;
    if (type != null) {
      if (!this._vspServersByTargetType.get(type)) {
        const valid = Array.from(this._vspServersByTargetType.keys()).join('", "');
        const error = `Invalid target type "${type}"; valid types are "${valid}".`;
        throw new Error(error);
      }

      return type;
    }

    return null;
  }

  _typeFromProgramName(program) {
    const programUri = (_nuclideUri || _load_nuclideUri()).default.parsePath(program);
    return this._targetTypeByFileExtension.get(programUri.ext);
  }
}

exports.default = DebuggerAdapterFactory; /**
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

function _parseNodeSourceMapPathOverrides(entries) {
  if (entries.length % 2 !== 0) {
    throw new Error('Source map path overrides must be a list of pattern pairs.');
  }

  const result = {};

  while (entries.length !== 0) {
    result[entries[0]] = entries[1];
    entries.splice(0, 2);
  }

  return result;
}