/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  LaunchRequestArguments,
  AttachRequestArguments,
} from 'vscode-debugprotocol';
import type {VSAdapterExecutableInfo} from '../lib/types';
import type {StartAction} from './VSPOptionsData';
import type {CustomArgumentType} from './VSPOptionsParser';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {objectFromMap} from 'nuclide-commons/collection';
import {VsAdapterTypes} from '../../nuclide-debugger-common/lib/constants';
import VSPOptionsParser from './VSPOptionsParser';

export type ParsedVSAdapter = {
  action: StartAction,
  adapterInfo: VSAdapterExecutableInfo,
  launchArgs?: LaunchRequestArguments,
  attachArgs?: AttachRequestArguments,
};

type Arguments = {
  _: string[],
  type?: string,
  attach: boolean,
};

type AdapterData = {
  interpreter: string,
  serverScript: string,
  packagePath: string,
  type: string,
  customArguments: Map<string, CustomArgumentType>,
};

export default class DebuggerAdapterFactory {
  _vspServersByTargetType: Map<string, AdapterData> = new Map([
    [
      VsAdapterTypes.PYTHON,
      {
        interpreter: 'node',
        serverScript: nuclideUri.join(
          __dirname,
          '../../nuclide-debugger-vsp/VendorLib/vs-py-debugger/out/client/debugger/Main.js',
        ),
        packagePath: nuclideUri.join(
          __dirname,
          '../../nuclide-debugger-vsp/VendorLib/vs-py-debugger',
        ),
        type: 'python',
        customArguments: new Map(),
      },
    ],
    [
      VsAdapterTypes.NODE,
      {
        interpreter: 'node',
        serverScript: nuclideUri.join(
          __dirname,
          '../../nuclide-debugger-vsp/VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
        ),
        packagePath: nuclideUri.join(
          __dirname,
          '../../nuclide-debugger-vsp/VendorLib/vscode-node-debug2',
        ),
        type: 'node2',
        customArguments: new Map([
          [
            'sourceMapPathOverrides',
            {
              typeDescription: 'source-pattern replace-pattern ...',
              parseType: 'array',
              parser: _parseNodeSourceMapPathOverrides,
            },
          ],
        ]),
      },
    ],
  ]);

  _targetTypeByFileExtension: Map<string, string> = new Map([
    ['.py', VsAdapterTypes.PYTHON],
    ['.js', VsAdapterTypes.NODE],
  ]);

  // These are options which are either managed by the debugger or don't
  // make sense to expose via the command line (such as being for debugging
  // the adapter itself.)
  _excludeOptions: Set<string> = new Set([
    'args',
    'console',
    'diagnosticLogging',
    'externalConsole',
    'noDebug',
    'outputCapture',
    'program',
    'restart',
    'trace',
    'verboseDiagnosticLogging',
  ]);

  // These are options that we want to include the defaults for explicitly,
  // if they exist
  _includeOptions: Set<string> = new Set(['address', 'port']);

  adapterFromArguments(args: Arguments): ?ParsedVSAdapter {
    if (args.attach) {
      return this._parseAttachArguments(args);
    } else {
      return this._parseLaunchArguments(args);
    }
  }

  showContextSensitiveHelp(args: Arguments): void {
    const targetType = this._typeFromCommandLine(args);
    if (targetType == null) {
      return;
    }

    const adapter = this._vspServersByTargetType.get(targetType);
    invariant(
      adapter != null,
      'Adapter server table not properly populated in DebuggerAdapterFactory',
    );

    const optionsParser = new VSPOptionsParser(adapter.packagePath);
    const action: StartAction = args.attach ? 'attach' : 'launch';

    optionsParser.showCommandLineHelp(
      adapter.type,
      action,
      this._excludeOptions,
      adapter.customArguments,
    );
  }

  _parseAttachArguments(args: Arguments): ?ParsedVSAdapter {
    const targetType = this._typeFromCommandLine(args);

    if (targetType == null) {
      const error =
        'Could not determine target type. Please use --type to specify it explicitly.';
      throw Error(error);
    }

    const adapter = this._vspServersByTargetType.get(targetType);
    invariant(
      adapter != null,
      'Adapter server table not properly populated in DebuggerAdapterFactory',
    );

    const parser = new VSPOptionsParser(adapter.packagePath);
    const commandLineArgs = parser.parseCommandLine(
      adapter.type,
      'attach',
      this._excludeOptions,
      this._includeOptions,
      adapter.customArguments,
    );

    return {
      action: 'attach',
      adapterInfo: {
        command: adapter.interpreter,
        args: [adapter.serverScript],
      },
      attachArgs: objectFromMap(commandLineArgs),
    };
  }

  _parseLaunchArguments(args: Arguments): ?ParsedVSAdapter {
    const launchArgs = args._;
    const program = launchArgs[0];

    if (program == null) {
      throw new Error(
        '--attach not specified and no program to debug specified on the command line.',
      );
    }

    let targetType = this._typeFromCommandLine(args);
    if (targetType == null) {
      targetType = this._typeFromProgramName(program);
    }

    if (targetType == null) {
      const error =
        `Could not determine target type from filename "${program}".` +
        ' Please use --type to specify it explicitly.';
      throw Error(error);
    }

    const adapter = this._vspServersByTargetType.get(targetType);
    invariant(
      adapter != null,
      'Adapter server table not properly populated in DebuggerAdapterFactory',
    );

    const parser = new VSPOptionsParser(adapter.packagePath);
    const commandLineArgs = parser.parseCommandLine(
      adapter.type,
      'launch',
      this._excludeOptions,
      this._includeOptions,
      adapter.customArguments,
    );

    // Overrides
    commandLineArgs.set('args', launchArgs.splice(1));
    commandLineArgs.set('program', nuclideUri.resolve(program));
    commandLineArgs.set('noDebug', false);
    commandLineArgs.set('stopOnEntry', true);
    commandLineArgs.set('cwd', nuclideUri.resolve('.'));

    return {
      action: 'launch',
      adapterInfo: {
        command: adapter.interpreter,
        args: [adapter.serverScript],
      },
      launchArgs: objectFromMap(commandLineArgs),
    };
  }

  _typeFromCommandLine(args: Arguments): ?string {
    const type = args.type;
    if (type != null) {
      if (!this._vspServersByTargetType.get(type)) {
        const valid = Array.from(this._vspServersByTargetType.keys()).join(
          '", "',
        );
        const error = `Invalid target type "${type}"; valid types are "${valid}".`;
        throw new Error(error);
      }

      return type;
    }

    return null;
  }

  _typeFromProgramName(program: string): ?string {
    const programUri = nuclideUri.parsePath(program);
    return this._targetTypeByFileExtension.get(programUri.ext);
  }
}

function _parseNodeSourceMapPathOverrides(
  entries: string[],
): {[string]: string} {
  if (entries.length % 2 !== 0) {
    throw new Error(
      'Source map path overrides must be a list of pattern pairs.',
    );
  }

  const result = {};

  while (entries.length !== 0) {
    result[entries[0]] = entries[1];
    entries.splice(0, 2);
  }

  return result;
}
