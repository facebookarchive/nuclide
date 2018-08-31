"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const inversify_1 = require("inversify");
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
let BrowserService = class BrowserService {
    launch(url) {
        launch(url);
    }
};
BrowserService = __decorate([
    inversify_1.injectable()
], BrowserService);
exports.BrowserService = BrowserService;
//# sourceMappingURL=browser.js.map