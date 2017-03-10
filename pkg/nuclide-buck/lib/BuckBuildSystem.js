/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {Task, TaskEvent} from '../../commons-node/tasks';
import type {Directory} from '../../nuclide-remote-connection';
import type {TaskMetadata} from '../../nuclide-task-runner/lib/types';
import type {Level, Message} from '../../nuclide-console/lib/types';
import type {ResolvedBuildTarget} from '../../nuclide-buck-rpc';
import typeof * as BuckService from '../../nuclide-buck-rpc';
import type {
  AppState,
  BuckBuilderBuildOptions,
  BuckSubcommand,
  BuildArtifactTask,
  DeploymentTarget,
  SerializedState,
  Store,
  TaskSettings,
  TaskType,
} from './types';
import {PlatformService} from './PlatformService';
import type {BuckEvent} from './BuckEventStream';
import type {
  ObservableDiagnosticProvider,
} from '../../nuclide-diagnostics-common';
import type {
  DiagnosticProviderUpdate,
  InvalidationMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import invariant from 'assert';
import nullthrows from 'nullthrows';
import {applyMiddleware, createStore} from 'redux';
import {Observable, Subject, TimeoutError} from 'rxjs';
import {MULTIPLE_TARGET_RULE_TYPE} from '../../nuclide-buck-rpc';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import nuclideUri from '../../commons-node/nuclideUri';
import {
  combineEpics,
  createEpicMiddleware,
} from '../../commons-node/redux-observable';
import {compact} from '../../commons-node/observable';
import {taskFromObservable} from '../../commons-node/tasks';
import {getBuckServiceByNuclideUri} from '../../nuclide-remote-connection';
import featureConfig from '../../commons-atom/featureConfig';
import {getLogger} from '../../nuclide-logging';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import {Icon} from '../../nuclide-ui/Icon';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import Reducers from './redux/Reducers';
import BuckToolbar from './BuckToolbar';
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
import observeBuildCommands from './observeBuildCommands';
import React from 'react';

const SOCKET_TIMEOUT = 30000;

const DEBUGGABLE_RULES = new Set([
  'cxx_binary',
  'cxx_test',
  'rust_binary',
  'rust_test',
]);

const RUNNABLE_RULES = new Set([]);

function shouldEnableTask(taskType: TaskType, ruleType: string): boolean {
  switch (taskType) {
    case 'run':
      return RUNNABLE_RULES.has(ruleType);
    case 'debug':
      return DEBUGGABLE_RULES.has(ruleType);
    default:
      return true;
  }
}

export class BuckBuildSystem {
  _store: Store;
  _disposables: UniversalDisposable;
  _extraUi: ?ReactClass<any>;
  id: string;
  name: string;
  _serializedState: ?SerializedState;
  _outputMessages: Subject<Message>;
  _diagnosticUpdates: Subject<DiagnosticProviderUpdate>;
  _diagnosticInvalidations: Subject<InvalidationMessage>;
  _platformService: PlatformService;

  constructor(initialState: ?SerializedState) {
    this.id = 'buck';
    this.name = 'Buck';
    this._serializedState = initialState;
    this._disposables = new UniversalDisposable();
    this._outputMessages = new Subject();
    this._diagnosticUpdates = new Subject();
    this._diagnosticInvalidations = new Subject();
    this._disposables.add(this._outputMessages);
    this._platformService = new PlatformService();
  }

  getExtraUi(): ReactClass<any> {
    if (this._extraUi == null) {
      const store = this._getStore();
      const boundActions = {
        setBuildTarget: buildTarget =>
          store.dispatch(Actions.setBuildTarget(buildTarget)),
        setDeploymentTarget: deploymentTarget =>
          store.dispatch(Actions.setDeploymentTarget(deploymentTarget)),
        setTaskSettings: settings =>
          store.dispatch(Actions.setTaskSettings(settings)),
      };
      this._extraUi = bindObservableAsProps(
        // $FlowFixMe: type symbol-observable
        Observable.from(store).map(appState => ({appState, ...boundActions})),
        BuckToolbar,
      );
    }
    return this._extraUi;
  }

  getIcon(): ReactClass<any> {
    return () => (
      <Icon icon="nuclicon-buck" className="nuclide-buck-task-runner-icon" />
    );
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

  getPlatformService(): PlatformService {
    return this._platformService;
  }

  setProjectRoot(
    projectRoot: ?Directory,
    callback: (enabled: boolean, taskList: Array<TaskMetadata>) => mixed,
  ): IDisposable {
    const path = projectRoot == null ? null : projectRoot.getPath();

    // $FlowFixMe: type symbol-observable
    const storeReady: Observable<AppState> = Observable.from(this._getStore())
      .distinctUntilChanged()
      .filter(
        (state: AppState) =>
          !state.isLoadingBuckProject && state.projectRoot === path,
      )
      .share();

    const enabledObservable = storeReady
      .map(state => state.buckRoot != null)
      .distinctUntilChanged();

    const tasksObservable = storeReady.map(state => {
      const {buildRuleType, selectedDeploymentTarget} = state;
      const tasksFromPlatform = selectedDeploymentTarget
        ? selectedDeploymentTarget.platform.tasks
        : null;
      return TASKS.map(task => {
        let disabled = state.isLoadingPlatforms || buildRuleType == null;
        if (!disabled) {
          if (tasksFromPlatform) {
            disabled = !tasksFromPlatform.has(task.type);
          } else {
            invariant(buildRuleType);
            // No platform provider selected, fall back to default logic
            disabled = !shouldEnableTask(task.type, buildRuleType);
          }
        }
        return {...task, disabled};
      });
    });

    const subscription = Observable.combineLatest(
      enabledObservable,
      tasksObservable,
    ).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._getStore().dispatch(Actions.setProjectRoot(path));

    return new UniversalDisposable(subscription);
  }

  _logOutput(text: string, level: Level) {
    this._outputMessages.next({text, level});
  }

  _getStore(): Store {
    if (this._store == null) {
      invariant(this._serializedState != null);
      const initialState: AppState = {
        platformGroups: [],
        platformService: this._platformService,
        projectRoot: null,
        buckRoot: null,
        isLoadingBuckProject: false,
        isLoadingRule: false,
        isLoadingPlatforms: false,
        buildTarget: this._serializedState.buildTarget || '',
        buildRuleType: null,
        selectedDeploymentTarget: null,
        taskSettings: this._serializedState.taskSettings || {},
        lastSessionPlatformName: this._serializedState.selectedPlatformName,
        lastSessionDeviceName: this._serializedState.selectedDeviceName,
      };
      const epics = Object.keys(Epics)
        .map(k => Epics[k])
        .filter(epic => typeof epic === 'function');
      const rootEpic = (actions, store) => combineEpics(...epics)(
        actions,
        store,
      )
        // Log errors and continue.
        .catch((err, stream) => {
          getLogger().error(err);
          return stream;
        });
      this._store = createStore(
        Reducers,
        initialState,
        applyMiddleware(createEpicMiddleware(rootEpic)),
      );
      this._disposables.add(observeBuildCommands(this._store));
    }
    return this._store;
  }

  runTask(taskType: string): Task {
    invariant(
      taskType === 'build' ||
        taskType === 'test' ||
        taskType === 'run' ||
        taskType === 'debug',
      'Invalid task type',
    );

    const state = this._getStore().getState();
    const {
      buckRoot,
      buildRuleType,
      buildTarget,
      selectedDeploymentTarget,
    } = state;
    invariant(buckRoot);

    const deploymentString = formatDeploymentTarget(selectedDeploymentTarget);
    this._logOutput(
      `Resolving ${taskType} command for "${buildTarget}"${deploymentString}`,
      'log',
    );

    let resolvedBuildTarget;
    if (buildRuleType !== MULTIPLE_TARGET_RULE_TYPE) {
      resolvedBuildTarget = getResolvedBuildTarget(buckRoot, buildTarget);
    } else {
      // This is not strictly the qualified name, as that'd be a list of names
      // Passing the input is good enough since the deployment target is guaranteed to be null
      resolvedBuildTarget = Observable.of({
        qualifiedName: buildTarget,
        flavors: [],
      });
    }
    const capitalizedTaskType = taskType.slice(0, 1).toUpperCase() +
      taskType.slice(1);
    const task = taskFromObservable(
      Observable.concat(
        resolvedBuildTarget.switchMap(resolvedTarget => {
          if (selectedDeploymentTarget) {
            const {platform, device} = selectedDeploymentTarget;
            return platform.runTask(this, taskType, resolvedTarget, device);
          } else {
            const subcommand = taskType === 'debug' ? 'build' : taskType;
            return this.runSubcommand(
              subcommand,
              resolvedTarget,
              {},
              taskType === 'debug',
              null,
            );
          }
        }),
        Observable.defer(() => {
          this._logOutput(`${capitalizedTaskType} succeeded.`, 'success');
          return Observable.empty();
        }),
      ),
    );

    return {
      ...task,
      cancel: () => {
        this._logOutput(`${capitalizedTaskType} stopped.`, 'warning');
        task.cancel();
      },
      getTrackingData: () => ({
        buckRoot,
        buildTarget,
        taskSettings: state.taskSettings,
      }),
    };
  }

  /**
   * Builds the specified target and notifies the caller of the artifact. This isn't part of the
   * TaskRunner API.
   */
  buildArtifact(opts: BuckBuilderBuildOptions): BuildArtifactTask {
    const {root, target} = opts;
    let pathToArtifact = null;
    const buckService = getBuckServiceByNuclideUri(root);
    const targetString = getCommandStringForResolvedBuildTarget(target);

    const task = taskFromObservable(
      Observable.concat(
        this.runSubcommand('build', target, {}, false, null),
        // Don't complete until we've determined the artifact path.
        Observable.defer(() => buckService.showOutput(root, targetString))
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

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): ?SerializedState {
    // If we haven't had to load and create the Flux stuff yet, don't do it now.
    if (this._store == null) {
      return;
    }
    const state = this._store.getState();
    const {buildTarget, taskSettings, selectedDeploymentTarget} = state;
    let selectedPlatformName;
    let selectedDeviceName;
    if (selectedDeploymentTarget) {
      selectedPlatformName = selectedDeploymentTarget.platform.name;
      selectedDeviceName = selectedDeploymentTarget.device
        ? selectedDeploymentTarget.device.name
        : null;
    } else {
      // In case the user quits before the session is restored, forward the session restoration.
      selectedPlatformName = state.lastSessionPlatformName;
      selectedDeviceName = state.lastSessionDeviceName;
    }

    return {
      buildTarget,
      taskSettings,
      selectedPlatformName,
      selectedDeviceName,
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
    const {buckRoot, taskSettings} = this._getStore().getState();

    if (buckRoot == null || buildTarget == null) {
      // All tasks should have been disabled.
      return Observable.empty();
    }

    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-console:toggle',
      {visible: true},
    );
    const targetString = getCommandStringForResolvedBuildTarget(buildTarget);
    const settings = {...taskSettings, ...additionalSettings};
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
            'Enable httpserver in your .buckconfig for better output.',
            'warning',
          );
        }

        const processMessages = runBuckCommand(
          buckService,
          buckRoot,
          targetString,
          subcommand,
          settings.arguments || [],
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
                    settings.runArguments || [],
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

const TASKS = [
  {
    type: 'build',
    label: 'Build',
    description: 'Build the specified Buck target',
    icon: 'tools',
  },
  {
    type: 'run',
    label: 'Run',
    description: 'Run the specfied Buck target',
    icon: 'triangle-right',
  },
  {
    type: 'test',
    label: 'Test',
    description: 'Test the specfied Buck target',
    icon: 'check',
  },
  {
    type: 'debug',
    label: 'Debug',
    description: 'Debug the specfied Buck target',
    icon: 'nuclicon-debugger',
  },
];

function runBuckCommand(
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  subcommand: BuckSubcommand,
  args: Array<string>,
  debug: boolean,
  simulator: ?string,
): Observable<ProcessMessage> {
  if (debug) {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging',
    );
  }

  if (subcommand === 'install') {
    return buckService
      .installWithOutput(buckRoot, [buildTarget], args, simulator, true, debug)
      .refCount();
  } else if (subcommand === 'build') {
    return buckService
      .buildWithOutput(buckRoot, [buildTarget], args)
      .refCount();
  } else if (subcommand === 'test') {
    return buckService
      .testWithOutput(buckRoot, [buildTarget], args, debug)
      .refCount();
  } else if (subcommand === 'run') {
    return buckService.runWithOutput(buckRoot, [buildTarget], args).refCount();
  } else {
    throw Error(`Unknown subcommand: ${subcommand}`);
  }
}

function getResolvedBuildTarget(
  buckRoot: string,
  buildTarget: string,
): Observable<ResolvedBuildTarget> {
  const service = nullthrows(getBuckServiceByNuclideUri(buckRoot));
  return Observable.defer(() =>
    service.resolveBuildTargetName(buckRoot, buildTarget));
}

function getCommandStringForResolvedBuildTarget(
  target: ResolvedBuildTarget,
): string {
  const {qualifiedName, flavors} = target;
  const separator = flavors.length > 0 ? '#' : '';
  return `${qualifiedName}${separator}${flavors.join(',')}`;
}

function formatDeploymentTarget(deploymentTarget: ?DeploymentTarget): string {
  if (!deploymentTarget) {
    return '';
  }
  const {device, platform} = deploymentTarget;
  const deviceString = device ? `: ${device.name}` : '';
  return ` on "${platform.name}${deviceString}"`;
}
