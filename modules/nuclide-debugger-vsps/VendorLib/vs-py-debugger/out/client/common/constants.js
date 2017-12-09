"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonLanguage = { language: 'python', scheme: 'file' };
var Commands;
(function (Commands) {
    Commands.Set_Interpreter = 'python.setInterpreter';
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
    var Jupyter;
    (function (Jupyter) {
        Jupyter.Get_All_KernelSpecs_For_Language = 'jupyter.getAllKernelSpecsForLanguage';
        Jupyter.Get_All_KernelSpecs = 'jupyter.getAllKernelSpecs';
        Jupyter.Select_Kernel = 'jupyter.selectKernel';
        Jupyter.Kernel_Options = 'jupyter.kernelOptions';
        Jupyter.StartKernelForKernelSpeck = 'jupyter.sartKernelForKernelSpecs';
        Jupyter.ExecuteRangeInKernel = 'jupyter.execRangeInKernel';
        Jupyter.ExecuteSelectionOrLineInKernel = 'jupyter.runSelectionLine';
        var Cell;
        (function (Cell) {
            Cell.ExecuteCurrentCell = 'jupyter.execCurrentCell';
            Cell.ExecuteCurrentCellAndAdvance = 'jupyter.execCurrentCellAndAdvance';
            Cell.AdcanceToCell = 'jupyter.advanceToNextCell';
            Cell.DisplayCellMenu = 'jupyter.displayCellMenu';
            Cell.GoToPreviousCell = 'jupyter.gotToPreviousCell';
            Cell.GoToNextCell = 'jupyter.gotToNextCell';
        })(Cell = Jupyter.Cell || (Jupyter.Cell = {}));
        var Kernel;
        (function (Kernel) {
            Kernel.Kernel_Interrupt = 'jupyter.kernelInterrupt';
            Kernel.Kernel_Restart = 'jupyter.kernelRestart';
            Kernel.Kernel_Shut_Down = 'jupyter.kernelShutDown';
            Kernel.Kernel_Details = 'jupyter.kernelDetails';
        })(Kernel = Jupyter.Kernel || (Jupyter.Kernel = {}));
    })(Jupyter = Commands.Jupyter || (Commands.Jupyter = {}));
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
    var pylint;
    (function (pylint) {
        pylint.InvalidSyntax = 'E0001';
    })(pylint = LinterErrors.pylint || (LinterErrors.pylint = {}));
    var prospector;
    (function (prospector) {
        prospector.InvalidSyntax = 'F999';
    })(prospector = LinterErrors.prospector || (LinterErrors.prospector = {}));
    var flake8;
    (function (flake8) {
        flake8.InvalidSyntax = 'E999';
    })(flake8 = LinterErrors.flake8 || (LinterErrors.flake8 = {}));
})(LinterErrors = exports.LinterErrors || (exports.LinterErrors = {}));
var Documentation;
(function (Documentation) {
    Documentation.Home = '/docs/python-path/';
    var Jupyter;
    (function (Jupyter) {
        Jupyter.GettingStarted = '/docs/jupyter_getting-started/';
        Jupyter.Examples = '/docs/jupyter_examples/';
        Jupyter.Setup = '/docs/jupyter_prerequisites/';
        Jupyter.VersionIncompatiblity = '/docs/troubleshooting_jupyter/#Incompatible-dependencies';
    })(Jupyter = Documentation.Jupyter || (Documentation.Jupyter = {}));
    var Formatting;
    (function (Formatting) {
        Formatting.FormatOnSave = '/docs/formatting/';
    })(Formatting = Documentation.Formatting || (Documentation.Formatting = {}));
    var Workspace;
    (function (Workspace) {
        Workspace.Home = '/docs/workspaceSymbols/';
        Workspace.InstallOnWindows = '/docs/workspaceSymbols/#Install-Windows';
    })(Workspace = Documentation.Workspace || (Documentation.Workspace = {}));
})(Documentation = exports.Documentation || (exports.Documentation = {}));
//# sourceMappingURL=constants.js.map