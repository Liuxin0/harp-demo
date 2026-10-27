// Narrow pre-publication checks: local links and manifest placeholder integrity.
import {readFile,access} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(resolve(root,'index.html'),'utf8');
const paths=[...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(m=>m[1]).filter(p=>!/^https?:/.test(p));
for(const path of new Set(paths)) await access(resolve(root,path));
const manifest=JSON.parse(await readFile(resolve(root,'audio-manifest.json'),'utf8'));
let pending=0,ready=0;
for(const group of manifest.groups){
  for(const sample of group.samples){
    for(const column of group.columns){
      const path=sample.audio[column.id];
      if(path===null){pending++;continue;}
      if(typeof path!=='string'||!path.trim())throw new Error('Use null for unavailable audio');
      if(!sample.utterance_id||!sample.degradation||!sample.provenance)throw new Error('Audio requires utterance, degradation, and provenance');
      await access(resolve(root,path));ready++;
    }
  }
}
const drawio=await readFile(resolve(root,'assets/harp-method.drawio'),'utf8');
if((drawio.match(/<diagram /g)||[]).length!==2)throw new Error('Expected two draw.io pages');
if(!drawio.includes('source="input" target="stft"'))throw new Error('Diagram connectors must attach to shapes');
console.log(`Local assets present: ${new Set(paths).size}; audio ready: ${ready}; deliberate placeholders: ${pending}; editable draw.io pages: 2.`);
