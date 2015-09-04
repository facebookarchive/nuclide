'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var buckServicePromise = require('nuclide-service-hub-plus').consumeFirstProvider('buck.service');

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

var {TextEditor} = require('atom');
var AtomComboBox = require('nuclide-ui-atom-combo-box');
var React = require('react-for-atom');
var {PropTypes} = React;
var SimulatorDropdown = require('./SimulatorDropdown');

class BuckToolbar extends React.Component {

  /**
   * The toolbar makes an effort to keep track of which BuckProject to act on, based on the last
   * TextEditor that had focus that corresponded to a BuckProject. This means that if a user opens
   * an editor for a file in a Buck project, types in a build target, focuses an editor for a file
   * that is not part of a Buck project, and hits "Build," the toolbar will build the target in the
   * project that corresponds to the editor that previously had focus.
   *
   * Ultimately, we should have a dropdown to let the user specify the Buck project when it is
   * ambiguous.
   */
  _mostRecentBuckProject: ?BuckProject;
  _textEditorToBuckProject: WeakMap<TextEditor, BuckProject>;
  _activePaneItemSubscription: atom$Disposable;

  constructor(props: mixed) {
    super(props);
    this.state = {
      buttonsDisabled: !this.props.initialBuildTarget,
      isBuilding: false,
      currentProgress: 0,
      maxProgress: 100,
    };
    this._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._requestOptions = this._requestOptions.bind(this);
    this._build = this._build.bind(this);
    this._run = this._run.bind(this);
    this._debug = this._debug.bind(this);
    this._withProgress = this._withProgress.bind(this);

    this._textEditorToBuckProject = new WeakMap();

    this._mostRecentBuckProject = null;
    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());
    this._activePaneItemSubscription = atom.workspace.onDidChangeActivePaneItem(
      this._onActivePaneItemChanged.bind(this));
  }

  componentWillUnmount() {
    this._activePaneItemSubscription.dispose();
  }

  setCurrentProgress(currentProgress: number) {
    this.setState({currentProgress});
  }

  setMaxProgressAndResetProgress(maxProgress: number) {
    this.setState({currentProgress: 0, maxProgress});
  }

  setCurrentProgressToMaxProgress() {
    this.setCurrentProgress(this.state.maxProgress);
  }

  async _onActivePaneItemChanged(item: mixed): Promise<void> {
    if (!(item instanceof TextEditor)) {
      return;
    }

    var textEditor: TextEditor = item;
    var nuclideUri = textEditor.getPath();
    if (!nuclideUri) {
      return;
    }

    var buckProject = this._textEditorToBuckProject.get(textEditor);
    if (buckProject) {
      this._mostRecentBuckProject = buckProject;
      return;
    }

    // Asynchronously find the BuckProject for the NuclideUri. If, by the time the BuckProject is
    // found, TextEditor is still the active editor (or this._mostRecentBuckProject has not been set
    // yet), then update this._mostRecentBuckProject.
    var buckService = await buckServicePromise;
    buckProject = await buckService.buckProjectRootForPath(nuclideUri);
    if (buckProject) {
      this._textEditorToBuckProject.set(textEditor, buckProject);
      var activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor === textEditor || this._mostRecentBuckProject == null) {
        this._mostRecentBuckProject = buckProject;
      }
    }
  }

  async _requestOptions(inputText: string): Promise<Array<string>> {
    var buckProject = this._mostRecentBuckProject;
    if (!buckProject) {
      return [];
    }

    return buckProject.listAliases();
  }

  render(): ReactElement {
    var disabled = this.state.buttonsDisabled;
    var progressBar;
    if (this.state.isBuilding) {
      progressBar =
        <progress
          className="inline-block buck-toolbar-progress-bar"
          value={this.state.currentProgress}
          max={this.state.maxProgress}
        />;
    }
    return (
      <div className="buck-toolbar block">
        <AtomComboBox
          className="inline-block"
          ref="buildTarget"
          requestOptions={this._requestOptions}
          size="sm"
          initialTextInput={this.props.initialBuildTarget}
          onChange={this._handleBuildTargetChange}
          placeholderText="Buck build target"
        />
        <SimulatorDropdown
          className="inline-block"
          ref="simulator-menu"
          title="Choose target device"
        />
        <div className="btn-group btn-group-sm inline-block">
          <button onClick={this._build} disabled={disabled} className="btn">Build</button>
          <button onClick={this._run} disabled={disabled} className="btn">Run</button>
          <button onClick={this._debug} disabled={disabled} className="btn">Debug</button>
        </div>
        {progressBar}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    this.setState({buttonsDisabled: !value});
  }

  getBuildTarget(): string {
    return this.refs['buildTarget'].getText().trim();
  }

  getSimulator(): ?string {
    return this.refs['simulator-menu'].getSelectedSimulator();
  }

  /**
   * Displays the progress bar until this promise is settled, then removes it.
   */
  async _withProgress(promise: Promise): Promise<void> {
    this.setState({isBuilding: true});
    try {
      await promise;
    } finally {
      this.setState({isBuilding: false});
    }
  }

  _build() {
    this._withProgress(this._doBuild(/* run */ false));
  }

  _run() {
    this._withProgress(this._buildAndLaunchApp(/* debug */ false));
  }

  _debug() {
    this._withProgress(this._buildAndLaunchApp(/* debug */ true));
  }

  async _buildAndLaunchApp(debug: boolean): Promise {
    // TODO(natthu): Restore validation logic to make sure the target is installable.
    // For now, let's leave that to Buck.

    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    var installResult = await this._doBuild(/* run */ true, debug);
    if (!installResult) {
      return;
    }
    var {buckProject, pid} = installResult;

    if (debug && pid) {
      // Use commands here to trigger package activation.
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
      var debuggerService = await require('nuclide-service-hub-plus')
          .consumeFirstProvider('nuclide-debugger.remote');
      var buckProjectPath = await buckProject.getPath();
      debuggerService.debugLLDB(pid, buckProjectPath);
    }
  }

  /**
   * @return Promise which may resolve to null if either
   *   (a) the active file in the editor is not part of a Buck project, or
   *   (b) there are errors in the build.
   */
  async _doBuild(run: boolean, debug: boolean = false): Promise<?{buckProject: BuckProject; buildTarget: string, pid: ?number}> {
    var buildTarget = this.getBuildTarget();
    if (!buildTarget) {
      return;
    }

    var buckProject = this._mostRecentBuckProject;
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
      buildReport = await buckProject.install([buildTarget], true, debug, this.getSimulator());
    } else {
      buildReport = await buckProject.build([buildTarget]);
    }

    if (!buildReport['success']) {
      // TODO(natthu): Update Buck to include build errors in the report and
      // display them here.
      atom.notifications.addError(`${buildTarget} failed to build.`);
      return;
    }

    atom.notifications.addSuccess(`${command} succeeded.`);
    return {buckProject, buildTarget, pid};
  }
}

BuckToolbar.propTypes = {
  initialBuildTarget: PropTypes.string,
};

module.exports = BuckToolbar;
