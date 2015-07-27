'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var buckServicePromise = require('nuclide-service-hub-plus')
    .consumeFirstProvider('buck.service');
var {array} = require('nuclide-commons');

async function getCurrentBuckProject(): Promise<?BuckProject> {
  var activeEditor = atom.workspace.getActiveTextEditor();
  if (!activeEditor) {
    return null;
  }

  var fileName = activeEditor.getPath();
  if (!fileName) {
    return null;
  }

  var buckService = await buckServicePromise;
  var buckProject = await buckService.buckProjectRootForPath(fileName);
  return buckProject;
}

async function requestOptions(inputText: string) {
  var buckProject = await getCurrentBuckProject();
  if (!buckProject) {
    return [];
  }

  return buckProject.listAliases();
}

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

var AtomComboBox = require('nuclide-ui-atom-combo-box');
var React = require('react-for-atom');
var {PropTypes} = React;
var SimulatorDropdown = require('./SimulatorDropdown');

var BuckToolbar = React.createClass({
  displayName: 'BuckToolbar',

  propTypes: {
    initialBuildTarget: PropTypes.string,
  },

  getInitialState() {
    return {
      currentProgress: 0,
      maxProgress: 100,
    };
  },

  setCurrentProgress(currentProgress: number) {
    this.setState({currentProgress});
  },

  setMaxProgressAndResetProgress(maxProgress: number) {
    this.setState({currentProgress: 0, maxProgress});
  },

  setCurrentProgressToMaxProgress() {
    this.setCurrentProgress(this.state.maxProgress);
  },

  render(): ReactElement {
    return (
      <div className="buck-toolbar block">
        <AtomComboBox
          className="inline-block"
          ref="buildTarget"
          requestOptions={requestOptions}
          intialTextInput={this.props.initialBuildTarget}
          placeholderText="Buck build target"
        />
        <SimulatorDropdown
          className="inline-block"
          ref="simulator-menu"
          title="Choose target device"
        />
        <div className="btn-group inline-block">
          <button onClick={this._build} className="btn">Build</button>
          <button onClick={this._run} className="btn">Run</button>
          <button onClick={this._debug} className="btn">Debug</button>
        </div>

        <progress
          ref="progress-bar"
          className="inline-block buck-toolbar-progress-bar"
          value={this.state.currentProgress}
          max={this.state.maxProgress}
        />
      </div>
    );
  },

  getBuildTarget(): string {
    return this.refs['buildTarget'].getText().trim();
  },

  getSimulator(): ?string {
    return this.refs['simulator-menu'].getSelectedSimulator();
  },

  _build() {
    this._doBuild(/* run */ false);
  },

  _run() {
    this._buildAndLaunchApp(/* debug */ false);
  },

  _debug() {
    this._buildAndLaunchApp(/* debug */ true);
  },

  async _buildAndLaunchApp(debug: boolean): Promise {
    // TODO(natthu): Restore validation logic to make sure the target is installable.
    // For now, let's leave that to Buck.

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    var installResult = await this._doBuild(/* run */ true);
    if (!installResult) {
      return;
    }
    var {buckProject, buildTarget, pid} = installResult;

    if (debug && pid) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = await require('nuclide-service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
      var buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(pid, buckProjectPath);
    }
  },

  /**
   * @return Promise which may resolve to null if either
   *   (a) the active file in the editor is not part of a Buck project, or
   *   (b) there are errors in the build.
   */
  async _doBuild(run: boolean): Promise<?{buckProject: BuckProject; buildTarget: string, pid: ?number}> {
    var buildTarget = this.getBuildTarget();
    if (!buildTarget) {
      return;
    }

    var buckProject = await getCurrentBuckProject();
    if (!buckProject) {
      var activeEditor = atom.workspace.getActiveTextEditor();
      if (!activeEditor) {
        atom.notifications.addWarning(
            `Could not build: must navigate to a file that is part of a Buck project.`);
        return;
      }

      var fileName = activeEditor.getPath();
      atom.notifications.addWarning(
          `Could not build: file '${fileName}' is not part of a Buck project.`);
      return;
    }

    var command = `buck ${run ? 'install' : 'build'} ${buildTarget}`;
    atom.notifications.addInfo(`${command} started.`);
    this.setMaxProgressAndResetProgress(0);
    var pid;
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
          this.setMaxProgressAndResetProgress(message['numRules']);
        } else if (type === 'BuildRuleFinished') {
          this.setCurrentProgress(++ruleCount);
        } else if (type === 'BuildFinished') {
          this.setCurrentProgressToMaxProgress();
          isFinished = true;
          if (!run) {
            ws.close();
          }
        } else if (type === 'InstallFinished') {
          if (message['success']) {
            pid = message['pid'];
          }
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

    var buildReport;
    if (run) {
      buildReport = await buckProject.install(buildTarget, true, this.getSimulator());
    } else {
      buildReport = await buckProject.build(buildTarget);
    }

    if (!buildReport['success']) {
      // TODO(natthu): Update Buck to include build errors in the report and
      // display them here.
      atom.notifications.addError(`${buildTarget} failed to build.`);
      return;
    }

    atom.notifications.addSuccess(`${command} succeeded.`);
    return {buckProject, buildTarget, pid};
  },
});

module.exports = BuckToolbar;
