"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceManager {
    constructor(container) {
        this.container = container;
    }
    // tslint:disable-next-line:no-any
    add(serviceIdentifier, constructor, name) {
        if (name) {
            this.container.bind(serviceIdentifier).to(constructor).whenTargetNamed(name);
        }
        else {
            this.container.bind(serviceIdentifier).to(constructor);
        }
    }
    // tslint:disable-next-line:no-any
    addFactory(factoryIdentifier, factoryMethod) {
        this.container.bind(factoryIdentifier).toFactory(factoryMethod);
    }
    // tslint:disable-next-line:no-any
    addSingleton(serviceIdentifier, constructor, name) {
        if (name) {
            this.container.bind(serviceIdentifier).to(constructor).inSingletonScope().whenTargetNamed(name);
        }
        else {
            this.container.bind(serviceIdentifier).to(constructor).inSingletonScope();
        }
    }
    // tslint:disable-next-line:no-any
    addSingletonInstance(serviceIdentifier, instance, name) {
        if (name) {
            this.container.bind(serviceIdentifier).toConstantValue(instance).whenTargetNamed(name);
        }
        else {
            this.container.bind(serviceIdentifier).toConstantValue(instance);
        }
    }
    get(serviceIdentifier, name) {
        return name ? this.container.getNamed(serviceIdentifier, name) : this.container.get(serviceIdentifier);
    }
    getAll(serviceIdentifier, name) {
        return name ? this.container.getAllNamed(serviceIdentifier, name) : this.container.getAll(serviceIdentifier);
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=serviceManager.js.map