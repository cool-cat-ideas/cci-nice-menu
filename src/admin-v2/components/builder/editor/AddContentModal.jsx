import React from 'react';
import {
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  Columns3,
  ExternalLink,
  FileText,
  FolderTree,
  Image,
  Layers,
  Link2,
  MapPin,
  PackageSearch,
  Plus,
  Save,
  ShoppingBag,
  Video,
  X,
} from 'lucide-react';
import { apiFetch, pluginData } from '../../../api/api';
import { __ } from '../../../i18n/i18n';
import { Button } from '../../ui/button';
import { Checkbox, CheckboxField } from '../../ui/checkbox';
import { CssLengthInput } from '../../ui/css-length-input';
import { Field, FieldGroup, FieldLabel } from '../../ui/field';
import InfoCallout from '../../ui/info-callout';
import { Input, Textarea } from '../../ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../../ui/input-group';
import { Select } from '../../ui/select';
import LocalMediaUrlInput from '../../media/LocalMediaUrlInput';
import {
  BuilderDialogFrame,
  BuilderDialogHeader,
  BuilderDialogBody,
  BuilderDialogFooter,
} from '../components/BuilderPrimitives.jsx';
import {
  nodeLengthUnits,
  radiusLengthUnits,
  DEFAULT_DISPLAY_OPTIONS,
  normalizeOptionalNodeLength,
  sanitizeNodeType,
  normalizeLayoutRole,
  normalizeTabsOrientation,
  normalizeBannerLayout,
  normalizeComponentVariant,
  inferComponentVariantFromClass,
  getNodeDisplayOptions,
  createNode,
} from '../model/node.js';
import { createLayoutTemplateNode } from '../presets/layout-templates.js';

export const contentTypes = [
  { value: 'custom', label: 'Custom link', description: 'Manual label and URL.', icon: Link2 },
  {
    value: 'category',
    label: 'Category',
    description: 'Link to a selected shop category.',
    icon: FolderTree,
  },
  {
    value: 'category_tree',
    label: 'Dynamic category flyout',
    description: 'Build the catalog dropdown from live PrestaShop categories.',
    icon: Layers,
  },
  {
    value: 'product',
    label: 'Product',
    description: 'Link to a selected product.',
    icon: ShoppingBag,
  },
  {
    value: 'product_tile',
    label: 'Product tile',
    description: 'Visual product card with image and price.',
    icon: ShoppingBag,
  },
  {
    value: 'cms_page',
    label: 'CMS page',
    description: 'Link to an informational CMS page.',
    icon: FileText,
  },
  {
    value: 'blog_post',
    label: 'Blog post sticky',
    description: 'Feature one selected blog article inside the menu.',
    icon: FileText,
  },
  {
    value: 'blog_list',
    label: 'Latest blog list',
    description: 'Render the latest published blog posts.',
    icon: FileText,
  },
  {
    value: 'blog_carousel',
    label: 'Blog carousel',
    description: 'Horizontal article rail for menu panels.',
    icon: FileText,
  },
  {
    value: 'blog_popular',
    label: 'Popular posts',
    description: 'Articles ordered by tracked views.',
    icon: FileText,
  },
  {
    value: 'blog_categories',
    label: 'Blog categories',
    description: 'List selected or automatic CCI Blog categories.',
    icon: FolderTree,
  },
  {
    value: 'banner',
    label: 'Banner block',
    description: 'Image, text and optional link.',
    icon: Image,
  },
  {
    value: 'video',
    label: 'Video block',
    description: 'YouTube embed or self-hosted video with playback options.',
    icon: Video,
  },
  {
    value: 'text',
    label: 'Text block',
    description: 'Title, icon and short supporting copy.',
    icon: FileText,
  },
  {
    value: 'image',
    label: 'Image block',
    description: 'Standalone visual tile with optional caption.',
    icon: Image,
  },
  {
    value: 'map',
    label: 'Map block',
    description: 'Editable location map generated from an address or embed URL.',
    icon: MapPin,
  },
  {
    value: 'hook',
    label: __('Hook block', 'cci-nice-menu'),
    description: 'Render output from an existing storefront hook.',
    icon: Layers,
  },
];

export const contentTypeGroups = [
  {
    label: 'Catalog',
    values: ['category_tree', 'category', 'product', 'product_tile', 'cms_page'],
  },
  {
    label: 'Blog',
    values: ['blog_post', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories'],
  },
  { label: 'Media', values: ['banner', 'image', 'video', 'map'] },
  { label: 'Content', values: ['custom', 'text', 'hook'] },
];

export const bannerLayoutOptions = [
  { value: 'horizontal', label: __('Horizontal', 'cci-nice-menu') },
  { value: 'vertical', label: __('Vertical', 'cci-nice-menu') },
];

export const blogCategorySortOptions = [
  { value: 'position', label: __('Position', 'cci-nice-menu') },
  { value: 'title_asc', label: __('Title A-Z', 'cci-nice-menu') },
  { value: 'title_desc', label: __('Title Z-A', 'cci-nice-menu') },
  { value: 'count_desc', label: __('Most posts first', 'cci-nice-menu') },
  { value: 'count_asc', label: __('Fewest posts first', 'cci-nice-menu') },
];

export const blogCategoryMediaOptions = [
  { value: 'auto', label: __('Auto: thumbnail, then icon', 'cci-nice-menu') },
  { value: 'icon', label: __('Configured icon', 'cci-nice-menu') },
  { value: 'thumbnail', label: __('Category thumbnail', 'cci-nice-menu') },
  { value: 'none', label: __('No media', 'cci-nice-menu') },
];

export const linkModeOptions = [
  { value: 'link', label: __('Clickable link', 'cci-nice-menu') },
  { value: 'span', label: __('Static text (span)', 'cci-nice-menu') },
];

export function normalizeBlogCategoryIds(value) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim());

  return source
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
    .map((item) => String(item));
}

export function buildBlogCategoryTreeRows(items, sortMode = 'position') {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const id = Number(item?.id || item?.id_category || 0);
      if (!Number.isInteger(id) || id <= 0) {
        return null;
      }

      const parentId = Number(item?.parent_id || item?.id_parent || 0);

      return {
        ...item,
        id: String(id),
        parentId: Number.isInteger(parentId) && parentId > 0 ? String(parentId) : '',
        name: String(item?.name || `#${id}`),
        position: Number(item?.position || 0),
        postCount: Number(item?.post_count || 0),
        originalIndex: index,
      };
    })
    .filter(Boolean);

  const byId = new Map(normalized.map((item) => [item.id, item]));
  const childrenByParent = new Map();
  normalized.forEach((item) => {
    const parentKey = item.parentId && byId.has(item.parentId) ? item.parentId : '';
    const bucket = childrenByParent.get(parentKey) || [];
    bucket.push(item);
    childrenByParent.set(parentKey, bucket);
  });

  const compareName = (a, b) => a.name.localeCompare(b.name);
  const compareItems = (a, b) => {
    if (sortMode === 'title_asc') {
      return compareName(a, b) || a.position - b.position || a.originalIndex - b.originalIndex;
    }
    if (sortMode === 'title_desc') {
      return compareName(b, a) || a.position - b.position || a.originalIndex - b.originalIndex;
    }
    if (sortMode === 'count_desc') {
      return b.postCount - a.postCount || compareName(a, b) || a.originalIndex - b.originalIndex;
    }
    if (sortMode === 'count_asc') {
      return a.postCount - b.postCount || compareName(a, b) || a.originalIndex - b.originalIndex;
    }

    return a.position - b.position || compareName(a, b) || a.originalIndex - b.originalIndex;
  };

  childrenByParent.forEach((children) => children.sort(compareItems));

  const rows = [];
  const seen = new Set();
  const pushRow = (item, depth, parentId = '') => {
    if (seen.has(item.id)) {
      return;
    }

    seen.add(item.id);
    const children = childrenByParent.get(item.id) || [];
    rows.push({
      ...item,
      depth,
      parentId,
      hasChildren: children.length > 0,
    });

    children.forEach((child) => pushRow(child, depth + 1, item.id));
  };

  (childrenByParent.get('') || []).forEach((item) => pushRow(item, 0, ''));
  normalized.forEach((item) => {
    if (!seen.has(item.id)) {
      pushRow(item, 0, '');
    }
  });

  return rows;
}

export function normalizeBlogCategorySort(value) {
  const raw = String(value || '').trim();
  return blogCategorySortOptions.some((option) => option.value === raw) ? raw : 'position';
}

export function normalizeBlogCategoryMediaMode(value) {
  const raw = String(value || '').trim();
  return blogCategoryMediaOptions.some((option) => option.value === raw) ? raw : 'icon';
}

export function normalizeLinkMode(value) {
  return String(value || '').trim() === 'span' ? 'span' : 'link';
}

export function getDefaultContentLabel(type) {
  if (type === 'banner') {
    return 'Banner';
  }
  if (type === 'video') {
    return 'Video';
  }
  if (type === 'image') {
    return 'Image card';
  }
  if (type === 'map') {
    return 'Map';
  }
  if (type === 'text') {
    return 'Text card';
  }
  if (type === 'category_tree') {
    return 'Product catalog';
  }
  if (type === 'hook') {
    return 'PrestaShop hook';
  }
  if (type === 'blog_post') {
    return 'Blog post';
  }
  if (type === 'blog_list') {
    return 'Latest blog posts';
  }
  if (type === 'blog_carousel') {
    return 'Blog carousel';
  }
  if (type === 'blog_popular') {
    return 'Popular blog posts';
  }
  if (type === 'blog_categories') {
    return 'Blog categories';
  }

  return contentTypes.find((item) => item.value === type)?.label || 'New item';
}

export function getDefaultContentLink(type) {
  if (type === 'video') {
    return '/';
  }
  if (['custom', 'banner', 'image', 'text'].includes(type)) {
    return '#';
  }

  return '';
}

export const structureTemplates = [
  {
    value: 'layout-row',
    label: 'Row',
    description: 'Full-width layout row. Put columns inside it, then blocks inside columns.',
    icon: Layers,
  },
  {
    value: 'blank-column',
    label: 'Column',
    description: '12-grid layout column that holds reusable blocks.',
    icon: Columns3,
  },
  {
    value: 'blank-block',
    label: 'Block',
    description: 'Configurable ready-made view with optional heading and content.',
    icon: Boxes,
  },
  {
    value: 'tabs-group',
    label: 'Tabs row',
    description: 'Tabs with editable panels made from columns and blocks.',
    icon: Layers,
  },
  {
    value: 'hero-strip',
    label: 'Hero banner block',
    description: 'Wide promotional banner component.',
    icon: Image,
  },
  {
    value: 'compact-list',
    label: 'Compact list block',
    description: 'Small product/link list like bestsellers or news.',
    icon: FileText,
  },
  {
    value: 'benefits-row',
    label: 'Benefits block',
    description: 'Flexible icon/text badges for benefits or shortcuts.',
    icon: Check,
  },
  {
    value: 'store-card',
    label: 'Store card block',
    description: 'Address, hours and contact information component.',
    icon: FileText,
  },
  {
    value: 'media-stack',
    label: 'Media stack block',
    description: 'Promo banners plus video in one reusable block.',
    icon: Video,
  },
  {
    value: 'footer-actions',
    label: 'Feature strip block',
    description: 'Full-width flexible shortcut actions.',
    icon: Link2,
  },
];

export const FORBIDDEN_HOOK_OPTIONS = new Set([
  'displayTop',
  'displayNav1',
  'displayNav2',
  'displayNavFullWidth',
]);

export const buildHookNameOptions = (selectedHook = '') => {
  const rawOptions = new Set([
    ...(Array.isArray(pluginData.availableHooks) ? pluginData.availableHooks : []),
    ...(Array.isArray(pluginData.hooks) ? pluginData.hooks : []),
  ]);
  if (selectedHook) {
    rawOptions.add(selectedHook);
  }

  return Array.from(rawOptions)
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value !== '')
    .filter((value) => !FORBIDDEN_HOOK_OPTIONS.has(value))
    .map((value) => ({
      value,
      label: value,
    }));
};

export const layoutTemplates = [...structureTemplates];

export const columnLayoutOptions = [
  { value: '__generic__', label: 'Generic column' },
  { value: 'component:showcase_link_column', label: 'Link column' },
  { value: 'component:showcase_products_column', label: 'Products column' },
  { value: 'component:showcase_media_column', label: 'Media column' },
  { value: 'component:showcase_collection_column', label: 'Collection column' },
  { value: 'component:showcase_action_column', label: 'Action column' },
  { value: 'component:bottom_hero_column', label: 'Bottom hero column' },
  { value: 'component:showcase_bottom_list_column', label: 'Bottom compact list column' },
  { value: 'component:showcase_store_column', label: 'Store card column' },
  { value: 'component:showcase_footer_column', label: 'Footer actions column' },
];

export const rowLayoutOptions = [
  { value: '__generic__', label: 'Generic row' },
  { value: 'component:showcase_secondary_row', label: 'Bottom row' },
];

export const blockLayoutOptions = [
  { value: '__generic__', label: 'Generic block' },
  { value: 'component:showcase_link_block', label: 'Link list block' },
  { value: 'component:showcase_secondary_link_block', label: 'Secondary link list block' },
  { value: 'component:showcase_product_grid', label: 'Product grid block' },
  { value: 'component:showcase_product_grid_three', label: 'Product grid block, 3 items' },
  { value: 'component:showcase_product_grid_two', label: 'Product grid block, 2 items' },
  { value: 'component:feature_strip', label: 'Feature strip block' },
  { value: 'component:benefits_strip', label: 'Benefits block' },
  { value: 'component:showcase_card_list', label: 'Card list block' },
  { value: 'component:showcase_media_block', label: 'Media stack block' },
  { value: 'component:hero_strip', label: 'Hero banner block' },
  { value: 'component:showcase_compact_list', label: 'Compact list block' },
  { value: 'component:showcase_blog_list', label: 'Blog list block' },
  { value: 'component:showcase_blog_carousel', label: 'Blog carousel block' },
  { value: 'component:showcase_blog_popular', label: 'Popular blog block' },
  { value: 'component:showcase_blog_categories', label: 'Blog categories block' },
  { value: 'component:showcase_store_card', label: 'Store card block' },
  { value: 'component:footer_actions', label: 'Feature strip block' },
  { value: 'component:showcase_tabs_block', label: 'Tabs block' },
  { value: 'component:showcase_video_block', label: 'Video block' },
];

