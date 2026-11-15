import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {zipSync,strToU8} from 'fflate';
globalThis.self={location:'http://localhost/worker.js'};
await import('./worker-src.js');
async function inspect(name,bytes){let result;self.postMessage=x=>result=x;await self.onmessage({data:new File([bytes],name)});return result;}
const image=await inspect('photo.png',await readFile('../../slhjpfp.png'));assert.equal(image.status,'Metadata extracted');
const font=await inspect('font.otf',await readFile('../../fonts/Torus-Regular.otf'));assert.equal(font.status,'Metadata extracted');assert.ok(font.groups.Font['Glyph count']>0);
const zip=await inspect('document.docx',zipSync({'docProps/core.xml':strToU8('<title>Test title</title>'),'hello.txt':strToU8('hello')}));assert.equal(zip.groups.Archive['Entry count'],2);assert.match(zip.groups['docProps/core.xml']['Raw XML metadata'],/Test title/);
const broken=await inspect('broken.png',new Uint8Array([1,2]));assert.equal(broken.status,'Extraction failed');
console.log('Passed: image tags, font names, document ZIP properties, malformed file.');
