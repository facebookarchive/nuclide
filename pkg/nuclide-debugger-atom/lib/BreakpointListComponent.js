'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
} from 'react-for-atom';

import nuclideUri from '../../nuclide-remote-uri';
import {Checkbox} from '../../nuclide-ui/lib/Checkbox';
import {Listview} from '../../nuclide-ui/lib/Listview';

// TODO use type from store
type FileLineBreakpoint = {
  path: string;
  line: number;
  enabled: boolean;
  resolved: boolean;
};
type Breakpoints = Array<FileLineBreakpoint>;

type BreakpointListComponentProps = {
  breakpoints: Breakpoints;
};

export class BreakpointListComponent extends React.Component {
  props: BreakpointListComponentProps;

  constructor(props: BreakpointListComponentProps) {
    super(props);
    (this: any)._handleBreakpointEnabledChange = this._handleBreakpointEnabledChange.bind(this);
  }

  _handleBreakpointEnabledChange(path: string, line: number, enabled: boolean): void {
    // TODO jxg toggle breakpoint enabled/disabled on store
  }

  render(): ?React.Element<any> {
    const {breakpoints} = this.props;
    const renderedBreakpoints = breakpoints.map((breakpoint, i) => {
      const {
        path,
        line,
        enabled,
        resolved,
      } = breakpoint;
      const label = `${nuclideUri.basename(path)}:${line}`;
      return (
        <div className="nuclide-debugger-atom-breakpoint" key={i}>
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
        alternateBackground={true}>
        {renderedBreakpoints}
      </Listview>
    );
  }
}
