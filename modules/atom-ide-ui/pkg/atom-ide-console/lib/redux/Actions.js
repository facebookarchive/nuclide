"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearRecords = clearRecords;
exports.recordReceived = recordReceived;
exports.recordUpdated = recordUpdated;
exports.registerExecutor = registerExecutor;
exports.execute = execute;
exports.registerRecordProvider = registerRecordProvider;
exports.registerSource = registerSource;
exports.unregisterRecordProvider = unregisterRecordProvider;
exports.selectExecutor = selectExecutor;
exports.setMaxMessageCount = setMaxMessageCount;
exports.removeSource = removeSource;
exports.unregisterExecutor = unregisterExecutor;
exports.updateStatus = updateStatus;
exports.setCreatePasteFunction = setCreatePasteFunction;
exports.setWatchEditor = setWatchEditor;
exports.setFontSize = setFontSize;
exports.SET_FONT_SIZE = exports.UPDATE_STATUS = exports.REMOVE_SOURCE = exports.REGISTER_SOURCE = exports.RECORD_UPDATED = exports.RECORD_RECEIVED = exports.SET_MAX_MESSAGE_COUNT = exports.SELECT_EXECUTOR = exports.REGISTER_RECORD_PROVIDER = exports.EXECUTE = exports.REGISTER_EXECUTOR = exports.SET_WATCH_EDITOR_FUNCTION = exports.SET_CREATE_PASTE_FUNCTION = exports.CLEAR_RECORDS = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const CLEAR_RECORDS = 'CLEAR_RECORDS';
exports.CLEAR_RECORDS = CLEAR_RECORDS;
const SET_CREATE_PASTE_FUNCTION = 'SET_CREATE_PASTE_FUNCTION';
exports.SET_CREATE_PASTE_FUNCTION = SET_CREATE_PASTE_FUNCTION;
const SET_WATCH_EDITOR_FUNCTION = 'SET_WATCH_EDITOR_FUNCTION';
exports.SET_WATCH_EDITOR_FUNCTION = SET_WATCH_EDITOR_FUNCTION;
const REGISTER_EXECUTOR = 'REGISTER_EXECUTOR';
exports.REGISTER_EXECUTOR = REGISTER_EXECUTOR;
const EXECUTE = 'EXECUTE';
exports.EXECUTE = EXECUTE;
const REGISTER_RECORD_PROVIDER = 'REGISTER_RECORD_PROVIDER';
exports.REGISTER_RECORD_PROVIDER = REGISTER_RECORD_PROVIDER;
const SELECT_EXECUTOR = 'SELECT_EXECUTOR';
exports.SELECT_EXECUTOR = SELECT_EXECUTOR;
const SET_MAX_MESSAGE_COUNT = 'SET_MAX_MESSAGE_COUNT';
exports.SET_MAX_MESSAGE_COUNT = SET_MAX_MESSAGE_COUNT;
const RECORD_RECEIVED = 'RECORD_RECEIVED';
exports.RECORD_RECEIVED = RECORD_RECEIVED;
const RECORD_UPDATED = 'RECORD_UPDATED';
exports.RECORD_UPDATED = RECORD_UPDATED;
const REGISTER_SOURCE = 'REGISTER_SOURCE';
exports.REGISTER_SOURCE = REGISTER_SOURCE;
const REMOVE_SOURCE = 'REMOVE_SOURCE';
exports.REMOVE_SOURCE = REMOVE_SOURCE;
const UPDATE_STATUS = 'UPDATE_STATUS';
exports.UPDATE_STATUS = UPDATE_STATUS;
const SET_FONT_SIZE = 'SET_FONT_SIZE';
exports.SET_FONT_SIZE = SET_FONT_SIZE;

function clearRecords() {
  return {
    type: CLEAR_RECORDS
  };
}

function recordReceived(record) {
  return {
    type: RECORD_RECEIVED,
    payload: {
      record
    }
  };
}

function recordUpdated(messageId, appendText, overrideLevel, setComplete) {
  return {
    type: RECORD_UPDATED,
    payload: {
      messageId,
      appendText,
      overrideLevel,
      setComplete
    }
  };
}

function registerExecutor(executor) {
  return {
    type: REGISTER_EXECUTOR,
    payload: {
      executor
    }
  };
}

function execute(code) {
  return {
    type: EXECUTE,
    payload: {
      code
    }
  };
}

function registerRecordProvider(recordProvider) {
  return {
    type: REGISTER_RECORD_PROVIDER,
    payload: {
      recordProvider
    }
  };
}

function registerSource(source) {
  return {
    type: REGISTER_SOURCE,
    payload: {
      source
    }
  };
}

function unregisterRecordProvider(recordProvider) {
  return removeSource(recordProvider.id);
}

function selectExecutor(executorId) {
  return {
    type: SELECT_EXECUTOR,
    payload: {
      executorId
    }
  };
}

function setMaxMessageCount(maxMessageCount) {
  return {
    type: SET_MAX_MESSAGE_COUNT,
    payload: {
      maxMessageCount
    }
  };
}

function removeSource(sourceId) {
  return {
    type: REMOVE_SOURCE,
    payload: {
      sourceId
    }
  };
}

function unregisterExecutor(executor) {
  return removeSource(executor.id);
}

function updateStatus(providerId, status) {
  return {
    type: UPDATE_STATUS,
    payload: {
      providerId,
      status
    }
  };
}

function setCreatePasteFunction(createPasteFunction) {
  return {
    type: SET_CREATE_PASTE_FUNCTION,
    payload: {
      createPasteFunction
    }
  };
}

function setWatchEditor(watchEditor) {
  return {
    type: SET_WATCH_EDITOR_FUNCTION,
    payload: {
      watchEditor
    }
  };
}

function setFontSize(fontSize) {
  return {
    type: SET_FONT_SIZE,
    payload: {
      fontSize
    }
  };
}