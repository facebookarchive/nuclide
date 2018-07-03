"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdapterChannel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _FileIOWrapper = require("./../../common/channel/FileIOWrapper.js");

var _MessageMarshaller = require("./../../common/channel/MessageMarshaller.js");

var _queueFifo = require("queue-fifo");

var _queueFifo2 = _interopRequireDefault(_queueFifo);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

var _invariant = require("./../../common/invariant.js");

var _invariant2 = _interopRequireDefault(_invariant);

var _DebugMessage = require("./../../common/channel/DebugMessage.js");

var _child_process = require("child_process");

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Channel used by the debug adapter to communicate with Prepack
var AdapterChannel = exports.AdapterChannel = function () {
  function AdapterChannel(inFilePath, outFilePath) {
    _classCallCheck(this, AdapterChannel);

    this._ioWrapper = new _FileIOWrapper.FileIOWrapper(true, inFilePath, outFilePath);
    this._marshaller = new _MessageMarshaller.MessageMarshaller();
    this._queue = new _queueFifo2.default();
    this._pendingRequestCallbacks = new Map();
    this._eventEmitter = new _events2.default();
  }

  _createClass(AdapterChannel, [{
    key: "_handleFileReadError",


    // Error handler for errors in files from the adapter channel
    value: function _handleFileReadError(err) {
      console.error(err);
      process.exit(1);
    }
  }, {
    key: "_processPrepackMessage",
    value: function _processPrepackMessage(message) {
      var dbgResponse = this._marshaller.unmarshallResponse(message);
      if (dbgResponse.result.kind === "breakpoint-add") {
        this._eventEmitter.emit(_DebugMessage.DebugMessage.BREAKPOINT_ADD_ACKNOWLEDGE, dbgResponse.id, dbgResponse);
      } else if (dbgResponse.result.kind === "stopped") {
        this._eventEmitter.emit(_DebugMessage.DebugMessage.STOPPED_RESPONSE, dbgResponse);
      } else if (dbgResponse.result.kind === "stepInto") {
        this._eventEmitter.emit(_DebugMessage.DebugMessage.STEPINTO_RESPONSE, dbgResponse);
      }
      this._prepackWaiting = true;
      this._processRequestCallback(dbgResponse);
      this.trySendNextRequest();
    }

    // Check to see if the next request to Prepack can be sent and send it if so

  }, {
    key: "trySendNextRequest",
    value: function trySendNextRequest() {
      // check to see if Prepack is ready to accept another request
      if (!this._prepackWaiting) return false;
      // check that there is a message to send
      if (this._queue.isEmpty()) return false;
      var request = this._queue.dequeue();
      this.listenOnFile(this._processPrepackMessage.bind(this));
      this.writeOut(request);
      this._prepackWaiting = false;
      return true;
    }
  }, {
    key: "_addRequestCallback",
    value: function _addRequestCallback(requestID, callback) {
      (0, _invariant2.default)(!this._pendingRequestCallbacks.has(requestID), "Request ID already exists in pending requests");
      this._pendingRequestCallbacks.set(requestID, callback);
    }
  }, {
    key: "_processRequestCallback",
    value: function _processRequestCallback(response) {
      var callback = this._pendingRequestCallbacks.get(response.id);
      (0, _invariant2.default)(callback !== undefined, "Request ID does not exist in pending requests: " + response.id);
      callback(response);
      this._pendingRequestCallbacks.delete(response.id);
    }
  }, {
    key: "registerChannelEvent",
    value: function registerChannelEvent(event, listener) {
      this._eventEmitter.addListener(event, listener);
    }
  }, {
    key: "launch",
    value: function launch(requestID, args, callback) {
      var _this = this;

      this.sendDebuggerStart(requestID);
      this.listenOnFile(this._processPrepackMessage.bind(this));
      var prepackCommand = [args.sourceFile].concat(args.prepackArguments);
      // Note: here the input file for the adapter is the output file for Prepack, and vice versa.
      prepackCommand = prepackCommand.concat(["--debugInFilePath", args.debugOutFilePath, "--debugOutFilePath", args.debugInFilePath]);

      var runtime = "prepack";
      if (args.prepackRuntime.length > 0) {
        // user specified a Prepack path
        runtime = "node";
        prepackCommand = [args.prepackRuntime].concat(prepackCommand);
      }
      this._prepackProcess = _child_process2.default.spawn(runtime, prepackCommand);

      process.on("exit", function () {
        _this._prepackProcess.kill();
        _this.clean();
        process.exit();
      });

      process.on("SIGINT", function () {
        _this._prepackProcess.kill();
        process.exit();
      });

      this._prepackProcess.stdout.on("data", args.outputCallback);

      this._prepackProcess.on("exit", args.exitCallback);
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "run",
    value: function run(requestID, callback) {
      this._queue.enqueue(this._marshaller.marshallContinueRequest(requestID));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "setBreakpoints",
    value: function setBreakpoints(requestID, breakpoints, callback) {
      this._queue.enqueue(this._marshaller.marshallSetBreakpointsRequest(requestID, breakpoints));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "getStackFrames",
    value: function getStackFrames(requestID, callback) {
      this._queue.enqueue(this._marshaller.marshallStackFramesRequest(requestID));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "getScopes",
    value: function getScopes(requestID, frameId, callback) {
      this._queue.enqueue(this._marshaller.marshallScopesRequest(requestID, frameId));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "getVariables",
    value: function getVariables(requestID, variablesReference, callback) {
      this._queue.enqueue(this._marshaller.marshallVariablesRequest(requestID, variablesReference));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "stepInto",
    value: function stepInto(requestID, callback) {
      this._queue.enqueue(this._marshaller.marshallStepIntoRequest(requestID));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "stepOver",
    value: function stepOver(requestID, callback) {
      this._queue.enqueue(this._marshaller.marshallStepOverRequest(requestID));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "evaluate",
    value: function evaluate(requestID, frameId, expression, callback) {
      this._queue.enqueue(this._marshaller.marshallEvaluateRequest(requestID, frameId, expression));
      this.trySendNextRequest();
      this._addRequestCallback(requestID, callback);
    }
  }, {
    key: "writeOut",
    value: function writeOut(contents) {
      this._ioWrapper.writeOutSync(contents);
    }
  }, {
    key: "sendDebuggerStart",
    value: function sendDebuggerStart(requestID) {
      this.writeOut(this._marshaller.marshallDebuggerStart(requestID));
    }
  }, {
    key: "listenOnFile",
    value: function listenOnFile(messageProcessor) {
      this._ioWrapper.readIn(this._handleFileReadError.bind(this), messageProcessor);
    }
  }, {
    key: "clean",
    value: function clean() {
      this._ioWrapper.clearInFile();
      this._ioWrapper.clearOutFile();
    }
  }]);

  return AdapterChannel;
}();
//# sourceMappingURL=AdapterChannel.js.map