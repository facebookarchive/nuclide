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
import classnames from 'classnames';

type Props = {
  headline: React.Element<any> | string;
  children?: React.Element<any>;
  collapsable?: boolean;
  collapsedByDefault?: boolean;
};

type State = {
  isCollapsed: boolean;
};

/** A vertical divider with a title.
 * Specifying `collapsable` prop as true will add a clickable chevron icon that
 * collapses the component children. Optionally specify collapsedByDefault
 * (defaults to false)
 **/
export class Section extends React.Component {

  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    const initialIsCollapsed: boolean =
      this.props.collapsable != null
      && this.props.collapsable
      && this.props.collapsedByDefault != null
      && this.props.collapsedByDefault;

    this.state = {
      isCollapsed: initialIsCollapsed,
    };
  }

  render(): React.Element<any> {
    const collapsable: boolean = (this.props.collapsable != null)
      ? this.props.collapsable
      : false;
    const isCollapsed: boolean = this.state.isCollapsed;
    const chevronTooltip: string = (isCollapsed) ? 'Click to expand' : 'Click to collapse';
    // Only include classes if the component is collapsable
    const iconClass = classnames(
      {
        'icon': collapsable,
        'icon-chevron-down': collapsable && !isCollapsed,
        'icon-chevron-right': collapsable && isCollapsed,
        'nuclide-ui-section-collapsable': collapsable,
      }
    );
    const conditionalProps = {};
    if (collapsable) {
      conditionalProps.onClick = this._toggleCollapsed.bind(this);
      conditionalProps.title = chevronTooltip;
    }

    return (
      <div>
        <h3 className={iconClass} {...conditionalProps}>
          {this.props.headline}
        </h3>
        <div style={(isCollapsed) ? {display: 'none'} : {}}>{this.props.children}</div>
      </div>
    );
  }

  _toggleCollapsed(): void {
    this.setState({isCollapsed: !this.state.isCollapsed});
  }
}
