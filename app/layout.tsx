import type {ReactNode} from 'react';
import '../src/styles.css';
import '../src/warm-theme.css';
export const metadata={title:'字有意思 · 汉字部件实验室',description:'한국어 학습자를 위한 한자 부수·그림·글자 연결 학습'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
