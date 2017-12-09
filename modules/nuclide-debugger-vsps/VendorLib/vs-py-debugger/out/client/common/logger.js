"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const settings = require("./configSettings");
let outChannel;
class Logger {
    static initializeChannel() {
        if (settings.PythonSettings.getInstance().devOptions.indexOf("DEBUG") >= 0) {
            Logger.IsDebug = true;
            outChannel = vscode.window.createOutputChannel("PythonExtLog");
        }
    }
    static write(category = "log", title = "", message) {
        Logger.initializeChannel();
        if (title.length > 0) {
            Logger.writeLine(category, "---------------------------");
            Logger.writeLine(category, title);
        }
        Logger.writeLine(category, message);
    }
    static writeLine(category = "log", line) {
        console[category](line);
        if (outChannel) {
            outChannel.appendLine(line);
        }
    }
}
function error(title = "", message) {
    Logger.write.apply(Logger, ["error", title, message]);
}
exports.error = error;
function warn(title = "", message) {
    Logger.write.apply(Logger, ["warn", title, message]);
}
exports.warn = warn;
function log(title = "", message) {
    if (!Logger.IsDebug)
        return;
    Logger.write.apply(Logger, ["log", title, message]);
}
exports.log = log;
//# sourceMappingURL=logger.js.map