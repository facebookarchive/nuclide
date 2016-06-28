"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAttachTargetInfoList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => _client.callRemoteFunction("LLDBDebuggerRpcService/getAttachTargetInfoList", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 36
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 36
        },
        kind: "named",
        name: "AttachTargetInfo"
      }
    }));
  }

  remoteModule.DebuggerConnection = class {
    constructor() {
      _client.createRemoteObject("DebuggerConnection", this, [], [])
    }
    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 40
        },
        name: "DebuggerConnection"
      }).then(id => _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args)))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 41
        },
        kind: "string"
      }));
    }
    sendCommand(arg0) {
      return trackOperationTiming("DebuggerConnection.sendCommand", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "DebuggerRpcServiceInterface.js",
              line: 44
            },
            kind: "string"
          }
        }]).then(args => _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 40
          },
          name: "DebuggerConnection"
        }).then(id => _client.callRemoteMethod(id, "sendCommand", "promise", args))).then(value => _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 44
          },
          kind: "void"
        }));
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  }
  remoteModule.DebuggerRpcService = class {
    constructor(arg0) {
      _client.createRemoteObject("DebuggerRpcService", this, [arg0], [{
        name: "config",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 53
          },
          kind: "named",
          name: "DebuggerConfig"
        }
      }])
    }
    getOutputWindowObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 52
        },
        name: "DebuggerRpcService"
      }).then(id => _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args)))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 56
        },
        kind: "string"
      }));
    }
    attach(arg0) {
      return trackOperationTiming("DebuggerRpcService.attach", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "attachInfo",
          type: {
            location: {
              type: "source",
              fileName: "DebuggerRpcServiceInterface.js",
              line: 59
            },
            kind: "named",
            name: "AttachTargetInfo"
          }
        }]).then(args => _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 52
          },
          name: "DebuggerRpcService"
        }).then(id => _client.callRemoteMethod(id, "attach", "promise", args))).then(value => _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 59
          },
          kind: "named",
          name: "DebuggerConnection"
        }));
      });
    }
    launch(arg0) {
      return trackOperationTiming("DebuggerRpcService.launch", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "launchInfo",
          type: {
            location: {
              type: "source",
              fileName: "DebuggerRpcServiceInterface.js",
              line: 62
            },
            kind: "named",
            name: "LaunchTargetInfo"
          }
        }]).then(args => _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 52
          },
          name: "DebuggerRpcService"
        }).then(id => _client.callRemoteMethod(id, "launch", "promise", args))).then(value => _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 62
          },
          kind: "named",
          name: "DebuggerConnection"
        }));
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  }
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["AttachTargetInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 15
    },
    name: "AttachTargetInfo",
    definition: {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 15
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 16
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 16
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 17
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 18
        },
        name: "commandName",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 18
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 19
        },
        name: "basepath",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 19
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["LaunchTargetInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 22
    },
    name: "LaunchTargetInfo",
    definition: {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 23
        },
        name: "executablePath",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 23
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 24
        },
        name: "arguments",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 25
        },
        name: "environmentVariables",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 25
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "DebuggerRpcServiceInterface.js",
              line: 25
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "DebuggerRpcServiceInterface.js",
                line: 25
              },
              kind: "string"
            }
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 26
        },
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 26
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 27
        },
        name: "basepath",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 27
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["DebuggerConfig", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 30
    },
    name: "DebuggerConfig",
    definition: {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 30
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 31
        },
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 31
          },
          kind: "named",
          name: "LogLevel"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 32
        },
        name: "pythonBinaryPath",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 32
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 33
        },
        name: "buckConfigRootFile",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 33
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["getAttachTargetInfoList", {
    kind: "function",
    name: "getAttachTargetInfoList",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 36
    },
    type: {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 36
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 36
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 36
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "DebuggerRpcServiceInterface.js",
              line: 36
            },
            kind: "named",
            name: "AttachTargetInfo"
          }
        }
      }
    }
  }], ["DebuggerConnection", {
    kind: "interface",
    name: "DebuggerConnection",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 40
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 41
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 41
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 41
          },
          kind: "string"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 44
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 44
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 44
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 44
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 47
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 47
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 47
          },
          kind: "void"
        }
      }
    }]])
  }], ["DebuggerRpcService", {
    kind: "interface",
    name: "DebuggerRpcService",
    location: {
      type: "source",
      fileName: "DebuggerRpcServiceInterface.js",
      line: 52
    },
    constructorArgs: [{
      name: "config",
      type: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 53
        },
        kind: "named",
        name: "DebuggerConfig"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["getOutputWindowObservable", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 56
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 56
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 56
          },
          kind: "string"
        }
      }
    }], ["attach", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 59
      },
      kind: "function",
      argumentTypes: [{
        name: "attachInfo",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 59
          },
          kind: "named",
          name: "AttachTargetInfo"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 59
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 59
          },
          kind: "named",
          name: "DebuggerConnection"
        }
      }
    }], ["launch", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 62
      },
      kind: "function",
      argumentTypes: [{
        name: "launchInfo",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 62
          },
          kind: "named",
          name: "LaunchTargetInfo"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 62
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 62
          },
          kind: "named",
          name: "DebuggerConnection"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "DebuggerRpcServiceInterface.js",
        line: 65
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "DebuggerRpcServiceInterface.js",
          line: 65
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "DebuggerRpcServiceInterface.js",
            line: 65
          },
          kind: "void"
        }
      }
    }]])
  }], ["LogLevel", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 11
    },
    name: "LogLevel",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "string-literal",
        value: "ALL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "string-literal",
        value: "TRACE"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "DEBUG"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        kind: "string-literal",
        value: "INFO"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        kind: "string-literal",
        value: "WARN"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        kind: "string-literal",
        value: "ERROR"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        kind: "string-literal",
        value: "FATAL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "string-literal",
        value: "OFF"
      }]
    }
  }]])
});