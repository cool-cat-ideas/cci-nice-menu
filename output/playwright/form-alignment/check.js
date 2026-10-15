async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
 const check=(condition,message)=>{if(!condition)throw new Error(message);checks++;};
 await page.getByRole('button',{name:'Main menu',exact:true}).waitFor();
 await page.getByRole('button',{name:'Main menu',exact:true}).click();
 await page.locator('.cci-nice-menu-storefront-stage').first().waitFor();
 const measurements=[];
 for(const size of [{width:2560,height:1440},{width:1920,height:1080},{width:1280,height:900},{width:768,height:1024},{width:390,height:844}]){
  await page.setViewportSize(size);await page.waitForTimeout(200);
  const result=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth,frames:[...document.querySelectorAll('.cci-nice-menu-storefront-scroll')].map(n=>{
   const style=getComputedStyle(n),stage=n.querySelector('.cci-nice-menu-storefront-stage');
   return {available:n.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),stage:stage.getBoundingClientRect().width,scroll:n.scrollWidth,client:n.clientWidth,kind:n.className};
  })}));
  check(result.body<=size.width+1,'Page overflow at '+size.width);
  check(result.frames.length>=3,'Missing header, dropdown, or nested tabs');
  for(const frame of result.frames){
   check(Math.abs(frame.stage-Math.max(960,frame.available))<2,'Canvas does not fill its container at '+size.width);
   check(frame.scroll<=Math.max(frame.client,frame.stage+32)+2,'Unexpected canvas overflow');
  }
  measurements.push(result);
  await page.screenshot({path:'output/playwright/form-alignment/menu-'+size.width+'.png'});
  if(size.width===390){
   await page.locator('.cci-nice-menu-storefront-scroll-viewport').scrollIntoViewIfNeeded();
   await page.screenshot({path:'output/playwright/form-alignment/mobile-dropdown.png'});
   await page.locator('.cci-nice-menu-storefront-scroll-nested').scrollIntoViewIfNeeded();
   await page.screenshot({path:'output/playwright/form-alignment/mobile-nested.png'});
  }
 }
 await page.setViewportSize({width:1920,height:1080});
 const styles=await page.evaluate(()=>{const root=document.querySelector('#cci-nice-menu-admin-root');const css=getComputedStyle(root);const sample=document.createElement('i');root.append(sample);sample.style.background='var(--cci-nice-menu-brand-soft)';const soft=getComputedStyle(sample).backgroundColor;sample.style.background='var(--cci-nice-menu-brand)';const brand=getComputedStyle(sample).backgroundColor;sample.remove();return {soft,brand};});
 const header=page.locator('.cci-nice-menu-builder-canvas .cci-nice-menu-mm-column-header').first();
 const select=header.locator(':scope > button').first();
 await header.hover();await page.waitForTimeout(180);
 check(await header.evaluate(n=>getComputedStyle(n).backgroundColor)===styles.soft,'Column header hover matches Forms');
 await select.focus();await page.waitForTimeout(180);
 check(await header.evaluate(n=>getComputedStyle(n).backgroundColor)===styles.soft,'Column header keyboard focus matches Forms');
 await select.press('Enter');
 check(await select.getAttribute('aria-pressed')==='true','Keyboard selects column');
 check((await header.locator('..').evaluate(n=>getComputedStyle(n).boxShadow))!=='none','Selected column has a visible ring');
 const mini=page.locator('.cci-nice-menu-builder-canvas .cci-nice-menu-node-mini-card').filter({visible:true}).first();
 check(await mini.count()>0,'Menu content cards are present');
 await mini.hover();await page.waitForTimeout(180);
 check(await mini.evaluate(n=>getComputedStyle(n).backgroundColor)===styles.soft,'Content card hover matches Forms');
 const miniSelect=mini.locator(':scope > .cci-nice-menu-node-mini-main');
 await miniSelect.focus();await miniSelect.press('Enter');await page.waitForTimeout(180);
 check(await mini.getAttribute('data-selected')==='true','Keyboard selects content card');
 check(await miniSelect.getAttribute('aria-pressed')==='true','Content selection is accessible');
 check(await mini.evaluate(n=>getComputedStyle(n).backgroundColor)===styles.brand,'Selected content uses the Forms accent');
 check(await mini.locator(':scope > .cci-nice-menu-node-mini-main .cci-nice-menu-node-mini-title').evaluate(n=>getComputedStyle(n).color)==='rgb(255, 255, 255)','Selected title contrast');
 const title=await mini.locator(':scope > .cci-nice-menu-node-mini-main .cci-nice-menu-node-mini-title').boundingBox();
 const actions=await mini.locator(':scope > .cci-nice-menu-node-mini-actions').boundingBox();
 const cardWidth=(await mini.boundingBox()).width;
 check(cardWidth<=280 || Math.abs(actions.y-title.y)<36,'Actions remain beside content title');
 const type=mini.locator(':scope > .cci-nice-menu-node-mini-main .cci-nice-menu-node-mini-type');
 if(await type.count())check(await type.evaluate(n=>getComputedStyle(n).backgroundColor)==='rgba(0, 0, 0, 0)','Content type is a plain subtitle');
 check(await mini.getByRole('button',{name:'Edit item',exact:true}).first().getAttribute('title')==='Edit item','Edit action tooltip');
 check(await mini.getByRole('button',{name:'Delete item',exact:true}).first().getAttribute('title')==='Delete item','Delete action tooltip');
 const headings=await page.locator('.cci-nice-menu-builder-canvas .cci-nice-menu-mm-column-header').evaluateAll(nodes=>nodes.map(n=>{const title=n.querySelector(':scope > button > .tw-truncate'),action=n.querySelector(':scope > [data-no-drag]');const rect=n.getBoundingClientRect();return {width:rect.width,titleWidth:title?.getBoundingClientRect().width,actionRight:action?.getBoundingClientRect().right,right:rect.right};}));
 for(const h of headings){check(h.titleWidth>30,'Column title remains readable');check(h.actionRight<=h.right+1,'Column actions stay within their header');}
 const copies=await page.locator('.cci-nice-menu-node-mini-copy').evaluateAll(nodes=>nodes.map(n=>({type:n.querySelector('.cci-nice-menu-node-mini-type')?.textContent,summary:n.querySelector('.cci-nice-menu-node-mini-summary')?.textContent})));
 check(copies.every(c=>!c.type||!c.summary||c.type.trim().toLowerCase()!==c.summary.trim().toLowerCase()),'No duplicate content type labels');
 await mini.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/form-alignment/selected-card-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await mini.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/form-alignment/selected-card-mobile.png'});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Touch viewport has no page overflow');
 await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp.detach();
 await page.setViewportSize({width:1920,height:1080});
 const nav=page.locator('.cci-nice-menu-storefront-scroll-top-navigation');
 await nav.scrollIntoViewIfNeeded();
 await nav.getByRole('button',{name:'Edit column',exact:true}).first().click();
 await page.getByRole('dialog').waitFor();check(await page.getByRole('dialog').isVisible(),'Edit column dialog');
 await page.getByRole('button',{name:'Close add content modal',exact:true}).click();
 check(await page.getByRole('dialog').count()===0,'Close edit dialog');
 await page.setViewportSize({width:1920,height:1080});
 const section=nav.locator('xpath=ancestor::section[1]');
 const oldColumns=await nav.locator('.cci-nice-menu-mm-column-card').count();
 await section.getByRole('button',{name:'Add column',exact:true}).click();
 check(await nav.locator('.cci-nice-menu-mm-column-card').count()===oldColumns+1,'Add column inserts into the draft');
 const rail=page.locator('.cci-nice-menu-tabs-list.cci-nice-menu-state-vertical').first();
 await rail.getByRole('button').filter({hasText:/^Accessories/}).first().click();
 check((await page.locator('.cci-nice-menu-storefront-stage').count())>=2,'Switch dropdown tab');
 await rail.getByRole('button').filter({hasText:/^Clothes/}).first().click();
 check(await page.locator('.cci-nice-menu-storefront-scroll-nested').count()===1,'Restore nested tab');
 const frame=page.locator('.cci-nice-menu-storefront-scroll-top-navigation');
 await frame.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/form-alignment/desktop-final.png'});
 check(errors.length===0,'Browser errors');
 return {checks,errors,measurements};
}