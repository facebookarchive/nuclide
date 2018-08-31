// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-suspicious-comment max-func-body-length no-invalid-this no-var-requires no-require-imports no-any
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const getFreePort = require("get-port");
const net_1 = require("net");
const path = require("path");
const stream_1 = require("stream");
const messages_1 = require("vscode-debugadapter/lib/messages");
const constants_1 = require("../../client/common/constants");
const core_utils_1 = require("../../client/common/core.utils");
const helpers_1 = require("../../client/common/helpers");
const constants_2 = require("../../client/debugger/Common/constants");
const protocolParser_1 = require("../../client/debugger/Common/protocolParser");
const protocolWriter_1 = require("../../client/debugger/Common/protocolWriter");
const mainV2_1 = require("../../client/debugger/mainV2");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
class Request extends messages_1.Message {
    constructor(command, args) {
        super('request');
        this.command = command;
        this.arguments = args;
    }
}
const fileToDebug = path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'testMultiRootWkspc', 'workspace5', 'remoteDebugger-start-with-ptvsd.py');
suite('Debugging - Capabilities', () => {
    let disposables;
    let proc;
    setup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                this.skip();
            }
            this.timeout(30000);
            disposables = [];
        });
    });
    teardown(() => {
        disposables.forEach(disposable => {
            try {
                disposable.dispose();
                // tslint:disable-next-line:no-empty
            }
            catch (_a) { }
            try {
                disposable.destroy();
                // tslint:disable-next-line:no-empty
            }
            catch (_b) { }
        });
        try {
            proc.kill();
            // tslint:disable-next-line:no-empty
        }
        catch (_a) { }
    });
    test('Compare capabilities', () => __awaiter(this, void 0, void 0, function* () {
        const protocolWriter = new protocolWriter_1.ProtocolMessageWriter();
        const initializeRequest = new Request('initialize', { pathFormat: 'path' });
        const debugClient = new mainV2_1.PythonDebugger(undefined);
        const inStream = new stream_1.PassThrough();
        const outStream = new stream_1.PassThrough();
        disposables.push(inStream);
        disposables.push(outStream);
        debugClient.start(inStream, outStream);
        const debugClientProtocolParser = new protocolParser_1.ProtocolParser();
        debugClientProtocolParser.connect(outStream);
        disposables.push(debugClientProtocolParser);
        const expectedResponsePromise = new Promise(resolve => debugClientProtocolParser.once('response_initialize', resolve));
        protocolWriter.write(inStream, initializeRequest);
        const expectedResponse = yield expectedResponsePromise;
        const host = 'localhost';
        const port = yield getFreePort({ host, port: 3000 });
        const env = Object.assign({}, process.env);
        env.PYTHONPATH = constants_2.PTVSD_PATH;
        proc = child_process_1.spawn(common_1.PYTHON_PATH, ['-m', 'ptvsd', '--server', '--port', `${port}`, '--file', fileToDebug], { cwd: path.dirname(fileToDebug), env });
        yield core_utils_1.sleep(3000);
        const connected = helpers_1.createDeferred();
        const socket = new net_1.Socket();
        socket.on('error', connected.reject.bind(connected));
        socket.connect({ port, host }, () => connected.resolve(socket));
        yield connected.promise;
        const protocolParser = new protocolParser_1.ProtocolParser();
        protocolParser.connect(socket);
        disposables.push(protocolParser);
        const actualResponsePromise = new Promise(resolve => protocolParser.once('response_initialize', resolve));
        protocolWriter.write(socket, initializeRequest);
        const actualResponse = yield actualResponsePromise;
        chai_1.expect(actualResponse.body).to.deep.equal(expectedResponse.body);
    }));
});
//# sourceMappingURL=capabilities.test.js.map