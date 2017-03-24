/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuxTourModel} from '../../nuclide-nux/lib/NuxModel';

// Diff View NUX constants.
export const NUX_DIFF_VIEW_ID = 4368;
const NUX_DIFF_VIEW_NAME = 'nuclide_diff_view_nux';
const NUX_DIFF_VIEW_GK = 'mp_nuclide_diff_view_nux';

export function createDiffViewNux(): NuxTourModel {
  const diffViewFilesNux = {
    content: 'View the list of newly added and modified files.',
    selector: '.nuclide-diff-view-tree',
    position: 'top',
  };

  const diffViewTimelineNux = {
    content: 'Compare, commit and amend revisions!',
    selector: '.nuclide-diff-timeline',
    position: 'top',
  };

  const diffViewPhabricatorNux = {
    content: 'Send your changes to Phabricator for review without leaving Nuclide!',
    selector: '.nuclide-diff-timeline .revision-timeline-wrap .btn',
    position: 'bottom',
  };

  const diffViewNuxTour = {
    id: NUX_DIFF_VIEW_ID,
    name: NUX_DIFF_VIEW_NAME,
    gatekeeperID: NUX_DIFF_VIEW_GK,
    nuxList: [
      diffViewFilesNux,
      diffViewTimelineNux,
      diffViewPhabricatorNux,
    ],
  };

  return diffViewNuxTour;
}
