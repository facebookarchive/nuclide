'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SET_DEVICE_TYPE_TASKS = exports.TOGGLE_PROCESS_POLLING = exports.TOGGLE_DEVICE_POLLING = exports.SET_PROCESS_TASKS = exports.SET_PROCESSES = exports.SET_INFO_TABLES = exports.SET_HOST = exports.SET_HOSTS = exports.SET_DEVICE_TASKS = exports.SET_DEVICE = exports.SET_DEVICES = exports.SET_DEVICE_TYPE = exports.SET_DEVICE_TYPES = undefined;
exports.toggleDevicePolling = toggleDevicePolling;
exports.toggleProcessPolling = toggleProcessPolling;
exports.setInfoTables = setInfoTables;
exports.setProcesses = setProcesses;
exports.setProcessTasks = setProcessTasks;
exports.setDevices = setDevices;
exports.setHosts = setHosts;
exports.setHost = setHost;
exports.setDeviceType = setDeviceType;
exports.setDeviceTypes = setDeviceTypes;
exports.setDevice = setDevice;
exports.setDeviceTasks = setDeviceTasks;
exports.setDeviceTypeTasks = setDeviceTypeTasks;

var _DeviceTask;

function _load_DeviceTask() {
  return _DeviceTask = require('../DeviceTask');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const SET_DEVICE_TYPES = exports.SET_DEVICE_TYPES = 'SET_DEVICE_TYPES';
const SET_DEVICE_TYPE = exports.SET_DEVICE_TYPE = 'SET_DEVICE_TYPE';
const SET_DEVICES = exports.SET_DEVICES = 'SET_DEVICES';
const SET_DEVICE = exports.SET_DEVICE = 'SET_DEVICE';
const SET_DEVICE_TASKS = exports.SET_DEVICE_TASKS = 'SET_DEVICE_TASKS';
const SET_HOSTS = exports.SET_HOSTS = 'SET_HOSTS';
const SET_HOST = exports.SET_HOST = 'SET_HOST';
const SET_INFO_TABLES = exports.SET_INFO_TABLES = 'SET_INFO_TABLES';
const SET_PROCESSES = exports.SET_PROCESSES = 'SET_PROCESSES';
const SET_PROCESS_TASKS = exports.SET_PROCESS_TASKS = 'SET_PROCESS_TASKS';
const TOGGLE_DEVICE_POLLING = exports.TOGGLE_DEVICE_POLLING = 'TOGGLE_DEVICE_POLLING';
const TOGGLE_PROCESS_POLLING = exports.TOGGLE_PROCESS_POLLING = 'TOGGLE_PROCESS_POLLING';
const SET_DEVICE_TYPE_TASKS = exports.SET_DEVICE_TYPE_TASKS = 'SET_DEVICE_TYPE_TASKS';

function toggleDevicePolling(isActive) {
  return {
    type: TOGGLE_DEVICE_POLLING,
    payload: { isActive }
  };
}

function toggleProcessPolling(isActive) {
  return {
    type: TOGGLE_PROCESS_POLLING,
    payload: { isActive }
  };
}

function setInfoTables(infoTables) {
  return {
    type: SET_INFO_TABLES,
    payload: { infoTables }
  };
}

function setProcesses(processes) {
  return {
    type: SET_PROCESSES,
    payload: { processes }
  };
}

function setProcessTasks(processTasks) {
  return {
    type: SET_PROCESS_TASKS,
    payload: { processTasks }
  };
}

function setDevices(devices) {
  return {
    type: SET_DEVICES,
    payload: { devices }
  };
}

function setHosts(hosts) {
  return {
    type: SET_HOSTS,
    payload: { hosts }
  };
}

function setHost(host) {
  return {
    type: SET_HOST,
    payload: { host }
  };
}

function setDeviceType(deviceType) {
  return {
    type: SET_DEVICE_TYPE,
    payload: { deviceType }
  };
}

function setDeviceTypes(deviceTypes) {
  return {
    type: SET_DEVICE_TYPES,
    payload: { deviceTypes }
  };
}

function setDevice(device) {
  return {
    type: SET_DEVICE,
    payload: { device }
  };
}

function setDeviceTasks(deviceTasks) {
  return {
    type: SET_DEVICE_TASKS,
    payload: { deviceTasks }
  };
}

function setDeviceTypeTasks(deviceTypeTasks) {
  return {
    type: SET_DEVICE_TYPE_TASKS,
    payload: { deviceTypeTasks }
  };
}