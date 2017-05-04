/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Level, Message} from '../../nuclide-console/lib/types';
import type {BuckEvent} from './BuckEventStream';
import type {LegacyProcessMessage} from '../../commons-node/process-rpc-types';
import type {TaskEvent} from '../../commons-node/tasks';
import type {ResolvedBuildTarget} from '../../nuclide-buck-rpc';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import typeof * as BuckService from '../../nuclide-buck-rpc';
import type {
  BuckBuilderBuildOptions,
  BuckSubcommand,
  BuildArtifactTask,
  TaskSettings,
} from './types';
import type {
  DiagnosticProviderUpdate,
  InvalidationMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {
  ObservableDiagnosticProvider,
} from '../../nuclide-diagnostics-common';

import {Observable, Subject, TimeoutError} from 'rxjs';
import nuclideUri from '../../commons-node/nuclideUri';
import {taskFromObservable} from '../../commons-node/tasks';
import {getLogger} from '../../nuclide-logging';
import {compact} from '../../commons-node/observable';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import featureConfig from '../../commons-atom/featureConfig';
import {
  combineEventStreams,
  getDiagnosticEvents,
  getEventsFromSocket,
  getEventsFromProcess,
} from './BuckEventStream';
import {
  getDeployBuildEvents,
  getDeployInstallEvents,
  getDeployTestEvents,
} from './DeployEventStream';
import invariant from 'assert';

const SOCKET_TIMEOUT = 30000;

export class BuckBuildSystem {
  _outputMessages: Subject<Message>;
  _diagnosticUpdates: Subject<DiagnosticProviderUpdate>;
  _diagnosticInvalidations: Subject<InvalidationMessage>;
  _getBuckRoot: () => ?NuclideUri;
  _getTaskSettings: () => TaskSettings;

  constructor(
    outputMessages: Subject<Message>,
    rootFetcher: () => ?NuclideUri,
    settingsFetcher: () => TaskSettings,
  ) {
    this._outputMessages = outputMessages;
    this._diagnosticUpdates = new Subject();
    this._diagnosticInvalidations = new Subject();
    this._getBuckRoot = rootFetcher;
    this._getTaskSettings = settingsFetcher;
  }

  buildArtifact(opts: BuckBuilderBuildOptions): BuildArtifactTask {
    const {root, target, args} = opts;
    let pathToArtifact = null;
    const buckService = getBuckServiceByNuclideUri(root);
    const targetString = getCommandStringForResolvedBuildTarget(target);

    const task = taskFromObservable(
      Observable.concat(
        this.runSubcommand(
          'build',
          target,
          {buildArguments: args},
          false,
          null,
        ),
        // Don't complete until we've determined the artifact path.
        Observable.defer(() => buckService.showOutput(root, targetString, args))
          .do(output => {
            let outputPath;
            if (
              output == null ||
              output[0] == null ||
              output[0]['buck.outputPath'] == null ||
              (outputPath = output[0]['buck.outputPath'].trim()) === ''
            ) {
              throw new Error(
                "Couldn't determine binary path from Buck output!",
              );
            }
            invariant(outputPath != null);
            pathToArtifact = nuclideUri.join(root, outputPath);
          })
          .ignoreElements(),
      ),
    );
    return {
      ...task,
      getPathToBuildArtifact(): string {
        if (pathToArtifact == null) {
          throw new Error('No build artifact!');
        }
        return pathToArtifact;
      },
    };
  }

  runSubcommand(
    subcommand: BuckSubcommand,
    buildTarget: ResolvedBuildTarget,
    additionalSettings: TaskSettings,
    isDebug: boolean,
    udid: ?string,
  ): Observable<TaskEvent> {
    // Clear Buck diagnostics every time we run build.
    this._diagnosticInvalidations.next({scope: 'all'});
    const buckRoot = this._getBuckRoot();
    const taskSettings = this._getTaskSettings();

    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return Observable.empty();
    }

    const targetString = getCommandStringForResolvedBuildTarget(buildTarget);
    const buildArguments = (taskSettings.buildArguments || [])
      .concat(additionalSettings.buildArguments || []);
    const runArguments = (taskSettings.runArguments || [])
      .concat(additionalSettings.runArguments || []);

    const buckService = getBuckServiceByNuclideUri(buckRoot);

    return Observable.fromPromise(buckService.getHTTPServerPort(buckRoot))
      .catch(err => {
        getLogger().warn(`Failed to get httpPort for ${targetString}`, err);
        return Observable.of(-1);
      })
      .switchMap(httpPort => {
        let socketEvents = null;
        if (httpPort > 0) {
          socketEvents = getEventsFromSocket(
            buckService.getWebSocketStream(buckRoot, httpPort).refCount(),
          ).share();
        } else {
          this._logOutput(
            'For better logs, set httpserver.port in your Buck config and restart Nuclide.',
            'info',
          );
        }

        const args = runArguments.length > 0 &&
          (subcommand === 'run' || subcommand === 'install')
          ? buildArguments.concat(['--']).concat(runArguments)
          : buildArguments;

        const processMessages = runBuckCommand(
          buckService,
          buckRoot,
          targetString,
          subcommand,
          args,
          isDebug,
          udid,
        ).share();
        const processEvents = getEventsFromProcess(processMessages).share();

        let mergedEvents;
        if (socketEvents == null) {
          // Without a websocket, just pipe the Buck output directly.
          mergedEvents = processEvents;
        } else {
          mergedEvents = combineEventStreams(
            subcommand,
            socketEvents,
            processEvents,
          ).share();
        }

        return Observable.concat(
          // Wait until the socket starts up before triggering the Buck process.
          socketEvents == null
            ? Observable.empty()
            : socketEvents
                .filter(event => event.type === 'socket-connected')
                .take(1)
                .timeout(SOCKET_TIMEOUT)
                .catch(err => {
                  if (err instanceof TimeoutError) {
                    throw Error('Timed out connecting to Buck server.');
                  }
                  throw err;
                })
                .ignoreElements(),
          this._consumeEventStream(
            Observable.merge(
              mergedEvents,
              featureConfig.get('nuclide-buck.compileErrorDiagnostics')
                ? getDiagnosticEvents(mergedEvents, buckRoot)
                : Observable.empty(),
              isDebug && subcommand === 'install'
                ? getDeployInstallEvents(processMessages, buckRoot)
                : Observable.empty(),
              isDebug && subcommand === 'build'
                ? getDeployBuildEvents(
                    processMessages,
                    buckService,
                    buckRoot,
                    targetString,
                    runArguments,
                  )
                : Observable.empty(),
              isDebug && subcommand === 'test'
                ? getDeployTestEvents(processMessages, buckRoot)
                : Observable.empty(),
            ),
          ),
        );
      })
      .share();
  }

  _logOutput(text: string, level: Level) {
    this._outputMessages.next({text, level});
  }

  getOutputMessages(): Observable<Message> {
    return this._outputMessages;
  }

  getDiagnosticProvider(): ObservableDiagnosticProvider {
    return {
      updates: this._diagnosticUpdates,
      invalidations: this._diagnosticInvalidations,
    };
  }

  /**
     * Processes side effects (console output and diagnostics).
     * Returns only the progress events.
     */
  _consumeEventStream(events: Observable<BuckEvent>): Observable<TaskEvent> {
    // TODO: the Diagnostics API does not allow emitting one message at a time.
    // We have to accumulate messages per-file and emit them all.
    const fileDiagnostics = new Map();
    // Save error messages until the end so diagnostics have a chance to finish.
    // Real exceptions will not be handled by this, of course.
    let errorMessage = null;
    return compact(
      events
        .do({
          next: event => {
            // Side effects: emit console output and diagnostics
            if (event.type === 'log') {
              this._logOutput(event.message, event.level);
            } else if (event.type === 'build-output') {
              const {target, path, successType} = event.output;
              this._logOutput(`Target: ${target}`, 'log');
              this._logOutput(`Output: ${path}`, 'log');
              this._logOutput(`Success type: ${successType}`, 'log');
            } else if (event.type === 'diagnostics') {
              const {diagnostics} = event;
              // Update only the files that changed in this message.
              // Since emitting messages for a file invalidates it, we have to
              // be careful to emit all previous messages for it as well.
              const changedFiles = new Map();
              diagnostics.forEach(diagnostic => {
                let messages = fileDiagnostics.get(diagnostic.filePath);
                if (messages == null) {
                  messages = [];
                  fileDiagnostics.set(diagnostic.filePath, messages);
                }
                messages.push(diagnostic);
                changedFiles.set(diagnostic.filePath, messages);
              });
              this._diagnosticUpdates.next({filePathToMessages: changedFiles});
            } else if (event.type === 'error') {
              errorMessage = event.message;
            }
          },
          complete: () => {
            if (errorMessage != null) {
              throw Error(errorMessage);
            }
          },
        })
        // Let progress events flow through to the task runner.
        .map(event => {
          return event.type === 'progress' ? event : null;
        })
        .finally(() => {
          if (fileDiagnostics.size > 0) {
            this._logOutput(
              'Compilation errors detected: open the Diagnostics pane to jump to them.',
              'info',
            );
          }
        }),
    );
  }
}

function runBuckCommand(
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  subcommand: BuckSubcommand,
  args: Array<string>,
  debug: boolean,
  simulator: ?string,
): Observable<LegacyProcessMessage> {
  // TODO(T17463635)
  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging',
    );
  }

  const targets = splitTargets(buildTarget);
  if (subcommand === 'install') {
    return buckService
      .installWithOutput(buckRoot, targets, args, simulator, true, debug)
      .refCount();
  } else if (subcommand === 'build') {
    return buckService.buildWithOutput(buckRoot, targets, args).refCount();
  } else if (subcommand === 'test') {
    return buckService
      .testWithOutput(buckRoot, targets, args, debug)
      .refCount();
  } else if (subcommand === 'run') {
    return buckService.runWithOutput(buckRoot, targets, args).refCount();
  } else {
    throw Error(`Unknown subcommand: ${subcommand}`);
  }
}

function getCommandStringForResolvedBuildTarget(
  target: ResolvedBuildTarget,
): string {
  const {qualifiedName, flavors} = target;
  const separator = flavors.length > 0 ? '#' : '';
  return `${qualifiedName}${separator}${flavors.join(',')}`;
}

function splitTargets(buildTarget: string): Array<string> {
  return buildTarget.trim().split(/\s+/);
}
