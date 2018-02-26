/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {IBreakpoint, IDebugService, IExceptionBreakpoint} from '../types';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import invariant from 'assert';
import * as React from 'react';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import {track} from '../../../nuclide-analytics';
import {ListView, ListViewItem} from '../../../nuclide-ui/ListView';
import classnames from 'classnames';
import {Icon} from 'nuclide-commons-ui/Icon';
import {AnalyticsEvents} from '../constants';
import {openSourceLocation} from '../utils';

type Props = {|
  service: IDebugService,
|};

type State = {
  supportsConditionalBreakpoints: boolean,
  breakpoints: IBreakpoint[],
  exceptionBreakpoints: IExceptionBreakpoint[],
};

export default class BreakpointListComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = this._computeState();
  }

  _computeState(): State {
    const {service} = this.props;
    const {focusedProcess} = service.viewModel;
    const model = service.getModel();
    return {
      supportsConditionalBreakpoints:
        focusedProcess != null &&
        Boolean(
          focusedProcess.session.capabilities.supportsConditionalBreakpoints,
        ),
      breakpoints: model.getBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints(),
    };
  }

  componentDidMount(): void {
    const model = this.props.service.getModel();
    this._disposables = new UniversalDisposable(
      model.onDidChangeBreakpoints(() => {
        this.setState(this._computeState());
      }),
    );
  }

  componentWillUnmount(): void {
    if (this._disposables != null) {
      this._disposables.dispose();
    }
  }

  _handleBreakpointEnabledChange = (
    breakpoint: IBreakpoint,
    enabled: boolean,
  ): void => {
    this.props.service.enableOrDisableBreakpoints(enabled, breakpoint);
  };

  _handleBreakpointClick = (
    breakpointIndex: number,
    breakpoint: ?IBreakpoint,
  ): void => {
    invariant(breakpoint != null);
    const {uri, line} = breakpoint;
    // Debugger model is 1-based while Atom UI is zero-based.
    openSourceLocation(uri, line - 1);
  };

  render(): React.Node {
    const {
      breakpoints,
      exceptionBreakpoints,
      supportsConditionalBreakpoints,
    } = this.state;
    const {service} = this.props;
    const isReadonlyTarget = false;

    const items = breakpoints
      // Show resolved breakpoints at the top of the list, then order by filename & line number.
      .sort(
        (breakpointA, breakpointB) =>
          100 * (Number(breakpointB.verified) - Number(breakpointA.verified)) +
          10 *
            nuclideUri
              .basename(breakpointA.uri)
              .localeCompare(nuclideUri.basename(breakpointB.uri)) +
          Math.sign(breakpointA.line - breakpointB.line),
      )
      .map((breakpoint, i) => {
        const basename = nuclideUri.basename(breakpoint.uri);
        const {line, enabled, verified: resolved, uri: path} = breakpoint;
        const label = `${basename}:${line}`;
        const title = !enabled
          ? 'Disabled breakpoint'
          : !resolved
            ? 'Unresolved Breakpoint'
            : `Breakpoint at ${label} (resolved)`;

        const conditionElement =
          supportsConditionalBreakpoints && breakpoint.condition != null ? (
            <div
              className="nuclide-debugger-breakpoint-condition"
              title={`Breakpoint condition: ${breakpoint.condition}`}
              data-path={path}
              data-line={line}
              onClick={event => {
                atom.commands.dispatch(
                  event.target,
                  'nuclide-debugger:edit-breakpoint',
                );
              }}>
              Condition: {breakpoint.condition}
            </div>
          ) : null;

        const content = (
          <div className="inline-block">
            <div
              className={classnames({
                'nuclide-debugger-breakpoint-disabled': !enabled,
                'nuclide-debugger-breakpoint-with-condition': Boolean(
                  breakpoint.condition,
                ),
              })}
              key={i}>
              <Checkbox
                checked={enabled}
                indeterminate={!resolved}
                disabled={!resolved}
                onChange={this._handleBreakpointEnabledChange.bind(
                  this,
                  breakpoint,
                )}
                onClick={(event: SyntheticEvent<>) => event.stopPropagation()}
                title={title}
                className={classnames(
                  resolved ? '' : 'nuclide-debugger-breakpoint-unresolved',
                  'nuclide-debugger-breakpoint-checkbox',
                )}
              />
              <span title={title} data-path={path} data-line={line}>
                <div className="nuclide-debugger-breakpoint-condition-controls">
                  <Icon
                    icon="pencil"
                    className="nuclide-debugger-breakpoint-condition-control"
                    data-path={path}
                    data-line={line}
                    onClick={event => {
                      track(AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
                      atom.commands.dispatch(
                        event.target,
                        'nuclide-debugger:edit-breakpoint',
                      );
                    }}
                  />
                  <Icon
                    icon="x"
                    className="nuclide-debugger-breakpoint-condition-control"
                    data-path={path}
                    data-line={line}
                    onClick={event => {
                      track(
                        AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON,
                      );
                      atom.commands.dispatch(
                        event.target,
                        'nuclide-debugger:remove-breakpoint',
                      );
                    }}
                  />
                </div>
                {label}
              </span>
              {conditionElement}
            </div>
          </div>
        );
        return (
          <ListViewItem
            key={label}
            index={i}
            value={breakpoint}
            data-path={path}
            data-line={line}
            title={title}
            className="nuclide-debugger-breakpoint">
            {content}
          </ListViewItem>
        );
      });
    const separator =
      breakpoints.length !== 0 ? (
        <hr className="nuclide-ui-hr nuclide-debugger-breakpoint-separator" />
      ) : null;
    return (
      <div>
        {exceptionBreakpoints.map(exceptionBreakpoint => {
          return (
            <div
              className="nuclide-debugger-breakpoint"
              key={exceptionBreakpoint.getId()}>
              <Checkbox
                className={classnames(
                  'nuclide-debugger-breakpoint-checkbox',
                  'nuclide-debugger-exception-checkbox',
                )}
                onChange={enabled =>
                  service.enableOrDisableBreakpoints(
                    enabled,
                    exceptionBreakpoint,
                  )
                }
                checked={exceptionBreakpoint.enabled}
                disabled={isReadonlyTarget}
              />
              {exceptionBreakpoint.label ||
                `${exceptionBreakpoint.filter} exceptions`}
            </div>
          );
        })}
        {separator}
        <ListView
          alternateBackground={true}
          onSelect={this._handleBreakpointClick}
          selectable={true}>
          {items}
        </ListView>
      </div>
    );
  }
}
