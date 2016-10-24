'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type BuckToolbarActions from '../BuckToolbarActions';
import type BuckToolbarStore from '../BuckToolbarStore';
import type {TaskType} from '../types';

import BuckToolbar from '../BuckToolbar';
import {React} from 'react-for-atom';

/**
 * Create a component for the extra UI in the Buck version of the toolbar. We use a component
 * (instead of an element) so that we can pass down props from the toolbar itself in the future
 * (e.g. dimensions), and create the component in a closure so that we can close over Buck state
 * too.
 */
export function createExtraUiComponent(
  store: BuckToolbarStore,
  actions: BuckToolbarActions,
): ReactClass<any> {

  return class ExtraUi extends React.Component {

    props: {
      activeTaskType: ?TaskType,
    };

    render(): React.Element<any> {
      return (
        <BuckToolbar
          activeTaskType={this.props.activeTaskType}
          store={store}
          actions={actions}
        />
      );
    }

  };

}
