// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

if (window.domAutomationController) {
    var uiTests = {};

    function UITestSuite()
    {
        WebInspector.TestBase.call(this, window.domAutomationController);
    }

    UITestSuite.prototype = {
        __proto__: WebInspector.TestBase.prototype
    };

    UITestSuite.prototype.testRemoteWebSocket = function()
    {
        /**
         * @param {string} message JSON response from remote browser
         */
        function messageReceived(message)
        {
            var messageObject = JSON.parse(message);
            url = messageObject[0]["webSocketDebuggerUrl"];
            this.assertTrue(url.startsWith("ws://"));
            this.releaseControl();
        }

        /**
         * @param {!Array.<!Adb.Device>} devices Remote devices
         */
        function devicesUpdated(devices)
        {
            this.assertEquals(devices.length, 1);
            var browsers = devices[0].browsers;
            this.assertEquals(browsers.length, 1);
            browserId = browsers[0].id;
            DevToolsAPI.sendMessageToEmbedder("sendJsonRequest", [browserId, "/json"], messageReceived.bind(this));
        }

        DevToolsAPI.setDevicesUpdatedCallback(devicesUpdated.bind(this));
        this.takeControl();
        DevToolsAPI.sendMessageToEmbedder("setDevicesUpdatesEnabled", [true], null);
    };

    uiTests._tryRun = function() {
        if (uiTests._testSuite && uiTests._pendingTestName) {
            var name = uiTests._pendingTestName;
            delete uiTests._pendingTestName;
            if (UITestSuite.prototype.hasOwnProperty(name))
                new UITestSuite().runTest(name);
            else
                uiTests._testSuite.runTest(name);
        }
    }

    uiTests.runTest = function(name)
    {
        uiTests._pendingTestName = name;
        uiTests._tryRun();
    };

    uiTests.testSuiteReady = function(testSuiteConstructor)
    {
        uiTests._testSuite = testSuiteConstructor(window.domAutomationController);
        uiTests._tryRun();
    };
}
