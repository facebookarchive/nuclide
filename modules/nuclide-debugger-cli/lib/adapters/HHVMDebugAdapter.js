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

import type {
  LaunchRequestArguments,
  AttachRequestArguments,
} from 'vscode-debugprotocol';
import type {Arguments} from '../DebuggerAdapterFactory';
import type {CustomArgumentType} from '../VSPOptionsParser';
import type {DebugAdapter} from '../DebugAdapter';
import type {VsAdapterType} from 'nuclide-debugger-common';

import {getAdapterPackageRoot} from 'nuclide-debugger-common/debugger-registry';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import VSPOptionsParser from '../VSPOptionsParser';

export default class HHVMDebugAdapter implements DebugAdapter {
  key: VsAdapterType = VsAdapterTypes.HHVM;
  type: string = 'hhvm';
  excludedOptions: Set<string> = new Set([
    'targetUri',
    'scriptArgs',
    'noDebug',
    'launchScriptPath',
    'startupDocumentPath',
  ]);

  extensions: Set<string> = new Set(['.php']);
  customArguments: Map<string, CustomArgumentType> = new Map();
  muteOutputCategories: Set<string> = new Set();
  // for pause, use 0 which is the hhvm dummy thread
  asyncStopThread: ?number = 0;
  supportsCodeBlocks: boolean = true;

  _includedOptions: Set<string> = new Set();

  parseArguments(args: Arguments): Map<string, any> {
    const action = args.attach ? 'attach' : 'launch';
    const root = getAdapterPackageRoot(this.key);
    const parser = new VSPOptionsParser(root);
    const commandLineArgs = parser.parseCommandLine(
      this.type,
      action,
      this.excludedOptions,
      this._includedOptions,
      this.customArguments,
    );

    if (action === 'launch') {
      const launchArgs = args._;
      const program = nuclideUri.resolve(launchArgs[0]);

      commandLineArgs.set('scriptArgs', launchArgs.splice(1));
      commandLineArgs.set('launchScriptPath', program);
      commandLineArgs.set('targetUri', program);
      commandLineArgs.set('noDebug', false);
      commandLineArgs.set('cwd', nuclideUri.resolve('.'));
    } else {
      if (!commandLineArgs.has('targetUri')) {
        commandLineArgs.set('targetUri', nuclideUri.resolve('.'));
      }
    }

    commandLineArgs.set('action', action);
    commandLineArgs.set(
      'hhvmRuntimeArgs',
      commandLineArgs.get('hhvmRuntimeArgs') || [],
    );

    return commandLineArgs;
  }

  transformLaunchArguments(
    args: ?LaunchRequestArguments,
  ): LaunchRequestArguments {
    return {
      ...(args || {}),
      showDummyOnAsyncPause: true,
    };
  }

  transformAttachArguments(
    args: ?AttachRequestArguments,
  ): AttachRequestArguments {
    return {
      ...(args || {}),
      showDummyOnAsyncPause: true,
    };
  }

  transformExpression(exp: string, isCodeBlock: boolean): string {
    if (isCodeBlock) {
      return exp;
    }

    // NB This is the same hack that's done in classic hphpd to get around the
    // fact that evaluating a code block like 'prep(genFoo())' returns the
    // constant '1' rather than the asynchronously computed result of genFoo()
    return `$_=${exp}; return $_;`;
  }

  async canDebugFile(file: string): Promise<boolean> {
    // no special cases, just use file extension
    return false;
  }
}
