import { normalizeCssLengthValue } from '../../ui/css-length-input';

export const NODE_TYPES = [
  'custom',
  'category',
  'category_tree',
  'product',
  'product_tile',
  'cms_page',
  'blog_post',
  'blog_list',
  'blog_carousel',
  'blog_popular',
  'blog_categories',
  'banner',
  'video',
  'text',
  'image',
  'map',
  'hook',
  'row',
  'column',
  'block',
];

export const nodeLengthUnits = ['px', 'rem', 'em', '%', 'vh', 'vw', 'dvh', 'dvw'];

export const radiusLengthUnits = ['px', 'rem', 'em', '%'];

export const DEFAULT_DISPLAY_OPTIONS = {
  hide_desktop: false,
  hide_tablet: false,
  hide_mobile: false,
};

export const EMPTY_NODE = {
  id: '',
  type: 'custom',
  label: 'New item',
  link: '#',
  heading_link: '',
  heading_link_label: '',
  heading_link_icon: '',
  hide_heading: false,
  entity_id: '',
  label_override: '',
  url_override: '',
  source_label: '',
  source_url: '',
  hook_name: '',
  image_url: '',
  map_query: '',
  map_embed_url: '',
  map_zoom: 15,
  description: '',
  price: '',
  video_provider: 'youtube',
  video_url: '',
  video_poster: '',
  video_aspect: '16:9',
  video_size: 'default',
  video_autoplay: false,
  video_muted: true,
  video_loop: false,
  video_controls: true,
  video_lazy: true,
  video_start: '',
  video_end: '',
  use_fallback_product_tile: false,
  target: false,
  icon: '',
  icon_only: false,
  badge: '',
  cta_label: '',
  banner_eyebrow: '',
  banner_layout: 'horizontal',
  style_background: '',
  style_background_2: '',
  style_text: '',
  style_icon: '',
  style_border: '',
  style_radius: '',
  style_badge_background: '',
  style_badge_text: '',
  tabs_content_height: '',
  tabs_content_height_tablet: '',
  tabs_content_height_mobile: '',
  display_options: { ...DEFAULT_DISPLAY_OPTIONS },
  top_level_placement: '',
  top_level_column_start: 0,
  layout_role: '',
  component_variant: '',
  tabs_orientation: 'vertical',
  columns: 1,
  column_span: 0,
  item_count: 4,
  blog_category_mode: 'all',
  blog_category_ids: [],
  blog_category_hide_empty: true,
  blog_category_sort: 'position',
  blog_category_show_count: true,
  product_count: 0,
  children: [],
};

