import { useSyncExternalStore } from "react";

import { DataStore } from "./DataStore";
import { EntityStore } from "./EntityStore";
import { DataStoreType, EntityStoreType } from "./Types";

// BINDINGS IN ORDER STORES TO BE ABLE TO BE USED AS REACTIVE-STATE 

export function EntityStoreBinding<T extends Record<string,any>>(store:EntityStore<T>):EntityStoreType<T>{

  const data =  useSyncExternalStore(
        store.subscribe.bind(store),
        () => store.Get(),
        () => store.Get()
    );
    
    return {
        data,
        set: store.Set.bind(store),
        update: store.Update.bind(store),
        get:store.Get.bind(store),
        getByKey: store.GetByKey.bind(store),
        remove: store.Remove.bind(store),
        reset: store.Reset.bind(store),
    };
}
 
export function  DataStoreBinding<T>(store:DataStore<T>):DataStoreType<T>{
      const data =  useSyncExternalStore(
    
        store.subscribe.bind(store), 
        () => store.Get(),
        () => store.Get() 
      );
      
      return {
        data,
        set: store.Set.bind(store),
        add: store.Add.bind(store),
        update: store.Update.bind(store),
        getByKey: store.GetByKey.bind(store),
        remove: store.Remove.bind(store),
        reset: store.Reset.bind(store),
      };
}
