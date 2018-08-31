"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
// tslint:disable:max-func-body-length no-use-before-declare
const chai_1 = require("chai");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const debugSession_1 = require("vscode-debugadapter/lib/debugSession");
const Contracts_1 = require("../../client/debugger/Common/Contracts");
const telemetry_1 = require("../../client/debugger/Common/telemetry");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
suite('Debugging - Performance Telemetry', () => {
    suiteSetup(initialize_1.initialize);
    setup(() => MockDebugSession.TelemetryEvents = []);
    function testTelemetryEvents(expectedActions) {
        chai_1.expect(MockDebugSession.TelemetryEvents).lengthOf(expectedActions.length, 'Incorrect number of events');
        const actions = MockDebugSession.TelemetryEvents.map(item => item.body.data.action);
        chai_1.expect(actions).deep.equal(expectedActions, 'Incorrect actions');
    }
    test('Event = load', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        yield common_1.sleep(501);
        session.onPythonProcessLoaded();
        testTelemetryEvents(['launch']);
        chai_1.expect(MockDebugSession.TelemetryEvents[0].body.data.duration).greaterThan(500, 'incorrect duration');
    }));
    test('Event = stopped for stepin', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        session.onPythonProcessLoaded();
        session.stepInRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        testTelemetryEvents(['launch', 'stepIn']);
    }));
    test('Event = stopped for stepout', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        session.onPythonProcessLoaded();
        session.stepOutRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        testTelemetryEvents(['launch', 'stepOut']);
    }));
    test('Event = stopped for continue', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        session.onPythonProcessLoaded();
        session.continueRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        testTelemetryEvents(['launch', 'continue']);
    }));
    test('Event = stopped for next', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        session.onPythonProcessLoaded();
        session.nextRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        testTelemetryEvents(['launch', 'next']);
    }));
    test('Event = stopped for stepout, next, stepin', () => __awaiter(this, void 0, void 0, function* () {
        const session = new MockDebugSession();
        session.launchRequest();
        session.onPythonProcessLoaded();
        session.stepOutRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        session.nextRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        session.stepInRequest();
        session.sendEvent(new debugSession_1.StoppedEvent('some reason', 0));
        testTelemetryEvents(['launch', 'stepOut', 'next', 'stepIn']);
    }));
});
class MockDebugSession extends vscode_debugadapter_1.DebugSession {
    constructor() {
        super();
    }
    launchRequest() {
    }
    // tslint:disable-next-line:no-unnecessary-override
    sendEvent(event) {
        if (event instanceof Contracts_1.TelemetryEvent) {
            MockDebugSession.TelemetryEvents.push(event);
        }
    }
    onPythonProcessLoaded() {
    }
    stepInRequest() {
    }
    stepOutRequest() {
    }
    continueRequest() {
    }
    nextRequest() {
    }
}
MockDebugSession.TelemetryEvents = [];
__decorate([
    telemetry_1.capturePerformanceTelemetry('launch')
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "launchRequest", null);
__decorate([
    telemetry_1.sendPerformanceTelemetry(telemetry_1.PerformanceTelemetryCondition.stoppedEvent)
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "sendEvent", null);
__decorate([
    telemetry_1.sendPerformanceTelemetry(telemetry_1.PerformanceTelemetryCondition.always)
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "onPythonProcessLoaded", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('stepIn')
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "stepInRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('stepOut')
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "stepOutRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('continue')
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "continueRequest", null);
__decorate([
    telemetry_1.capturePerformanceTelemetry('next')
    // tslint:disable-next-line:no-empty
], MockDebugSession.prototype, "nextRequest", null);
//# sourceMappingURL=perfTelemetry.test.js.map