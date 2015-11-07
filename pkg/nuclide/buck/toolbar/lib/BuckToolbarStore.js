'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

var invariant = require('assert');
var {Disposable, Emitter} = require('atom');
var path = require('path');
var {Dispatcher} = require('flux');
var {buckProjectRootForPath} = require('nuclide-buck-commons');
var BuckToolbarActions = require('./BuckToolbarActions');

type BuckRunDetails = {
  pid?: number;
};
import type {ProcessOutputDataHandlers, ProcessOutputStore as ProcessOutputStoreType}
  from 'nuclide-process-output-store/lib/types';
import type {BuckProject} from 'nuclide-buck-base/lib/BuckProject';
import ReactNativeServerManager from './ReactNativeServerManager';
import ReactNativeServerActions from './ReactNativeServerActions';

const BUCK_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
const REACT_NATIVE_APP_FLAGS = [
  '-executor-override', 'RCTWebSocketExecutor',
  '-websocket-executor-name', 'Nuclide',
  '-websocket-executor-port', '8090',
];

class BuckToolbarStore {

  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _reactNativeServerActions: ReactNativeServerActions;
  _reactNativeServerManager: ReactNativeServerManager;
  _mostRecentBuckProject: ?BuckProject;
  _textEditorToBuckProject: WeakMap<TextEditor, BuckProject>;
  _isBuilding: boolean;
  _buildTarget: string;
  _buildProgress: number;
  _buildRuleType: string;
  _simulator: ?string;
  _isReactNativeApp: boolean;
  _isReactNativeServerMode: boolean;
  _buckProcessOutputStore: ?ProcessOutputStoreType;
  _aliasesByProject: WeakMap<BuckProject, Array<string>>;

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
    this._reactNativeServerActions = new ReactNativeServerActions(dispatcher);
    this._reactNativeServerManager = new ReactNativeServerManager(
      dispatcher,
      this._reactNativeServerActions,
    );
    this._emitter = new Emitter();
    this._textEditorToBuckProject = new WeakMap();
    this._aliasesByProject = new WeakMap();
    this._initState();
    this._setupActions();
  }

  _initState() {
    this._isBuilding = false;
    this._buildTarget = '';
    this._buildProgress = 0;
    this._buildRuleType = '';
    this._isReactNativeApp = false;
    this._isReactNativeServerMode = false;
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case BuckToolbarActions.ActionType.UPDATE_PROJECT:
          this._updateProject(action.editor);
          break;
        case BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET:
          this._updateBuildTarget(action.buildTarget);
          break;
        case BuckToolbarActions.ActionType.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.BUILD:
          this._doBuild(false, false);
          break;
        case BuckToolbarActions.ActionType.RUN:
          this._doBuild(true, false);
          break;
        case BuckToolbarActions.ActionType.DEBUG:
          this._doDebug();
          break;
      }
    });
  }

  dispose() {
    this._reactNativeServerManager.dispose();
    if (this._buckProcessOutputStore) {
      this._buckProcessOutputStore.stopProcess();
    }
  }

  subscribe(callback: () => void): Disposable {
    return this._emitter.on('change', callback);
  }

  emitChange(): void {
    this._emitter.emit('change');
  }

  getBuildTarget(): string {
    return this._buildTarget;
  }

  isBuilding(): boolean {
    return this._isBuilding;
  }

  getRuleType(): string {
    return this._buildRuleType;
  }

  getBuildProgress(): number {
    return this._buildProgress;
  }

  isReactNativeApp(): boolean {
    return this._isReactNativeApp;
  }

  isReactNativeServerMode(): boolean {
    return this.isReactNativeApp() && this._isReactNativeServerMode;
  }

  async loadAliases(): Promise<Array<string>> {
    const buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      return Promise.resolve([]);
    }

    // Cache aliases for a project because invoking buck just to list aliases that are highly
    // unlikely to change is wasteful.
    let aliases = this._aliasesByProject.get(buckProject);
    if (!aliases) {
      aliases = await buckProject.listAliases();
      this._aliasesByProject.set(buckProject, aliases);
    }

    return aliases;
  }

  async _getReactNativeServerCommand(): Promise<?string> {
    var buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      return null;
    }
    var serverCommand = await buckProject.getBuckConfig('react-native', 'server');
    var repoRoot = await buckProject.getPath();
    return path.join(repoRoot, serverCommand);
  }

  async _updateProject(editor: TextEditor): Promise<void> {
    var nuclideUri = editor.getPath();
    if (!nuclideUri) {
      return;
    }
    var buckProject = this._textEditorToBuckProject.get(editor);
    if (!buckProject) {
      buckProject = await buckProjectRootForPath(nuclideUri);
      if (!buckProject) {
        return;
      }
      this._textEditorToBuckProject.set(editor, buckProject);
    }
    this._mostRecentBuckProject = buckProject;
  }

  async _updateBuildTarget(buildTarget: string): Promise<void> {
    buildTarget = buildTarget.trim();
    this._buildTarget = buildTarget;

    this._buildRuleType = await this._findRuleType();
    this.emitChange();
    this._isReactNativeApp = await this._findIsReactNativeApp();
    this.emitChange();
  }

  async _findRuleType(): Promise<string> {
    var buckProject = this._mostRecentBuckProject;
    var buildTarget = this._buildTarget;

    var buildRuleType = '';
    if (buildTarget && buckProject) {
      try {
        buildRuleType = await buckProject.buildRuleTypeFor(buildTarget);
      } catch (e) {
        // Most likely, this is an invalid target, so do nothing.
      }
    }
    return buildRuleType;
  }

  async _findIsReactNativeApp(): Promise<boolean> {
    var buildRuleType = this._buildRuleType;
    if (buildRuleType !== 'apple_bundle' && buildRuleType !== 'android_binary') {
      return false;
    }
    var buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      return false;
    }

    var reactNativeRule = buildRuleType === 'apple_bundle'
    ? 'ios_react_native_library'
    : 'android_react_native_library';

    var buildTarget = this._buildTarget;
    var matches = await buckProject.queryWithArgs(
      `kind('${reactNativeRule}', deps('%s'))`,
      [buildTarget],
    );
    return matches[buildTarget].length > 0;
  }

  async _doDebug(): Promise<void> {
    // TODO(natthu): Restore validation logic to make sure the target is installable.
    // For now, let's leave that to Buck.

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    var installResult = await this._doBuild(true, true);
    if (!installResult) {
      return;
    }
    var {buckProject, pid} = installResult;

    if (pid) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = await require('nuclide-service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
      var buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(pid, buckProjectPath);
    }
  }

  async _doBuild(
    run: boolean,
    debug: boolean,
  ): Promise<?{buckProject: BuckProject, buildTarget: string, pid: ?number}> {
    var buildTarget = this._buildTarget;
    var simulator = this._simulator;
    var buckProject = this._mostRecentBuckProject;
    if (!this._buildTarget) {
      return;
    }
    if (!buckProject) {
      this._notifyError();
      return;
    }

    let appArgs = [];
    if (run && this.isReactNativeServerMode()) {
      var serverCommand = await this._getReactNativeServerCommand();
      if (serverCommand) {
        this._reactNativeServerActions.startServer(serverCommand);
        appArgs = REACT_NATIVE_APP_FLAGS;
        this._reactNativeServerActions.startNodeExecutorServer();
      }
    }

    var command = `buck ${run ? 'install' : 'build'} ${buildTarget}`;
    atom.notifications.addInfo(`${command} started.`);
    const ws = await this._setupWebSocket(buckProject, buildTarget);

    this._buildProgress = 0;
    this._isBuilding = true;
    this.emitChange();

    var {pid} = await this._runBuckCommandInNewPane(
        {buckProject, buildTarget, simulator, run, debug, command, appArgs});

    this._isBuilding = false;
    this.emitChange();
    if (ws) {
      ws.close();
    }

    return {buckProject, buildTarget, pid};
  }

  /**
   * @return An Object with some details about the output of the command:
   *   pid: The process id of the running app, if 'run' was true.
   */
  async _runBuckCommandInNewPane(buckParams: {
    buckProject: BuckProject,
    buildTarget: string,
    simulator: ?string,
    run: boolean,
    debug: boolean,
    command: string,
    appArgs: Array<string>,
  }): Promise<BuckRunDetails> {
    const {buckProject, buildTarget, simulator, run, debug, command, appArgs} = buckParams;

    var getRunCommandInNewPane = require('nuclide-process-output');
    var {runCommandInNewPane, disposable} = getRunCommandInNewPane();

    var runProcessWithHandlers = async (dataHandlerOptions: ProcessOutputDataHandlers) => {
      var {stdout, stderr, error, exit} = dataHandlerOptions;
      var observable;
      invariant(buckProject);
      if (run) {
        observable = await buckProject.installWithOutput(
            [buildTarget], simulator, {run, debug, appArgs});
      } else {
        observable = await buckProject.buildWithOutput([buildTarget]);
      }
      var onNext = (data: {stdout: string} | {stderr: string}) => {
        if (data.stdout) {
          stdout(data.stdout);
        } else {
          stderr(data.stderr);
        }
      };
      var onError = (data: string) => {
        error(new Error(data));
        exit(1);
        atom.notifications.addError(`${buildTarget} failed to build.`);
        disposable.dispose();
      };
      var onExit = () => {
        // onExit will only be called if the process completes successfully,
        // i.e. with exit code 0. Unfortunately an Observable cannot pass an
        // argument (e.g. an exit code) on completion.
        exit(0);
        atom.notifications.addSuccess(`${command} succeeded.`);
        disposable.dispose();
      };
      var subscription = observable.subscribe(onNext, onError, onExit);

      return {
        kill() {
          subscription.dispose();
          disposable.dispose();
        },
      };
    };

    const buckRunPromise: Promise<BuckRunDetails> = new Promise((resolve, reject) => {
      const {ProcessOutputStore} = require('nuclide-process-output-store');
      const processOutputStore = new ProcessOutputStore(runProcessWithHandlers);
      const {handleBuckAnsiOutput} = require('nuclide-process-output-handler');

      this._buckProcessOutputStore = processOutputStore;
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
        this._buckProcessOutputStore = null;
      });

      runCommandInNewPane({
        tabTitle: 'buck',
        processOutputStore,
        processOutputHandler: handleBuckAnsiOutput,
        destroyExistingPane: true,
      });
    });

    return await buckRunPromise;
  }

  async _setupWebSocket(buckProject: BuckProject, buildTarget: string): Promise<?WebSocket> {
    const httpPort = await buckProject.getServerPort();
    if (httpPort <= 0) {
      return null;
    }

    const uri = `ws://localhost:${httpPort}/ws/build`;
    const ws = new WebSocket(uri);
    let buildId: ?string = null;
    let isFinished = false;

    ws.onmessage = (e) => {
      let message;
      try {
        message = JSON.parse(e.data);
      } catch (err) {
        getLogger().error(
            `Buck was likely killed while building ${buildTarget}.`);
        return;
      }
      const type = message['type'];
      if (buildId === null) {
        if (type === 'BuildStarted') {
          buildId = message['buildId'];
        } else {
          return;
        }
      }

      if (buildId !== message['buildId']) {
        return;
      }

      if (type === 'BuildProgressUpdated' || type === 'ParsingProgressUpdated') {
        this._buildProgress = message.progressValue;
        this.emitChange();
      } else if (type === 'BuildFinished') {
        this._buildProgress = 1.0;
        this.emitChange();
        isFinished = true;
        ws.close();
      }
    };

    ws.onclose = () => {
      if (!isFinished) {
        getLogger().error(
            `WebSocket closed before ${buildTarget} finished building.`);
      }
    };
    return ws;
  }

  _notifyError() {
    var activeEditor = atom.workspace.getActiveTextEditor();
    if (!activeEditor) {
      atom.notifications.addWarning(
          `Could not build: must navigate to a file that is part of a Buck project.`);
      return;
    }

    var fileName = activeEditor.getPath();
    atom.notifications.addWarning(
        `Could not build: file '${fileName}' is not part of a Buck project.`);
  }
}

module.exports = BuckToolbarStore;
