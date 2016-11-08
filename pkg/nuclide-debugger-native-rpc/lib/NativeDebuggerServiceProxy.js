"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAttachTargetInfoList = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "targetPid",
      type: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 67
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 67
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("NativeDebuggerService/getAttachTargetInfoList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 68
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 68
          },
          kind: "named",
          name: "AttachTargetInfo"
        }
      });
    });
  };

  remoteModule.NativeDebuggerService = class {
    constructor(arg0) {
      _client.createRemoteObject("NativeDebuggerService", this, [arg0], [{
        name: "config",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 126
          },
          kind: "named",
          name: "DebuggerConfig"
        }
      }]);
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 120
          },
          name: "NativeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 133
          },
          kind: "string"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 120
          },
          name: "NativeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 137
          },
          kind: "string"
        });
      }).publish();
    }

    attach(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "attachInfo",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 141
          },
          kind: "named",
          name: "AttachTargetInfo"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 120
          },
          name: "NativeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "attach", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 141
          },
          kind: "void"
        });
      }).publish();
    }

    launch(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "launchInfo",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 150
          },
          kind: "named",
          name: "LaunchTargetInfo"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 120
          },
          name: "NativeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "launch", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 150
          },
          kind: "void"
        });
      }).publish();
    }

    sendCommand(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 302
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 120
          },
          name: "NativeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "sendCommand", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 302
          },
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
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
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["AttachTargetInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "NativeDebuggerService.js",
      line: 28
    },
    name: "AttachTargetInfo",
    definition: {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 28
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 29
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 29
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 30
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 30
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 31
        },
        name: "commandName",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 31
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 32
        },
        name: "basepath",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 32
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
      fileName: "NativeDebuggerService.js",
      line: 35
    },
    name: "LaunchTargetInfo",
    definition: {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 35
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 36
        },
        name: "executablePath",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 36
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 37
        },
        name: "arguments",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 37
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "NativeDebuggerService.js",
              line: 37
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 38
        },
        name: "environmentVariables",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 38
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "NativeDebuggerService.js",
              line: 38
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 39
        },
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 39
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 40
        },
        name: "stdinFilePath",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 40
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 41
        },
        name: "basepath",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 41
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
      fileName: "NativeDebuggerService.js",
      line: 44
    },
    name: "DebuggerConfig",
    definition: {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 44
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 45
        },
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 45
          },
          kind: "named",
          name: "LogLevel"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 46
        },
        name: "pythonBinaryPath",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 46
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 47
        },
        name: "buckConfigRootFile",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 47
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
      fileName: "NativeDebuggerService.js",
      line: 66
    },
    type: {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 66
      },
      kind: "function",
      argumentTypes: [{
        name: "targetPid",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 67
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "NativeDebuggerService.js",
              line: 67
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 68
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 68
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "NativeDebuggerService.js",
              line: 68
            },
            kind: "named",
            name: "AttachTargetInfo"
          }
        }
      }
    }
  }], ["NativeDebuggerService", {
    kind: "interface",
    name: "NativeDebuggerService",
    location: {
      type: "source",
      fileName: "NativeDebuggerService.js",
      line: 120
    },
    constructorArgs: [{
      name: "config",
      type: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 126
        },
        kind: "named",
        name: "DebuggerConfig"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["getOutputWindowObservable", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 133
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 133
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 133
          },
          kind: "string"
        }
      }
    }], ["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 137
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 137
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 137
          },
          kind: "string"
        }
      }
    }], ["attach", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 141
      },
      kind: "function",
      argumentTypes: [{
        name: "attachInfo",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 141
          },
          kind: "named",
          name: "AttachTargetInfo"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 141
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 141
          },
          kind: "void"
        }
      }
    }], ["launch", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 150
      },
      kind: "function",
      argumentTypes: [{
        name: "launchInfo",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 150
          },
          kind: "named",
          name: "LaunchTargetInfo"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 150
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 150
          },
          kind: "void"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 302
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 302
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 302
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 302
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "NativeDebuggerService.js",
        line: 313
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NativeDebuggerService.js",
          line: 313
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NativeDebuggerService.js",
            line: 313
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