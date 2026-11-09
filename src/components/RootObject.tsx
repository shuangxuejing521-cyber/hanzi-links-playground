import {useId, type ReactNode} from 'react';

/** Original object diagrams. Purple traces highlight visible contours, not facsimiles of ancient inscriptions. */
export const ROOT_OBJECT_KEYS = ['water','person','hand','oral','tree','speech','heart','woman','thread','sun','eye','meat','earth','metal','foodbowl','dog','ice','fire','rice','altar','cloth','foot','jade','worm','cart','stone'] as const;
interface Props {kind:string;label:string;trace?:boolean}
const P={ink:'#635147',paper:'#fffaf0',skin:'#e2b99b',blue:'#75aebe',water:'#d8ecea',green:'#91ad83',wood:'#b8956e',red:'#bf7067',plum:'#dd5369',stone:'#b4afa2',copper:'#b58565'};
export default function RootObject({kind,label,trace=false}:Props){
 const id=useId();
 const outline=(d:string)=><path d={d} fill="none" stroke={P.plum} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={trace?1:0}/>;
 let drawing:ReactNode;
 switch(kind){
 case 'water': drawing=<>
  <path d="M206 20C164 70 241 102 209 147S165 224 207 280L267 280C221 222 282 188 265 145S220 82 258 20Z" fill={P.water}/>
  <path d="M233 24C197 76 267 112 234 153S195 225 239 277" stroke={P.blue} strokeWidth="4" fill="none"/>
  <path d="M144 80q-12 20-12 27a12 12 0 0 0 24 0q0-7-12-27M304 115q-12 20-12 27a12 12 0 0 0 24 0q0-7-12-27M140 191q-12 20-12 27a12 12 0 0 0 24 0q0-7-12-27M307 223q-12 20-12 27a12 12 0 0 0 24 0q0-7-12-27" fill={P.blue}/>
  {outline('M233 24C197 76 267 112 234 153S195 225 239 277M142 91l1 15M306 126v15M140 201v15M308 233v15')}
 </>;break;
 case 'person':drawing=<>
  <path d="M230 67c-27-10-44 1-42 21l-8 10 11 5 2 16 24 2 10-18" fill={P.skin}/>
  <path d="M223 73q-21-23-33 0" fill="none" stroke={P.ink} strokeWidth="8"/>
  <path d="M205 120q-19 38-11 73l-25 74h26l29-65 28 66h27l-38-86-14-58Z" fill="#b5b9a1"/>
  <path d="M207 127q-24 39-57 63l9 15q43-25 65-69" fill={P.skin}/>
  <circle cx="189" cy="88" r="2" fill={P.ink}/>
  <path d="M146 270h146" stroke="#d6c6ac" strokeWidth="3"/>
  {outline('M210 121q-10 40-4 72l-24 73M211 127q-21 43-56 69M208 193l58 74')}
 </>;break;
 case 'hand':drawing=<>
  <path d="M188 277l-5-62-35-56q-10-18 2-24 9-4 19 13l15 18-1-96q0-21 13-20t14 20l2 64 3-89q0-17 13-17t13 19l1 84 7-74q2-17 14-15t11 18l-3 85 9-49q4-17 15-13t9 21l-10 73q-3 25-34 51l3 44Z" fill={P.skin} stroke={P.ink} strokeWidth="3"/>
  <path d="M190 178q23-20 46-10M210 190q14 5 19 24M194 245h55" fill="none" stroke="#b58d72" strokeWidth="3"/>
  {outline('M198 267l-4-57-34-59M197 67l4 99M228 45v117M260 76l-5 88M290 129l-12 57M198 172q30-11 58 3')}
 </>;break;
 case 'oral':drawing=<>
  <path d="M96 153q72-76 144-39 70-37 144 39-71 86-144 55-74 31-144-55Z" fill="#d99187" stroke={P.ink} strokeWidth="3"/>
  <path d="M119 153q122-43 241 0-117 60-241 0Z" fill="#713f42"/>
  <path d="M160 143q81-20 162 0l-3 17q-80-9-156 0Z" fill={P.paper}/>
  <path d="M184 178q57-31 112-3-55 20-112 3Z" fill="#d7938d"/>
  {outline('M119 153q122-43 241 0-117 60-241 0Z')}
 </>;break;
 case 'tree':drawing=<>
  <path d="M225 235l5-108-57-51 8-11 55 43 5-67 16 1 1 70 52-49 12 9-62 61 3 105Z" fill={P.wood} stroke={P.ink} strokeWidth="2"/>
  <path d="M131 97q-30-25-9-54 33-18 54 8 14-32 44-22l10 45-28 36-52 3ZM267 38q28-30 53-2 25-14 44 12 13 34-21 57l-54-4-32-21ZM143 118q-33 3-36 33 19 40 56 16 26 15 46-10l-12-33ZM286 119q35-24 63-2 29 13 13 45-30 20-59 1-22 3-35-18Z" fill={P.green} opacity=".9"/>
  <path d="M103 236h273" stroke="#c8b99f" strokeWidth="3"/>
  <path d="M240 229l-37 32-39 6M247 237l6 38M254 230l37 31 32-4" stroke={P.wood} strokeWidth="9" fill="none" strokeLinecap="round"/>
  {outline('M248 42v192M249 121l-72-53M250 128l66-61M246 231l-44 30-38 6M250 234l4 41M253 232l38 29 32-4')}
 </>;break;
 case 'speech':drawing=<>
  <path d="M110 265l13-62q-29-37-22-91 7-65 65-70 61-3 74 58l-3 30 26 26-28 11-3 35q-4 23-42 26v37Z" fill="#e8c7ad" stroke={P.ink} strokeWidth="3"/>
  <path d="M107 123q-18-73 53-86 50-7 72 46-51-24-71-2-15 31-54 42Z" fill="#74766a"/>
  <circle cx="214" cy="116" r="3" fill={P.ink}/>
  <path d="M232 179l-37-9q14 21 35 20Z" fill="#9d5d5a"/>
  <path d="M228 183l-20-4q1 11 18 8" fill="#dd9a91"/>
  <path d="M286 147q24 19 0 39M309 127q48 39 0 78M334 105q71 63 0 125" stroke={P.blue} strokeWidth="5" fill="none" strokeLinecap="round"/>
  {outline('M231 179l-35-9q14 21 35 20M208 179l20 5M286 147q24 19 0 39')}
 </>;break;
 case 'heart':drawing=<>
  <path d="M211 105l-5-47q2-28 26-28h25v20h-22q-8 1-8 12l9 47M254 94l6-35 17-3 12 13-19 37" fill={P.red} stroke={P.ink} strokeWidth="3"/>
  <path d="M190 103l-18-30-20 12 22 42M244 119l-4-44 20-4 11 56" fill={P.blue} stroke={P.ink} strokeWidth="3"/>
  <path d="M174 116q32-25 55 11 28-37 68-6 42 36 10 82-19 34-63 69-70-29-88-78-20-51 18-78Z" fill="#cc8076" stroke={P.ink} strokeWidth="3"/>
  <path d="M229 130q-27 38 6 101M235 155l32-12 24 11M232 176l37 16 14 31M223 173l-30 8-10 25M236 202l17 28" fill="none" stroke="#97564f" strokeWidth="4"/>
  {outline('M174 116q32-25 55 11 28-37 68-6 42 36 10 82-19 34-63 69-70-29-88-78-20-51 18-78Z')}
 </>;break;
 case 'woman':drawing=<>
  <g transform="translate(360 0) scale(-1 1)"><path d="M184 42q-27 7-29 36l-10 11 13 7 3 17 23 4 18-28Z" fill={P.skin}/>
  <path d="M173 43q33-17 40 16l-6 50q-20 11-22-5 15-36-12-61Z" fill="#68635c"/>
  </g><path d="M177 115q-14 24-9 63l56 34 31-24q-31-26-46-65Z" fill="#9fa99a" stroke={P.ink} strokeWidth="2"/>
  <path d="M176 126l-16 31 57 22M205 127l16 30-53 21" stroke={P.ink} strokeWidth="17" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M176 126l-16 31 57 22M205 127l16 30-53 21" stroke={P.skin} strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M225 208l43 21q15 19-7 31l-76-1-25 9-12-10 42-17 44-1-44-17" fill={P.skin} stroke={P.ink} strokeWidth="3"/>
  <path d="M135 273h165" stroke="#d6c6ac" strokeWidth="3"/>
  {outline('M183 117q-12 28-3 58l60 39 29 21q8 10-8 16l-71-3M176 126l-16 31 57 22M205 127l16 30-53 21')}
  <g fill={trace?P.plum:P.ink} fontSize="16"><path d="M224 166h74M274 236h28" fill="none" stroke={trace?P.plum:'#b5a58d'} strokeWidth="2"/><text x="306" y="172">双臂交叠</text><text x="310" y="242">屈膝跪坐</text></g>
 </>;break;
 case 'thread':drawing=<>
  {Array.from({length:11},(_,i)=>{const x=194+i*8;return <path key={i} d={`M${x} 51C${x-74} 80 ${x-51} 128 235 150C${x+73} 189 ${x+44} 233 ${x} 258C${x-47} 233 ${x-67} 193 235 150C${x+65} 119 ${x+40} 77 ${x} 51Z`} stroke={i%2?'#cdb486':'#ab8f66'} fill="none" strokeWidth="2.2"/>;})}
  <path d="M214 142l43-2M213 150l46-2M215 157l42-2M248 155q62 40 45 100M247 158q12 74 36 113" stroke="#a68a66" fill="none" strokeWidth="3"/>
  {outline('M231 51C153 85 160 125 235 150C312 191 278 235 235 258C179 231 158 194 235 150C302 115 282 78 231 51M214 150h44M249 158q12 74 36 113')}
 </>;break;
 case 'sun':drawing=<>
  <circle cx="240" cy="150" r="100" fill="#f5e6bb"/>
  <circle cx="240" cy="150" r="73" fill="#e7bd67"/>
  <circle cx="240" cy="150" r="49" fill="#f0d18c" opacity=".7"/>
  <circle cx="240" cy="150" r="6" fill="#b78b45"/>
  {outline('M313 150a73 73 0 1 0-146 0 73 73 0 1 0 146 0M234 150h12')}
 </>;break;
 case 'eye':drawing=<>
  <path d="M87 153q151-141 306 0-151 134-306 0Z" fill={P.paper} stroke={P.ink} strokeWidth="4"/>
  <circle cx="240" cy="151" r="55" fill="#b4c6a0" stroke={P.ink} strokeWidth="3"/>
  <circle cx="240" cy="151" r="28" fill="#4f5e51"/>
  <circle cx="251" cy="135" r="8" fill={P.paper}/>
  <path d="M110 110q125-84 257-4M111 181q127 90 258-2" fill="none" stroke="#d1b89a" strokeWidth="4"/>
  {outline('M87 153q151-141 306 0-151 134-306 0ZM268 151a28 28 0 1 0-56 0 28 28 0 1 0 56 0')}
 </>;break;
 case 'meat':drawing=<>
  <path d="M151 63q67-23 143 7l28 156q-76 34-166 0Z" fill="#cc8b7a" stroke={P.ink} strokeWidth="3"/>
  <path d="M163 79q67-17 119 4l23 132q-66 22-138 0Z" fill="#dda38f"/>
  <path d="M176 103q60-21 108 17M174 143q65-17 117 20M177 183q67-15 120 21" stroke="#f5d8c5" strokeWidth="10" fill="none"/>
  <path d="M151 63l12 16M294 70l-12 13M322 226l-17-11M156 226l11-11" stroke="#a97464" strokeWidth="3"/>
  {outline('M151 63q67-23 143 7l28 156q-76 34-166 0ZM176 103q60-21 108 17M174 143q65-17 117 20')}
 </>;break;
 case 'earth':drawing=<>
  <path d="M69 230h342v26H69Z" fill="#bda07e"/>
  <path d="M139 230q5-53 49-82 16-16 45-41 17 5 35 33 58 30 72 90Z" fill="#bf9c74" stroke={P.ink} strokeWidth="3"/>
  <path d="M189 210l15-4M236 162l11 3M282 207l14-1M97 243l10 1M351 243h17M238 236l18 5" stroke="#947958" strokeWidth="3"/>
  {outline('M139 230q5-53 49-82 16-16 45-41 17 5 35 33 58 30 72 90M69 230h342')}
 </>;break;
 case 'metal':drawing=<>
  <path d="M103 153l52-28h100l-30 28 25 61H84Z" fill={P.copper} stroke={P.ink} strokeWidth="3"/>
  <path d="M103 153h122M155 125l-3 28M225 153l30-28v59l-5 30" fill="none" stroke="#e1b491" strokeWidth="3"/>
  <path d="M263 93l48-24h58l-28 24 31 62h-136Z" fill="#aeb6af" stroke={P.ink} strokeWidth="3"/>
  <path d="M263 93h78M311 69l-3 24M341 93l28-24v53l3 33" stroke="#e3e6db" strokeWidth="3" fill="none"/>
  <path d="M143 176l21 2M180 180l10 2M279 119l15 2M317 127l14 3" stroke="#785a45" strokeWidth="3" opacity=".6"/>
  {outline('M103 153l52-28h100l-30 28 25 61H84ZM263 93l48-24h58l-28 24 31 62h-136Z')}
 </>;break;
 case 'foodbowl':drawing=<>
  <path d="M129 155h224q-13 74-77 83h-70q-64-9-77-83Z" fill="#b8a07d" stroke={P.ink} strokeWidth="3"/>
  <ellipse cx="241" cy="155" rx="112" ry="24" fill="#d6c7a4" stroke={P.ink} strokeWidth="3"/>
  <path d="M156 148q83-48 169 0Z" fill="#f3e8c8"/>
  <path d="M189 141l7 1M210 132l6 3M237 140l5-2M263 133h8M288 142l5 2" stroke="#c1ad7e" strokeWidth="3"/>
  <path d="M215 240l-8 22h69l-9-22" fill="#b8a07d" stroke={P.ink} strokeWidth="3"/>
  <path d="M165 79q74-52 152 0Z" fill="#b8a07d" stroke={P.ink} strokeWidth="3"/>
  <path d="M224 49q17-25 34 0" stroke={P.ink} strokeWidth="4" fill="none"/>
  {outline('M165 79q74-52 152 0ZM129 155h224q-13 74-77 83h-70q-64-9-77-83ZM215 240l-8 22h69l-9-22')}
 </>;break;
 case 'dog':drawing=<>
  <path d="M128 129l-29-25-9-39 29 14 31-5 24 29 16 22 110-2 29 26 9 83h-20l-17-63-14 65h-20l-8-63-64-1-10 62h-19l1-70-20-17Z" fill="#c7a681" stroke={P.ink} strokeWidth="3"/>
  <path d="M106 95l-21 13-22-2 1 17 53 13" fill="#c7a681" stroke={P.ink} strokeWidth="3"/>
  <path d="M323 144q51-14 36-60" stroke="#c7a681" strokeWidth="16" fill="none" strokeLinecap="round"/>
  <circle cx="121" cy="98" r="3" fill={P.ink}/><path d="M92 80l9 22" stroke={P.ink} strokeWidth="3"/>
  {outline('M102 83l27 18 37 40 137 4 24 15 3 72M176 155l-1 77M303 145q52-8 56-61M100 117H66')}
 </>;break;
 case 'ice':drawing=<>
  <path d="M102 102l77-41 61 43-6 74-78 40-57-44Z" fill="#d1e8e8" stroke="#7aa0ae" strokeWidth="3"/>
  <path d="M102 102l57 43 81-41M159 145l-3 73" fill="none" stroke="#8fb4be" strokeWidth="3"/>
  <path d="M266 169l67-36 48 34-4 61-67 33-46-34Z" fill="#d1e8e8" stroke="#7aa0ae" strokeWidth="3"/>
  <path d="M266 169l48 35 67-37M314 204l-4 57M133 105l17-8M293 170l15-7" fill="none" stroke="#8fb4be" strokeWidth="3"/>
  {outline('M102 102l77-41 61 43-6 74-78 40-57-44ZM266 169l67-36 48 34-4 61-67 33-46-34Z')}
 </>;break;
 case 'fire':drawing=<>
  <path d="M235 266q-86-11-83-84 4-43 39-86-4 43 21 52 4-69 47-112-10 61 21 100 33 25 37 62 3 62-82 68Z" fill="#d8935b" stroke={P.ink} strokeWidth="2"/>
  <path d="M236 256q-48-10-41-48 4-21 26-47 4 25 17 27 16-31 18-51 32 59 28 82-5 31-48 37Z" fill="#f0c37c"/>
  <path d="M168 121q-26 28-42 33M302 100q23 23 30 42" fill="none" stroke="#e5ae68" strokeWidth="7" strokeLinecap="round"/>
  {outline('M235 266q-86-11-83-84 4-43 39-86-4 43 21 52 4-69 47-112-10 61 21 100 33 25 37 62 3 62-82 68ZM168 121l-42 33M302 100l30 42')}
 </>;break;
 case 'rice':drawing=<>
  <path d="M239 64v179" stroke="#a18e6c" strokeWidth="4" fill="none"/>
  {[{x:178,y:83,r:-38},{x:297,y:83,r:38},{x:159,y:155,r:-76},{x:319,y:155,r:76},{x:178,y:225,r:38},{x:297,y:225,r:-38}].map(({x,y,r},i)=><ellipse key={i} cx={x} cy={y} rx="11" ry="26" transform={`rotate(${r} ${x} ${y})`} fill="#e3cf9e" stroke="#9c8866" strokeWidth="2"/>)}
  {outline('M239 64v179M163 62l30 42M282 104l30-42M133 150l52 10M293 160l52-10M162 245l32-39M281 206l32 39')}
 </>;break;
 case 'altar':drawing=<>
  <path d="M207 65q33-34 66 0v132h-66Z" fill="#ad8d70" stroke={P.ink} strokeWidth="3"/>
  <path d="M218 78q22-22 44 0v108h-44Z" fill="#c6ad8e"/>
  <path d="M186 197h109v20H186ZM164 217h153v25H164Z" fill="#bfa588" stroke={P.ink} strokeWidth="3"/>
  <path d="M136 256h210M157 246v17M324 246v17" stroke="#b8a486" strokeWidth="4" fill="none"/>
  <path d="M239 119v34M229 135h20" stroke="#8f735b" strokeWidth="3"/>
  {outline('M207 65q33-34 66 0v132h-66ZM186 197h109M164 242h153')}
 </>;break;
 case 'cloth':drawing=<>
  <path d="M192 61l46 14 45-14 65 60-41 40-25-20-3 112H195l-2-112-24 20-41-40Z" fill="#aab6a0" stroke={P.ink} strokeWidth="3"/>
  <path d="M192 61l58 67-55 64M283 61l-45 50 43 39M195 192l70 26M195 221h84" fill="none" stroke="#738269" strokeWidth="4"/>
  <path d="M163 117l23 25M310 140l22-24" stroke="#e0e5d6" strokeWidth="3"/>
  {outline('M192 61l58 67-55 64M283 61l-45 50 43 39M192 61l-64 60 41 40M283 61l65 60-41 40M194 143l1 110h84l3-112')}
 </>;break;
 case 'foot':drawing=<>
  <path d="M202 38h66l-12 113q-2 31 23 43l57 21q21 7 20 26l-7 15H194q-24-7-19-35l18-61Z" fill={P.skin} stroke={P.ink} strokeWidth="3"/>
  <path d="M255 156q-30 1-31 32l17 24M195 237h135M321 221q-7 13-4 22M337 228q-6 9-5 16" stroke="#b88e73" strokeWidth="3" fill="none"/>
  {outline('M234 42l-13 121q-10 23-17 57l11 23h123M221 163l24 34 84 32M194 256h155')}
 </>;break;
 case 'jade':drawing=<>
  <path d="M240 23v255" stroke="#9a8864" strokeWidth="4"/>
  {[68,146,224].map((y,i)=><g key={y}><rect x={175-i*4} y={y-20} width={130+i*8} height="40" rx="13" fill={i===1?'#94b9a6':'#b2cbb5'} stroke="#5f8c75" strokeWidth="3"/><circle cx="240" cy={y} r="6" fill={P.paper} stroke="#5f8c75" strokeWidth="2"/><path d={`M${190-i*4} ${y-7}h26`} stroke="#d6e6d4" strokeWidth="3" strokeLinecap="round"/></g>)}
  {outline('M240 23v255M175 68h130M171 146h138M167 224h146')}
 </>;break;
 case 'worm':drawing=<>
  <path d="M214 64q-21 5-22 27 0 30 33 36 62 7 61 46 0 34-65 35-58 0-57 27 0 29 61 28 53-2 73-28-10 36-70 43-85 7-90-40-4-45 75-49 50-3 50-18-2-19-43-25-56-8-54-54 0-37 48-45Z" fill="#a8b287" stroke={P.ink} strokeWidth="3"/>
  <path d="M214 64q36-5 40 14 3 20-36 29l-22-15Z" fill="#b9c297" stroke={P.ink} strokeWidth="3"/>
  <circle cx="235" cy="77" r="3" fill={P.ink}/><path d="M253 86l19 1 7-5M272 87l8 7" fill="none" stroke="#ad6f65" strokeWidth="3"/>
  {outline('M215 67q34-5 39 11 3 18-35 27M214 114q72 9 72 59 0 34-65 35-58 0-57 27 0 29 61 28 53-2 73-28')}
 </>;break;
 case 'cart':drawing=<>
  <path d="M237 29v235" stroke="#9c7a58" strokeWidth="9"/>
  <path d="M171 109h135v96H171Z" fill="#c8ae83" stroke={P.ink} strokeWidth="3"/>
  <path d="M190 110v95M212 110v95M236 110v95M261 110v95M286 110v95" stroke="#a18461" strokeWidth="3"/>
  <path d="M98 159h285" stroke={P.ink} strokeWidth="6"/>
  {[106,374].map(x=><g key={x}><ellipse cx={x} cy="159" rx="17" ry="67" fill="#d1b78e" stroke={P.ink} strokeWidth="5"/><path d={`M${x} 93v132M${x-15} 159h30M${x-11} 113l22 92M${x+11} 113l-22 92`} stroke={P.ink} strokeWidth="3"/></g>)}
  {outline('M237 29v235M171 109h135v96H171ZM98 159h285M106 93v132M374 93v132')}
 </>;break;
 case 'stone':drawing=<>
  <path d="M85 53h293M114 53v31M349 53v31" stroke="#9c8061" strokeWidth="8" fill="none"/>
  <path d="M230 54v56" stroke="#ad986e" strokeWidth="3"/>
  <path d="M228 98l-83 51 25 38 65-32 66 90 41-28-91-119Z" fill="#b0b4a6" stroke={P.ink} strokeWidth="3"/>
  <circle cx="239" cy="112" r="6" fill={P.paper} stroke={P.ink} strokeWidth="2"/>
  <path d="M179 153l45-27M279 175l29 38" stroke="#d9d9c9" strokeWidth="4"/>
  <path d="M91 237l55-29" stroke="#a78b65" strokeWidth="9" strokeLinecap="round"/><path d="M130 197l19 28" stroke={P.ink} strokeWidth="12" strokeLinecap="round"/>
  {outline('M228 98l-83 51 25 38 65-32 66 90 41-28-91-119Z')}
 </>;break;
 default:drawing=<text x="240" y="155" textAnchor="middle" fill={P.ink} fontSize="22">形体说明</text>;
 }
 return <svg className={'root-object'+(trace?' is-traced':'')} viewBox="0 0 480 300" role="img" aria-labelledby={id} xmlns="http://www.w3.org/2000/svg"><title id={id}>{label}</title><rect x="3" y="3" width="474" height="294" rx="20" fill={P.paper}/>{drawing}</svg>;
}
