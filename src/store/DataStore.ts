import { ReactiveStore } from "./ReactiveStore";

export class DataStore<T> extends ReactiveStore{

    private data:Map<string,T> = new Map<string,T>();

    public Set(payload:Map<any,any>):void  {
        // In each operation that changes the object, a new reference needs to be created.
        const newData = new Map<string,T>();

        // extract keys
        const keys = Array.from(payload.keys()); 
        // if at least one key is not a string, then raise an error!
        if(keys.some(k=>typeof k !== 'string')) throw new Error("Keys must be string!");

        payload.forEach((value, key) => {
            newData.set(key, value); 
        });

        this.data = newData; 
        this.emit();
    }

     public Add(key:string,value:T):void{
        // In each operation that changes the object, a new reference needs to be created.
        const newData = new Map<string,T>(this.data);

        // key control, if it is found in the colelction, it will not be updated and an Error will occured! 
        // Update() must be called to update existing data
        if(newData.has(key)) throw new Error(`The key:${key} already exist! Please use 'Update(key:string,value:T)' to update data.`);
        newData.set(key,value);

        this.data = newData;
        this.emit();
    }

    public Update(key:string,value:T):void{
        // In each operation that changes the object, a new reference needs to be created.
        const newData = new Map<string,T>(this.data);
        
        // key control, if it is not found in the colelction, it wii not be updated and an Error will occured!
        if(!newData.has(key)) throw new Error(`The key:${key} not found in data!`);
        newData.set(key,value);

        this.data = newData;
        this.emit();
    }

    public GetByKey(key:string):T|undefined{
        return this.data.get(key);
    }

    public Get():Map<string,T>{
        return this.data;
    }

    public Remove(params:string|string[]):void{
        // In each operation that changes the object, a new reference needs to be created.
        const newData = new Map<string,T>(this.data);

        // type control flow
        if(Array.isArray(params))
        {
            if(params.some(p=>typeof p != 'string')) throw new Error("Keys must be string!");
            params.forEach(p=>newData.delete(p));
        }
        else
        {
            if(typeof params !== 'string')throw new Error("Keys must be string!");
            newData.delete(params); 
                 
        }

        this.data = newData;
        this.emit();
    }

    public Reset():void{
        this.data = new Map<string,T>();
        this.emit();
    }
}


