"use strict";
const channel = new WeakMap();
function check(O, slot) {
    if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
        throw new TypeError('`O` is not an object');
    }
    if (typeof slot !== 'string') {
        throw new TypeError('`slot` must be a string');
    }
}
function has(O, slot) {
    check(O, slot);
    const slots = channel.get(O);
    return !!slots && Object.hasOwn(slots, `$${slot}`);
}
function get(O, slot) {
    check(O, slot);
    const slots = channel.get(O);
    return slots === null || slots === void 0 ? void 0 : slots[`$${slot}`];
}
function set(O, slot, V) {
    check(O, slot);
    let slots = channel.get(O);
    if (!slots) {
        slots = {};
        channel.set(O, slots);
    }
    slots[`$${slot}`] = V;
}
function assert(O, slot) {
    check(O, slot);
    if (!channel.has(O)) {
        throw new TypeError('Side channel does not contain the given key');
    }
    if (!has(O, slot)) {
        throw new TypeError(`"${slot}" is not present on "O"`);
    }
}
module.exports = Object.freeze({ has, get, set, assert });

((typeof exports.default === 'object' && exports.default !== null) || typeof exports.default === 'function') && (Object.assign(exports.default,exports), module.exports = exports.default);
