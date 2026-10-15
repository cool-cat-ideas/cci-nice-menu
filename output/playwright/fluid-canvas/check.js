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
  await page.screenshot({path:'output/playwright/fluid-canvas/menu-'+size.width+'.png'});
  if(size.width===390){
   await page.locator('.cci-nice-menu-storefront-scroll-viewport').scrollIntoViewIfNeeded();
   await page.screenshot({path:'output/playwright/fluid-canvas/mobile-dropdown.png'});
   await page.locator('.cci-nice-menu-storefront-scroll-nested').scrollIntoViewIfNeeded();
   await page.screenshot({path:'output/playwright/fluid-canvas/mobile-nested.png'});
  }
 }
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
 await frame.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/fluid-canvas/desktop-final.png'});
 check(errors.length===0,'Browser errors');
 return {checks,errors,measurements};
}