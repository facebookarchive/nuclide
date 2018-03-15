"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const os = require("os");
function launch(url) {
    let openCommand;
    if (os.platform() === 'win32') {
        openCommand = 'explorer';
    }
    else if (os.platform() === 'darwin') {
        openCommand = '/usr/bin/open';
    }
    else {
        openCommand = '/usr/bin/xdg-open';
    }
    if (!openCommand) {
        console.error(`Unable to determine platform to launch the browser in the Python extension on platform '${os.platform()}'.`);
        console.error(`Link is: ${url}`);
    }
    child_process.spawn(openCommand, [url]);
}
exports.launch = launch;
//# sourceMappingURL=browser.js.map