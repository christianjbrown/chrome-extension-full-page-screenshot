// A stand-in for a browser built-in that, like the real one, throws "Illegal
// invocation" when called with some other object as `this`, which is what
// happens when one is stored on an object and called as a method.
export function strictNative<A extends unknown[], R>(
  implementation: (...args: A) => R,
): (...args: A) => R {
  return function (this: unknown, ...args: A): R {
    if (this !== undefined && this !== globalThis) {
      throw new TypeError("Illegal invocation");
    }
    return implementation(...args);
  };
}
