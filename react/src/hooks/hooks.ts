import { AnyAction, Dispatch, ThunkDispatch } from "@reduxjs/toolkit";
import { AppDispatch } from "../store/store";
import { CommonState } from "../interfaces/state/Common";
import { useDispatch } from "react-redux";
import { useLayoutEffect, useState } from "react";

export const useAppDispatch = (): ThunkDispatch<
    { common: CommonState },
    undefined, AnyAction> & Dispatch<AnyAction> => useDispatch<AppDispatch>();

export const useWindowSize = ( ) => {
    const [ size, setSize ] = useState( [ 0, 0 ] );
    useLayoutEffect( () => {
        function updateSize() {
            setSize( [ window.innerWidth, window.innerHeight ] );
        }
        window.addEventListener( 'resize', updateSize );
        updateSize();
        return () => window.removeEventListener( 'resize', updateSize );
    }, [ ] );
    return size;
}
