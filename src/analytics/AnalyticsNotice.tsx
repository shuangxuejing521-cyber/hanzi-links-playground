import {useEffect,useState} from 'react';
import {analyticsStatus,resetAnalyticsIdentity,setAnalyticsEnabled,startAnalytics,subscribeAnalyticsStatus} from './client';
import './analytics-notice.css';
export default function AnalyticsNotice(){
 const [status,setStatus]=useState(analyticsStatus),[busy,setBusy]=useState(false),[reset,setReset]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const unsubscribe=subscribeAnalyticsStatus(()=>setStatus(analyticsStatus()));startAnalytics();setStatus(analyticsStatus());return unsubscribe;},[]);
 const run=async(action:()=>Promise<void>)=>{setBusy(true);setError('');try{await action();}catch(e){setError(e instanceof Error?e.message:'연결 후 다시 시도해 주세요.');}finally{setBusy(false);setStatus(analyticsStatus());}};
 return <details className="analytics-notice"><summary>익명 사용 통계 · {status.enabled?'켜짐':'꺼짐'}</summary><p>이름·전화번호·이메일 없이 이 브라우저의 클릭과 연습 기록을 자동 집계해요. 다른 기기는 별도 방문자로 기록돼요.</p><div><button type="button" disabled={busy} onClick={()=>run(()=>setAnalyticsEnabled(!status.enabled))}>{status.enabled?'통계 기록 중지':'통계 기록 켜기'}</button><button type="button" disabled={busy} onClick={()=>setReset(true)}>이 기기 통계 코드 초기화</button><a href="/admin">관리자</a></div>{reset&&<div className="analytics-reset"><span>방문 연결용 코드를 새로 만들까요? 기존 학습 저장 기록은 유지돼요.</span><button type="button" disabled={busy} onClick={()=>run(async()=>{await resetAnalyticsIdentity();setReset(false);})}>초기화</button><button type="button" onClick={()=>setReset(false)}>취소</button></div>}<small role="status">{error|| (status.state==='unavailable'?'통계 연결 대기 중 · 학습은 계속할 수 있어요.':status.state==='disabled'?'이 기기의 통계 기록이 중지되어 있어요.':status.pending?`${status.pending}개 기록 동기화 대기 중`:'수집된 기록은 서버에 저장돼요. 학습 저장 기록은 이 기기에 남아요.')}</small></details>;
}
