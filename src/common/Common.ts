export class MapUtils {
    static filter<K, V>(map: Map<K, V>, predicate: (k: K, v: V) => boolean) {
        const aMap = new Map<K, V>();
        if (map == undefined || map == null) {
            return aMap;
        }
        const entries = Array.from(map.entries());
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
        const aSet = new Set<V>();
        if (set == undefined || set == null) {
            return aSet;
        }
        const entries = Array.from(set.entries());
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