export const componentVariantClasses = {
  feature_strip: ['cci-nice-menu-showcase-feature-strip'],
  benefits_strip: ['cci-nice-menu-showcase-benefits-block'],
  rail_links: [],
  hero_strip: ['cci-nice-menu-showcase-hero-strip'],
  bottom_hero_column: ['cci-nice-menu-showcase-bottom-hero-column'],
  footer_actions: ['cci-nice-menu-showcase-footer-actions'],
  showcase_catalog_entry: ['cci-nice-menu-showcase-entry', 'cci-nice-menu-showcase-catalog'],
  showcase_entry: ['cci-nice-menu-showcase-entry'],
  showcase_simple_link: ['cci-nice-menu-showcase-simple-link'],
  showcase_tabs_column: ['cci-nice-menu-showcase-tabs'],
  showcase_tabs_block: ['cci-nice-menu-showcase-tabs-block'],
  showcase_link_column: ['cci-nice-menu-showcase-link-column'],
  showcase_link_block: ['cci-nice-menu-showcase-link-block'],
  showcase_secondary_link_block: [
    'cci-nice-menu-showcase-link-block',
    'cci-nice-menu-showcase-secondary-block',
  ],
  showcase_current_link: ['cci-nice-menu-showcase-current-link'],
  showcase_products_column: ['cci-nice-menu-showcase-products-column'],
  showcase_product_grid: [
    'cci-nice-menu-showcase-product-block',
    'cci-nice-menu-showcase-product-grid',
  ],
  showcase_product_grid_three: [
    'cci-nice-menu-showcase-product-block',
    'cci-nice-menu-showcase-product-grid',
    'cci-nice-menu-showcase-three-products',
  ],
  showcase_product_grid_two: [
    'cci-nice-menu-showcase-product-block',
    'cci-nice-menu-showcase-product-grid',
    'cci-nice-menu-showcase-two-products',
  ],
  showcase_media_column: ['cci-nice-menu-showcase-media-column'],
  showcase_media_block: ['cci-nice-menu-showcase-media-block'],
  showcase_action_column: ['cci-nice-menu-showcase-action-column'],
  showcase_card_list: ['cci-nice-menu-showcase-card-list'],
  showcase_collection_column: ['cci-nice-menu-showcase-collection-column'],
  showcase_video_column: ['cci-nice-menu-showcase-video-column'],
  showcase_video_block: ['cci-nice-menu-showcase-video-block'],
  showcase_video_feature: ['cci-nice-menu-showcase-video-feature'],
  showcase_secondary_row: ['cci-nice-menu-showcase-secondary-row'],
  showcase_bottom_list_column: ['cci-nice-menu-showcase-bottom-list-column'],
  showcase_compact_list: ['cci-nice-menu-showcase-compact-list'],
  showcase_blog_list: ['cci-nice-menu-showcase-blog-list'],
  showcase_blog_carousel: ['cci-nice-menu-showcase-blog-carousel'],
  showcase_blog_popular: ['cci-nice-menu-showcase-blog-popular'],
  showcase_blog_categories: ['cci-nice-menu-showcase-blog-categories'],
  showcase_blog_sticky: ['cci-nice-menu-showcase-blog-sticky'],
  showcase_store_column: ['cci-nice-menu-showcase-store-column'],
  showcase_store_card: ['cci-nice-menu-showcase-store-card'],
  showcase_map_card: ['cci-nice-menu-showcase-map-card'],
  showcase_store_status: ['cci-nice-menu-showcase-store-status'],
  showcase_brands_column: ['cci-nice-menu-showcase-brands-column'],
  showcase_brand_grid: ['cci-nice-menu-showcase-brand-grid'],
  showcase_footer_column: ['cci-nice-menu-showcase-footer-column'],
  showcase_header: ['cci-nice-menu-showcase-header'],
  showcase_header_block: ['cci-nice-menu-showcase-header-block'],
  showcase_header_column: ['cci-nice-menu-showcase-header-column'],
  showcase_rail_service: ['cci-nice-menu-showcase-rail-service'],
  showcase_rail_hook: ['cci-nice-menu-showcase-rail-hook'],
  card_list_action: ['cci-nice-menu-showcase-simple-link', 'cci-nice-menu-card-list-action'],
  category_browser_header: ['cci-nice-menu-category-browser-header'],
  category_browser_header_block: ['cci-nice-menu-category-browser-header-block'],
  category_browser_header_column: ['cci-nice-menu-category-browser-header-column'],
  category_browser_tree_block: ['cci-nice-menu-category-browser-tree-block'],
  category_browser_tree_column: ['cci-nice-menu-category-browser-tree-column'],
  live_category_view_all: ['cci-nice-menu-live-category-view-all'],
  dynamic_catalog_tabs: ['cci-nice-menu-dynamic-catalog-tabs'],
  dynamic_catalog_block: ['cci-nice-menu-dynamic-catalog-block'],
  dynamic_category_column: ['cci-nice-menu-dynamic-category-column'],
  dynamic_category_block: ['cci-nice-menu-dynamic-category-block'],
  bestsellers_header: ['cci-nice-menu-bestsellers-header'],
  promotions_header: ['cci-nice-menu-promotions-header'],
  brand_logo_gildan: ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-gildan'],
  brand_logo_fruit: ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-fruit'],
  brand_logo_bc: ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-bc'],
  brand_logo_stanley: ['cci-nice-menu-brand-logo', 'cci-nice-menu-brand-stanley'],
};

export function normalizeOptionalNodeLength(value, fallback = '1rem', units = nodeLengthUnits) {
  return normalizeCssLengthValue(value, {
    fallback,
    units,
    min: 0,
    max: 1000,
    allowEmpty: true,
  });
}

