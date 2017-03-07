/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NavigationSection, NavigationSectionStatusType} from '../types';
import type {NuclideUri} from '../../../commons-node/nuclideUri';

import {Button} from '../../../nuclide-ui/Button';
import {CompositeDisposable} from 'atom';
import React from 'react';

type Props = {
  commandTarget: string | HTMLElement,
  navigationSections: Array<NavigationSection>,
  filePath: NuclideUri,
  selectedNavigationSectionIndex: number,
  onNavigateToNavigationSection: (section: NavigationSectionStatusType, lineNumber: number) => any,
};

export default class SectionDirectionNavigator extends React.Component {
  _subscriptions: CompositeDisposable;
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClickNavigateDown = this._onClickNavigateDown.bind(this);
    (this: any)._onClickNavigateUp = this._onClickNavigateUp.bind(this);

    const {commandTarget} = this.props;
    this._subscriptions = new CompositeDisposable(
      atom.commands.add(
        commandTarget,
        'nuclide-diff-view:next-diff-section',
        this._onClickNavigateDown,
      ),
      atom.commands.add(
        commandTarget,
        'nuclide-diff-view:previous-diff-section',
        this._onClickNavigateUp,
      ),
    );
  }

  render(): React.Element<any> {
    const {filePath} = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    const hasDiffsUp = this._getPreviousNavigationSection() != null;
    const hasDiffsDown = this._getNextNavigationSection() != null;

    return (
      <span className="nuclide-diff-view-direction">
        <Button
          disabled={!hasActiveFile || !hasDiffsDown}
          icon="arrow-down"
          onClick={this._onClickNavigateDown}
          size="SMALL"
          title="Jump to next section"
        />
        <Button
          disabled={!hasActiveFile || !hasDiffsUp}
          icon="arrow-up"
          onClick={this._onClickNavigateUp}
          size="SMALL"
          title="Jump to previous section"
        />
      </span>
    );
  }

  _onClickNavigateUp(): void {
    this._navigateToSection(this._getPreviousNavigationSection());
  }

  _onClickNavigateDown(): void {
    this._navigateToSection(this._getNextNavigationSection());
  }

  _navigateToSection(section: ?NavigationSection): void {
    if (section == null) {
      return;
    }
    this.props.onNavigateToNavigationSection(section.status, section.lineNumber);
  }

  _getPreviousNavigationSection(): ?NavigationSection {
    const {navigationSections, selectedNavigationSectionIndex} = this.props;
    const previousSectionIndex = selectedNavigationSectionIndex - 1;
    if (previousSectionIndex < 0) {
      return null;
    }
    return navigationSections[previousSectionIndex];
  }

  _getNextNavigationSection(): ?NavigationSection {
    const {navigationSections, selectedNavigationSectionIndex} = this.props;
    const nextSectionIndex = selectedNavigationSectionIndex + 1;
    if (nextSectionIndex >= navigationSections.length) {
      return null;
    }
    return navigationSections[nextSectionIndex];
  }
}
