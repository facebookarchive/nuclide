"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.HhvmDebuggerProxyService = class {
    constructor() {
      _client.createRemoteObject("HhvmDebuggerProxyService", this, [], [])
    }
    getNotificationObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 66
          },
          name: "HhvmDebuggerProxyService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getNotificationObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 84
          },
          kind: "named",
          name: "NotificationMessage"
        });
      });
    }
    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 66
          },
          name: "HhvmDebuggerProxyService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 88
          },
          kind: "string"
        });
      });
    }
    getOutputWindowObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 66
          },
          name: "HhvmDebuggerProxyService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 92
          },
          kind: "string"
        });
      });
    }
    debug(arg0) {
      return trackOperationTiming("HhvmDebuggerProxyService.debug", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "config",
          type: {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 96
            },
            kind: "named",
            name: "HhvmDebuggerSessionConfig"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 66
            },
            name: "HhvmDebuggerProxyService"
          }).then(id => {
            return _client.callRemoteMethod(id, "debug", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 96
            },
            kind: "string"
          });
        });
      });
    }
    sendCommand(arg0) {
      return trackOperationTiming("HhvmDebuggerProxyService.sendCommand", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 116
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 66
            },
            name: "HhvmDebuggerProxyService"
          }).then(id => {
            return _client.callRemoteMethod(id, "sendCommand", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 116
            },
            kind: "void"
          });
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
  }], ["HhvmDebuggerSessionConfig", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HhvmDebuggerProxyService.js",
      line: 22
    },
    name: "HhvmDebuggerSessionConfig",
    definition: {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 23
        },
        name: "xdebugAttachPort",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 23
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 24
        },
        name: "xdebugLaunchingPort",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 24
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 25
        },
        name: "launchScriptPath",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 25
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 26
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 26
          },
          kind: "number"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 27
        },
        name: "scriptRegex",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 27
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 28
        },
        name: "idekeyRegex",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 28
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 29
        },
        name: "endDebugWhenNoRequests",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 29
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 30
        },
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 30
          },
          kind: "named",
          name: "LogLevel"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 31
        },
        name: "targetUri",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 31
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 32
        },
        name: "phpRuntimePath",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 32
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 33
        },
        name: "dummyRequestFilePath",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 33
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["NotificationMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HhvmDebuggerProxyService.js",
      line: 36
    },
    name: "NotificationMessage",
    definition: {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 36
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 37
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 37
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 37
            },
            kind: "string-literal",
            value: "info"
          }, {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 37
            },
            kind: "string-literal",
            value: "warning"
          }, {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 37
            },
            kind: "string-literal",
            value: "error"
          }, {
            location: {
              type: "source",
              fileName: "HhvmDebuggerProxyService.js",
              line: 37
            },
            kind: "string-literal",
            value: "fatalError"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 38
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 38
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["HhvmDebuggerProxyService", {
    kind: "interface",
    name: "HhvmDebuggerProxyService",
    location: {
      type: "source",
      fileName: "HhvmDebuggerProxyService.js",
      line: 66
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getNotificationObservable", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 84
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 84
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 84
          },
          kind: "named",
          name: "NotificationMessage"
        }
      }
    }], ["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 88
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 88
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 88
          },
          kind: "string"
        }
      }
    }], ["getOutputWindowObservable", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 92
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 92
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 92
          },
          kind: "string"
        }
      }
    }], ["debug", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 96
      },
      kind: "function",
      argumentTypes: [{
        name: "config",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 96
          },
          kind: "named",
          name: "HhvmDebuggerSessionConfig"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 96
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 96
          },
          kind: "string"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 116
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 116
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 116
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 116
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HhvmDebuggerProxyService.js",
        line: 149
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HhvmDebuggerProxyService.js",
          line: 149
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HhvmDebuggerProxyService.js",
            line: 149
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