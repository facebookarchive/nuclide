'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import type BuckToolbarActions from '../BuckToolbarActions';
import type BuckToolbarStore from '../BuckToolbarStore';

import {Combobox} from '../../../nuclide-ui/lib/Combobox';

import {lastly} from '../../../commons-node/promise';
import {createBuckProject} from '../../../nuclide-buck-base';

const NO_ACTIVE_PROJECT_ERROR = 'No active Buck project. Check your Current Working Root.';

type Props = {
  store: BuckToolbarStore,
  actions: BuckToolbarActions,
};

export default class BuckToolbarTargetSelector extends React.Component {
  props: Props;

  // Querying Buck can be slow, so cache aliases by project.
  // Putting the cache here allows the user to refresh it by toggling the UI.
  _projectAliasesCache: Map<string, Promise<Array<string>>>;

  constructor(props: Props) {
    super(props);
    (this: any)._requestOptions = this._requestOptions.bind(this);
    (this: any)._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
    this._projectAliasesCache = new Map();
  }

  async _requestOptions(inputText: string): Promise<Array<string>> {
    const buckRoot = this.props.store.getCurrentBuckRoot();
    if (buckRoot == null) {
      throw new Error(NO_ACTIVE_PROJECT_ERROR);
    }

    let aliases = this._projectAliasesCache.get(buckRoot);
    if (!aliases) {
      const buckProject = createBuckProject(buckRoot);
      aliases = lastly(
        buckProject.listAliases(),
        () => buckProject.dispose(),
      );
      this._projectAliasesCache.set(buckRoot, aliases);
    }

    const result = (await aliases).slice();
    if (inputText.trim() && result.indexOf(inputText) === -1) {
      result.splice(0, 0, inputText);
    }
    return result;
  }

  _handleBuildTargetChange(value: string) {
    const trimmed = value.trim();
    if (this.props.store.getBuildTarget() === trimmed) {
      return;
    }
    this.props.actions.updateBuildTarget(trimmed);
  }

  render(): React.Element<any> {
    return (
      <Combobox
        className="inline-block nuclide-buck-target-combobox"
        formatRequestOptionsErrorMessage={err => err.message}
        requestOptions={this._requestOptions}
        size="sm"
        loadingMessage="Updating target names..."
        initialTextInput={this.props.store.getBuildTarget()}
        onSelect={this._handleBuildTargetChange}
        onBlur={this._handleBuildTargetChange}
        placeholderText="Buck build target"
        width={null}
      />
    );
  }

}
