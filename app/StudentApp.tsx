'use client';
import dynamic from 'next/dynamic';
const App=dynamic(()=>import('../src/App'),{ssr:false,loading:()=> <div style={{padding:32,color:'#9f3c55'}}>학습 화면을 불러오는 중…</div>});
export default function StudentApp(){return <StudentAppBody/>;}
function StudentAppBody(){return <App/>;}
