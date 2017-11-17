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

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes} from '../../nuclide-debugger-common/lib/constants';

export type StartAction = 'launch' | 'attach';

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

export default class DebuggerAdapterFactory {
  _vspServersByTargetType: Map<string, string> = new Map([
    [
      VsAdapterTypes.PYTHON,
      nuclideUri.join(
        __dirname,
        '../../nuclide-debugger-vsp/VendorLib/vs-py-debugger/out/client/debugger/Main.js',
      ),
    ],
    [
      VsAdapterTypes.NODE,
      nuclideUri.join(
        __dirname,
        '../../nuclide-debugger-vsp/VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
      ),
    ],
  ]);

  _targetTypeByFileExtension: Map<string, string> = new Map([
    ['.py', VsAdapterTypes.PYTHON],
    ['.js', VsAdapterTypes.NODE],
  ]);

  adapterFromArguments(args: Arguments): ?ParsedVSAdapter {
    if (args.attach) {
      return this._parseAttachArguments(args);
    } else {
      return this._parseLaunchArguments(args);
    }
  }

  _parseAttachArguments(args: Arguments): ?ParsedVSAdapter {
    const targetType = this._typeFromCommandLine(args);

    if (targetType == null) {
      const error =
        'Could not determine target type. Please use --type to specify it explicitly.';
      throw Error(error);
    }

    const adapterPath = this._vspServersByTargetType.get(targetType);
    invariant(
      adapterPath != null,
      'Adapter server table not properly populated in DebuggerAdapterFactory',
    );
    return {
      action: 'attach',
      adapterInfo: {
        command: 'node',
        args: [adapterPath],
      },
      attachArgs: {
        port: 9229,
      },
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

    const adapterPath = this._vspServersByTargetType.get(targetType);
    invariant(
      adapterPath != null,
      'Adapter server table not properly populated in DebuggerAdapterFactory',
    );

    return {
      action: 'launch',
      adapterInfo: {
        command: 'node',
        args: [adapterPath],
      },
      launchArgs: {
        args: launchArgs.splice(1),
        program: nuclideUri.resolve(program),
        noDebug: false,
        stopOnEntry: true,
      },
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
