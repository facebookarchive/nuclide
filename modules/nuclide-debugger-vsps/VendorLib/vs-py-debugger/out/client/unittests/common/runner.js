"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../common/utils");
const vscode_1 = require("vscode");
const utils_2 = require("../../common/utils");
let terminal = null;
function run(file, args, cwd, token, outChannel) {
    return utils_1.execPythonFile(file, args, cwd, true, (data) => outChannel.append(data), token);
    // Bug, we cannot resolve this
    // Resolving here means that tests have completed
    // We need a way to determine that the tests have completed succefully.. hmm
    // We could use a hack, such as generating a textfile at the end of the command and monitoring.. hack hack hack
    // Or we could generate a shell script file and embed all of the hacks in here... hack hack hack...
    // return runTestInTerminal(file, args, cwd);
}
exports.run = run;
function runTestInTerminal(file, args, cwd) {
    return utils_2.getPythonInterpreterDirectory().then(pyPath => {
        let commands = [];
        if (utils_2.IS_WINDOWS) {
            commands.push(`set ${utils_2.PATH_VARIABLE_NAME}=%${utils_2.PATH_VARIABLE_NAME}%;${pyPath}`);
        }
        else {
            commands.push(`export ${utils_2.PATH_VARIABLE_NAME}=$${utils_2.PATH_VARIABLE_NAME}:${pyPath}`);
        }
        if (cwd !== vscode_1.workspace.rootPath && typeof cwd === 'string') {
            commands.push(`cd ${cwd}`);
        }
        commands.push(`${file} ${args.join(' ')}`);
        terminal = vscode_1.window.createTerminal(`Python Test Log`);
        return new Promise((resolve) => {
            setTimeout(function () {
                terminal.show();
                terminal.sendText(commands.join(' && '));
                // Bug, we cannot resolve this
                // Resolving here means that tests have completed
                // We need a way to determine that the tests have completed succefully.. hmm
                resolve();
            }, 1000);
        });
    });
}
//# sourceMappingURL=runner.js.map