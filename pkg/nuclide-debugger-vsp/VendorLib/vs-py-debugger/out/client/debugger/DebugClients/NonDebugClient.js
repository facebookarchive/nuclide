"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NonDebugServer_1 = require("../DebugServers/NonDebugServer");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const path = require("path");
const child_process = require("child_process");
const DebugClient_1 = require("./DebugClient");
const open_1 = require("../../common/open");
class NonDebugClient extends DebugClient_1.DebugClient {
    constructor(args, debugSession) {
        super(args, debugSession);
        this.args = args;
    }
    CreateDebugServer(pythonProcess) {
        return new NonDebugServer_1.NonDebugServer(this.debugSession, pythonProcess);
    }
    get DebugType() {
        return DebugClient_1.DebugType.RunLocal;
    }
    Stop() {
        if (this.debugServer) {
            this.debugServer.Stop();
            this.debugServer = null;
        }
        if (this.pyProc) {
            try {
                this.pyProc.kill();
            }
            catch (ex) { }
            this.pyProc = null;
        }
    }
    LaunchApplicationToDebug(dbgServer, processErrored) {
        return new Promise((resolve, reject) => {
            let fileDir = path.dirname(this.args.program);
            let processCwd = fileDir;
            if (typeof this.args.cwd === "string" && this.args.cwd.length > 0 && this.args.cwd !== 'null') {
                processCwd = this.args.cwd;
            }
            let pythonPath = "python";
            if (typeof this.args.pythonPath === "string" && this.args.pythonPath.trim().length > 0) {
                pythonPath = this.args.pythonPath;
            }
            let environmentVariables = this.args.env ? this.args.env : {};
            let newEnvVars = {};
            if (environmentVariables) {
                for (let setting in environmentVariables) {
                    if (!newEnvVars[setting]) {
                        newEnvVars[setting] = environmentVariables[setting];
                    }
                }
                for (let setting in process.env) {
                    if (!environmentVariables[setting]) {
                        environmentVariables[setting] = process.env[setting];
                    }
                }
            }
            if (!environmentVariables.hasOwnProperty("PYTHONIOENCODING")) {
                environmentVariables["PYTHONIOENCODING"] = "UTF-8";
                newEnvVars["PYTHONIOENCODING"] = "UTF-8";
            }
            let launcherArgs = this.buildLauncherArguments();
            let args = launcherArgs;
            if (this.args.console === 'externalTerminal') {
                open_1.open({ wait: false, app: [pythonPath].concat(args), cwd: processCwd, env: environmentVariables }).then(proc => {
                    this.pyProc = proc;
                    this.pyProc.on('exit', () => {
                        this.pyProc = null;
                        this.emit('exit');
                    });
                    resolve();
                }, error => {
                    if (reject) {
                        reject(error);
                        reject = null;
                    }
                });
                return;
            }
            if (this.args.console === 'integratedTerminal') {
                const isSudo = Array.isArray(this.args.debugOptions) && this.args.debugOptions.some(opt => opt === 'Sudo');
                const command = isSudo ? 'sudo' : pythonPath;
                const commandArgs = isSudo ? [pythonPath].concat(args) : args;
                const termArgs = {
                    kind: 'integrated',
                    title: "Python Debug Console",
                    cwd: processCwd,
                    args: [command].concat(commandArgs),
                    env: newEnvVars
                };
                this.debugSession.runInTerminalRequest(termArgs, 5000, (response) => {
                    if (response.success) {
                        resolve();
                    }
                    else {
                        reject(response);
                    }
                });
                return;
            }
            this.pyProc = child_process.spawn(pythonPath, args, { cwd: processCwd, env: environmentVariables });
            this.pyProc.on("error", error => {
                this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(error + '', "stderr"));
            });
            this.pyProc.stderr.setEncoding("utf8");
            this.pyProc.stdout.setEncoding("utf8");
            this.pyProc.stderr.on("data", (error) => {
                this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(error, "stderr"));
            });
            this.pyProc.stdout.on("data", (d) => {
                this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(d, "stdout"));
            });
            this.pyProc.on('exit', () => {
                this.pyProc = null;
                this.emit('exit');
            });
            resolve();
        });
    }
    buildLauncherArguments() {
        let programArgs = Array.isArray(this.args.args) && this.args.args.length > 0 ? this.args.args : [];
        return [this.args.program].concat(programArgs);
    }
}
exports.NonDebugClient = NonDebugClient;
//# sourceMappingURL=NonDebugClient.js.map