export function normalizeHexColor(value, fallback = '#000000') {
  const rawValue = String(value || '').trim();
  const rawFallback = String(fallback || '#000000').trim();

  if (/^#[0-9a-fA-F]{6}$/.test(rawValue)) {
    return rawValue.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{3}$/.test(rawValue)) {
    return `#${rawValue[1]}${rawValue[1]}${rawValue[2]}${rawValue[2]}${rawValue[3]}${rawValue[3]}`.toLowerCase();
  }

  return /^#[0-9a-fA-F]{6}$/.test(rawFallback) ? rawFallback.toLowerCase() : '#000000';
}

export function OptionalNodeColorInput({ label, value, fallback, onChange }) {
  const rawValue = String(value || '').trim();
  const colorValue = normalizeHexColor(rawValue || fallback, fallback);

  return (
    <Field label={label}>
      <div className="tw-grid tw-grid-cols-[44px_minmax(0,1fr)] tw-gap-2">
        <Input
          className="tw-h-10 tw-min-w-0 tw-p-1"
          type="color"
          value={colorValue}
          onChange={(event) => onChange(normalizeHexColor(event.target.value, fallback))}
        />
        <Input
          className="tw-font-mono tw-text-xs"
          value={rawValue}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => {
            const nextValue = event.target.value.trim();
            onChange(nextValue === '' ? '' : normalizeHexColor(nextValue, fallback));
          }}
          placeholder={__('Inherit', 'cci-nice-menu')}
        />
      </div>
    </Field>
  );
}

export function OptionalNodeLengthInput({
  label,
  value,
  fallback = '1rem',
  units = nodeLengthUnits,
  onChange,
}) {
  return (
    <Field label={label}>
      <CssLengthInput
        value={String(value || '')}
        fallback={fallback}
        units={units}
        min={0}
        max={1000}
        allowEmpty
        onChange={(nextValue) => onChange(normalizeOptionalNodeLength(nextValue, fallback, units))}
        numberAriaLabel={`${label} value`}
        unitAriaLabel={`${label} unit`}
      />
    </Field>
  );
}

export function isCatalogBackedType(type) {
  return ['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'].includes(
    type,
  );
}

export function normalizeIconClass(
  icon,
  library = pluginData.moduleSettings?.iconLibrary || 'none',
) {
  const value = String(icon || '').trim();

  if (!value) {
    return '';
  }

  if (/(^|\s)(fa|fas|far|fab|fa-solid|fa-regular|fa-brands|ti)(\s|$)/.test(value)) {
    return value;
  }

  if (library === 'fontawesome') {
    return `fa-solid fa-${value.replace(/^fa-/, '')}`;
  }

  if (library === 'tabler') {
    return `ti ti-${value.replace(/^ti-/, '')}`;
  }

  return value;
}

export function getBlockLayoutValue(componentVariant = '') {
  const variant = normalizeComponentVariant(componentVariant);

  if (variant) {
    return `component:${variant}`;
  }

  return '__generic__';
}

export function getLayoutPresetValue(componentVariant = '') {
  const variant = normalizeComponentVariant(componentVariant);

  if (variant) {
    return `component:${variant}`;
  }

  return '__generic__';
}

export function NumberInputWithUnit({ value, unit, min = 0, onChange }) {
  return (
    <InputGroup>
      <InputGroupInput
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value || 0))}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText>{unit}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function ToggleField({ checked, label, icon, onChange }) {
  return (
    <CheckboxField
      checked={checked}
      icon={icon}
      onCheckedChange={(value) => onChange(value === true)}
    >
      {label}
    </CheckboxField>
  );
}

export function TypeBadge({ type, labelOverride = '' }) {
  const meta = contentTypes.find((item) => item.value === type);
  const label =
    labelOverride ||
    meta?.label ||
    (type === 'row' ? 'Row' : type === 'column' ? 'Column' : type === 'block' ? 'Block' : 'Item');

  return (
    <span className="tw-inline-flex tw-h-6 tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-px-2 tw-text-xs tw-font-semibold tw-tracking-normal tw-text-slate-700">
      {label}
    </span>
  );
}

export function getAdminNodeTypeDisplayLabel(node = {}, displayLabel = '') {
  const type = node?.type || 'custom';
  const typeLabel = type === 'block' ? getBlockComponentDisplayLabel(node) : getNodeTypeLabel(type);

  return normalizeComparableLabel(displayLabel) !== normalizeComparableLabel(typeLabel)
    ? typeLabel
    : '';
}

