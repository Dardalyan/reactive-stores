# reactive-stores

Reactive Stores provides two small modules for React applications:

- `store`: reactive state containers that can be shared across components
- `storage`: a typed structure for managing browser storage entries

The package is built around simple TypeScript classes and React's `useSyncExternalStore`.

## Installation

```bash
npm install reactive-stores
```

## Modules

```ts
import {
  DataStore,
  EntityStore,
  DataStoreBinding,
  EntityStoreBinding,
  StorageManager,
} from "reactive-stores";
```

## Store Concept

A store keeps data outside React components. Components subscribe to the store with a binding hook. When the store changes, subscribed components receive the latest snapshot and render again.

```txt
store changes
  -> listeners are notified
  -> React reads the new snapshot
  -> component renders with fresh data
```

## DataStore

`DataStore<T>` stores key-value data in a `Map<string, T>`.

Use it when your state is naturally addressed by string keys, such as form fields, status values, selected modes, or small UI flags.

### Create a DataStore

```ts
import { DataStore, DataStoreBinding } from "reactive-stores";

export const formStore = new DataStore<string>();
export const useFormStore = DataStoreBinding;
```

### Set Initial Values

```ts
formStore.Set(
  new Map<string, string>([
    ["email", ""],
    ["password", ""],
  ])
);
```

### Use DataStore in React

```tsx
import { formStore, useFormStore } from "./stores";

export function LoginForm() {
  const form = useFormStore(formStore);

  return (
    <form>
      <input
        value={form.getByKey("email") ?? ""}
        onChange={(event) => {
          form.update("email", event.target.value);
        }}
      />

      <input
        type="password"
        value={form.getByKey("password") ?? ""}
        onChange={(event) => {
          form.update("password", event.target.value);
        }}
      />
    </form>
  );
}
```

### DataStore Methods

```ts
formStore.Set(new Map([["email", "hello@example.com"]]));
formStore.Add("status", "idle");
formStore.Update("status", "loading");
formStore.GetByKey("status");
formStore.Get();
formStore.Remove("status");
formStore.Remove(["email", "password"]);
formStore.Reset();
```

When used through `DataStoreBinding`, the method names are camelCase:

```ts
const form = useFormStore(formStore);

form.set(new Map([["email", "hello@example.com"]]));
form.add("status", "idle");
form.update("status", "loading");
form.getByKey("status");
form.remove("status");
form.reset();
```

### DataStore Behavior

- Keys must be strings.
- `Set` replaces the full map.
- `Add` creates a new key and throws if the key already exists.
- `Update` changes an existing key and throws if the key does not exist.
- `Remove` accepts one key or an array of keys.
- `Reset` clears all values.

## EntityStore

`EntityStore<T>` stores objects by a selected key field.

Use it for lists, tables, selected entities, cached lookup results, or any collection where each item has a stable unique key.

### Define an Entity Type

```ts
export type Product = {
  id: string;
  name: string;
  price: number;
};
```

### Create an EntityStore

```ts
import { EntityStore, EntityStoreBinding } from "reactive-stores";
import type { Product } from "./types";

export const productStore = new EntityStore<Product>("id");
export const useProductStore = EntityStoreBinding;
```

If no key is provided, `id` is used.

```ts
export const productStore = new EntityStore<Product>();
```

### Set an Entity List

```ts
productStore.Set([
  { id: "p-1", name: "Keyboard", price: 120 },
  { id: "p-2", name: "Mouse", price: 60 },
]);
```

### Set an Entity Map

```ts
productStore.Set(
  new Map([
    ["p-1", { id: "p-1", name: "Keyboard", price: 120 }],
    ["p-2", { id: "p-2", name: "Mouse", price: 60 }],
  ])
);
```

### Use EntityStore in React

```tsx
import { productStore, useProductStore } from "./stores";

export function ProductList() {
  const products = useProductStore(productStore);
  const items = Array.from(products.data.values());

  return (
    <ul>
      {items.map((product) => (
        <li key={product.id}>
          <span>{product.name}</span>
          <button onClick={() => products.remove(product.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

### Update an Entity

```ts
const product = productStore.GetByKey("p-1");

if (product) {
  productStore.Update({
    ...product,
    price: 140,
  });
}
```

### EntityStore Methods

```ts
productStore.Set([{ id: "p-1", name: "Keyboard", price: 120 }]);
productStore.Update({ id: "p-1", name: "Keyboard", price: 140 });
productStore.GetByKey("p-1");
productStore.Get();
productStore.Remove("p-1");
productStore.Remove(["p-1", "p-2"]);
productStore.Reset();
```

When used through `EntityStoreBinding`, the method names are camelCase:

```ts
const products = useProductStore(productStore);

