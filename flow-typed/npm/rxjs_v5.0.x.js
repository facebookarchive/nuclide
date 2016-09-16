// flow-typed signature: 338686efdbe8909225901d17ef85165f
// flow-typed version: 97ff8d7751/rxjs_v5.0.x/flow_>=v0.29.0

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

    concat(...sources: Observable<T>[]): Observable<T>;

    concatMap<U>(
      f: (value: T) => Observable<U> | Promise<U> | Iterable<U>
    ): Observable<U>;

    debounceTime(duration: number): Observable<T>;

    delay(dueTime: number): Observable<T>;

    distinctUntilChanged(compare?: (x: T, y: T) => boolean): Observable<T>;

    elementAt(index: number, defaultValue?: T): Observable<T>;

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

    static combineLatest<A, B>(
      a: Observable<A>,
      resultSelector: (a: A) => B,
    ): Observable<B>;

    static combineLatest<A, B, C>(
      a: Observable<A>,
      b: Observable<B>,
      resultSelector: (a: A, b: B) => C,
    ): Observable<C>;

    static combineLatest<A, B, C, D>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      resultSelector: (a: A, b: B, c: C) => D,
    ): Observable<D>;

    static combineLatest<A, B, C, D, E>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      resultSelector: (a: A, b: B, c: C, d: D) => E,
    ): Observable<E>;

    static combineLatest<A, B, C, D, E, F>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E) => F,
    ): Observable<F>;

    static combineLatest<A, B, C, D, E, F, G>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F) => G,
    ): Observable<G>;

    static combineLatest<A, B, C, D, E, F, G, H>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      g: Observable<G>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H,
    ): Observable<H>;

    static combineLatest<A, B>(
      a: Observable<A>,
      b: Observable<B>,
    ): Observable<[A, B]>;

    static combineLatest<A, B, C>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
    ): Observable<[A, B, C]>;

    static combineLatest<A, B, C, D>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
    ): Observable<[A, B, C, D]>;

    static combineLatest<A, B, C, D, E>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
    ): Observable<[A, B, C, D, E]>;

    static combineLatest<A, B, C, D, E, F>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
    ): Observable<[A, B, C, D, E, F]>;

    static combineLatest<A, B, C, D, E, F, G>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      g: Observable<G>,
    ): Observable<[A, B, C, D, E, F, G]>;

    static combineLatest<A, B, C, D, E, F, G, H>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      g: Observable<G>,
      h: Observable<H>,
    ): Observable<[A, B, C, D, E, F, G, H]>;

    combineLatest<A>(
      a: Observable<A>
    ): Observable<[T, A]>;

    combineLatest<A, B>(
      a: Observable<A>,
      resultSelector: (a: A) => B,
    ): Observable<B>;

    combineLatest<A, B, C>(
      a: Observable<A>,
      b: Observable<B>,
      resultSelector: (a: A, b: B) => C,
    ): Observable<C>;

    combineLatest<A, B, C, D>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      resultSelector: (a: A, b: B, c: C) => D,
    ): Observable<D>;

    combineLatest<A, B, C, D, E>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      resultSelector: (a: A, b: B, c: C, d: D) => E,
    ): Observable<E>;

    combineLatest<A, B, C, D, E, F>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E) => F,
    ): Observable<F>;

    combineLatest<A, B, C, D, E, F, G>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F) => G,
    ): Observable<G>;

    combineLatest<A, B, C, D, E, F, G, H>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      g: Observable<G>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H,
    ): Observable<H>;

    withLatestFrom<A>(
      a: Observable<A>
    ): Observable<[T, A]>;

    withLatestFrom<A, B>(
      a: Observable<A>,
      resultSelector: (a: A) => B,
    ): Observable<B>;

    withLatestFrom<A, B, C>(
      a: Observable<A>,
      b: Observable<B>,
      resultSelector: (a: A, b: B) => C,
    ): Observable<C>;

    withLatestFrom<A, B, C, D>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      resultSelector: (a: A, b: B, c: C) => D,
    ): Observable<D>;

    withLatestFrom<A, B, C, D, E>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      resultSelector: (a: A, b: B, c: C, d: D) => E,
    ): Observable<E>;

    withLatestFrom<A, B, C, D, E, F>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E) => F,
    ): Observable<F>;

    withLatestFrom<A, B, C, D, E, F, G>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F) => G,
    ): Observable<G>;

    withLatestFrom<A, B, C, D, E, F, G, H>(
      a: Observable<A>,
      b: Observable<B>,
      c: Observable<C>,
      d: Observable<D>,
      e: Observable<E>,
      f: Observable<F>,
      g: Observable<G>,
      resultSelector: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => H,
    ): Observable<H>;
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
