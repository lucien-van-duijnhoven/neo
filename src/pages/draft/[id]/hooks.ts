import {useState, useEffect} from 'react';
import { trpc } from '../../../utils/trpc';

export const useTimer = (callback: any, delay: number) => {
    const [timerId, setTimerId] = useState<number | null>(null);
    setTimerId(window.setTimeout(() => {
        callback();
    }, delay));
    useEffect(() => {
        return () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
    });
}