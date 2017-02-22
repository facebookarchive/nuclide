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
          line: 168
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
          line: 168
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 168
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
          line: 175
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
          line: 175
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
          line: 175
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 175
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
          line: 241
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
          line: 242
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
          line: 243
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 243
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
          line: 244
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 244
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
          line: 261
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
          line: 262
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 263
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
          line: 264
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 264
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
          line: 299
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
          line: 300
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 300
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
          line: 301
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 301
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
          line: 302
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
          line: 318
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
          line: 319
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 319
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
          line: 320
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 320
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
          line: 321
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 321
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
          line: 322
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
          line: 380
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
          line: 381
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 381
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
          line: 382
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 382
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
          line: 383
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
          line: 399
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
          line: 400
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 400
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
          line: 401
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 401
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
          line: 402
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
          line: 418
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
          line: 419
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 419
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
          line: 420
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 420
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
          line: 421
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 421
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
          line: 422
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 422
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
          line: 423
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.runWithOutput = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 433
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
          line: 434
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 434
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
          line: 435
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 435
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
          line: 436
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 436
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
          line: 437
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 437
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/runWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 438
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
          line: 517
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
          line: 517
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 517
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
          line: 525
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
          line: 526
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 526
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
          line: 527
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 527
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
          line: 540
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
          line: 540
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
          line: 540
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
          line: 554
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
          line: 555
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
          line: 556
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 556
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
          line: 563
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
          line: 564
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
          line: 565
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
          line: 600
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
          line: 601
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
          line: 610
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
          line: 611
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
          line: 612
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 612
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
          line: 629
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
          line: 630
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 631
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 631
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
          line: 632
        },
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.resolveBuildTargetName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "buckRoot",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 648
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "nameOrAlias",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 649
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/resolveBuildTargetName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 650
        },
        kind: "named",
        name: "ResolvedBuildTarget"
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
          line: 666
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
          line: 667
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
          line: 668
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
          line: 679
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
          line: 679
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 679
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
    dontRunOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 39
      },
      name: "dontRunOptions",
      definition: {
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
            line: 40
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 40
            },
            kind: "boolean-literal",
            value: false
          },
          optional: false
        }]
      }
    },
    doRunOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 43
      },
      name: "doRunOptions",
      definition: {
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
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 44
            },
            kind: "boolean-literal",
            value: true
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 45
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 45
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    BuckRunOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 48
      },
      name: "BuckRunOptions",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 48
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
              line: 40
            },
            name: "run",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 40
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
            line: 43
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 44
            },
            name: "run",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 44
              },
              kind: "boolean-literal",
              value: true
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 45
            },
            name: "debug",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 45
              },
              kind: "boolean"
            },
            optional: false
          }]
        }],
        discriminantField: "run"
      }
    },
    BuckWebSocketMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 50
      },
      name: "BuckWebSocketMessage",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 50
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 50
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
              value: "SocketConnected"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 53
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 54
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 54
              },
              kind: "string-literal",
              value: "BuildProgressUpdated"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 55
            },
            name: "progressValue",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 55
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 56
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 57
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 57
              },
              kind: "string-literal",
              value: "BuildFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 58
            },
            name: "exitCode",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 58
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 59
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 60
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 60
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
            line: 61
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 62
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 62
              },
              kind: "string-literal",
              value: "ConsoleEvent"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 63
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 63
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 64
            },
            name: "level",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 64
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 65
                },
                name: "name",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 65
                  },
                  kind: "union",
                  types: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "OFF"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "SEVERE"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "WARNING"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "INFO"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
                    },
                    kind: "string-literal",
                    value: "CONFIG"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
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
                      line: 65
                    },
                    kind: "string-literal",
                    value: "FINEST"
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 65
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
            line: 67
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 68
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 68
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
            line: 69
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 70
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 70
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
            line: 71
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 72
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 72
              },
              kind: "string-literal",
              value: "InstallFinished"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 73
            },
            name: "success",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 73
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 74
            },
            name: "pid",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 74
              },
              kind: "number"
            },
            optional: true
          }]
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 75
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 76
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 76
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
            line: 77
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 78
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 78
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
            line: 79
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 80
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 80
              },
              kind: "string-literal",
              value: "ResultsAvailable"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 81
            },
            name: "results",
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
                name: "buildTarget",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 82
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 83
                    },
                    name: "shortName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 83
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 84
                    },
                    name: "baseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 84
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
                  line: 86
                },
                name: "success",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 86
                  },
                  kind: "boolean"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 87
                },
                name: "failureCount",
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
                name: "totalNumberOfTests",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 88
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 89
                },
                name: "testCases",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 89
                  },
                  kind: "array",
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
                      name: "success",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 90
                        },
                        kind: "boolean"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 91
                      },
                      name: "failureCount",
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
                      name: "skippedCount",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 92
                        },
                        kind: "number"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 93
                      },
                      name: "testCaseName",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 93
                        },
                        kind: "string"
                      },
                      optional: false
                    }, {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 94
                      },
                      name: "testResults",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 94
                        },
                        kind: "array",
                        type: {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 94
                          },
                          kind: "object",
                          fields: [{
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 95
                            },
                            name: "testCaseName",
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
                            name: "testName",
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
                            name: "type",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 97
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 98
                            },
                            name: "time",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 98
                              },
                              kind: "number"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 99
                            },
                            name: "message",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 99
                              },
                              kind: "string"
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 100
                            },
                            name: "stacktrace",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 100
                              },
                              kind: "nullable",
                              type: {
                                location: {
                                  type: "source",
                                  fileName: "BuckService.js",
                                  line: 100
                                },
                                kind: "string"
                              }
                            },
                            optional: false
                          }, {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 101
                            },
                            name: "stdOut",
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
                            name: "stdErr",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 102
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
    },
    BaseBuckBuildOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 109
      },
      name: "BaseBuckBuildOptions",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 109
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 110
          },
          name: "install",
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
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 111
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 112
          },
          name: "test",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 112
            },
            kind: "boolean"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 113
          },
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 113
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 113
              },
              kind: "string"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 114
          },
          name: "runOptions",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 114
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 114
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
            line: 116
          },
          name: "commandOptions",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 116
            },
            kind: "named",
            name: "Object"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 117
          },
          name: "extraArguments",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 117
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 117
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
        line: 129
      },
      name: "CommandInfo",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 129
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 130
          },
          name: "timestamp",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 130
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 131
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 131
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 132
          },
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 132
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 132
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
        line: 135
      },
      name: "ResolvedBuildTarget",
      definition: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 135
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 136
          },
          name: "qualifiedName",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 136
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 137
          },
          name: "flavors",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 137
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 137
              },
              kind: "string"
            }
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
        line: 168
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 168
        },
        kind: "function",
        argumentTypes: [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 168
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 168
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 168
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 168
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
        line: 175
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 175
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 175
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
              line: 175
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 175
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 175
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 175
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
        line: 240
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 240
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 241
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
              line: 242
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
              line: 243
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 243
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 244
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 244
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 244
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
        line: 260
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 260
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 261
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
              line: 262
            },
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 263
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 264
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 264
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 264
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
        line: 298
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 298
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 299
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
              line: 300
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 300
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
              line: 301
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 301
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
            line: 302
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 302
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
        line: 317
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 317
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 318
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
              line: 319
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 319
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
              line: 320
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 320
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
              line: 321
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 321
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
            line: 322
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 322
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
        line: 379
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 379
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 380
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
              line: 381
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 381
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
              line: 382
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 382
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 383
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 383
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
        line: 398
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 398
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 399
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
              line: 400
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 400
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
              line: 401
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 401
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 402
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 402
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
        line: 417
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 417
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 418
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
              line: 419
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 419
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
              line: 420
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 420
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
              line: 421
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 421
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
              line: 422
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 422
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
            line: 423
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 423
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
        line: 432
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 432
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 433
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
              line: 434
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 434
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
              line: 435
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 435
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
              line: 436
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 436
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
              line: 437
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 437
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
            line: 438
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 438
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
        line: 517
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 517
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 517
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 517
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 517
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 517
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
        line: 524
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 524
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 525
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
              line: 526
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 526
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 527
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 527
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 527
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
        line: 540
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 540
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 540
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
              line: 540
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 540
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 540
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
        line: 553
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 553
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 554
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
              line: 555
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 556
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 556
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 556
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
        }, {
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 564
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 565
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 565
            },
            kind: "string"
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
        line: 599
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 599
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 600
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 601
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 601
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
        line: 609
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 609
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 610
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
              line: 611
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 612
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 612
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 612
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
        line: 628
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 628
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 629
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
              line: 630
            },
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 631
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 631
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 632
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 632
            },
            kind: "object",
            fields: []
          }
        }
      }
    },
    resolveBuildTargetName: {
      kind: "function",
      name: "resolveBuildTargetName",
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 647
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 647
        },
        kind: "function",
        argumentTypes: [{
          name: "buckRoot",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 648
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "nameOrAlias",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 649
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 650
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 650
            },
            kind: "named",
            name: "ResolvedBuildTarget"
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
        line: 665
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 665
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 666
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
              line: 667
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 668
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 668
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
        line: 679
      },
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 679
        },
        kind: "function",
        argumentTypes: [{
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 679
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 679
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 679
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 679
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