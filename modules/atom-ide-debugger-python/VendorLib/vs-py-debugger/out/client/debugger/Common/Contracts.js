// tslint:disable:interface-name member-access no-single-line-block-comment no-any no-stateless-class member-ordering prefer-method-signature no-unnecessary-class
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_debugadapter_1 = require("vscode-debugadapter");
class TelemetryEvent extends vscode_debugadapter_1.OutputEvent {
    constructor(output, data) {
        super(output, 'telemetry');
        if (data) {
            this.body.data = data;
        }
    }
}
exports.TelemetryEvent = TelemetryEvent;
exports.VALID_DEBUG_OPTIONS = [
    'WaitOnAbnormalExit',
    'WaitOnNormalExit',
    'RedirectOutput',
    'DebugStdLib',
    'BreakOnSystemExitZero',
    'DjangoDebugging',
    'Django'
];
var DebugFlags;
(function (DebugFlags) {
    DebugFlags[DebugFlags["None"] = 0] = "None";
    DebugFlags[DebugFlags["IgnoreCommandBursts"] = 1] = "IgnoreCommandBursts";
})(DebugFlags = exports.DebugFlags || (exports.DebugFlags = {}));
var DebugOptions;
(function (DebugOptions) {
    DebugOptions["WaitOnAbnormalExit"] = "WaitOnAbnormalExit";
    DebugOptions["WaitOnNormalExit"] = "WaitOnNormalExit";
    DebugOptions["RedirectOutput"] = "RedirectOutput";
    DebugOptions["Django"] = "Django";
    DebugOptions["DjangoDebugging"] = "DjangoDebugging";
    DebugOptions["Jinja"] = "Jinja";
    DebugOptions["DebugStdLib"] = "DebugStdLib";
    DebugOptions["BreakOnSystemExitZero"] = "BreakOnSystemExitZero";
    DebugOptions["Sudo"] = "Sudo";
    DebugOptions["Pyramid"] = "Pyramid";
    DebugOptions["FixFilePathCase"] = "FixFilePathCase";
    DebugOptions["WindowsClient"] = "WindowsClient";
    DebugOptions["UnixClient"] = "UnixClient";
})(DebugOptions = exports.DebugOptions || (exports.DebugOptions = {}));
var FrameKind;
(function (FrameKind) {
    FrameKind[FrameKind["None"] = 0] = "None";
    FrameKind[FrameKind["Python"] = 1] = "Python";
    FrameKind[FrameKind["Django"] = 2] = "Django";
})(FrameKind = exports.FrameKind || (exports.FrameKind = {}));
var enum_EXCEPTION_STATE;
(function (enum_EXCEPTION_STATE) {
    enum_EXCEPTION_STATE[enum_EXCEPTION_STATE["BREAK_MODE_NEVER"] = 0] = "BREAK_MODE_NEVER";
    enum_EXCEPTION_STATE[enum_EXCEPTION_STATE["BREAK_MODE_ALWAYS"] = 1] = "BREAK_MODE_ALWAYS";
    enum_EXCEPTION_STATE[enum_EXCEPTION_STATE["BREAK_MODE_UNHANDLED"] = 32] = "BREAK_MODE_UNHANDLED";
})(enum_EXCEPTION_STATE = exports.enum_EXCEPTION_STATE || (exports.enum_EXCEPTION_STATE = {}));
var PythonLanguageVersion;
(function (PythonLanguageVersion) {
    PythonLanguageVersion[PythonLanguageVersion["Is2"] = 0] = "Is2";
    PythonLanguageVersion[PythonLanguageVersion["Is3"] = 1] = "Is3";
})(PythonLanguageVersion = exports.PythonLanguageVersion || (exports.PythonLanguageVersion = {}));
var PythonEvaluationResultReprKind;
(function (PythonEvaluationResultReprKind) {
    PythonEvaluationResultReprKind[PythonEvaluationResultReprKind["Normal"] = 0] = "Normal";
    PythonEvaluationResultReprKind[PythonEvaluationResultReprKind["Raw"] = 1] = "Raw";
    PythonEvaluationResultReprKind[PythonEvaluationResultReprKind["RawLen"] = 2] = "RawLen";
})(PythonEvaluationResultReprKind = exports.PythonEvaluationResultReprKind || (exports.PythonEvaluationResultReprKind = {}));
var PythonEvaluationResultFlags;
(function (PythonEvaluationResultFlags) {
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["None"] = 0] = "None";
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["Expandable"] = 1] = "Expandable";
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["MethodCall"] = 2] = "MethodCall";
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["SideEffects"] = 4] = "SideEffects";
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["Raw"] = 8] = "Raw";
    PythonEvaluationResultFlags[PythonEvaluationResultFlags["HasRawRepr"] = 16] = "HasRawRepr";
})(PythonEvaluationResultFlags = exports.PythonEvaluationResultFlags || (exports.PythonEvaluationResultFlags = {}));
// Must be in sync with BREAKPOINT_CONDITION_* constants in visualstudio_py_debugger.py.
var PythonBreakpointConditionKind;
(function (PythonBreakpointConditionKind) {
    PythonBreakpointConditionKind[PythonBreakpointConditionKind["Always"] = 0] = "Always";
    PythonBreakpointConditionKind[PythonBreakpointConditionKind["WhenTrue"] = 1] = "WhenTrue";
    PythonBreakpointConditionKind[PythonBreakpointConditionKind["WhenChanged"] = 2] = "WhenChanged";
})(PythonBreakpointConditionKind = exports.PythonBreakpointConditionKind || (exports.PythonBreakpointConditionKind = {}));
// Must be in sync with BREAKPOINT_PASS_COUNT_* constants in visualstudio_py_debugger.py.
var PythonBreakpointPassCountKind;
(function (PythonBreakpointPassCountKind) {
    PythonBreakpointPassCountKind[PythonBreakpointPassCountKind["Always"] = 0] = "Always";
    PythonBreakpointPassCountKind[PythonBreakpointPassCountKind["Every"] = 1] = "Every";
    PythonBreakpointPassCountKind[PythonBreakpointPassCountKind["WhenEqual"] = 2] = "WhenEqual";
    PythonBreakpointPassCountKind[PythonBreakpointPassCountKind["WhenEqualOrGreater"] = 3] = "WhenEqualOrGreater";
})(PythonBreakpointPassCountKind = exports.PythonBreakpointPassCountKind || (exports.PythonBreakpointPassCountKind = {}));
//# sourceMappingURL=Contracts.js.map