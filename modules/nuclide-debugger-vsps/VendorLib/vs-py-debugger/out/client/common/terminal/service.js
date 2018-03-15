"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const types_1 = require("../../ioc/types");
const types_2 = require("../application/types");
const types_3 = require("../types");
const types_4 = require("./types");
let TerminalService = class TerminalService {
    constructor(serviceContainer, resource, title = 'Python') {
        this.serviceContainer = serviceContainer;
        this.resource = resource;
        this.title = title;
        this.terminalClosed = new vscode_1.EventEmitter();
        const disposableRegistry = this.serviceContainer.get(types_3.IDisposableRegistry);
        disposableRegistry.push(this);
        this.terminalHelper = this.serviceContainer.get(types_4.ITerminalHelper);
        this.terminalManager = this.serviceContainer.get(types_2.ITerminalManager);
        this.terminalManager.onDidCloseTerminal(this.terminalCloseHandler, this, disposableRegistry);
    }
    get onDidCloseTerminal() {
        return this.terminalClosed.event;
    }
    dispose() {
        if (this.terminal) {
            this.terminal.dispose();
        }
    }
    sendCommand(command, args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTerminal();
            const text = this.terminalHelper.buildCommandForTerminal(this.terminalShellType, command, args);
            this.terminal.show(true);
            this.terminal.sendText(text, true);
        });
    }
    sendText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTerminal();
            this.terminal.show(true);
            this.terminal.sendText(text);
        });
    }
    show() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTerminal();
            this.terminal.show(true);
        });
    }
    ensureTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.terminal) {
                return;
            }
            const shellPath = this.terminalHelper.getTerminalShellPath();
            this.terminalShellType = !shellPath || shellPath.length === 0 ? types_4.TerminalShellType.other : this.terminalHelper.identifyTerminalShell(shellPath);
            this.terminal = this.terminalManager.createTerminal({ name: this.title });
            // Sometimes the terminal takes some time to start up before it can start accepting input.
            yield new Promise(resolve => setTimeout(resolve, 100));
            const activationCommamnds = yield this.terminalHelper.getEnvironmentActivationCommands(this.terminalShellType, this.resource);
            if (activationCommamnds) {
                for (const command of activationCommamnds) {
                    this.terminal.show(true);
                    this.terminal.sendText(command);
                    // Give the command some time to complete.
                    // Its been observed that sending commands too early will strip some text off.
                    yield new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            this.terminal.show(true);
        });
    }
    terminalCloseHandler(terminal) {
        if (terminal === this.terminal) {
            this.terminalClosed.fire();
            this.terminal = undefined;
        }
    }
};
TerminalService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IServiceContainer))
], TerminalService);
exports.TerminalService = TerminalService;
//# sourceMappingURL=service.js.map