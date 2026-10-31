import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const base=resolve('dist');
const port=Number(process.argv[2])||4196;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.wasm':'application/wasm','.zip':'application/zip','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{const path=resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==base&&!path.startsWith(base+sep)){res.writeHead(403).end();return;}const file=extname(path)?path:resolve(path,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404).end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
