"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debugger;
(function (Debugger) {
    Debugger.Load = 'DEBUGGER_LOAD';
    Debugger.Attach = 'DEBUGGER_ATTACH';
})(Debugger = exports.Debugger || (exports.Debugger = {}));
var Commands;
(function (Commands) {
    Commands.SortImports = 'COMMAND_SORT_IMPORTS';
    Commands.UnitTests = 'COMMAND_UNIT_TEST';
})(Commands = exports.Commands || (exports.Commands = {}));
var IDE;
(function (IDE) {
    IDE.Completion = 'CODE_COMPLETION';
    IDE.Definition = 'CODE_DEFINITION';
    IDE.Format = 'CODE_FORMAT';
    IDE.HoverDefinition = 'CODE_HOVER_DEFINITION';
    IDE.Reference = 'CODE_REFERENCE';
    IDE.Rename = 'CODE_RENAME';
    IDE.Symbol = 'CODE_SYMBOL';
    IDE.Lint = 'LINTING';
})(IDE = exports.IDE || (exports.IDE = {}));
var REFACTOR;
(function (REFACTOR) {
    REFACTOR.Rename = 'REFACTOR_RENAME';
    REFACTOR.ExtractVariable = 'REFACTOR_EXTRACT_VAR';
    REFACTOR.ExtractMethod = 'REFACTOR_EXTRACT_METHOD';
})(REFACTOR = exports.REFACTOR || (exports.REFACTOR = {}));
var UnitTests;
(function (UnitTests) {
    UnitTests.Run = 'UNITTEST_RUN';
    UnitTests.Discover = 'UNITTEST_DISCOVER';
})(UnitTests = exports.UnitTests || (exports.UnitTests = {}));
var Jupyter;
(function (Jupyter) {
    Jupyter.Usage = 'JUPYTER';
})(Jupyter = exports.Jupyter || (exports.Jupyter = {}));
exports.EVENT_LOAD = 'IDE_LOAD';
//# sourceMappingURL=telemetryContracts.js.map