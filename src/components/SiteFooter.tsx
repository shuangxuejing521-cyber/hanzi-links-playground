import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import './site-footer.css';

type FooterLanguage='zh'|'ko'|'en';
const LANGUAGE_KEY='hanzi-footer-language';
const copy={
 zh:{copyright:'© 2026 jingshuangxue 版权所有',rights:'本站自有内容保留相关权利；第三方内容及另行标注许可的内容，按各自许可使用。',sources:'来源与许可说明',guide:'学习记录保存在此设备',about:'学习方法 · 来源',language:'页脚语言'},
 ko:{copyright:'© 2026 jingshuangxue. 모든 권리 보유',rights:'본 사이트 소유 콘텐츠의 관련 권리를 보유합니다. 제3자 콘텐츠와 별도 라이선스가 표시된 콘텐츠에는 해당 라이선스가 적용됩니다.',sources:'출처 및 라이선스',guide:'한국어 학습 안내 · 기록은 이 기기에 저장',about:'학습 방법 · 출처',language:'푸터 언어'},
 en:{copyright:'© 2026 jingshuangxue. All Rights Reserved.',rights:"Rights in this site's own content are reserved. Third-party and separately licensed content remain subject to their respective licenses.",sources:'Sources and licenses',guide:'Learning records are saved on this device',about:'Learning guide · Sources',language:'Footer language'}
} satisfies Record<FooterLanguage,{copyright:string;rights:string;sources:string;guide:string;about:string;language:string}>;
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
  <p className="footer-rights">{text.rights}{' '}<a href="/sources/NOTICE.txt">{text.sources}</a></p>
 </footer>;
}