export function ElementContextPanel({ type, label, description, node = null }) {
  const meta = contentTypes.find((item) => item.value === type);
  const Icon =
    meta?.icon ||
    (type === 'row' ? Layers : type === 'column' ? Columns3 : type === 'block' ? Boxes : Link2);
  const displayLabel =
    type === 'block'
      ? getBlockHeaderLabel(node || { type, label }, 0, 1, '')
      : label || getNodeTypeLabel(type);
  const typeLabel = getAdminNodeTypeDisplayLabel(node || { type, label }, displayLabel);

  return (
    <div className="tw-grid tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4">
      <span className="tw-inline-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm">
        <Icon aria-hidden="true" className="tw-h-4 tw-w-4" />
      </span>
      <span className="tw-min-w-0">
        <span className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
          <strong className="tw-min-w-0 tw-truncate tw-text-base tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
            {displayLabel}
          </strong>
          {typeLabel ? <TypeBadge type={type} labelOverride={typeLabel} /> : null}
        </span>
        {description ? (
          <span className="tw-mt-1 tw-block tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function EditorPanel({ title, description = '', defaultOpen = true, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const previousTitleRef = React.useRef(title);

  React.useEffect(() => {
    if (previousTitleRef.current !== title) {
      previousTitleRef.current = title;
      setOpen(defaultOpen);
    }
  }, [defaultOpen, title]);

  return (
    <section className="tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-bg-slate-50">
      <Button
        variant="unstyled"
        type="button"
        className="tw-flex tw-w-full tw-cursor-pointer tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-left tw-shadow-none hover:tw-bg-slate-100"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="tw-min-w-0">
          <strong className="tw-block tw-text-[15px] tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-900">
            {title}
          </strong>
          {description ? (
            <span className="tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`tw-h-4 tw-w-4 tw-shrink-0 tw-text-cci-nm-muted tw-transition-transform ${open ? 'tw-rotate-180' : ''}`}
        />
      </Button>
      {open ? (
        <div className="tw-grid tw-gap-4 tw-border-0 tw-border-t tw-border-solid tw-border-slate-200 tw-bg-white tw-p-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function getNodeTypeLabel(type) {
  return (
    contentTypes.find((item) => item.value === type)?.label ||
    (type === 'row' ? 'Row' : type === 'column' ? 'Column' : type === 'block' ? 'Block' : 'Item')
  );
}

export function normalizeComparableLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export const blockComponentDisplayLabels = {
  showcase_link_block: 'Link list',
  showcase_secondary_link_block: 'Link list',
  showcase_product_grid: 'Product grid',
  showcase_product_grid_three: 'Product grid',
  showcase_product_grid_two: 'Product grid',
  feature_strip: 'Feature strip',
  benefits_strip: 'Benefits',
  showcase_card_list: 'Card list',
  showcase_media_block: 'Media stack',
  hero_strip: 'Banner',
  showcase_compact_list: 'Compact list',
  showcase_blog_list: 'Blog list',
  showcase_blog_carousel: 'Blog carousel',
  showcase_blog_popular: 'Popular posts',
  showcase_blog_categories: 'Blog categories',
  showcase_blog_sticky: 'Blog sticky',
  showcase_store_card: 'Store card',
  footer_actions: 'Feature strip',
  showcase_tabs_block: 'Tabs',
  showcase_video_block: 'Video',
};

export function getBlockVariantDisplayLabel(value) {
  const rawVariant = String(value || '')
    .trim()
    .replace(/^component:/i, '');
  const variant = normalizeComponentVariant(rawVariant);

  if (!variant) {
    return '';
  }

  return blockComponentDisplayLabels[variant] || '';
}

export function getBlockChildrenDisplayLabel(children = []) {
  const safeChildren = Array.isArray(children) ? children.filter(Boolean) : [];

  if (!safeChildren.length) {
    return '';
  }
  if (safeChildren.some((child) => child.type === 'category_tree')) {
    return 'Category tree';
  }
  if (safeChildren.every((child) => ['category', 'custom', 'cms_page'].includes(child.type))) {
    return 'Link list';
  }
  if (safeChildren.every((child) => ['product', 'product_tile'].includes(child.type))) {
    return 'Product list';
  }
  if (safeChildren.length === 1) {
    const child = safeChildren[0];
    const childVariantLabel = getBlockVariantDisplayLabel(child.component_variant || '');

    if (childVariantLabel) {
      return childVariantLabel;
    }
    if (child.type === 'banner') {
      return 'Banner';
    }
    if (child.type === 'video') {
      return 'Video';
    }
    if (child.type === 'image') {
      return 'Image';
    }
    if (child.type === 'map') {
      return 'Map';
    }
    if (child.type === 'hook') {
      return 'Hook';
    }
    if (child.type === 'text') {
      return 'Text card';
    }
  }
  if (safeChildren.some((child) => ['banner', 'video', 'image'].includes(child.type))) {
    return 'Media stack';
  }
  if (safeChildren.some((child) => child.type === 'map')) {
    return 'Map';
  }
  if (safeChildren.every((child) => child.type === 'text')) {
    return 'Text cards';
  }

  return '';
}

export function getBlockComponentDisplayLabel(block = {}) {
  return (
    getBlockVariantDisplayLabel(block.component_variant || '') ||
    getBlockChildrenDisplayLabel(block.children || []) ||
    'Block'
  );
}

export function isGenericBlockDisplayLabel(value) {
  const normalized = normalizeComparableLabel(value).replace(/\s+/g, ' ');

  return (
    normalized === '' || normalized === 'links block' || /^(block|blok)\s*\d*$/.test(normalized)
  );
}

export function getDefaultBlockDisplayLabel(blockIndex = 0, blockCount = 1) {
  return 'Block';
}

export function getBlockHeaderLabel(block = {}, blockIndex = 0, blockCount = 1, parentLabel = '') {
  const label = String(block.label || '').trim();
  const normalizedLabel = normalizeComparableLabel(label);
  const normalizedParent = normalizeComparableLabel(parentLabel);
  const children = Array.isArray(block.children) ? block.children : [];
  const onlyChildLabel = children.length === 1 ? normalizeComparableLabel(children[0]?.label) : '';
  const duplicatesContext =
    normalizedLabel && (normalizedLabel === normalizedParent || normalizedLabel === onlyChildLabel);

  if (isGenericBlockDisplayLabel(label) || duplicatesContext) {
    return (
      getBlockComponentDisplayLabel(block) || getDefaultBlockDisplayLabel(blockIndex, blockCount)
    );
  }

  return label;
}

export function CatalogResultPicker({ type, items, loading, selectedId = '', onPick }) {
  if (loading) {
    return (
      <div className="tw-grid tw-min-h-36 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4 tw-text-center">
        <div>
          <PackageSearch
            aria-hidden="true"
            className="tw-mx-auto tw-mb-2 tw-h-6 tw-w-6 tw-animate-pulse tw-text-cci-nm-brand"
          />
          <p className="tw-m-0 tw-text-sm tw-text-cci-nm-muted">
            {__('Loading suggestions...', 'cci-nice-menu')}
          </p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="tw-grid tw-min-h-36 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4 tw-text-center">
        <div>
          <PackageSearch
            aria-hidden="true"
            className="tw-mx-auto tw-mb-2 tw-h-6 tw-w-6 tw-text-cci-nm-muted"
          />
          <p className="tw-m-0 tw-text-sm tw-text-cci-nm-muted">
            {__('No suggestions yet. Try filtering by name.', 'cci-nice-menu')}
          </p>
        </div>
      </div>
    );
  }

  if (
    type === 'product' ||
    type === 'product_tile' ||
    type === 'cms_page' ||
    type === 'blog_post'
  ) {
    const Icon = type === 'product' || type === 'product_tile' ? ShoppingBag : FileText;

    return (
      <div className="tw-grid tw-max-h-80 tw-gap-2 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-2">
        {items.map((item) => {
          const selected = String(item.id) === String(selectedId || '');

          return (
            <Button
              variant="unstyled"
              key={`${item.type || type}-${item.id}`}
              type="button"
              className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)_auto] tw-items-center tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-sm tw-transition-colors hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft ${selected ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white'}`}
              onClick={() => onPick(item)}
            >
              <span className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm">
                <Icon aria-hidden="true" className="tw-h-4 tw-w-4" />
              </span>
              <span className="tw-min-w-0">
                <strong className="tw-block tw-truncate tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                  {item.name}
                </strong>
                <span className="tw-block tw-truncate tw-text-xs tw-text-cci-nm-muted">
                  {type === 'blog_post'
                    ? `${Number(item.views || 0)} views${item.reference ? ` · ${item.reference}` : ''}`
                    : item.price
                      ? `${item.price}${item.reference ? ` · ${item.reference}` : ''}`
                      : item.reference
                        ? `Reference: ${item.reference}`
                        : item.url}
                </span>
              </span>
              <span className="tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-cci-nm-muted">
                #{item.id}
              </span>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tw-grid tw-max-h-80 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-1">
      {items.map((item) => {
        const depth = Math.max(0, Number(item.level || 0) - 2);
        const selected = String(item.id) === String(selectedId || '');
        const productCount = Number(item.product_count || 0);

        return (
          <Button
            variant="unstyled"
            key={`${item.type || 'category'}-${item.id}`}
            type="button"
            className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)_auto_auto] tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-px-2 tw-py-2 tw-text-left tw-transition-colors hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft ${selected ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-transparent tw-bg-transparent'}`}
            style={{ paddingLeft: `${10 + depth * 18}px` }}
            onClick={() => onPick(item)}
          >
            <span className="tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand">
              <FolderTree aria-hidden="true" className="tw-h-4 tw-w-4" />
            </span>
            <span className="tw-min-w-0">
              <strong className="tw-block tw-truncate tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                {item.name}
              </strong>
              <span className="tw-block tw-truncate tw-text-xs tw-text-cci-nm-muted">
                {item.url}
              </span>
            </span>
            <span
              className={`tw-rounded-full tw-border tw-border-solid tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold ${productCount > 0 ? 'tw-border-emerald-100 tw-bg-emerald-50 tw-text-emerald-700' : 'tw-border-slate-200 tw-bg-slate-50 tw-text-slate-500'}`}
            >
              {__('Products: %count%', 'cci-nice-menu').replace('%count%', String(productCount))}
            </span>
            <span className="tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-cci-nm-muted">
              #{item.id}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

export function AddContentModal({
  open,
  mode = 'add',
  parentLabel,
  initialNode = null,
  initialType = 'custom',
  allowStructurePresets = true,
  isTopLevel = false,
  onCancel,
  onAdd,
  onSave,
  onOpenSettings,
}) {
  const [type, setType] = React.useState('custom');
  const [label, setLabel] = React.useState('New item');
  const [link, setLink] = React.useState('#');
  const [headingLink, setHeadingLink] = React.useState('');
  const [headingLinkLabel, setHeadingLinkLabel] = React.useState('');
  const [headingLinkIcon, setHeadingLinkIcon] = React.useState('');
  const [hideHeading, setHideHeading] = React.useState(false);
  const [entityId, setEntityId] = React.useState('');
  const [labelOverride, setLabelOverride] = React.useState('');
  const [urlOverride, setUrlOverride] = React.useState('');
  const [sourceLabel, setSourceLabel] = React.useState('');
  const [sourceUrl, setSourceUrl] = React.useState('');
  const [hookName, setHookName] = React.useState('displaySearch');
  const [productCount, setProductCount] = React.useState(0);
  const [imageUrl, setImageUrl] = React.useState('');
  const [mapQuery, setMapQuery] = React.useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = React.useState('');
  const [mapZoom, setMapZoom] = React.useState(15);
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [useFallbackProductTile, setUseFallbackProductTile] = React.useState(false);
  const [videoProvider, setVideoProvider] = React.useState('youtube');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [videoPoster, setVideoPoster] = React.useState('');
  const [videoAspect, setVideoAspect] = React.useState('16:9');
  const [videoSize, setVideoSize] = React.useState('default');
  const [videoAutoplay, setVideoAutoplay] = React.useState(false);
  const [videoMuted, setVideoMuted] = React.useState(true);
  const [videoLoop, setVideoLoop] = React.useState(false);
  const [videoControls, setVideoControls] = React.useState(true);
  const [videoLazy, setVideoLazy] = React.useState(true);
  const [videoStart, setVideoStart] = React.useState('');
  const [videoEnd, setVideoEnd] = React.useState('');
  const [target, setTarget] = React.useState(false);
  const [linkMode, setLinkMode] = React.useState('link');
  const [icon, setIcon] = React.useState('');
  const [iconOnly, setIconOnly] = React.useState(false);
  const [badge, setBadge] = React.useState('');
  const [ctaLabel, setCtaLabel] = React.useState('');
  const [bannerEyebrow, setBannerEyebrow] = React.useState('');
  const [bannerLayout, setBannerLayout] = React.useState('horizontal');
  const [styleBackground, setStyleBackground] = React.useState('');
  const [styleBackground2, setStyleBackground2] = React.useState('');
  const [styleText, setStyleText] = React.useState('');
  const [styleIcon, setStyleIcon] = React.useState('');
  const [styleBorder, setStyleBorder] = React.useState('');
  const [styleRadius, setStyleRadius] = React.useState('');
  const [styleBadgeBackground, setStyleBadgeBackground] = React.useState('');
  const [styleBadgeText, setStyleBadgeText] = React.useState('');
  const [tabsContentHeight, setTabsContentHeight] = React.useState('');
  const [tabsContentHeightTablet, setTabsContentHeightTablet] = React.useState('');
  const [tabsContentHeightMobile, setTabsContentHeightMobile] = React.useState('');
  const [hideOnDesktop, setHideOnDesktop] = React.useState(false);
  const [hideOnTablet, setHideOnTablet] = React.useState(false);
  const [hideOnMobile, setHideOnMobile] = React.useState(false);
  const [topLevelPlacement, setTopLevelPlacement] = React.useState('');
  const [topLevelColumnStart, setTopLevelColumnStart] = React.useState(0);
  const [layoutRole, setLayoutRole] = React.useState('');
  const [componentVariant, setComponentVariant] = React.useState('');
  const [tabsOrientation, setTabsOrientation] = React.useState('vertical');
  const [columns, setColumns] = React.useState(1);
  const [columnSpan, setColumnSpan] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(4);
  const [carouselItems, setCarouselItems] = React.useState(3);
  const [carouselMargin, setCarouselMargin] = React.useState(12);
  const [carouselAutoplay, setCarouselAutoplay] = React.useState(false);
  const [carouselAutoplayTimeout, setCarouselAutoplayTimeout] = React.useState(4500);
  const [blogCategoryMode, setBlogCategoryMode] = React.useState('all');
  const [blogCategoryIds, setBlogCategoryIds] = React.useState([]);
  const [blogCategoryHideEmpty, setBlogCategoryHideEmpty] = React.useState(true);
  const [blogCategorySort, setBlogCategorySort] = React.useState('position');
  const [blogCategoryShowCount, setBlogCategoryShowCount] = React.useState(true);
  const [blogCategoryMediaMode, setBlogCategoryMediaMode] = React.useState('icon');
  const [blogCategoryResults, setBlogCategoryResults] = React.useState([]);
  const [blogCategoryQuery, setBlogCategoryQuery] = React.useState('');
  const [blogCategoryLoading, setBlogCategoryLoading] = React.useState(false);
  const [blogCategoryError, setBlogCategoryError] = React.useState('');
  const [collapsedBlogCategoryIds, setCollapsedBlogCategoryIds] = React.useState(() => new Set());
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const nextType =
      mode === 'edit'
        ? sanitizeNodeType(initialNode?.type || 'custom')
        : sanitizeNodeType(initialType || 'custom');
    const initialDisplayOptions =
      mode === 'edit' ? getNodeDisplayOptions(initialNode || {}) : DEFAULT_DISPLAY_OPTIONS;
    setType(nextType);
    const initialTypeIsCatalogBacked = isCatalogBackedType(nextType);
    const initialLabel =
      mode === 'edit' ? initialNode?.label || 'New item' : getDefaultContentLabel(nextType);
    const initialLink =
      mode === 'edit' ? initialNode?.link || '#' : getDefaultContentLink(nextType);
    setLabel(initialLabel);
    setLink(initialLink);
    setHeadingLink(
      mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link || '') : '',
    );
    setHeadingLinkLabel(
      mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link_label || '') : '',
    );
    setHeadingLinkIcon(
      mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link_icon || '') : '',
    );
    setHideHeading(
      mode === 'edit' && nextType === 'block' ? Boolean(initialNode?.hide_heading) : false,
    );
    setEntityId(mode === 'edit' ? String(initialNode?.entity_id || '') : '');
    setLabelOverride(mode === 'edit' ? String(initialNode?.label_override || '') : '');
    setUrlOverride(mode === 'edit' ? String(initialNode?.url_override || '') : '');
    setSourceLabel(
      mode === 'edit'
        ? String(initialNode?.source_label || (initialTypeIsCatalogBacked ? initialLabel : ''))
        : '',
    );
    setSourceUrl(
      mode === 'edit'
        ? String(initialNode?.source_url || (initialTypeIsCatalogBacked ? initialLink : ''))
        : '',
    );
    setHookName(
      mode === 'edit' ? String(initialNode?.hook_name || 'displaySearch') : 'displaySearch',
    );
    setProductCount(mode === 'edit' ? Number(initialNode?.product_count || 0) : 0);
    setImageUrl(
      mode === 'edit'
        ? initialNode?.image_url || ''
        : nextType === 'map'
          ? '/modules/cci_nice_menu/views/img/showcase-map.svg'
          : '',
    );
    setMapQuery(mode === 'edit' ? String(initialNode?.map_query || '') : '');
    setMapEmbedUrl(mode === 'edit' ? String(initialNode?.map_embed_url || '') : '');
    setMapZoom(mode === 'edit' ? Number(initialNode?.map_zoom || 15) : 15);
    setDescription(mode === 'edit' ? initialNode?.description || '' : '');
    setPrice(mode === 'edit' ? initialNode?.price || '' : '');
    setUseFallbackProductTile(
      mode === 'edit' ? Boolean(initialNode?.use_fallback_product_tile) : false,
    );
    setVideoProvider(mode === 'edit' ? initialNode?.video_provider || 'youtube' : 'youtube');
    setVideoUrl(mode === 'edit' ? initialNode?.video_url || '' : '');
    setVideoPoster(mode === 'edit' ? initialNode?.video_poster || '' : '');
    setVideoAspect(mode === 'edit' ? initialNode?.video_aspect || '16:9' : '16:9');
    setVideoSize(mode === 'edit' ? initialNode?.video_size || 'default' : 'default');
    setVideoAutoplay(mode === 'edit' ? Boolean(initialNode?.video_autoplay) : false);
    setVideoMuted(mode === 'edit' ? Boolean(initialNode?.video_muted ?? true) : true);
    setVideoLoop(mode === 'edit' ? Boolean(initialNode?.video_loop) : false);
    setVideoControls(mode === 'edit' ? Boolean(initialNode?.video_controls ?? true) : true);
    setVideoLazy(mode === 'edit' ? Boolean(initialNode?.video_lazy ?? true) : true);
    setVideoStart(mode === 'edit' ? String(initialNode?.video_start || '') : '');
    setVideoEnd(mode === 'edit' ? String(initialNode?.video_end || '') : '');
    setTarget(mode === 'edit' ? Boolean(initialNode?.target) : false);
    setLinkMode(mode === 'edit' ? normalizeLinkMode(initialNode?.link_mode || 'link') : 'link');
    setIcon(
      mode === 'edit'
        ? initialNode?.icon || ''
        : nextType === 'blog_categories'
          ? 'folder-tree'
          : '',
    );
    setIconOnly(mode === 'edit' ? Boolean(initialNode?.icon_only) : false);
    setBadge(
      mode === 'edit' && !['banner', 'video'].includes(nextType) ? initialNode?.badge || '' : '',
    );
    setCtaLabel(
      mode === 'edit' && ['banner', 'video'].includes(nextType)
        ? String(initialNode?.cta_label || initialNode?.badge || '')
        : '',
    );
    setBannerEyebrow(
      mode === 'edit' && nextType === 'banner' ? String(initialNode?.banner_eyebrow || '') : '',
    );
    setBannerLayout(
      mode === 'edit' && nextType === 'banner'
        ? normalizeBannerLayout(initialNode?.banner_layout || 'horizontal')
        : 'horizontal',
    );
    setStyleBackground(mode === 'edit' ? initialNode?.style_background || '' : '');
    setStyleBackground2(mode === 'edit' ? initialNode?.style_background_2 || '' : '');
    setStyleText(mode === 'edit' ? initialNode?.style_text || '' : '');
    setStyleIcon(mode === 'edit' ? initialNode?.style_icon || '' : '');
    setStyleBorder(mode === 'edit' ? initialNode?.style_border || '' : '');
    setStyleRadius(mode === 'edit' ? initialNode?.style_radius || '' : '');
    setStyleBadgeBackground(mode === 'edit' ? initialNode?.style_badge_background || '' : '');
    setStyleBadgeText(mode === 'edit' ? initialNode?.style_badge_text || '' : '');
    setTabsContentHeight(mode === 'edit' ? initialNode?.tabs_content_height || '' : '');
    setTabsContentHeightTablet(
      mode === 'edit' ? initialNode?.tabs_content_height_tablet || '' : '',
    );
    setTabsContentHeightMobile(
      mode === 'edit' ? initialNode?.tabs_content_height_mobile || '' : '',
    );
    setHideOnDesktop(Boolean(initialDisplayOptions.hide_desktop));
    setHideOnTablet(Boolean(initialDisplayOptions.hide_tablet));
    setHideOnMobile(Boolean(initialDisplayOptions.hide_mobile));
    setTopLevelPlacement(
      isTopLevel && mode === 'edit' && initialNode?.top_level_placement === 'right' ? 'right' : '',
    );
    setTopLevelColumnStart(
      isTopLevel && mode === 'edit'
        ? Math.max(0, Math.min(12, Number(initialNode?.top_level_column_start || 0)))
        : 0,
    );
    setLayoutRole(mode === 'edit' ? normalizeLayoutRole(initialNode?.layout_role || '') : '');
    setComponentVariant(
      mode === 'edit'
        ? normalizeComponentVariant(initialNode?.component_variant || '') ||
            inferComponentVariantFromClass(initialNode?.css_class || '')
        : '',
    );
    setTabsOrientation(
      mode === 'edit'
        ? normalizeTabsOrientation(initialNode?.tabs_orientation || 'vertical')
        : 'vertical',
    );
    setColumns(mode === 'edit' ? Number(initialNode?.columns || 1) : 1);
    setColumnSpan(mode === 'edit' ? Number(initialNode?.column_span || 0) : 0);
    setItemCount(
      mode === 'edit' ? Number(initialNode?.item_count || initialNode?.product_count || 4) : 4,
    );
    setCarouselItems(mode === 'edit' ? Number(initialNode?.carousel_items || 3) : 3);
    setCarouselMargin(mode === 'edit' ? Number(initialNode?.carousel_margin || 12) : 12);
    setCarouselAutoplay(mode === 'edit' ? Boolean(initialNode?.carousel_autoplay) : false);
    setCarouselAutoplayTimeout(
      mode === 'edit' ? Number(initialNode?.carousel_autoplay_timeout || 4500) : 4500,
    );
    setBlogCategoryMode(mode === 'edit' ? String(initialNode?.blog_category_mode || 'all') : 'all');
    setBlogCategoryIds(
      mode === 'edit' ? normalizeBlogCategoryIds(initialNode?.blog_category_ids || []) : [],
    );
    setBlogCategoryHideEmpty(
      mode === 'edit' ? Boolean(initialNode?.blog_category_hide_empty ?? true) : true,
    );
    setBlogCategorySort(
      mode === 'edit'
        ? normalizeBlogCategorySort(initialNode?.blog_category_sort || 'position')
        : 'position',
    );
    setBlogCategoryShowCount(
      mode === 'edit' ? Boolean(initialNode?.blog_category_show_count ?? true) : true,
    );
    setBlogCategoryMediaMode(
      mode === 'edit'
        ? normalizeBlogCategoryMediaMode(initialNode?.blog_category_media_mode || 'icon')
        : 'icon',
    );
    setBlogCategoryResults([]);
    setBlogCategoryQuery('');
    setBlogCategoryLoading(false);
    setBlogCategoryError('');
    setCollapsedBlogCategoryIds(new Set());
    setSelectedTemplate('');
    setQuery('');
    setResults([]);
    setLoading(false);
    setError('');
  }, [open, mode, initialNode, initialType, isTopLevel]);

  React.useEffect(() => {
    if (
      !open ||
      !['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'].includes(
        type,
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    apiFetch(
      type === 'blog_post'
        ? '/blog/posts'
        : type === 'product' || type === 'product_tile'
          ? '/catalog/products'
          : type === 'cms_page'
            ? '/catalog/cms-pages'
            : '/catalog/categories',
      {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
      },
    )
      .then((response) => {
        setResults(response.items || []);
      })
      .catch((requestError) => {
        setError(requestError.message || 'Catalog suggestions failed.');
      })
      .finally(() => setLoading(false));
  }, [open, type]);

  React.useEffect(() => {
    if (!open || type !== 'blog_categories') {
      return;
    }

    setBlogCategoryLoading(true);
    setBlogCategoryError('');
    apiFetch('/blog/categories', {
      method: 'POST',
      body: JSON.stringify({ query: blogCategoryQuery }),
    })
      .then((response) => {
        setBlogCategoryResults(response.items || []);
      })
      .catch((requestError) => {
        setBlogCategoryError(requestError.message || 'Blog category suggestions failed.');
      })
      .finally(() => setBlogCategoryLoading(false));
  }, [open, type, blogCategoryQuery]);

  if (!open) {
    return null;
  }

  const needsCatalog = [
    'category',
    'category_tree',
    'product',
    'product_tile',
    'cms_page',
    'blog_post',
  ].includes(type);
  const isProductType = type === 'product' || type === 'product_tile';
  const isBlogPostType = type === 'blog_post';
  const isBlogCollectionType = ['blog_list', 'blog_carousel', 'blog_popular'].includes(type);
  const isBlogCategoryType = type === 'blog_categories';
  const isCatalogBacked = isCatalogBackedType(type);
  const entityCopy =
    type === 'cms_page'
      ? { name: 'CMS page title', url: 'CMS page URL' }
      : type === 'blog_post'
        ? { name: 'blog post title', url: 'blog post URL' }
        : type === 'category' || type === 'category_tree'
          ? { name: 'category name', url: 'category URL' }
          : type === 'product' || type === 'product_tile'
            ? { name: 'product name', url: 'product URL' }
            : { name: 'item label', url: 'item URL' };
  const selectedMeta = contentTypes.find((item) => item.value === type) || contentTypes[0];
  const selectedLayoutTemplate =
    layoutTemplates.find((item) => item.value === selectedTemplate) || null;
  const isEdit = mode === 'edit';
  const isStructure = ['row', 'column', 'block'].includes(type);
  const allowsActionLabel = ['banner', 'video'].includes(type);
  const allowsMenuBadge = !['product', 'product_tile', 'banner', 'video'].includes(type);
  const allowsBadgeColors = allowsMenuBadge || allowsActionLabel;
  const isHook = type === 'hook';
  const supportsLinkMode =
    !isStructure &&
    !isHook &&
    ![
      'banner',
      'video',
      'map',
      'text',
      'blog_list',
      'blog_carousel',
      'blog_popular',
      'blog_categories',
    ].includes(type);
  const iconLibrary = pluginData.moduleSettings?.iconLibrary || 'none';
  const iconPlaceholder =
    iconLibrary === 'fontawesome'
      ? 'user or fa-solid fa-user'
      : iconLibrary === 'tabler'
        ? 'user or ti ti-user'
        : 'icon name';
  const iconSource = pluginData.moduleSettings?.iconSource || 'local';
  const iconHelp = {
    fontawesome: {
      label: 'Font Awesome',
      description: `Font Awesome is ${iconSource === 'cdn' ? 'loaded from the vendor CDN' : 'loaded from local module files'}. Type a short free icon name or a full Font Awesome class.`,
      catalogUrl: 'https://fontawesome.com/search?o=r&m=free',
      examples: [
        'user',
        'house',
        'cart-shopping',
        'magnifying-glass',
        'bars',
        'tag',
        'phone',
        'envelope',
      ],
    },
    tabler: {
      label: 'Tabler Icons',
      description: `Tabler Icons are ${iconSource === 'cdn' ? 'loaded from the vendor CDN' : 'loaded from local module files'}. Type a short icon name or a full Tabler class.`,
      catalogUrl: 'https://tabler.io/icons',
      examples: ['user', 'home', 'shopping-cart', 'search', 'menu-2', 'tag', 'phone', 'mail'],
    },
    theme: {
      label: 'Theme icons',
      description:
        'No extra icon font is loaded. Use an icon token that the active theme already exposes.',
      catalogUrl: '',
      examples: [],
    },
    none: {
      label: 'No icon library selected',
      description:
        'No icon font is loaded. Choose Font Awesome or Tabler in Settings before adding icons.',
      catalogUrl: '',
      examples: [],
    },
  }[iconLibrary] || {
    label: 'Icon name',
    description: 'Use an icon token from the configured icon source.',
    catalogUrl: '',
    examples: [],
  };
  const dialogTitle = isEdit ? 'Edit element' : 'Add content';
  const dialogDescription = isEdit
    ? `Edit ${initialNode?.label || 'selected element'} in a focused modal.`
    : `Add an element inside ${parentLabel || 'the selected block'}.`;
  const editContextDescription = isStructure
    ? 'Structure element: edit its layout and label here, then manage child content on the canvas.'
    : selectedMeta.description;
  const primaryPanelTitle = needsCatalog
    ? isBlogPostType
      ? isEdit
        ? 'Blog source'
        : 'Choose blog post'
      : isEdit
        ? 'Catalog source'
        : 'Choose catalog source'
    : isStructure
      ? 'Structure settings'
      : selectedMeta.label;
  const primaryPanelDescription = needsCatalog
    ? isBlogPostType
      ? 'Select a published article from CCI Blog.'
      : isEdit
        ? 'Keep the current source or choose another catalog item.'
        : selectedMeta.description
    : isStructure
      ? 'Layout, width and heading options for this structural element.'
      : selectedMeta.description;
  const hasAppearanceOverrides = Boolean(
    icon ||
    badge ||
    styleBackground ||
    styleBackground2 ||
    styleText ||
    styleIcon ||
    styleBorder ||
    styleRadius ||
    styleBadgeBackground ||
    styleBadgeText ||
    tabsContentHeight ||
    tabsContentHeightTablet ||
    tabsContentHeightMobile ||
    hideOnDesktop ||
    hideOnTablet ||
    hideOnMobile ||
    (type === 'banner' && bannerEyebrow) ||
    (type === 'banner' && bannerLayout !== 'horizontal') ||
    target ||
    linkMode !== 'link' ||
    iconOnly ||
    Number(columns || 1) > 1 ||
    (isBlogCollectionType && Number(itemCount || 4) !== 4) ||
    (type === 'blog_carousel' &&
      (Number(carouselItems || 3) !== 3 ||
        Number(carouselMargin || 12) !== 12 ||
        carouselAutoplay ||
        Number(carouselAutoplayTimeout || 4500) !== 4500)) ||
    (isBlogCategoryType &&
      (blogCategoryMode !== 'all' ||
        blogCategoryIds.length > 0 ||
        !blogCategoryHideEmpty ||
        blogCategorySort !== 'position' ||
        !blogCategoryShowCount ||
        blogCategoryMediaMode !== 'icon' ||
        Number(itemCount || 8) !== 8)),
  );
  const selectedBlogCategoryIds = new Set(blogCategoryIds);
  const blogCategoryTreeRows = isBlogCategoryType
    ? buildBlogCategoryTreeRows(blogCategoryResults, blogCategorySort)
    : [];
  const blogCategoryParentById = new Map(blogCategoryTreeRows.map((row) => [row.id, row.parentId]));
  const isBlogCategoryRowVisible = (row) => {
    let parentId = row.parentId;
    while (parentId) {
      if (collapsedBlogCategoryIds.has(parentId)) {
        return false;
      }
      parentId = blogCategoryParentById.get(parentId) || '';
    }

    return true;
  };
  const visibleBlogCategoryRows = blogCategoryTreeRows.filter(isBlogCategoryRowVisible);
  const toggleBlogCategoryCollapsed = (categoryId) => {
    setCollapsedBlogCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };
  const modalBodyClass = isEdit
    ? 'tw-grid tw-min-h-0 tw-gap-4 tw-overflow-auto tw-p-6'
    : 'tw-grid tw-min-h-0 tw-gap-6 tw-overflow-auto tw-p-6 lg:tw-grid-cols-[300px_minmax(0,1fr)]';
  const canSaveCatalogSelection = Boolean(entityId);
  const selectContentType = (item) => {
    setSelectedTemplate('');
    setType(item.value);
    setEntityId('');
    setSourceLabel('');
    setSourceUrl('');
    setProductCount(0);
    setImageUrl('');
    setDescription('');
    setPrice('');
    setUseFallbackProductTile(false);
    if (item.value === 'block') {
      setHeadingLink('');
      setHeadingLinkLabel('');
      setHeadingLinkIcon('');
      setHideHeading(false);
    }
    setQuery('');
    setResults([]);
    setError('');
    setLabel(item.defaultLabel || getDefaultContentLabel(item.value));
    setLink(getDefaultContentLink(item.value));
    setHookName(item.value === 'hook' ? item.hookName || 'displaySearch' : 'displaySearch');
    setLabelOverride('');
    setUrlOverride('');
    setSourceLabel('');
    setSourceUrl('');
    setImageUrl(item.value === 'map' ? '/modules/cci_nice_menu/views/img/showcase-map.svg' : '');
    setMapQuery('');
    setMapEmbedUrl('');
    setMapZoom(15);
    setDescription('');
    setPrice('');
    setUseFallbackProductTile(false);
    setBadge('');
    setCtaLabel('');
    setLinkMode('link');
    setBannerEyebrow('');
    setBannerLayout('horizontal');
    setStyleBackground('');
    setStyleBackground2('');
    setStyleText('');
    setStyleIcon('');
    setStyleBorder('');
    setStyleRadius('');
    setStyleBadgeBackground('');
    setStyleBadgeText('');
    setIcon(item.value === 'blog_categories' ? 'folder-tree' : '');
    setIconOnly(false);
    setComponentVariant('');
    setColumnSpan(0);
    setItemCount(
      ['blog_list', 'blog_carousel', 'blog_popular'].includes(item.value)
        ? 4
        : item.value === 'blog_categories'
          ? 8
          : 1,
    );
    setCarouselItems(3);
    setCarouselMargin(12);
    setCarouselAutoplay(false);
    setCarouselAutoplayTimeout(4500);
    setBlogCategoryMode('all');
    setBlogCategoryIds([]);
    setBlogCategoryHideEmpty(true);
    setBlogCategorySort('position');
    setBlogCategoryShowCount(true);
    setBlogCategoryMediaMode('icon');
    setBlogCategoryResults([]);
    setBlogCategoryQuery('');
    setBlogCategoryError('');
    setHideOnDesktop(false);
    setHideOnTablet(false);
    setHideOnMobile(false);
    if (item.value === 'video') {
      setVideoProvider('youtube');
      setVideoUrl('');
      setVideoPoster('');
      setVideoAspect('16:9');
      setVideoSize('large');
      setVideoAutoplay(false);
      setVideoMuted(true);
      setVideoLoop(false);
      setVideoControls(true);
      setVideoLazy(true);
      setVideoStart('');
      setVideoEnd('');
    }
  };
  const selectLayoutTemplate = (template) => {
    const node = createLayoutTemplateNode(template.value);
    const nodeDisplayOptions = getNodeDisplayOptions(node);

    setSelectedTemplate(template.value);
    setType(sanitizeNodeType(node.type || 'block'));
    setLabel(node.label || template.label);
    setLink(node.link || '');
    setHeadingLink(String(node.heading_link || ''));
    setHeadingLinkLabel(String(node.heading_link_label || ''));
    setHeadingLinkIcon(String(node.heading_link_icon || ''));
    setHideHeading(Boolean(node.hide_heading));
    setEntityId('');
    setLabelOverride('');
    setUrlOverride('');
    setSourceLabel('');
    setSourceUrl('');
    setHookName(node.hook_name || 'displaySearch');
    setImageUrl(node.image_url || '');
    setMapQuery(node.map_query || '');
    setMapEmbedUrl(node.map_embed_url || '');
    setMapZoom(Number(node.map_zoom || 15));
    setDescription(node.description || '');
    setPrice(node.price || '');
    setUseFallbackProductTile(Boolean(node.use_fallback_product_tile));
    setTarget(Boolean(node.target));
    setLinkMode(normalizeLinkMode(node.link_mode || 'link'));
    setIcon(node.icon || '');
    setIconOnly(Boolean(node.icon_only));
    setBadge(!['banner', 'video'].includes(node.type) ? node.badge || '' : '');
    setCtaLabel(
      ['banner', 'video'].includes(node.type) ? String(node.cta_label || node.badge || '') : '',
    );
    setBannerEyebrow(node.type === 'banner' ? String(node.banner_eyebrow || '') : '');
    setBannerLayout(
      node.type === 'banner'
        ? normalizeBannerLayout(node.banner_layout || 'horizontal')
        : 'horizontal',
    );
    setStyleBackground(node.style_background || '');
    setStyleBackground2(node.style_background_2 || '');
    setStyleText(node.style_text || '');
    setStyleIcon(node.style_icon || '');
    setStyleBorder(node.style_border || '');
    setStyleRadius(node.style_radius || '');
    setStyleBadgeBackground(node.style_badge_background || '');
    setStyleBadgeText(node.style_badge_text || '');
    setTabsContentHeight(node.tabs_content_height || '');
    setTabsContentHeightTablet(node.tabs_content_height_tablet || '');
    setTabsContentHeightMobile(node.tabs_content_height_mobile || '');
    setHideOnDesktop(Boolean(nodeDisplayOptions.hide_desktop));
    setHideOnTablet(Boolean(nodeDisplayOptions.hide_tablet));
    setHideOnMobile(Boolean(nodeDisplayOptions.hide_mobile));
    setTopLevelPlacement(isTopLevel && node.top_level_placement === 'right' ? 'right' : '');
    setTopLevelColumnStart(
      isTopLevel ? Math.max(0, Math.min(12, Number(node.top_level_column_start || 0))) : 0,
    );
    setLayoutRole(normalizeLayoutRole(node.layout_role || ''));
    setComponentVariant(
      normalizeComponentVariant(node.component_variant || '') ||
        inferComponentVariantFromClass(node.css_class || ''),
    );
    setTabsOrientation(normalizeTabsOrientation(node.tabs_orientation || 'vertical'));
    setColumns(Number(node.columns || 1));
    setColumnSpan(Number(node.column_span || 0));
    setProductCount(Number(node.product_count || 0));
    setItemCount(Number(node.item_count || node.product_count || 4));
    setCarouselItems(Number(node.carousel_items || 3));
    setCarouselMargin(Number(node.carousel_margin || 12));
    setCarouselAutoplay(Boolean(node.carousel_autoplay));
    setCarouselAutoplayTimeout(Number(node.carousel_autoplay_timeout || 4500));
    setBlogCategoryMode(String(node.blog_category_mode || 'all'));
    setBlogCategoryIds(normalizeBlogCategoryIds(node.blog_category_ids || []));
    setBlogCategoryHideEmpty(Boolean(node.blog_category_hide_empty ?? true));
    setBlogCategorySort(normalizeBlogCategorySort(node.blog_category_sort || 'position'));
    setBlogCategoryShowCount(Boolean(node.blog_category_show_count ?? true));
    setBlogCategoryMediaMode(
      normalizeBlogCategoryMediaMode(node.blog_category_media_mode || 'icon'),
    );
    setBlogCategoryResults([]);
    setBlogCategoryQuery('');
    setBlogCategoryError('');
    setQuery('');
    setResults([]);
    setError('');
  };
  const buildPatch = () => {
    const cleanLabelOverride = labelOverride.trim();
    const cleanUrlOverride = urlOverride.trim();
    const cleanSourceLabel = sourceLabel.trim();
    const cleanSourceUrl = sourceUrl.trim();
    const cleanHeadingLink = headingLink.trim();
    const cleanHeadingLinkLabel = headingLinkLabel.trim();
    const cleanHeadingLinkIcon = headingLinkIcon.trim();
    const effectiveLabel = isCatalogBacked
      ? cleanLabelOverride || cleanSourceLabel || label || selectedMeta.label
      : label || selectedMeta.label;
    const effectiveLink = isStructure
      ? ''
      : linkMode === 'span'
        ? ''
        : type === 'hook'
          ? ''
          : type === 'map'
            ? ''
            : type === 'blog_categories'
              ? ''
              : isCatalogBacked
                ? cleanUrlOverride || cleanSourceUrl || link || '#'
                : link || '#';

    return {
      type,
      label: effectiveLabel,
      link: effectiveLink,
      entity_id: entityId,
      label_override: isCatalogBacked ? cleanLabelOverride : '',
      url_override: isCatalogBacked ? cleanUrlOverride : '',
      source_label: isCatalogBacked ? cleanSourceLabel || label || selectedMeta.label : '',
      source_url: isCatalogBacked ? cleanSourceUrl || link || '#' : '',
      hook_name: type === 'hook' ? hookName.trim() : '',
      heading_link: type === 'block' ? cleanHeadingLink : '',
      heading_link_label: type === 'block' ? cleanHeadingLinkLabel : '',
      heading_link_icon: type === 'block' ? cleanHeadingLinkIcon : '',
      hide_heading: type === 'block' ? hideHeading : false,
      image_url: imageUrl,
      map_query: type === 'map' ? mapQuery.trim() : '',
      map_embed_url: type === 'map' ? mapEmbedUrl.trim() : '',
      map_zoom: type === 'map' ? Number(mapZoom || 15) : 15,
      description,
      price,
      use_fallback_product_tile: type === 'product_tile' ? useFallbackProductTile : false,
      video_provider: videoProvider,
      video_url: videoUrl,
      video_poster: videoPoster,
      video_aspect: videoAspect,
      video_size: videoSize,
      video_autoplay: videoAutoplay,
      video_muted: videoMuted,
      video_loop: videoLoop,
      video_controls: videoControls,
      video_lazy: videoLazy,
      video_start: videoStart,
      video_end: videoEnd,
      target,
      link_mode: normalizeLinkMode(linkMode),
      icon,
      icon_only: iconOnly,
      cta_label: allowsActionLabel ? ctaLabel : '',
      banner_eyebrow: type === 'banner' ? bannerEyebrow : '',
      banner_layout: type === 'banner' ? bannerLayout : 'horizontal',
      badge: allowsMenuBadge ? badge : '',
      component_variant: normalizeComponentVariant(componentVariant),
      style_background: styleBackground,
      style_background_2: styleBackground2,
      style_text: styleText,
      style_icon: styleIcon,
      style_border: styleBorder,
      style_radius: normalizeOptionalNodeLength(styleRadius, '12px', radiusLengthUnits),
      style_badge_background: allowsBadgeColors ? styleBadgeBackground : '',
      style_badge_text: allowsBadgeColors ? styleBadgeText : '',
      tabs_content_height:
        layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeight, '680px') : '',
      tabs_content_height_tablet:
        layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeightTablet, '620px') : '',
      tabs_content_height_mobile:
        layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeightMobile, '72vh') : '',
      display_options: {
        hide_desktop: hideOnDesktop,
        hide_tablet: hideOnTablet,
        hide_mobile: hideOnMobile,
      },
      top_level_placement: isTopLevel ? topLevelPlacement : '',
      top_level_column_start: isTopLevel
        ? Math.max(0, Math.min(12, Number(topLevelColumnStart || 0)))
        : 0,
      layout_role: layoutRole,
      tabs_orientation: layoutRole === 'tabs' ? tabsOrientation : 'vertical',
      columns: Number(columns || 1),
      column_span: Number(columnSpan || 0),
      item_count:
        isBlogCollectionType || isBlogCategoryType
          ? Number(itemCount || (isBlogCategoryType ? 8 : 4))
          : 1,
      carousel_items:
        type === 'blog_carousel' ? Math.max(1, Math.min(6, Number(carouselItems || 3))) : 3,
      carousel_margin:
        type === 'blog_carousel' ? Math.max(0, Math.min(48, Number(carouselMargin || 12))) : 12,
      carousel_autoplay: type === 'blog_carousel' ? Boolean(carouselAutoplay) : false,
      carousel_autoplay_timeout:
        type === 'blog_carousel'
          ? Math.max(1000, Math.min(20000, Number(carouselAutoplayTimeout || 4500)))
          : 4500,
      blog_category_mode: isBlogCategoryType
        ? blogCategoryMode === 'selected'
          ? 'selected'
          : 'all'
        : 'all',
      blog_category_ids: isBlogCategoryType ? blogCategoryIds : [],
      blog_category_hide_empty: isBlogCategoryType ? blogCategoryHideEmpty : true,
      blog_category_sort: isBlogCategoryType
        ? normalizeBlogCategorySort(blogCategorySort)
        : 'position',
      blog_category_show_count: isBlogCategoryType ? blogCategoryShowCount : true,
      blog_category_media_mode: isBlogCategoryType
        ? normalizeBlogCategoryMediaMode(blogCategoryMediaMode)
        : 'icon',
      product_count: Number(productCount || 0),
    };
  };

  const searchCatalog = () => {
    if (!needsCatalog) {
      return;
    }

    setLoading(true);
    setError('');
    apiFetch(
      type === 'blog_post'
        ? '/blog/posts'
        : type === 'product' || type === 'product_tile'
          ? '/catalog/products'
          : type === 'cms_page'
            ? '/catalog/cms-pages'
            : '/catalog/categories',
      {
        method: 'POST',
        body: JSON.stringify({ query }),
      },
    )
      .then((response) => {
        setResults(response.items || []);
      })
      .catch((requestError) => {
        setError(requestError.message || 'Catalog search failed.');
      })
      .finally(() => setLoading(false));
  };

  const addManual = () => {
    if (isEdit) {
      onSave?.(buildPatch());
      return;
    }

    const templateNode = selectedLayoutTemplate
      ? createLayoutTemplateNode(selectedLayoutTemplate.value)
      : null;

    onAdd(
      createNode({
        ...(templateNode || {}),
        ...buildPatch(),
        children: templateNode?.children || [],
      }),
    );
  };

  const setCatalogSelectionState = (patch) => {
    setLabel(patch.label);
    setLink(patch.link);
    setEntityId(patch.entity_id);
    setLabelOverride(patch.label_override);
    setUrlOverride(patch.url_override);
    setSourceLabel(patch.source_label);
    setSourceUrl(patch.source_url);
    setProductCount(patch.product_count);
    setImageUrl(patch.image_url);
    setDescription(patch.description);
    setPrice(patch.price);
    setUseFallbackProductTile(Boolean(patch.use_fallback_product_tile));
    setLinkMode(normalizeLinkMode(patch.link_mode || 'link'));
    setQuery(patch.label);
  };

  const addCatalogItem = (item) => {
    const patch = {
      type,
      label: item.name || selectedMeta.label,
      link: item.url || '#',
      entity_id: String(item.id || ''),
      label_override: '',
      url_override: '',
      source_label: item.name || selectedMeta.label,
      source_url: item.url || '#',
      product_count: Number(item.product_count || 0),
      image_url: item.image_url || imageUrl,
      description: type === 'blog_post' ? item.intro || item.reference || '' : item.reference || '',
      price: item.price || price,
      use_fallback_product_tile: type === 'product_tile' ? useFallbackProductTile : false,
      target,
      link_mode: normalizeLinkMode(linkMode),
      icon,
      icon_only: iconOnly,
      cta_label: allowsActionLabel ? ctaLabel : '',
      banner_eyebrow: type === 'banner' ? bannerEyebrow : '',
      banner_layout: type === 'banner' ? bannerLayout : 'horizontal',
      badge: allowsMenuBadge ? badge : '',
      component_variant: normalizeComponentVariant(componentVariant),
      style_background: styleBackground,
      style_background_2: styleBackground2,
      style_text: styleText,
      style_icon: styleIcon,
      style_border: styleBorder,
      style_radius: normalizeOptionalNodeLength(styleRadius, '12px', radiusLengthUnits),
      style_badge_background: allowsBadgeColors ? styleBadgeBackground : '',
      style_badge_text: allowsBadgeColors ? styleBadgeText : '',
      columns: Number(columns || 1),
      column_span: Number(columnSpan || 0),
      item_count:
        isBlogCollectionType || isBlogCategoryType
          ? Number(itemCount || (isBlogCategoryType ? 8 : 4))
          : 1,
      carousel_items:
        type === 'blog_carousel' ? Math.max(1, Math.min(6, Number(carouselItems || 3))) : 3,
      carousel_margin:
        type === 'blog_carousel' ? Math.max(0, Math.min(48, Number(carouselMargin || 12))) : 12,
      carousel_autoplay: type === 'blog_carousel' ? Boolean(carouselAutoplay) : false,
      carousel_autoplay_timeout:
        type === 'blog_carousel'
          ? Math.max(1000, Math.min(20000, Number(carouselAutoplayTimeout || 4500)))
          : 4500,
    };

    setCatalogSelectionState(patch);
  };

  return (
    <BuilderDialogFrame
      labelledBy="cci-nice-menu-add-content-title"
      onClose={onCancel}
      portalContainer={document.getElementById('cci-nice-menu-admin-root')}
    >
      <BuilderDialogHeader>
        <div>
          <h2
            id="cci-nice-menu-add-content-title"
            className="tw-m-0 tw-text-xl tw-font-semibold tw-leading-tight tw-tracking-normal tw-text-cci-nm-text"
          >
            {dialogTitle}
          </h2>
          <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {dialogDescription}
          </p>
        </div>
        <Button
          variant="unstyled"
          type="button"
          className="tw-inline-flex tw-h-8 tw-w-8 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-muted hover:tw-bg-slate-50"
          onClick={onCancel}
          aria-label={__('Close add content modal', 'cci-nice-menu')}
        >
          <X aria-hidden="true" className="tw-h-4 tw-w-4" />
        </Button>
      </BuilderDialogHeader>

      <BuilderDialogBody className={modalBodyClass}>
        {!isEdit ? (
          <div className="tw-grid tw-content-start tw-gap-4">
            {contentTypeGroups.map((group) => {
              const groupItems = group.values
                .map((value) => contentTypes.find((item) => item.value === value))
                .filter(Boolean);

              return (
                <div key={group.label} className="tw-grid tw-gap-2">
                  <div className="tw-px-1 tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700">
                    {group.label}
                  </div>
                  {groupItems.map((item) => {
                    const Icon = item.icon;
                    const active = !selectedTemplate && item.value === type;

                    return (
                      <Button
                        variant="unstyled"
                        key={item.value}
                        type="button"
                        className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-none tw-transition-colors ${active ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white hover:tw-border-cci-nm-brandBorder hover:tw-bg-slate-50'}`}
                        onClick={() => selectContentType(item)}
                      >
                        <span className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm">
                          <Icon aria-hidden="true" className="tw-h-4 tw-w-4" />
                        </span>
                        <span className="tw-min-w-0">
                          <strong className="tw-block tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
                            {item.label}
                          </strong>
                          <span className="tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                            {item.description}
                          </span>
                        </span>
                      </Button>
                    );
                  })}
                </div>
              );
            })}

            {allowStructurePresets
              ? [
                  { label: __('Structure presets', 'cci-nice-menu'), items: structureTemplates },
                ].map((section) => (
                  <div key={section.label} className="tw-grid tw-gap-2">
                    <div className="tw-px-1 tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700">
                      {section.label}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = selectedTemplate === item.value;

                      return (
                        <Button
                          variant="unstyled"
                          key={item.value}
                          type="button"
                          className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-none tw-transition-colors ${active ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white hover:tw-border-cci-nm-brandBorder hover:tw-bg-slate-50'}`}
                          onClick={() => selectLayoutTemplate(item)}
                        >
                          <span className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand tw-shadow-sm">
                            <Icon aria-hidden="true" className="tw-h-4 tw-w-4" />
                          </span>
                          <span className="tw-min-w-0">
                            <strong className="tw-block tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
                              {item.label}
                            </strong>
                            <span className="tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                              {item.description}
                            </span>
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                ))
              : null}
          </div>
        ) : null}

        <div className="tw-grid tw-content-start tw-gap-4">
          {isEdit ? (
            <ElementContextPanel
              type={type}
              label={label || initialNode?.label}
              description={editContextDescription}
              node={initialNode}
            />
          ) : null}

          {type === 'category_tree' ? (
            <div className="tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4">
              <strong className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                <FolderTree aria-hidden="true" className="tw-h-4 tw-w-4 tw-text-cci-nm-brand" />
                {__('Dynamic catalog mode', 'cci-nice-menu')}
              </strong>
              <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                {__(
                  'Pick the source category. On the storefront, its direct child categories become vertical tabs, and each hovered category builds its right-side columns from live subcategories.',
                  'cci-nice-menu',
                )}
              </p>
            </div>
          ) : null}

          <EditorPanel title={primaryPanelTitle} description={primaryPanelDescription}>
            {needsCatalog ? (
              <div className="tw-grid tw-gap-3">
                <Field
                  label={
                    isBlogPostType
                      ? __('Filter blog posts', 'cci-nice-menu')
                      : isProductType
                        ? __('Filter products', 'cci-nice-menu')
                        : type === 'cms_page'
                          ? __('Filter CMS pages', 'cci-nice-menu')
                          : __('Filter categories', 'cci-nice-menu')
                  }
                >
                  <div className="tw-flex tw-gap-2">
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          searchCatalog();
                        }
                      }}
                      placeholder={
                        isBlogPostType
                          ? __('Filter posts by title, intro or slug', 'cci-nice-menu')
                          : isProductType
                            ? __('Filter latest products by name or reference', 'cci-nice-menu')
                            : type === 'cms_page'
                              ? __('Filter CMS pages by title', 'cci-nice-menu')
                              : __('Filter the category tree', 'cci-nice-menu')
                      }
                    />
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={searchCatalog}
                      disabled={loading}
                    >
                      <PackageSearch aria-hidden="true" />
                      {loading ? __('Loading...', 'cci-nice-menu') : 'Filter'}
                    </Button>
                  </div>
                </Field>
                {error ? <p className="tw-m-0 tw-text-sm tw-text-red-600">{error}</p> : null}
                <div className="tw-grid tw-gap-2">
                  <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                    <strong className="tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                      {isBlogPostType
                        ? __('Published posts', 'cci-nice-menu')
                        : isProductType
                          ? __('Latest products', 'cci-nice-menu')
                          : type === 'cms_page'
                            ? __('CMS pages', 'cci-nice-menu')
                            : __('Category tree', 'cci-nice-menu')}
                    </strong>
                    <span className="tw-text-xs tw-font-medium tw-text-cci-nm-muted">
                      {__('Available: %count%', 'cci-nice-menu').replace(
                        '%count%',
                        String(results.length),
                      )}
                    </span>
                  </div>
                  <CatalogResultPicker
                    type={type}
                    items={results}
                    loading={loading}
                    selectedId={entityId}
                    onPick={addCatalogItem}
                  />
                </div>
                {isEdit || entityId ? (
                  <FieldGroup>
                    <Field label="Source label">
                      <Input value={sourceLabel || label} disabled />
                    </Field>
                    <Field label="Source URL">
                      <Input value={sourceUrl || link} disabled />
                    </Field>
                    <Field label="Custom label override">
                      <Input
                        value={labelOverride}
                        onChange={(event) => setLabelOverride(event.target.value)}
                        placeholder={`Leave empty to use the current ${entityCopy.name}`}
                      />
                    </Field>
                    {linkMode !== 'span' ? (
                      <Field label="Custom URL override">
                        <Input
                          value={urlOverride}
                          onChange={(event) => setUrlOverride(event.target.value)}
                          placeholder={`Leave empty to generate the current ${entityCopy.url}`}
                        />
                      </Field>
                    ) : null}
                    <Field label={__('Description', 'cci-nice-menu')}>
                      <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </Field>
                    {['category', 'cms_page', 'product', 'product_tile', 'blog_post'].includes(
                      type,
                    ) ? (
                      <Field
                        label={
                          type === 'category'
                            ? __('Category image URL', 'cci-nice-menu')
                            : isProductType
                              ? __('Product image URL', 'cci-nice-menu')
                              : isBlogPostType
                                ? __('Blog cover image URL', 'cci-nice-menu')
                                : __('Item image URL', 'cci-nice-menu')
                        }
                      >
                        <LocalMediaUrlInput
                          value={imageUrl}
                          onChange={setImageUrl}
                          placeholder={
                            isBlogPostType
                              ? __(
                                  'Leave empty to use the current blog cover image',
                                  'cci-nice-menu',
                                )
                              : __('Leave empty to use the current catalog image', 'cci-nice-menu')
                          }
                        />
                        <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                          {__(
                            'Optional media shown next to the item label. It is not the click target URL.',
                            'cci-nice-menu',
                          )}
                        </p>
                      </Field>
                    ) : null}
                    {isProductType ? (
                      <Field label={__('Product price', 'cci-nice-menu')}>
                        <Input
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          placeholder={__(
                            'Leave empty to use the current shop price',
                            'cci-nice-menu',
                          )}
                        />
                      </Field>
                    ) : null}
                    {type === 'product_tile' ? (
                      <div className="md:tw-col-span-2">
                        <ToggleField
                          checked={useFallbackProductTile}
                          label={__('Use editable product card', 'cci-nice-menu')}
                          onChange={setUseFallbackProductTile}
                        />
                      </div>
                    ) : null}
                    {entityId ? (
                      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-3 tw-text-xs tw-font-semibold tw-text-cci-nm-muted">
                        <span>
                          {__('Selected ID: #', 'cci-nice-menu')}
                          {entityId}
                        </span>
                        {['category', 'category_tree'].includes(type) ? (
                          <span>
                            {__('Products: %count%', 'cci-nice-menu').replace(
                              '%count%',
                              String(productCount),
                            )}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </FieldGroup>
                ) : null}
              </div>
            ) : (
              <FieldGroup>
                <Field label="Label">
                  <Input value={label} onChange={(event) => setLabel(event.target.value)} />
                </Field>
                {isBlogCollectionType ? (
                  <Field label={__('Item count', 'cci-nice-menu')}>
                    <NumberInputWithUnit
                      value={itemCount}
                      unit="posts"
                      min={1}
                      onChange={(value) =>
                        setItemCount(Math.max(1, Math.min(24, Number(value || 4))))
                      }
                    />
                  </Field>
                ) : null}
                {type === 'blog_carousel' ? (
                  <>
                    <Field label={__('Carousel items', 'cci-nice-menu')}>
                      <NumberInputWithUnit
                        value={carouselItems}
                        unit="visible"
                        min={1}
                        onChange={(value) =>
                          setCarouselItems(Math.max(1, Math.min(6, Number(value || 3))))
                        }
                      />
                    </Field>
                    <Field label={__('Carousel margin', 'cci-nice-menu')}>
                      <NumberInputWithUnit
                        value={carouselMargin}
                        unit="px"
                        min={0}
                        onChange={(value) =>
                          setCarouselMargin(Math.max(0, Math.min(48, Number(value || 12))))
                        }
                      />
                    </Field>
                    <Field label={__('Autoplay delay', 'cci-nice-menu')}>
                      <NumberInputWithUnit
                        value={carouselAutoplayTimeout}
                        unit="ms"
                        min={1000}
                        onChange={(value) =>
                          setCarouselAutoplayTimeout(
                            Math.max(1000, Math.min(20000, Number(value || 4500))),
                          )
                        }
                      />
                    </Field>
                    <div className="tw-flex tw-items-end">
                      <ToggleField
                        checked={carouselAutoplay}
                        label={__('Autoplay carousel', 'cci-nice-menu')}
                        onChange={setCarouselAutoplay}
                      />
                    </div>
                  </>
                ) : null}
                {isBlogCategoryType ? (
                  <>
                    <Field label={__('Category source', 'cci-nice-menu')}>
                      <Select
                        value={blogCategoryMode === 'selected' ? 'selected' : 'all'}
                        onValueChange={(value) =>
                          setBlogCategoryMode(value === 'selected' ? 'selected' : 'all')
                        }
                        options={[
                          {
                            value: 'all',
                            label: __('All categories automatically', 'cci-nice-menu'),
                          },
                          {
                            value: 'selected',
                            label: __('Selected categories only', 'cci-nice-menu'),
                          },
                        ]}
                      />
                    </Field>
                    <Field label={__('Item count', 'cci-nice-menu')}>
                      <NumberInputWithUnit
                        value={itemCount}
                        unit="categories"
                        min={1}
                        onChange={(value) =>
                          setItemCount(Math.max(1, Math.min(24, Number(value || 8))))
                        }
                      />
                    </Field>
                    <Field label={__('Sort categories', 'cci-nice-menu')}>
                      <Select
                        value={blogCategorySort}
                        onValueChange={(value) =>
                          setBlogCategorySort(normalizeBlogCategorySort(value))
                        }
                        options={blogCategorySortOptions}
                      />
                    </Field>
                    <Field label={__('Category media', 'cci-nice-menu')}>
                      <Select
                        value={blogCategoryMediaMode}
                        onValueChange={(value) =>
                          setBlogCategoryMediaMode(normalizeBlogCategoryMediaMode(value))
                        }
                        options={blogCategoryMediaOptions}
                      />
                    </Field>
                    <div className="tw-grid tw-gap-2 md:tw-col-span-2">
                      <ToggleField
                        checked={blogCategoryHideEmpty}
                        label={__('Hide empty categories', 'cci-nice-menu')}
                        onChange={setBlogCategoryHideEmpty}
                      />
                      <ToggleField
                        checked={blogCategoryShowCount}
                        label={__('Show post count', 'cci-nice-menu')}
                        onChange={setBlogCategoryShowCount}
                      />
                    </div>
                    {blogCategoryMode === 'selected' ? (
                      <div className="tw-grid tw-gap-3 md:tw-col-span-2">
                        <Field label={__('Select blog categories', 'cci-nice-menu')}>
                          <Input
                            value={blogCategoryQuery}
                            onChange={(event) => setBlogCategoryQuery(event.target.value)}
                            placeholder={__('Search categories by title or slug', 'cci-nice-menu')}
                          />
                        </Field>
                        {blogCategoryError ? (
                          <p className="tw-m-0 tw-text-sm tw-text-red-600">{blogCategoryError}</p>
                        ) : null}
                        <div className="tw-grid tw-max-h-64 tw-gap-1 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-cci-nm-surfaceSoft tw-p-3">
                          {blogCategoryLoading ? (
                            <span className="tw-p-2 tw-text-sm tw-text-cci-nm-muted">
                              {__('Loading categories...', 'cci-nice-menu')}
                            </span>
                          ) : visibleBlogCategoryRows.length ? (
                            visibleBlogCategoryRows.map((item) => {
                              const itemId = item.id;
                              const checked = selectedBlogCategoryIds.has(itemId);
                              const isCollapsed = collapsedBlogCategoryIds.has(itemId);
                              const ToggleIcon = isCollapsed ? ChevronRight : ChevronDown;
                              const toggleChecked = (nextChecked) => {
                                setBlogCategoryIds((current) => {
                                  const normalized = normalizeBlogCategoryIds(current);
                                  if (nextChecked) {
                                    return normalized.includes(itemId)
                                      ? normalized
                                      : [...normalized, itemId];
                                  }

                                  return normalized.filter((id) => id !== itemId);
                                });
                              };

                              return (
                                <div
                                  key={itemId}
                                  data-cci-nice-menu-blog-category-row="true"
                                  data-cci-nice-menu-blog-category-depth={item.depth}
                                  className={[
                                    'tw-grid tw-min-h-10 tw-grid-cols-[auto_auto_minmax(0,1fr)_auto] tw-items-center tw-gap-2.5 tw-rounded-md tw-border tw-border-solid tw-py-1.5 tw-pr-3 tw-text-sm tw-leading-5 tw-transition-colors',
                                    checked
                                      ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft'
                                      : 'tw-border-transparent tw-bg-transparent hover:tw-border-cci-nm-border hover:tw-bg-white',
                                  ].join(' ')}
                                  style={{ paddingLeft: `${10 + item.depth * 20}px` }}
                                >
                                  <button
                                    type="button"
                                    className={[
                                      'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-p-0 tw-shadow-none tw-transition-colors',
                                      item.hasChildren
                                        ? 'tw-cursor-pointer tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-muted hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft hover:tw-text-cci-nm-brand'
                                        : 'tw-cursor-default tw-border-transparent tw-bg-transparent tw-text-transparent',
                                    ].join(' ')}
                                    disabled={!item.hasChildren}
                                    aria-label={
                                      isCollapsed
                                        ? __('Expand category', 'cci-nice-menu')
                                        : __('Collapse category', 'cci-nice-menu')
                                    }
                                    aria-expanded={item.hasChildren ? !isCollapsed : undefined}
                                    onClick={() =>
                                      item.hasChildren && toggleBlogCategoryCollapsed(itemId)
                                    }
                                  >
                                    {item.hasChildren ? (
                                      <ToggleIcon aria-hidden="true" className="tw-h-4 tw-w-4" />
                                    ) : null}
                                  </button>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(nextChecked) =>
                                      toggleChecked(nextChecked === true)
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="tw-grid tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-left"
                                    onClick={() => toggleChecked(!checked)}
                                  >
                                    <span
                                      className={`tw-block tw-truncate tw-text-sm tw-leading-5 tw-text-cci-nm-text ${item.hasChildren ? 'tw-font-semibold' : 'tw-font-medium'}`}
                                    >
                                      {item.name}
                                    </span>
                                    <span className="tw-block tw-truncate tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                                      {item.reference || item.url || ''}
                                    </span>
                                  </button>
                                  <span className="tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-2 tw-py-0.5 tw-text-xs tw-font-semibold tw-text-cci-nm-muted">
                                    {Number(item.post_count || 0)}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <span className="tw-p-2 tw-text-sm tw-text-cci-nm-muted">
                              {__('No categories found.', 'cci-nice-menu')}
                            </span>
                          )}
                        </div>
                        <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                          {blogCategoryIds.length
                            ? __(
                                'Selected categories stay in their tree position.',
                                'cci-nice-menu',
                              )
                            : __(
                                'Select at least one category or switch the source back to automatic.',
                                'cci-nice-menu',
                              )}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {type === 'row' ? (
                  <Field label="Row preset">
                    <Select
                      value={getLayoutPresetValue(componentVariant)}
                      onValueChange={(value) => {
                        if (value === '__generic__') {
                          setComponentVariant('');
                          return;
                        }

                        if (value.startsWith('component:')) {
                          setComponentVariant(
                            normalizeComponentVariant(value.replace('component:', '')),
                          );
                          return;
                        }

                        setComponentVariant('');
                      }}
                      options={rowLayoutOptions}
                    />
                  </Field>
                ) : null}
                {type === 'column' ? (
                  <Field label="Column layout">
                    <Select
                      value={getLayoutPresetValue(componentVariant)}
                      onValueChange={(value) => {
                        if (value === '__generic__') {
                          setComponentVariant('');
                          return;
                        }

                        if (value.startsWith('component:')) {
                          setComponentVariant(
                            normalizeComponentVariant(value.replace('component:', '')),
                          );
                          return;
                        }

                        setComponentVariant('');
                      }}
                      options={columnLayoutOptions}
                    />
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <Field label="Block preset">
                    <Select
                      value={getBlockLayoutValue(componentVariant)}
                      onValueChange={(value) => {
                        if (value === '__generic__') {
                          setComponentVariant('');
                          return;
                        }

                        if (value.startsWith('component:')) {
                          setComponentVariant(
                            normalizeComponentVariant(value.replace('component:', '')),
                          );
                          return;
                        }

                        setComponentVariant('');
                      }}
                      options={blockLayoutOptions}
                    />
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <div className="md:tw-col-span-2">
                    <ToggleField
                      checked={hideHeading}
                      label={__('Hide block heading', 'cci-nice-menu')}
                      onChange={setHideHeading}
                    />
                  </div>
                ) : null}
                {type === 'block' ? (
                  <Field label="Heading link">
                    <Input
                      value={headingLink}
                      onChange={(event) => setHeadingLink(event.target.value)}
                      placeholder="e.g. /category or https://..."
                    />
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <Field label="Heading action label">
                    <Input
                      value={headingLinkLabel}
                      onChange={(event) => setHeadingLinkLabel(event.target.value)}
                      placeholder={__('e.g. View all', 'cci-nice-menu')}
                    />
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <Field label={__('Heading action icon', 'cci-nice-menu')}>
                    <div className="tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-gap-2">
                      <Input
                        value={headingLinkIcon}
                        onChange={(event) => setHeadingLinkIcon(event.target.value)}
                        placeholder={iconPlaceholder}
                      />
                      <span className="tw-inline-flex tw-h-10 tw-min-w-10 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-brand">
                        {headingLinkIcon ? (
                          <span
                            aria-hidden="true"
                            className={`tw-inline-flex tw-h-5 tw-w-5 tw-items-center tw-justify-center tw-text-lg tw-leading-none ${normalizeIconClass(headingLinkIcon)}`}
                          />
                        ) : (
                          <Link2
                            aria-hidden="true"
                            className="tw-h-4 tw-w-4 tw-text-cci-nm-muted"
                          />
                        )}
                      </span>
                    </div>
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <Field label={__('Description', 'cci-nice-menu')}>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Field>
                ) : null}
                {isHook ? (
                  <>
                    <Field label="Hook name">
                      <Select
                        value={hookName}
                        onValueChange={setHookName}
                        options={buildHookNameOptions(hookName)}
                      />
                    </Field>
                    <Field label="Custom hook name">
                      <Input
                        value={hookName}
                        onChange={(event) => setHookName(event.target.value)}
                        placeholder="displayCustomHook"
                      />
                    </Field>
                    <InfoCallout title={__('PrestaShop hook output', 'cci-nice-menu')}>
                      {__(
                        'The storefront renders modules currently attached to this hook. Menu display hooks are blocked to avoid recursive menu rendering.',
                        'cci-nice-menu',
                      )}
                    </InfoCallout>
                  </>
                ) : null}
                {type === 'row' ? (
                  <Field label="Row width">
                    <NumberInputWithUnit
                      value={columnSpan}
                      unit="of 12"
                      min={0}
                      onChange={(value) =>
                        setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))
                      }
                    />
                    <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {__(
                        'Use 12 for a full-width row. Nested rows can use a smaller width when needed.',
                        'cci-nice-menu',
                      )}
                    </p>
                  </Field>
                ) : null}
                {type === 'column' ? (
                  <>
                    <Field label="Column behavior">
                      <Select
                        value={layoutRole === 'tabs' ? `tabs_${tabsOrientation}` : 'content'}
                        onValueChange={(value) => {
                          if (value === 'content') {
                            setLayoutRole('');
                            setTabsOrientation('vertical');
                            return;
                          }

                          setLayoutRole('tabs');
                          setTabsOrientation(
                            value === 'tabs_horizontal' ? 'horizontal' : 'vertical',
                          );
                        }}
                        options={[
                          { value: 'content', label: __('Content column', 'cci-nice-menu') },
                          { value: 'tabs_vertical', label: __('Tabs - vertical', 'cci-nice-menu') },
                          {
                            value: 'tabs_horizontal',
                            label: __('Tabs - horizontal', 'cci-nice-menu'),
                          },
                        ]}
                      />
                    </Field>
                    <Field label="Column width">
                      <NumberInputWithUnit
                        value={columnSpan}
                        unit="of 12"
                        min={0}
                        onChange={(value) =>
                          setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))
                        }
                      />
                      <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                        {__(
                          'Use 0 for auto width. Example: 6, 3, 3 fills one 12-column row.',
                          'cci-nice-menu',
                        )}
                      </p>
                    </Field>
                    {layoutRole === 'tabs' ? (
                      <div className="tw-grid tw-gap-3 md:tw-col-span-2 md:tw-grid-cols-3">
                        <OptionalNodeLengthInput
                          label="Tabs content height"
                          value={tabsContentHeight}
                          fallback="680px"
                          onChange={setTabsContentHeight}
                        />
                        <OptionalNodeLengthInput
                          label="Tablet height"
                          value={tabsContentHeightTablet}
                          fallback="620px"
                          onChange={setTabsContentHeightTablet}
                        />
                        <OptionalNodeLengthInput
                          label="Mobile height"
                          value={tabsContentHeightMobile}
                          fallback="72vh"
                          onChange={setTabsContentHeightMobile}
                        />
                        <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted md:tw-col-span-3">
                          {__(
                            'Optional. Leave empty for natural height. When set, the tab content area scrolls within that height on the matching breakpoint.',
                            'cci-nice-menu',
                          )}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {supportsLinkMode ? (
                  <Field label={__('Element rendering', 'cci-nice-menu')}>
                    <Select
                      value={linkMode}
                      onValueChange={(value) => setLinkMode(normalizeLinkMode(value))}
                      options={linkModeOptions}
                    />
                    <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {linkMode === 'span'
                        ? __('Renders a non-clickable span on the storefront.', 'cci-nice-menu')
                        : __('Renders a clickable anchor on the storefront.', 'cci-nice-menu')}
                    </p>
                  </Field>
                ) : null}
                {!isStructure &&
                linkMode !== 'span' &&
                !['video', 'map', 'blog_categories'].includes(type) &&
                !isHook ? (
                  <Field label="URL">
                    <Input value={link} onChange={(event) => setLink(event.target.value)} />
                  </Field>
                ) : null}
                {type === 'custom' ? (
                  <Field label={__('Item image URL', 'cci-nice-menu')}>
                    <LocalMediaUrlInput value={imageUrl} onChange={setImageUrl} />
                    <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {__(
                        'Optional media shown next to the item label. It is not the click target URL.',
                        'cci-nice-menu',
                      )}
                    </p>
                  </Field>
                ) : null}
                {type === 'banner' ? (
                  <Field label="CTA label">
                    <Input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} />
                  </Field>
                ) : null}
                {type === 'banner' ? (
                  <Field label={__('Banner eyebrow', 'cci-nice-menu')}>
                    <Input
                      value={bannerEyebrow}
                      onChange={(event) => setBannerEyebrow(event.target.value)}
                    />
                  </Field>
                ) : null}
                {type === 'banner' ? (
                  <Field label={__('Banner layout', 'cci-nice-menu')}>
                    <Select
                      value={bannerLayout}
                      onValueChange={(value) => setBannerLayout(normalizeBannerLayout(value))}
                      options={bannerLayoutOptions}
                    />
                  </Field>
                ) : null}
                {type === 'block' ? (
                  <div className="md:tw-col-span-2">
                    <ToggleField
                      checked={target}
                      label="Open heading link in new tab"
                      onChange={setTarget}
                    />
                  </div>
                ) : null}
                {['banner', 'image'].includes(type) ? (
                  <>
                    <Field label={__('Image URL', 'cci-nice-menu')}>
                      <LocalMediaUrlInput value={imageUrl} onChange={setImageUrl} />
                    </Field>
                  </>
                ) : null}
                {type === 'map' ? (
                  <>
                    <Field label="Map location">
                      <Input
                        value={mapQuery}
                        onChange={(event) => setMapQuery(event.target.value)}
                        placeholder={__('Address, place name or lat,lng', 'cci-nice-menu')}
                      />
                    </Field>
                    <Field label="Map zoom">
                      <NumberInputWithUnit
                        value={mapZoom}
                        unit="zoom"
                        min={1}
                        onChange={(value) =>
                          setMapZoom(Math.max(1, Math.min(20, Number(value || 15))))
                        }
                      />
                    </Field>
                    <Field label="Custom embed URL">
                      <Input
                        value={mapEmbedUrl}
                        onChange={(event) => setMapEmbedUrl(event.target.value)}
                        placeholder={__(
                          'Optional Google Maps or OpenStreetMap embed URL',
                          'cci-nice-menu',
                        )}
                      />
                    </Field>
                    <Field label={__('Fallback image URL', 'cci-nice-menu')}>
                      <LocalMediaUrlInput
                        value={imageUrl}
                        onChange={setImageUrl}
                        placeholder="/modules/cci_nice_menu/views/img/showcase-map.svg"
                      />
                    </Field>
                    <InfoCallout title={__('Dynamic map', 'cci-nice-menu')}>
                      {__(
                        'If a custom embed URL is empty, the storefront builds a map iframe from the location field. The fallback image is used only when no location is provided.',
                        'cci-nice-menu',
                      )}
                    </InfoCallout>
                  </>
                ) : null}
                {!isStructure && !isHook && type !== 'video' && type !== 'block' ? (
                  <Field label={__('Description', 'cci-nice-menu')}>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Field>
                ) : null}
                {type === 'video' ? (
                  <>
                    <Field label="Video source">
                      <Select
                        value={videoProvider}
                        onValueChange={setVideoProvider}
                        options={[
                          { value: 'youtube', label: 'YouTube' },
                          { value: 'file', label: __('Self-hosted file', 'cci-nice-menu') },
                        ]}
                      />
                    </Field>
                    <Field
                      label={
                        videoProvider === 'youtube'
                          ? __('YouTube URL or ID', 'cci-nice-menu')
                          : __('Video file URL', 'cci-nice-menu')
                      }
                    >
                      <Input
                        value={videoUrl}
                        onChange={(event) => setVideoUrl(event.target.value)}
                        placeholder={
                          videoProvider === 'youtube'
                            ? 'https://www.youtube.com/watch?v=... or video ID'
                            : 'https://.../video.mp4'
                        }
                      />
                    </Field>
                    <Field label="CTA link">
                      <Input
                        value={link}
                        onChange={(event) => setLink(event.target.value)}
                        placeholder="/ or https://..."
                      />
                    </Field>
                    <Field label="CTA label">
                      <Input
                        value={ctaLabel}
                        onChange={(event) => setCtaLabel(event.target.value)}
                        placeholder={__('Optional', 'cci-nice-menu')}
                      />
                    </Field>
                    <div className="tw-flex tw-items-end">
                      <ToggleField
                        checked={target}
                        label="Open CTA link in new tab"
                        onChange={setTarget}
                      />
                    </div>
                    <Field label={__('Poster image URL', 'cci-nice-menu')}>
                      <LocalMediaUrlInput
                        value={videoPoster}
                        onChange={setVideoPoster}
                        placeholder={
                          videoProvider === 'youtube'
                            ? __('Optional custom thumbnail', 'cci-nice-menu')
                            : __('Recommended for self-hosted videos', 'cci-nice-menu')
                        }
                      />
                    </Field>
                    <Field label="Aspect ratio">
                      <Select
                        value={videoAspect}
                        onValueChange={setVideoAspect}
                        options={[
                          { value: '16:9', label: __('16:9 widescreen', 'cci-nice-menu') },
                          { value: '21:9', label: __('21:9 cinematic', 'cci-nice-menu') },
                          { value: '4:3', label: __('4:3 standard', 'cci-nice-menu') },
                          { value: '1:1', label: __('1:1 square', 'cci-nice-menu') },
                          { value: '9:16', label: __('9:16 vertical', 'cci-nice-menu') },
                        ]}
                      />
                    </Field>
                    <Field label="Video size">
                      <Select
                        value={videoSize}
                        onValueChange={setVideoSize}
                        options={[
                          { value: 'compact', label: 'Compact' },
                          { value: 'default', label: 'Default' },
                          { value: 'large', label: 'Large' },
                        ]}
                      />
                    </Field>
                    <Field label="Caption / description">
                      <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </Field>
                    <Field label="Start at">
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          min="0"
                          value={videoStart}
                          onChange={(event) => setVideoStart(event.target.value)}
                          placeholder="0"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>sec</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                    <Field label="End at">
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          min="0"
                          value={videoEnd}
                          onChange={(event) => setVideoEnd(event.target.value)}
                          placeholder={__('Optional', 'cci-nice-menu')}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>sec</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </Field>
                    <div className="tw-grid tw-gap-2 md:tw-col-span-2 md:tw-grid-cols-2">
                      <ToggleField
                        checked={videoAutoplay}
                        label="Autoplay"
                        onChange={(checked) => {
                          setVideoAutoplay(checked);
                          if (checked) {
                            setVideoMuted(true);
                          }
                        }}
                      />
                      <ToggleField checked={videoMuted} label="Muted" onChange={setVideoMuted} />
                      <ToggleField checked={videoLoop} label="Loop" onChange={setVideoLoop} />
                      <ToggleField
                        checked={videoControls}
                        label="Show controls"
                        onChange={setVideoControls}
                      />
                      <ToggleField checked={videoLazy} label="Lazy load" onChange={setVideoLazy} />
                    </div>
                    <InfoCallout title={__('Video behaviour', 'cci-nice-menu')}>
                      {__(
                        'Autoplay is saved as muted by default because modern browsers block autoplay with sound. YouTube embeds use privacy-friendly youtube-nocookie URLs.',
                        'cci-nice-menu',
                      )}
                    </InfoCallout>
                  </>
                ) : null}
              </FieldGroup>
            )}
          </EditorPanel>

          <EditorPanel
            title={__('Appearance and behaviour', 'cci-nice-menu')}
            description="Optional styling, icon, badge and advanced display settings."
            defaultOpen={!isEdit || hasAppearanceOverrides}
          >
            <div className="tw-grid tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 md:tw-grid-cols-2">
              {!isStructure ? (
                <Field label="Icon class" className="md:tw-col-span-2">
                  <div className="tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-gap-2">
                    <Input
                      value={icon}
                      onChange={(event) => setIcon(event.target.value)}
                      placeholder={iconPlaceholder}
                    />
                    <span className="tw-inline-flex tw-h-10 tw-min-w-10 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-brand">
                      {icon ? (
                        <span
                          aria-hidden="true"
                          className={`tw-inline-flex tw-h-5 tw-w-5 tw-items-center tw-justify-center tw-text-lg tw-leading-none ${normalizeIconClass(icon)}`}
                        />
                      ) : (
                        <Link2 aria-hidden="true" className="tw-h-4 tw-w-4 tw-text-cci-nm-muted" />
                      )}
                    </span>
                  </div>
                  <div className="tw-mt-2 tw-space-y-2">
                    <InfoCallout
                      title={iconHelp.label}
                      actions={
                        iconLibrary === 'none' && onOpenSettings ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            onClick={onOpenSettings}
                          >
                            {__('Open Settings', 'cci-nice-menu')}
                          </Button>
                        ) : null
                      }
                    >
                      {iconHelp.description}
                    </InfoCallout>
                    {iconHelp.examples.length ? (
                      <div className="tw-grid tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-3 tw-text-xs tw-leading-relaxed tw-text-cci-nm-muted">
                        <div className="tw-grid tw-gap-2">
                          <span className="tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700">
                            {__('Examples', 'cci-nice-menu')}
                          </span>
                          <div className="tw-flex tw-flex-wrap tw-gap-2">
                            {iconHelp.examples.map((example) => (
                              <Button
                                key={example}
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="!tw-h-8 !tw-rounded-md !tw-border-cci-nm-border !tw-bg-white !tw-px-2.5 tw-font-mono tw-text-[12px] hover:!tw-border-cci-nm-brandBorder hover:!tw-bg-cci-nm-brandSoft hover:!tw-text-cci-nm-brandStrong"
                                onClick={() => setIcon(example)}
                              >
                                {example}
                              </Button>
                            ))}
                          </div>
                        </div>
                        {iconHelp.catalogUrl ? (
                          <Button asChild variant="outlineAccent" size="sm" className="tw-w-fit">
                            <a href={iconHelp.catalogUrl} target="_blank" rel="noreferrer">
                              <ExternalLink aria-hidden="true" />
                              {__('Open icon catalog', 'cci-nice-menu')}
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </Field>
              ) : null}
              {allowsMenuBadge && !isStructure ? (
                <Field label="Badge">
                  <Input value={badge} onChange={(event) => setBadge(event.target.value)} />
                </Field>
              ) : null}
              {isTopLevel ? (
                <div className="tw-grid tw-gap-3 md:tw-col-span-2 md:tw-grid-cols-3">
                  <Field label={__('Top-level placement', 'cci-nice-menu')}>
                    <Select
                      value={topLevelPlacement || 'normal'}
                      onValueChange={(value) =>
                        setTopLevelPlacement(value === 'right' ? 'right' : '')
                      }
                      options={[
                        { value: 'normal', label: __('Normal flow', 'cci-nice-menu') },
                        { value: 'right', label: __('Push to right', 'cci-nice-menu') },
                      ]}
                    />
                  </Field>
                  <Field label={__('Column start', 'cci-nice-menu')}>
                    <NumberInputWithUnit
                      value={topLevelColumnStart}
                      unit={__('of 12', 'cci-nice-menu')}
                      min={0}
                      onChange={(value) =>
                        setTopLevelColumnStart(Math.max(0, Math.min(12, Number(value || 0))))
                      }
                    />
                    <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {__('Use 0 for automatic placement.', 'cci-nice-menu')}
                    </p>
                  </Field>
                  <Field label={__('Top-level width', 'cci-nice-menu')}>
                    <NumberInputWithUnit
                      value={columnSpan}
                      unit={__('of 12', 'cci-nice-menu')}
                      min={0}
                      onChange={(value) =>
                        setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))
                      }
                    />
                    <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {__('Use 0 for automatic width.', 'cci-nice-menu')}
                    </p>
                  </Field>
                </div>
              ) : null}
              <div className="tw-grid tw-gap-2 md:tw-col-span-2">
                <div>
                  <FieldLabel>{__('Storefront visibility', 'cci-nice-menu')}</FieldLabel>
                  <p className="tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                    {__(
                      'Hide this element on selected viewport groups without removing it from the menu structure.',
                      'cci-nice-menu',
                    )}
                  </p>
                </div>
                <div className="tw-grid tw-gap-2 md:tw-grid-cols-3">
                  <ToggleField
                    checked={hideOnDesktop}
                    label={__('Hide on desktop', 'cci-nice-menu')}
                    onChange={setHideOnDesktop}
                  />
                  <ToggleField
                    checked={hideOnTablet}
                    label={__('Hide on tablet', 'cci-nice-menu')}
                    onChange={setHideOnTablet}
                  />
                  <ToggleField
                    checked={hideOnMobile}
                    label={__('Hide on mobile', 'cci-nice-menu')}
                    onChange={setHideOnMobile}
                  />
                </div>
              </div>
              <OptionalNodeColorInput
                label="Background"
                value={styleBackground}
                fallback="#f3f8ff"
                onChange={setStyleBackground}
              />
              <OptionalNodeColorInput
                label="Background 2"
                value={styleBackground2}
                fallback="#ffffff"
                onChange={setStyleBackground2}
              />
              <OptionalNodeColorInput
                label="Text color"
                value={styleText}
                fallback="#111827"
                onChange={setStyleText}
              />
              <OptionalNodeColorInput
                label={__('Icon color', 'cci-nice-menu')}
                value={styleIcon}
                fallback="#0d6efd"
                onChange={setStyleIcon}
              />
              <OptionalNodeColorInput
                label="Border"
                value={styleBorder}
                fallback="#dbe7f3"
                onChange={setStyleBorder}
              />
              <OptionalNodeLengthInput
                label="Rounded"
                value={styleRadius}
                fallback="12px"
                units={radiusLengthUnits}
                onChange={setStyleRadius}
              />
              {allowsBadgeColors && !isStructure ? (
                <>
                  <OptionalNodeColorInput
                    label={
                      allowsActionLabel
                        ? __('CTA background', 'cci-nice-menu')
                        : __('Badge background', 'cci-nice-menu')
                    }
                    value={styleBadgeBackground}
                    fallback="#0d6efd"
                    onChange={setStyleBadgeBackground}
                  />
                  <OptionalNodeColorInput
                    label={
                      allowsActionLabel
                        ? __('CTA text', 'cci-nice-menu')
                        : __('Badge text', 'cci-nice-menu')
                    }
                    value={styleBadgeText}
                    fallback="#ffffff"
                    onChange={setStyleBadgeText}
                  />
                </>
              ) : null}
              {!isStructure ? (
                <>
                  {!isTopLevel ? (
                    <Field label="Columns">
                      <NumberInputWithUnit
                        value={columns}
                        unit="cols"
                        min={1}
                        onChange={setColumns}
                      />
                    </Field>
                  ) : null}
                  <div className="md:tw-col-span-2">
                    <ToggleField
                      checked={target}
                      label="Open in new tab"
                      icon={ExternalLink}
                      onChange={setTarget}
                    />
                  </div>
                  <div className="md:tw-col-span-2">
                    <ToggleField
                      checked={iconOnly}
                      label="Icon only on storefront"
                      onChange={setIconOnly}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </EditorPanel>
        </div>
      </BuilderDialogBody>

      <BuilderDialogFooter>
        <Button variant="secondary" type="button" onClick={onCancel}>
          {__('Cancel', 'cci-nice-menu')}
        </Button>
        {isEdit ? (
          <Button variant="save" type="button" onClick={addManual}>
            <Save aria-hidden="true" />
            {__('Save changes', 'cci-nice-menu')}
          </Button>
        ) : !needsCatalog ? (
          <Button variant="add" type="button" onClick={addManual}>
            <Plus aria-hidden="true" />
            {__('Add content', 'cci-nice-menu')}
          </Button>
        ) : (
          <Button
            variant="add"
            type="button"
            onClick={addManual}
            disabled={!canSaveCatalogSelection}
          >
            <Plus aria-hidden="true" />
            {__('Add content', 'cci-nice-menu')}
          </Button>
        )}
      </BuilderDialogFooter>
    </BuilderDialogFrame>
  );
}
