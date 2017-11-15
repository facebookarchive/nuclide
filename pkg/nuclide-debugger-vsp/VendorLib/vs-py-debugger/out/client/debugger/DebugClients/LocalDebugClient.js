"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocalDebugServer_1 = require("../DebugServers/LocalDebugServer");
const vscode_debugadapter_1 = require("vscode-debugadapter");
const path = require("path");
const child_process = require("child_process");
const Contracts_1 = require("../Common/Contracts");
const DebugClient_1 = require("./DebugClient");
const open_1 = require("../../common/open");
const Utils_1 = require("../Common/Utils");
class LocalDebugClient extends DebugClient_1.DebugClient {
    constructor(args, debugSession) {
        super(args, debugSession);
        this.args = args;
    }
    CreateDebugServer(pythonProcess) {
        this.pythonProcess = pythonProcess;
        this.debugServer = new LocalDebugServer_1.LocalDebugServer(this.debugSession, this.pythonProcess);
        return this.debugServer;
    }
    get DebugType() {
        return DebugClient_1.DebugType.Local;
    }
    Stop() {
        if (this.debugServer) {
            this.debugServer.Stop();
            this.debugServer = null;
        }
        if (this.pyProc) {
            try {
                this.pyProc.send('EXIT');
            }
            catch (ex) {
            }
            try {
              this.pyProc.stdin.once('error', () => {});
              this.pyProc.stdin.write('EXIT');
            } catch (ex) {
            }
            this.pyProc = null;
        }
    }
    getPTVSToolsFilePath() {
        let currentFileName = module.filename;
        let ptVSToolsPath = path.join(path.dirname(currentFileName), '..', '..', '..', '..', 'pythonFiles', 'PythonTools');
        return path.join(ptVSToolsPath, 'visualstudio_py_launcher.py');
    }
    displayError(error) {
        let errorMsg = typeof error === 'string' ? error : ((error.message && error.message.length > 0) ? error.message : '');
        if (errorMsg.length > 0) {
            this.debugSession.sendEvent(new vscode_debugadapter_1.OutputEvent(errorMsg, 'stderr'));
        }
    }
    LaunchApplicationToDebug(dbgServer, processErrored) {
        return new Promise((resolve, reject) => {
            let fileDir = this.args && this.args.program ? path.dirname(this.args.program) : '';
            let processCwd = fileDir;
            if (typeof this.args.cwd === 'string' && this.args.cwd.length > 0 && this.args.cwd !== 'null') {
                processCwd = this.args.cwd;
            }
            let pythonPath = 'python';
            if (typeof this.args.pythonPath === 'string' && this.args.pythonPath.trim().length > 0) {
                pythonPath = this.args.pythonPath;
            }
            let environmentVariables = Utils_1.getCustomEnvVars(this.args.env, this.args.envFile);
            environmentVariables = environmentVariables ? environmentVariables : {};
            let newEnvVars = {};
            if (environmentVariables) {
                for (let setting in environmentVariables) {
                    if (!newEnvVars[setting]) {
                        newEnvVars[setting] = environmentVariables[setting];
                        process.env[setting] = environmentVariables[setting];
                    }
                }
                for (let setting in process.env) {
                    if (!environmentVariables[setting]) {
                        environmentVariables[setting] = process.env[setting];
                    }
                }
            }
            if (!environmentVariables.hasOwnProperty('PYTHONIOENCODING')) {
                environmentVariables['PYTHONIOENCODING'] = 'UTF-8';
                newEnvVars['PYTHONIOENCODING'] = 'UTF-8';
                process.env['PYTHONIOENCODING'] = 'UTF-8';
            }
            if (!environmentVariables.hasOwnProperty('PYTHONUNBUFFERED')) {
                environmentVariables['PYTHONUNBUFFERED'] = '1';
                newEnvVars['PYTHONUNBUFFERED'] = '1';
                process.env['PYTHONUNBUFFERED'] = '1';
            }
            let ptVSToolsFilePath = this.getPTVSToolsFilePath();
            let launcherArgs = this.buildLauncherArguments();
            let args = [ptVSToolsFilePath, processCwd, dbgServer.port.toString(), '34806ad9-833a-4524-8cd6-18ca4aa74f14'].concat(launcherArgs);
            switch (this.args.console) {
                case 'externalTerminal': {
                    const isSudo = Array.isArray(this.args.debugOptions) && this.args.debugOptions.some(opt => opt === 'Sudo');
                    open_1.open({ wait: false, app: [pythonPath].concat(args), cwd: processCwd, env: environmentVariables, sudo: isSudo }).then(proc => {
                        this.pyProc = proc;
                        resolve();
                    }, error => {
                        // TODO: This condition makes no sense (refactor)
                        if (!this.debugServer && this.debugServer.IsRunning) {
                            return;
                        }
                        reject(error);
                    });
                    break;
                }
                case 'integratedTerminal': {
                    const isSudo = Array.isArray(this.args.debugOptions) && this.args.debugOptions.some(opt => opt === 'Sudo');
                    const command = isSudo ? 'sudo' : pythonPath;
                    const commandArgs = isSudo ? [pythonPath].concat(args) : args;
                    const termArgs = {
                        kind: 'integrated',
                        title: 'Python Debug Console',
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
                    break;
                }
                default: {
                    this.pyProc = child_process.spawn(pythonPath, args, { cwd: processCwd, env: environmentVariables });
                    this.pyProc.on('error', error => {
                        // TODO: This condition makes no sense (refactor)
                        if (!this.debugServer && this.debugServer.IsRunning) {
                            return;
                        }
                        if (!this.debugServer.IsRunning && typeof (error) === 'object' && error !== null) {
                            // return processErrored(error);
                            return reject(error);
                        }
                        this.displayError(error);
                    });
                    this.pyProc.stderr.setEncoding('utf8');
                    this.pyProc.stderr.on('data', error => {
                        // We generally don't need to display the errors as stderr output is being captured by debugger
                        // and it gets sent out to the debug client
                        // Either way, we need some code in here so we read the stdout of the python process
                        // Else it just keep building up (related to issue #203 and #52)
                        if (this.debugServer && !this.debugServer.IsRunning) {
                            return reject(error);
                        }
                    });
                    this.pyProc.stdout.on('data', d => {
                        // This is necessary so we read the stdout of the python process
                        // Else it just keep building up (related to issue #203 and #52)
                        let x = 0;
                    });
                    // Here we wait for the application to connect to the socket server
                    // Only once connected do we know that the application has successfully launched
                    // resolve();
                    this.debugServer.DebugClientConnected.then(resolve);
                }
            }
        });
    }
    buildLauncherArguments() {
        let vsDebugOptions = 'WaitOnAbnormalExit,WaitOnNormalExit,RedirectOutput';
        if (Array.isArray(this.args.debugOptions)) {
            vsDebugOptions = this.args.debugOptions.filter(opt => Contracts_1.VALID_DEBUG_OPTIONS.indexOf(opt) >= 0).join(',');
        }
        // If internal or external console, then don't re-direct the output
        if (this.args.externalConsole === true || this.args.console === 'integratedTerminal' || this.args.console === 'externalTerminal') {
            vsDebugOptions = vsDebugOptions.split(',').filter(opt => opt !== 'RedirectOutput').join(',');
        }
        let programArgs = Array.isArray(this.args.args) && this.args.args.length > 0 ? this.args.args : [];
        if (typeof this.args.module === 'string' && this.args.module.length > 0) {
            return [vsDebugOptions, '-m', this.args.module].concat(programArgs);
        }
        return [vsDebugOptions, this.args.program].concat(programArgs);
        // Use this ability to debug unit tests or modules
        // Adding breakpoints programatically to the first executable line of the test program
        // return [vsDebugOptions, '-c', "import pytest;pytest.main(['/Users/donjayamanne/Desktop/Development/Python/Temp/MyEnvs/tests/test_another.py::Test_CheckMyApp::test_complex_check'])"].concat(programArgs);
    }
}
exports.LocalDebugClient = LocalDebugClient;
//# sourceMappingURL=LocalDebugClient.js.map
