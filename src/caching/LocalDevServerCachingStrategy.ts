import { CommonCache } from 'playground-common/dist/cache';

class LocalDevServerCachingStrategy implements CommonCache {
    public async get(key: string) {
        return null;
    }

    public async set(key: string) {
        return null;
    }

    public async remove(key: string) {
        return null;
    }
}

export default LocalDevServerCachingStrategy;
