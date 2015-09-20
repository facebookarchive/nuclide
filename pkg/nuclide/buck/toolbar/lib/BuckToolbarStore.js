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
var {Disposable, Emitter, TextEditor} = require('atom');
var {Dispatcher} = require('flux');
var {buckProjectRootForPath} = require('nuclide-buck-commons');
var BuckToolbarActions = require('./BuckToolbarActions');

type BuckRunDetails = {
  pid?: number;
};
import type {ProcessOutputDataHandlers} from 'nuclide-process-output-store/types';

var BUCK_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

class BuckToolbarStore {

  _dispatcher: Dispatcher;
  _emitter: Emitter;
  _mostRecentBuckProject: ?BuckProject;
  _textEditorToBuckProject: WeakMap<TextEditor, BuckProject>;

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
    this._emitter = new Emitter();
    this._textEditorToBuckProject = new WeakMap();
    this._setupActions();
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case BuckToolbarActions.ActionType.UPDATE_PROJECT:
          this._updateProject(action.editor);
          break;
        case BuckToolbarActions.ActionType.BUILD:
          this._doBuild(action.buildTarget, null, false, false);
          break;
        case BuckToolbarActions.ActionType.RUN:
          this._doBuild(action.buildTarget, action.simulator, true, false);
          break;
        case BuckToolbarActions.ActionType.DEBUG:
          this._doDebug(action.buildTarget, action.simulator);
          break;
      }
    });
  }

  onResetToolbarProgress(callback: () => void): Disposable {
    return this._emitter.on('RESET_TOOLBAR_PROGRESS', callback);
  }

  onRulesCountCalculated(callback: () => void): Disposable {
    return this._emitter.on('RULES_COUNT_CALCULATED', callback);
  }

  onRulesCountChanged(callback: () => void): Disposable {
    return this._emitter.on('RULES_COUNT_CHANGED', callback);
  }

  onBuildFinished(callback: () => void): Disposable {
    return this._emitter.on('BUILD_FINISHED', callback);
  }

  onBuckCommandFinished(callback: () => void): Disposable {
    return this._emitter.on('BUCK_COMMAND_FINISHED', callback);
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

  getMostRecentBuckProject(): ?BuckProject {
    return this._mostRecentBuckProject;
  }

  async _doDebug(buildTarget: string, simulator: ?string): Promise<void> {
    // TODO(natthu): Restore validation logic to make sure the target is installable.
    // For now, let's leave that to Buck.

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    var installResult = await this._doBuild(buildTarget, simulator, true, true);
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
    buildTarget: string,
    simulator: ?string,
    run: boolean,
    debug: boolean,
  ): Promise<?{buckProject: BuckProject, buildTarget: string, pid: ?number}> {
    if (!buildTarget) {
      return;
    }
    var buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      this._notifyError();
      return;
    }

    var command = `buck ${run ? 'install' : 'build'} ${buildTarget}`;
    atom.notifications.addInfo(`${command} started.`);
    this._emitter.emit('RESET_TOOLBAR_PROGRESS');
    await this._setupWebSocket(buckProject, buildTarget);

    var {pid} = await this._runBuckCommandInNewPane(
        {buckProject, buildTarget, simulator, run, debug, command});
    this._emitter.emit('BUCK_COMMAND_FINISHED');
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
  }): Promise<BuckRunDetails> {
    var {buckProject, buildTarget, simulator, run, debug, command} = buckParams;

    var getRunCommandInNewPane = require('nuclide-process-output');
    var {runCommandInNewPane, disposable} = getRunCommandInNewPane();

    var runProcessWithHandlers = async (dataHandlerOptions: ProcessOutputDataHandlers) => {
      var {stdout, stderr, error, exit} = dataHandlerOptions;
      var observable;
      invariant(buckProject);
      if (run) {
        observable = await buckProject.installWithOutput(
            [buildTarget], true, debug, simulator);
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
        error(data);
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

    var buckRunPromise: Promise<BuckRunDetails> = new Promise(function (resolve, reject) {
      var {ProcessOutputStore} = require('nuclide-process-output-store');
      var processOutputStore = new ProcessOutputStore(runProcessWithHandlers);
      var {handleBuckAnsiOutput} = require('nuclide-process-output-handler');

      var exitSubscription = processOutputStore.onProcessExit((exitCode: number) => {
        if (exitCode === 0 && run) {
          // Get the process ID.
          var allBuildOutput = processOutputStore.getStdout() || '';
          var pidMatch = allBuildOutput.match(BUCK_PROCESS_ID_REGEX);
          if (pidMatch) {
            // Index 1 is the captured pid.
            resolve({pid: parseInt(pidMatch[1], 10)});
          }
        } else {
          resolve({});
        }
        exitSubscription.dispose();
      });

      runCommandInNewPane('buck', processOutputStore, handleBuckAnsiOutput);
    });

    return await buckRunPromise;
  }

  async _setupWebSocket(buckProject: BuckProject, buildTarget: string): Promise<void> {
    var httpPort = await buckProject.getServerPort();
    if (httpPort > 0) {
      var uri = `ws://localhost:${httpPort}/ws/build`;
      var ws = new WebSocket(uri);
      var buildId: ?string = null;
      var ruleCount = 0;
      var isFinished = false;

      ws.onmessage = (e) => {
        var message;
        try {
          message = JSON.parse(e.data);
        } catch (err) {
          getLogger().error(
              `Buck was likely killed while building ${buildTarget}.`);
          return;
        }

        var type = message['type'];
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

        if (type === 'RuleCountCalculated') {
          this._emitter.emit('RULES_COUNT_CALCULATED', message['numRules']);
        } else if (type === 'BuildRuleFinished') {
          this._emitter.emit('RULES_COUNT_CHANGED', ++ruleCount);
        } else if (type === 'BuildFinished') {
          this._emitter.emit('BUILD_FINISHED');
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
    }
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
