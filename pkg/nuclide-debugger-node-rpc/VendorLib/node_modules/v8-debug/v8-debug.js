var binary = require('node-pre-gyp');
var fs = require('fs');
var path = require('path');
var binding_path = binary.find(path.resolve(path.join(__dirname,'./package.json')));
var binding = require(binding_path);
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var extend = require('util')._extend;

var NODE_NEXT = require('./tools/NODE_NEXT');

// Don't cache debugger module
delete require.cache[module.id];

function InjectedScriptDir(link) {
  return require.resolve(__dirname + '/InjectedScript/' + link);
};
var DebuggerScriptLink = InjectedScriptDir('DebuggerScript.js');
var InjectedScriptLink = InjectedScriptDir('InjectedScriptSource.js');
var InjectedScriptHostLink = InjectedScriptDir('InjectedScriptHost.js');

var overrides = {
  extendedProcessDebugJSONRequestHandles_: {},
  extendedProcessDebugJSONRequestAsyncHandles_: {},
  extendedProcessDebugJSONRequest_: function(json_request) {
    var request;  // Current request.
    var response;  // Generated response.
    try {
      try {
        // Convert the JSON string to an object.
        request = JSON.parse(json_request);

        var handle = this.extendedProcessDebugJSONRequestHandles_[request.command];
        var asyncHandle = this.extendedProcessDebugJSONRequestAsyncHandles_[request.command];
        var asyncResponse;

        if (!handle && !asyncHandle) return;

        // Create an initial response.
        response = this.createResponse(request);

        if (request.arguments) {
          var args = request.arguments;
          if (args.maxStringLength !== undefined) {
            response.setOption('maxStringLength', args.maxStringLength);
          }
          if (args.asyncResponse) {
            asyncResponse = args.asyncResponse;
          }
        }

        if (asyncHandle) {
          if (asyncResponse) return JSON.stringify(asyncResponse);

          asyncHandle.call(this, request, response, function(error) {
            sendCommand(request.command, {
              asyncResponse: error || response
            });
          }.bind(this));

          return '{"seq":0,"type":"response","success":true}';
        }

        handle.call(this, request, response);
      } catch (e) {
        // If there is no response object created one (without command).
        if (!response) {
          response = this.createResponse();
        }
        response.success = false;
        response.message = e.toString();
      }

      // Return the response as a JSON encoded string.
      try {
        if (response.running !== undefined) {
          // Response controls running state.
          this.running_ = response.running;
        }
        response.running = this.running_;
        return JSON.stringify(response);
      } catch (e) {
        // Failed to generate response - return generic error.
        return '{"seq":' + response.seq + ',' +
                '"request_seq":' + request.seq + ',' +
                '"type":"response",' +
                '"success":false,' +
                '"message":"Internal error: ' + e.toString() + '"}';
      }
    } catch (e) {
      // Failed in one of the catch blocks above - most generic error.
      return '{"seq":0,"type":"response","success":false,"message":"Internal error"}';
    }
  },
  processDebugRequest: function WRAPPED_BY_NODE_INSPECTOR(request) {
    return (this.extendedProcessDebugJSONRequest_
      && this.extendedProcessDebugJSONRequest_(request))
      || this.processDebugJSONRequest(request);
  }
};

inherits(V8Debug, EventEmitter);
function V8Debug() {
  this._webkitProtocolEnabled = false;

  // NOTE: Call `_setDebugEventListener` before all other changes in Debug Context.
  // After node 0.12.0 this function serves to allocate Debug Context
  // like a persistent value, that saves all our changes.
  this._setDebugEventListener();
  this._wrapDebugCommandProcessor();

  this.once('close', function() {
    this._unwrapDebugCommandProcessor();
    this._unsetDebugEventListener();
    process.nextTick(function() {
      this.removeAllListeners();
    }.bind(this));
  });
}

V8Debug.prototype._setDebugEventListener = function() {
  var Debug = this.get('Debug');
  Debug.setListener(function(_, execState, event) {
    // TODO(3y3): Handle events here
  });
};

V8Debug.prototype._unsetDebugEventListener = function() {
  var Debug = this.get('Debug');
  Debug.setListener(null);
};

V8Debug.prototype._wrapDebugCommandProcessor = function() {
  var proto = this.get('DebugCommandProcessor.prototype');
  overrides.processDebugRequest_ = proto.processDebugRequest;
  extend(proto, overrides);
  overrides.extendedProcessDebugJSONRequestHandles_['disconnect'] = function(request, response) {
    this.emit('close');
    this.processDebugJSONRequest(request);
  }.bind(this);
};

