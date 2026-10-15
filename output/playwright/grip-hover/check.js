async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let checks=0;
 const check=(condition,message)=>{if(!condition)throw new Error(message);checks++;};
 await page.setViewportSize({width:1920,height:1080});
 await page.getByRole('button',{name:'Main menu',exact:true}).click();
 const nav=page.locator('.cci-nice-menu-storefront-scroll-top-navigation');
 const column=nav.locator('.cci-nice-menu-mm-column-card').first();
 const active=column.locator('.cci-nice-menu-menu-item-pill.cci-nice-menu-state-active').first();
 const read=()=>active.evaluate(n=>({background:getComputedStyle(n).backgroundColor,color:getComputedStyle(n.querySelector('.cci-nice-menu-menu-item-grip')).color,opacity:getComputedStyle(n.querySelector('.cci-nice-menu-menu-item-grip')).opacity,display:getComputedStyle(n.querySelector('.cci-nice-menu-menu-item-grip')).display}));
 await nav.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(160);
 const initial=await read();check(initial.color!==initial.background,'Initial grip contrast');
 await column.locator('.cci-nice-menu-mm-column-header').hover();await page.waitForTimeout(160);
 const hovered=await read();check(hovered.color!==hovered.background,'Column hover makes the selected item grip blend into its background: '+JSON.stringify(hovered));
 await active.hover();await page.waitForTimeout(160);
 check((await read()).color===(await active.locator('.cci-nice-menu-menu-item-label').evaluate(n=>getComputedStyle(n).color)),'Selected grip keeps the label color on item hover');
 await page.screenshot({path:'output/playwright/grip-hover/desktop.png'});
 const unselected=column.locator('.cci-nice-menu-menu-item-pill:not(.cci-nice-menu-state-active)').first();
 await unselected.hover();await page.waitForTimeout(160);
 check(await unselected.locator('.cci-nice-menu-menu-item-grip').evaluate(n=>getComputedStyle(n).color)!==await unselected.evaluate(n=>getComputedStyle(n).backgroundColor),'Unselected grip contrast');
 await active.locator('.cci-nice-menu-menu-item-main').focus();
 check((await read()).color!== (await read()).background,'Keyboard focus keeps selected grip contrast');
 await page.setViewportSize({width:390,height:844});
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 await active.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/grip-hover/mobile.png'});
 check((await read()).color!== (await read()).background,'Touch viewport grip contrast');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No page overflow');
 await cdp.detach();check(errors.length===0,'Browser errors');return {checks,errors};
}