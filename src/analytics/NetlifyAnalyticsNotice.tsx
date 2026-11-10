import {useEffect,useState} from 'react';
import {analyticsStatus,setAnalyticsEnabled,startAnalytics,subscribeAnalyticsStatus} from './netlify-client';
import './analytics-notice.css';

export default function NetlifyAnalyticsNotice(){
 const [status,setStatus]=useState(analyticsStatus);
 useEffect(()=>{
  const unsubscribe=subscribeAnalyticsStatus(()=>setStatus(analyticsStatus()));
  startAnalytics();setStatus(analyticsStatus());return unsubscribe;
 },[]);
 return <details className="analytics-notice">
  <summary>익명 사용 통계 · {status.enabled?'켜짐':'꺼짐'}</summary>
  <p>GoatCounter로 페이지 방문과 부수·한자·단어 클릭을 집계해요. 통계용 쿠키를 사용하지 않으며, 집계 결과는 로그인한 운영자만 확인할 수 있어요.</p>
  <div>
   <button type="button" onClick={()=>void setAnalyticsEnabled(!status.enabled)}>{status.enabled?'통계 기록 중지':'통계 기록 켜기'}</button>
   <a href="https://ziyouyisi.goatcounter.com/" target="_blank" rel="noreferrer">운영자 통계</a>
   <a href="https://hanzi-links-playground.jazzybay4.chatgpt.site/admin" target="_blank" rel="noreferrer">이전 비공개 학습 통계</a>
  </div>
  <small role="status">{status.enabled?'운영자 본인의 방문을 제외하려면 이 기기에서 통계 기록을 중지하세요.':'이 기기의 통계 기록이 중지되어 있어요.'} 학습 기록과 저장한 한자는 이 기기에 남아요.</small>
 </details>;
}
