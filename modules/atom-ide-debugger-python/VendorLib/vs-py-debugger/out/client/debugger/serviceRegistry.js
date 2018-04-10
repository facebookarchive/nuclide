// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const socketServer_1 = require("../common/net/socket/socketServer");
const fileSystem_1 = require("../common/platform/fileSystem");
const platformService_1 = require("../common/platform/platformService");
const types_1 = require("../common/platform/types");
const currentProcess_1 = require("../common/process/currentProcess");
const types_2 = require("../common/types");
const container_1 = require("../ioc/container");
const serviceManager_1 = require("../ioc/serviceManager");
const types_3 = require("../ioc/types");
const debugStreamProvider_1 = require("./Common/debugStreamProvider");
const protocolLogger_1 = require("./Common/protocolLogger");
const protocolParser_1 = require("./Common/protocolParser");
const protocolWriter_1 = require("./Common/protocolWriter");
const types_4 = require("./types");
function initializeIoc() {
    const cont = new inversify_1.Container();
    const serviceManager = new serviceManager_1.ServiceManager(cont);
    const serviceContainer = new container_1.ServiceContainer(cont);
    serviceManager.addSingletonInstance(types_3.IServiceContainer, serviceContainer);
    registerTypes(serviceManager);
    return serviceContainer;
}
exports.initializeIoc = initializeIoc;
function registerTypes(serviceManager) {
    serviceManager.addSingleton(types_2.ICurrentProcess, currentProcess_1.CurrentProcess);
    serviceManager.addSingleton(types_4.IDebugStreamProvider, debugStreamProvider_1.DebugStreamProvider);
    serviceManager.addSingleton(types_4.IProtocolLogger, protocolLogger_1.ProtocolLogger);
    serviceManager.add(types_4.IProtocolParser, protocolParser_1.ProtocolParser);
    serviceManager.addSingleton(types_1.IFileSystem, fileSystem_1.FileSystem);
    serviceManager.addSingleton(types_1.IPlatformService, platformService_1.PlatformService);
    serviceManager.addSingleton(types_2.ISocketServer, socketServer_1.SocketServer);
    serviceManager.addSingleton(types_4.IProtocolMessageWriter, protocolWriter_1.ProtocolMessageWriter);
}
//# sourceMappingURL=serviceRegistry.js.map