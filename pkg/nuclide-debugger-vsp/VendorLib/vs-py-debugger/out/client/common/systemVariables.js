"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types = require("./types");
const vscode = require("vscode");
const Path = require("path");
class Parser {
    log(message) {
    }
    is(value, func, wrongTypeState, wrongTypeMessage, undefinedState, undefinedMessage) {
        if (Types.isUndefined(value)) {
            return false;
        }
        if (!func(value)) {
            return false;
        }
        return true;
    }
    static merge(destination, source, overwrite) {
        Object.keys(source).forEach((key) => {
            let destValue = destination[key];
            let sourceValue = source[key];
            if (Types.isUndefined(sourceValue)) {
                return;
            }
            if (Types.isUndefined(destValue)) {
                destination[key] = sourceValue;
            }
            else {
                if (overwrite) {
                    if (Types.isObject(destValue) && Types.isObject(sourceValue)) {
                        this.merge(destValue, sourceValue, overwrite);
                    }
                    else {
                        destination[key] = sourceValue;
                    }
                }
            }
        });
    }
}
exports.Parser = Parser;
class AbstractSystemVariables {
    resolve(value) {
        if (Types.isString(value)) {
            return this.__resolveString(value);
        }
        else if (Types.isArray(value)) {
            return this.__resolveArray(value);
        }
        else if (Types.isObject(value)) {
            return this.__resolveLiteral(value);
        }
        return value;
    }
    resolveAny(value) {
        if (Types.isString(value)) {
            return this.__resolveString(value);
        }
        else if (Types.isArray(value)) {
            return this.__resolveAnyArray(value);
        }
        else if (Types.isObject(value)) {
            return this.__resolveAnyLiteral(value);
        }
        return value;
    }
    __resolveString(value) {
        let regexp = /\$\{(.*?)\}/g;
        return value.replace(regexp, (match, name) => {
            let newValue = this[name];
            if (Types.isString(newValue)) {
                return newValue;
            }
            else {
                return match && match.indexOf('env.') > 0 ? '' : match;
            }
        });
    }
    __resolveLiteral(values) {
        let result = Object.create(null);
        Object.keys(values).forEach(key => {
            let value = values[key];
            result[key] = this.resolve(value);
        });
        return result;
    }
    __resolveAnyLiteral(values) {
        let result = Object.create(null);
        Object.keys(values).forEach(key => {
            let value = values[key];
            result[key] = this.resolveAny(value);
        });
        return result;
    }
    __resolveArray(value) {
        return value.map(s => this.__resolveString(s));
    }
    __resolveAnyArray(value) {
        return value.map(s => this.resolveAny(s));
    }
}
exports.AbstractSystemVariables = AbstractSystemVariables;
class SystemVariables extends AbstractSystemVariables {
    constructor() {
        super();
        this._workspaceRoot = typeof vscode.workspace.rootPath === 'string' ? vscode.workspace.rootPath : __dirname;
        ;
        this._workspaceRootFolderName = Path.basename(this._workspaceRoot);
        Object.keys(process.env).forEach(key => {
            this[`env.${key}`] = process.env[key];
        });
    }
    get cwd() {
        return this.workspaceRoot;
    }
    get workspaceRoot() {
        return this._workspaceRoot;
    }
    get workspaceRootFolderName() {
        return this._workspaceRootFolderName;
    }
}
exports.SystemVariables = SystemVariables;
//# sourceMappingURL=systemVariables.js.map