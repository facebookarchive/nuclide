"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vscodeDebugadapter = require("vscode-debugadapter");

var _vscodeDebugprotocol = require("vscode-debugprotocol");

var DebugProtocol = _interopRequireWildcard(_vscodeDebugprotocol);

var _AdapterChannel = require("./channel/AdapterChannel.js");

var _invariant = require("./../common/invariant.js");

var _invariant2 = _interopRequireDefault(_invariant);

var _DebugMessage = require("./../common/channel/DebugMessage.js");

var _DebuggerConstants = require("./../common/DebuggerConstants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/* An implementation of an debugger adapter adhering to the VSCode Debug protocol
 * The adapter is responsible for communication between the UI and Prepack
*/
var PrepackDebugSession = function (_DebugSession) {
  _inherits(PrepackDebugSession, _DebugSession);

  /**
   * Creates a new debug adapter that is used for one debug session.
   * We configure the default implementation of a debug adapter here.
   */
  function PrepackDebugSession() {
    _classCallCheck(this, PrepackDebugSession);

    var _this = _possibleConstructorReturn(this, (PrepackDebugSession.__proto__ || Object.getPrototypeOf(PrepackDebugSession)).call(this));

    _this.setDebuggerLinesStartAt1(true);
    _this.setDebuggerColumnsStartAt1(true);
    return _this;
  }

  _createClass(PrepackDebugSession, [{
    key: "_generateDebugFilePath",
    value: function _generateDebugFilePath(direction) {
      var time = Date.now();
      var filePath = "/tmp/";
      if (direction === "in") {
        filePath += "prepack-debug-engine2adapter-" + time + ".txt";
      } else {
        filePath += "prepack-debug-adapter2engine-" + time + ".txt";
      }
      return filePath;
    }
  }, {
    key: "_registerMessageCallbacks",
    value: function _registerMessageCallbacks() {
      var _this2 = this;

      this._adapterChannel.registerChannelEvent(_DebugMessage.DebugMessage.STOPPED_RESPONSE, function (response) {
        var result = response.result;
        (0, _invariant2.default)(result.kind === "stopped");
        _this2.sendEvent(new _vscodeDebugadapter.StoppedEvent(result.reason + ": " + result.filePath + " " + result.line + ":" + result.column, _DebuggerConstants.DebuggerConstants.PREPACK_THREAD_ID));
      });
      this._adapterChannel.registerChannelEvent(_DebugMessage.DebugMessage.STEPINTO_RESPONSE, function (response) {
        var result = response.result;
        (0, _invariant2.default)(result.kind === "stepInto");
        _this2.sendEvent(new _vscodeDebugadapter.StoppedEvent("Stepped into " + (result.filePath + " " + result.line + ":" + result.column), _DebuggerConstants.DebuggerConstants.PREPACK_THREAD_ID));
      });
    }

    /**
     * The 'initialize' request is the first request called by the UI
     * to interrogate the features the debug adapter provides.
     */
    // Override

  }, {
    key: "initializeRequest",
    value: function initializeRequest(response, args) {
      // Let the UI know that we can start accepting breakpoint requests.
      // The UI will end the configuration sequence by calling 'configurationDone' request.
      this.sendEvent(new _vscodeDebugadapter.InitializedEvent());

      this._clientID = args.clientID;
      response.body = response.body || {};
      response.body.supportsConfigurationDoneRequest = true;
      // Respond back to the UI with the configurations. Will add more configurations gradually as needed.
      // Adapter can respond immediately here because no message is sent to Prepack
      this.sendResponse(response);
    }

    // Override

  }, {
    key: "configurationDoneRequest",
    value: function configurationDoneRequest(response, args) {
      // initial handshake with UI is complete
      if (this._clientID !== _DebuggerConstants.DebuggerConstants.CLI_CLIENTID) {
        // for all ui except the CLI, autosend the first run request
        this._adapterChannel.run(_DebuggerConstants.DebuggerConstants.DEFAULT_REQUEST_ID, function (runResponse) {});
      }
      this.sendResponse(response);
    }

    // Override

  }, {
    key: "launchRequest",
    value: function launchRequest(response, args) {
      var _this3 = this;

      var inFilePath = this._generateDebugFilePath("in");
      var outFilePath = this._generateDebugFilePath("out");
      // set up the communication channel
      this._adapterChannel = new _AdapterChannel.AdapterChannel(inFilePath, outFilePath);
      this._registerMessageCallbacks();
      var launchArgs = {
        kind: "launch",
        sourceFile: args.sourceFile,
        prepackRuntime: args.prepackRuntime,
        prepackArguments: args.prepackArguments,
        debugInFilePath: inFilePath,
        debugOutFilePath: outFilePath,
        outputCallback: function outputCallback(data) {
          var outputEvent = new _vscodeDebugadapter.OutputEvent(data.toString(), "stdout");
          _this3.sendEvent(outputEvent);
        },
        exitCallback: function exitCallback() {
          _this3.sendEvent(new _vscodeDebugadapter.TerminatedEvent());
          process.exit();
        }
      };
      this._adapterChannel.launch(response.request_seq, launchArgs, function (dbgResponse) {
        _this3.sendResponse(response);
      });
    }

    /**
     * Request Prepack to continue running when it is stopped
    */
    // Override

  }, {
    key: "continueRequest",
    value: function continueRequest(response, args) {
      var _this4 = this;

      // send a Run request to Prepack and try to send the next request
      this._adapterChannel.run(response.request_seq, function (dbgResponse) {
        _this4.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "setBreakPointsRequest",
    value: function setBreakPointsRequest(response, args) {
      var _this5 = this;

      if (!args.source.path || !args.breakpoints) return;
      var filePath = args.source.path;
      var breakpointInfos = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = args.breakpoints[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var breakpoint = _step.value;

          var line = breakpoint.line;
          var column = 0;
          if (breakpoint.column) {
            column = breakpoint.column;
          }
          var breakpointInfo = {
            kind: "breakpoint",
            requestID: response.request_seq,
            filePath: filePath,
            line: line,
            column: column
          };
          breakpointInfos.push(breakpointInfo);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._adapterChannel.setBreakpoints(response.request_seq, breakpointInfos, function (dbgResponse) {
        var result = dbgResponse.result;
        (0, _invariant2.default)(result.kind === "breakpoint-add");
        var breakpoints = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = result.breakpoints[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var breakpointInfo = _step2.value;

            var source = {
              path: breakpointInfo.filePath
            };
            var _breakpoint = {
              verified: true,
              source: source,
              line: breakpointInfo.line,
              column: breakpointInfo.column
            };
            breakpoints.push(_breakpoint);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        response.body = {
          breakpoints: breakpoints
        };
        _this5.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "stackTraceRequest",
    value: function stackTraceRequest(response, args) {
      var _this6 = this;

      this._adapterChannel.getStackFrames(response.request_seq, function (dbgResponse) {
        var result = dbgResponse.result;
        (0, _invariant2.default)(result.kind === "stackframe");
        var frameInfos = result.stackframes;
        var frames = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = frameInfos[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var frameInfo = _step3.value;

            var source = {
              path: frameInfo.fileName
            };
            var frame = {
              id: frameInfo.id,
              name: frameInfo.functionName,
              source: source,
              line: frameInfo.line,
              column: frameInfo.column
            };
            frames.push(frame);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        response.body = {
          stackFrames: frames
        };
        _this6.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "threadsRequest",
    value: function threadsRequest(response) {
      // There will only be 1 thread, so respond immediately
      var thread = {
        id: _DebuggerConstants.DebuggerConstants.PREPACK_THREAD_ID,
        name: "main"
      };
      response.body = {
        threads: [thread]
      };
      this.sendResponse(response);
    }

    // Override

  }, {
    key: "scopesRequest",
    value: function scopesRequest(response, args) {
      var _this7 = this;

      this._adapterChannel.getScopes(response.request_seq, args.frameId, function (dbgResponse) {
        var result = dbgResponse.result;
        (0, _invariant2.default)(result.kind === "scopes");
        var scopeInfos = result.scopes;
        var scopes = [];
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = scopeInfos[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var scopeInfo = _step4.value;

            var scope = {
              name: scopeInfo.name,
              variablesReference: scopeInfo.variablesReference,
              expensive: scopeInfo.expensive
            };
            scopes.push(scope);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        response.body = {
          scopes: scopes
        };
        _this7.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "variablesRequest",
    value: function variablesRequest(response, args) {
      var _this8 = this;

      this._adapterChannel.getVariables(response.request_seq, args.variablesReference, function (dbgResponse) {
        var result = dbgResponse.result;
        (0, _invariant2.default)(result.kind === "variables");
        var variableInfos = result.variables;
        var variables = [];
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = variableInfos[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var varInfo = _step5.value;

            var variable = {
              name: varInfo.name,
              value: varInfo.value,
              variablesReference: varInfo.variablesReference
            };
            variables.push(variable);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        response.body = {
          variables: variables
        };
        _this8.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "stepInRequest",
    value: function stepInRequest(response, args) {
      var _this9 = this;

      this._adapterChannel.stepInto(response.request_seq, function (dbgResponse) {
        _this9.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "nextRequest",
    value: function nextRequest(response, args) {
      var _this10 = this;

      this._adapterChannel.stepOver(response.request_seq, function (dbgResponse) {
        _this10.sendResponse(response);
      });
    }

    // Override

  }, {
    key: "evaluateRequest",
    value: function evaluateRequest(response, args) {
      var _this11 = this;

      this._adapterChannel.evaluate(response.request_seq, args.frameId, args.expression, function (dbgResponse) {
        var evalResult = dbgResponse.result;
        (0, _invariant2.default)(evalResult.kind === "evaluate");
        response.body = {
          result: evalResult.displayValue,
          type: evalResult.type,
          variablesReference: evalResult.variablesReference
        };
        _this11.sendResponse(response);
      });
    }
  }]);

  return PrepackDebugSession;
}(_vscodeDebugadapter.DebugSession);

_vscodeDebugadapter.DebugSession.run(PrepackDebugSession);
//# sourceMappingURL=DebugAdapter.js.map