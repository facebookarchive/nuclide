'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputDataHandlers} from '../../nuclide-process-output-store/lib/types';
import type {BuckProject} from '../../nuclide-buck-base';

import invariant from 'assert';
import getRunCommandInNewPane from '../../nuclide-process-output';
import {ProcessOutputStore} from '../../nuclide-process-output-store';
import {handleBuckAnsiOutput} from '../../nuclide-process-output-handler';

const BUCK_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

export default async function runBuckCommandInNewPane({
  buckProject,
  buildTarget,
  simulator,
  subcommand,
  debug,
  appArgs,
}: {
  buckProject: BuckProject;
  buildTarget: string;
  simulator: ?string;
  subcommand: string;
  debug: boolean;
  appArgs: Array<string>;
}): Promise<{pid?: number}> {
  const {runCommandInNewPane, disposable} = getRunCommandInNewPane();

  const run = subcommand === 'install';
  const runProcessWithHandlers = async (dataHandlerOptions: ProcessOutputDataHandlers) => {
    const {stdout, stderr, error, exit} = dataHandlerOptions;
    let observable;
    invariant(buckProject);
    if (run) {
      observable = await buckProject.installWithOutput(
          [buildTarget], simulator, {run, debug, appArgs});
    } else if (subcommand === 'build') {
      observable = await buckProject.buildWithOutput([buildTarget]);
    } else if (subcommand === 'test') {
      observable = await buckProject.testWithOutput([buildTarget]);
    } else {
      throw Error(`Unknown subcommand: ${subcommand}`);
    }
    const onNext = (data: {stderr?: string; stdout?: string}) => {
      if (data.stdout) {
        stdout(data.stdout);
      } else {
        stderr(data.stderr || '');
      }
    };
    const onError = (data: string) => {
      error(new Error(data));
      exit(1);
      disposable.dispose();
    };
    const onExit = () => {
      // onExit will only be called if the process completes successfully,
      // i.e. with exit code 0. Unfortunately an Observable cannot pass an
      // argument (e.g. an exit code) on completion.
      exit(0);
      disposable.dispose();
    };
    const subscription = observable.subscribe(onNext, onError, onExit);

    return {
      kill() {
        subscription.unsubscribe();
        disposable.dispose();
      },
    };
  };

  return new Promise((resolve, reject) => {
    const processOutputStore = new ProcessOutputStore(runProcessWithHandlers);

    const exitSubscription = processOutputStore.onProcessExit((exitCode: number) => {
      if (exitCode === 0 && run) {
        // Get the process ID.
        const allBuildOutput = processOutputStore.getStdout() || '';
        const pidMatch = allBuildOutput.match(BUCK_PROCESS_ID_REGEX);
        if (pidMatch) {
          // Index 1 is the captured pid.
          resolve({pid: parseInt(pidMatch[1], 10)});
        }
      } else {
        resolve({});
      }
      exitSubscription.dispose();
      processOutputStore.dispose();
    });

    runCommandInNewPane({
      tabTitle: `buck ${subcommand} ${buildTarget}`,
      processOutputStore,
      processOutputHandler: handleBuckAnsiOutput,
      destroyExistingPane: true,
    });
  });
}
