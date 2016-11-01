'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NavigationSection,
  NavigationSectionStatusType,
} from './types';

import classnames from 'classnames';
import {NavigationSectionStatus} from './constants';
import {React, ReactDOM} from 'react-for-atom';

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
      return 'added';
    case NavigationSectionStatus.CHANGED:
      return 'modified';
    case NavigationSectionStatus.REMOVED:
      return 'removed';
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

class NavigatonBarJumpTarget extends React.Component {
  props: NavigatonBarJumpTargetProps;

  constructor(props: NavigatonBarJumpTargetProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  componentDidMount() {
    const {navigationSection: {status, lineNumber, lineCount}} = this.props;
    const domElement = ReactDOM.findDOMNode(this);
    domElement.setAttribute('nav-status', status);
    domElement.setAttribute('nav-line-count', lineCount);
    domElement.setAttribute('nav-line-number', lineNumber);
  }

  render(): React.Element<any> {
    const {navigationSection, pixelRangeForNavigationSection, navigationScale} = this.props;
    const lineChangeClass = sectionStatusToClassName(navigationSection.status);
    const {top, bottom} = pixelRangeForNavigationSection(navigationSection);
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
