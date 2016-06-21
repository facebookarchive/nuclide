// flow-typed signature: 0cbf6b1b6fbc1b025b58ec06d5f2bb3f
// flow-typed version: b60fdb4c58/rxjs_v5.0.x/flow_>=v0.25.0

// FIXME(samgoldman) Remove top-level interface once Babel supports
// `declare interface` syntax.
// FIXME(samgoldman) Remove this once Subject<T> can mixin Observer<T>
interface rx$IObserver<-T> {
  next(value: T): mixed;
  error(error: any): mixed;
  complete(): mixed;
}

// FIXME: Technically at least one of these is required.
interface PartialObserver<-T> {
  next?: (value: T) => mixed;
  error?: (error: any) => mixed;
  complete?: () => mixed;
}

interface rx$ISubscription {
  unsubscribe(): void;
}

type TeardownLogic = rx$ISubscription | () => void;

declare module 'rxjs' {
  declare class Observable<+T> {
    // This is actually variadic, but we only support one or two other observables.
    static combineLatest<T, U>(t: Observable<T>, u: Observable<U>): Observable<[T, U]>;
    static combineLatest<T, U, V>(
      t: Observable<T>,
      u: Observable<U>,
      resultSelector: (t: T, u: U) => V,
    ): Observable<V>;
    static combineLatest<T, U, V>(
      t: Observable<T>,
      u: Observable<U>,
      v: Observable<V>,
    ): Observable<[T, U, V]>;
    static combineLatest<T, U, V, W>(
      t: Observable<T>,
      u: Observable<U>,
      v: Observable<V>,
      resultSelector: (t: T, u: U, v: V) => W,
    ): Observable<W>;

    static concat(...sources: Observable<T>[]): Observable<T>;

    static create(
      subscribe: (observer: Observer<T>) => rx$ISubscription | Function | void
    ): Observable<T>;

    static defer(observableFactory: () => Observable<T>): Observable<T>;

    static from(iterable: Iterable<T>): Observable<T>;

    static fromEvent(
      element: any,
      eventName: string,
      selector?: () => T,
    ): Observable<T>;

    static fromEventPattern(
      addHandler: (handler: () => void) => void,
      removeHandler: (handler: () => void) => void,
      selector?: () => T,
    ): Observable<T>;

    static fromPromise(promise: Promise<T>): Observable<T>;

    static empty<U>(): Observable<U>;

    static interval(period: number): Observable<number>;

    static merge<T, U>(
      source0: Observable<T>,
      source1: Observable<U>,
    ): Observable<T | U>;
    static merge<T, U, V>(
      source0: Observable<T>,
      source1: Observable<U>,
      source2: Observable<V>,
    ): Observable<T | U | V>;
    static merge(...sources: Observable<T>[]): Observable<T>;

    static never<U>(): Observable<U>;

    static of(...values: T[]): Observable<T>;

    static throw(error: any): Observable<any>;

    race(other: Observable<T>): Observable<T>;

    buffer(bufferBoundaries: Observable<any>): Observable<Array<T>>;

    cache(bufferSize?: number, windowTime?: number): Observable<T>;

    catch<U>(selector: (err: any, caught: Observable<T>) => Observable<U>): Observable<U>;

    // This is actually variadic, but we only support one or two other observables.
    combineLatest<U>(u: Observable<U>): Observable<[T, U]>;
    combineLatest<U, V>(u: Observable<U>, v: Observable<V>): Observable<[T, U, V]>;
    combineLatest<U, V>(
      u: Observable<U>,
      resultSelector: (t: T, u: U) => V,
    ): Observable<V>;
    combineLatest<U, V, W>(
      u: Observable<U>,
      v: Observable<V>,
      resultSelector: (t: T, u: U, v: V) => W,
    ): Observable<W>;

    // This is actually variadic, but we only support one or two other observables.
    withLatestFrom<U>(u: Observable<U>): Observable<[T, U]>;
    withLatestFrom<U, V>(u: Observable<U>, v: Observable<V>): Observable<[T, U, V]>;
    withLatestFrom<U, V>(
      u: Observable<U>,
      resultSelector: (t: T, u: U) => V,
    ): Observable<V>;
    withLatestFrom<U, V, W>(
      u: Observable<U>,
      v: Observable<V>,
      resultSelector: (t: T, u: U, v: V) => W,
    ): Observable<W>;

    concat(...sources: Observable<T>[]): Observable<T>;

    concatMap<U>(
      f: (value: T) => Observable<U> | Promise<U> | Iterable<U>
    ): Observable<U>;

    debounceTime(duration: number): Observable<T>;

    delay(dueTime: number): Observable<T>;

    distinctUntilChanged(compare?: (x: T, y: T) => boolean): Observable<T>;

    filter(predicate: (value: T) => boolean): Observable<T>;

