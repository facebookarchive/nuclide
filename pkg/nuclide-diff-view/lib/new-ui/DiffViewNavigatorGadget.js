/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import typeof * as BoundActionCreators from '../redux/Actions';

import React from 'react';
import {track} from '../../../nuclide-analytics';

type Props = {
  actionCreators: BoundActionCreators,
  component: ReactClass<any>,
};

export const WORKSPACE_VIEW_URI = 'atom://nuclide/diff-view-navigator';

export default class DiffViewNavigatorGadget extends React.Component {
  props: Props;

  getTitle(): string {
    return 'Source Control Navigator';
  }

  getIconName(): string {
    return 'git-branch';
  }

  getPreferredHeight(): number {
    return 300;
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'bottom';
  }

  didChangeVisibility(visible: boolean) {
    track('diff-view-navigator-toggle', {visible});
    this.props.actionCreators.updateDiffNavigatorVisibility(visible);
  }

  render(): React.Element<any> {
    const {component: Component} = this.props;
    return <Component />;
  }

  serialize(): mixed {
    return {
      deserializer: 'nuclide.DiffViewNavigator',
    };
  }
}
