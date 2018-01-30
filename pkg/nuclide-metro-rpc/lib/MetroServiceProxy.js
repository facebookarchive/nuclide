"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getStartCommand = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "projectRoot",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MetroService/getStartCommand", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "MetroStartCommand"
        }
      });
    });
  };

  remoteModule.startMetro = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "projectRoot",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "editorArgs",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("MetroService/startMetro", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "MetroEvent"
      });
    }).publish();
  };

  remoteModule.reloadApp = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("MetroService/reloadApp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.buildBundle = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "bundleName",
      type: {
        kind: "string"
      }
    }, {
      name: "platform",
      type: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ios"
        }, {
          kind: "string-literal",
          value: "android"
        }]
      }
    }]).then(args => {
      return _client.callRemoteFunction("MetroService/buildBundle", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.buildSourceMaps = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "bundleName",
      type: {
        kind: "string"
      }
    }, {
      name: "platform",
      type: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ios"
        }, {
          kind: "string-literal",
          value: "android"
        }]
      }
    }]).then(args => {
      return _client.callRemoteFunction("MetroService/buildSourceMaps", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
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
    MetroStartCommand: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "MetroStartCommand",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "cwd",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    getStartCommand: {
      kind: "function",
      name: "getStartCommand",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 38
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 38
        },
        kind: "function",
        argumentTypes: [{
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "MetroStartCommand"
            }
          }
        }
      }
    },
    ReadyEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "ReadyEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "ready"
          },
          optional: false
        }]
      }
    },
    Level: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 626
      },
      name: "Level",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "log"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "debug"
        }, {
          kind: "string-literal",
          value: "success"
        }]
      }
    },
    Message: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 627
      },
      name: "Message",
      definition: {
        kind: "object",
        fields: [{
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "level",
          type: {
            kind: "named",
            name: "Level"
          },
          optional: false
        }]
      }
    },
    MessageEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 629
      },
      name: "MessageEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "message"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "named",
            name: "Message"
          },
          optional: false
        }]
      }
    },
    MetroEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 19
      },
      name: "MetroEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "ready"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "message"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "named",
              name: "Message"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    startMetro: {
      kind: "function",
      name: "startMetro",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "editorArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "MetroEvent"
          }
        }
      }
    },
    reloadApp: {
      kind: "function",
      name: "reloadApp",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 103
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 103
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
    },
    buildBundle: {
      kind: "function",
      name: "buildBundle",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 123
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 123
        },
        kind: "function",
        argumentTypes: [{
          name: "bundleName",
          type: {
            kind: "string"
          }
        }, {
          name: "platform",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "ios"
            }, {
              kind: "string-literal",
              value: "android"
            }]
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    buildSourceMaps: {
      kind: "function",
      name: "buildSourceMaps",
      location: {
        type: "source",
        fileName: "MetroService.js",
        line: 131
      },
      type: {
        location: {
          type: "source",
          fileName: "MetroService.js",
          line: 131
        },
        kind: "function",
        argumentTypes: [{
          name: "bundleName",
          type: {
            kind: "string"
          }
        }, {
          name: "platform",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "ios"
            }, {
              kind: "string-literal",
              value: "android"
            }]
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    }
  }
});