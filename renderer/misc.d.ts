/**
 * Nullable (aka. maybe) type
 */
declare type Nullable<T> = T | null;

/**
 * Make value as never type if the key is not found in an object
 */
type Impossible<K extends keyof any> = {
  [P in K]: never;
};

/**
 * Disallow extra properties
 */
type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

/**
 * Make sure U is a subset of T, then returns U as new type
 */
declare type Subset<T extends NoExtraProperties<T, U>, U> = U;
