import data from '../data/radical-evolution.json';
export interface EvolutionStage {stage:string;displayLabel?:string;src:string;url:string;provenanceNote:string;galleryUrl:string;license:string;classificationNote?:string}
export interface EvolutionLesson {baseForm:string;sourceUrl:string;stageNames:string[];stages:EvolutionStage[];evolutionNote?:string;shapeFocus?:string;sequenceNote?:string;checked:string}
export const evolutionLessons=data as Record<string,EvolutionLesson>;
/** Select source-attested representatives; a missing gallery is never fabricated. */
export function getPrimaryStages(radicalId:string):EvolutionStage[]{return evolutionLessons[radicalId]?.stages.filter(s=>['甲骨文','金文','说文','楷书'].includes(s.stage))??[];}
export function stageLabel(stage:string):string{return stage==='说文'?'《说文》小篆':stage;}
