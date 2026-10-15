import {readFileSync,writeFileSync} from 'node:fs';
import postcss from '../node_modules/postcss/lib/postcss.js';
const file=new URL('../src/admin-v2/admin.css',import.meta.url);const root=postcss.parse(readFileSync(file,'utf8'));let removed=0;
root.walkRules(rule=>{
 const selectors=rule.selector.split(',').map(s=>s.trim());
 if(selectors.every(s=>/^\.cci-nice-menu-builder-canvas \.cci-nice-menu-mm-(column|row|block)-(card|header)$/.test(s))){rule.remove();removed++;}
});
writeFileSync(file,root.toString());console.log('Removed canonical panel overrides:',removed);
