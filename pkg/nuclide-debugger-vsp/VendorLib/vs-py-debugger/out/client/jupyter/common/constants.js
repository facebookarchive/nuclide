"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonLanguage = { language: 'python', scheme: 'file' };
var Commands;
(function (Commands) {
    var Jupyter;
    (function (Jupyter) {
        Jupyter.Get_All_KernelSpecs_For_Language = 'jupyter.getAllKernelSpecsForLanguage';
        Jupyter.Get_All_KernelSpecs = 'jupyter.getAllKernelSpecs';
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
            Kernel.Select = 'jupyter.selectKernel';
            Kernel.Interrupt = 'jupyter.kernelInterrupt';
            Kernel.Restart = 'jupyter.kernelRestart';
            Kernel.Shutdown = 'jupyter.kernelShutDown';
            Kernel.Details = 'jupyter.kernelDetails';
        })(Kernel = Jupyter.Kernel || (Jupyter.Kernel = {}));
        var Notebook;
        (function (Notebook) {
            Notebook.ShutDown = 'jupyter.shutdown';
        })(Notebook = Jupyter.Notebook || (Jupyter.Notebook = {}));
    })(Jupyter = Commands.Jupyter || (Commands.Jupyter = {}));
})(Commands = exports.Commands || (exports.Commands = {}));
//# sourceMappingURL=constants.js.map