"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Commands {
}
Commands.ExitCommandBytes = new Buffer("exit");
Commands.StepIntoCommandBytes = new Buffer("stpi");
Commands.StepOutCommandBytes = new Buffer("stpo");
Commands.StepOverCommandBytes = new Buffer("stpv");
Commands.BreakAllCommandBytes = new Buffer("brka");
Commands.SetBreakPointCommandBytes = new Buffer("brkp");
Commands.SetBreakPointConditionCommandBytes = new Buffer("brkc");
Commands.SetBreakPointPassCountCommandBytes = new Buffer("bkpc");
Commands.GetBreakPointHitCountCommandBytes = new Buffer("bkgh");
Commands.SetBreakPointHitCountCommandBytes = new Buffer("bksh");
Commands.RemoveBreakPointCommandBytes = new Buffer("brkr");
Commands.ResumeAllCommandBytes = new Buffer("resa");
Commands.GetThreadFramesCommandBytes = new Buffer("thrf");
Commands.ExecuteTextCommandBytes = new Buffer("exec");
Commands.ResumeThreadCommandBytes = new Buffer("rest");
Commands.AutoResumeThreadCommandBytes = new Buffer("ares");
Commands.ClearSteppingCommandBytes = new Buffer("clst");
Commands.SetLineNumberCommand = new Buffer("setl");
Commands.GetChildrenCommandBytes = new Buffer("chld");
Commands.DetachCommandBytes = new Buffer("detc");
Commands.SetExceptionInfoCommandBytes = new Buffer("sexi");
Commands.SetExceptionHandlerInfoCommandBytes = new Buffer("sehi");
Commands.RemoveDjangoBreakPointCommandBytes = new Buffer("bkdr");
Commands.AddDjangoBreakPointCommandBytes = new Buffer("bkda");
Commands.ConnectReplCommandBytes = new Buffer("crep");
Commands.DisconnectReplCommandBytes = new Buffer("drep");
Commands.LastAckCommandBytes = new Buffer("lack");
exports.Commands = Commands;
//# sourceMappingURL=ProxyCommands.js.map