products.set([{ id: "p-1", name: "Keyboard", price: 120 }]);
products.update({ id: "p-1", name: "Keyboard", price: 140 });
products.getByKey("p-1");
products.get();
products.remove("p-1");
products.reset();
```

### EntityStore Behavior

- The configured key must exist on every entity.
- The default key is `id`.
- `Set` accepts an array or `Map<string, T>`.
- `Update` throws if the entity does not exist.
- `Remove` accepts one key or an array of keys.
- `Get` returns `Map<string, T>`.

## Store Bindings

Bindings connect store instances to React.

```ts
export const settingsStore = new DataStore<boolean>();
export const useSettingsStore = DataStoreBinding;
```

```tsx
const settings = useSettingsStore(settingsStore);
```

`settings.data` is the current store snapshot. Any mutation that emits a change causes subscribed components to render with the updated snapshot.

## Storage

The storage module provides a consistent structure for persistent values.

A storage entry exposes three methods:

- `Set`: write a value
- `Get`: read a value
- `Reset`: remove a value

## StorageStructure

```ts
import type { StorageStructure } from "reactive-stores";

type Session = {
  accessToken: string;
  expiresAt: string;
};

export const SessionStorage: StorageStructure<Session | null> = {
  Set: (session) => {
    localStorage.setItem("session", JSON.stringify(session));
  },
  Get: () => {
    const stored = localStorage.getItem("session");
    return stored ? JSON.parse(stored) : null;
  },
  Reset: () => {
    localStorage.removeItem("session");
  },
};
```

### Use a Storage Entry

```ts
SessionStorage.Set({
  accessToken: "token",
  expiresAt: new Date().toISOString(),
});

const session = SessionStorage.Get();

SessionStorage.Reset();
```

## StorageManager

`StorageManager` registers multiple storage entries and clears them together.

### Create a StorageManager

```ts
import { StorageManager } from "reactive-stores";
import { SessionStorage } from "./storage";

export const storageManager = new StorageManager();

storageManager.AddStore("Session", SessionStorage);
```

### Clear Registered Storage Entries

```ts
await storageManager.ClearAll();
```

Every registered storage entry receives a `Reset()` call.

## AsyncStorageStructure

For async storage implementations, use `AsyncStorageStructure<T>`.

```ts
import type { AsyncStorageStructure } from "reactive-stores";

type Draft = {
  id: string;
  title: string;
};

export const DraftStorage: AsyncStorageStructure<Draft[]> = {
  Set: async (drafts) => {
    await database.drafts.bulkPut(drafts);
  },
  Get: async () => {
    return database.drafts.toArray();
  },
  Reset: async () => {
    await database.drafts.clear();
  },
};
```

## Store and Storage Together

Use storage for persistence and stores for reactive rendering.

### Hydrate a Store from Storage

```ts
type User = {
  id: string;
  username: string;
};

export const currentUserStore = new EntityStore<User>("id");

const storedUser = UserStorage.Get();

if (storedUser) {
  currentUserStore.Set([storedUser]);
}
```

### Update Store and Storage

```ts
UserStorage.Set(user);
currentUserStore.Set([user]);
```

### Clear Store and Storage

```ts
currentUserStore.Reset();
await storageManager.ClearAll();
```

## Complete Example

```ts
import {
  DataStore,
  DataStoreBinding,
  EntityStore,
  EntityStoreBinding,
  StorageManager,
  type StorageStructure,
} from "reactive-stores";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

type TodoFilter = "all" | "active" | "completed";

export const todoStore = new EntityStore<Todo>("id");
export const useTodoStore = EntityStoreBinding;

export const todoFilterStore = new DataStore<TodoFilter>();
export const useTodoFilterStore = DataStoreBinding;

export const TodoStorage: StorageStructure<Todo[]> = {
  Set: (todos) => {
    localStorage.setItem("todos", JSON.stringify(todos));
  },
  Get: () => {
    const stored = localStorage.getItem("todos");
    return stored ? JSON.parse(stored) : [];
  },
  Reset: () => {
    localStorage.removeItem("todos");
  },
};

export const storageManager = new StorageManager();
storageManager.AddStore("Todos", TodoStorage);
```

```tsx
import {
  todoFilterStore,
  todoStore,
  TodoStorage,
  useTodoFilterStore,
  useTodoStore,
} from "./todo-state";

export function TodoList() {
  const todos = useTodoStore(todoStore);
  const filter = useTodoFilterStore(todoFilterStore);

  const items = Array.from(todos.data.values()).filter((todo) => {
    const currentFilter = filter.getByKey("value") ?? "all";
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  const toggle = (id: string) => {
    const todo = todos.getByKey(id);
    if (!todo) return;

    todos.update({
      ...todo,
      completed: !todo.completed,
    });

    TodoStorage.Set(Array.from(todos.get().values()));
  };

  return (
    <ul>
      {items.map((todo) => (
        <li key={todo.id}>
          <label>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggle(todo.id)}
            />
            {todo.title}
          </label>
        </li>
      ))}
    </ul>
  );
}
```

## Summary

`reactive-stores` gives React apps a small store layer and a consistent storage pattern:

- Use `DataStore` for string-keyed state.
- Use `EntityStore` for keyed object collections.
- Use store bindings to subscribe React components.
- Use `StorageStructure` for persistent values.
- Use `StorageManager` to reset registered storage entries together.
