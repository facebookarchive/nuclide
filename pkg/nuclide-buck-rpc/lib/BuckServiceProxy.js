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
          line: 187
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
          line: 187
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 187
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
          line: 195
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
          line: 196
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
          line: 197
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 197
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
          line: 265
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
          line: 266
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
          line: 267
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 267
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
          line: 268
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 268
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
          line: 285
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
          line: 286
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 287
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
          line: 288
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 288
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
          line: 323
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
          line: 324
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 324
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
          line: 325
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 325
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
          line: 326
        },
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 342
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
          line: 343
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 343
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
          line: 344
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 344
          },
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 345
        },
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 346
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/install", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 347
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
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 408
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 424
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
          line: 425
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 425
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
          line: 426
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 426
          },
          kind: "string"
        }
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 427
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/testWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 428
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 448
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
          line: 449
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 449
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
          line: 450
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 450
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
          line: 451
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 451
          },
          kind: "string"
        }
      }
    }, {
      name: "run",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 452
        },
        kind: "boolean"
      }
    }, {
      name: "debug",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 453
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/installWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 454
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.runWithOutput = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 465
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
          line: 466
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 466
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
          line: 467
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 467
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
          line: 468
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 468
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/runWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 469
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
          line: 563
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
          line: 564
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 564
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.listFlavors = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 572
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 573
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 573
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listFlavors", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 574
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 574
          },
          kind: "named",
          name: "Object"
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
          line: 588
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
          line: 589
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
          line: 590
        },
        kind: "string"
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 604
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
          line: 605
        },
        kind: "string"
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 606
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 606
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 606
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/showOutput", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 607
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 607
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
          line: 616
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasesOrTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 617
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
          line: 618
        },
        kind: "named",
        name: "ResolvedRuleType"
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
          line: 706
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
          line: 706
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
          line: 735
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
          line: 736
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
          line: 737
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 737
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
          line: 754
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
          line: 755
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 756
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 756
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
          line: 757
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
          line: 777
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
          line: 778
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
          line: 779
        },
        kind: "named",
        name: "Object"
      });
    }).publish();
  };

  remoteModule.getLastCommandInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 791
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getLastCommandInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 792
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 792
          },
          kind: "named",
          name: "CommandInfo"
        }
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
    BuckWebSocketMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 38
      },
      name: "BuckWebSocketMessage",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 39
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 39
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 41
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 41
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
            line: 43
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 44
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 44
              },
              kind: "string-literal",
              value: "BuildProgressUpdated"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 45
            },
            name: "progressValue",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 45
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 47
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 48
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 48
              },
              kind: "string-literal",
              value: "BuildFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 49
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 49
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 51
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 52
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 52
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
            line: 54
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 55
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 55
              },
              kind: "string-literal",
              value: "ConsoleEvent"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 56
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 56
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 57
            },
            name: "level",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 57
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 58
                },
                name: "name",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 59
                  },
                  kind: "union",
                  types: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 59
                    },
                    kind: "string-literal",
                    value: "OFF"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 60
                    },
                    kind: "string-literal",
                    value: "SEVERE"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 61
                    },
                    kind: "string-literal",
                    value: "WARNING"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 62
                    },
                    kind: "string-literal",
                    value: "INFO"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 63
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
                      line: 65
                    },
                    kind: "string-literal",
                    value: "FINER"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 66
                    },
                    kind: "string-literal",
                    value: "FINEST"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 67
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
              value: "ParseStarted"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 73
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 74
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 74
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
              value: "InstallFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 78
            },
            name: "success",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 78
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 79
            },
            name: "pid",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 79
              },
              kind: "number"
            },
            optional: true
          }]
        }, {
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
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 82
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
            line: 84
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 85
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 85
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
            line: 87
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 88
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 88
              },
              kind: "string-literal",
              value: "ResultsAvailable"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 89
            },
            name: "results",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 89
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 90
                },
                name: "buildTarget",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 90
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 91
                    },
                    name: "shortName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 91
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 92
                    },
                    name: "baseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 92
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
                  line: 94
                },
                name: "success",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 94
                  },
                  kind: "boolean"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 95
                },
                name: "failureCount",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 95
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 96
                },
                name: "totalNumberOfTests",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 96
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 97
                },
                name: "testCases",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 97
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 97
                    },
                    kind: "object",
                    fields: [{
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 98
                      },
                      name: "success",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 98
                        },
                        kind: "boolean"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 99
                      },
                      name: "failureCount",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 99
                        },
                        kind: "number"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 100
                      },
                      name: "skippedCount",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 100
                        },
                        kind: "number"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 101
                      },
                      name: "testCaseName",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 101
                        },
                        kind: "string"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 102
                      },
                      name: "testResults",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 102
                        },
                        kind: "array",
                        type: {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 102
                          },
                          kind: "object",
                          fields: [{
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 103
                            },
                            name: "testCaseName",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 103
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 104
                            },
                            name: "testName",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 104
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 105
                            },
                            name: "type",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 105
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 106
                            },
                            name: "time",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 106
                              },
                              kind: "number"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 107
                            },
                            name: "message",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 107
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 108
                            },
                            name: "stacktrace",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 108
                              },
                              kind: "nullable",
                              type: {
                                location: {
                                  type: "source",
                                  fileName: "BuckService.js",
                                  line: 108
                                },
                                kind: "string"
                              }
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 109
                            },
                            name: "stdOut",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 109
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 110
                            },
                            name: "stdErr",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 110
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
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 115
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 116
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 116
              },
              kind: "string-literal",
              value: "CompilerErrorEvent"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 117
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 117
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 118
            },
            name: "suggestions",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 118
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 118
                },
                kind: "mixed"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 119
            },
            name: "compilerType",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 119
              },
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    BaseBuckBuildOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 123
      },
      name: "BaseBuckBuildOptions",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 123
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 124
          },
          name: "install",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 124
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 125
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 125
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 126
          },
          name: "test",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 126
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 127
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 127
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 128
          },
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 128
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 128
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 130
          },
          name: "commandOptions",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 130
            },
            kind: "named",
            name: "Object"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 131
          },
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 131
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 131
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    CommandInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 143
      },
      name: "CommandInfo",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 143
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 144
          },
          name: "timestamp",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 144
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 145
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 145
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 146
          },
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 146
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 146
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ResolvedBuildTarget: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 149
      },
      name: "ResolvedBuildTarget",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 149
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 150
          },
          name: "qualifiedName",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 150
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 151
          },
          name: "flavors",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 151
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 151
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ResolvedRuleType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 154
      },
      name: "ResolvedRuleType",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 154
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 155
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 155
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 156
          },
          name: "buildTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 156
            },
            kind: "named",
            name: "ResolvedBuildTarget"
          },
          optional: false
        }]
      }
    },
    getRootForPath: {
      kind: "function",
      name: "getRootForPath",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 187
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 187
        },
        kind: "function",
        argumentTypes: [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 187
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 187
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 187
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 187
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    getBuildFile: {
      kind: "function",
      name: "getBuildFile",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 194
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 194
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 195
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
              line: 196
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 197
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 197
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 197
              },
              kind: "string"
            }
          }
        }
      }
    },
    getOwners: {
      kind: "function",
      name: "getOwners",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 264
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 264
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 265
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
              line: 266
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
              line: 267
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 267
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 268
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 268
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 268
              },
              kind: "string"
            }
          }
        }
      }
    },
    getBuckConfig: {
      kind: "function",
      name: "getBuckConfig",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 284
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 284
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 285
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
              line: 286
            },
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 287
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 288
          },
          kind: "promise",
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
              kind: "string"
            }
          }
        }
      }
    },
    build: {
      kind: "function",
      name: "build",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 322
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 322
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 323
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
              line: 324
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 324
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
              line: 325
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 325
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
            line: 326
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 326
            },
            kind: "any"
          }
        }
      }
    },
    install: {
      kind: "function",
      name: "install",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 341
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 341
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 342
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
              line: 343
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 343
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
              line: 344
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 344
              },
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 345
            },
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 346
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 347
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 347
            },
            kind: "any"
          }
        }
      }
    },
    buildWithOutput: {
      kind: "function",
      name: "buildWithOutput",
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
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 408
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 408
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    testWithOutput: {
      kind: "function",
      name: "testWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 423
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 423
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 424
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
              line: 425
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 425
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
              line: 426
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 426
              },
              kind: "string"
            }
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 427
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 428
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 428
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    installWithOutput: {
      kind: "function",
      name: "installWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 447
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 447
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 448
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
              line: 449
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 449
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
              line: 450
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 450
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
              line: 451
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 451
              },
              kind: "string"
            }
          }
        }, {
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 452
            },
            kind: "boolean"
          }
        }, {
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 453
            },
            kind: "boolean"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 454
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 454
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    runWithOutput: {
      kind: "function",
      name: "runWithOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 464
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 464
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 465
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
              line: 466
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 466
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
              line: 467
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 467
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
              line: 468
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 468
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 469
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 469
            },
            kind: "named",
            name: "ProcessMessage"
          }
        }
      }
    },
    listAliases: {
      kind: "function",
      name: "listAliases",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 562
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 562
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 563
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 564
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 564
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 564
              },
              kind: "string"
            }
          }
        }
      }
    },
    listFlavors: {
      kind: "function",
      name: "listFlavors",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 571
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 571
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 572
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "targets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 573
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 573
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 574
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 574
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 574
              },
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    resolveAlias: {
      kind: "function",
      name: "resolveAlias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 587
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 587
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 588
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
              line: 589
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 590
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 590
            },
            kind: "string"
          }
        }
      }
    },
    showOutput: {
      kind: "function",
      name: "showOutput",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 603
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 603
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 604
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
              line: 605
            },
            kind: "string"
          }
        }, {
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 606
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 606
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 606
                },
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 607
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 607
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 607
              },
              kind: "named",
              name: "Object"
            }
          }
        }
      }
    },
    buildRuleTypeFor: {
      kind: "function",
      name: "buildRuleTypeFor",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 615
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 615
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 616
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "aliasesOrTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 617
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 618
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 618
            },
            kind: "named",
            name: "ResolvedRuleType"
          }
        }
      }
    },
    getHTTPServerPort: {
      kind: "function",
      name: "getHTTPServerPort",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 706
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 706
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 706
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 706
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 706
            },
            kind: "number"
          }
        }
      }
    },
    query: {
      kind: "function",
      name: "query",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 734
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 734
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 735
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
              line: 736
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 737
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 737
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 737
              },
              kind: "string"
            }
          }
        }
      }
    },
    queryWithArgs: {
      kind: "function",
      name: "queryWithArgs",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 753
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 753
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 754
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
              line: 755
            },
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 756
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 756
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 757
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 757
            },
            kind: "object",
            fields: []
          }
        }
      }
    },
    getWebSocketStream: {
      kind: "function",
      name: "getWebSocketStream",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 776
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 776
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 777
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
              line: 778
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 779
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 779
            },
            kind: "named",
            name: "Object"
          }
        }
      }
    },
    getLastCommandInfo: {
      kind: "function",
      name: "getLastCommandInfo",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 790
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 790
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 791
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 792
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 792
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 792
              },
              kind: "named",
              name: "CommandInfo"
            }
          }
        }
      }
    },
    ProcessExitMessage: {
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
    },
    ProcessMessage: {
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
    },
    ProcessInfo: {
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
    }
  }
});