export function randomId() {
  return `node_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export function sanitizeNodeType(type) {
  return NODE_TYPES.includes(type) ? type : 'custom';
}

export function normalizeHeadingAction(node = {}) {
  let label = typeof node.heading_link_label === 'string' ? node.heading_link_label : '';
  const hasIcon = Object.prototype.hasOwnProperty.call(node, 'heading_link_icon');
  let icon = hasIcon && typeof node.heading_link_icon === 'string' ? node.heading_link_icon : '';

  if (!hasIcon && /\s*\u2192\s*$/.test(label)) {
    label = label.replace(/\s*\u2192\s*$/, '').trim();
    icon = 'arrow-right';
  }

  return { label, icon };
}

export function normalizeLayoutRole(role) {
  const value = String(role || '')
    .trim()
    .toLowerCase();

  if (value === 'rail' || value === 'tabs') {
    return 'tabs';
  }

  return '';
}

export function normalizeTabsOrientation(value) {
  return String(value || '')
    .trim()
    .toLowerCase() === 'horizontal'
    ? 'horizontal'
    : 'vertical';
}

export function normalizeBannerLayout(value) {
  return String(value || '')
    .trim()
    .toLowerCase() === 'vertical'
    ? 'vertical'
    : 'horizontal';
}

export function normalizeComponentVariant(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
  const aliases = {
    benefits: 'benefits_strip',
    benefit_strip: 'benefits_strip',
    hero: 'hero_strip',
    hero_banner: 'hero_strip',
    bottom_hero: 'bottom_hero_column',
    hero_column: 'bottom_hero_column',
    footer: 'footer_actions',
    footer_strip: 'footer_actions',
    footer_feature_strip: 'footer_actions',
    rail: 'rail_links',
    rail_text: 'rail_links',
    rail_links: 'rail_links',
    support_links: 'rail_links',
    catalog_entry: 'showcase_catalog_entry',
    showcase_catalog: 'showcase_catalog_entry',
    entry: 'showcase_entry',
    visual: 'showcase_entry',
    visual_menu: 'showcase_entry',
    menu_grid: 'showcase_entry',
    menu_grid_entry: 'showcase_entry',
    visual_card: 'showcase_card_list',
    visual_deal_link: 'showcase_simple_link',
    visual_card_cta: 'showcase_simple_link',
    visual_media_block: 'showcase_media_block',
    promotion_countdown: 'showcase_store_status',
    visual_feature_strip: 'benefits_strip',
    simple_link: 'showcase_simple_link',
    tabs: 'showcase_tabs_column',
    tabs_column: 'showcase_tabs_column',
    tabs_block: 'showcase_tabs_block',
    link_column: 'showcase_link_column',
    link_block: 'showcase_link_block',
    secondary_link_block: 'showcase_secondary_link_block',
    current_link: 'showcase_current_link',
    products_column: 'showcase_products_column',
    product_grid: 'showcase_product_grid',
    product_grid_three: 'showcase_product_grid_three',
    product_grid_two: 'showcase_product_grid_two',
    media_column: 'showcase_media_column',
    media_block: 'showcase_media_block',
    action_column: 'showcase_action_column',
    card_list: 'showcase_card_list',
    collection_column: 'showcase_collection_column',
    video_column: 'showcase_video_column',
    video_block: 'showcase_video_block',
    video_feature: 'showcase_video_feature',
    secondary_row: 'showcase_secondary_row',
    bottom_list_column: 'showcase_bottom_list_column',
    compact_list: 'showcase_compact_list',
    blog_list: 'showcase_blog_list',
    blog_carousel: 'showcase_blog_carousel',
    blog_popular: 'showcase_blog_popular',
    blog_categories: 'showcase_blog_categories',
    blog_sticky: 'showcase_blog_sticky',
    store_column: 'showcase_store_column',
    store_card: 'showcase_store_card',
    map_card: 'showcase_map_card',
    brands_column: 'showcase_brands_column',
    brand_grid: 'showcase_brand_grid',
    footer_column: 'showcase_footer_column',
    rail_service: 'showcase_rail_service',
    rail_hook: 'showcase_rail_hook',
    card_list_action: 'card_list_action',
    showcase_header: 'showcase_header',
    showcase_header_block: 'showcase_header_block',
    showcase_header_column: 'showcase_header_column',
    category_browser_header: 'category_browser_header',
    category_browser_header_block: 'category_browser_header_block',
    category_browser_header_column: 'category_browser_header_column',
    category_browser_tree_block: 'category_browser_tree_block',
    category_browser_tree_column: 'category_browser_tree_column',
    live_category_view_all: 'live_category_view_all',
    dynamic_catalog_tabs: 'dynamic_catalog_tabs',
    dynamic_catalog_block: 'dynamic_catalog_block',
    dynamic_category_column: 'dynamic_category_column',
    dynamic_category_block: 'dynamic_category_block',
    bestsellers_header: 'bestsellers_header',
    promotions_header: 'promotions_header',
    gildan_logo: 'brand_logo_gildan',
    fruit_logo: 'brand_logo_fruit',
    bc_logo: 'brand_logo_bc',
    stanley_logo: 'brand_logo_stanley',
  };
  const candidate = aliases[normalized] || normalized;

  return Object.prototype.hasOwnProperty.call(componentVariantClasses, candidate) ? candidate : '';
}

export function inferComponentVariantFromClass(cssClass = '') {
  const value = String(cssClass || '');

  if (value.includes('cci-nice-menu-showcase-catalog')) {
    return 'showcase_catalog_entry';
  }
  if (value.includes('cci-nice-menu-showcase-entry')) {
    return 'showcase_entry';
  }
  if (value.includes('cci-nice-menu-showcase-secondary-block')) {
    return 'showcase_secondary_link_block';
  }
  if (value.includes('cci-nice-menu-showcase-three-products')) {
    return 'showcase_product_grid_three';
  }
  if (value.includes('cci-nice-menu-showcase-two-products')) {
    return 'showcase_product_grid_two';
  }
  if (value.includes('cci-nice-menu-brand-gildan')) {
    return 'brand_logo_gildan';
  }
  if (value.includes('cci-nice-menu-brand-fruit')) {
    return 'brand_logo_fruit';
  }
  if (value.includes('cci-nice-menu-brand-bc')) {
    return 'brand_logo_bc';
  }
  if (value.includes('cci-nice-menu-brand-stanley')) {
    return 'brand_logo_stanley';
  }

  const classes = value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const found = Object.entries(componentVariantClasses).find(([, variantClasses]) =>
    variantClasses.some((className) => classes.includes(className)),
  );
  if (found) {
    return found[0];
  }

  if (value.includes('cci-nice-menu-showcase-footer-actions')) {
    return 'footer_actions';
  }
  if (value.includes('cci-nice-menu-showcase-benefits-block')) {
    return 'benefits_strip';
  }
  if (value.includes('cci-nice-menu-showcase-feature-strip')) {
    return 'feature_strip';
  }
  if (value.includes('cci-nice-menu-showcase-hero-strip')) {
    return 'hero_strip';
  }
  if (value.includes('cci-nice-menu-showcase-bottom-hero-column')) {
    return 'bottom_hero_column';
  }

  return '';
}

export function isTabsColumn(node = {}) {
  const variant =
    normalizeComponentVariant(node.component_variant || '') ||
    inferComponentVariantFromClass(node.css_class || '');

  return (
    node?.type === 'column' &&
    (normalizeLayoutRole(node.layout_role) === 'tabs' || variant === 'showcase_tabs_column')
  );
}

export function isRowWrapper(node = {}) {
  const variant =
    normalizeComponentVariant(node.component_variant || '') ||
    inferComponentVariantFromClass(node.css_class || '');

  return (
    node?.type === 'row' ||
    (node?.type === 'column' && variant === 'showcase_secondary_row' && !isTabsColumn(node)) ||
    (node?.type === 'column' &&
      !isTabsColumn(node) &&
      (node.children || []).some((child) => child?.type === 'column'))
  );
}

export function wrapDirectLayoutColumnsInRow(label = '', children = []) {
  const safeChildren = Array.isArray(children) ? children : [];
  const hasDirectColumns = safeChildren.some((child) => child?.type === 'column');
  const hasRows = safeChildren.some((child) => isRowWrapper(child));

  if (!hasDirectColumns || hasRows) {
    return safeChildren;
  }

  const rowLabel = String(label || '').trim();

  return [
    {
      ...EMPTY_NODE,
      id: randomId(),
      type: 'row',
      label: rowLabel ? `${rowLabel} row` : 'Row',
      link: '',
      component_variant: '',
      column_span: 12,
      columns: 1,
      children: safeChildren,
    },
  ];
}

export function normalizeDisplayOptions(options = {}) {
  const source = options && typeof options === 'object' ? options : {};

  return {
    hide_desktop: Boolean(source.hide_desktop || source.hide_on_desktop),
    hide_tablet: Boolean(source.hide_tablet || source.hide_on_tablet),
    hide_mobile: Boolean(source.hide_mobile || source.hide_on_mobile),
  };
}

export function getNodeDisplayOptions(node = {}) {
  return normalizeDisplayOptions({
    ...node,
    ...(node?.display_options && typeof node.display_options === 'object'
      ? node.display_options
      : {}),
  });
}

export function normalizeNode(node = {}) {
  const { css_class: legacyCssClass, ...nodeWithoutLegacyCss } = node;
  let type = sanitizeNodeType(node.type || 'custom');
  const layoutRole = normalizeLayoutRole(node.layout_role || '');
  const rawCssClass = typeof legacyCssClass === 'string' ? legacyCssClass : '';
  const componentVariant =
    normalizeComponentVariant(node.component_variant || '') ||
    inferComponentVariantFromClass(rawCssClass);
  let children = Array.isArray(node.children) ? node.children.map(normalizeNode) : [];
  if (type === 'column' && componentVariant === 'showcase_secondary_row') {
    type = 'row';
  }
  if (!['row', 'column', 'block'].includes(type)) {
    children = wrapDirectLayoutColumnsInRow(node.label || node.source_label || '', children);
  }
  const headingAction = normalizeHeadingAction(node);

  return {
    ...EMPTY_NODE,
    ...nodeWithoutLegacyCss,
    id: node.id || randomId(),
    type,
    label:
      node.label ||
      (type === 'row'
        ? 'Row'
        : type === 'column'
          ? 'Column'
          : type === 'block'
            ? 'Block'
            : 'New item'),
    link: typeof node.link === 'string' ? node.link : '#',
    heading_link: typeof node.heading_link === 'string' ? node.heading_link : '',
    heading_link_label: headingAction.label,
    heading_link_icon: headingAction.icon,
    hide_heading: Boolean(node.hide_heading),
    hook_name: typeof node.hook_name === 'string' ? node.hook_name : '',
    layout_role: layoutRole,
    component_variant: componentVariant,
    tabs_orientation:
      layoutRole === 'tabs'
        ? normalizeTabsOrientation(node.tabs_orientation || 'vertical')
        : 'vertical',
    columns: Number(node.columns || 1),
    column_span: Number(node.column_span || 0),
    item_count: Number(node.item_count || node.product_count || 4),
    style_background: typeof node.style_background === 'string' ? node.style_background : '',
    style_background_2: typeof node.style_background_2 === 'string' ? node.style_background_2 : '',
    style_text: typeof node.style_text === 'string' ? node.style_text : '',
    style_icon: typeof node.style_icon === 'string' ? node.style_icon : '',
    style_border: typeof node.style_border === 'string' ? node.style_border : '',
    style_radius:
      typeof node.style_radius === 'string'
        ? normalizeOptionalNodeLength(node.style_radius, '12px', radiusLengthUnits)
        : '',
    style_badge_background:
      typeof node.style_badge_background === 'string' ? node.style_badge_background : '',
    style_badge_text: typeof node.style_badge_text === 'string' ? node.style_badge_text : '',
    tabs_content_height:
      typeof node.tabs_content_height === 'string'
        ? normalizeOptionalNodeLength(node.tabs_content_height, '680px')
        : '',
    tabs_content_height_tablet:
      typeof node.tabs_content_height_tablet === 'string'
        ? normalizeOptionalNodeLength(node.tabs_content_height_tablet, '620px')
        : '',
    tabs_content_height_mobile:
      typeof node.tabs_content_height_mobile === 'string'
        ? normalizeOptionalNodeLength(node.tabs_content_height_mobile, '72vh')
        : '',
    display_options: getNodeDisplayOptions(node),
    top_level_placement: node.top_level_placement === 'right' ? 'right' : '',
    top_level_column_start: Math.max(0, Math.min(12, Number(node.top_level_column_start || 0))),
    cta_label: typeof node.cta_label === 'string' ? node.cta_label : '',
    banner_eyebrow:
      type === 'banner' && typeof node.banner_eyebrow === 'string' ? node.banner_eyebrow : '',
    banner_layout:
      type === 'banner' ? normalizeBannerLayout(node.banner_layout || 'horizontal') : 'horizontal',
    map_query: typeof node.map_query === 'string' ? node.map_query : '',
    map_embed_url: typeof node.map_embed_url === 'string' ? node.map_embed_url : '',
    map_zoom: Number(node.map_zoom || 15),
    target: Boolean(node.target),
    icon_only: Boolean(node.icon_only),
    children,
  };
}

export function createNode(overrides = {}) {
  return normalizeNode({ id: randomId(), ...overrides });
}

export function createColumn(index = 1) {
  return createNode({
    type: 'column',
    label: `Column ${index}`,
    link: '',
    layout_role: '',
    tabs_orientation: 'vertical',
    column_span: 0,
    children: [],
  });
}

export function createTabsGroup(index = 1) {
  return createNode({
    type: 'column',
    label: `Tabs group ${index}`,
    link: '',
    layout_role: 'tabs',
    tabs_orientation: 'vertical',
    component_variant: 'showcase_tabs_column',
    children: [
      createNode({
        type: 'block',
        label: 'Tabs',
        link: '',
        component_variant: 'showcase_tabs_block',
        children: [
          createNode({
            type: 'custom',
            label: 'Tab 1',
            link: '#',
            children: [createColumn(1)],
          }),
        ],
      }),
    ],
  });
}
