'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as BoundActionCreators from '../redux/Actions';

import {React} from 'react-for-atom';

type Props = {
  actionCreators: BoundActionCreators,
  component: ReactClass<any>,
};

export default class DiffViewNavigatorGadget extends React.Component {
  props: Props;

  getTitle(): string {
    return 'Diff Navigator (WIP)';
  }

  getPreferredInitialHeight(): number {
    return 300;
  }

  didChangeVisibility(visible: boolean) {
    this.props.actionCreators.updateDiffNavigatorVisibility(visible);
  }

  render(): React.Element<any> {
    const {component: Component} = this.props;
    return <Component />;
  }
}
