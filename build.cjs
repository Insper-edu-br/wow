const fs=require('node:fs');const path=require('node:path');const root=__dirname;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const css=fs.readFileSync(path.join(root,'src/styles.css'),'utf8');
const scripts=['vendor/three-0.160.0.min.js','src/data.js','src/sim.js','src/scene.js','src/app.js'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const out=html.replace('<link rel="stylesheet" href="src/styles.css">',`<style>${css}</style>`).replace(/\s*<script src="vendor\/three-0\.160\.0\.min\.js"><\/script>[\s\S]*?<script src="src\/app\.js"><\/script>/,()=>`\n<script>${scripts}</script>`);
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/Emberglass-Demo-2026-09-27.html'),out);console.log(`Built ${Buffer.byteLength(out).toLocaleString()} bytes`);
