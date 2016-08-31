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

import {React} from 'react-for-atom';
import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {Listview} from '../../nuclide-ui/lib/ListView';
import type {FileLineBreakpoints} from './types';

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

  _handleBreakpointEnabledChange(path: string, line: number, enabled: boolean): void {
    // TODO jxg toggle breakpoint enabled/disabled on store
  }

  _handleBreakpointClick(breakpointIndex: number, event: SyntheticMouseEvent): void {
    const {breakpoints} = this.props;
    invariant(breakpoints != null);
    const {
      path,
      line,
    } = breakpoints[breakpointIndex];
    this.props.actions.openSourceLocation(nuclideUri.nuclideUriToUri(path), line);
  }

  render(): ?React.Element<any> {
    const {breakpoints} = this.props;
    if (breakpoints == null || breakpoints.length === 0) {
      return <span>(no breakpoints)</span>;
    }
    const renderedBreakpoints = breakpoints.map((breakpoint, i) => {
      const {
        path,
        line,
        enabled,
        resolved,
      } = breakpoint;
      const label = `${nuclideUri.basename(path)}:${line + 1}`;
      return (
        <div className="nuclide-debugger-breakpoint" key={i}>
          {
            resolved
              ? <Checkbox
                  label={label}
                  checked={enabled}
                  onChange={this._handleBreakpointEnabledChange.bind(this, path, line)}
                />
              : <span>(unresolved) {label}</span>
          }
        </div>
      );
    });
    return (
      <Listview
        alternateBackground={true}
        onSelect={this._handleBreakpointClick}
        selectable={true}>
        {renderedBreakpoints}
      </Listview>
    );
  }
}
