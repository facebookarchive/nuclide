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

var SwiftPMTaskRunnerBuildTaskMetadata = {
  type: 'build',
  label: 'Build',
  description: 'Build a Swift package',
  runnable: true,
  icon: 'tools'
};

exports.SwiftPMTaskRunnerBuildTaskMetadata = SwiftPMTaskRunnerBuildTaskMetadata;
var SwiftPMTaskRunnerTestTaskMetadata = {
  type: 'test',
  label: 'Test',
  description: 'Run a Swift package\'s tests',
  runnable: true,
  icon: 'checklist'
};

exports.SwiftPMTaskRunnerTestTaskMetadata = SwiftPMTaskRunnerTestTaskMetadata;
var SwiftPMTaskRunnerTaskMetadata = [SwiftPMTaskRunnerBuildTaskMetadata, SwiftPMTaskRunnerTestTaskMetadata];
exports.SwiftPMTaskRunnerTaskMetadata = SwiftPMTaskRunnerTaskMetadata;