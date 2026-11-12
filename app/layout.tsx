import type {ReactNode} from 'react';
import Script from 'next/script';
import GoatCounterBridge from '../src/analytics/GoatCounterBridge';
import '../src/styles.css';
import '../src/warm-theme.css';
export const metadata={
 title:'字链 ZiLink · 汉字部件实验室',
 description:'한국어 학습자를 위한 한자 부수·그림·글자 연결 학습',
 alternates:{canonical:'https://jjok-zilink.netlify.app/'},
 robots:{index:true,follow:true},
 verification:{google:'Sfq2j338RaLKljS9oErwhc9q2TotZ777NOIV1bn8FpU'},
};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="ko"><body>{children}<Script id="goatcounter-script" data-goatcounter="https://ziyouyisi.goatcounter.com/count" data-goatcounter-settings='{"no_onload":true,"no_events":true}' src="https://gc.zgo.at/count.js" strategy="afterInteractive"/><GoatCounterBridge/></body></html>;}
