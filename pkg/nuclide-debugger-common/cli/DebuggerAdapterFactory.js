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

import type {LaunchRequestArguments} from 'vscode-debugprotocol';
import type {VSAdapterExecutableInfo} from '../lib/types';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes} from '../../nuclide-debugger-common/lib/constants';

export type ParsedVSAdapter = {
  adapterInfo: VSAdapterExecutableInfo,
  launchArgs: LaunchRequestArguments,
};

type Arguments = {
  _: string[],
  type?: string,
};

export default class DebuggerAdapterFactory {
  _vspServersByTargetType: Map<string, string> = new Map([
    [
      VsAdapterTypes.PYTHON,
      nuclideUri.join(
        __dirname,
        '../../fb-debugger-vscode-adapter/VendorLib/vs-py-debugger/out/client/debugger/Main.js',
      ),
    ],
    [
      VsAdapterTypes.NODE,
      nuclideUri.join(
        __dirname,
        '../../fb-debugger-vscode-adapter/VendorLib/vscode-node-debug2/out/src/nodeDebug.js',
      ),
    ],
  ]);

  _targetTypeByFileExtension: Map<string, string> = new Map([
    ['.py', VsAdapterTypes.PYTHON],
    ['.js', VsAdapterTypes.NODE],
  ]);

  adapterFromArguments(args: Arguments): ?ParsedVSAdapter {
    const launchArgs = args._;
    let targetType = null;

    // command line target overrides everything
    if (args.type !== undefined) {
      targetType = args.type;
      if (!this._vspServersByTargetType.get(targetType)) {
        const error =
          'Invalid target type "' +
          targetType +
          '"; valid types are "' +
          Object.keys(this._vspServersByTargetType).join('", "') +
          '"';
        throw new Error(error);
      }
    }

    if (targetType == null && launchArgs.length > 0) {
      const program = launchArgs[0];

      if (!targetType) {
        // $TODO right now this only supports local launch
        const programUri = nuclideUri.parsePath(program);

        // $TODO if there is no extension, try looking at the shebang
        targetType = this._targetTypeByFileExtension.get(programUri.ext);
        if (targetType === undefined) {
          const error =
            'Could not determine target type from filename "' +
            program +
            '". Please use --type to specify it explicitly.';
          throw Error(error);
        }
      }

      const adapterPath = this._vspServersByTargetType.get(targetType);
      invariant(
        adapterPath !== undefined,
        'Adapter server table not properly populated in DebuggerAdapterFactory',
      );

      return {
        adapterInfo: {
          command: 'node',
          args: [adapterPath],
        },
        launchArgs: {
          args: launchArgs.splice(1),
          program,
          noDebug: false,
          stopOnEntry: false,
        },
      };
    }

    return null;
  }
}
