/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  ClearRecordsAction,
  RegisterExecutorAction,
  ExecuteAction,
  Executor,
  OutputProvider,
  OutputProviderStatus,
  Record,
  RecordProvider,
  RecordReceivedAction,
  RegisterRecordProviderAction,
  RemoveSourceAction,
  SelectExecutorAction,
  SetMaxMessageCountAction,
  UpdateStatusAction,
} from '../types';

export const CLEAR_RECORDS = 'CLEAR_RECORDS';
export const REGISTER_EXECUTOR = 'REGISTER_EXECUTOR';
export const EXECUTE = 'EXECUTE';
export const REGISTER_RECORD_PROVIDER = 'REGISTER_RECORD_PROVIDER';
export const SELECT_EXECUTOR = 'SELECT_EXECUTOR';
export const SET_MAX_MESSAGE_COUNT = 'SET_MAX_MESSAGE_COUNT';
export const RECORD_RECEIVED = 'RECORD_RECEIVED';
export const REMOVE_SOURCE = 'REMOVE_SOURCE';
export const UPDATE_STATUS = 'UPDATE_STATUS';

export function clearRecords(): ClearRecordsAction {
  return {type: CLEAR_RECORDS};
}

export function recordReceived(record: Record): RecordReceivedAction {
  return {
    type: RECORD_RECEIVED,
    payload: {record},
  };
}

export function registerExecutor(executor: Executor): RegisterExecutorAction {
  return {
    type: REGISTER_EXECUTOR,
    payload: {executor},
  };
}

export function execute(code: string): ExecuteAction {
  return {
    type: EXECUTE,
    payload: {code},
  };
}

export function registerOutputProvider(
  outputProvider: OutputProvider,
): RegisterRecordProviderAction {
  // Transform the messages into actions and merge them into the action stream.
  // TODO: Add enabling/disabling of registered source and only subscribe when enabled. That
  //       way, we won't trigger cold observer side-effects when we don't need the results.
  return registerRecordProvider({
    ...outputProvider,
    records: outputProvider.messages
      .map(message => ({
        ...message,
        kind: 'message',
        sourceId: outputProvider.id,
        scopeName: null,
        // Eventually, we'll want to allow providers to specify custom timestamps for records.
        timestamp: new Date(),
      })),
  });
}

export function registerRecordProvider(
  recordProvider: RecordProvider,
): RegisterRecordProviderAction {
  return {
    type: REGISTER_RECORD_PROVIDER,
    payload: {recordProvider},
  };
}

export function unregisterRecordProvider(recordProvider: RecordProvider): RemoveSourceAction {
  return removeSource(recordProvider.id);
}

export function unregisterOutputProvider(outputProvider: OutputProvider): RemoveSourceAction {
  return removeSource(outputProvider.id);
}

export function selectExecutor(executorId: string): SelectExecutorAction {
  return {
    type: SELECT_EXECUTOR,
    payload: {executorId},
  };
}

export function setMaxMessageCount(maxMessageCount: number): SetMaxMessageCountAction {
  return {
    type: SET_MAX_MESSAGE_COUNT,
    payload: {maxMessageCount},
  };
}

export function removeSource(sourceId: string): RemoveSourceAction {
  return {
    type: REMOVE_SOURCE,
    payload: {sourceId},
  };
}

export function unregisterExecutor(executor: Executor): RemoveSourceAction {
  return removeSource(executor.id);
}

export function updateStatus(providerId: string, status: OutputProviderStatus): UpdateStatusAction {
  return {
    type: UPDATE_STATUS,
    payload: {providerId, status},
  };
}
