"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getRootForPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getRootForPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getBuildFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 162
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targetName",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 162
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuildFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 162
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 162
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getOwners = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 228
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 229
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "kindFilter",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 230
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 230
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getOwners", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 231
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 231
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckConfig = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 248
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "section",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 249
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 250
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuckConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 251
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 251
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.build = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 286
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 287
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 287
          },
          kind: "string"
        }
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 288
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 288
          },
          kind: "named",
          name: "BaseBuckBuildOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/build", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 289
        },
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 305
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 306
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 306
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 307
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 307
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 308
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 308
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/install", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 309
        },
        kind: "any"
      });
    });
  };

  remoteModule.buildWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 367
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 368
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 368
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 369
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 369
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 370
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 386
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 387
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 387
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 388
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 388
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/testWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 389
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 405
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 406
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 406
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 407
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 407
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 408
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 408
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 409
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 409
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/installWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 410
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.listAliases = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 486
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listAliases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 486
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 486
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.resolveAlias = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 496
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 496
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/resolveAlias", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 496
        },
        kind: "string"
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 510
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 511
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/showOutput", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 512
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 512
          },
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.buildRuleTypeFor = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 519
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 520
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildRuleTypeFor", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 521
        },
        kind: "string"
      });
    });
  };

  remoteModule.getHTTPServerPort = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 551
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getHTTPServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 552
        },
        kind: "number"
      });
    });
  };

  remoteModule.query = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 561
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 562
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/query", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 563
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 563
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.queryWithArgs = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 580
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 581
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 582
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 582
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/queryWithArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 583
        },
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.getWebSocketStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 601
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "httpPort",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 602
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getWebSocketStream", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 603
        },
        kind: "named",
        name: "Object"
      });
    }).publish();
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
  }], ["dontRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 38
    },
    name: "dontRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 39
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 39
          },
          kind: "boolean-literal",
          value: false
        },
        optional: false
      }]
    }
  }], ["doRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 42
    },
    name: "doRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 42
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 43
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 43
          },
          kind: "boolean-literal",
          value: true
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 44
        },
        name: "debug",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 44
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["BuckRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 47
    },
    name: "BuckRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 47
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 39
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 39
            },
            kind: "boolean-literal",
            value: false
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 42
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 43
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 43
            },
            kind: "boolean-literal",
            value: true
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 44
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 44
            },
            kind: "boolean"
          },
          optional: false
        }]
      }],
      discriminantField: "run"
    }
  }], ["BuckWebSocketMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 49
    },
    name: "BuckWebSocketMessage",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 49
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 49
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 51
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 51
            },
            kind: "string-literal",
            value: "SocketConnected"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 52
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 53
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 53
            },
            kind: "string-literal",
            value: "BuildProgressUpdated"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 54
          },
          name: "progressValue",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 54
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 55
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 56
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 56
            },
            kind: "string-literal",
            value: "BuildFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 57
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 57
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 58
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 59
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 59
            },
            kind: "string-literal",
            value: "BuildStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 60
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 61
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 61
            },
            kind: "string-literal",
            value: "ConsoleEvent"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 62
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 62
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 63
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 63
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 64
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 64
                },
                kind: "union",
                types: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "OFF"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "SEVERE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "WARNING"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "INFO"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "CONFIG"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "FINE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "FINER"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "FINEST"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 64
                  },
                  kind: "string-literal",
                  value: "ALL"
                }]
              },
              optional: false
            }]
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 66
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 67
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 67
            },
            kind: "string-literal",
            value: "ParseStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 68
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 69
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 69
            },
            kind: "string-literal",
            value: "ParseFinished"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 70
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 71
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 71
            },
            kind: "string-literal",
            value: "InstallFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 72
          },
          name: "success",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 72
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 73
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 73
            },
            kind: "number"
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 74
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 75
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 75
            },
            kind: "string-literal",
            value: "RunStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 76
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 77
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 77
            },
            kind: "string-literal",
            value: "RunComplete"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 78
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 79
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 79
            },
            kind: "string-literal",
            value: "ResultsAvailable"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 80
          },
          name: "results",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 80
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 81
              },
              name: "buildTarget",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 81
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 82
                  },
                  name: "shortName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 82
                    },
                    kind: "string"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 83
                  },
                  name: "baseName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 83
                    },
                    kind: "string"
                  },
                  optional: false
                }]
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 85
              },
              name: "success",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 85
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 86
              },
              name: "failureCount",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 86
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 87
              },
              name: "totalNumberOfTests",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 87
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 88
              },
              name: "testCases",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 88
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 88
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 89
                    },
                    name: "success",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 89
                      },
                      kind: "boolean"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 90
                    },
                    name: "failureCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 90
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 91
                    },
                    name: "skippedCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 91
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 92
                    },
                    name: "testCaseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 92
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 93
                    },
                    name: "testResults",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 93
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 93
                        },
                        kind: "object",
                        fields: [{
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 94
                          },
                          name: "testCaseName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 94
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 95
                          },
                          name: "testName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 95
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 96
                          },
                          name: "type",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 96
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 97
                          },
                          name: "time",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 97
                            },
                            kind: "number"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 98
                          },
                          name: "message",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 98
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 99
                          },
                          name: "stacktrace",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 99
                            },
                            kind: "nullable",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 99
                              },
                              kind: "string"
                            }
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 100
                          },
                          name: "stdOut",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 100
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 101
                          },
                          name: "stdErr",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 101
                            },
                            kind: "string"
                          },
                          optional: false
                        }]
                      }
                    },
                    optional: false
                  }]
                }
              },
              optional: false
            }]
          },
          optional: false
        }]
      }],
      discriminantField: "type"
    }
  }], ["BaseBuckBuildOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 108
    },
    name: "BaseBuckBuildOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 108
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 109
        },
        name: "install",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 109
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 110
        },
        name: "test",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 110
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 111
        },
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 111
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 111
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 112
        },
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 112
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 112
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 114
        },
        name: "commandOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 114
          },
          kind: "named",
          name: "Object"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 115
        },
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 115
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 115
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["getRootForPath", {
    kind: "function",
    name: "getRootForPath",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 155
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 155
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 155
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 155
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["getBuildFile", {
    kind: "function",
    name: "getBuildFile",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 162
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 162
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 162
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "targetName",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 162
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 162
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 162
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 162
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getOwners", {
    kind: "function",
    name: "getOwners",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 227
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 227
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 228
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 229
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "kindFilter",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 230
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 230
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 231
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 231
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 231
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getBuckConfig", {
    kind: "function",
    name: "getBuckConfig",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 247
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 247
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 248
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "section",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 249
          },
          kind: "string"
        }
      }, {
        name: "property",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 250
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 251
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 251
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 251
            },
            kind: "string"
          }
        }
      }
    }
  }], ["build", {
    kind: "function",
    name: "build",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 285
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 285
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 286
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 287
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 287
            },
            kind: "string"
          }
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 288
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 288
            },
            kind: "named",
            name: "BaseBuckBuildOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 289
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 289
          },
          kind: "any"
        }
      }
    }
  }], ["install", {
    kind: "function",
    name: "install",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 304
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 304
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 305
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 306
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 306
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 307
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 307
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 308
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 308
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 309
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 309
          },
          kind: "any"
        }
      }
    }
  }], ["buildWithOutput", {
    kind: "function",
    name: "buildWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 366
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 366
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 367
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 368
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 368
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 369
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 369
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 370
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 370
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["testWithOutput", {
    kind: "function",
    name: "testWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 385
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 385
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 386
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 387
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 387
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 388
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 388
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 389
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 389
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["installWithOutput", {
    kind: "function",
    name: "installWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 404
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 404
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 405
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 406
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 406
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 407
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 407
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 408
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 408
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 409
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 409
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 410
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 410
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["listAliases", {
    kind: "function",
    name: "listAliases",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 486
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 486
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 486
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 486
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 486
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 486
            },
            kind: "string"
          }
        }
      }
    }
  }], ["resolveAlias", {
    kind: "function",
    name: "resolveAlias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 496
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 496
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 496
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 496
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 496
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 496
          },
          kind: "string"
        }
      }
    }
  }], ["showOutput", {
    kind: "function",
    name: "showOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 509
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 509
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 510
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 511
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 512
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 512
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 512
            },
            kind: "named",
            name: "Object"
          }
        }
      }
    }
  }], ["buildRuleTypeFor", {
    kind: "function",
    name: "buildRuleTypeFor",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 518
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 518
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 519
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 520
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 521
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 521
          },
          kind: "string"
        }
      }
    }
  }], ["getHTTPServerPort", {
    kind: "function",
    name: "getHTTPServerPort",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 550
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 550
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 551
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 552
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 552
          },
          kind: "number"
        }
      }
    }
  }], ["query", {
    kind: "function",
    name: "query",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 560
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 560
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 561
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 562
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 563
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 563
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 563
            },
            kind: "string"
          }
        }
      }
    }
  }], ["queryWithArgs", {
    kind: "function",
    name: "queryWithArgs",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 579
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 579
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 580
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 581
          },
          kind: "string"
        }
      }, {
        name: "args",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 582
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 582
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 583
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 583
          },
          kind: "object",
          fields: []
        }
      }
    }
  }], ["getWebSocketStream", {
    kind: "function",
    name: "getWebSocketStream",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 600
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 600
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 601
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 602
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 603
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 603
          },
          kind: "named",
          name: "Object"
        }
      }
    }
  }], ["ProcessExitMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 13
    },
    name: "ProcessExitMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "exit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 15
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "number"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 16
        },
        name: "signal",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 20
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 24
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 27
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 28
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            kind: "named",
            name: "Object"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["ProcessInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 31
    },
    name: "ProcessInfo",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 32
        },
        name: "parentPid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 34
        },
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }]])
});