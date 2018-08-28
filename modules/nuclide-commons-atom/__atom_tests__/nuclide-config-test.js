"use strict";

var _electron = require("electron");

function nuclideConfigFunctions() {
  const data = _interopRequireWildcard(require("../nuclide-config"));

  nuclideConfigFunctions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */
if (!(_electron.remote != null && _electron.ipcRenderer != null)) {
  throw new Error("Invariant violation: \"remote != null && ipcRenderer != null\"");
}

const currentWindowId = _electron.remote.getCurrentWindow().id;

const mockSettings = {
  test: 'mockSettings'
};
const testKey = 'test-nuclide-config-key';
const testOptions = {
  scope: []
};
const testValue = 'test-nuclide-config-value';
const UPDATE_NUCLIDE_CONFIG_SETTINGS = 'nuclide-config-update-settings';
const mockConfigUpdateSettings = {
  settings: mockSettings,
  options: testOptions
};
let ipcRendererSendSpy;
let resetUserSettingsSpy;
let setSpy;
let unsetSpy;
beforeEach(() => {
  setSpy = jest.spyOn(nuclideConfigFunctions().default._config, 'set').mockImplementation(() => true);
  unsetSpy = jest.spyOn(nuclideConfigFunctions().default._config, 'unset').mockImplementation(() => {});
  ipcRendererSendSpy = jest.spyOn(_electron.ipcRenderer, 'send');
  resetUserSettingsSpy = jest.spyOn(nuclideConfigFunctions().default._config, 'resetUserSettings').mockImplementation(() => {}); // Patch the setting so we can test that they are sent/received and reset

  nuclideConfigFunctions().default._config.settings = mockSettings;
});
describe('nuclide-config', () => {
  afterEach(() => {
    // Clear mock calls between tests
    ipcRendererSendSpy.mockClear();
    resetUserSettingsSpy.mockClear();
  });
  it('updates the nuclide config settings on set and emits the updated settings', () => {
    nuclideConfigFunctions().default.set(testKey, testValue, testOptions);
    expect(setSpy).toHaveBeenCalledWith(testKey, testValue, testOptions);
    expect(ipcRendererSendSpy).toHaveBeenCalledWith(UPDATE_NUCLIDE_CONFIG_SETTINGS, {
      settings: mockSettings,
      options: testOptions
    });
  });
  it('updates the nuclide config settings on unset and emits the updated settings', () => {
    nuclideConfigFunctions().default.unset(testKey, testOptions);
    expect(unsetSpy).toHaveBeenCalledWith(testKey, testOptions);
    expect(ipcRendererSendSpy).toHaveBeenCalledWith(UPDATE_NUCLIDE_CONFIG_SETTINGS, {
      settings: mockSettings,
      options: testOptions
    });
  });
  describe('__updateConfigSettingsListener', () => {
    it('resets the config settings on change emitted from another process', () => {
      const differentWindowId = currentWindowId + 1;
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => ({
            id: differentWindowId
          })
        },
        returnValue: {}
      };

      nuclideConfigFunctions().__updateConfigSettingsListener(mockEvent, mockConfigUpdateSettings);

      expect(resetUserSettingsSpy).toHaveBeenCalledWith(mockSettings, testOptions);
    });
    it('does not reset the config settings on change emitted from own process', () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => ({
            id: currentWindowId
          })
        },
        returnValue: {}
      };

      nuclideConfigFunctions().__updateConfigSettingsListener(mockEvent, mockConfigUpdateSettings);

      expect(resetUserSettingsSpy).not.toHaveBeenCalled();
    });
  });
});