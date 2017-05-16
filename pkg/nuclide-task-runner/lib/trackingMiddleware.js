'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trackingMiddleware = trackingMiddleware;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function trackingMiddleware(store) {
  return next => action => {
    switch (action.type) {
      case (_Actions || _load_Actions()).TASK_STARTED:
        trackTaskAction('nuclide-task-runner:task-started', store, action);
        break;
      case (_Actions || _load_Actions()).TASK_STOPPED:
        trackTaskAction('nuclide-task-runner:task-stopped', store, action);
        break;
      case (_Actions || _load_Actions()).TASK_COMPLETED:
        trackTaskAction('nuclide-task-runner:task-completed', store, action);
        break;
      case (_Actions || _load_Actions()).TASK_ERRORED:
        trackTaskAction('nuclide-task-runner:task-errored', store, action);
        break;
    }
    return next(action);
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function trackTaskAction(type, store, action) {
  const { activeTaskRunner } = store.getState();

  if (!activeTaskRunner) {
    throw new Error('Invariant violation: "activeTaskRunner"');
  }

  const { taskStatus } = action.payload;
  const { task } = taskStatus;
  const taskTrackingData = typeof task.getTrackingData === 'function' ? task.getTrackingData() : {};
  const error = action.type === (_Actions || _load_Actions()).TASK_ERRORED ? action.payload.error : null;
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackEvent)({
    type,
    data: Object.assign({}, taskTrackingData, {
      taskRunnerId: activeTaskRunner.id,
      taskType: taskStatus.metadata.type,
      errorMessage: error != null ? error.message : null,
      stackTrace: error != null ? String(error.stack) : null
    })
  });
}