"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Commands {
}
Commands.ExitCommandBytes = new Buffer("exit");
Commands.PingBytes = new Buffer("ping");
Commands.ListKernelSpecsBytes = new Buffer("lsks");
Commands.StartKernelBytes = new Buffer("strk");
Commands.ShutdownKernelBytes = new Buffer("stpk");
Commands.RestartKernelBytes = new Buffer("rstk");
Commands.InterruptKernelBytes = new Buffer("itpk");
Commands.RunCodeBytes = new Buffer("run ");
exports.Commands = Commands;
var ResponseCommands;
(function (ResponseCommands) {
    ResponseCommands.Pong = 'PONG';
    ResponseCommands.ListKernelsSpecs = 'LSKS';
    ResponseCommands.Error = 'EROR';
    ResponseCommands.KernelStarted = 'STRK';
    ResponseCommands.KernelShutdown = 'STPK';
    ResponseCommands.KernelRestarted = 'RSTK';
    ResponseCommands.KernelInterrupted = 'ITPK';
    ResponseCommands.RunCode = 'RUN ';
    ResponseCommands.ShellResult = 'SHEL';
    ResponseCommands.IOPUBMessage = 'IOPB';
})(ResponseCommands = exports.ResponseCommands || (exports.ResponseCommands = {}));
//# sourceMappingURL=commands.js.map