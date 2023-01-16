import { differenceInSeconds } from "date-fns";
import { createContext, ReactNode, useState, useReducer, useEffect } from "react";
import { addNewCycleAction, clearCycleListAction, interruptCurrentCycleAction, markCurrentCycleAsFinishedAction } from "../reducers/cycles/actions";
import { Cycle, cyclesReducer } from "../reducers/cycles/reducer";



interface CreateCycleData {
    task: string
    minutesAmount: number
}

interface CycleContextType {
    cycles: Cycle[]
    activeCycle: Cycle | undefined
    activeCycleId: string | null
    amountSecondsPassed: number
    markCurrentCycleAsFinished: () => void
    setSecondsPassed: (seconds: number) => void
    createNewCycle: (data: CreateCycleData) => void
    interruptCurrentCycle: () => void
    clearCycleList: () => void
}

export const CycleContext = createContext({} as CycleContextType)

interface CycleContextProviderProps {
    children: ReactNode
}

export function CyclesContextProvider({ children }: CycleContextProviderProps) {

    const initialState = {
        cycles: [],
        activeCycleId: null
    }

    const [cyclesState, dispatch] = useReducer(cyclesReducer, {
        initialState
    }, () => {
        const storageStateAsJSON = localStorage.getItem('@ignite-timer: cycles-state-1.0.0');

        if (storageStateAsJSON) {
            return JSON.parse(storageStateAsJSON)
        }
    
        return {
            cycles: [],
            activeCycleId: null
        }
    })

    const { cycles, activeCycleId } = cyclesState
    const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

    const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
        if (activeCycle) {
            return differenceInSeconds(new Date(), new Date(activeCycle.startDate))
        }
        return 0
    })

    useEffect(() => {
        const stateJSON = JSON.stringify(cyclesState)

        localStorage.setItem('@ignite-timer: cycles-state-1.0.0', stateJSON)
    }, [cyclesState])

    function clearCycleList () {
        dispatch(clearCycleListAction())
    }

    function markCurrentCycleAsFinished() {
        dispatch(markCurrentCycleAsFinishedAction())
    }

    function setSecondsPassed(seconds: number) {
        setAmountSecondsPassed(seconds)
    }

    function createNewCycle(data: CreateCycleData) {
        const id = String(new Date().getTime())

        const newCycle: Cycle = {
            id,
            task: data.task,
            minutesAmount: data.minutesAmount,
            startDate: new Date(),
        }

        dispatch(addNewCycleAction(newCycle))
        setAmountSecondsPassed(0)
    }

    function interruptCurrentCycle() {
        dispatch(interruptCurrentCycleAction())
    }

    return (
        <CycleContext.Provider
            value={{
                cycles,
                activeCycle,
                activeCycleId,
                markCurrentCycleAsFinished,
                amountSecondsPassed,
                setSecondsPassed,
                createNewCycle,
                interruptCurrentCycle,
                clearCycleList
            }}>
            {children}
        </CycleContext.Provider>
    )
}