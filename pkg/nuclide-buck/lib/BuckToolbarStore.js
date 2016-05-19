'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Emitter} from 'atom';
import path from 'path';
import {Dispatcher} from 'flux';
import {getLogger} from '../../nuclide-logging';
import BuckToolbarActions from './BuckToolbarActions';
import runBuckCommandInNewPane from './runBuckCommandInNewPane';

import type {BuckProject} from '../../nuclide-buck-base';
import type {SerializedState} from './types';

import ReactNativeServerManager from './ReactNativeServerManager';
import ReactNativeServerActions from './ReactNativeServerActions';

const REACT_NATIVE_APP_FLAGS = [
  '-executor-override', 'RCTWebSocketExecutor',
  '-websocket-executor-name', 'Nuclide',
  '-websocket-executor-port', '8090',
];

type BuckSubcommand = 'build' | 'install' | 'test';

export default class BuckToolbarStore {

  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _reactNativeServerActions: ReactNativeServerActions;
  _reactNativeServerManager: ReactNativeServerManager;
  _mostRecentBuckProject: ?BuckProject;
  _isBuilding: boolean;
  _isLoadingRule: boolean;
  _buildTarget: string;
  _buildProgress: number;
  _buildRuleType: string;
  _simulator: ?string;
  _isReactNativeServerMode: boolean;

  constructor(dispatcher: Dispatcher, initialState: ?SerializedState) {
    this._dispatcher = dispatcher;
    this._reactNativeServerActions = new ReactNativeServerActions(dispatcher);
    this._reactNativeServerManager = new ReactNativeServerManager(
      dispatcher,
      this._reactNativeServerActions,
    );
    this._emitter = new Emitter();
    this._initState(initialState);
    this._setupActions();
  }

  _initState(initialState: ?SerializedState) {
    this._isBuilding = false;
    this._isLoadingRule = false;
    this._buildTarget = initialState && initialState.buildTarget || '';
    this._buildProgress = 0;
    this._buildRuleType = '';
    this._isReactNativeServerMode = initialState && initialState.isReactNativeServerMode || false;
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case BuckToolbarActions.ActionType.UPDATE_PROJECT:
          this._mostRecentBuckProject = action.project;
          break;
        case BuckToolbarActions.ActionType.UPDATE_BUILD_TARGET:
          this._buildTarget = action.buildTarget;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_IS_LOADING_RULE:
          this._isLoadingRule = action.isLoadingRule;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_RULE_TYPE:
          this._buildRuleType = action.ruleType;
          this.emitChange();
          break;
        case BuckToolbarActions.ActionType.UPDATE_SIMULATOR:
          this._simulator = action.simulator;
          break;
        case BuckToolbarActions.ActionType.UPDATE_REACT_NATIVE_SERVER_MODE:
          this._isReactNativeServerMode = action.serverMode;
          this.emitChange();
          break;
      }
    });
  }

  dispose() {
    this._reactNativeServerManager.dispose();
  }

  subscribe(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  emitChange(): void {
    this._emitter.emit('change');
  }

  getBuildTarget(): string {
    return this._buildTarget;
  }

  getMostRecentBuckProject(): ?BuckProject {
    return this._mostRecentBuckProject;
  }

  isBuilding(): boolean {
    return this._isBuilding;
  }

  isLoadingRule(): boolean {
    return this._isLoadingRule;
  }

  getRuleType(): string {
    return this._buildRuleType;
  }

  getBuildProgress(): number {
    return this._buildProgress;
  }

  canBeReactNativeApp(): boolean {
    return this._buildRuleType === 'apple_bundle' || this._buildRuleType === 'android_binary';
  }

  isReactNativeServerMode(): boolean {
    return this.canBeReactNativeApp() && this._isReactNativeServerMode;
  }

  isInstallableRule(): boolean {
    return this.canBeReactNativeApp() || this._buildRuleType === 'apk_genrule';
  }

  async _getReactNativeServerCommand(): Promise<?string> {
    const buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      return null;
    }
    const serverCommand = await buckProject.getBuckConfig('react-native', 'server');
    if (serverCommand == null) {
      return null;
    }
    const repoRoot = await buckProject.getPath();
    if (repoRoot == null) {
      return null;
    }
    return path.join(repoRoot, serverCommand);
  }

  async _doDebug(): Promise<void> {
    // TODO(natthu): Restore validation logic to make sure the target is installable.
    // For now, let's leave that to Buck.

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    const installResult = await this._doBuild('install', /* debug */ true);
    if (!installResult) {
      return;
    }
    const {buckProject, pid} = installResult;

    if (pid) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      const debuggerService = await require('../../nuclide-service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
      const buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(pid, buckProjectPath);
    }
  }

  async _doBuild(
    subcommand: BuckSubcommand,
    debug: boolean,
  ): Promise<?{buckProject: BuckProject; buildTarget: string; pid: ?number}> {
    const buildTarget = this._buildTarget;
    const simulator = this._simulator;
    const buckProject = this._mostRecentBuckProject;
    if (!this._buildTarget) {
      return;
    }
    if (!buckProject) {
      throw new Error('Could not build: must navigate to a file that is part of a Buck project.');
    }

    let appArgs = [];
    if (subcommand === 'install' && this.isReactNativeServerMode()) {
      const serverCommand = await this._getReactNativeServerCommand();
      if (serverCommand) {
        this._reactNativeServerActions.startServer(serverCommand);
        appArgs = REACT_NATIVE_APP_FLAGS;
        this._reactNativeServerActions.startNodeExecutorServer();
      }
    }

    const httpPort = await buckProject.getHTTPServerPort();
    let socketStream;
    if (httpPort > 0) {
      socketStream = buckProject.getWebSocketStream(httpPort).subscribe({
        next: message => {
          switch (message.type) {
            case 'BuildProgressUpdated':
              this._buildProgress = message.progressValue;
              this.emitChange();
              break;
          }
        },
        error: err => {
          getLogger().error(`Got Buck websocket error building ${buildTarget}`, err);
        },
      });
    }

    this._buildProgress = 0;
    this._isBuilding = true;
    this.emitChange();

    try {
      const result = await runBuckCommandInNewPane(
        {buckProject, buildTarget, simulator, subcommand, debug, appArgs}
      );
      return {buckProject, buildTarget, pid: result.pid};
    } finally {
      this._isBuilding = false;
      this.emitChange();
      if (socketStream != null) {
        socketStream.unsubscribe();
      }
    }
  }

}