    finally(f: () => mixed): Observable<T>;

    first(
      predicate?: (value: T, index: number, source: Observable<T>) => boolean,
    ): Observable<T>;
    first<U>(
      predicate: ?(value: T, index: number, source: Observable<T>) => boolean,
      resultSelector: (value: T, index: number) => U,
    ): Observable<U>;
    first<U>(
      predicate: ?(value: T, index: number, source: Observable<T>) => boolean,
      resultSelector: ?(value: T, index: number) => U,
      defaultValue: U,
    ): Observable<U>;

    groupBy(
      keySelector: (value: T) => mixed,
      elementSelector?: (value: T) => T,
      compare?: (x: T, y: T) => boolean,
    ): Observable<Observable<T>>;

    ignoreElements<U>(): Observable<U>;

    // Alias for `mergeMap`
    flatMap<U>(
      project: (value: T) => Observable<U> | Promise<U> | Iterable<U>
    ): Observable<U>;

    switchMap<U>(
      project: (value: T) => Observable<U> | Promise<U> | Iterable<U>
    ): Observable<U>;

    map<U>(f: (value: T) => U): Observable<U>;

    mapTo<U>(value: U): Observable<U>;

    merge(other: Observable<T>): Observable<T>;

    mergeAll(): T; // assumption: T is Observable

    mergeMap<U>(
      project: (value: T, index?: number) => Observable<U> | Promise<U> | Iterable<U>,
    ): Observable<U>;

    multicast(
      subjectOrSubjectFactory: Subject<T> | () => Subject<T>,
    ): ConnectableObservable<T>;

    publish(): ConnectableObservable<T>;

    publishLast(): ConnectableObservable<T>;

    reduce<U>(
      accumulator: (
        acc: U,
        currentValue: T,
        index: number,
        source: Observable<T>,
      ) => U,
      seed: U,
    ): Observable<U>;

    sample(notifier: Observable<any>): Observable<T>;

    sampleTime(delay: number): Observable<T>;

    publishReplay(): ConnectableObservable<T>;

    retry(retryCount: number): Observable<T>;

    retryWhen(notifier: (errors: Observable<Error>) => Observable<any>): Observable<T>;

    scan<U>(
      f: (acc: U, value: T) => U,
      initialValue: U,
    ): Observable<U>;

    share(): Observable<T>;

    skip(count: number): Observable<T>;

    skipUntil(other: Observable<any> | Promise<any>): Observable<T>;

    startWith(...values: Array<T>): Observable<T>;

    take(count: number): Observable<T>;

    takeUntil(other: Observable<any>): Observable<T>;

    takeWhile(f: (value: T) => boolean): Observable<T>;

    do(
      onNext?: (value: T) => mixed,
      onError?: (error: any) => mixed,
      onCompleted?: () => mixed,
    ): Observable<T>;
    do(observer: {
      next?: (value: T) => mixed;
      error?: (error: any) => mixed;
      complete?: () => mixed;
    }): Observable<T>;

    throttleTime(duration: number): Observable<T>;

    timeout(due: number | Date, errorToSend?: any): Observable<T>;

    toArray(): Observable<T[]>;

    toPromise(): Promise<T>;

    subscribe(observer: PartialObserver<T>): Subscription;
    subscribe(
      onNext: ?(value: T) => mixed,
      onError: ?(error: any) => mixed,
      onCompleted: ?() => mixed,
    ): Subscription;
  }

  declare class ConnectableObservable<T> extends Observable<T> {
    connect(): Subscription;
    refCount(): Observable<T>;
  }

  declare class Observer<T> {
    static create(
      onNext?: (value: T) => mixed,
      onError?: (error: any) => mixed,
      onCompleted?: () => mixed,
    ): Observer<T>;

    asObserver(): Observer<T>;

    next(value: T): mixed;

    error(error: any): mixed;

    complete(): mixed;
  }

  // FIXME(samgoldman) should be `mixins Observable<T>, Observer<T>`
  // once Babel parsing support exists: https://phabricator.babeljs.io/T6821
  declare class Subject<T> extends Observable<T> {
    asObservable(): Observable<T>;

    observers: Array<Observer<T>>;

    unsubscribe(): void;

    // Copied from Observer<T>
    next(value: T): mixed;
    error(error: any): mixed;
    complete(): mixed;

    // For use in subclasses only:
    _next(value: T): void;
    _subscribe(observer: PartialObserver<T>): Subscription;
  }

  declare class BehaviorSubject<T> extends Subject<T> {
    constructor(initialValue: T): void;

    getValue(): T;
  }

  declare class ReplaySubject<T> extends Subject<T> {

  }

  declare class Subscription {
    unsubscribe(): void;
    add(teardown: TeardownLogic): Subscription;
  }
}
