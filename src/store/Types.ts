export type DataStoreType<T> = {
    data: Map<string, T>;
    set: (payload: Map<string, T>) => void;
    add: (key: string, value: T) => void;
    update: (key: string, value: T) => void;
    getByKey: (key: string) => T | undefined;
    remove: (params: string | string[]) => void;
    reset: () => void;
};

export type EntityStoreType<T> = {
    data: Map<string, T>;
    set: (payload: T[]|Map<string, T>) => void;
    update: (entity:T) => void;
    get:()=>Map<string,T>;
    getByKey: (key: string) => T | undefined;
    remove: (params: string | string[]) => void;
    reset: () => void;
};