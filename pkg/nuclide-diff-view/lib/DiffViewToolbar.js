'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NavigationSection, NavigationSectionStatusType} from './types';
import type {NuclideUri} from '../../commons-node/nuclideUri';

import {Button} from '../../nuclide-ui/Button';
import {ButtonGroup} from '../../nuclide-ui/ButtonGroup';
import {CompositeDisposable} from 'atom';
import {React} from 'react-for-atom';
import {Toolbar} from '../../nuclide-ui/Toolbar';
import {ToolbarCenter} from '../../nuclide-ui/ToolbarCenter';
import {ToolbarLeft} from '../../nuclide-ui/ToolbarLeft';
import {ToolbarRight} from '../../nuclide-ui/ToolbarRight';
import SectionDirectionNavigator from './new-ui/SectionDirectionNavigator';

type Props = {
  navigationSections: Array<NavigationSection>,
  filePath: NuclideUri,
  selectedNavigationSectionIndex: number,
  newRevisionTitle: ?string,
  oldRevisionTitle: ?string,
  onSwitchToEditor: () => mixed,
  onNavigateToNavigationSection: (section: NavigationSectionStatusType, lineNumber: number) => any,
};

export default class DiffViewToolbar extends React.Component {
  props: Props;
  _subscriptions: CompositeDisposable;

  render(): React.Element<any> {
    const {
      filePath,
      navigationSections,
      onNavigateToNavigationSection,
      selectedNavigationSectionIndex,
    } = this.props;
    const hasActiveFile = filePath != null && filePath.length > 0;
    return (
      <Toolbar location="top">
        <ToolbarLeft />
        <ToolbarCenter>
          {this.props.oldRevisionTitle == null ? '?' : this.props.oldRevisionTitle}
          {'...'}
          {this.props.newRevisionTitle == null ? '?' : this.props.newRevisionTitle}
        </ToolbarCenter>
        <ToolbarRight>
          <ButtonGroup className="padded" size="SMALL">
            <SectionDirectionNavigator
              commandTarget=".nuclide-diff-editor-container"
              filePath={filePath}
              navigationSections={navigationSections}
              selectedNavigationSectionIndex={selectedNavigationSectionIndex}
              onNavigateToNavigationSection={onNavigateToNavigationSection}
            />
          </ButtonGroup>
          <ButtonGroup size="SMALL">
            <Button
              className="nuclide-diff-view-goto-editor-button"
              disabled={!hasActiveFile}
              onClick={this.props.onSwitchToEditor}>
              Goto Editor
            </Button>
          </ButtonGroup>
        </ToolbarRight>
      </Toolbar>
    );
  }
}
