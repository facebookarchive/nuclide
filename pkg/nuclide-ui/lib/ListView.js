'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

type Props = {
  /**
   * Whether to shade even and odd items differently.
   */
  alternateBackground?: boolean;
  children?: React.Element<any>;
};

/**
 *
 */
export class Listview extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const {
      children,
      alternateBackground,
    } = this.props;
    const wrappedChildren = React.Children.map(
      children,
      (
        child: React.Element<any>,
        index: number,
      ) => {
        return (
          <div key={index} className="nuclide-ui-listview-item">
            {child}
          </div>
        );
      }
    );
    const className = classnames({
      'nuclide-ui-listview': true,
      'nuclide-ui-listview-highlight-odd': alternateBackground,
    });
    return (
      <div className={className}>
        {wrappedChildren}
      </div>
    );
  }
}
