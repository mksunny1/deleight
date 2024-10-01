/**
 * Exports a {@link scope} function which creates a proxy object from
 * multiple objects so that they behave like they have been joined together
 * with `Object.assign`. Hover the object created here does not allocate
 * new memory to hold all the properties and it  'contains'  both the
 * enumerable and the non-enumerable properties.
 *
 * @module
 */
export declare function scope(objects: Iterable<any>): {
    objects: Iterable<any>;
};
