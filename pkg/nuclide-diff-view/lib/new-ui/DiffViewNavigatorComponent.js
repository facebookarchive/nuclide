'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState} from '../types';
import type DiffViewModel from '../DiffViewModel';
import typeof * as BoundActionCreators from '../redux/Actions';

import {React} from 'react-for-atom';
import {DiffMode} from '../constants';
import {
  renderCommitView,
  renderFileChanges,
  renderPublishView,
  renderTimelineView,
} from '../DiffViewComponent';

type Props = AppState & {
  actionCreators: BoundActionCreators,
  // TODO(most): deprecate the model - use `actionCreators` instead.
  diffModel: DiffViewModel,
};

export default class DiffViewNavigatorComponent extends React.Component {
  props: Props;

  render(): React.Element<any> {
    return (
      <div className="nuclide-diff-view-navigator-root">
        <div className="nuclide-diff-view-navigator-file-changes-container">
          {renderFileChanges(this.props.diffModel)}
        </div>
        <div className="nuclide-diff-view-navigator-selector" />
        <div className="nuclide-diff-view-navigator-timeline-container">
          {this._renderNavigationState()}
        </div>
      </div>
    );
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
