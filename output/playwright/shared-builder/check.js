async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
 const check=(ok,label)=>{if(!ok)throw new Error(label);checks++;};const samples=[];
 const sample=async loc=>loc.evaluate(n=>{const c=getComputedStyle(n);return Object.fromEntries(['display','gap','padding','borderRadius','borderColor','backgroundColor','color','fontSize','fontWeight','lineHeight','boxShadow','width','height'].map(k=>[k,c[k]]));});
 const cdp=await page.context().newCDPSession(page);

 await page.getByRole('button',{name:'Main menu',exact:true}).click();const canvas=page.locator('[data-cci-builder-canvas]');await canvas.waitFor();
 for(const mobile of [false,true]){
  if(mobile)await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});await page.setViewportSize(mobile?{width:390,height:844}:{width:1920,height:1080});
  check(await canvas.locator('button button').count()===0,'No nested interactive controls');
  const header=canvas.locator('.cci-nice-menu-mm-column-header').first(),heading=header.locator('[data-cci-builder-heading]');await heading.scrollIntoViewIfNeeded();
  await heading.focus();await heading.press('Enter');await page.waitForTimeout(200);check(await heading.getAttribute('aria-pressed')==='true','Column selected with keyboard');
  check(await header.locator('..').evaluate(n=>getComputedStyle(n).boxShadow)!=='none','Selected column ring');
  const column={header:await sample(header),heading:await sample(heading),grip:await sample(heading.locator('[data-cci-builder-grip]')),metric:await sample(heading.locator('[data-cci-builder-metric]'))};
  const items=canvas.locator('.cci-nice-menu-node-mini-card').filter({visible:true});
  const unselected=await items.evaluateAll(nodes=>nodes.findIndex(n=>n.querySelector(':scope > [data-cci-builder-item-main]')?.getAttribute('aria-pressed')==='false'));
  const item=items.nth(unselected),main=item.locator(':scope > [data-cci-builder-item-main]');await main.scrollIntoViewIfNeeded();
  if(!mobile){await item.hover();await page.waitForTimeout(180);check(await item.evaluate(n=>getComputedStyle(n).backgroundColor)==='rgb(243, 240, 255)','Tile hover: '+JSON.stringify(await item.evaluate(n=>({color:getComputedStyle(n).backgroundColor,hover:n.matches(':hover'),pressed:n.querySelector(':scope > button')?.getAttribute('aria-pressed'),media:matchMedia('(hover:hover)').matches,outer:n.outerHTML.slice(0,1100)}))));}
  await main.focus();await main.press('Enter');await page.waitForTimeout(180);check(await main.getAttribute('aria-pressed')==='true','Item selected with keyboard');
  check(await item.evaluate(n=>getComputedStyle(n).backgroundColor)==='rgb(107, 75, 232)','Selection is shared violet');
  check(await main.locator('[data-cci-builder-grip]').evaluate(n=>getComputedStyle(n).color)==='rgb(255, 255, 255)','Selected grip has white contrast');
  const tile={item:await sample(item),main:await sample(main),title:await sample(main.locator('[data-cci-builder-item-title]')),description:await sample(main.locator('[data-cci-builder-item-description]').first()),grip:await sample(main.locator('[data-cci-builder-grip]')),action:await sample(item.locator(':scope > [data-cci-builder-actions] > button').first())};samples.push({mobile,column,tile});
  await page.screenshot({path:'output/playwright/shared-builder/menu-'+(mobile?'mobile':'desktop')+'.png'});
  const nav=canvas.locator('.cci-nice-menu-storefront-scroll-top-navigation');await nav.scrollIntoViewIfNeeded();
  const selected=nav.locator('.cci-nice-menu-state-active [data-cci-builder-grip]').first();
  if(!mobile)await selected.hover();check(await selected.evaluate(n=>getComputedStyle(n).color)==='rgb(255, 255, 255)','Active navigation grip remains visible');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
  const frames=await canvas.locator('.cci-nice-menu-storefront-scroll').evaluateAll(nodes=>nodes.map(n=>{const stage=n.querySelector('.cci-nice-menu-storefront-stage'),s=getComputedStyle(n);return{available:n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),width:stage.getBoundingClientRect().width}}));
  check(frames.length>=3&&frames.every(f=>Math.abs(f.width-Math.max(960,f.available))<2),'All menu canvases retain fluid width');
  await nav.getByRole('button',{name:'Edit column',exact:true}).first().click();
  const dialog=page.getByRole('dialog').filter({has:page.locator('#cci-nice-menu-add-content-title')});await dialog.waitFor();
  check(await dialog.evaluate(n=>n.scrollWidth<=n.clientWidth+1),'Menu editor dialog has no overflow');
  const selects=dialog.getByRole('combobox');
  if(await selects.count()){
    await selects.first().click();await page.getByRole('listbox').waitFor();check(await page.getByRole('listbox').isVisible(),'Menu selects are above the shared dialog');
    await page.keyboard.press('Escape');check(await dialog.isVisible(),'Escape from a dropdown keeps the editor open');
  }
  await dialog.getByRole('button',{name:'Cancel',exact:true}).click();check(await dialog.count()===0,'Menu edit cancellation still closes dialog');

 }
 await cdp.detach();check(errors.length===0,'No browser exceptions');return {checks,errors,samples};
}