V8Debug.prototype._unwrapDebugCommandProcessor = function() {
  var proto = this.get('DebugCommandProcessor.prototype');
  proto.processDebugRequest = proto.processDebugRequest_;
  delete proto.processDebugRequest_;
  delete proto.extendedProcessDebugJSONRequest_;
  delete proto.extendedProcessDebugJSONRequestHandles_;
  delete proto.extendedProcessDebugJSONRequestAsyncHandles_;
};

V8Debug.prototype.register =
V8Debug.prototype.registerCommand = function(name, func) {
  overrides.extendedProcessDebugJSONRequestHandles_[name] = func;
};

V8Debug.prototype.registerAsync =
V8Debug.prototype.registerAsyncCommand = function(name, func) {
  overrides.extendedProcessDebugJSONRequestAsyncHandles_[name] = func;
};

V8Debug.prototype.command =
V8Debug.prototype.sendCommand =
V8Debug.prototype.emitEvent = sendCommand;
function sendCommand(name, attributes, userdata) {
  var message = {
    seq: 0,
    type: 'request',
    command: name,
    arguments: attributes || {}
  };
  binding.sendCommand(JSON.stringify(message));
};

V8Debug.prototype.commandToEvent = function(request, response) {
  response.type = 'event';
  response.event = response.command;
  response.body = request.arguments || {};
  delete response.command;
  delete response.request_seq;
};

V8Debug.prototype.registerEvent = function(name) {
  overrides.extendedProcessDebugJSONRequestHandles_[name] = this.commandToEvent;
};

V8Debug.prototype.get =
V8Debug.prototype.runInDebugContext = function(script) {
  if (typeof script == 'function') script = script.toString() + '()';

  script = /\);$/.test(script) ? script : '(' + script + ');';

  return binding.runScript(script);
};

V8Debug.prototype.getFromFrame = function(index, value) {
  var result;

  binding.call(function(execState) {
    var _index = index + 1;
    var _count = execState.frameCount();
    if (_count > _index + 1 ) {
      var frame = execState.frame(_index + 1);
      _count = frame.scopeCount();
      _index = 0;
      while (_count --> 0) {
        var scope = frame.scope(_index).scopeObject().value();
        if (scope[value]) {
          result = scope[value];
          return;
        }
      }
    }
  });

  return result;
};

V8Debug.prototype.enableWebkitProtocol = function() {
  if (!NODE_NEXT) {
    throw new Error('WebKit protocol is not supported on target node version (' + process.version + ')');
  }

  if (this._webkitProtocolEnabled) return;

  var DebuggerScriptSource,
      DebuggerScript,
      InjectedScriptSource,
      InjectedScript,
      InjectedScriptHostSource,
      InjectedScriptHost;

  function prepareSource(source) {
    return 'var ToggleMirrorCache = ToggleMirrorCache || function() {};\n' +
    '(function() {' +
      ('' + source).replace(/^.*?"use strict";(\r?\n.*?)*\(/m, '\r\n"use strict";\nreturn (') +
    '}());';
  }

  DebuggerScriptSource = prepareSource(fs.readFileSync(DebuggerScriptLink, 'utf8'));
  DebuggerScript = this.runInDebugContext(DebuggerScriptSource);

  InjectedScriptSource = prepareSource(fs.readFileSync(InjectedScriptLink, 'utf8'));
  InjectedScript = this.runInDebugContext(InjectedScriptSource);

  InjectedScriptHostSource = prepareSource(fs.readFileSync(InjectedScriptHostLink, 'utf8'));
  InjectedScriptHost = this.runInDebugContext(InjectedScriptHostSource)(binding, DebuggerScript);

  var injectedScript = InjectedScript(InjectedScriptHost, global, 1);

  this.registerAgentCommand = function(command, parameters, callback) {
    this.registerCommand(command, new WebkitProtocolCallback(parameters, callback));
  };

  this._webkitProtocolEnabled = true;

  function WebkitProtocolCallback(argsList, callback) {
    return function(request, response) {
      InjectedScriptHost.execState = this.exec_state_;

      var args = argsList.map(function(name) {
        return request.arguments[name];
      });

      callback.call(this, args, response, injectedScript, DebuggerScript);

      InjectedScriptHost.execState = null;
    }
  }
};

V8Debug.prototype.registerAgentCommand = function(command, parameters, callback) {
  throw new Error('Use "enableWebkitProtocol" before using this method');
};

module.exports = new V8Debug();
