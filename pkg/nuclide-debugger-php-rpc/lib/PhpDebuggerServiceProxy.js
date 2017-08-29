"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.PhpDebuggerService = class {
    constructor() {
      _client.createRemoteObject("PhpDebuggerService", this, [], []);
    }

    getNotificationObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 65
        },
        name: "PhpDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getNotificationObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomNotification"
        });
      }).publish();
    }

    getServerMessageObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 65
        },
        name: "PhpDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    getOutputWindowObservable() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 65
        },
        name: "PhpDebuggerService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getOutputWindowObservable", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    debug(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "config",
        type: {
          kind: "named",
          name: "PhpDebuggerSessionConfig"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 65
        },
        name: "PhpDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "debug", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
    }

    sendCommand(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PhpDebuggerService.js",
          line: 65
        },
        name: "PhpDebuggerService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "sendCommand", "promise", args)).then(value => {
        return _client.unmarshal(value, {
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
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    LogLevel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "LogLevel",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ALL"
        }, {
          kind: "string-literal",
          value: "TRACE"
        }, {
          kind: "string-literal",
          value: "DEBUG"
        }, {
          kind: "string-literal",
          value: "INFO"
        }, {
          kind: "string-literal",
          value: "WARN"
        }, {
          kind: "string-literal",
          value: "ERROR"
        }, {
          kind: "string-literal",
          value: "FATAL"
        }, {
          kind: "string-literal",
          value: "OFF"
        }]
      }
    },
    PhpDebuggerSessionConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 28
      },
      name: "PhpDebuggerSessionConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "xdebugAttachPort",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "xdebugLaunchingPort",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "launchScriptPath",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "pid",
          type: {
            kind: "number"
          },
          optional: true
        }, {
          name: "attachScriptRegex",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "idekeyRegex",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "endDebugWhenNoRequests",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "logLevel",
          type: {
            kind: "named",
            name: "LogLevel"
          },
          optional: false
        }, {
          name: "targetUri",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "phpRuntimePath",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "phpRuntimeArgs",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "dummyRequestFilePath",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "stopOneStopAll",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "launchWrapperCommand",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    AtomNotificationType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 14
      },
      name: "AtomNotificationType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "fatalError"
        }]
      }
    },
    AtomNotification: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 15
      },
      name: "AtomNotification",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "named",
            name: "AtomNotificationType"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    PhpDebuggerService: {
      kind: "interface",
      name: "PhpDebuggerService",
      location: {
        type: "source",
        fileName: "PhpDebuggerService.js",
        line: 65
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        getNotificationObservable: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 79
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomNotification"
            }
          }
        },
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 83
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        getOutputWindowObservable: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 87
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        debug: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 91
          },
          kind: "function",
          argumentTypes: [{
            name: "config",
            type: {
              kind: "named",
              name: "PhpDebuggerSessionConfig"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        sendCommand: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 140
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "PhpDebuggerService.js",
            line: 172
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        }
      }
    }
  }
});