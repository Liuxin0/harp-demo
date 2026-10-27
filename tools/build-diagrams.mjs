import {writeFileSync, mkdirSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateRawSync} from 'node:zlib';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(root,'assets'); mkdirSync(dir,{recursive:true});
const colors={input:'#f1f5f9',feature:'#fff2cc',neural:'#e4dfec',periodic:'#dae8fc',aperiodic:'#fce4d6',output:'#e2f0d9',analysis:'#f4f1f7'};
const n=(id,x,y,w,h,lines,color='input',extra={})=>({id,x,y,w,h,lines,fill:colors[color],...extra});
const e=(from,to,points,color='#334155',dashed=false)=>({from,to,points,color,dashed});
const pages=[{
 id:'overview',name:'01 Overall pipeline',title:'HARP · overall reconstruction pipeline',W:1440,H:750,
 subtitle:'A small predictor estimates reconstruction controls; the renderer determines how they become speech.',
 nodes:[
 n('input',25,200,130,65,['Band-limited','LR waveform']),n('stft',205,200,130,65,['STFT','magnitude + phase']),
 n('feature',385,90,190,70,['Mixed-carrier features','257 STFT → 128 ERB'],'feature'),
 n('predictor',625,90,210,70,['Compact predictor','4 causal Conv + 2 GRU'],'neural'),
 n('heads',885,90,205,70,['Two WGMM heads','weights · spreads · gains'],'neural'),
 n('mixed',385,265,190,70,['Mixed magnitude carrier','LR + rectified-LR path'],'periodic'),
 n('flat',625,365,210,60,['Flat aperiodic carrier','W = exp(−1)'],'aperiodic'),
 n('renderer',885,265,205,85,['Dual-branch renderer','Periodic + aperiodic','LAEA on aperiodic only'],'aperiodic'),
 n('sum',1150,280,55,55,['+'],'output',{circle:true}),
 n('synth',1245,265,175,85,['Waveform synthesis','iSTFT','reconstructed speech'],'output'),
 n('phase',1245,395,175,60,['Phase-flipped','LR phase']),
 n('note',355,465,760,45,['Observed LR magnitude is retained in the final magnitude sum.'],'input',{plain:true}),
 n('analysis-title',30,550,1380,40,['ANALYSIS ONLY · not a deployment input or a source of training supervision'],'analysis',{plain:true}),
 n('target',80,610,230,65,['Paired LR / HR targets','HF residual'],'analysis'),
 n('fit',430,610,370,65,['HR-informed EM-style fitting','Related fixed-centre dual-carrier family'],'analysis'),
 n('reference',920,610,370,65,['Target-side representational reference','LSD 0.65; not a deployable condition'],'analysis'),
 ],edges:[
 e('input','stft',[[155,232],[205,232]]),e('stft','mixed',[[335,232],[355,232],[355,300],[385,300]]),
 e('mixed','feature',[[480,265],[480,160]]),e('feature','predictor',[[575,125],[625,125]]),
 e('predictor','heads',[[835,125],[885,125]]),e('heads','renderer',[[987,160],[987,265]]),
 e('mixed','renderer',[[575,300],[885,300]],'#2563eb'),e('flat','renderer',[[835,395],[865,395],[865,330],[885,330]],'#c76530'),
 e('renderer','sum',[[1090,307],[1150,307]]),e('sum','synth',[[1205,307],[1245,307]]),
 e('stft','sum',[[270,265],[270,445],[1177,445],[1177,335]]),
 e('stft','phase',[[270,265],[270,495],[1332,495],[1332,455]],'#64748b',true),
 e('phase','synth',[[1332,395],[1332,350]],'#64748b',true),
 e('target','fit',[[310,642],[430,642]],'#78648c',true),e('fit','reference',[[800,642],[920,642]],'#78648c',true)
 ]
},{
 id:'renderer',name:'02 Branch renderer and LAEA',title:'HARP · inside the dual-branch renderer',W:1440,H:710,
 subtitle:'The branch roles are designed reconstruction contributions, not identified physical sources.',
 nodes:[
 n('bv',35,175,205,70,['Mixed carrier Bv','Harmonic support'],'periodic'),
 n('ev',655,75,255,70,['Periodic WGMM + frame gain','Ev(f,t) and Gv(t)'],'neural'),
 n('pv',660,175,245,70,['Periodic contribution','Pv = Gv × Bv × Ev'],'periodic'),
 n('bc',35,345,205,70,['Flat carrier W','Deterministic support'],'aperiodic'),
 n('ec',345,455,255,70,['Aperiodic WGMM + frame gain','Ec(f,t) and Gc(t)'],'neural'),
 n('pre',345,345,255,70,['Candidate aperiodic contribution','Apre = Gc × W × Ec'],'aperiodic'),
 n('laea',660,345,245,70,['LAEA local calibration','Acal = exp(m × log Apre)'],'aperiodic'),
 n('lr-local',660,455,245,70,['LR local log magnitude','conditions LAEA'],'input'),
 n('lr-add',980,75,220,70,['Observed LR magnitude','retained in output'],'input'),
 n('addition',1050,270,60,60,['+'],'output',{circle:true}),
 n('magnitude',1180,255,230,90,['Reconstructed magnitude','|LR| + Pv + Acal'],'output'),
 n('explain',50,575,1340,90,['LAEA acts only on the assembled aperiodic log branch: u = log Apre; m = mask(u + log|LR|), 0 < m < 1.',
 'This is exponent calibration, not linear-amplitude masking. WGMM weights still affect level; gain is not a unique scale coordinate.'],'input',{plain:true})
 ],edges:[
 e('bv','pv',[[240,210],[660,210]],'#2563eb'),e('ev','pv',[[782,145],[782,175]],'#78648c'),
 e('bc','pre',[[240,380],[345,380]],'#c76530'),e('ec','pre',[[472,455],[472,415]],'#78648c'),
 e('pre','laea',[[600,380],[660,380]],'#c76530'),e('lr-local','laea',[[782,455],[782,415]],'#64748b',true),
 e('pv','addition',[[905,210],[1080,210],[1080,270]],'#2563eb'),
 e('laea','addition',[[905,380],[1080,380],[1080,330]],'#c76530'),
 e('lr-add','addition',[[1090,145],[1150,145],[1150,235],[1080,235],[1080,270]]),
 e('addition','magnitude',[[1110,300],[1180,300]])
 ]
}];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll('\n','&#10;');
function diagram(p){
 const nodes=p.nodes.map(v=>`<mxCell id="${v.id}" value="${esc(v.lines.join('\n'))}" style="${v.plain?'text;':v.circle?'ellipse;':'rounded=1;arcSize=12;'}whiteSpace=wrap;html=0;fontFamily=Helvetica;fontSize=${v.plain?17:18};fontColor=#1f2937;fillColor=${v.plain?'none':v.fill};strokeColor=${v.plain?'none':'#475569'};strokeWidth=1.5;" vertex="1" parent="1"><mxGeometry x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" as="geometry"/></mxCell>`).join('');
 const edges=p.edges.map((v,i)=>{
  const a=p.nodes.find(n=>n.id===v.from), b=p.nodes.find(n=>n.id===v.to);
  const start=v.points[0], end=v.points.at(-1);
  const anchors=`exitX=${(start[0]-a.x)/a.w};exitY=${(start[1]-a.y)/a.h};entryX=${(end[0]-b.x)/b.w};entryY=${(end[1]-b.y)/b.h};exitPerimeter=0;entryPerimeter=0;`;
  return `<mxCell id="e${i}" source="${v.from}" target="${v.to}" style="edgeStyle=none;rounded=0;html=0;endArrow=block;endFill=1;strokeWidth=1.7;strokeColor=${v.color};dashed=${v.dashed?1:0};${anchors}" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points">${v.points.slice(1,-1).map(([x,y])=>`<mxPoint x="${x}" y="${y}"/>`).join('')}</Array></mxGeometry></mxCell>`;
 }).join('');
 const title=`<mxCell id="title" value="${esc(p.title)}" style="text;html=0;fontSize=26;fontStyle=1;align=left;strokeColor=none;fillColor=none;" vertex="1" parent="1"><mxGeometry x="20" y="8" width="1390" height="35" as="geometry"/></mxCell>`;
 const subtitle=`<mxCell id="subtitle" value="${esc(p.subtitle)}" style="text;html=0;fontSize=16;align=left;strokeColor=none;fillColor=none;" vertex="1" parent="1"><mxGeometry x="20" y="45" width="1390" height="25" as="geometry"/></mxCell>`;
 return `<diagram name="${p.name}" id="${p.id}"><mxGraphModel dx="${p.W}" dy="${p.H}" grid="1" gridSize="10" page="1" pageScale="1" pageWidth="${p.W}" pageHeight="${p.H}" background="#ffffff"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${title}${subtitle}${edges}${nodes}</root></mxGraphModel></diagram>`;
}
function svg(p){
 const markers=[...new Set(p.edges.map(e=>e.color))].map((c,i)=>`<marker id="a${i}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${c}"/></marker>`).join('');
 const cols=[...new Set(p.edges.map(e=>e.color))];
 const edges=p.edges.map(v=>`<polyline points="${v.points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${v.color}" stroke-width="1.8" ${v.dashed?'stroke-dasharray="6 4"':''} marker-end="url(#a${cols.indexOf(v.color)})"/>`).join('');
 const nodes=p.nodes.map(v=>`${v.plain?'':v.circle?`<ellipse cx="${v.x+v.w/2}" cy="${v.y+v.h/2}" rx="${v.w/2}" ry="${v.h/2}" fill="${v.fill}" stroke="#475569" stroke-width="1.5"/>`:`<rect x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" rx="9" fill="${v.fill}" stroke="#475569" stroke-width="1.5"/>`}<text x="${v.x+v.w/2}" y="${v.y+v.h/2-(v.lines.length-1)*12+6}" text-anchor="middle" font-size="${v.plain?17:v.circle?30:18}">${v.lines.map((s,i)=>`<tspan x="${v.x+v.w/2}" dy="${i?24:0}">${esc(s)}</tspan>`).join('')}</text>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" viewBox="0 0 ${p.W} ${p.H}"><title id="title">${esc(p.title)}</title><desc id="desc">${esc(p.subtitle)}</desc><rect width="100%" height="100%" fill="white"/><defs>${markers}</defs><g font-family="Arial,Helvetica,sans-serif" fill="#1f2937"><text x="20" y="33" font-size="27" font-weight="700">${esc(p.title)}</text><text x="20" y="61" font-size="16" fill="#64748b">${esc(p.subtitle)}</text>${edges}${nodes}</g></svg>`;
}
const xml=`<mxfile host="app.diagrams.net" agent="HARP diagram source" version="26.0.0">${pages.map(diagram).join('')}</mxfile>`;
writeFileSync(resolve(dir,'harp-method.drawio'),xml);
for(const p of pages)writeFileSync(resolve(dir,`harp-${p.id}.svg`),svg(p));
writeFileSync(resolve(dir,'drawio-open-url.txt'),'https://app.diagrams.net/?splash=0&offline=1#R'+deflateRawSync(Buffer.from(encodeURIComponent(xml))).toString('base64'));
console.log('Generated editable draw.io (2 pages) and two SVG previews.');
