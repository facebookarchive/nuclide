/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  NavigationSection,
  NavigationSectionStatusType,
} from './types';

import classnames from 'classnames';
import {NavigationSectionStatus} from './constants';
import React from 'react';
import ReactDOM from 'react-dom';

type DiffNavigationBarProps = {
  navigationSections: Array<NavigationSection>,
  navigationScale: number,
  pixelRangeForNavigationSection: (section: NavigationSection) => {top: number, bottom: number},
  onNavigateToNavigationSection: (status: NavigationSectionStatusType, lineNumber: number) => any,
};

export function clickEventToScrollLineNumber(
  sectionLineNumber: number,
  sectionLineCount: number,
  e: SyntheticMouseEvent,
): number {
  const targetRectangle = ((e.target: any): HTMLElement).getBoundingClientRect();
  const lineHeight = (e.clientY - targetRectangle.top) / targetRectangle.height;
  return sectionLineNumber +
    Math.floor(sectionLineCount * lineHeight);
}

export class DiffNavigationBar extends React.Component {
  props: DiffNavigationBarProps;

  constructor(props: DiffNavigationBarProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  render(): React.Element<any> {
    const {
      navigationSections,
      pixelRangeForNavigationSection,
      navigationScale,
    } = this.props;

    const jumpTargets = navigationSections.map(navigationSection => {
      return (
        <NavigatonBarJumpTarget
          navigationScale={navigationScale}
          navigationSection={navigationSection}
          key={navigationSection.status + navigationSection.lineNumber}
          pixelRangeForNavigationSection={pixelRangeForNavigationSection}
          onClick={this._handleClick}
        />
      );
    });

    return (
      <div className="nuclide-diff-view-navigation-bar">
        {jumpTargets}
      </div>
    );
  }

  _handleClick(navigationSectionStatus: NavigationSectionStatusType, lineNumber: number): void {
    this.props.onNavigateToNavigationSection(navigationSectionStatus, lineNumber);
  }
}

function sectionStatusToClassName(statusType: NavigationSectionStatusType): string {
  switch (statusType) {
    case NavigationSectionStatus.ADDED:
      return 'syntax--added';
    case NavigationSectionStatus.CHANGED:
      return 'syntax--modified';
    case NavigationSectionStatus.REMOVED:
      return 'syntax--removed';
    case NavigationSectionStatus.NEW_ELEMENT:
    case NavigationSectionStatus.OLD_ELEMENT:
      return 'icon icon-comment';
    default:
      throw new Error('Invalid navigation section status');
  }
}

type NavigatonBarJumpTargetProps = {
  navigationScale: number,
  navigationSection: NavigationSection,
  pixelRangeForNavigationSection: (section: NavigationSection) => {top: number, bottom: number},
  onClick: (status: NavigationSectionStatusType, lineNumber: number) => any,
};

type NavigatonBarJumpTargetState = {
  pixelRangeForNavigationSection: {top: number, bottom: number},
};

class NavigatonBarJumpTarget extends React.Component {
  props: NavigatonBarJumpTargetProps;
  state: NavigatonBarJumpTargetState;

  constructor(props: NavigatonBarJumpTargetProps) {
    super(props);
    const {navigationSection, pixelRangeForNavigationSection} = props;
    this.state = {
      pixelRangeForNavigationSection: pixelRangeForNavigationSection(navigationSection),
    };
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  componentWillReceiveProps(newProps: NavigatonBarJumpTargetProps): void {
    // This is crazytown but pixelRangeForNavigationSection is not pure.
    // It calls TextEditorComponent.pixelPositionForBufferPosition which
    // via a series of internal calls inside of atom can trigger an
    // updateScrollTop event which can trigger a React render() down the line.
    //
    // React, rightfully so, will yell at you if you cause a setState inside of
    // a render. To workaround this mess, we can update this inside of
    // componentWillReceiveProps.
    const {navigationSection, pixelRangeForNavigationSection} = newProps;
    this.setState({
      pixelRangeForNavigationSection: pixelRangeForNavigationSection(navigationSection),
    });
  }

  componentDidMount() {
    const {navigationSection: {status, lineNumber, lineCount}} = this.props;
    const domElement = ReactDOM.findDOMNode(this);
    // $FlowFixMe
    domElement.setAttribute('nav-status', status);
    // $FlowFixMe
    domElement.setAttribute('nav-line-count', lineCount);
    // $FlowFixMe
    domElement.setAttribute('nav-line-number', lineNumber);
  }

  render(): React.Element<any> {
    const {navigationSection, navigationScale} = this.props;
    const {pixelRangeForNavigationSection} = this.state;
    const lineChangeClass = sectionStatusToClassName(navigationSection.status);
    const {top, bottom} = pixelRangeForNavigationSection;
    const scaledTop = top * navigationScale;
    const scaledHeight = Math.max((bottom - top) * navigationScale, 1);
    const targetStyle = {
      top: `${scaledTop}px`,
      height: `${scaledHeight}px`,
    };
    const targetClassName = classnames({
      'nuclide-diff-view-navigation-target': true,
      [lineChangeClass]: true,
    });

    return (
      <div
        className={targetClassName}
        style={targetStyle}
        onClick={this._handleClick}
      />
    );
  }

  _handleClick(e: SyntheticMouseEvent): void {
    const {navigationSection: {status, lineNumber, lineCount}} = this.props;
    const scrollToLineNumber = clickEventToScrollLineNumber(lineNumber, lineCount, e);
    this.props.onClick(status, scrollToLineNumber);
  }
}
