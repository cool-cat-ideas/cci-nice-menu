import { __ } from '../../../i18n/i18n';
import { isRowWrapper, createNode } from '../model/node.js';
import { createReassuranceHookBlock } from './layout-templates.js';

export function createRetailShowcaseTree() {
  const showcaseImages = {
    tshirt: '/1-default_lg/hummingbird-printed-t-shirt.jpg',
    sweater: '/21-default_lg/brown-bear-printed-sweater.jpg',
    graphic: '/1-default_lg/hummingbird-printed-t-shirt.jpg',
    mug: '/6-default_lg/mug-the-best-is-yet-to-come.jpg',
    notebook: '/18-default_lg/mountain-fox-notebook.jpg',
    poster: '/3-default_lg/the-best-is-yet-to-come-framed-poster.jpg',
    map: '/modules/cci_nice_menu/views/img/showcase-map.svg',
  };
  const link = (label, overrides = {}) =>
    createNode({
      type: 'custom',
      label,
      link: '#',
      children: [],
      ...overrides,
    });
  const map = (label, query, overrides = {}) =>
    createNode({
      type: 'map',
      label,
      link: '',
      map_query: query,
      map_zoom: 15,
      image_url: showcaseImages.map,
      children: [],
      ...overrides,
    });
  const category = (id, label, overrides = {}) =>
    createNode({
      type: 'category',
      label,
      link: '#',
      entity_id: String(id),
      source_label: label,
      source_url: '#',
      children: [],
      ...overrides,
    });
  const categoryTree = (id, label, overrides = {}) =>
    createNode({
      type: 'category_tree',
      label,
      link: '#',
      entity_id: String(id),
      label_override: label,
      source_label: label,
      source_url: '#',
      children: [],
      ...overrides,
    });
  const product = (id, label, overrides = {}) =>
    createNode({
      type: 'product',
      label,
      link: '#',
      entity_id: String(id),
      source_label: label,
      source_url: '#',
      children: [],
      ...overrides,
    });
  const productTile = (id, label, overrides = {}) =>
    createNode({
      type: 'product_tile',
      label,
      link: '#',
      entity_id: String(id),
      source_label: label,
      source_url: '#',
      use_fallback_product_tile: false,
      children: [],
      ...overrides,
    });
  const cms = (id, label, overrides = {}) =>
    createNode({
      type: 'cms_page',
      label,
      link: '#',
      entity_id: String(id),
      label_override: label,
      source_label: label,
      source_url: '#',
      children: [],
      ...overrides,
    });
  const text = (label, description, overrides = {}) =>
    createNode({
      type: 'text',
      label,
      link: '',
      description,
      children: [],
      ...overrides,
    });
  const banner = (label, description, overrides = {}) =>
    createNode({
      type: 'banner',
      label,
      link: '#',
      description,
      children: [],
      ...overrides,
    });
  const image = (label, imageUrl, overrides = {}) =>
    createNode({
      type: 'image',
      label,
      link: '#',
      image_url: imageUrl,
      children: [],
      ...overrides,
    });
  const video = (label, overrides = {}) =>
    createNode({
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
  const hook = (hookName, label = 'PrestaShop hook', overrides = {}) =>
    createNode({
      type: 'hook',
      label,
      link: '',
      hook_name: hookName,
      children: [],
      ...overrides,
    });
  const blogPost = (label, description, overrides = {}) =>
    createNode({
      type: 'blog_post',
      label,
      link: '#',
      description,
      children: [],
      ...overrides,
    });
  const blogCollection = (type, label, description, overrides = {}) =>
    createNode({
      type,
      label,
      link: '',
      description,
      item_count: 4,
      children: [],
      ...overrides,
    });
  const block = (label, children = [], overrides = {}) =>
    createNode({
      type: 'block',
      label,
      link: '',
      children,
      ...overrides,
    });
  const column = (label, span, children = [], overrides = {}) =>
    createNode({
      type: 'column',
      label,
      link: '',
      column_span: span,
      children,
      ...overrides,
    });
  const row = (label, children = [], overrides = {}) =>
    createNode({
      type: 'row',
      label,
      link: '',
      column_span: 12,
      children,
      ...overrides,
    });
  const wrapTabLayoutRows = (label, children = []) => {
    const safeChildren = Array.isArray(children) ? children : [];
    const hasDirectColumns = safeChildren.some((child) => child?.type === 'column');
    const hasRows = safeChildren.some((child) => isRowWrapper(child));

    return hasDirectColumns && !hasRows ? [row(`${label} row`, safeChildren)] : safeChildren;
  };
  const tab = (label, children = [], overrides = {}) => {
    const layoutChildren = wrapTabLayoutRows(label, children);

    return link(label, {
      link_mode: 'span',
      columns: layoutChildren.length || 1,
      children: layoutChildren,
      ...overrides,
    });
  };
  const categoryTab = (id, label, children = [], overrides = {}) => {
    const layoutChildren = wrapTabLayoutRows(label, children);

    return category(id, label, {
      link_mode: 'span',
      columns: layoutChildren.length || 1,
      children: layoutChildren,
      ...overrides,
    });
  };
  const showcaseHeaderColumn = (label, description, icon) =>
    column(
      label,
      12,
      [
        block(
          label,
          [
            text(label, description, {
              icon,
              component_variant: 'showcase_header',
            }),
          ],
          { component_variant: 'showcase_header_block', hide_heading: true },
        ),
      ],
      { component_variant: 'showcase_header_column' },
    );
  const showcaseCardListColumn = (label, icon, children = []) =>
    column(
      label,
      3,
      [
        block(label, children, {
          component_variant: 'showcase_card_list',
          icon,
        }),
      ],
      { component_variant: 'showcase_action_column' },
    );
  const showcaseBenefitsColumn = (label, children = []) =>
    column(
      label,
      12,
      [
        block(label, children, {
          component_variant: 'benefits_strip',
          style_radius: '12px',
          hide_heading: true,
        }),
      ],
      { component_variant: 'showcase_footer_column' },
    );
  const showcaseMediaColumn = (label, children = []) =>
    column(
      label,
      3,
      [
        block(label, children, {
          component_variant: 'showcase_media_block',
        }),
      ],
      {
        component_variant: 'showcase_media_column',
      },
    );
  const bestsellerItem = (_id, label, imageUrl = '', overrides = {}) =>
    link(label, {
      image_url: imageUrl,
      ...overrides,
    });
  const showcaseCardAction = (label) =>
    link(label, {
      component_variant: 'card_list_action',
    });
  const dealItem = (label, badge = '', _tone = '') =>
    link(label, {
      badge,
    });
  const railService = (label, description, icon, overrides = {}) =>
    link(label, {
      icon,
      description,
      component_variant: 'showcase_rail_service',
      ...overrides,
    });
  const tabGroup = (label, tabs = [], orientation = 'vertical', railExtras = [], overrides = {}) =>
    column(
      label,
      12,
      [block(label, [...tabs, ...railExtras], { component_variant: 'showcase_tabs_block' })],
      {
        layout_role: 'tabs',
        tabs_orientation: orientation,
        component_variant: 'showcase_tabs_column',
        ...overrides,
      },
    );
  const promotionsShowcaseTab = () =>
    tab(
      __('Promotions and deals', 'cci-nice-menu'),
      [
        row(__('Promotion intro', 'cci-nice-menu'), [
          showcaseHeaderColumn(
            __('Promotion studio', 'cci-nice-menu'),
            __(
              'Product bundles, timed campaigns and discount-driven merchandising blocks.',
              'cci-nice-menu',
            ),
            'tag',
          ),
        ]),
        row(__('Featured promotion row', 'cci-nice-menu'), [
          column(
            __('Deal spotlight', 'cci-nice-menu'),
            4,
            [
              block(
                __('Deal spotlight', 'cci-nice-menu'),
                [
                  banner(
                    __('Summer print kit', 'cci-nice-menu'),
                    __(
                      'T-shirt, mug and poster bundle with limited campaign pricing.',
                      'cci-nice-menu',
                    ),
                    {
                      cta_label: __('Shop the kit', 'cci-nice-menu'),
                      banner_eyebrow: __('Bundle -25%', 'cci-nice-menu'),
                      image_url: showcaseImages.tshirt,
                      style_background: '#fff4e6',
                      style_background_2: '#ffe4c2',
                      style_text: '#14233d',
                    },
                  ),
                  text(
                    __('Code PRINT25', 'cci-nice-menu'),
                    __('Apply at checkout before Sunday night.', 'cci-nice-menu'),
                    {
                      icon: 'ticket',
                      component_variant: 'showcase_store_status',
                    },
                  ),
                ],
                {
                  component_variant: 'showcase_media_block',
                  description: __(
                    'Hero promotion with product image, CTA and coupon code.',
                    'cci-nice-menu',
                  ),
                },
              ),
            ],
            { component_variant: 'showcase_media_column' },
          ),
          column(
            __('Promoted products', 'cci-nice-menu'),
            8,
            [
              block(
                __('Promoted products', 'cci-nice-menu'),
                [
                  productTile(1, __('Hummingbird printed t-shirt', 'cci-nice-menu'), {
                    label_override: __('Hummingbird printed t-shirt', 'cci-nice-menu'),
                    description: __(
                      'Campaign product with active catalog pricing.',
                      'cci-nice-menu',
                    ),
                  }),
                  productTile(2, __('Hummingbird printed sweater', 'cci-nice-menu'), {
                    label_override: __('Hummingbird printed sweater', 'cci-nice-menu'),
                    description: __(
                      'Second promoted product in the same visual grid.',
                      'cci-nice-menu',
                    ),
                  }),
                  productTile(6, __('Mug deal', 'cci-nice-menu'), {
                    label_override: __('Mug deal', 'cci-nice-menu'),
                    description: __('Accessory item promoted next to apparel.', 'cci-nice-menu'),
                  }),
                ],
                {
                  component_variant: 'showcase_product_grid_two',
                  description: __(
                    'Theme-rendered product cards for discount campaigns.',
                    'cci-nice-menu',
                  ),
                  heading_link: '/',
                  heading_link_label: __('View all deals', 'cci-nice-menu'),
                  heading_link_icon: 'arrow-right',
                },
              ),
            ],
            { component_variant: 'showcase_products_column' },
          ),
        ]),
        row(__('Merchandising row', 'cci-nice-menu'), [
          column(
            __('Discount product rail', 'cci-nice-menu'),
            4,
            [
              block(
                __('Discount product rail', 'cci-nice-menu'),
                [
                  product(1, __('Printed t-shirt deal', 'cci-nice-menu'), {
                    label_override: __('Printed t-shirt deal', 'cci-nice-menu'),
                    description: __('-20% active promotion', 'cci-nice-menu'),
                  }),
                  product(2, __('Sweater campaign', 'cci-nice-menu'), {
                    label_override: __('Sweater campaign', 'cci-nice-menu'),
                    description: __('Limited apparel offer', 'cci-nice-menu'),
                  }),
                  product(6, __('Customizable mug bundle', 'cci-nice-menu'), {
                    label_override: __('Customizable mug bundle', 'cci-nice-menu'),
                    description: __('Pair with apparel and save', 'cci-nice-menu'),
                  }),
                  product(3, __('Poster add-on', 'cci-nice-menu'), {
                    label_override: __('Poster add-on', 'cci-nice-menu'),
                    description: __('Bundle add-on product', 'cci-nice-menu'),
                  }),
                ],
                {
                  component_variant: 'showcase_compact_list',
                  description: __(
                    'Compact product rows for quick promotion scanning.',
                    'cci-nice-menu',
                  ),
                  heading_link: '/',
                  heading_link_label: __('View discounted products', 'cci-nice-menu'),
                  heading_link_icon: 'arrow-right',
                },
              ),
            ],
            { component_variant: 'showcase_bottom_list_column' },
          ),
          column(
            __('Campaign paths', 'cci-nice-menu'),
            4,
            [
              block(
                __('Campaign paths', 'cci-nice-menu'),
                [
                  dealItem(__('Flash deals', 'cci-nice-menu'), __('Today only', 'cci-nice-menu')),
                  dealItem(__('Bundles', 'cci-nice-menu'), __('Save more', 'cci-nice-menu')),
                  dealItem(
                    __('Outlet picks', 'cci-nice-menu'),
                    __('Up to 50% off', 'cci-nice-menu'),
                  ),
                  link(__('Gift-ready sets', 'cci-nice-menu'), {
                    icon: 'gift',
                    description: __('Curated sets for quick seasonal shopping.', 'cci-nice-menu'),
                  }),
                  dealItem(__('Back to school sets', 'cci-nice-menu'), __('-30%', 'cci-nice-menu')),
                  showcaseCardAction(__('Open campaign landing', 'cci-nice-menu')),
                ],
                {
                  component_variant: 'showcase_card_list',
                  icon: 'sparkles',
                  description: __(
                    'Campaign links with badges and clear calls to action.',
                    'cci-nice-menu',
                  ),
                },
              ),
            ],
            { component_variant: 'showcase_action_column' },
          ),
          column(
            __('Promotion media', 'cci-nice-menu'),
            4,
            [
              block(
                __('Promotion media', 'cci-nice-menu'),
                [
                  banner(
                    __('Gift bundle builder', 'cci-nice-menu'),
                    __('A visual shortcut to product sets and campaign pages.', 'cci-nice-menu'),
                    {
                      cta_label: __('Build a bundle', 'cci-nice-menu'),
                      banner_eyebrow: __('Campaign', 'cci-nice-menu'),
                      image_url: showcaseImages.sweater,
                      banner_layout: 'vertical',
                      style_background: '#f2fbec',
                      style_background_2: '#e2f8cf',
                      style_text: '#14233d',
                    },
                  ),
                ],
                {
                  component_variant: 'showcase_media_block',
                  description: __(
                    'Vertical promotion banner using the shared banner component.',
                    'cci-nice-menu',
                  ),
                },
              ),
            ],
            { component_variant: 'showcase_media_column' },
          ),
        ]),
        row(__('Promotion shortcuts row', 'cci-nice-menu'), [
          showcaseBenefitsColumn(__('Promotion shortcuts', 'cci-nice-menu'), [
            text(__("Today's deals", 'cci-nice-menu'), __('New deals every 24h', 'cci-nice-menu'), {
              icon: 'tag',
            }),
            text(__('2-for-1 offers', 'cci-nice-menu'), __('Double the value', 'cci-nice-menu'), {
              icon: 'percent',
            }),
            text(
              __('Free shipping offers', 'cci-nice-menu'),
              __('On orders over 150 zł', 'cci-nice-menu'),
              { icon: 'truck' },
            ),
            text(__('Last chance', 'cci-nice-menu'), __('Deals ending soon', 'cci-nice-menu'), {
              icon: 'clock',
            }),
          ]),
        ]),
      ],
      {
        icon: 'tag',
        description: __(
          'Product promotion examples, bundles and limited-time campaign blocks.',
          'cci-nice-menu',
        ),
      },
    );

  const topLink = (node) => ({
    ...node,
    column_span: 0,
    top_level_placement: '',
    top_level_column_start: 0,
  });

  const topItems = [
    link('Product catalog', {
      icon: 'list',
      component_variant: 'showcase_catalog_entry',
      column_span: 2,
      children: [
        tabGroup(
          'Store categories',
          [
            categoryTab(
              3,
              'Clothes',
              [
                column(
                  'Clothing',
                  2,
                  [
                    block(
                      'Clothing',
                      [
                        link('T-shirts', { component_variant: 'showcase_current_link' }),
                        link('Sweatshirts and hoodies'),
                        link('Polo shirts'),
                        link('Shirts'),
                        link('Tank tops'),
                      ],
                      { component_variant: 'showcase_link_block' },
                    ),
                    block(
                      'Accessories',
                      [
                        link('Caps and beanies'),
                        link('Bags and backpacks'),
                        link('Socks'),
                        link('Jewelry'),
                        link('Cases and accessories'),
                      ],
                      { component_variant: 'showcase_secondary_link_block' },
                    ),
                    block(
                      'Special collections',
                      [link('New arrivals'), link('Bestsellers'), link('Sale')],
                      { component_variant: 'showcase_secondary_link_block' },
                    ),
                  ],
                  { component_variant: 'showcase_link_column' },
                ),
                column(
                  'T-shirts - recommended for you',
                  7,
                  [
                    block(
                      'T-shirts - recommended for you',
                      [
                        productTile(1, 'Hummingbird printed t-shirt'),
                        productTile(2, 'Hummingbird printed sweater'),
                        productTile(9, 'Mountain fox cushion'),
                        productTile(11, 'Hummingbird cushion'),
                      ],
                      {
                        component_variant: 'showcase_product_grid',
                        heading_link: '/',
                        heading_link_label: __('View all', 'cci-nice-menu'),
                        heading_link_icon: 'arrow-right',
                      },
                    ),
                    block(
                      'Benefits',
                      [
                        text('Premium quality', 'Best materials', { icon: 'shield' }),
                        text('HD prints', 'Long-lasting and vivid', { icon: 'palette' }),
                        text('Easy returns', 'Up to 30 days', { icon: 'rotate' }),
                        text('Secure payments', 'Encrypted transactions', { icon: 'lock' }),
                      ],
                      {
                        component_variant: 'benefits_strip',
                        style_radius: '12px',
                        hide_heading: true,
                      },
                    ),
                  ],
                  { component_variant: 'showcase_products_column' },
                ),
                column(
                  'Campaign',
                  3,
                  [
                    block(
                      'Summer sale',
                      [
                        banner('Summer sale', '-20% on everything. Until May 31 only', {
                          cta_label: 'Sale',
                          image_url: showcaseImages.tshirt,
                          style_background: '#fff2e8',
                          style_background_2: '#ffe2d5',
                        }),
                        banner('New collection 2024', 'Stand out. See what is new', {
                          cta_label: 'Explore',
                          image_url: showcaseImages.sweater,
                          style_background: '#f2fbec',
                          style_background_2: '#e4f7d7',
                        }),
                        video('See how our catalog works', { label_override: '' }),
                      ],
                      { component_variant: 'showcase_media_block' },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
              ],
              {
                icon: 'shirt',
                product_count: 2,
                description: 'T-shirts, hoodies, shirts and more',
              },
            ),
            categoryTab(
              6,
              'Accessories',
              [
                column(
                  'Bestsellers',
                  6,
                  [
                    block(
                      'Bestsellers',
                      [
                        productTile(15, 'Pack Mug + Framed poster'),
                        productTile(16, 'Mountain fox notebook'),
                        productTile(17, 'Brown bear notebook'),
                      ],
                      { component_variant: 'showcase_product_grid_three' },
                    ),
                  ],
                  { component_variant: 'showcase_products_column' },
                ),
                column(
                  'Quick actions',
                  3,
                  [
                    block(
                      'Quick actions',
                      [
                        link('Sale', { icon: 'tag' }),
                        cms(1, 'Delivery terms', {
                          icon: 'truck',
                          label_override: 'Delivery terms',
                        }),
                        cms(5, 'Secure shopping', {
                          icon: 'shield',
                          label_override: 'Secure shopping',
                        }),
                        cms(4, 'Contact an advisor', {
                          icon: 'phone',
                          label_override: 'Contact an advisor',
                        }),
                      ],
                      { component_variant: 'showcase_card_list' },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
                column(
                  'Featured offer',
                  3,
                  [
                    block(
                      'Featured offer',
                      [
                        banner(
                          'Express yourself',
                          'Wear what you love. Unique designs that say more than words.',
                          {
                            cta_label: 'View collection',
                            image_url: showcaseImages.graphic,
                            style_background: '#16266b',
                            style_background_2: '#0d6efd',
                            style_text: '#ffffff',
                          },
                        ),
                        productTile(19, 'Customizable mug'),
                      ],
                      { component_variant: 'showcase_media_block' },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
              ],
              {
                icon: 'gift',
                product_count: 11,
                description: 'Accessories, gadgets, stickers',
              },
            ),
            categoryTab(
              9,
              'Art',
              [
                column(
                  'Video story',
                  5,
                  [
                    block(
                      'Video story',
                      [
                        video('Creative process', {
                          description: 'Responsive YouTube video with controls and lazy loading.',
                          component_variant: 'showcase_video_feature',
                        }),
                      ],
                      { component_variant: 'showcase_video_block' },
                    ),
                  ],
                  { component_variant: 'showcase_video_column' },
                ),
                column(
                  'Poster collection',
                  4,
                  [
                    block(
                      'Poster collection',
                      [
                        product(3, "The best is yet to come' Framed poster", { icon: 'tag' }),
                        product(4, 'The adventure begins Framed poster', { icon: 'tag' }),
                        product(5, 'Today is a good day Framed poster', { icon: 'tag' }),
                        productTile(12, 'Mountain fox - Vector graphics'),
                      ],
                      { component_variant: 'showcase_card_list' },
                    ),
                  ],
                  { component_variant: 'showcase_collection_column' },
                ),
                column(
                  'Quick actions',
                  3,
                  [
                    block(
                      'Quick actions',
                      [
                        link('Sale', { icon: 'tag' }),
                        cms(4, 'Contact us', { icon: 'phone', label_override: 'Contact us' }),
                        cms(5, 'Secure shopping', {
                          icon: 'shield',
                          label_override: 'Secure shopping',
                        }),
                      ],
                      { component_variant: 'showcase_card_list' },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
              ],
              {
                icon: 'palette',
                product_count: 7,
                description: 'Graphics, posters, wall art',
              },
            ),
            tab(
              __('Category Browser', 'cci-nice-menu'),
              [
                column(
                  __('Shop categories', 'cci-nice-menu'),
                  12,
                  [
                    block(
                      __('Category browser header', 'cci-nice-menu'),
                      [
                        text(
                          __('Shop categories', 'cci-nice-menu'),
                          __('Explore all product groups and find what you love.', 'cci-nice-menu'),
                          {
                            icon: 'shopping-bag',
                            component_variant: 'category_browser_header',
                          },
                        ),
                      ],
                      { component_variant: 'category_browser_header_block', hide_heading: true },
                    ),
                  ],
                  { component_variant: 'category_browser_header_column' },
                ),
                column(
                  __('Category Browser', 'cci-nice-menu'),
                  9,
                  [
                    block(
                      __('Category tree', 'cci-nice-menu'),
                      [
                        categoryTree(2, __('All categories', 'cci-nice-menu'), {
                          icon: 'folder-tree',
                        }),
                      ],
                      { component_variant: 'category_browser_tree_block', hide_heading: true },
                    ),
                  ],
                  { component_variant: 'category_browser_tree_column' },
                ),
                column(
                  __('Featured collection', 'cci-nice-menu'),
                  3,
                  [
                    block(
                      __('Featured collection banner', 'cci-nice-menu'),
                      [
                        banner(
                          __('Express yourself', 'cci-nice-menu'),
                          __('Unique designs that say more than words.', 'cci-nice-menu'),
                          {
                            cta_label: __('View collection', 'cci-nice-menu'),
                            banner_eyebrow: __('Featured collection', 'cci-nice-menu'),
                            image_url: showcaseImages.tshirt,
                            banner_layout: 'vertical',
                            style_background: '#f3f8ff',
                            style_background_2: '#eaf4ff',
                            style_text: '#111827',
                          },
                        ),
                      ],
                      { component_variant: 'showcase_media_block', hide_heading: true },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
              ],
              {
                icon: 'folder-tree',
                description: __('Browse all categories', 'cci-nice-menu'),
              },
            ),
          ],
          'vertical',
          [createReassuranceHookBlock()],
        ),
        row(
          'Bottom row',
          [
            column(
              'Express yourself',
              4,
              [
                block(
                  'Express yourself',
                  [
                    banner(
                      'Express yourself',
                      'Wear what you love. Unique designs that say more than words.',
                      {
                        cta_label: 'View collection',
                        image_url: showcaseImages.tshirt,
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
            ),
            column(
              'Bestsellers',
              2,
              [
                block(
                  'Bestsellers',
                  [
                    product(2, 'Astronaut graphic tee', {
                      icon: 'chevron-right',
                      description: '27,90 zł',
                    }),
                    product(1, 'Hummingbird printed t-shirt', {
                      icon: 'chevron-right',
                      description: '23,52 zł',
                    }),
                    product(14, 'Cool cat t-shirt', {
                      icon: 'chevron-right',
                      description: '25,90 zł',
                    }),
                  ],
                  {
                    component_variant: 'showcase_compact_list',
                    description: __('Demo: selected products', 'cci-nice-menu'),
                    heading_link: '/',
                    heading_link_label: __('View all', 'cci-nice-menu'),
                    heading_link_icon: 'arrow-right',
                  },
                ),
              ],
              { component_variant: 'showcase_bottom_list_column' },
            ),
            column(
              'New arrivals',
              2,
              [
                block(
                  'New arrivals',
                  [
                    product(18, 'Hummingbird hoodie', {
                      icon: 'chevron-right',
                      description: '89,90 zł',
                    }),
                    product(17, 'Wave cap', { icon: 'chevron-right', description: '49,90 zł' }),
                    product(16, 'Art socks', { icon: 'chevron-right', description: '19,90 zł' }),
                  ],
                  {
                    component_variant: 'showcase_compact_list',
                    description: __('Demo: selected products', 'cci-nice-menu'),
                    heading_link: '/',
                    heading_link_label: __('View all', 'cci-nice-menu'),
                    heading_link_icon: 'arrow-right',
                  },
                ),
              ],
              { component_variant: 'showcase_bottom_list_column' },
            ),
            column(
              __('Find us', 'cci-nice-menu'),
              4,
              [
                block(
                  __('Find us', 'cci-nice-menu'),
                  [
                    map(__('Store map', 'cci-nice-menu'), 'Warsaw, Poland', {
                      component_variant: 'showcase_map_card',
                    }),
                    text('Cool Cat Ideas Store', '10 Creative Street, 00-001 Warsaw', {
                      icon: 'map-pin',
                    }),
                    link('+48 123 456 789', {
                      icon: 'phone',
                      link: 'tel:+48123456789',
                      description: __('Customer support', 'cci-nice-menu'),
                    }),
                    link('info@coolcatideas.com', {
                      icon: 'envelope',
                      link: 'mailto:info@coolcatideas.com',
                      description: __('Email us', 'cci-nice-menu'),
                    }),
                    text('Open 9:00 - 17:00', '', {
                      icon: 'clock',
                      component_variant: 'showcase_store_status',
                    }),
                  ],
                  {
                    component_variant: 'showcase_store_card',
                    columns: 2,
                    heading_link: '/',
                    heading_link_label: __('View store', 'cci-nice-menu'),
                    heading_link_icon: 'arrow-right',
                  },
                ),
              ],
              { component_variant: 'showcase_store_column' },
            ),
            column(
              'Shortcuts',
              12,
              [
                block(
                  'Shortcuts',
                  [
                    link('Size guide', { icon: 'ruler', description: 'Find the right fit' }),
                    link('Care guide', { icon: 'scissors', description: 'How to care for prints' }),
                    link('Inspiration and blog', {
                      icon: 'palette',
                      description: 'Ideas, trends, interviews',
                    }),
                    link('Personalization', {
                      icon: 'pencil',
                      description: 'Create your own design',
                    }),
                  ],
                  { component_variant: 'footer_actions', style_radius: '12px' },
                ),
              ],
              { component_variant: 'showcase_footer_column' },
            ),
          ],
          { component_variant: 'showcase_secondary_row' },
        ),
      ],
    }),
    link('Bestsellers', {
      icon: 'fa fa-trophy',
      component_variant: 'showcase_entry',
      column_span: 2,
      children: [
        showcaseHeaderColumn(
          __('Bestsellers collection', 'cci-nice-menu'),
          __('Discover the products customers love most.', 'cci-nice-menu'),
          'trophy',
        ),
        showcaseCardListColumn(__('Top apparel', 'cci-nice-menu'), 'shirt', [
          bestsellerItem(1, __('Printed t-shirts', 'cci-nice-menu'), showcaseImages.tshirt),
          bestsellerItem(2, __('Hoodies & sweatshirts', 'cci-nice-menu'), showcaseImages.sweater),
          bestsellerItem(1, __('Tank tops', 'cci-nice-menu'), showcaseImages.tshirt),
          bestsellerItem(2, __('Kids apparel', 'cci-nice-menu'), showcaseImages.sweater),
          bestsellerItem(1, __('Hats & beanies', 'cci-nice-menu'), showcaseImages.tshirt),
          showcaseCardAction(__('View all apparel', 'cci-nice-menu')),
        ]),
        showcaseCardListColumn(__('Popular accessories', 'cci-nice-menu'), 'shopping-bag', [
          bestsellerItem(6, __('Mugs & drinkware', 'cci-nice-menu'), showcaseImages.mug),
          bestsellerItem(15, __('Tote bags', 'cci-nice-menu'), showcaseImages.tshirt),
          bestsellerItem(19, __('Phone cases', 'cci-nice-menu'), showcaseImages.sweater),
          bestsellerItem(18, __('Notebooks', 'cci-nice-menu'), showcaseImages.notebook),
          bestsellerItem(14, __('Stickers', 'cci-nice-menu'), showcaseImages.graphic),
          showcaseCardAction(__('View all accessories', 'cci-nice-menu')),
        ]),
        showcaseCardListColumn(__('Best wall art', 'cci-nice-menu'), 'image', [
          bestsellerItem(3, __('Canvas prints', 'cci-nice-menu'), showcaseImages.poster),
          bestsellerItem(4, __('Framed prints', 'cci-nice-menu'), showcaseImages.graphic),
          bestsellerItem(5, __('Metal prints', 'cci-nice-menu'), showcaseImages.poster),
          bestsellerItem(12, __('Posters', 'cci-nice-menu'), showcaseImages.graphic),
          bestsellerItem(13, __('Gallery wall sets', 'cci-nice-menu'), showcaseImages.poster),
          showcaseCardAction(__('View all wall art', 'cci-nice-menu')),
        ]),
        showcaseMediaColumn(__('Customer favorites', 'cci-nice-menu'), [
          banner(
            __('Loved by thousands. Chosen by you.', 'cci-nice-menu'),
            __('Our top-rated products, all in one place.', 'cci-nice-menu'),
            {
              cta_label: __('Shop bestsellers', 'cci-nice-menu'),
              banner_eyebrow: __('Customer favorites', 'cci-nice-menu'),
              image_url: showcaseImages.tshirt,
              banner_layout: 'vertical',
              style_background: '#f3f8ff',
              style_background_2: '#eaf4ff',
              style_text: '#111827',
            },
          ),
        ]),
        showcaseBenefitsColumn(__('Bestsellers highlights', 'cci-nice-menu'), [
          text(__('Top rated', 'cci-nice-menu'), __('4.8+ average rating', 'cci-nice-menu'), {
            icon: 'star',
          }),
          text(
            __('Most purchased', 'cci-nice-menu'),
            __('Our top-selling items', 'cci-nice-menu'),
            { icon: 'shopping-bag' },
          ),
          text(__('Trending now', 'cci-nice-menu'), __("What's hot this week", 'cci-nice-menu'), {
            icon: 'chart-line',
          }),
          text(__('Back in stock', 'cci-nice-menu'), __('Fan favorites return', 'cci-nice-menu'), {
            icon: 'cube',
          }),
        ]),
      ],
    }),
    link('Inspiration', {
      icon: 'fa fa-compass',
      component_variant: 'showcase_entry',
      column_span: 2,
      children: [
        showcaseHeaderColumn(
          __('Inspiration library', 'cci-nice-menu'),
          __(
            'Discover creative ideas, media and every content block available in the menu.',
            'cci-nice-menu',
          ),
          'compass',
        ),
        tabGroup(
          __('Inspiration library', 'cci-nice-menu'),
          [
            tab(
              __('Content types', 'cci-nice-menu'),
              [
                column(
                  __('Links and sources', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Navigation sources', 'cci-nice-menu'),
                      [
                        link(__('Custom link', 'cci-nice-menu'), {
                          icon: 'link',
                          description: __(
                            'Manual label, icon, badge, URL and optional description.',
                            'cci-nice-menu',
                          ),
                        }),
                        cms(4, __('CMS page link', 'cci-nice-menu'), {
                          icon: 'file-text',
                          label_override: __('CMS page link', 'cci-nice-menu'),
                          description: __(
                            'PrestaShop CMS page selected from catalog data.',
                            'cci-nice-menu',
                          ),
                        }),
                        category(3, __('Category link', 'cci-nice-menu'), {
                          icon: 'folder',
                          label_override: __('Category link', 'cci-nice-menu'),
                          description: __(
                            'Single category link with live URL and product count fallback.',
                            'cci-nice-menu',
                          ),
                        }),
                        categoryTree(0, __('Category tree source', 'cci-nice-menu'), {
                          icon: 'folder-tree',
                          description: __(
                            'Category tree node; select a category to generate a live browser.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_card_list',
                        icon: 'link',
                        description: __(
                          'Manual, CMS and catalog-backed navigation entries.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
                column(
                  __('Utility content', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Text and utility blocks', 'cci-nice-menu'),
                      [
                        text(
                          __('Text card', 'cci-nice-menu'),
                          __(
                            'Icon, title and supporting copy for short guidance.',
                            'cci-nice-menu',
                          ),
                          { icon: 'info' },
                        ),
                        text(
                          __('Status badge', 'cci-nice-menu'),
                          __(
                            'Non-clickable status pill used for opening hours or timers.',
                            'cci-nice-menu',
                          ),
                          {
                            icon: 'clock',
                            component_variant: 'showcase_store_status',
                          },
                        ),
                        map(__('Map block', 'cci-nice-menu'), 'Warsaw, Poland', {
                          description: __(
                            'Map placeholder from a query, address or configured embed URL.',
                            'cci-nice-menu',
                          ),
                        }),
                        hook('displayReassurance', __('Native hook', 'cci-nice-menu'), {
                          description: __(
                            'PrestaShop module output rendered by hook name.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_card_list',
                        icon: 'settings',
                        description: __(
                          'Text, status, map and native module content.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
                column(
                  __('Media content', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Media types', 'cci-nice-menu'),
                      [
                        image(__('Image block', 'cci-nice-menu'), showcaseImages.poster, {
                          description: __(
                            'Standalone image with optional caption and link.',
                            'cci-nice-menu',
                          ),
                        }),
                        banner(
                          __('Banner block', 'cci-nice-menu'),
                          __('Image, gradient background, copy and CTA.', 'cci-nice-menu'),
                          {
                            cta_label: __('Open banner', 'cci-nice-menu'),
                            banner_eyebrow: __('Banner', 'cci-nice-menu'),
                            image_url: showcaseImages.tshirt,
                            style_background: '#f3f8ff',
                            style_background_2: '#eaf4ff',
                          },
                        ),
                        video(__('Video block', 'cci-nice-menu'), {
                          description: __(
                            'YouTube or file video with poster, aspect ratio and lazy loading.',
                            'cci-nice-menu',
                          ),
                          cta_label: __('Watch', 'cci-nice-menu'),
                          component_variant: 'showcase_video_feature',
                        }),
                      ],
                      {
                        component_variant: 'showcase_media_block',
                        description: __(
                          'Image, banner and video content in one media stack.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
              ],
              {
                icon: 'layout-grid',
                description: __(
                  'All base content nodes available in the builder.',
                  'cci-nice-menu',
                ),
              },
            ),
            tab(
              __('Catalog products', 'cci-nice-menu'),
              [
                column(
                  __('Product grid', 'cci-nice-menu'),
                  6,
                  [
                    block(
                      __('Product grid', 'cci-nice-menu'),
                      [
                        productTile(1, __('Theme product tile', 'cci-nice-menu'), {
                          label_override: __('Theme product tile', 'cci-nice-menu'),
                          description: __(
                            'Product tile rendered by the shop theme inside product grids.',
                            'cci-nice-menu',
                          ),
                        }),
                        productTile(2, __('Grid product tile', 'cci-nice-menu'), {
                          label_override: __('Grid product tile', 'cci-nice-menu'),
                          description: __(
                            'Second product tile proves the shared grid layout.',
                            'cci-nice-menu',
                          ),
                        }),
                        productTile(9, __('Two-column product grid', 'cci-nice-menu'), {
                          label_override: __('Two-column product grid', 'cci-nice-menu'),
                          description: __(
                            'Grid can be switched between available product presets.',
                            'cci-nice-menu',
                          ),
                        }),
                        productTile(6, __('Catalog product card', 'cci-nice-menu'), {
                          label_override: __('Catalog product card', 'cci-nice-menu'),
                          description: __(
                            'Catalog-backed product with theme image and price.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_product_grid_two',
                        description: __(
                          'Theme-rendered product cards for visual merchandising.',
                          'cci-nice-menu',
                        ),
                        heading_link: '/',
                        heading_link_label: __('View all', 'cci-nice-menu'),
                        heading_link_icon: 'arrow-right',
                      },
                    ),
                  ],
                  { component_variant: 'showcase_products_column' },
                ),
                column(
                  __('Compact list', 'cci-nice-menu'),
                  3,
                  [
                    block(
                      __('Compact product list', 'cci-nice-menu'),
                      [
                        product(1, __('Compact product row', 'cci-nice-menu'), {
                          label_override: __('Compact product row', 'cci-nice-menu'),
                          description: __(
                            'Small product row with image, description and price.',
                            'cci-nice-menu',
                          ),
                        }),
                        product(2, __('Product row with price', 'cci-nice-menu'), {
                          label_override: __('Product row with price', 'cci-nice-menu'),
                          description: __(
                            'Useful for bestsellers, new arrivals and manual selections.',
                            'cci-nice-menu',
                          ),
                        }),
                        product(6, __('Accessory product row', 'cci-nice-menu'), {
                          label_override: __('Accessory product row', 'cci-nice-menu'),
                          description: __(
                            'Same compact component works for other catalog products.',
                            'cci-nice-menu',
                          ),
                        }),
                        product(3, __('Poster product row', 'cci-nice-menu'), {
                          label_override: __('Poster product row', 'cci-nice-menu'),
                          description: __(
                            'Extra row keeps compact list focused on product content.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_compact_list',
                        description: __(
                          'Selected products demo; replace with dynamic product data later.',
                          'cci-nice-menu',
                        ),
                        heading_link: '/',
                        heading_link_label: __('View all', 'cci-nice-menu'),
                        heading_link_icon: 'arrow-right',
                      },
                    ),
                  ],
                  { component_variant: 'showcase_bottom_list_column' },
                ),
                column(
                  __('Manual cards', 'cci-nice-menu'),
                  3,
                  [
                    block(
                      __('Manual product cards', 'cci-nice-menu'),
                      [
                        product(19, __('Product link', 'cci-nice-menu'), {
                          icon: 'shopping-bag',
                          label_override: __('Product link', 'cci-nice-menu'),
                          description: __(
                            'Compact product row when a full grid is not needed.',
                            'cci-nice-menu',
                          ),
                        }),
                        productTile(19, __('Product tile fallback', 'cci-nice-menu'), {
                          label_override: __('Product tile fallback', 'cci-nice-menu'),
                          description: __(
                            'Lightweight product card outside product grids.',
                            'cci-nice-menu',
                          ),
                          use_fallback_product_tile: true,
                        }),
                        link(__('Manual collection link', 'cci-nice-menu'), {
                          icon: 'sparkles',
                          badge: __('New', 'cci-nice-menu'),
                          description: __(
                            'Manual link can sit next to product content.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_card_list',
                        icon: 'shopping-bag',
                        description: __(
                          'Product link, fallback tile and manual merchandising link.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
              ],
              {
                icon: 'shopping-bag',
                description: __(
                  'Product grids, compact rows and manual product cards.',
                  'cci-nice-menu',
                ),
              },
            ),
            promotionsShowcaseTab(),
            tab(
              __('Media and promos', 'cci-nice-menu'),
              [
                column(
                  __('Campaign banners', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Horizontal banner', 'cci-nice-menu'),
                      [
                        banner(
                          __('Horizontal promo banner', 'cci-nice-menu'),
                          __(
                            'Wide banner with shared CTA, media and gradient logic.',
                            'cci-nice-menu',
                          ),
                          {
                            cta_label: __('View collection', 'cci-nice-menu'),
                            banner_eyebrow: __('Campaign', 'cci-nice-menu'),
                            image_url: showcaseImages.tshirt,
                            style_background: '#eaf3ff',
                            style_background_2: '#d7eaff',
                            style_text: '#14233d',
                          },
                        ),
                      ],
                      {
                        component_variant: 'showcase_media_block',
                        description: __(
                          'Horizontal banner component for wide content zones.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
                column(
                  __('Vertical feature', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Vertical banner', 'cci-nice-menu'),
                      [
                        banner(
                          __('Vertical promo banner', 'cci-nice-menu'),
                          __(
                            'Tall banner variant using the same banner CTA and hover styles.',
                            'cci-nice-menu',
                          ),
                          {
                            cta_label: __('Explore', 'cci-nice-menu'),
                            banner_eyebrow: __('Feature', 'cci-nice-menu'),
                            image_url: showcaseImages.sweater,
                            banner_layout: 'vertical',
                            style_background: '#f2fbec',
                            style_background_2: '#e3f7d6',
                            style_text: '#14233d',
                          },
                        ),
                      ],
                      {
                        component_variant: 'showcase_media_block',
                        description: __(
                          'Vertical layout of the same shared banner block.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
                column(
                  __('Rich media stack', 'cci-nice-menu'),
                  4,
                  [
                    block(
                      __('Image and video stack', 'cci-nice-menu'),
                      [
                        image(__('Linked image tile', 'cci-nice-menu'), showcaseImages.mug, {
                          description: __(
                            'Image content can be used as a visual shortcut.',
                            'cci-nice-menu',
                          ),
                        }),
                        video(__('Video feature', 'cci-nice-menu'), {
                          description: __(
                            'Embedded video block with CTA and poster fallback.',
                            'cci-nice-menu',
                          ),
                          cta_label: __('Watch guide', 'cci-nice-menu'),
                          component_variant: 'showcase_video_feature',
                        }),
                        text(
                          __('Media caption', 'cci-nice-menu'),
                          __(
                            'Text cards can explain media content without custom markup.',
                            'cci-nice-menu',
                          ),
                          { icon: 'captions' },
                        ),
                      ],
                      {
                        component_variant: 'showcase_media_block',
                        description: __(
                          'Shared media stack for images, video and supporting copy.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_media_column' },
                ),
              ],
              {
                icon: 'image',
                description: __(
                  'Banner orientations, image tiles and video blocks.',
                  'cci-nice-menu',
                ),
              },
            ),
            tab(
              __('Reusable blocks', 'cci-nice-menu'),
              [
                row(__('Lists row', 'cci-nice-menu'), [
                  column(
                    __('Primary links', 'cci-nice-menu'),
                    3,
                    [
                      block(
                        __('Link list', 'cci-nice-menu'),
                        [
                          link(__('Primary link', 'cci-nice-menu'), {
                            description: __(
                              'Default text link in a shared list block.',
                              'cci-nice-menu',
                            ),
                          }),
                          link(__('Highlighted link', 'cci-nice-menu'), {
                            component_variant: 'showcase_current_link',
                            description: __(
                              'Current/selected link state for navigation.',
                              'cci-nice-menu',
                            ),
                          }),
                          link(__('Link with badge', 'cci-nice-menu'), {
                            badge: __('Hot', 'cci-nice-menu'),
                            description: __(
                              'Badge appears next to the label when configured.',
                              'cci-nice-menu',
                            ),
                          }),
                          showcaseCardAction(__('View link list', 'cci-nice-menu')),
                        ],
                        {
                          component_variant: 'showcase_link_block',
                          description: __(
                            'Compact navigation list for category groups.',
                            'cci-nice-menu',
                          ),
                        },
                      ),
                    ],
                    { component_variant: 'showcase_link_column' },
                  ),
                  column(
                    __('Secondary links', 'cci-nice-menu'),
                    3,
                    [
                      block(
                        __('Secondary link list', 'cci-nice-menu'),
                        [
                          link(__('Secondary link', 'cci-nice-menu'), {
                            description: __(
                              'Quieter link list for supporting navigation.',
                              'cci-nice-menu',
                            ),
                          }),
                          link(__('Support link', 'cci-nice-menu'), {
                            description: __(
                              'Same block with reduced visual weight.',
                              'cci-nice-menu',
                            ),
                          }),
                          link(__('Resource link', 'cci-nice-menu'), {
                            description: __(
                              'Reusable for manuals, guides and collections.',
                              'cci-nice-menu',
                            ),
                          }),
                          showcaseCardAction(__('View resources', 'cci-nice-menu')),
                        ],
                        {
                          component_variant: 'showcase_secondary_link_block',
                          description: __(
                            'Secondary link block uses the same list mechanics.',
                            'cci-nice-menu',
                          ),
                        },
                      ),
                    ],
                    { component_variant: 'showcase_link_column' },
                  ),
                  column(
                    __('Card list', 'cci-nice-menu'),
                    3,
                    [
                      block(
                        __('Card list', 'cci-nice-menu'),
                        [
                          link(__('Card item with icon', 'cci-nice-menu'), {
                            icon: 'star',
                            description: __(
                              'Icon, label, description and chevron in one row.',
                              'cci-nice-menu',
                            ),
                          }),
                          dealItem(
                            __('Badge item', 'cci-nice-menu'),
                            __('Best value', 'cci-nice-menu'),
                          ),
                          link(__('Image item', 'cci-nice-menu'), {
                            image_url: showcaseImages.notebook,
                            description: __(
                              'Card list also supports configured thumbnails.',
                              'cci-nice-menu',
                            ),
                          }),
                          showcaseCardAction(__('Open card list', 'cci-nice-menu')),
                        ],
                        {
                          component_variant: 'showcase_card_list',
                          icon: 'layout-list',
                          description: __(
                            'General purpose card list for mixed content rows.',
                            'cci-nice-menu',
                          ),
                        },
                      ),
                    ],
                    { component_variant: 'showcase_action_column' },
                  ),
                  column(
                    __('Rail services', 'cci-nice-menu'),
                    3,
                    [
                      block(
                        __('Rail service cards', 'cci-nice-menu'),
                        [
                          railService(
                            __('Fast setup', 'cci-nice-menu'),
                            __('Short service item for tab rails.', 'cci-nice-menu'),
                            'zap',
                          ),
                          railService(
                            __('Editor friendly', 'cci-nice-menu'),
                            __('Label and description come from data.', 'cci-nice-menu'),
                            'edit-3',
                          ),
                          railService(
                            __('Reusable style', 'cci-nice-menu'),
                            __('Same component in different menu sections.', 'cci-nice-menu'),
                            'refresh-cw',
                          ),
                        ],
                        {
                          component_variant: 'showcase_card_list',
                          icon: 'sparkles',
                          description: __(
                            'Rail service item pattern used by tab support content.',
                            'cci-nice-menu',
                          ),
                        },
                      ),
                    ],
                    { component_variant: 'showcase_action_column' },
                  ),
                ]),
                row(__('Strips row', 'cci-nice-menu'), [
                  showcaseBenefitsColumn(__('Benefits strip', 'cci-nice-menu'), [
                    text(
                      __('Benefit item', 'cci-nice-menu'),
                      __('Icon plus short value proposition.', 'cci-nice-menu'),
                      { icon: 'shield' },
                    ),
                    text(
                      __('Feature item', 'cci-nice-menu'),
                      __('Works as a horizontal supporting strip.', 'cci-nice-menu'),
                      { icon: 'palette' },
                    ),
                    text(
                      __('Trust item', 'cci-nice-menu'),
                      __('Consistent icon, title and description rhythm.', 'cci-nice-menu'),
                      { icon: 'lock' },
                    ),
                    text(
                      __('Service item', 'cci-nice-menu'),
                      __('Reusable for reassurance and highlights.', 'cci-nice-menu'),
                      { icon: 'truck' },
                    ),
                  ]),
                  column(
                    __('Footer actions', 'cci-nice-menu'),
                    12,
                    [
                      block(
                        __('Footer actions', 'cci-nice-menu'),
                        [
                          link(__('Size guide', 'cci-nice-menu'), {
                            icon: 'ruler',
                            description: __('Find the right fit.', 'cci-nice-menu'),
                          }),
                          link(__('Care guide', 'cci-nice-menu'), {
                            icon: 'scissors',
                            description: __('How to care for prints.', 'cci-nice-menu'),
                          }),
                          link(__('Inspiration and blog', 'cci-nice-menu'), {
                            icon: 'palette',
                            description: __('Ideas, trends and interviews.', 'cci-nice-menu'),
                          }),
                          link(__('Personalization', 'cci-nice-menu'), {
                            icon: 'pencil',
                            description: __('Create your own design.', 'cci-nice-menu'),
                          }),
                        ],
                        {
                          component_variant: 'footer_actions',
                          style_radius: '12px',
                          description: __(
                            'Full-width shortcut strip for helpful links.',
                            'cci-nice-menu',
                          ),
                        },
                      ),
                    ],
                    { component_variant: 'showcase_footer_column' },
                  ),
                ]),
              ],
              {
                icon: 'blocks',
                description: __(
                  'Reusable list, card, strip and rail block variants.',
                  'cci-nice-menu',
                ),
              },
            ),
            tab(
              __('Store and hooks', 'cci-nice-menu'),
              [
                column(
                  __('Store card', 'cci-nice-menu'),
                  6,
                  [
                    block(
                      __('Store card', 'cci-nice-menu'),
                      [
                        map(__('Store map', 'cci-nice-menu'), '10 Creative Street, Warsaw', {
                          description: __(
                            'Map spans the card width and keeps contact data grouped.',
                            'cci-nice-menu',
                          ),
                        }),
                        text(
                          __('Cool Cat Ideas Store', 'cci-nice-menu'),
                          __('10 Creative Street, 00-001 Warsaw', 'cci-nice-menu'),
                          { icon: 'map-pin' },
                        ),
                        link('+48 123 456 789', {
                          link: 'tel:+48123456789',
                          icon: 'phone',
                          description: __('Customer support phone link.', 'cci-nice-menu'),
                        }),
                        link('info@coolcatideas.com', {
                          link: 'mailto:info@coolcatideas.com',
                          icon: 'mail',
                          description: __('Email link rendered from menu data.', 'cci-nice-menu'),
                        }),
                        text(
                          __('Open 9:00 - 17:00', 'cci-nice-menu'),
                          __('Non-clickable opening status.', 'cci-nice-menu'),
                          {
                            icon: 'clock',
                            component_variant: 'showcase_store_status',
                          },
                        ),
                      ],
                      {
                        component_variant: 'showcase_store_card',
                        columns: 2,
                        description: __(
                          'Map, address, contact links and status in one shared store block.',
                          'cci-nice-menu',
                        ),
                        heading_link: '/',
                        heading_link_label: __('View store', 'cci-nice-menu'),
                        heading_link_icon: 'arrow-right',
                      },
                    ),
                  ],
                  { component_variant: 'showcase_store_column' },
                ),
                column(
                  __('Native module output', 'cci-nice-menu'),
                  3,
                  [
                    block(
                      __('Customer reassurance hook', 'cci-nice-menu'),
                      [
                        hook('displayReassurance', __('Customer reassurance', 'cci-nice-menu'), {
                          description: __(
                            'Native PrestaShop reassurance module output.',
                            'cci-nice-menu',
                          ),
                        }),
                      ],
                      {
                        component_variant: 'showcase_card_list',
                        icon: 'shield',
                        description: __(
                          'Hook content is rendered from the module, not copied HTML.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                    block(
                      __('Hook reference', 'cci-nice-menu'),
                      [
                        text(
                          __('Search bar hook', 'cci-nice-menu'),
                          __(
                            'Use displaySearch / ps_searchbar as a hook block when search is needed.',
                            'cci-nice-menu',
                          ),
                          { icon: 'search' },
                        ),
                        text(
                          __('Hook fallback', 'cci-nice-menu'),
                          __(
                            'Widget modules can render through a conscious hook fallback.',
                            'cci-nice-menu',
                          ),
                          { icon: 'plug' },
                        ),
                      ],
                      {
                        component_variant: 'showcase_card_list',
                        icon: 'plug',
                        description: __(
                          'Notes for native module blocks available in the builder.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_action_column' },
                ),
                column(
                  __('Standalone map', 'cci-nice-menu'),
                  3,
                  [
                    block(
                      __('Map card', 'cci-nice-menu'),
                      [
                        map(__('Map card', 'cci-nice-menu'), 'Warsaw, Poland', {
                          description: __(
                            'Standalone map block for contact or pickup sections.',
                            'cci-nice-menu',
                          ),
                        }),
                        link(__('Open map', 'cci-nice-menu'), {
                          icon: 'external-link',
                          description: __('Action link can sit below the map.', 'cci-nice-menu'),
                        }),
                      ],
                      {
                        component_variant: 'showcase_map_card',
                        description: __(
                          'Map and action link without the full store card wrapper.',
                          'cci-nice-menu',
                        ),
                      },
                    ),
                  ],
                  { component_variant: 'showcase_store_column' },
                ),
              ],
              {
                icon: 'map-pin',
                description: __(
                  'Store card, map blocks and native PrestaShop hooks.',
                  'cci-nice-menu',
                ),
              },
            ),
          ],
          'vertical',
          [],
          {
            tabs_content_height: '680px',
            tabs_content_height_tablet: '620px',
            tabs_content_height_mobile: '72vh',
          },
        ),
      ],
    }),
    link(__('Blog', 'cci-nice-menu'), {
      icon: 'file-text',
      component_variant: 'showcase_entry',
      column_span: 1,
      children: [
        showcaseHeaderColumn(
          __('From our blog', 'cci-nice-menu'),
          __('Discover featured guides, latest articles and popular reads.', 'cci-nice-menu'),
          'file-text',
        ),
        row(__('Blog content', 'cci-nice-menu'), [
          column(
            __('Featured article', 'cci-nice-menu'),
            4,
            [
              block(
                __('Featured guide', 'cci-nice-menu'),
                [
                  blogPost(
                    __('Featured article', 'cci-nice-menu'),
                    __('A hand-picked article displayed as a sticky menu card.', 'cci-nice-menu'),
                  ),
                ],
                {
                  component_variant: 'showcase_card_list',
                  description: __(
                    'Single selected article block for editorial navigation.',
                    'cci-nice-menu',
                  ),
                },
              ),
            ],
            { component_variant: 'showcase_action_column' },
          ),
          column(
            __('Latest articles', 'cci-nice-menu'),
            4,
            [
              block(
                __('Latest articles', 'cci-nice-menu'),
                [
                  blogCollection(
                    'blog_list',
                    __('Latest blog list', 'cci-nice-menu'),
                    __('Newest active blog posts from CCI Blog.', 'cci-nice-menu'),
                    {
                      component_variant: 'showcase_blog_list',
                    },
                  ),
                ],
                {
                  component_variant: 'showcase_card_list',
                  description: __('Automatically rendered newest posts.', 'cci-nice-menu'),
                },
              ),
            ],
            { component_variant: 'showcase_action_column' },
          ),
          column(
            __('Popular reads', 'cci-nice-menu'),
            4,
            [
              block(
                __('Popular reads', 'cci-nice-menu'),
                [
                  blogCollection(
                    'blog_popular',
                    __('Popular posts', 'cci-nice-menu'),
                    __('Popular articles ordered by the blog view counter.', 'cci-nice-menu'),
                    {
                      component_variant: 'showcase_blog_popular',
                    },
                  ),
                ],
                {
                  component_variant: 'showcase_card_list',
                  description: __('Articles sorted by collected view statistics.', 'cci-nice-menu'),
                },
              ),
            ],
            { component_variant: 'showcase_action_column' },
          ),
        ]),
        row(
          __('More from the blog', 'cci-nice-menu'),
          [
            column(
              __('Article carousel', 'cci-nice-menu'),
              8,
              [
                block(
                  __('Article carousel', 'cci-nice-menu'),
                  [
                    blogCollection(
                      'blog_carousel',
                      __('Blog carousel', 'cci-nice-menu'),
                      __('Carousel block sourced from published blog posts.', 'cci-nice-menu'),
                      {
                        component_variant: 'showcase_blog_carousel',
                        item_count: 6,
                        carousel_items: 3,
                        carousel_margin: 16,
                        carousel_autoplay: true,
                        carousel_autoplay_timeout: 4500,
                      },
                    ),
                  ],
                  {
                    component_variant: 'showcase_card_list',
                    description: __(
                      'A horizontal rail for recent or curated articles.',
                      'cci-nice-menu',
                    ),
                  },
                ),
              ],
              { component_variant: 'showcase_bottom_list_column' },
            ),
            column(
              __('Blog categories', 'cci-nice-menu'),
              4,
              [
                block(
                  __('Blog categories', 'cci-nice-menu'),
                  [
                    blogCollection(
                      'blog_categories',
                      __('Blog categories', 'cci-nice-menu'),
                      __('Automatic category listing from CCI Blog.', 'cci-nice-menu'),
                      {
                        component_variant: 'showcase_blog_categories',
                        icon: 'folder-tree',
                        item_count: 8,
                        blog_category_mode: 'all',
                        blog_category_hide_empty: true,
                        blog_category_sort: 'position',
                        blog_category_show_count: true,
                        blog_category_media_mode: 'auto',
                      },
                    ),
                  ],
                  {
                    component_variant: 'showcase_card_list',
                    description: __(
                      'Automatic or selected category list with post counts.',
                      'cci-nice-menu',
                    ),
                  },
                ),
              ],
              { component_variant: 'showcase_action_column' },
            ),
          ],
          { component_variant: 'showcase_secondary_row' },
        ),
      ],
    }),
    cms(4, __('About us', 'cci-nice-menu'), {
      label_override: __('About us', 'cci-nice-menu'),
      column_span: 1,
    }),
    cms(4, __('Contact', 'cci-nice-menu'), {
      label_override: __('Contact', 'cci-nice-menu'),
      column_span: 1,
    }),
    hook('displaySearch', __('Search products', 'cci-nice-menu'), {
      description: __(
        'Native PrestaShop search output from displaySearch / ps_searchbar.',
        'cci-nice-menu',
      ),
      top_level_placement: 'right',
      top_level_column_start: 10,
      column_span: 3,
    }),
  ];

  return [
    row(
      __('Top navigation row', 'cci-nice-menu'),
      [
        column(__('Primary navigation', 'cci-nice-menu'), 9, topItems.slice(0, 6).map(topLink), {
          component_variant: 'top_navigation_column',
        }),
        column(__('Search', 'cci-nice-menu'), 3, topItems.slice(6).map(topLink), {
          component_variant: 'top_navigation_search_column',
          top_level_placement: 'right',
        }),
      ],
      {
        component_variant: 'top_navigation_row',
      },
    ),
  ];
}
