'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuckProject} from '../../nuclide-buck-base';

import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';

import debounce from '../../commons-node/debounce';
import SimulatorDropdown from './SimulatorDropdown';
import BuckToolbarActions from './BuckToolbarActions';
import BuckToolbarStore from './BuckToolbarStore';
import {Combobox} from '../../nuclide-ui/lib/Combobox';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {LoadingSpinner} from '../../nuclide-ui/lib/LoadingSpinner';
import addTooltip from '../../nuclide-ui/lib/add-tooltip';
import {
  onWorkspaceDidStopChangingActivePaneItem,
} from '../../commons-atom/debounced';

const BUCK_TARGET_INPUT_WIDTH = 400;
const formatRequestOptionsErrorMessage = () => 'Failed to get targets from Buck';

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
  _disposables: CompositeDisposable;
  _buckToolbarStore: BuckToolbarStore;
  _buckToolbarActions: BuckToolbarActions;

  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.
  _projectAliasesCache: WeakMap<BuckProject, Promise<Array<string>>>;

  static propTypes = {
    store: React.PropTypes.instanceOf(BuckToolbarStore).isRequired,
    actions: React.PropTypes.instanceOf(BuckToolbarActions).isRequired,
  };

  constructor(props: mixed) {
    super(props);
    (this: any)._handleBuildTargetChange =
      debounce(this._handleBuildTargetChange.bind(this), 100, false);
    (this: any)._handleSimulatorChange = this._handleSimulatorChange.bind(this);
    (this: any)._handleReactNativeServerModeChanged =
      this._handleReactNativeServerModeChanged.bind(this);
    (this: any)._requestOptions = this._requestOptions.bind(this);

    this._buckToolbarActions = this.props.actions;
    this._buckToolbarStore = this.props.store;
    this._projectAliasesCache = new WeakMap();
    this._onActivePaneItemChanged(atom.workspace.getActivePaneItem());

    this._disposables = new CompositeDisposable();
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(
      this._onActivePaneItemChanged.bind(this)));

    // Re-render whenever the data in the store changes.
    this._disposables.add(this._buckToolbarStore.subscribe(() => { this.forceUpdate(); }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _onActivePaneItemChanged(item: ?mixed) {
    if (!atom.workspace.isTextEditor(item)) {
      return;
    }
    const textEditor: TextEditor = ((item: any): TextEditor);
    this._buckToolbarActions.updateProjectFor(textEditor);
  }

  _requestOptions(inputText: string): Promise<Array<string>> {
    const project = this._buckToolbarStore.getMostRecentBuckProject();
    if (project == null) {
      return Promise.resolve([]);
    }

    let aliases = this._projectAliasesCache.get(project);
    if (!aliases) {
      aliases = project.listAliases();
      this._projectAliasesCache.set(project, aliases);
    }

    return aliases;
  }

  render(): React.Element<any> {
    const buckToolbarStore = this._buckToolbarStore;
    let status;
    if (buckToolbarStore.isLoadingRule()) {
      status =
        <div ref={addTooltip({title: 'Waiting on rule info...', delay: 0})}>
          <LoadingSpinner
            className="inline-block"
            size="EXTRA_SMALL"
          />
        </div>;
    } else if (buckToolbarStore.getBuildTarget() &&
               buckToolbarStore.getRuleType() == null) {
      status =
        <span
          className="icon icon-alert"
          ref={addTooltip({
            title: `Rule "${buckToolbarStore.getBuildTarget()}" could not be found.`,
            delay: 0,
          })}
        />;
    }

    let widgets = [];
    if (status != null) {
      widgets.push(
        <div key="status" className="nuclide-buck-status inline-block text-center">
          {status}
        </div>
      );
    } else {
      if (buckToolbarStore.getRuleType() === 'apple_bundle') {
        widgets.push(
          <SimulatorDropdown
            key="simulator-dropdown"
            className="inline-block"
            title="Choose target device"
            onSelectedSimulatorChange={this._handleSimulatorChange}
          />
        );
      }
      if (buckToolbarStore.canBeReactNativeApp()) {
        widgets.push(
          <div key="react-native-checkbox" className="inline-block">
            <Checkbox
              checked={buckToolbarStore.isReactNativeServerMode()}
              onChange={this._handleReactNativeServerModeChanged}
              label={'React Native Server Mode'}
            />
          </div>
        );
      }
    }

    return (
      <div>
        <Combobox
          className="inline-block nuclide-buck-target-combobox"
          ref="buildTarget"
          formatRequestOptionsErrorMessage={formatRequestOptionsErrorMessage}
          requestOptions={this._requestOptions}
          size="sm"
          loadingMessage="Updating target names..."
          initialTextInput={this.props.store.getBuildTarget()}
          onChange={this._handleBuildTargetChange}
          placeholderText="Buck build target"
          width={BUCK_TARGET_INPUT_WIDTH}
        />
        {widgets}
      </div>
    );
  }

  _handleBuildTargetChange(value: string) {
    this._buckToolbarActions.updateBuildTarget(value.trim());
  }

  _handleSimulatorChange(simulator: string) {
    this._buckToolbarActions.updateSimulator(simulator);
  }

  _handleReactNativeServerModeChanged(checked: boolean) {
    this._buckToolbarActions.updateReactNativeServerMode(checked);
  }

}

module.exports = BuckToolbar;
