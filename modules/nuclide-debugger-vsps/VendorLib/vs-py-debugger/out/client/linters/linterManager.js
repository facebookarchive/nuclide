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
const types_1 = require("../common/types");
const types_2 = require("../ioc/types");
const flake8_1 = require("./flake8");
const linterInfo_1 = require("./linterInfo");
const mypy_1 = require("./mypy");
const pep8_1 = require("./pep8");
const prospector_1 = require("./prospector");
const pydocstyle_1 = require("./pydocstyle");
const pylama_1 = require("./pylama");
const pylint_1 = require("./pylint");
class DisabledLinter {
    constructor(configService) {
        this.configService = configService;
    }
    get info() {
        return new linterInfo_1.LinterInfo(types_1.Product.pylint, 'pylint', this.configService);
    }
    lint(document, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
}
let LinterManager = class LinterManager {
    constructor(serviceContainer) {
        this.lintingEnabledSettingName = 'enabled';
        this.configService = serviceContainer.get(types_1.IConfigurationService);
        this.linters = [
            new linterInfo_1.LinterInfo(types_1.Product.flake8, 'flake8', this.configService),
            new linterInfo_1.LinterInfo(types_1.Product.pylint, 'pylint', this.configService, ['.pylintrc', 'pylintrc']),
            new linterInfo_1.LinterInfo(types_1.Product.mypy, 'mypy', this.configService),
            new linterInfo_1.LinterInfo(types_1.Product.pep8, 'pep8', this.configService),
            new linterInfo_1.LinterInfo(types_1.Product.prospector, 'prospector', this.configService),
            new linterInfo_1.LinterInfo(types_1.Product.pydocstyle, 'pydocstyle', this.configService),
            new linterInfo_1.LinterInfo(types_1.Product.pylama, 'pylama', this.configService)
        ];
    }
    getAllLinterInfos() {
        return this.linters;
    }
    getLinterInfo(product) {
        const x = this.linters.findIndex((value, index, obj) => value.product === product);
        if (x >= 0) {
            return this.linters[x];
        }
        throw new Error('Invalid linter');
    }
    isLintingEnabled(resource) {
        const settings = this.configService.getSettings(resource);
        return settings.linting[this.lintingEnabledSettingName] && this.getActiveLinters(resource).length > 0;
    }
    enableLintingAsync(enable, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.configService.updateSettingAsync(`linting.${this.lintingEnabledSettingName}`, enable, resource);
            // If nothing is enabled, fix it up to PyLint (default).
            if (enable && this.getActiveLinters(resource).length === 0) {
                yield this.setActiveLintersAsync([types_1.Product.pylint], resource);
            }
        });
    }
    getActiveLinters(resource) {
        return this.linters.filter(x => x.isEnabled(resource));
    }
    setActiveLintersAsync(products, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const active = this.getActiveLinters(resource);
            for (const x of active) {
                yield x.enableAsync(false, resource);
            }
            if (products.length > 0) {
                const toActivate = this.linters.filter(x => products.findIndex(p => x.product === p) >= 0);
                for (const x of toActivate) {
                    yield x.enableAsync(true, resource);
                }
                yield this.enableLintingAsync(true, resource);
            }
        });
    }
    createLinter(product, outputChannel, serviceContainer, resource) {
        if (!this.isLintingEnabled(resource)) {
            return new DisabledLinter(this.configService);
        }
        const error = 'Linter manager: Unknown linter';
        switch (product) {
            case types_1.Product.flake8:
                return new flake8_1.Flake8(outputChannel, serviceContainer);
            case types_1.Product.pylint:
                return new pylint_1.Pylint(outputChannel, serviceContainer);
            case types_1.Product.mypy:
                return new mypy_1.MyPy(outputChannel, serviceContainer);
            case types_1.Product.prospector:
                return new prospector_1.Prospector(outputChannel, serviceContainer);
            case types_1.Product.pylama:
                return new pylama_1.PyLama(outputChannel, serviceContainer);
            case types_1.Product.pydocstyle:
                return new pydocstyle_1.PyDocStyle(outputChannel, serviceContainer);
            case types_1.Product.pep8:
                return new pep8_1.Pep8(outputChannel, serviceContainer);
            default:
                serviceContainer.get(types_1.ILogger).logError(error);
                break;
        }
        throw new Error(error);
    }
};
LinterManager = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer))
], LinterManager);
exports.LinterManager = LinterManager;
//# sourceMappingURL=linterManager.js.map