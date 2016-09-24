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
import invariant from 'assert';
import {React} from 'react-for-atom';

type Props = {
  /**
   * Whether to shade even and odd items differently.
   */
  alternateBackground?: boolean,
  children?: React.Element<any>,
  /**
   * Whether items can be selected.
   * If specified, `onSelect` must also be specified.
   */
  selectable?: boolean,
  /**
   * Handler to be called upon selection. Called iff `selectable` is `true`.
   */
  onSelect?: (selectedIndex: number, event: SyntheticMouseEvent) => mixed,
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
      selectable,
      onSelect,
    } = this.props;
    const wrappedChildren = React.Children.map(
      children,
      (
        child: React.Element<any>,
        index: number,
      ) => {
        const dynamicProps = {};
        if (selectable) {
          invariant(onSelect != null);
          dynamicProps.onClick = onSelect.bind(this, index);
        }
        return (
          <div
            key={index}
            className="nuclide-ui-listview-item"
            {...dynamicProps}>
            {child}
          </div>
        );
      },
    );
    const className = classnames({
      'nuclide-ui-listview': true,
      'nuclide-ui-listview-highlight-odd': alternateBackground,
      'nuclide-ui-listview-selectable': selectable,
    });
    return (
      <div className={className}>
        {wrappedChildren}
      </div>
    );
  }
}
