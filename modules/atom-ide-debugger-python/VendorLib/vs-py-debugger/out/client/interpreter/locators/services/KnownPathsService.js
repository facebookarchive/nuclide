"use strict";
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
const inversify_1 = require("inversify");
const _ = require("lodash");
const path = require("path");
const utils_1 = require("../../../common/utils");
const types_1 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const helpers_1 = require("../helpers");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
// tslint:disable-next-line:no-require-imports no-var-requires
const untildify = require('untildify');
let KnownPathsService = class KnownPathsService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(knownSearchPaths, versionProvider, serviceContainer) {
        super('KnownPathsService', serviceContainer);
        this.knownSearchPaths = knownSearchPaths;
        this.versionProvider = versionProvider;
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getInterpretersImplementation(resource) {
        return this.suggestionsFromKnownPaths();
    }
    suggestionsFromKnownPaths() {
        const promises = this.knownSearchPaths.map(dir => this.getInterpretersInDirectory(dir));
        return Promise.all(promises)
            .then(listOfInterpreters => _.flatten(listOfInterpreters))
            .then(interpreters => interpreters.filter(item => item.length > 0))
            .then(interpreters => Promise.all(interpreters.map(interpreter => this.getInterpreterDetails(interpreter))));
    }
    getInterpreterDetails(interpreter) {
        return this.versionProvider.getVersion(interpreter, path.basename(interpreter))
            .then(displayName => {
            return {
                displayName,
                path: interpreter,
                type: contracts_1.InterpreterType.Unknown
            };
        });
    }
    getInterpretersInDirectory(dir) {
        return utils_1.fsExistsAsync(dir)
            .then(exists => exists ? helpers_1.lookForInterpretersInDirectory(dir) : Promise.resolve([]));
    }
};
KnownPathsService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(contracts_1.IKnownSearchPathsForInterpreters)),
    __param(1, inversify_1.inject(contracts_1.IInterpreterVersionService)),
    __param(2, inversify_1.inject(types_1.IServiceContainer))
], KnownPathsService);
exports.KnownPathsService = KnownPathsService;
function getKnownSearchPathsForInterpreters() {
    if (utils_1.IS_WINDOWS) {
        return [];
    }
    else {
        const paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/sbin'];
        paths.forEach(p => {
            paths.push(untildify(`~${p}`));
        });
        // Add support for paths such as /Users/xxx/anaconda/bin.
        if (process.env.HOME) {
            paths.push(path.join(process.env.HOME, 'anaconda', 'bin'));
            paths.push(path.join(process.env.HOME, 'python', 'bin'));
        }
        return paths;
    }
}
exports.getKnownSearchPathsForInterpreters = getKnownSearchPathsForInterpreters;
//# sourceMappingURL=KnownPathsService.js.map