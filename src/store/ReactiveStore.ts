
export type Listener = ()=>void;

export class ReactiveStore{

    // set of listener functions
    protected listeners: Set<Listener> = new Set();

    // external sync state management for reeactive-store
    protected emit(): void {
        this.listeners.forEach((listener) => listener());
    }

    public subscribe(listener: Listener): () => void { 
        this.listeners.add(listener);

        return () => {
        this.listeners.delete(listener);
        };
    }
}