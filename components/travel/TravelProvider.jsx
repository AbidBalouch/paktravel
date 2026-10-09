"use client";
import { createContext, useContext, useReducer, useRef } from "react";
import { TravelModel } from "./TravelModel";
const TravelContext = createContext(null);
export function TravelProvider({ children }) {
 const [, refresh] = useReducer(value => value + 1, 0);
 const model = useRef(null);
 if (!model.current) model.current = new TravelModel(refresh);
 return <TravelContext.Provider value={model.current.renderVals()}>{children}</TravelContext.Provider>;
}
export function useTravel() { const value = useContext(TravelContext); if (!value) throw new Error("Travel components require TravelProvider"); return value; }
