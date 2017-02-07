'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDiffViewNux = createDiffViewNux;


// Diff View NUX constants.
const NUX_DIFF_VIEW_ID = exports.NUX_DIFF_VIEW_ID = 4368; /**
                                                           * Copyright (c) 2015-present, Facebook, Inc.
                                                           * All rights reserved.
                                                           *
                                                           * This source code is licensed under the license found in the LICENSE file in
                                                           * the root directory of this source tree.
                                                           *
                                                           * 
                                                           */

const NUX_DIFF_VIEW_NAME = 'nuclide_diff_view_nux';
const NUX_DIFF_VIEW_GK = 'mp_nuclide_diff_view_nux';

function createDiffViewNux() {
  const diffViewFilesNux = {
    content: 'View the list of newly added and modified files.',
    selector: '.nuclide-diff-view-tree',
    position: 'top'
  };

  const diffViewTimelineNux = {
    content: 'Compare, commit and amend revisions!',
    selector: '.nuclide-diff-timeline',
    position: 'top'
  };

  const diffViewPhabricatorNux = {
    content: 'Publish your changes to Phabricator without leaving Nuclide!',
    selector: '.nuclide-diff-timeline .revision-timeline-wrap .btn',
    position: 'bottom'
  };

  const diffViewNuxTour = {
    id: NUX_DIFF_VIEW_ID,
    name: NUX_DIFF_VIEW_NAME,
    gatekeeperID: NUX_DIFF_VIEW_GK,
    nuxList: [diffViewFilesNux, diffViewTimelineNux, diffViewPhabricatorNux]
  };

  return diffViewNuxTour;
}