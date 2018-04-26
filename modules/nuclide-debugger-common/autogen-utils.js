'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.






















generatePropertyArray = generatePropertyArray;exports.










































getNativeAutoGenConfig = getNativeAutoGenConfig;var _react = _interopRequireWildcard(require('react'));var _constants;function _load_constants() {return _constants = require('./constants');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                */function generatePropertyArray(launchOrAttachConfigProperties, required, visible) {const propertyArray = Object.entries(launchOrAttachConfigProperties).map(property => {const name = property[0];const propertyDetails = property[1];const autoGenProperty = { name, type: propertyDetails.type, description: propertyDetails.description, required: required.includes(name), visible: visible.includes(name) };if (typeof propertyDetails.default !== 'undefined') {autoGenProperty.defaultValue = propertyDetails.default;}if (propertyDetails.items != null && typeof propertyDetails.items.type !== 'undefined') {autoGenProperty.itemType = propertyDetails.items.type;}if (typeof propertyDetails.enums !== 'undefined') {autoGenProperty.enums = propertyDetails.enums;}return autoGenProperty;}).sort((p1, p2) => {// TODO (goom): sort all configs, not just ones generated from the json
    if (p1.required && !p2.required) {return -1;}if (p2.required && !p1.required) {return 1;}return 0;});return propertyArray;}function getNativeAutoGenConfig(vsAdapterType) {const program = { name: 'program', type: 'string', description: 'Input the program/executable you want to launch', required: true, visible: true };const cwd = { name: 'cwd',
    type: 'string',
    description: 'Working directory for the launched executable',
    required: true,
    visible: true };

  const args = {
    name: 'args',
    type: 'array',
    itemType: 'string',
    description: 'Arguments to the executable',
    required: false,
    defaultValue: '',
    visible: true };

  const env = {
    name: 'env',
    type: 'array',
    itemType: 'string',
    description: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)',
    required: false,
    defaultValue: '',
    visible: true };

  const sourcePath = {
    name: 'sourcePath',
    type: 'string',
    description: 'Optional base path for sources',
    required: false,
    defaultValue: '',
    visible: true };


  const debugTypeMessage = `using ${
  vsAdapterType === (_constants || _load_constants()).VsAdapterTypes.NATIVE_GDB ? 'gdb' : 'lldb'
  }`;

  const autoGenLaunchConfig = {
    launch: true,
    vsAdapterType,
    threads: true,
    properties: [program, cwd, args, env, sourcePath],
    scriptPropertyName: 'program',
    scriptExtension: '.c',
    cwdPropertyName: 'working directory',
    header: _react.createElement('p', null, 'Debug native programs ', debugTypeMessage, '.') };


  const pid = {
    name: 'pid',
    type: 'process',
    description: '',
    required: true,
    visible: true };

  const autoGenAttachConfig = {
    launch: false,
    vsAdapterType,
    threads: true,
    properties: [pid, sourcePath],
    header: _react.createElement('p', null, 'Attach to a running native process ', debugTypeMessage) };

  return {
    launch: autoGenLaunchConfig,
    attach: autoGenAttachConfig };

}