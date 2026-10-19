import { __ } from '../../../i18n/i18n';
import { createNode, createColumn, createTabsGroup } from '../model/node.js';

export function createTemplateLink(label, overrides = {}) {
  return createNode({
    type: 'custom',
    label,
    link: '#',
    children: [],
    ...overrides,
  });
}

export function createTemplateText(label, description, overrides = {}) {
  return createNode({
    type: 'text',
    label,
    link: '',
    description,
    children: [],
    ...overrides,
  });
}

export function createTemplateBanner(label, description, overrides = {}) {
  return createNode({
    type: 'banner',
    label,
    link: '#',
    description,
    children: [],
    ...overrides,
  });
}

export function createTemplateImage(label, imageUrl, overrides = {}) {
  return createNode({
    type: 'image',
    label,
    link: '#',
    image_url: imageUrl,
    children: [],
    ...overrides,
  });
}

export function createTemplateMap(label, query, overrides = {}) {
  return createNode({
    type: 'map',
    label,
    link: '#',
    map_query: query,
    map_zoom: 15,
    image_url: '/modules/cci_nice_menu/views/img/showcase-map.svg',
    children: [],
    ...overrides,
  });
}

export function createTemplateVideo(label, overrides = {}) {
  return createNode({
    type: 'video',
    label,
    link: '/',
    video_provider: 'youtube',
    video_url: 'https://www.youtube.com/watch?v=N_OcJBvvecU&t',
    video_aspect: '16:9',
    video_size: 'large',
    video_controls: true,
    video_lazy: true,
    video_muted: true,
    description: 'YouTube without leaving the menu',
    children: [],
    ...overrides,
  });
}

export function createTemplateHook(
  hookName = 'displayReassurance',
  label = 'PrestaShop hook',
  overrides = {},
) {
  return createNode({
    type: 'hook',
    label,
    link: '',
    hook_name: hookName,
    children: [],
    ...overrides,
  });
}

export function createTemplateBlock(label, children = [], overrides = {}) {
  return createNode({
    type: 'block',
    label,
    link: '',
    children,
    ...overrides,
  });
}

export function createReassuranceHookBlock(label = __('Shopping information', 'cci-nice-menu')) {
  return createTemplateHook('displayReassurance', label, {
    component_variant: 'showcase_rail_hook',
  });
}

export function createTemplateColumn(label, span, children = [], overrides = {}) {
  return createNode({
    type: 'column',
    label,
    link: '',
    column_span: span,
    children,
    ...overrides,
  });
}

export function createTemplateRow(label, children = [], overrides = {}) {
  return createNode({
    type: 'row',
    label,
    link: '',
    column_span: 12,
    children,
    ...overrides,
  });
}

