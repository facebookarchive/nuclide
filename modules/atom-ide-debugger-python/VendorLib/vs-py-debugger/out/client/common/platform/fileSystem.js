// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const inversify_1 = require("inversify");
const path = require("path");
const types_1 = require("./types");
let FileSystem = class FileSystem {
    constructor(platformService) {
        this.platformService = platformService;
    }
    get directorySeparatorChar() {
        return path.sep;
    }
    objectExistsAsync(filePath, statCheck) {
        return new Promise(resolve => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    return resolve(false);
                }
                return resolve(statCheck(stats));
            });
        });
    }
    fileExistsAsync(filePath) {
        return this.objectExistsAsync(filePath, (stats) => stats.isFile());
    }
    /**
     * Reads the contents of the file using utf8 and returns the string contents.
     * @param {string} filePath
     * @returns {Promise<string>}
     * @memberof FileSystem
     */
    readFile(filePath) {
        return fs.readFile(filePath).then(buffer => buffer.toString());
    }
    directoryExistsAsync(filePath) {
        return this.objectExistsAsync(filePath, (stats) => stats.isDirectory());
    }
    createDirectoryAsync(directoryPath) {
        return fs.mkdirp(directoryPath);
    }
    getSubDirectoriesAsync(rootDir) {
        return new Promise(resolve => {
            fs.readdir(rootDir, (error, files) => {
                if (error) {
                    return resolve([]);
                }
                const subDirs = [];
                files.forEach(name => {
                    const fullPath = path.join(rootDir, name);
                    try {
                        if (fs.statSync(fullPath).isDirectory()) {
                            subDirs.push(fullPath);
                        }
                        // tslint:disable-next-line:no-empty
                    }
                    catch (ex) { }
                });
                resolve(subDirs);
            });
        });
    }
    arePathsSame(path1, path2) {
        path1 = path.normalize(path1);
        path2 = path.normalize(path2);
        if (this.platformService.isWindows) {
            return path1.toUpperCase() === path2.toUpperCase();
        }
        else {
            return path1 === path2;
        }
    }
    appendFileSync(filename, data, optionsOrEncoding) {
        return fs.appendFileSync(filename, data, optionsOrEncoding);
    }
    getRealPathAsync(filePath) {
        return new Promise(resolve => {
            fs.realpath(filePath, (err, realPath) => {
                resolve(err ? filePath : realPath);
            });
        });
    }
};
FileSystem = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IPlatformService))
], FileSystem);
exports.FileSystem = FileSystem;
//# sourceMappingURL=fileSystem.js.map