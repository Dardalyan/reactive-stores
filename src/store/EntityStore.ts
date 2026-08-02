import { ReactiveStore } from "./ReactiveStore";

export class EntityStore<T extends Record<string, any>> extends ReactiveStore { 

    private entities:Map<string,T> = new Map<string,T>();
    private BASE_KEY:string = 'id'; 

    constructor(key?:string){
        super();
        if(key) this.BASE_KEY = key;
    }

    public Set(entity_list:T[]|Map<string,T>):void  {
        // In each operation that changes the object, a new reference needs to be created.
        const newEntities = new Map<string,T>();

        // function contol flow
        let entity_provided:boolean = !(entity_list == undefined || entity_list == null);  
        let is_array:boolean = false;
        let is_map:boolean = false;

        // if parameter is not provided then raise exception to inform client
        if(!entity_provided) throw new Error("Required parameter is not provied! Provided entities must be array or map.");

        // set type of provided parameter
        is_array =  Array.isArray(entity_list);
        is_map = (entity_list instanceof Map);

        // if provided parameter is an array of <T>
        if(is_array)
        {
            if((entity_list as T[]).some(e=> !(this.BASE_KEY in e))) throw new Error(`Specified key:${this.BASE_KEY} must exist in every member of provided array!`)
            
            // set new entity collection of map
            entity_list.forEach(e=>{
                newEntities.set(e[this.BASE_KEY],e);
            });
        }   
        // if provided parameter is an map of <T>
        else if(is_map)
        {
            let keys =   Array.from((entity_list as Map<string,T>).keys());
            let values = Array.from((entity_list as Map<string,T>).values());

            if(keys.length !== values.length) throw new Error("Invalid length of pairs! The keys and values length must be same for every map.");

            // key value control
            for(let index= 0; index< keys.length; index++)
            {
                // if provided key does not equal to value's 'BASE_KEY' property, then BASE_KEY or data provided is invalid! 
                if(keys[index] !== String(values[index][this.BASE_KEY])) throw new Error(`The Key:[${keys[index]}] does not equal to current object's ${this.BASE_KEY} property.`);
                else newEntities.set(keys[index],values[index]);
            }
        }
        // if provided parameter is none of array or map of <T>
        else
        {
           if(!entity_provided) throw new Error("Required parameter is not provied! Provided entities must be array or map.")
        }

        this.entities = newEntities;
        this.emit();
    }

    public Update(entity:T):void{
        // In each operation that changes the object, a new reference needs to be created.
        const newEntities = new Map<string,T>(this.entities);

        // if parameter is not provided, 
        // specified BASE_KEY not in the given parameter 
        // or the key of parameter not in the colelction, then raise error !
        if(!entity) throw new Error("Required parameter is not provied!");
        if(!(this.BASE_KEY in entity)) throw new Error(`The Key: ${this.BASE_KEY} not found in provided object.`);
        if(!newEntities.has(String(entity[this.BASE_KEY]))) throw new Error(`The Key: ${entity[this.BASE_KEY]} does not exist in collection of map.`);

        // update the netity with parameter['BASE_KEY']
        newEntities.set(String(entity[this.BASE_KEY]),entity);

        this.entities = newEntities;
        this.emit();
    }

    public GetByKey(key:string):T|undefined{
        return this.entities.get(key);
    }

    public Get():Map<string,T>{
        return this.entities;
    }

    public Remove(params:string|T|string[]|T[]):void{
        // In each operation that changes the object, a new reference needs to be created.
        const newEntities = new Map<string,T>(this.entities);
        
        if(Array.isArray(params))
        {
            // type check collection
            let str_list:string[] = [];
            let t_list:T[] = [];

            // control flow seperation
            (params as T[]|string[]).forEach(p=>{
                if(typeof p === 'string') str_list.push(p as string);
                else t_list.push(p as T);
            });

            if(t_list.length > 0 && !t_list.every(t=> this.BASE_KEY in t)) throw new Error(`The Key: ${this.BASE_KEY} must exist in provided collection!`);
            
            str_list.forEach(s=>newEntities.delete(s));
            t_list.forEach(t=>newEntities.delete(String(t[this.BASE_KEY]))); 
        }
        else
        {
            if(typeof params === 'string')
            {
                newEntities.delete(params);
            }  
            else{
                if(!(this.BASE_KEY in params)) throw new Error(`The Key: ${this.BASE_KEY} must exist in provided object!`);
                else newEntities.delete(String(params[this.BASE_KEY]));
            }       
        }

        this.entities = newEntities; 
        this.emit(); 
    } 

    public Reset():void{
        const newEntities = new Map<string,T>();
        this.entities = newEntities;
        this.emit();
    }
}
