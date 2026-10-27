import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.drawio':'application/xml','.md':'text/markdown; charset=utf-8','.wav':'audio/wav','.mp3':'audio/mpeg'};
createServer(async (req,res) => {
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root, '.'+(pathname==='/'?'/index.html':pathname));
    if (!file.startsWith(root+sep)) {res.writeHead(403).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  } catch {res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('HARP preview: http://127.0.0.1:4173/'));
