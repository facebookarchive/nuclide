'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerActions from './DebuggerActions';

import invariant from 'assert';
import {React} from 'react-for-atom';
import nuclideUri from '../../commons-node/nuclideUri';
import {Checkbox} from '../../nuclide-ui/Checkbox';
import {
  ListView,
  ListViewItem,
} from '../../nuclide-ui/ListView';
import type {FileLineBreakpoints, FileLineBreakpoint} from './types';

type BreakpointListComponentProps = {
  actions: DebuggerActions,
  breakpoints: ?FileLineBreakpoints,
};

export class BreakpointListComponent extends React.Component {
  props: BreakpointListComponentProps;

  constructor(props: BreakpointListComponentProps) {
    super(props);
    (this: any)._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
    (this: any)._handleBreakpointClick = this._handleBreakpointClick.bind(this);
  }

  _handleBreakpointEnabledChange(breakpoint: FileLineBreakpoint, enabled: boolean): void {
    this.props.actions.updateBreakpointEnabled(breakpoint.id, enabled);
  }

  _handleBreakpointClick(
    breakpointIndex: number,
    breakpoint: ?FileLineBreakpoint,
  ): void {
    invariant(breakpoint != null);
    const {
      path,
      line,
    } = breakpoint;
    this.props.actions.openSourceLocation(nuclideUri.nuclideUriToUri(path), line);
  }

  render(): ?React.Element<any> {
    const {breakpoints} = this.props;
    if (breakpoints == null || breakpoints.length === 0) {
      return <span>(no breakpoints)</span>;
    }
    const items = breakpoints
      .map(breakpoint => ({
        ...breakpoint,
        // Calculate the basename exactly once for each breakpoint
        basename: nuclideUri.basename(breakpoint.path),
      }))
      // Show resolved breakpoints at the top of the list, then order by filename & line number.
      .sort((breakpointA, breakpointB) =>
        100 * (Number(breakpointB.resolved) - Number(breakpointA.resolved)) +
         10 * breakpointA.basename.localeCompare(breakpointB.basename) +
              Math.sign(breakpointA.line - breakpointB.line))
      .map((breakpoint, i) => {
        const {
          basename,
          line,
          enabled,
          resolved,
        } = breakpoint;
        const label = `${basename}:${line + 1}`;
        const content = (
          <div className="nuclide-debugger-breakpoint" key={i}>
            <Checkbox
              label={label}
              checked={enabled}
              indeterminate={!resolved}
              disabled={!resolved}
              onChange={this._handleBreakpointEnabledChange.bind(this, breakpoint)}
              title={resolved ? null : 'Unresolved Breakpoint'}
            />
          </div>
        );
        return <ListViewItem key={label} value={breakpoint}>{content}</ListViewItem>;
      });
    return (
      <ListView
        alternateBackground={true}
        onSelect={this._handleBreakpointClick}
        selectable={true}>
        {items}
      </ListView>
    );
  }
}
