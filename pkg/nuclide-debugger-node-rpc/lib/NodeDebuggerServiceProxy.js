"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAttachTargetInfoList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("NodeDebuggerService/getAttachTargetInfoList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "NodeAttachTargetInfo"
        }
      });
    });
  };

  remoteModule.NodeDebuggerService = class {
    constructor() {
      _client.createRemoteObject("NodeDebuggerService", this, [], []);
    }

    getServerMessageObservable() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 84
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    sendCommand(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 84
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "sendCommand", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    attach(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "attachInfo",
        type: {
          kind: "named",
          name: "NodeAttachTargetInfo"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 84
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "attach", "promise", args);
        });
      }).then(value => {
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
    NodeAttachTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 21
      },
      name: "NodeAttachTargetInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "pid",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "commandName",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getAttachTargetInfoList: {
      kind: "function",
      name: "getAttachTargetInfoList",
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 27
      },
      type: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 27
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NodeAttachTargetInfo"
            }
          }
        }
      }
    },
    NodeDebuggerService: {
      kind: "interface",
      name: "NodeDebuggerService",
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 84
      },
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {
        getServerMessageObservable: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 100
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
        sendCommand: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 104
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
        attach: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 116
          },
          kind: "function",
          argumentTypes: [{
            name: "attachInfo",
            type: {
              kind: "named",
              name: "NodeAttachTargetInfo"
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
            fileName: "NodeDebuggerService.js",
            line: 148
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