{*
 * CCI Nice Menu - Frontend markup
 *}

<style id="{$navId|escape:'html':'UTF-8'}-responsive">
#{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root .cci-nice-menu-mobile-toggle {
  display: none !important;
}
@media (min-width: {$desktopBreakpoint|escape:'html':'UTF-8'}px) {
  html body #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root .cci-nice-menu-level-0 {
    display: flex !important;
    justify-content: flex-start !important;
    gap: var(--cci-nice-menu-item-gap, 8px) !important;
    column-gap: var(--cci-nice-menu-item-gap, 8px) !important;
    row-gap: var(--cci-nice-menu-item-gap, 8px) !important;
  }
  html body #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root .cci-nice-menu-level-0 > .cci-nice-menu-item:first-child {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
@media (max-width: {$mobileBreakpoint|escape:'html':'UTF-8'}px) {
  #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root .cci-nice-menu-mobile-toggle {
    display: flex !important;
  }
  #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root .cci-nice-menu-level-0 {
    display: none !important;
    max-height: 0;
    overflow: hidden;
  }
  #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root.cci-nice-menu-state-open .cci-nice-menu-level-0 {
    display: grid !important;
    max-height: var(--cci-nice-menu-mobile-menu-max-height, calc(100dvh - 96px));
    overflow-x: hidden !important;
    overflow-y: auto !important;
    overscroll-behavior-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: auto;
  }
  #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root.cci-nice-menu-state-open .cci-nice-menu-level-0 > .cci-nice-menu-item:not(.cci-nice-menu-hidden-mobile) { display: block !important; }
  #{$mobileMenuId|escape:'html':'UTF-8'}.cci-nice-menu-root.cci-nice-menu-state-open .cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-hidden-mobile { display: none !important; }
}
</style>

<nav id="{$navId|escape:'html':'UTF-8'}" class="cci-nice-menu-nav" data-cci-nice-menu-hook="{$menuHook|escape:'html':'UTF-8'}" aria-label="{$menuName|escape:'html':'UTF-8'}">
  <div id="{$mobileMenuId|escape:'html':'UTF-8'}" class="{$menuLayoutClass|escape:'html':'UTF-8'}" data-open-on="{$menuOpenOn|escape:'html':'UTF-8'}" data-mobile-breakpoint="{$mobileBreakpoint|escape:'html':'UTF-8'}" style="{$menuStyle|escape:'html':'UTF-8'}">
    <button type="button" class="cci-nice-menu-mobile-toggle" data-mobile-menu-toggle="true" aria-expanded="false" aria-label="{l s='Toggle navigation menu' mod='cci_nice_menu'}">
      <span class="cci-nice-menu-mobile-toggle-icon" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="cci-nice-menu-mobile-toggle-label">{l s='Menu' mod='cci_nice_menu'}</span>
      <span class="cci-nice-menu-mobile-toggle-caret" aria-hidden="true"></span>
    </button>
    {$menuMarkup nofilter}
  </div>
</nav>
