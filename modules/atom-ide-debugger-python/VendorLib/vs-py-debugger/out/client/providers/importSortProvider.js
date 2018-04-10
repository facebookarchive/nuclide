"use strict";
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
const fs = require("fs-extra");
const path = require("path");
const configSettings_1 = require("../common/configSettings");
const editor_1 = require("../common/editor");
const telemetry_1 = require("../telemetry");
const constants_1 = require("../telemetry/constants");
// tslint:disable-next-line:completed-docs
class PythonImportSortProvider {
    constructor(pythonExecutionFactory, processService) {
        this.pythonExecutionFactory = pythonExecutionFactory;
        this.processService = processService;
    }
    sortImports(extensionDir, document) {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.lineCount === 1) {
                return [];
            }
            // isort does have the ability to read from the process input stream and return the formatted code out of the output stream.
            // However they don't support returning the diff of the formatted text when reading data from the input stream.
            // Yes getting text formatted that way avoids having to create a temporary file, however the diffing will have
            // to be done here in node (extension), i.e. extension cpu, i.e. less responsive solution.
            const importScript = path.join(extensionDir, 'pythonFiles', 'sortImports.py');
            const tmpFileCreated = document.isDirty;
            const filePath = tmpFileCreated ? yield editor_1.getTempFileWithDocumentContents(document) : document.fileName;
            const settings = configSettings_1.PythonSettings.getInstance(document.uri);
            const isort = settings.sortImports.path;
            const args = [filePath, '--diff'].concat(settings.sortImports.args);
            let promise;
            if (typeof isort === 'string' && isort.length > 0) {
                // Lets just treat this as a standard tool.
                promise = this.processService.exec(isort, args, { throwOnStdErr: true });
            }
            else {
                promise = this.pythonExecutionFactory.create(document.uri)
                    .then(executionService => executionService.exec([importScript].concat(args), { throwOnStdErr: true }));
            }
            try {
                const result = yield promise;
                return editor_1.getTextEditsFromPatch(document.getText(), result.stdout);
            }
            finally {
                if (tmpFileCreated) {
                    fs.unlinkSync(filePath);
                }
            }
        });
    }
}
__decorate([
    telemetry_1.captureTelemetry(constants_1.FORMAT_SORT_IMPORTS)
], PythonImportSortProvider.prototype, "sortImports", null);
exports.PythonImportSortProvider = PythonImportSortProvider;
//# sourceMappingURL=importSortProvider.js.map