"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const installer_1 = require("../common/installer");
const prospector = require("./../linters/prospector");
const pylint = require("./../linters/pylint");
const pep8 = require("./../linters/pep8Linter");
const pylama = require("./../linters/pylama");
const flake8 = require("./../linters/flake8");
const pydocstyle = require("./../linters/pydocstyle");
const mypy = require("./../linters/mypy");
class LinterFactor {
    static createLinter(product, outputChannel, workspaceRootPath = vscode_1.workspace.rootPath) {
        switch (product) {
            case installer_1.Product.flake8: {
                return new flake8.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.mypy: {
                return new mypy.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.pep8: {
                return new pep8.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.prospector: {
                return new prospector.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.pydocstyle: {
                return new pydocstyle.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.pylama: {
                return new pylama.Linter(outputChannel, workspaceRootPath);
            }
            case installer_1.Product.pylint: {
                return new pylint.Linter(outputChannel, workspaceRootPath);
            }
            default: {
                throw new Error(`Invalid Linter '${installer_1.Product[product]}''`);
            }
        }
    }
}
exports.LinterFactor = LinterFactor;
//# sourceMappingURL=main.js.map