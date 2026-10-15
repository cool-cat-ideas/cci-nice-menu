import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from '../node_modules/@babel/parser/lib/index.js';
const file = new URL('../src/admin-v2/components/MenuBuilderPanel.jsx', import.meta.url);
let source = readFileSync(file, 'utf8');
const ast = parse(source, {sourceType:'module', plugins:['jsx']});
const edits = []; const used = new Set();
function classText(n) { const attr = n.openingElement.attributes.find(a=>a.name?.name==='className'); return attr ? source.slice(attr.start,attr.end) : ''; }
function rename(n, name, extra='') {
 used.add(name); edits.push([n.openingElement.name.start,n.openingElement.name.end,name]);
 if(n.closingElement) edits.push([n.closingElement.name.start,n.closingElement.name.end,name]);
 if(extra) edits.push([n.openingElement.name.end,n.openingElement.name.end,' '+extra]);
}
function walk(node,parent=null) {
 if (!node || typeof node !== 'object') return;
 if(node.type==='JSXElement') {
  const tag=node.openingElement.name.name; const c=classText(node); const pc=parent?.type==='JSXElement'?classText(parent):'';
  if(tag==='GripVertical') rename(node,'BuilderGrip');
  else if(tag==='div' && c.includes('cci-nice-menu-builder-canvas ')) rename(node,'BuilderCanvas');
  else if(tag==='div' && /cci-nice-menu-mm-(row|column|block)-card/.test(c)) rename(node,'BuilderPanel');
  else if(tag==='div' && /cci-nice-menu-mm-(row|column|block)-header/.test(c)) rename(node,'BuilderHeader');
  else if(tag==='div' && /cci-nice-menu-(node-mini-card|menu-item-pill)/.test(c)) rename(node,'BuilderItem');
  else if(tag==='div' && (/cci-nice-menu-(node-mini-actions|menu-item-actions)/.test(c) || /cci-nice-menu-mm-(row|column|block)-header/.test(pc))) rename(node,'BuilderActions');
  else if(tag==='Button' && /cci-nice-menu-mm-(row|column|block)-header/.test(pc)) rename(node,'BuilderHeading');
  else if((tag==='Button'||tag==='button') && /cci-nice-menu-(node-mini-main|menu-item-main)/.test(c)) rename(node,'BuilderItemMain',tag==='button'?'aria-pressed={active}':'');
  else if(tag==='span' && c.includes('cci-nice-menu-node-mini-copy')) rename(node,'BuilderItemCopy');
  else if((tag==='span'||tag==='strong') && /cci-nice-menu-(node-mini-title|menu-item-label)/.test(c)) rename(node,'BuilderItemTitle');
  else if(tag==='span' && /cci-nice-menu-node-mini-(type|summary)/.test(c)) rename(node,'BuilderItemDescription');
  else if(tag==='span' && c.includes('cci-nice-menu-mm-column-size')) rename(node,'BuilderMetric');
  else if(tag==='span' && c.includes('cci-nice-menu-mm-row-count')) rename(node,'BuilderMetric','kind="count"');
 }
 for(const [key,value] of Object.entries(node)) {
  if(['start','end','loc','extra'].includes(key)) continue;
  if(Array.isArray(value)) value.forEach(child=>walk(child,node.type==='JSXElement'?node:parent));
  else if(value && typeof value==='object') walk(value,node.type==='JSXElement'?node:parent);
 }
}
walk(ast);
for(const [a,b,value] of edits.sort((x,y)=>y[0]-x[0])) source=source.slice(0,a)+value+source.slice(b);
source=source.replace("import { formatAdminDateTime } from '@cci/admin-ui';", "import { formatAdminDateTime, createBuilderComponents } from '@cci/admin-ui';");
source=source.replace('const NODE_TYPES =',`const { ${[...used].join(', ')} } = createBuilderComponents();\n\nconst NODE_TYPES =`);
writeFileSync(file,source); console.log({edits:edits.length,components:[...used]});
