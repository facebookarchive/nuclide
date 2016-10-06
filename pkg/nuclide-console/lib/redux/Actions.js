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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.clearRecords = clearRecords;
exports.recordReceived = recordReceived;
exports.registerExecutor = registerExecutor;
exports.execute = execute;
exports.registerOutputProvider = registerOutputProvider;
exports.registerRecordProvider = registerRecordProvider;
exports.unregisterRecordProvider = unregisterRecordProvider;
exports.unregisterOutputProvider = unregisterOutputProvider;
exports.selectExecutor = selectExecutor;
exports.setMaxMessageCount = setMaxMessageCount;
exports.removeSource = removeSource;
exports.unregisterExecutor = unregisterExecutor;
exports.updateStatus = updateStatus;
var CLEAR_RECORDS = 'CLEAR_RECORDS';
exports.CLEAR_RECORDS = CLEAR_RECORDS;
var REGISTER_EXECUTOR = 'REGISTER_EXECUTOR';
exports.REGISTER_EXECUTOR = REGISTER_EXECUTOR;
var EXECUTE = 'EXECUTE';
exports.EXECUTE = EXECUTE;
var REGISTER_RECORD_PROVIDER = 'REGISTER_RECORD_PROVIDER';
exports.REGISTER_RECORD_PROVIDER = REGISTER_RECORD_PROVIDER;
var SELECT_EXECUTOR = 'SELECT_EXECUTOR';
exports.SELECT_EXECUTOR = SELECT_EXECUTOR;
var SET_MAX_MESSAGE_COUNT = 'SET_MAX_MESSAGE_COUNT';
exports.SET_MAX_MESSAGE_COUNT = SET_MAX_MESSAGE_COUNT;
var RECORD_RECEIVED = 'RECORD_RECEIVED';
exports.RECORD_RECEIVED = RECORD_RECEIVED;
var REMOVE_SOURCE = 'REMOVE_SOURCE';
exports.REMOVE_SOURCE = REMOVE_SOURCE;
var UPDATE_STATUS = 'UPDATE_STATUS';

exports.UPDATE_STATUS = UPDATE_STATUS;

function clearRecords() {
  return { type: CLEAR_RECORDS };
}

function recordReceived(record) {
  return {
    type: RECORD_RECEIVED,
    payload: { record: record }
  };
}

function registerExecutor(executor) {
  return {
    type: REGISTER_EXECUTOR,
    payload: { executor: executor }
  };
}

function execute(code) {
  return {
    type: EXECUTE,
    payload: { code: code }
  };
}

function registerOutputProvider(outputProvider) {
  // Transform the messages into actions and merge them into the action stream.
  // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
  //       way, we won't trigger cold observer side-effects when we don't need the results.
  return registerRecordProvider(_extends({}, outputProvider, {
    records: outputProvider.messages.map(function (message) {
      return _extends({}, message, {
        kind: 'message',
        sourceId: outputProvider.id,
        scopeName: null
      });
    })
  }));
}

function registerRecordProvider(recordProvider) {
  return {
    type: REGISTER_RECORD_PROVIDER,
    payload: { recordProvider: recordProvider }
  };
}

function unregisterRecordProvider(recordProvider) {
  return removeSource(recordProvider.id);
}

function unregisterOutputProvider(outputProvider) {
  return removeSource(outputProvider.id);
}

function selectExecutor(executorId) {
  return {
    type: SELECT_EXECUTOR,
    payload: { executorId: executorId }
  };
}

function setMaxMessageCount(maxMessageCount) {
  return {
    type: SET_MAX_MESSAGE_COUNT,
    payload: { maxMessageCount: maxMessageCount }
  };
}

function removeSource(sourceId) {
  return {
    type: REMOVE_SOURCE,
    payload: { sourceId: sourceId }
  };
}

function unregisterExecutor(executor) {
  return removeSource(executor.id);
}

function updateStatus(providerId, status) {
  return {
    type: UPDATE_STATUS,
    payload: { providerId: providerId, status: status }
  };
}