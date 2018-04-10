"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestCommands {
}
RequestCommands.Exit = new Buffer("exit");
RequestCommands.Ping = new Buffer("ping");
RequestCommands.Arguments = new Buffer("args");
RequestCommands.Completions = new Buffer("comp");
RequestCommands.Definitions = new Buffer("defs");
RequestCommands.Hover = new Buffer("hovr");
RequestCommands.Usages = new Buffer("usag");
RequestCommands.Names = new Buffer("name");
exports.RequestCommands = RequestCommands;
var ResponseCommands;
(function (ResponseCommands) {
    ResponseCommands.Pong = 'pong';
    ResponseCommands.TraceLog = 'tlog';
    ResponseCommands.Error = 'eror';
    ResponseCommands.Signature = "args";
    ResponseCommands.Completions = "comp";
    ResponseCommands.Definitions = "defs";
    ResponseCommands.Hover = "hovr";
    ResponseCommands.References = "usag";
    ResponseCommands.DocumentSymbols = "name";
})(ResponseCommands = exports.ResponseCommands || (exports.ResponseCommands = {}));
//# sourceMappingURL=commands.js.map