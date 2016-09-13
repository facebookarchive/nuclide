Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.createDiffViewNux = createDiffViewNux;

// Diff View NUX constants.
var NUX_DIFF_VIEW_ID = 4368;
exports.NUX_DIFF_VIEW_ID = NUX_DIFF_VIEW_ID;
var NUX_DIFF_VIEW_NAME = 'nuclide_diff_view_nux';
var NUX_DIFF_VIEW_GK = 'mp_nuclide_diff_view_nux';

function createDiffViewNux() {

  var diffViewFilesNux = {
    content: 'View the list of newly added and modified files.',
    selector: '.nuclide-diff-view-tree',
    position: 'top'
  };

  var diffViewTimelineNux = {
    content: 'Compare, commit and amend revisions!',
    selector: '.nuclide-diff-timeline',
    position: 'top'
  };

  var diffViewEditButtonNux = {
    content: 'Want to make changes? Click here to open the file in an editor.',
    selector: '.nuclide-diff-view-goto-editor-button',
    position: 'left'
  };

  var diffViewPhabricatorNux = {
    content: 'Publish your changes to Phabricator without leaving Nuclide!',
    selector: '.nuclide-diff-timeline .revision-timeline-wrap .btn',
    position: 'bottom'
  };

  var diffViewNuxTour = {
    id: NUX_DIFF_VIEW_ID,
    name: NUX_DIFF_VIEW_NAME,
    gatekeeperID: NUX_DIFF_VIEW_GK,
    nuxList: [diffViewFilesNux, diffViewTimelineNux, diffViewEditButtonNux, diffViewPhabricatorNux]
  };

  return diffViewNuxTour;
}