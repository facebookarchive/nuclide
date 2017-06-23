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
  NuclideDebuggerProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {PlatformService} from '../../nuclide-buck/lib/PlatformService';
import type {PlatformGroup} from '../../nuclide-buck/lib/types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {Observable} from 'rxjs';
import logger from './utils';
import {getConfig} from './utils';
import {LLDBLaunchAttachProvider} from './LLDBLaunchAttachProvider';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

const SUPPORTED_RULE_TYPES = new Set(['cxx_binary', 'cxx_test']);

class Activation {
  _disposables: UniversalDisposable;

  constructor() {
    this._disposables = new UniversalDisposable();
    logger.setLevel(getConfig().clientLogLevel);
  }

  dispose() {
    this._disposables.dispose();
  }

  createDebuggerProvider(): NuclideDebuggerProvider {
    return {
      name: 'lldb',
      getLaunchAttachProvider(
        connection: NuclideUri,
      ): ?DebuggerLaunchAttachProvider {
        return new LLDBLaunchAttachProvider('Native', connection);
      },
    };
  }

  consumePlatformService(service: PlatformService): void {
    this._disposables.add(service.register(this.provideLLDBPlatformGroup));
  }

  provideLLDBPlatformGroup(
    buckRoot: NuclideUri,
    ruleType: string,
    buildTarget: string,
  ): Observable<?PlatformGroup> {
    if (!SUPPORTED_RULE_TYPES.has(ruleType)) {
      return Observable.of(null);
    }

    const availableActions = new Set(['build', 'run', 'test', 'debug']);
    return Observable.of({
      name: 'Native',
      platforms: [
        {
          isMobile: false,
          name: 'LLDB',
          tasksForBuildRuleType: buildRuleType => {
            return availableActions;
          },
          runTask: (builder, taskType, target, settings, device) => {
            const subcommand = taskType === 'debug' ? 'build' : taskType;
            return builder.runSubcommand(
              buckRoot,
              subcommand,
              target,
              settings,
              taskType === 'debug',
              null,
            );
          },
        },
      ],
    });
  }
}

createPackage(module.exports, Activation);
