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
var IosSimulator = require('./IosSimulator');
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

  render(): ReactElement {
    return (
      <div className='buck-toolbar'>
        <AtomComboBox ref='buildTarget'
                      requestOptions={requestOptions}
                      intialTextInput={this.props.initialBuildTarget}
                      placeholderText='Buck build target'
                      />
        <div className='btn-group'>
          <button onClick={this._build} className='btn'>Build</button>
          <button onClick={this._run} className='btn'>Run</button>
          <button onClick={this._debug} className='btn'>Debug</button>
        </div>

        <progress ref='progress-bar'
                  className='inline-block buck-toolbar-progress-bar'
                  value={this.state.currentProgress}
                  max={this.state.maxProgress}
                  />
      </div>
    );
  },

  getBuildTarget(): string {
    return this.refs['buildTarget'].getText().trim();
  },

  _run() {
    this._buildAndLaunchApp(/* debug */ false);
  },

  _debug() {
    this._buildAndLaunchApp(/* debug */ true);
  },

  async _buildAndLaunchApp(debug: boolean): Promise {
    var buildResult = await this._build();
    if (!buildResult) {
      return;
    }

    var {buckProject, buildTarget} = buildResult;
    // TODO(mbolin): If buildTarget is a flavored build target, then the
    // following logic will not work. Fix these methods so they tolerate
    // flavored build targets.
    var [outputFile, type] = await Promise.all([
        buckProject.outputFileFor(buildTarget),
        buckProject.buildRuleTypeFor(buildTarget),
    ]);

    if (!outputFile) {
      atom.notifications.addWarning(
          `${buildTarget} did not produce an output file to execute.`);
      return;
    }

    if (type !== 'apple_bundle') {
      // TODO(mbolin): For build targets that are known to be runnable, just
      // use `buck run <target>`.
      atom.notifications.addWarning(
          `Nuclide does not know how to run a build rule of type ${type}.`);
      return;
    }

    // Use the path to the output file of an apple_bundle() to determine where
    // the .app directory was created to use with the iOS Simulator.
    var {dotAppDirectoryForAppleBundleOutput} = require('./helpers');
    var dotAppDirectory = dotAppDirectoryForAppleBundleOutput(outputFile);

    var devices = await IosSimulator.getDevices();

    // Pick an arbitrary device for now.
    var device = array.find(devices, elem => elem.name === 'iPhone 5s');
    if (!device && devices.length > 0) {
      device = devices[0];
    }
    if (!device) {
      throw new Error('No simulator devices available.');
    }
    if (device.state === IosSimulator.DeviceState.Shutdown) {
      await IosSimulator.startSimulator(device.udid);
    }

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    await IosSimulator.installApp(device.udid, dotAppDirectory);
    var bundleIdentifier = await IosSimulator.getBundleIdentifier(dotAppDirectory);
    var pid = await IosSimulator.launchApp(device.udid, bundleIdentifier, debug);
    if (debug) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = await require('nuclide-service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
      var buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(pid, buckProjectPath);
    }
  },

  async _build(): Promise<?{buckProject: BuckProject; buildTarget: string}> {
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

    atom.notifications.addInfo(`buck build ${buildTarget} started.`);
    this.setMaxProgressAndResetProgress(0);
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

    var buildReport = await buckProject.build([buildTarget]);

    if (!buildReport['success']) {
      // TODO(natthu): Update Buck to include build errors in the report and
      // display them here.
      atom.notifications.addError(`${buildTarget} failed to build.`);
      return;
    }

    atom.notifications.addSuccess(`buck build ${buildTarget} succeeded.`);
    return {buckProject, buildTarget};
  },
});

module.exports = BuckToolbar;
