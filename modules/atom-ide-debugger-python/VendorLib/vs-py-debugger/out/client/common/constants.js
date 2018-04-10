"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.PythonLanguage = { language: 'python' };
var Commands;
(function (Commands) {
    Commands.Set_Interpreter = 'python.setInterpreter';
    Commands.Set_ShebangInterpreter = 'python.setShebangInterpreter';
    Commands.Exec_In_Terminal = 'python.execInTerminal';
    Commands.Exec_Selection_In_Terminal = 'python.execSelectionInTerminal';
    Commands.Exec_Selection_In_Django_Shell = 'python.execSelectionInDjangoShell';
    Commands.Tests_View_UI = 'python.viewTestUI';
    Commands.Tests_Picker_UI = 'python.selectTestToRun';
    Commands.Tests_Picker_UI_Debug = 'python.selectTestToDebug';
    Commands.Tests_Discover = 'python.discoverTests';
    Commands.Tests_Run_Failed = 'python.runFailedTests';
    Commands.Sort_Imports = 'python.sortImports';
    Commands.Tests_Run = 'python.runtests';
    Commands.Tests_Debug = 'python.debugtests';
    Commands.Tests_Ask_To_Stop_Test = 'python.askToStopUnitTests';
    Commands.Tests_Ask_To_Stop_Discovery = 'python.askToStopUnitTestDiscovery';
    Commands.Tests_Stop = 'python.stopUnitTests';
    Commands.Tests_ViewOutput = 'python.viewTestOutput';
    Commands.Tests_Select_And_Run_Method = 'python.selectAndRunTestMethod';
    Commands.Tests_Select_And_Debug_Method = 'python.selectAndDebugTestMethod';
    Commands.Tests_Select_And_Run_File = 'python.selectAndRunTestFile';
    Commands.Tests_Run_Current_File = 'python.runCurrentTestFile';
    Commands.Refactor_Extract_Variable = 'python.refactorExtractVariable';
    Commands.Refaactor_Extract_Method = 'python.refactorExtractMethod';
    Commands.Update_SparkLibrary = 'python.updateSparkLibrary';
    Commands.Build_Workspace_Symbols = 'python.buildWorkspaceSymbols';
    Commands.Start_REPL = 'python.startREPL';
    Commands.Create_Terminal = 'python.createTerminal';
    Commands.Set_Linter = 'python.setLinter';
    Commands.Enable_Linter = 'python.enableLinting';
    Commands.Run_Linter = 'python.runLinting';
})(Commands = exports.Commands || (exports.Commands = {}));
var Octicons;
(function (Octicons) {
    Octicons.Test_Pass = '$(check)';
    Octicons.Test_Fail = '$(alert)';
    Octicons.Test_Error = '$(x)';
    Octicons.Test_Skip = '$(circle-slash)';
})(Octicons = exports.Octicons || (exports.Octicons = {}));
exports.Button_Text_Tests_View_Output = 'View Output';
var Text;
(function (Text) {
    Text.CodeLensRunUnitTest = 'Run Test';
    Text.CodeLensDebugUnitTest = 'Debug Test';
})(Text = exports.Text || (exports.Text = {}));
var Delays;
(function (Delays) {
    // Max time to wait before aborting the generation of code lenses for unit tests
    Delays.MaxUnitTestCodeLensDelay = 5000;
})(Delays = exports.Delays || (exports.Delays = {}));
var LinterErrors;
(function (LinterErrors) {
    let pylint;
    (function (pylint) {
        pylint.InvalidSyntax = 'E0001';
    })(pylint = LinterErrors.pylint || (LinterErrors.pylint = {}));
    let prospector;
    (function (prospector) {
        prospector.InvalidSyntax = 'F999';
    })(prospector = LinterErrors.prospector || (LinterErrors.prospector = {}));
    let flake8;
    (function (flake8) {
        flake8.InvalidSyntax = 'E999';
    })(flake8 = LinterErrors.flake8 || (LinterErrors.flake8 = {}));
})(LinterErrors = exports.LinterErrors || (exports.LinterErrors = {}));
exports.STANDARD_OUTPUT_CHANNEL = 'STANDARD_OUTPUT_CHANNEL';
function isTestExecution() {
    // tslint:disable-next-line:interface-name no-string-literal
    return process.env['VSC_PYTHON_CI_TEST'] === '1';
}
exports.isTestExecution = isTestExecution;
exports.EXTENSION_ROOT_DIR = path.join(__dirname, '..', '..', '..');
//# sourceMappingURL=constants.js.map