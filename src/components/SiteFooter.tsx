import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import './site-footer.css';

type FooterLanguage='zh'|'ko'|'en';
const LANGUAGE_KEY='hanzi-footer-language';
const copy={
 zh:{copyright:'© 2026 jingshuangxue 版权所有',guide:'学习记录保存在此设备',about:'学习方法 · 来源',language:'页脚语言'},
 ko:{copyright:'© 2026 jingshuangxue. 모든 권리 보유',guide:'한국어 학습 안내 · 기록은 이 기기에 저장',about:'학습 방법 · 출처',language:'푸터 언어'},
 en:{copyright:'© 2026 jingshuangxue. All Rights Reserved.',guide:'Learning records are saved on this device',about:'Learning guide · Sources',language:'Footer language'}
} satisfies Record<FooterLanguage,{copyright:string;guide:string;about:string;language:string}>;
const isLanguage=(value:string|null):value is FooterLanguage=>value==='zh'||value==='ko'||value==='en';

export default function SiteFooter({onAbout}:{onAbout:()=>void}){
 const [language,setLanguage]=useState<FooterLanguage>('ko');
 useEffect(()=>{
  try{const saved=localStorage.getItem(LANGUAGE_KEY);if(isLanguage(saved))setLanguage(saved);}catch{/* The footer also works without browser storage. */}
 },[]);
 const text=copy[language];
 function changeLanguage(value:string){
  if(!isLanguage(value))return;
  setLanguage(value);
  try{localStorage.setItem(LANGUAGE_KEY,value);}catch{/* Keep the selected language for this visit. */}
 }
 return <footer className="site-footer localized-footer" lang={language}>
  <span><span className="footer-mark">字</span>字链</span>
  <p className="footer-guide">{text.guide}</p>
  <div className="footer-controls">
   <button type="button" onClick={onAbout}>{text.about}<ArrowUpRight size={12}/></button>
   <label className="footer-language"><span>{text.language}</span><select aria-label={text.language} value={language} onChange={event=>changeLanguage(event.target.value)}><option value="zh" lang="zh">中文</option><option value="ko" lang="ko">한국어</option><option value="en" lang="en">English</option></select></label>
  </div>
  <p className="footer-copyright">{text.copyright}</p>
 </footer>;
}
