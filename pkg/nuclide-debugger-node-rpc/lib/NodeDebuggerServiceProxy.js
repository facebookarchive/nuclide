"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAttachTargetInfoList = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("NodeDebuggerService/getAttachTargetInfoList", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 28
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 28
          },
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
            line: 74
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getServerMessageObservable", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 90
          },
          kind: "string"
        });
      }).publish();
    }

    sendCommand(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 94
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 74
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "sendCommand", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 94
          },
          kind: "void"
        });
      });
    }

    attach(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "attachInfo",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 104
          },
          kind: "named",
          name: "NodeAttachTargetInfo"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 74
          },
          name: "NodeDebuggerService"
        }).then(id => {
          return _client.callRemoteMethod(id, "attach", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 104
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
  }], ["NodeAttachTargetInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "NodeDebuggerService.js",
      line: 22
    },
    name: "NodeAttachTargetInfo",
    definition: {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 23
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 23
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 24
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 25
        },
        name: "commandName",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 25
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
      fileName: "NodeDebuggerService.js",
      line: 28
    },
    type: {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 28
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 28
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 28
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "NodeDebuggerService.js",
              line: 28
            },
            kind: "named",
            name: "NodeAttachTargetInfo"
          }
        }
      }
    }
  }], ["NodeDebuggerService", {
    kind: "interface",
    name: "NodeDebuggerService",
    location: {
      type: "source",
      fileName: "NodeDebuggerService.js",
      line: 74
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getServerMessageObservable", {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 90
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 90
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 90
          },
          kind: "string"
        }
      }
    }], ["sendCommand", {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 94
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 94
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 94
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 94
          },
          kind: "void"
        }
      }
    }], ["attach", {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 104
      },
      kind: "function",
      argumentTypes: [{
        name: "attachInfo",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 104
          },
          kind: "named",
          name: "NodeAttachTargetInfo"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 104
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 104
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "NodeDebuggerService.js",
        line: 136
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "NodeDebuggerService.js",
          line: 136
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "NodeDebuggerService.js",
            line: 136
          },
          kind: "void"
        }
      }
    }]])
  }]])
});