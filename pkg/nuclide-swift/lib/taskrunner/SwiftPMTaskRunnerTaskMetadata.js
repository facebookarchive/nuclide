"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwiftPMTaskRunnerTaskMetadata = exports.SwiftPMTaskRunnerTestTaskMetadata = exports.SwiftPMTaskRunnerBuildTaskMetadata = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const SwiftPMTaskRunnerBuildTaskMetadata = {
  type: 'build',
  label: 'Build',
  description: 'Build a Swift package',
  icon: 'tools'
};
exports.SwiftPMTaskRunnerBuildTaskMetadata = SwiftPMTaskRunnerBuildTaskMetadata;
const SwiftPMTaskRunnerTestTaskMetadata = {
  type: 'test',
  label: 'Test',
  description: "Run a Swift package's tests",
  icon: 'check'
};
exports.SwiftPMTaskRunnerTestTaskMetadata = SwiftPMTaskRunnerTestTaskMetadata;
const SwiftPMTaskRunnerTaskMetadata = [SwiftPMTaskRunnerBuildTaskMetadata, SwiftPMTaskRunnerTestTaskMetadata];
exports.SwiftPMTaskRunnerTaskMetadata = SwiftPMTaskRunnerTaskMetadata;