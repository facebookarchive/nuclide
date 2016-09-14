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
import {Observable} from 'rxjs';
import type BuckToolbarActions from '../BuckToolbarActions';
import type BuckToolbarStore from '../BuckToolbarStore';

import {Combobox} from '../../../nuclide-ui/lib/Combobox';

import {lastly} from '../../../commons-node/promise';
import {concatLatest} from '../../../commons-node/observable';
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

  _requestOptions(inputText: string): Observable<Array<string>> {
    const buckRoot = this.props.store.getCurrentBuckRoot();
    if (buckRoot == null) {
      return Observable.throw(Error(NO_ACTIVE_PROJECT_ERROR));
    }
    return concatLatest(
      Observable.of(inputText.trim() === '' ? [] : [inputText]),
      Observable.fromPromise(this._getAliases(buckRoot)),
    )
      .map(list => Array.from(new Set(list)));
  }

  _getAliases(buckRoot: string): Promise<Array<string>> {
    let cachedAliases = this._projectAliasesCache.get(buckRoot);
    if (cachedAliases == null) {
      const buckProject = createBuckProject(buckRoot);
      cachedAliases = lastly(
        buckProject.listAliases(),
        () => buckProject.dispose(),
      );
      this._projectAliasesCache.set(buckRoot, cachedAliases);
    }
    return cachedAliases;
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
