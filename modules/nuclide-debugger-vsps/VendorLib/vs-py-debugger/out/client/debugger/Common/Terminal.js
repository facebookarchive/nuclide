"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const FS = require("fs");
const CP = require("child_process");
class Terminal {
    static launchInTerminal(dir, args, envVars) {
        return this.terminalService().launchInTerminal(dir, args, envVars);
    }
    static killTree(processId) {
        this.terminalService().killTree(processId);
    }
    /*
     * Is the given runtime executable on the PATH.
     */
    static isOnPath(program) {
        return this.terminalService().isOnPath(program);
    }
    static terminalService() {
        if (!this._terminalService) {
            if (process.platform === 'win32') {
                this._terminalService = new WindowsTerminalService();
            }
            else if (process.platform === 'darwin') {
                this._terminalService = new MacTerminalService();
            }
            else if (process.platform === 'linux') {
                this._terminalService = new LinuxTerminalService();
            }
            else {
                this._terminalService = new DefaultTerminalService();
            }
        }
        return this._terminalService;
    }
}
exports.Terminal = Terminal;
class TerminalError {
    constructor(message, linkId) {
        this.message = message;
        this.linkId = linkId;
    }
}
exports.TerminalError = TerminalError;
class DefaultTerminalService {
    launchInTerminal(dir, args, envVars) {
        return new Promise((resolve, reject) => {
            reject(new TerminalError(`External console not implemented on '${process.platform}'.`));
        });
    }
    killTree(pid) {
        // on linux and OS X we kill all direct and indirect child processes as well
        try {
            const cmd = Path.join(__dirname, './terminateProcess.sh');
            CP.spawnSync(cmd, [pid.toString()]);
        }
        catch (err) {
        }
    }
    isOnPath(program) {
        try {
            if (FS.existsSync(DefaultTerminalService.WHICH)) {
                CP.execSync(`${DefaultTerminalService.WHICH} '${program}'`);
            }
            else {
                // do not report error if 'which' doesn't exist
            }
            return true;
        }
        catch (Exception) {
        }
        return false;
    }
}
DefaultTerminalService.TERMINAL_TITLE = "Python Console";
DefaultTerminalService.WHICH = '/usr/bin/which';
class WindowsTerminalService extends DefaultTerminalService {
    launchInTerminal(dir, args, envVars) {
        return new Promise((resolve, reject) => {
            const title = `"${dir} - ${WindowsTerminalService.TERMINAL_TITLE}"`;
            const command = `""${args.join('" "')}" & pause"`; // use '|' to only pause on non-zero exit code
            const cmdArgs = [
                '/c', 'start', title, '/wait',
                'cmd.exe', '/c', command
            ];
            // merge environment variables into a copy of the process.env
            const env = extendObject(extendObject({}, process.env), envVars);
            const options = {
                cwd: dir,
                env: env,
                windowsVerbatimArguments: true
            };
            const cmd = CP.spawn(WindowsTerminalService.CMD, cmdArgs, options);
            cmd.on('error', reject);
            resolve(cmd);
        });
    }
    killTree(pid) {
        // when killing a process in Windows its child processes are *not* killed but become root processes.
        // Therefore we use TASKKILL.EXE
        try {
            CP.execSync(`${WindowsTerminalService.TASK_KILL} /F /T /PID ${pid}`);
        }
        catch (err) {
        }
    }
    isOnPath(program) {
        try {
            if (FS.existsSync(WindowsTerminalService.WHERE)) {
                CP.execSync(`${WindowsTerminalService.WHERE} ${program}`);
            }
            else {
                // do not report error if 'where' doesn't exist
            }
            return true;
        }
        catch (Exception) {
            // ignore
        }
        return false;
    }
}
WindowsTerminalService.CMD = 'cmd.exe';
WindowsTerminalService.WHERE = 'C:\\Windows\\System32\\where.exe';
WindowsTerminalService.TASK_KILL = 'C:\\Windows\\System32\\taskkill.exe';
class LinuxTerminalService extends DefaultTerminalService {
    launchInTerminal(dir, args, envVars) {
        return new Promise((resolve, reject) => {
            if (!FS.existsSync(LinuxTerminalService.LINUX_TERM)) {
                reject(new TerminalError(`'${LinuxTerminalService.LINUX_TERM}' not found`, 20002));
                return;
            }
            const bashCommand = `${quote(args)}; echo; read -p "${LinuxTerminalService.WAIT_MESSAGE}" -n1;`;
            const termArgs = [
                '--title', `"${LinuxTerminalService.TERMINAL_TITLE}"`,
                '-x', 'bash', '-c',
                `''${bashCommand}''` // wrapping argument in two sets of ' because node is so "friendly" that it removes one set...
            ];
            // merge environment variables into a copy of the process.env
            const env = extendObject(extendObject({}, process.env), envVars);
            const options = {
                cwd: dir,
                env: env
            };
            const cmd = CP.spawn(LinuxTerminalService.LINUX_TERM, termArgs, options);
            cmd.on('error', reject);
            cmd.on('exit', (code) => {
                if (code === 0) {
                    resolve(); // since cmd is not the terminal process but just a launcher, we do not pass it in the resolve to the caller
                }
                else {
                    reject(new TerminalError(`${LinuxTerminalService.LINUX_TERM} failed with exit code ${code}`));
                }
            });
        });
    }
}
LinuxTerminalService.LINUX_TERM = '/usr/bin/gnome-terminal'; //private const string LINUX_TERM = "/usr/bin/x-terminal-emulator";
LinuxTerminalService.WAIT_MESSAGE = "Press any key to continue...";
class MacTerminalService extends DefaultTerminalService {
    launchInTerminal(dir, args, envVars) {
        return new Promise((resolve, reject) => {
            // first fix the PATH so that 'runtimePath' can be found if installed with 'brew'
            // Utilities.FixPathOnOSX();
            // On OS X we do not launch the program directly but we launch an AppleScript that creates (or reuses) a Terminal window
            // and then launches the program inside that window.
            const osaArgs = [
                Path.join(__dirname, './TerminalHelper.scpt'),
                '-t', MacTerminalService.TERMINAL_TITLE,
                '-w', dir,
            ];
            for (let a of args) {
                osaArgs.push('-pa');
                osaArgs.push(a);
            }
            if (envVars) {
                for (let key in envVars) {
                    osaArgs.push('-e');
                    osaArgs.push(key + '=' + envVars[key]);
                }
            }
            let stderr = '';
            const osa = CP.spawn(MacTerminalService.OSASCRIPT, osaArgs);
            osa.on('error', reject);
            osa.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            osa.on('exit', (code) => {
                if (code === 0) {
                    resolve(); // since cmd is not the terminal process but just the osa tool, we do not pass it in the resolve to the caller
                }
                else {
                    if (stderr) {
                        reject(new TerminalError(stderr));
                    }
                    else {
                        reject(new TerminalError(`{MacTerminalService.OSASCRIPT} failed with exit code ${code}`));
                    }
                }
            });
        });
    }
}
MacTerminalService.OSASCRIPT = '/usr/bin/osascript'; // osascript is the AppleScript interpreter on OS X
// ---- private utilities ----
/**
 * Quote args if necessary and combine into a space separated string.
 */
function quote(args) {
    let r = '';
    for (let a of args) {
        if (a.indexOf(' ') >= 0) {
            r += '"' + a + '"';
        }
        else {
            r += a;
        }
        r += ' ';
    }
    return r;
}
function extendObject(objectCopy, object) {
    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            objectCopy[key] = object[key];
        }
    }
    return objectCopy;
}
//# sourceMappingURL=Terminal.js.map