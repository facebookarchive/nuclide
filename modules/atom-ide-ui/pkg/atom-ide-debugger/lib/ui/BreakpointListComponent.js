/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {IBreakpoint, IDebugService, IExceptionBreakpoint} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import invariant from 'assert';
import * as React from 'react';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Checkbox} from 'nuclide-commons-ui/Checkbox';
import {track} from 'nuclide-commons/analytics';
import {ListView, ListViewItem} from 'nuclide-commons-ui/ListView';
import classnames from 'classnames';
import {Icon} from 'nuclide-commons-ui/Icon';
import {AnalyticsEvents} from '../constants';
import {openSourceLocation} from '../utils';
import {Section} from 'nuclide-commons-ui/Section';
import featureConfig from 'nuclide-commons-atom/feature-config';
import {observeProjectPathsAll} from 'nuclide-commons-atom/projects';

type Props = {|
  service: IDebugService,
|};

type State = {
  supportsConditionalBreakpoints: boolean,
  breakpoints: IBreakpoint[],
  exceptionBreakpoints: IExceptionBreakpoint[],
  exceptionBreakpointsCollapsed: boolean,
  activeProjects: NuclideUri[],
};

export default class BreakpointListComponent extends React.Component<
  Props,
  State,
> {
  _disposables: UniversalDisposable;

  constructor(props: Props) {
    super(props);
    this.state = this._computeState();
    this._disposables = new UniversalDisposable();
  }

  _computeState(): State {
    const {service} = this.props;
    const {focusedProcess} = service.viewModel;
    const model = service.getModel();

    const exceptionBreakpointsCollapsed = Boolean(
      featureConfig.get('debugger-exceptionBreakpointsCollapsed'),
    );

    let newActiveProjects = [];
    if (this.state != null) {
      const {activeProjects} = this.state;
      if (activeProjects != null) {
        newActiveProjects = activeProjects;
      }
    }

    return {
      supportsConditionalBreakpoints:
        focusedProcess != null &&
        Boolean(
          focusedProcess.session.capabilities.supportsConditionalBreakpoints,
        ),
      breakpoints: model.getBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints(),
      exceptionBreakpointsCollapsed,
      activeProjects: newActiveProjects,
    };
  }

  componentDidMount(): void {
    const model = this.props.service.getModel();
    this._disposables.add(
      model.onDidChangeBreakpoints(() => {
        this.setState(this._computeState());
      }),
      observeProjectPathsAll(projectPaths =>
        this.setState({activeProjects: projectPaths}),
      ),
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

  _setExceptionCollapsed = (collapsed: boolean): void => {
    featureConfig.set('debugger-exceptionBreakpointsCollapsed', collapsed);
    this.setState({exceptionBreakpointsCollapsed: collapsed});
  };

  render(): React.Node {
    const {
      exceptionBreakpoints,
      supportsConditionalBreakpoints,
      activeProjects,
    } = this.state;
    const breakpoints = this.state.breakpoints.filter(breakpoint =>
      activeProjects.some(projectPath =>
        breakpoint.uri.startsWith(projectPath),
      ),
    );
    const {service} = this.props;
    const items = breakpoints
      .sort((breakpointA, breakpointB) => {
        const fileA = nuclideUri.basename(breakpointA.uri);
        const fileB = nuclideUri.basename(breakpointB.uri);
        if (fileA !== fileB) {
          return fileA.localeCompare(fileB);
        }

        const lineA =
          breakpointA.endLine != null ? breakpointA.endLine : breakpointA.line;
        const lineB =
          breakpointB.endLine != null ? breakpointB.endLine : breakpointB.line;
        return lineA - lineB;
      })
      .map((breakpoint, i) => {
        const basename = nuclideUri.basename(breakpoint.uri);
        const {line, endLine, enabled, verified, uri: path} = breakpoint;
        const dataLine =
          endLine != null && !Number.isNaN(endLine) ? endLine : line;
        const bpId = breakpoint.getId();
        const label = `${basename}:${dataLine}`;
        const title = !enabled
          ? 'Disabled breakpoint'
          : !verified
            ? 'Unresolved Breakpoint'
            : `Breakpoint at ${label} (resolved)`;

        const conditionElement =
          supportsConditionalBreakpoints && breakpoint.condition != null ? (
            <div
              className="debugger-breakpoint-condition"
              title={`Breakpoint condition: ${breakpoint.condition}`}
              data-path={path}
              data-line={line}
              data-bpid={bpId}
              onClick={event => {
                atom.commands.dispatch(
                  event.target,
                  'debugger:edit-breakpoint',
                );
              }}>
              Condition: {breakpoint.condition}
            </div>
          ) : null;

        const content = (
          <div className="inline-block">
            <div
              className={classnames({
                'debugger-breakpoint-disabled': !enabled,
                'debugger-breakpoint-with-condition': Boolean(
                  breakpoint.condition,
                ),
              })}
              key={i}>
              <Checkbox
                checked={enabled}
                onChange={this._handleBreakpointEnabledChange.bind(
                  this,
                  breakpoint,
                )}
                onClick={(event: SyntheticEvent<>) => event.stopPropagation()}
                title={title}
                className={classnames(
                  verified ? '' : 'debugger-breakpoint-unresolved',
                  'debugger-breakpoint-checkbox',
                )}
              />
              <span
                title={title}
                data-path={path}
                data-bpid={bpId}
                data-line={line}>
                <div className="debugger-breakpoint-condition-controls">
                  <Icon
                    icon="pencil"
                    className="debugger-breakpoint-condition-control"
                    data-path={path}
                    data-bpid={bpId}
                    data-line={line}
                    onClick={event => {
                      track(AnalyticsEvents.DEBUGGER_EDIT_BREAKPOINT_FROM_ICON);
                      atom.commands.dispatch(
                        event.target,
                        'debugger:edit-breakpoint',
                      );
                    }}
                  />
                  <Icon
                    icon="x"
                    className="debugger-breakpoint-condition-control"
                    data-path={path}
                    data-bpid={bpId}
                    data-line={line}
                    onClick={event => {
                      track(
                        AnalyticsEvents.DEBUGGER_DELETE_BREAKPOINT_FROM_ICON,
                      );
                      atom.commands.dispatch(
                        event.target,
                        'debugger:remove-breakpoint',
                      );
                      event.stopPropagation();
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
            data-bpid={bpId}
            data-line={line}
            title={title}
            className="debugger-breakpoint">
            {content}
          </ListViewItem>
        );
      });
    const separator =
      breakpoints.length !== 0 &&
      !this.state.exceptionBreakpointsCollapsed &&
      exceptionBreakpoints.length !== 0 ? (
        <hr className="nuclide-ui-hr debugger-breakpoint-separator" />
      ) : null;
    return (
      <div>
        <Section
          className="debugger-breakpoint-section"
          headline="Exception breakpoints"
          collapsable={true}
          onChange={this._setExceptionCollapsed}
          collapsed={this.state.exceptionBreakpointsCollapsed}>
          {exceptionBreakpoints.map(exceptionBreakpoint => {
            return (
              <div
                className="debugger-breakpoint"
                key={exceptionBreakpoint.getId()}>
                <Checkbox
                  className={classnames(
                    'debugger-breakpoint-checkbox',
                    'debugger-exception-checkbox',
                  )}
                  onChange={enabled =>
                    service.enableOrDisableBreakpoints(
                      enabled,
                      exceptionBreakpoint,
                    )
                  }
                  checked={exceptionBreakpoint.enabled}
                />
                {exceptionBreakpoint.label ||
                  `${exceptionBreakpoint.filter} exceptions`}
              </div>
            );
          })}
        </Section>
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
