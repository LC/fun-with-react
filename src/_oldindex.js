import React from "react";
import ReactDOM from "react-dom";
import { useStore } from "./use-store";
import shallowEqual from "./shallowEqual";
import "./styles.css";

const initialState = {
  count: 0,
  users: [{ name: "Lucas" }]
};

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, count: state.count - 1 };
    case "add_user":
      return { ...state, users: state.users.concat(action.payload) };
    default:
      throw new Error("nonexisting action");
  }
}

const StoreContext = React.createContext();

function useSubState(selector) {
  const store = React.useContext(StoreContext);
  const [substate, setSubstate] = React.useState(selector(store.getState()));

  React.useEffect(() => {
    return store.subscribe(() => {
      const nextSubstate = selector(store.getState());
      if (!shallowEqual(substate, nextSubstate)) {
        setSubstate(nextSubstate);
      }
    });
  }, []);

  return [substate, store.dispatch];
}

const Counter = React.memo(function Counter() {
  console.count("Update Counter");
  const [count, dispatch] = useSubState(state => state.count);
  const increment = () => dispatch({ type: "increment" });
  const decrement = () => dispatch({ type: "decrement" });

  return (
    <div>
      Count: <strong>{count}</strong>
      <div>
        <button onClick={increment}>increment</button>
        <button onClick={decrement}>increment</button>
      </div>
    </div>
  );
});

function createCache() {
  const cache = {};
  function get(url) {
    if (!cache[url]) {
      cache[url] = {
        request: fetch(url)
          .then(r => r.json())
          .then(result => set(url, result))
      };
    }
    return cache[url];
  }

  function set(url, result) {
    cache[url] = { ...cache[url], result };
  }

  return { get };
}

const CacheContext = React.createContext();

function useFetch(resourceUrl) {
  var cache = React.useContext(CacheContext);
  var entry = cache.get(resourceUrl);

  if (!("result" in entry)) {
    throw entry.request;
  }

  return entry.result;
}

function Advice() {
  const result = useFetch("https://api.adviceslip.com/advice");
  return <div>{JSON.stringify(result, null, 2)}</div>;
}

function Users() {
  console.count("Update Users");
  const [users, dispatch] = useSubState(state => state.users);
  const [name, setName] = React.useState("");
  const addUser = () =>
    name && dispatch({ type: "add_user", payload: { name } });

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={addUser}>add</button>
      <ul>
        {users.map((user, i) => (
          <li key={user.name + i}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

function MultiProvider({ children, providers = [] }) {
  return (
    <>
      {providers.reduce(
        (child, provider) => (
          <provider.component {...provider.props}>{child}</provider.component>
        ),
        children
      )}
    </>
  );
}

const StoreProvider = React.memo(({ children, ...props }) => {
  return <StoreContext.Provider {...props}>{children}</StoreContext.Provider>;
});

function App() {
  const store = useStore(reducer, initialState);
  const [cache] = React.useState(() => createCache());
  const [title, setTitle] = React.useState("Hello CodeSandbox");
  const titleInput = { value: title, onChange: e => setTitle(e.target.value) };

  return (
    <CacheContext.Provider value={cache}>
      <StoreProvider value={store}>
        <div className="App">
          <h1>{title}</h1>
          <input {...titleInput} />
          <Counter />
          <React.Suspense fallback={<div>loading...</div>}>
            <Advice />
          </React.Suspense>
          <Users />
        </div>
      </StoreProvider>
    </CacheContext.Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