export function createLayoutTemplateNode(templateKey) {
  switch (templateKey) {
    case 'layout-row':
      return createTemplateRow('Row', [
        createTemplateColumn('Column 1', 6, []),
        createTemplateColumn('Column 2', 6, []),
      ]);
    case 'blank-column':
      return createColumn(1);
    case 'blank-block':
      return createTemplateBlock('Block', [], { hide_heading: true });
    case 'tabs-group':
      return createTabsGroup(1);
    case 'hero-strip':
      return createTemplateColumn(
        'Hero banner',
        4,
        [
          createTemplateBlock(
            'Hero banner',
            [
              createTemplateBanner(
                'Express yourself',
                'Wear what you love. Unique designs that say more than words.',
                {
                  cta_label: 'View collection',
                  style_background: '#16266b',
                  style_background_2: '#0d6efd',
                  style_text: '#ffffff',
                },
              ),
            ],
            { component_variant: 'hero_strip' },
          ),
        ],
        { component_variant: 'bottom_hero_column' },
      );
    case 'compact-list':
      return createTemplateColumn(
        'Compact list',
        2,
        [
          createTemplateBlock(
            'Bestsellers',
            [
              createTemplateLink('Astronaut graphic tee', {
                icon: 'chevron-right',
                description: '27,90 zł',
              }),
              createTemplateLink('Hummingbird printed t-shirt', {
                icon: 'chevron-right',
                description: '23,52 zł',
              }),
              createTemplateLink('Cool cat t-shirt', {
                icon: 'chevron-right',
                description: '25,90 zł',
              }),
            ],
            {
              component_variant: 'showcase_compact_list',
              description: __('Demo: selected products', 'cci-nice-menu'),
            },
          ),
        ],
        { component_variant: 'showcase_bottom_list_column' },
      );
    case 'benefits-row':
      return createTemplateBlock(
        'Benefits',
        [
          createTemplateText('Premium quality', 'Best materials', { icon: 'shield' }),
          createTemplateText('HD prints', 'Long-lasting and vivid', { icon: 'palette' }),
          createTemplateText('Easy returns', 'Up to 30 days', { icon: 'rotate' }),
          createTemplateText('Secure payments', 'Encrypted transactions', { icon: 'lock' }),
        ],
        {
          component_variant: 'benefits_strip',
          style_radius: '12px',
          hide_heading: true,
        },
      );
    case 'store-card':
      return createTemplateColumn(
        __('Find us', 'cci-nice-menu'),
        4,
        [
          createTemplateBlock(
            __('Find us', 'cci-nice-menu'),
            [
              createTemplateMap(__('Store map', 'cci-nice-menu'), 'Warsaw, Poland', {
                component_variant: 'showcase_map_card',
              }),
              createTemplateText('Cool Cat Ideas Store', '10 Creative Street, 00-001 Warsaw', {
                icon: 'map-pin',
              }),
              createTemplateLink('+48 123 456 789', {
                icon: 'phone',
                link: 'tel:+48123456789',
                description: __('Customer support', 'cci-nice-menu'),
              }),
              createTemplateLink('info@coolcatideas.com', {
                icon: 'envelope',
                link: 'mailto:info@coolcatideas.com',
                description: __('Email us', 'cci-nice-menu'),
              }),
              createTemplateText('Open 9:00 - 17:00', '', {
                icon: 'clock',
                component_variant: 'showcase_store_status',
              }),
            ],
            { component_variant: 'showcase_store_card', columns: 2 },
          ),
        ],
        { component_variant: 'showcase_store_column' },
      );
    case 'media-stack':
      return createTemplateColumn(
        'Campaign',
        3,
        [
          createTemplateBlock(
            'Summer sale',
            [
              createTemplateBanner('Summer sale', '-20% on everything. Until May 31 only', {
                cta_label: 'Sale',
                style_background: '#fff2e8',
                style_background_2: '#ffe2d5',
              }),
              createTemplateBanner('New collection 2024', 'Stand out. See what is new', {
                cta_label: 'Explore',
                style_background: '#f2fbec',
                style_background_2: '#e4f7d7',
              }),
              createTemplateVideo('See how our catalog works'),
            ],
            { component_variant: 'showcase_media_block' },
          ),
        ],
        { component_variant: 'showcase_media_column' },
      );
    case 'footer-actions':
      return createTemplateColumn(
        'Shortcuts',
        12,
        [
          createTemplateBlock(
            'Shortcuts',
            [
              createTemplateLink('Size guide', {
                icon: 'ruler',
                description: 'Find the right fit',
              }),
              createTemplateLink('Care guide', {
                icon: 'scissors',
                description: 'How to care for prints',
              }),
              createTemplateLink('Inspiration and blog', {
                icon: 'palette',
                description: 'Ideas, trends, interviews',
              }),
              createTemplateLink('Personalization', {
                icon: 'pencil',
                description: 'Create your own design',
              }),
            ],
            { component_variant: 'footer_actions', style_radius: '12px' },
          ),
        ],
        { component_variant: 'showcase_footer_column' },
      );
    default:
      return createNode({ type: 'custom', label: 'New item', link: '#', children: [] });
  }
}
