export interface StorageStructure<T> {
    Set: (data: T | any) => void;
    Get: () => T;
    Reset: () => void;
}

export interface AsyncStorageStructure<T> {
    Set: (data: T | any) => Promise<void>;
    Get: () => Promise<T>;
    Reset: () => Promise<void>;
    UpsertMany?: (data: any) => Promise<void>;
    DeleteManyByIds?: (ids: Array<string | number>) => Promise<void>;
}

export interface StorageType {
    [key: string]: StorageStructure<any>;
}


export class StorageManager {

    private storages:StorageType = {};

    public AddStore<T>(storeName:string,st:StorageStructure<T>){
        this.storages[storeName] = st;
    }

    public ClearAll = async () => {
        Object.entries(this.storages).forEach(([, value]) => {
            value.Reset();
        });
    };
}


