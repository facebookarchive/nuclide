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
const fileSystem = require("fs");
const path = require("path");
const request = require("request");
const requestProgress = require("request-progress");
const vscode_1 = require("vscode");
const constants_1 = require("../common/constants");
const helpers_1 = require("../common/helpers");
const types_1 = require("../common/platform/types");
const types_2 = require("../common/types");
const platformData_1 = require("./platformData");
// tslint:disable-next-line:no-require-imports no-var-requires
const StreamZip = require('node-stream-zip');
const downloadUriPrefix = 'https://pvsc.blob.core.windows.net/python-language-server';
const downloadBaseFileName = 'Python-Language-Server';
const downloadVersion = '0.1.18204.3';
const downloadFileExtension = '.nupkg';
exports.DownloadLinks = {
    [platformData_1.PlatformName.Windows32Bit]: `${downloadUriPrefix}/${downloadBaseFileName}-${platformData_1.PlatformName.Windows32Bit}.${downloadVersion}${downloadFileExtension}`,
    [platformData_1.PlatformName.Windows64Bit]: `${downloadUriPrefix}/${downloadBaseFileName}-${platformData_1.PlatformName.Windows64Bit}.${downloadVersion}${downloadFileExtension}`,
    [platformData_1.PlatformName.Linux64Bit]: `${downloadUriPrefix}/${downloadBaseFileName}-${platformData_1.PlatformName.Linux64Bit}.${downloadVersion}${downloadFileExtension}`,
    [platformData_1.PlatformName.Mac64Bit]: `${downloadUriPrefix}/${downloadBaseFileName}-${platformData_1.PlatformName.Mac64Bit}.${downloadVersion}${downloadFileExtension}`
};
class LanguageServerDownloader {
    constructor(services, engineFolder) {
        this.services = services;
        this.engineFolder = engineFolder;
        this.output = this.services.get(types_2.IOutputChannel, constants_1.STANDARD_OUTPUT_CHANNEL);
        this.fs = this.services.get(types_1.IFileSystem);
        this.platform = this.services.get(types_1.IPlatformService);
        this.platformData = new platformData_1.PlatformData(this.platform, this.fs);
    }
    getDownloadUri() {
        return __awaiter(this, void 0, void 0, function* () {
            const platformString = yield this.platformData.getPlatformName();
            return exports.DownloadLinks[platformString];
        });
    }
    downloadLanguageServer(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadUri = yield this.getDownloadUri();
            let localTempFilePath = '';
            try {
                localTempFilePath = yield this.downloadFile(downloadUri, 'Downloading Microsoft Python Language Server... ');
                yield this.unpackArchive(context.extensionPath, localTempFilePath);
            }
            catch (err) {
                this.output.appendLine('failed.');
                this.output.appendLine(err);
                throw new Error(err);
            }
            finally {
                if (localTempFilePath.length > 0) {
                    yield this.fs.deleteFile(localTempFilePath);
                }
            }
        });
    }
    downloadFile(uri, title) {
        return __awaiter(this, void 0, void 0, function* () {
            this.output.append(`Downloading ${uri}... `);
            const tempFile = yield this.fs.createTemporaryFile(downloadFileExtension);
            const deferred = helpers_1.createDeferred();
            const fileStream = fileSystem.createWriteStream(tempFile.filePath);
            fileStream.on('finish', () => {
                fileStream.close();
            }).on('error', (err) => {
                tempFile.dispose();
                deferred.reject(err);
            });
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window
            }, (progress) => {
                requestProgress(request(uri))
                    .on('progress', (state) => {
                    // https://www.npmjs.com/package/request-progress
                    const received = Math.round(state.size.transferred / 1024);
                    const total = Math.round(state.size.total / 1024);
                    const percentage = Math.round(100 * state.percent);
                    progress.report({
                        message: `${title}${received} of ${total} KB (${percentage}%)`
                    });
                })
                    .on('error', (err) => {
                    deferred.reject(err);
                })
                    .on('end', () => {
                    this.output.append('complete.');
                    deferred.resolve();
                })
                    .pipe(fileStream);
                return deferred.promise;
            });
            return tempFile.filePath;
        });
    }
    unpackArchive(extensionPath, tempFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.output.append('Unpacking archive... ');
            const installFolder = path.join(extensionPath, this.engineFolder);
            const deferred = helpers_1.createDeferred();
            const title = 'Extracting files... ';
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window,
                title
            }, (progress) => {
                const zip = new StreamZip({
                    file: tempFilePath,
                    storeEntries: true
                });
                let totalFiles = 0;
                let extractedFiles = 0;
                zip.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                    totalFiles = zip.entriesCount;
                    if (!(yield this.fs.directoryExists(installFolder))) {
                        yield this.fs.createDirectory(installFolder);
                    }
                    zip.extract(null, installFolder, (err, count) => {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve();
                        }
                        zip.close();
                    });
                })).on('extract', (entry, file) => {
                    extractedFiles += 1;
                    progress.report({ message: `${title}${Math.round(100 * extractedFiles / totalFiles)}%` });
                }).on('error', e => {
                    deferred.reject(e);
                });
                return deferred.promise;
            });
            // Set file to executable
            if (!this.platform.isWindows) {
                const executablePath = path.join(installFolder, this.platformData.getEngineExecutableName());
                fileSystem.chmodSync(executablePath, '0764'); // -rwxrw-r--
            }
            this.output.appendLine('done.');
        });
    }
}
exports.LanguageServerDownloader = LanguageServerDownloader;
//# sourceMappingURL=downloader.js.map