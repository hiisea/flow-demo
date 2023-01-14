function isObject(obj: any): Boolean {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

function __deepMerge(
  optimize: boolean | null,
  target: { [key: string]: any },
  inject: { [key: string]: any }
) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];
    if (isObject(val)) {
      if (isObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}
export function deepMerge(target: { [key: string]: any }, ...args: any[]): any {
  args = args.filter((item) => isObject(item) && Object.keys(item).length);
  if (args.length === 0) {
    return target;
  }
  if (!isObject(target)) {
    target = {};
  }
  args.forEach(function (inject, index) {
    let lastArg = false;
    let last2Arg: any = null;
    if (index === args.length - 1) {
      lastArg = true;
    } else if (index === args.length - 2) {
      last2Arg = args[index + 1];
    }
    Object.keys(inject).forEach(function (key) {
      const src = target[key];
      const val = inject[key];
      if (isObject(val)) {
        if (isObject(src)) {
          target[key] = __deepMerge(lastArg, src, val);
        } else {
          target[key] =
            lastArg || (last2Arg && !last2Arg[key])
              ? val
              : __deepMerge(lastArg, {}, val);
        }
      } else {
        target[key] = val;
      }
    });
  });
  return target;
}
