'use client';
import {useEffect} from 'react';
import {startGoatCounterBridge} from './goatcounter';

export default function GoatCounterBridge(){
 useEffect(startGoatCounterBridge,[]);
 return null;
}
