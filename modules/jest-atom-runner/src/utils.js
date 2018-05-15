'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.buildFailureTestResult = exports.parseMessage = exports.makeMessage = exports.parseJSON = exports.MESSAGE_TYPES = exports.extractIPCIDsFromFilePath = exports.parseIPCIDs = exports.mergeIPCIDs = exports.makeUniqWorkerId = exports.makeUniqServerId = exports.rand = undefined;


















var _path = _interopRequireDefault(require('path'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const IPC_IDS_SEPARATOR = '_'; // server id and worker id merged into one string
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */ /* eslint-disable nuclide-internal/prefer-nuclide-uri */const rand = exports.rand = () => Math.floor(Math.random() * 10000000);const makeUniqServerId = exports.makeUniqServerId = () => `jest-atom-runner-ipc-server-${Date.now() + rand()}`;const makeUniqWorkerId = exports.makeUniqWorkerId = () => `jest-atom-runner-ipc-worker-${Date.now() + rand()}`;const mergeIPCIDs = exports.mergeIPCIDs = ({ serverID,
  workerID }) =>



`${serverID}${IPC_IDS_SEPARATOR}${workerID}`;

const parseIPCIDs = exports.parseIPCIDs = mergedIDs => {
  const [serverID, workerID] = mergedIDs.split(IPC_IDS_SEPARATOR);
  return { serverID, workerID };
};

// The only way atom allows us to pass data to it is in the form of a file path.
// So we pass a non-existing file path to it that encodes server and worker IDs,
// that we later parse and use to communicate back with the parent process.
const extractIPCIDsFromFilePath = exports.extractIPCIDsFromFilePath =
passedFilePath =>
{
  const { serverID, workerID } = parseIPCIDs(_path.default.basename(passedFilePath));
  return { serverID, workerID };
};

const MESSAGE_TYPES = exports.MESSAGE_TYPES = Object.freeze({
  INITIALIZE: 'INITIALIZE',
  DATA: 'DATA',
  RUN_TEST: 'RUN_TEST',
  TEST_RESULT: 'TEST_RESULT',
  TEST_FAILURE: 'TEST_FAILURE',
  SHUT_DOWN: 'SHUT_DOWN' });




const parseJSON = exports.parseJSON = str => {
  if (str == null) {
    throw new Error('String needs to be passed when parsing JSON');
  }
  let data;
  try {
    data = JSON.parse(str);
  } catch (error) {
    throw new Error(`Can't parse JSON: ${str}`);
  }

  return data;
};

const makeMessage = exports.makeMessage = ({
  messageType,
  data }) =>



`${messageType}-${data || ''}`;

const parseMessage = exports.parseMessage = message => {
  const messageType = Object.values(MESSAGE_TYPES).find(msgType =>
  message.startsWith(msgType));

  if (!messageType) {
    throw new Error(`IPC message of unknown type. Message must start from one of the following strings representing types followed by "-'.
         known types: ${JSON.stringify(MESSAGE_TYPES)}`);
  }

  return { messageType, data: message.slice(messageType.length + 1) };
};

const buildFailureTestResult = exports.buildFailureTestResult = (
testPath,
err) =>
{
  return {
    console: null,
    displayName: '',
    failureMessage: null,
    leaks: false,
    numFailingTests: 0,
    numPassingTests: 0,
    numPendingTests: 0,
    perfStats: {
      end: 0,
      start: 0 },

    skipped: false,
    snapshot: {
      added: 0,
      fileDeleted: false,
      matched: 0,
      unchecked: 0,
      uncheckedKeys: [],
      unmatched: 0,
      updated: 0 },

    sourceMaps: {},
    testExecError: err,
    testFilePath: testPath,
    testResults: [] };

};exports.default =

{
  rand,
  makeUniqServerId,
  makeUniqWorkerId,
  extractIPCIDsFromFilePath,
  mergeIPCIDs,
  parseMessage,
  makeMessage,
  MESSAGE_TYPES,
  parseJSON,
  buildFailureTestResult };