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
import {ArcToolbarStore} from './ArcToolbarStore';
import {Combobox} from '../../nuclide-ui/lib/Combobox';
import {getLogger} from '../../nuclide-logging';

const ARC_BUILD_TARGET_WIDTH_PX = 120;

function handleRequestOptionsError(error: Error): void {
  const requestErrorMessage = 'Failed to get targets from arc';
  getLogger().error(requestErrorMessage, error);
  atom.notifications.addError(
    requestErrorMessage,
    {detail: error.message},
  );
}

function formatRequestOptionsErrorMessage(): string {
  return 'Arc build steps could not load!';
}

type Props = {
  store: ArcToolbarStore;
};

export default class ArcToolbarSection extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._arcBuild = this._arcBuild.bind(this);
    (this: any)._requestOptions = this._requestOptions.bind(this);
    (this: any)._handleBuildTargetChange = this._handleBuildTargetChange.bind(this);
  }

  render(): ?React.Element {
    const {store} = this.props;
    if (!store.isArcSupported()) {
      return null;
    }
    return (
      <div className="inline-block">
        <Combobox
          className="nuclide-arc-toolbar-combobox inline-block"
          ref="buildTarget"
          formatRequestOptionsErrorMessage={formatRequestOptionsErrorMessage}
          onRequestOptionsError={handleRequestOptionsError}
          requestOptions={this._requestOptions}
          size="sm"
          loadingMessage="Updating target names..."
          initialTextInput={store.getActiveBuildTarget()}
          onChange={this._handleBuildTargetChange}
          placeholderText="build step"
          width={ARC_BUILD_TARGET_WIDTH_PX}
        />
      </div>
    );
  }

  _requestOptions(inputText: string): Promise<Array<string>> {
    return this.props.store.loadBuildTargets();
  }

  _handleBuildTargetChange(value: string) {
    this.props.store.updateBuildTarget(value);
  }

  _arcBuild(): void {
    this.props.store.arcBuild();
  }
}
