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
  AppState,
  NavigationSectionStatusType,
} from '../types';
import type DiffViewModel from '../DiffViewModel';
import typeof * as BoundActionCreators from '../redux/Actions';

import invariant from 'assert';
import {
  FlexDirections,
  ResizableFlexContainer,
  ResizableFlexItem,
} from '../../../nuclide-ui/ResizableFlexContainer';
import {DiffMode} from '../constants';
import {DIFF_EDITOR_MARKER_CLASS} from '../../../commons-atom/vcs';
import React from 'react';
import {
  centerScrollToBufferLine,
  navigationSectionStatusToEditorElement,
  renderCommitView,
  renderFileChanges,
  renderPublishView,
  renderTimelineView,
} from '../DiffViewComponent';
import {Modal} from '../../../nuclide-ui/Modal';
import SectionDirectionNavigator from './SectionDirectionNavigator';
import {notifyInternalError} from '../notifications';

type Props = AppState & {
  actionCreators: BoundActionCreators,
  // TODO(most): deprecate the model - use `actionCreators` instead.
  diffModel: DiffViewModel,
  tryTriggerNux: () => mixed,
};

export default class DiffViewNavigatorComponent extends React.Component {
  props: Props;
  _navigatorPane: atom$Pane;
  _fileChangesPane: atom$Pane;

  constructor(props: Props) {
    super(props);
    (this: any)._handleNavigateToSection = this._handleNavigateToSection.bind(this);
  }

  componentDidMount(): void {
    this.props.tryTriggerNux();
  }

  render(): React.Element<any> {
    return (
      <ResizableFlexContainer
        className="nuclide-diff-view-navigator-root"
        direction={FlexDirections.HORIZONTAL}>
        <ResizableFlexItem initialFlexScale={1}>
          <div className="nuclide-diff-view-navigator-timeline-container">
            {this._renderNavigationState()}
          </div>
        </ResizableFlexItem>
        <ResizableFlexItem initialFlexScale={0.5}>
          {this._renderFileChanges()}
        </ResizableFlexItem>
      </ResizableFlexContainer>
    );
  }

  _renderFileChanges(): React.Element<any> {
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
      <div className="nuclide-diff-view-navigator-file-changes-container">
        <div>
          {sectionNavigator}
        </div>
        {renderFileChanges(this.props.diffModel)}
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
        return this._renderPublishView();
      default:
        throw new Error(`Invalid Diff Mode: ${viewMode}`);
    }
  }

  _renderPublishView(): React.Element<any> {
    const {actionCreators, diffModel, shouldDockPublishView} = this.props;

    const publishViewElement = renderPublishView(diffModel);
    if (shouldDockPublishView) {
      return publishViewElement;
    } else {
      const dismissHandler = () => {
        actionCreators.setViewMode(DiffMode.BROWSE_MODE);
      };
      invariant(document.body != null);
      const modalMaxHeight = document.body.clientHeight - 100;
      return (
        <div>
          {renderTimelineView(diffModel)}
          <Modal onDismiss={dismissHandler}>
            <div
              style={{maxHeight: modalMaxHeight}}
              className="nuclide-diff-view-modal-diff-mode">
              {publishViewElement}
            </div>
          </Modal>
        </div>
      );
    }
  }
}
