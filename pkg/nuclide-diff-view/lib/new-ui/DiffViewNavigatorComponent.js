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
  AppState,
  NavigationSectionStatusType,
} from '../types';
import type DiffViewModel from '../DiffViewModel';
import typeof * as BoundActionCreators from '../redux/Actions';

import {React} from 'react-for-atom';
import {
  DiffMode,
  DIFF_EDITOR_MARKER_CLASS,
} from '../constants';
import {
  centerScrollToBufferLine,
  navigationSectionStatusToEditorElement,
  renderCommitView,
  renderFileChanges,
  renderPublishView,
  renderTimelineView,
} from '../DiffViewComponent';
import SectionDirectionNavigator from './SectionDirectionNavigator';
import {notifyInternalError} from '../notifications';

type Props = AppState & {
  actionCreators: BoundActionCreators,
  // TODO(most): deprecate the model - use `actionCreators` instead.
  diffModel: DiffViewModel,
};

export default class DiffViewNavigatorComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._handleNavigateToSection = this._handleNavigateToSection.bind(this);
  }

  render(): React.Element<any> {
    const {
      fileDiff: {activeSectionIndex, filePath, navigationSections},
      isLoadingFileDiff,
    } = this.props;

    let sectionNavigator;
    if (isLoadingFileDiff) {
      sectionNavigator = (
        <div className="padded">
          Loading Changes ...
        </div>
      );
    } else if (navigationSections.length === 0) {
      sectionNavigator = (
        <div className="padded">
          No active diff changes
        </div>
      );
    } else {
      sectionNavigator = (
        <div className="padded">
          <span>Changed Sections: </span>
          <SectionDirectionNavigator
            commandTarget={`.${DIFF_EDITOR_MARKER_CLASS}`}
            filePath={filePath}
            navigationSections={navigationSections}
            selectedNavigationSectionIndex={activeSectionIndex}
            onNavigateToNavigationSection={this._handleNavigateToSection}
          />
        </div>
      );
    }

    return (
      <div className="nuclide-diff-view-navigator-root">
        <div className="nuclide-diff-view-navigator-timeline-container">
          {this._renderNavigationState()}
        </div>
        <div className="nuclide-diff-view-navigator-vertical-selector" />
        <div className="nuclide-diff-view-navigator-file-changes-container">
          {sectionNavigator}
          <div className="nuclide-diff-view-navigator-horizontal-selector" />
          {renderFileChanges(this.props.diffModel)}
        </div>

      </div>
    );
  }

  _handleNavigateToSection(
    status: NavigationSectionStatusType,
    lineNumber: number,
  ): void {
    const {diffEditors} = this.props;
    if (diffEditors == null) {
      notifyInternalError(new Error('diffEditors cannot be null while navigating!'));
      return;
    }
    const {newDiffEditor, oldDiffEditor} = diffEditors;
    const textEditorElement = navigationSectionStatusToEditorElement(
      oldDiffEditor.getEditorDomElement(),
      newDiffEditor.getEditorDomElement(),
      status,
    );
    centerScrollToBufferLine(textEditorElement, lineNumber);
  }

  _renderNavigationState(): React.Element<any> {
    const {diffModel, viewMode} = this.props;
    switch (viewMode) {
      case DiffMode.BROWSE_MODE:
        return renderTimelineView(diffModel);
      case DiffMode.COMMIT_MODE:
        return renderCommitView(diffModel);
      case DiffMode.PUBLISH_MODE:
        return renderPublishView(diffModel);
      default:
        throw new Error(`Invalid Diff Mode: ${viewMode}`);
    }
  }
}
