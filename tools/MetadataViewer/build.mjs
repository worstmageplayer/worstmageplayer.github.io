import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('vendor',{recursive:true});
await build({entryPoints:['worker-src.js'],outdir:'.',entryNames:'worker',chunkNames:'vendor/chunk-[hash]',splitting:true,bundle:true,format:'esm',platform:'browser',external:['./vendor/pdf.mjs'],minify:true,legalComments:'linked'});
for(const [from,to] of [['node_modules/mediainfo.js/dist/MediaInfoModule.wasm','MediaInfoModule.wasm'],['node_modules/pdfjs-dist/legacy/build/pdf.mjs','pdf.mjs'],['node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs','pdf.worker.mjs']])await copyFile(from,`vendor/${to}`);
for(const name of ['exifreader','mediainfo.js','pdfjs-dist','fflate','opentype.js']){for(const filename of ['LICENSE','LICENSE.txt','LICENSE.md']){try{await copyFile(`node_modules/${name}/${filename}`,`vendor/${name}-LICENSE`);break}catch{}}}
