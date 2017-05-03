'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setInfoTables = setInfoTables;
exports.refreshDevices = refreshDevices;
exports.setDevices = setDevices;
exports.setHosts = setHosts;
exports.setHost = setHost;
exports.setDeviceType = setDeviceType;
exports.setDeviceTypes = setDeviceTypes;
exports.setDevice = setDevice;
exports.setDeviceActions = setDeviceActions;
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
const SET_DEVICE_ACTIONS = exports.SET_DEVICE_ACTIONS = 'SET_DEVICE_ACTIONS';
const SET_HOSTS = exports.SET_HOSTS = 'SET_HOSTS';
const SET_HOST = exports.SET_HOST = 'SET_HOST';
const REFRESH_DEVICES = exports.REFRESH_DEVICES = 'REFRESH_DEVICES';
const SET_INFO_TABLES = exports.SET_INFO_TABLES = 'SET_INFO_TABLES';

function setInfoTables(infoTables) {
  return {
    type: SET_INFO_TABLES,
    payload: { infoTables }
  };
}

function refreshDevices() {
  return {
    type: REFRESH_DEVICES,
    payload: {}
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

function setDeviceActions(actions) {
  return {
    type: SET_DEVICE_ACTIONS,
    payload: { actions }
  };
}