import { openDB } from 'idb';

const dbPromise = openDB('SampleDB', 1, {
    upgrade(db) {
        db.createObjectStore('name');
    },
});

export async function get(key) {
    return (await dbPromise).get('name', key);
}
export async function set(key, val) {
    return (await dbPromise).put('name', val, key);
}
export async function del(key) {
    return (await dbPromise).delete('name', key);
}
export async function clear() {
    return (await dbPromise).clear('name');
}
export async function keys() {
    return (await dbPromise).getAllKeys('name');
}