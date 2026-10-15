import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from '../node_modules/@babel/parser/lib/index.js';
const file=new URL('../src/admin-v2/components/MenuBuilderPanel.jsx',import.meta.url);let s=readFileSync(file,'utf8');const edits=[];
const ast=parse(s,{sourceType:'module',plugins:['jsx']});
const c=n=>{const a=n.openingElement?.attributes.find(a=>a.name?.name==='className');return a?s.slice(a.start,a.end):''};
function walk(n,p=null){if(!n||typeof n!=='object')return;if(n.type==='JSXElement'){
 const tag=n.openingElement.name.name,cls=c(n),pc=p?.type==='JSXElement'?c(p):'';let name;
 if(tag==='div'&&/cci-nice-menu-mm-card(?: |')/.test(cls))name='BuilderPanel';
 if(tag==='div'&&cls.includes('cci-nice-menu-mm-card-header'))name='BuilderHeader';
 if(tag==='Button'&&pc.includes('cci-nice-menu-mm-card-header'))name='BuilderHeading';
 if(tag==='div'&&pc.includes('cci-nice-menu-mm-card-header'))name='BuilderActions';
 if(name){edits.push([n.openingElement.name.start,n.openingElement.name.end,name]);if(n.closingElement)edits.push([n.closingElement.name.start,n.closingElement.name.end,name]);}
}for(const [k,v]of Object.entries(n)){if(['loc','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(x=>walk(x,n.type==='JSXElement'?n:p));else if(v&&typeof v==='object')walk(v,n.type==='JSXElement'?n:p);}}
walk(ast);for(const[a,b,v]of edits.sort((x,y)=>y[0]-x[0]))s=s.slice(0,a)+v+s.slice(b);s=s.replace('    GripVertical,\n','');writeFileSync(file,s);console.log('Shared remaining card headers:',edits.length);
