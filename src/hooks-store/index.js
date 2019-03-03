import { useReducer, useEffect, useRef, useCallback } from "react";

export function useStore(reducer, initialState = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(initialState);
  const observersRef = useRef([]);
  const getState = useCallback(() => stateRef.current);
  const subscribe = useCallback(observer => {
    observersRef.current = observersRef.current.concat(observer);
    return () => {
      observersRef.current = observersRef.current.filter(
        obs => obs !== observer
      );
    };
  });

  const storeRef = useRef({ getState, dispatch, subscribe });

  useEffect(() => {
    stateRef.current = state
  }, [state]);

  useEffect(() => {
    observersRef.current.forEach(observer => observer());
  }, [state]);

  useEffect(() => {
    storeRef.current = { getState, dispatch, subscribe }
  }, [getState, dispatch, subscribe])

  return storeRef.current;
}
