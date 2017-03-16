'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const DiffMode = exports.DiffMode = Object.freeze({
  BROWSE_MODE: '1. Browse',
  COMMIT_MODE: '2. Commit',
  PUBLISH_MODE: '3. Publish'
});

// This is to work around flow's missing support of enums.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

DiffMode;

const DiffOption = exports.DiffOption = Object.freeze({
  DIRTY: 'Dirty',
  LAST_COMMIT: 'Last Commit',
  COMPARE_COMMIT: 'Compare Commit'
});

// This is to work around flow's missing support of enums.
DiffOption;

const CommitMode = exports.CommitMode = Object.freeze({
  COMMIT: 'Commit',
  AMEND: 'Amend'
});

// This is to work around flow's missing support of enums.
CommitMode;

const CommitModeState = exports.CommitModeState = Object.freeze({
  READY: 'Ready',
  LOADING_COMMIT_MESSAGE: 'Loading Commit Message',
  AWAITING_COMMIT: 'Awaiting Commit'
});

// This is to work around flow's missing support of enums.
CommitModeState;

const PublishMode = exports.PublishMode = Object.freeze({
  CREATE: 'Create',
  UPDATE: 'Update'
});

// This is to work around flow's missing support of enums.
PublishMode;

const PublishModeState = exports.PublishModeState = Object.freeze({
  READY: 'Ready',
  LOADING_PUBLISH_MESSAGE: 'Loading Publish Message',
  AWAITING_PUBLISH: 'Awaiting Publish',
  PUBLISH_ERROR: 'Publish Error'
});

// This is to work around flow's missing support of enums.
PublishModeState;

const NON_MERCURIAL_REPO_DISPLAY_NAME = exports.NON_MERCURIAL_REPO_DISPLAY_NAME = '[X] Non-Mercurial Repository';

const NavigationSectionStatus = exports.NavigationSectionStatus = Object.freeze({
  ADDED: 'Added',
  CHANGED: 'Changed',
  REMOVED: 'Removed',
  NEW_ELEMENT: 'New Element',
  OLD_ELEMENT: 'Old Element'
});

// This is to work around flow's missing support of enums.
NavigationSectionStatus;

const LintErrorMessages = exports.LintErrorMessages = ['Usage Exception: Lint', 'ESLint reported a warning'];

const DiffViewFeatures = exports.DiffViewFeatures = Object.freeze({
  INTERACTIVE: 'nuclide_interactive_commit'
});

const GatedFeatureList = exports.GatedFeatureList = [DiffViewFeatures.INTERACTIVE];

const DIFF_EDITOR_MARKER_CLASS = exports.DIFF_EDITOR_MARKER_CLASS = 'nuclide-diff-editor-marker';
const DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND = exports.DIFF_VIEW_NAVIGATOR_TOGGLE_COMMAND = 'diff-view-navigator:toggle';
const DIFF_VIEW_TEXT_BASED_FORM_CONFIG_KEY = exports.DIFF_VIEW_TEXT_BASED_FORM_CONFIG_KEY = 'nuclide-diff-view.textBasedDiffForm';
const SHOULD_DOCK_PUBLISH_VIEW_CONFIG_KEY = exports.SHOULD_DOCK_PUBLISH_VIEW_CONFIG_KEY = 'nuclide-diff-view.shouldDockPublishView';
const TASK_ID_REGEX = exports.TASK_ID_REGEX = /t?(\d+),?/;
const USER_REGEX = exports.USER_REGEX = /^(#?\w[\w -]+\w),?/;