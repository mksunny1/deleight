/**
 * Exports a {@link scope} function which creates a proxy object from
 * multiple objects so that they behave like they have been joined together
 * with `Object.assign`. Hover the object created here does not allocate
 * new memory to hold all the properties and it 'contains'  both
 * enumerable and the non-enumerable properties.
 *
 * @module
 */
export function scope(objects) {
    return new Proxy({ objects }, handler);
}
const handler = {
    get(target, p) {
        for (let object of target.objects) {
            if (Reflect.has(object, p))
                return object[p];
        }
    },
    ownKeys(target) {
        const result = new Set();
        for (let obj of target.objects)
            for (let key of Reflect.ownKeys(obj))
                result.add(typeof key === 'number' ? `${key}` : key);
        return [...result];
    }
};
