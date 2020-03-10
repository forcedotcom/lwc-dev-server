export class MapUtils {
    static filter<K, V>(map: Map<K, V>, predicate: (k: K, v: V) => boolean) {
        const entries = Array.from(map.entries());
        const aMap = new Map<K, V>();
        for (let [key, value] of entries) {
            if (predicate(key, value) == true) {
                aMap.set(key, value);
            }
        }
        return aMap;
    }
}

export class SetUtils {
    static filter<V>(set: Set<V>, predicate: (v: V) => boolean) {
        const entries = Array.from(set.entries());
        const aSet = new Set<V>();
        for (const [value] of entries) {
            if (predicate(value) == true) aSet.add(value);
        }
        return aSet;
    }
}

export class CommandLineUtils {
    static platformFlagIsIOS(input: string): boolean {
        return input != undefined && input.toLowerCase() == 'ios';
    }

    static platformFlagIsAndroid(input: string): boolean {
        return input != undefined && input.toLowerCase() == 'android';
    }
}
