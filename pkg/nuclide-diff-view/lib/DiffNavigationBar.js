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
  DiffSection,
  DiffSectionStatusType,
} from './types';

import classnames from 'classnames';
import {DiffSectionStatus} from './constants';
import {React} from 'react-for-atom';

type DiffNavigationBarProps = {
  diffSections: Array<DiffSection>,
  navigationScale: number,
  pixelRangeForDiffSection: (diffSection: DiffSection) => {top: number, bottom: number},
  onNavigateToDiffSection: (diffSectionStatus: DiffSectionStatusType, lineNumber: number) => any,
};

export default class DiffNavigationBar extends React.Component {
  props: DiffNavigationBarProps;

  constructor(props: DiffNavigationBarProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  render(): React.Element<any> {
    const {
      diffSections,
      pixelRangeForDiffSection,
      navigationScale,
    } = this.props;

    const jumpTargets = diffSections.map(diffSection => {
      return (
        <NavigatonBarJumpTarget
          navigationScale={navigationScale}
          diffSection={diffSection}
          key={diffSection.status + diffSection.lineNumber}
          pixelRangeForDiffSection={pixelRangeForDiffSection}
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

  _handleClick(diffSectionStatus: DiffSectionStatusType, lineNumber: number): void {
    this.props.onNavigateToDiffSection(diffSectionStatus, lineNumber);
  }
}

function sectionStatusToClassName(statusType: DiffSectionStatusType): string {
  switch (statusType) {
    case DiffSectionStatus.ADDED:
      return 'added';
    case DiffSectionStatus.CHANGED:
      return 'modified';
    case DiffSectionStatus.REMOVED:
      return 'removed';
    default:
      throw new Error('Invalid diff section status');
  }
}

type NavigatonBarJumpTargetProps = {
  navigationScale: number,
  diffSection: DiffSection,
  pixelRangeForDiffSection: (diffSection: DiffSection) => {top: number, bottom: number},
  onClick: (diffSectionStatus: DiffSectionStatusType, lineNumber: number) => any,
};

class NavigatonBarJumpTarget extends React.Component {
  props: NavigatonBarJumpTargetProps;

  constructor(props: NavigatonBarJumpTargetProps) {
    super(props);
    (this: any)._handleClick = this._handleClick.bind(this);
  }

  render(): React.Element<any> {
    const {diffSection, pixelRangeForDiffSection, navigationScale} = this.props;
    const lineChangeClass = sectionStatusToClassName(diffSection.status);
    const {top, bottom} = pixelRangeForDiffSection(diffSection);
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
    const {diffSection} = this.props;
    const targetRectangle = ((e.target: any): HTMLElement).getBoundingClientRect();
    const lineHeight = (e.clientY - targetRectangle.top) / targetRectangle.height;
    const scrollToLineNumber = diffSection.lineNumber +
      Math.floor(diffSection.lineCount * lineHeight);
    this.props.onClick(diffSection.status, scrollToLineNumber);
  }
}
