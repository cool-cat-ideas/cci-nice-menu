import React from 'react';
import {
    ArrowLeft,
    Boxes,
    Check,
    ChevronDown,
    ChevronRight,
    Columns3,
    Copy,
    ExternalLink,
    FileText,
    FolderTree,
    GripVertical,
    Image,
    Layers,
    Link2,
    MapPin,
    PackageSearch,
    Palette,
    Pencil,
    Plus,
    Save,
    Settings2,
    ShoppingBag,
    Trash2,
    Upload,
    Video,
    X,
} from 'lucide-react';
import { apiFetch, pluginData } from '../api';
import { __, coreString } from '../i18n';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Checkbox, CheckboxField } from './ui/checkbox';
import { CssLengthInput, normalizeCssLengthValue } from './ui/css-length-input';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import InfoCallout from './ui/info-callout';
import { Input, Textarea } from './ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';
import { Select } from './ui/select';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from './ui/tabs';
import MenusList from './MenusList';
import LocalMediaUrlInput from './LocalMediaUrlInput';

const NODE_TYPES = ['custom', 'category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories', 'banner', 'video', 'text', 'image', 'map', 'hook', 'row', 'column', 'block'];
const ROOT_LABEL = 'Catalog';
const nodeLengthUnits = ['px', 'rem', 'em', '%', 'vh', 'vw', 'dvh', 'dvw'];
const radiusLengthUnits = ['px', 'rem', 'em', '%'];

const DEFAULT_DISPLAY_OPTIONS = {
    hide_desktop: false,
    hide_tablet: false,
    hide_mobile: false,
};

const DEFAULT_COLOR_SETTINGS = {
    color_accent: '#0d6efd',
    color_accent_hover: '#0753d8',
    color_accent_soft: '#f3f8ff',
    color_accent_wash: '#eaf4ff',
    color_text: '#111827',
    color_muted: '#64748b',
    color_icon: '#0d6efd',
    color_surface: '#ffffff',
    color_surface_soft: '#f8fbff',
    color_border: '#dbe7f3',
    color_border_strong: '#bfdbfe',
    color_heading: '#112445',
    color_video_bg: '#172554',
    color_video_border: '#1d4ed8',
};

const EMPTY_NODE = {
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

const editorTabs = [
    { value: 'general', label: 'General', icon: Settings2 },
    { value: 'design', label: 'Design', icon: Palette },
    { value: 'tools', label: 'Import / Export', icon: Upload },
];

const contentTypes = [
    { value: 'custom', label: 'Custom link', description: 'Manual label and URL.', icon: Link2 },
    { value: 'category', label: 'Category', description: 'Link to a selected shop category.', icon: FolderTree },
    { value: 'category_tree', label: 'Dynamic category flyout', description: 'Build the catalog dropdown from live PrestaShop categories.', icon: Layers },
    { value: 'product', label: 'Product', description: 'Link to a selected product.', icon: ShoppingBag },
    { value: 'product_tile', label: 'Product tile', description: 'Visual product card with image and price.', icon: ShoppingBag },
    { value: 'cms_page', label: 'CMS page', description: 'Link to an informational CMS page.', icon: FileText },
    { value: 'blog_post', label: 'Blog post sticky', description: 'Feature one selected blog article inside the menu.', icon: FileText },
    { value: 'blog_list', label: 'Latest blog list', description: 'Render the latest published blog posts.', icon: FileText },
    { value: 'blog_carousel', label: 'Blog carousel', description: 'Horizontal article rail for menu panels.', icon: FileText },
    { value: 'blog_popular', label: 'Popular posts', description: 'Articles ordered by tracked views.', icon: FileText },
    { value: 'blog_categories', label: 'Blog categories', description: 'List selected or automatic CCI Blog categories.', icon: FolderTree },
    { value: 'banner', label: 'Banner block', description: 'Image, text and optional link.', icon: Image },
    { value: 'video', label: 'Video block', description: 'YouTube embed or self-hosted video with playback options.', icon: Video },
    { value: 'text', label: 'Text block', description: 'Title, icon and short supporting copy.', icon: FileText },
    { value: 'image', label: 'Image block', description: 'Standalone visual tile with optional caption.', icon: Image },
    { value: 'map', label: 'Map block', description: 'Editable location map generated from an address or embed URL.', icon: MapPin },
    { value: 'hook', label: __( 'Hook block', 'cci-nice-menu' ), description: 'Render output from an existing storefront hook.', icon: Layers },
];

const contentTypeGroups = [
    { label: 'Catalog', values: ['category_tree', 'category', 'product', 'product_tile', 'cms_page'] },
    { label: 'Blog', values: ['blog_post', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories'] },
    { label: 'Media', values: ['banner', 'image', 'video', 'map'] },
    { label: 'Content', values: ['custom', 'text', 'hook'] },
];

const bannerLayoutOptions = [
    { value: 'horizontal', label: __('Horizontal', 'cci-nice-menu') },
    { value: 'vertical', label: __('Vertical', 'cci-nice-menu') },
];

const categoryTabMediaOptions = [
    { value: 'auto', label: __('Auto: icon, then thumbnail', 'cci-nice-menu') },
    { value: 'icon', label: __('Icon only', 'cci-nice-menu') },
    { value: 'thumbnail', label: __('Category thumbnail', 'cci-nice-menu') },
    { value: 'none', label: __('No media', 'cci-nice-menu') },
];

const blogCategorySortOptions = [
    { value: 'position', label: __('Position', 'cci-nice-menu') },
    { value: 'title_asc', label: __('Title A-Z', 'cci-nice-menu') },
    { value: 'title_desc', label: __('Title Z-A', 'cci-nice-menu') },
    { value: 'count_desc', label: __('Most posts first', 'cci-nice-menu') },
    { value: 'count_asc', label: __('Fewest posts first', 'cci-nice-menu') },
];

const blogCategoryMediaOptions = [
    { value: 'auto', label: __('Auto: thumbnail, then icon', 'cci-nice-menu') },
    { value: 'icon', label: __('Configured icon', 'cci-nice-menu') },
    { value: 'thumbnail', label: __('Category thumbnail', 'cci-nice-menu') },
    { value: 'none', label: __('No media', 'cci-nice-menu') },
];

const linkModeOptions = [
    { value: 'link', label: __('Clickable link', 'cci-nice-menu') },
    { value: 'span', label: __('Static text (span)', 'cci-nice-menu') },
];

function normalizeBlogCategoryIds(value) {
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

function buildBlogCategoryTreeRows(items, sortMode = 'position') {
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

function normalizeBlogCategorySort(value) {
    const raw = String(value || '').trim();
    return blogCategorySortOptions.some((option) => option.value === raw) ? raw : 'position';
}

function normalizeBlogCategoryMediaMode(value) {
    const raw = String(value || '').trim();
    return blogCategoryMediaOptions.some((option) => option.value === raw) ? raw : 'icon';
}

function normalizeLinkMode(value) {
    return String(value || '').trim() === 'span' ? 'span' : 'link';
}

function getDefaultContentLabel(type) {
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

function getDefaultContentLink(type) {
    if (type === 'video') {
        return '/';
    }
    if (['custom', 'banner', 'image', 'text'].includes(type)) {
        return '#';
    }

    return '';
}

const structureTemplates = [
    { value: 'layout-row', label: 'Row', description: 'Full-width layout row. Put columns inside it, then blocks inside columns.', icon: Layers },
    { value: 'blank-column', label: 'Column', description: '12-grid layout column that holds reusable blocks.', icon: Columns3 },
    { value: 'blank-block', label: 'Block', description: 'Configurable ready-made view with optional heading and content.', icon: Boxes },
    { value: 'tabs-group', label: 'Tabs row', description: 'Tabs with editable panels made from columns and blocks.', icon: Layers },
    { value: 'hero-strip', label: 'Hero banner block', description: 'Wide promotional banner component.', icon: Image },
    { value: 'compact-list', label: 'Compact list block', description: 'Small product/link list like bestsellers or news.', icon: FileText },
    { value: 'benefits-row', label: 'Benefits block', description: 'Flexible icon/text badges for benefits or shortcuts.', icon: Check },
    { value: 'store-card', label: 'Store card block', description: 'Address, hours and contact information component.', icon: FileText },
    { value: 'media-stack', label: 'Media stack block', description: 'Promo banners plus video in one reusable block.', icon: Video },
    { value: 'footer-actions', label: 'Feature strip block', description: 'Full-width flexible shortcut actions.', icon: Link2 },
];

const FORBIDDEN_HOOK_OPTIONS = new Set(['displayTop', 'displayNav1', 'displayNav2', 'displayNavFullWidth']);

const buildHookNameOptions = (selectedHook = '') => {
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

const layoutTemplates = [
    ...structureTemplates,
];

const columnLayoutOptions = [
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

const rowLayoutOptions = [
    { value: '__generic__', label: 'Generic row' },
    { value: 'component:showcase_secondary_row', label: 'Bottom row' },
];

const blockLayoutOptions = [
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

const componentVariantClasses = {
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
    showcase_secondary_link_block: ['cci-nice-menu-showcase-link-block', 'cci-nice-menu-showcase-secondary-block'],
    showcase_current_link: ['cci-nice-menu-showcase-current-link'],
    showcase_products_column: ['cci-nice-menu-showcase-products-column'],
    showcase_product_grid: ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid'],
    showcase_product_grid_three: ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid', 'cci-nice-menu-showcase-three-products'],
    showcase_product_grid_two: ['cci-nice-menu-showcase-product-block', 'cci-nice-menu-showcase-product-grid', 'cci-nice-menu-showcase-two-products'],
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

const fallbackThemeOptions = [
    { value: 'night-glass', label: 'Night Glass' },
    { value: 'clean-light', label: 'Clean Light' },
    { value: 'brand-accent', label: 'Brand Accent' },
];

const colorSettingFields = [
    { key: 'color_accent', label: 'Accent' },
    { key: 'color_accent_hover', label: 'Accent hover' },
    { key: 'color_accent_soft', label: 'Accent soft' },
    { key: 'color_accent_wash', label: 'Accent wash' },
    { key: 'color_text', label: 'Text' },
    { key: 'color_muted', label: 'Muted text' },
    { key: 'color_icon', label: 'Icon color' },
    { key: 'color_surface', label: 'Surface' },
    { key: 'color_surface_soft', label: 'Soft surface' },
    { key: 'color_border', label: 'Border' },
    { key: 'color_border_strong', label: 'Strong border' },
    { key: 'color_heading', label: 'Headings' },
    { key: 'color_video_bg', label: 'Video background' },
    { key: 'color_video_border', label: 'Video border' },
];

function normalizeHexColor(value, fallback = '#000000') {
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

function getThemeOptions() {
    const presets = pluginData.themePresets || {};
    const options = Object.entries(presets).map(([value, preset]) => ({
        value,
        label: preset?.label || value,
    }));

    return options.length ? options : fallbackThemeOptions;
}

function getThemeColorPatch(theme) {
    const preset = pluginData.themePresets?.[theme] || {};

    return colorSettingFields.reduce((patch, field) => {
        const fallback = field.key === 'color_icon'
            ? (preset.color_icon || preset.color_accent || DEFAULT_COLOR_SETTINGS.color_icon)
            : DEFAULT_COLOR_SETTINGS[field.key];
        patch[field.key] = normalizeHexColor(preset[field.key], fallback);
        return patch;
    }, {});
}

function ColorSettingInput({ label, value, fallback, onChange }) {
    const colorValue = normalizeHexColor(value, fallback);

    return (
        <Field label={label}>
            <div className='tw-grid tw-grid-cols-[44px_minmax(0,1fr)] tw-gap-2'>
                <Input
                    className='tw-h-10 tw-min-w-0 tw-p-1'
                    type='color'
                    value={colorValue}
                    onChange={(event) => onChange(normalizeHexColor(event.target.value, fallback))}
                />
                <Input
                    className='tw-font-mono tw-text-xs'
                    value={String(value || '')}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => onChange(normalizeHexColor(event.target.value, fallback))}
                    placeholder={fallback}
                />
            </div>
        </Field>
    );
}

function OptionalNodeColorInput({ label, value, fallback, onChange }) {
    const rawValue = String(value || '').trim();
    const colorValue = normalizeHexColor(rawValue || fallback, fallback);

    return (
        <Field label={label}>
            <div className='tw-grid tw-grid-cols-[44px_minmax(0,1fr)] tw-gap-2'>
                <Input
                    className='tw-h-10 tw-min-w-0 tw-p-1'
                    type='color'
                    value={colorValue}
                    onChange={(event) => onChange(normalizeHexColor(event.target.value, fallback))}
                />
                <Input
                    className='tw-font-mono tw-text-xs'
                    value={rawValue}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={(event) => {
                        const nextValue = event.target.value.trim();
                        onChange(nextValue === '' ? '' : normalizeHexColor(nextValue, fallback));
                    }}
                    placeholder={ __( 'Inherit', 'cci-nice-menu' ) }
                />
            </div>
        </Field>
    );
}

function normalizeOptionalNodeLength(value, fallback = '1rem', units = nodeLengthUnits) {
    return normalizeCssLengthValue(value, {
        fallback,
        units,
        min: 0,
        max: 1000,
        allowEmpty: true,
    });
}

function OptionalNodeLengthInput({ label, value, fallback = '1rem', units = nodeLengthUnits, onChange }) {
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

function isCatalogBackedType(type) {
    return ['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'].includes(type);
}

const alertToneClasses = {
    success: 'tw-border-cci-nm-actionBorder tw-bg-cci-nm-actionSoft tw-text-cci-nm-actionText',
    warning: 'tw-border-cci-nm-warningBorder tw-bg-cci-nm-warningBg tw-text-cci-nm-warningText',
    error: 'tw-border-cci-nm-dangerBorder tw-bg-cci-nm-dangerBg tw-text-cci-nm-dangerText',
    info: 'tw-border-cci-nm-infoBorder tw-bg-cci-nm-infoBg tw-text-cci-nm-infoText',
};

function AddIconButton({ label = 'Add', onClick, size = 'iconXs', className = '' }) {
    return (
        <Button
            variant='add'
            size={size}
            type='button'
            className={className}
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            <Plus aria-hidden='true' />
        </Button>
    );
}

function AddDropdown({ label = 'Add', size = 'sm', actions = [], compact = false }) {
    const [open, setOpen] = React.useState(false);
    const compactSize = size === 'xs'
        ? 'iconXs'
        : size === 'sm'
            ? 'iconSm'
            : size === 'lg' || size === 'default'
                ? 'icon'
                : size;

    if (!actions.length) {
        return null;
    }

    if (actions.length === 1) {
        const [action] = actions;
        const Icon = action.icon || Plus;

        return (
            <Button
                variant='add'
                size={compact ? compactSize : size}
                type='button'
                onClick={action.onClick}
                aria-label={compact ? action.label : undefined}
                title={compact ? action.label : undefined}
            >
                <Icon aria-hidden='true' />
                {compact ? null : action.label}
            </Button>
        );
    }

    return (
        <div
            className='cci-nice-menu-add-dropdown tw-relative tw-inline-flex'
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                }
            }}
        >
            <Button
                className='cci-nice-menu-add-dropdown-trigger'
                variant='add'
                size={compact ? compactSize : size}
                type='button'
                aria-haspopup='menu'
                aria-expanded={open}
                aria-label={compact ? label : undefined}
                title={compact ? label : undefined}
                onClick={() => setOpen((current) => !current)}
            >
                <Plus aria-hidden='true' />
                {compact ? null : label}
                {compact ? null : <ChevronDown aria-hidden='true' className={open ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'} />}
            </Button>
            {open ? (
                <div className='cci-nice-menu-add-dropdown-menu' role='menu'>
                    {actions.map((action) => {
                        const Icon = action.icon || Plus;

                        return (
                            <button
                                key={action.label}
                                type='button'
                                role='menuitem'
                                className='cci-nice-menu-add-dropdown-item'
                                onClick={() => {
                                    setOpen(false);
                                    action.onClick?.();
                                }}
                            >
                                <Icon aria-hidden='true' />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

function createNotice(type, message) {
    return {
        type,
        message,
    };
}

function randomId() {
    return `node_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function sanitizeNodeType(type) {
    return NODE_TYPES.includes(type) ? type : 'custom';
}

function normalizeIconClass(icon, library = pluginData.moduleSettings?.iconLibrary || 'none') {
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

function NodeIconPreview({ node = {}, fallback: FallbackIcon = Link2, className = 'tw-h-4 tw-w-4' }) {
    const iconClass = normalizeIconClass(node.icon);

    if (iconClass) {
        return <span aria-hidden='true' className={`tw-inline-flex tw-items-center tw-justify-center tw-text-base tw-leading-none ${className} ${iconClass}`} />;
    }

    return <FallbackIcon aria-hidden='true' className={className} />;
}

function normalizeHeadingAction(node = {}) {
    let label = typeof node.heading_link_label === 'string' ? node.heading_link_label : '';
    const hasIcon = Object.prototype.hasOwnProperty.call(node, 'heading_link_icon');
    let icon = hasIcon && typeof node.heading_link_icon === 'string' ? node.heading_link_icon : '';

    if (!hasIcon && /\s*\u2192\s*$/.test(label)) {
        label = label.replace(/\s*\u2192\s*$/, '').trim();
        icon = 'arrow-right';
    }

    return { label, icon };
}

function normalizeLayoutRole(role) {
    const value = String(role || '').trim().toLowerCase();

    if (value === 'rail' || value === 'tabs') {
        return 'tabs';
    }

    return '';
}

function normalizeTabsOrientation(value) {
    return String(value || '').trim().toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';
}

function normalizeBannerLayout(value) {
    return String(value || '').trim().toLowerCase() === 'vertical' ? 'vertical' : 'horizontal';
}

function normalizeComponentVariant(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/-/g, '_');
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

function inferComponentVariantFromClass(cssClass = '') {
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

    const classes = value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
    const found = Object.entries(componentVariantClasses).find(([, variantClasses]) => (
        variantClasses.some((className) => classes.includes(className))
    ));
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

function getBlockLayoutValue(componentVariant = '') {
    const variant = normalizeComponentVariant(componentVariant);

    if (variant) {
        return `component:${variant}`;
    }

    return '__generic__';
}

function getLayoutPresetValue(componentVariant = '') {
    const variant = normalizeComponentVariant(componentVariant);

    if (variant) {
        return `component:${variant}`;
    }

    return '__generic__';
}

function isTabsColumn(node = {}) {
    const variant = normalizeComponentVariant(node.component_variant || '') || inferComponentVariantFromClass(node.css_class || '');

    return node?.type === 'column' && (
        normalizeLayoutRole(node.layout_role) === 'tabs'
        || variant === 'showcase_tabs_column'
    );
}

function isRowWrapper(node = {}) {
    const variant = normalizeComponentVariant(node.component_variant || '') || inferComponentVariantFromClass(node.css_class || '');

    return node?.type === 'row'
        || (
            node?.type === 'column'
            && variant === 'showcase_secondary_row'
            && !isTabsColumn(node)
        )
        || (
            node?.type === 'column'
            && !isTabsColumn(node)
            && (node.children || []).some((child) => child?.type === 'column')
        );
}

function isLayoutEntry(node = {}) {
    return node?.type === 'column' || isRowWrapper(node);
}

function isTabsControllerPath(tree = [], path = []) {
    if (!Array.isArray(path) || path.length < 2) {
        return false;
    }

    const parentPath = path.slice(0, -1);
    const parent = getNodeAtPath(tree, parentPath);
    const parentVariant = normalizeComponentVariant(parent?.component_variant || '') || inferComponentVariantFromClass(parent?.css_class || '');

    return parent?.type === 'block' && parentVariant === 'showcase_tabs_block';
}

function canOpenAddContentAtPath(tree = [], path = []) {
    if (!Array.isArray(path)) {
        return false;
    }

    if (!path.length) {
        return true;
    }

    const node = getNodeAtPath(tree, path);

    if (!node) {
        return false;
    }

    return path.length === 1
        || isTopNavigationColumnPath(tree, path)
        || node.type === 'block'
        || isTabsControllerPath(tree, path);
}

function isTopNavigationStructureNode(node = {}) {
    return node?.type === 'row' || node?.type === 'column';
}

function isTopNavigationColumnPath(tree = [], path = []) {
    if (!Array.isArray(path) || !path.length || path.length > 2) {
        return false;
    }

    const parent = getNodeAtPath(tree, path.slice(0, -1));
    const node = getNodeAtPath(tree, path);

    return node?.type === 'column' && (path.length === 1 || parent?.type === 'row');
}

function collectTopMenuEntries(tree = []) {
    const entries = [];

    (Array.isArray(tree) ? tree : []).forEach((node, rootIndex) => {
        if (!node) {
            return;
        }

        if (node.type === 'row') {
            (node.children || []).forEach((column, columnIndex) => {
                if (column?.type === 'column') {
                    (column.children || []).forEach((item, itemIndex) => {
                        if (!isTopNavigationStructureNode(item)) {
                            entries.push({ node: item, path: [rootIndex, columnIndex, itemIndex], columnPath: [rootIndex, columnIndex] });
                        }
                    });
                    return;
                }

                if (!isTopNavigationStructureNode(column)) {
                    entries.push({ node: column, path: [rootIndex, columnIndex], columnPath: [rootIndex] });
                }
            });
            return;
        }

        if (node.type === 'column') {
            (node.children || []).forEach((item, itemIndex) => {
                if (!isTopNavigationStructureNode(item)) {
                    entries.push({ node: item, path: [rootIndex, itemIndex], columnPath: [rootIndex] });
                }
            });
            return;
        }

        entries.push({ node, path: [rootIndex], columnPath: [] });
    });

    return entries;
}

function canShowNestedAddButton(node = {}, path = []) {
    if (!node || !Array.isArray(path)) {
        return false;
    }

    return path.length === 1 || node.type === 'block';
}

function countLayoutChildren(children = []) {
    return (children || []).filter((child) => isLayoutEntry(child)).length;
}

function wrapDirectLayoutColumnsInRow(label = '', children = []) {
    const safeChildren = Array.isArray(children) ? children : [];
    const hasDirectColumns = safeChildren.some((child) => child?.type === 'column');
    const hasRows = safeChildren.some((child) => isRowWrapper(child));

    if (!hasDirectColumns || hasRows) {
        return safeChildren;
    }

    const rowLabel = String(label || '').trim();

    return [{
        ...EMPTY_NODE,
        id: randomId(),
        type: 'row',
        label: rowLabel ? `${rowLabel} row` : 'Row',
        link: '',
        component_variant: '',
        column_span: 12,
        columns: 1,
        children: safeChildren,
    }];
}

function isTabsSupportNode(node = {}) {
    const variant = normalizeComponentVariant(node.component_variant || '') || inferComponentVariantFromClass(node.css_class || '');

    return node.type === 'block'
        || node.type === 'hook'
        || variant === 'rail_links'
        || variant === 'showcase_rail_hook'
        || (node.type === 'hook' && String(node.hook_name || '') === 'displayReassurance');
}

function isImplicitLinksBlock(node = {}) {
    if (node?.type !== 'block') {
        return false;
    }

    const label = String(node.label || '').trim().toLowerCase();
    const children = Array.isArray(node.children) ? node.children.filter(Boolean) : [];
    const hasRecognizedBlockComponent = Boolean(
        getBlockVariantDisplayLabel(node.component_variant || '')
        || getBlockChildrenDisplayLabel(children)
    );

    if (!children.length || hasRecognizedBlockComponent) {
        return false;
    }

    return label === ''
        || label === 'links block'
        || /^(block|blok)\s*\d*$/.test(label);
}

function normalizeDisplayOptions(options = {}) {
    const source = options && typeof options === 'object' ? options : {};

    return {
        hide_desktop: Boolean(source.hide_desktop || source.hide_on_desktop),
        hide_tablet: Boolean(source.hide_tablet || source.hide_on_tablet),
        hide_mobile: Boolean(source.hide_mobile || source.hide_on_mobile),
    };
}

function getNodeDisplayOptions(node = {}) {
    return normalizeDisplayOptions({
        ...node,
        ...(node?.display_options && typeof node.display_options === 'object' ? node.display_options : {}),
    });
}

function normalizeNode(node = {}) {
    const { css_class: legacyCssClass, ...nodeWithoutLegacyCss } = node;
    let type = sanitizeNodeType(node.type || 'custom');
    const layoutRole = normalizeLayoutRole(node.layout_role || '');
    const rawCssClass = typeof legacyCssClass === 'string' ? legacyCssClass : '';
    const componentVariant = normalizeComponentVariant(node.component_variant || '') || inferComponentVariantFromClass(rawCssClass);
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
        label: node.label || (type === 'row' ? 'Row' : type === 'column' ? 'Column' : type === 'block' ? 'Block' : 'New item'),
        link: typeof node.link === 'string' ? node.link : '#',
        heading_link: typeof node.heading_link === 'string' ? node.heading_link : '',
        heading_link_label: headingAction.label,
        heading_link_icon: headingAction.icon,
        hide_heading: Boolean(node.hide_heading),
        hook_name: typeof node.hook_name === 'string' ? node.hook_name : '',
        layout_role: layoutRole,
        component_variant: componentVariant,
        tabs_orientation: layoutRole === 'tabs' ? normalizeTabsOrientation(node.tabs_orientation || 'vertical') : 'vertical',
        columns: Number(node.columns || 1),
        column_span: Number(node.column_span || 0),
        item_count: Number(node.item_count || node.product_count || 4),
        style_background: typeof node.style_background === 'string' ? node.style_background : '',
        style_background_2: typeof node.style_background_2 === 'string' ? node.style_background_2 : '',
        style_text: typeof node.style_text === 'string' ? node.style_text : '',
        style_icon: typeof node.style_icon === 'string' ? node.style_icon : '',
        style_border: typeof node.style_border === 'string' ? node.style_border : '',
        style_radius: typeof node.style_radius === 'string' ? normalizeOptionalNodeLength(node.style_radius, '12px', radiusLengthUnits) : '',
        style_badge_background: typeof node.style_badge_background === 'string' ? node.style_badge_background : '',
        style_badge_text: typeof node.style_badge_text === 'string' ? node.style_badge_text : '',
        tabs_content_height: typeof node.tabs_content_height === 'string' ? normalizeOptionalNodeLength(node.tabs_content_height, '680px') : '',
        tabs_content_height_tablet: typeof node.tabs_content_height_tablet === 'string' ? normalizeOptionalNodeLength(node.tabs_content_height_tablet, '620px') : '',
        tabs_content_height_mobile: typeof node.tabs_content_height_mobile === 'string' ? normalizeOptionalNodeLength(node.tabs_content_height_mobile, '72vh') : '',
        display_options: getNodeDisplayOptions(node),
        top_level_placement: node.top_level_placement === 'right' ? 'right' : '',
        top_level_column_start: Math.max(0, Math.min(12, Number(node.top_level_column_start || 0))),
        cta_label: typeof node.cta_label === 'string' ? node.cta_label : '',
        banner_eyebrow: type === 'banner' && typeof node.banner_eyebrow === 'string' ? node.banner_eyebrow : '',
        banner_layout: type === 'banner' ? normalizeBannerLayout(node.banner_layout || 'horizontal') : 'horizontal',
        map_query: typeof node.map_query === 'string' ? node.map_query : '',
        map_embed_url: typeof node.map_embed_url === 'string' ? node.map_embed_url : '',
        map_zoom: Number(node.map_zoom || 15),
        target: Boolean(node.target),
        icon_only: Boolean(node.icon_only),
        children,
    };
}

function createNode(overrides = {}) {
    return normalizeNode({ id: randomId(), ...overrides });
}

function createColumn(index = 1) {
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

function createTabsGroup(index = 1) {
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

function createTemplateLink(label, overrides = {}) {
    return createNode({
        type: 'custom',
        label,
        link: '#',
        children: [],
        ...overrides,
    });
}

function createTemplateText(label, description, overrides = {}) {
    return createNode({
        type: 'text',
        label,
        link: '',
        description,
        children: [],
        ...overrides,
    });
}

function createTemplateBanner(label, description, overrides = {}) {
    return createNode({
        type: 'banner',
        label,
        link: '#',
        description,
        children: [],
        ...overrides,
    });
}

function createTemplateImage(label, imageUrl, overrides = {}) {
    return createNode({
        type: 'image',
        label,
        link: '#',
        image_url: imageUrl,
        children: [],
        ...overrides,
    });
}

function createTemplateMap(label, query, overrides = {}) {
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

function createTemplateVideo(label, overrides = {}) {
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

function createTemplateHook(hookName = 'displayReassurance', label = 'PrestaShop hook', overrides = {}) {
    return createNode({
        type: 'hook',
        label,
        link: '',
        hook_name: hookName,
        children: [],
        ...overrides,
    });
}

function createTemplateBlock(label, children = [], overrides = {}) {
    return createNode({
        type: 'block',
        label,
        link: '',
        children,
        ...overrides,
    });
}

function createReassuranceHookBlock(label = __('Shopping information', 'cci-nice-menu')) {
    return createTemplateHook('displayReassurance', label, {
        component_variant: 'showcase_rail_hook',
    });
}

function createTemplateColumn(label, span, children = [], overrides = {}) {
    return createNode({
        type: 'column',
        label,
        link: '',
        column_span: span,
        children,
        ...overrides,
    });
}

function createTemplateRow(label, children = [], overrides = {}) {
    return createNode({
        type: 'row',
        label,
        link: '',
        column_span: 12,
        children,
        ...overrides,
    });
}

function createLayoutTemplateNode(templateKey) {
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
            return createTemplateColumn('Hero banner', 4, [
                createTemplateBlock('Hero banner', [
                    createTemplateBanner('Express yourself', 'Wear what you love. Unique designs that say more than words.', {
                        cta_label: 'View collection',
                        style_background: '#16266b',
                        style_background_2: '#0d6efd',
                        style_text: '#ffffff',
                    }),
                ], { component_variant: 'hero_strip' }),
            ], { component_variant: 'bottom_hero_column' });
        case 'compact-list':
            return createTemplateColumn('Compact list', 2, [
                createTemplateBlock('Bestsellers', [
                    createTemplateLink('Astronaut graphic tee', { icon: 'chevron-right', description: '27,90 zł' }),
                    createTemplateLink('Hummingbird printed t-shirt', { icon: 'chevron-right', description: '23,52 zł' }),
                    createTemplateLink('Cool cat t-shirt', { icon: 'chevron-right', description: '25,90 zł' }),
                ], { component_variant: 'showcase_compact_list', description: __('Demo: selected products', 'cci-nice-menu') }),
            ], { component_variant: 'showcase_bottom_list_column' });
        case 'benefits-row':
            return createTemplateBlock('Benefits', [
                createTemplateText('Premium quality', 'Best materials', { icon: 'shield' }),
                createTemplateText('HD prints', 'Long-lasting and vivid', { icon: 'palette' }),
                createTemplateText('Easy returns', 'Up to 30 days', { icon: 'rotate' }),
                createTemplateText('Secure payments', 'Encrypted transactions', { icon: 'lock' }),
            ], {
                component_variant: 'benefits_strip',
                style_radius: '12px',
                hide_heading: true,
            });
        case 'store-card':
            return createTemplateColumn(__('Find us', 'cci-nice-menu'), 4, [
                createTemplateBlock(__('Find us', 'cci-nice-menu'), [
                    createTemplateMap(__('Store map', 'cci-nice-menu'), 'Warsaw, Poland', {
                        component_variant: 'showcase_map_card',
                    }),
                    createTemplateText('Cool Cat Ideas Store', '10 Creative Street, 00-001 Warsaw', { icon: 'map-pin' }),
                    createTemplateLink('+48 123 456 789', { icon: 'phone', link: 'tel:+48123456789', description: __('Customer support', 'cci-nice-menu') }),
                    createTemplateLink('hello@coolcatideas.com', { icon: 'envelope', link: 'mailto:hello@coolcatideas.com', description: __('Email us', 'cci-nice-menu') }),
                    createTemplateText('Open 9:00 - 17:00', '', { icon: 'clock', component_variant: 'showcase_store_status' }),
                ], { component_variant: 'showcase_store_card', columns: 2 }),
            ], { component_variant: 'showcase_store_column' });
        case 'media-stack':
            return createTemplateColumn('Campaign', 3, [
                createTemplateBlock('Summer sale', [
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
                ], { component_variant: 'showcase_media_block' }),
            ], { component_variant: 'showcase_media_column' });
        case 'footer-actions':
            return createTemplateColumn('Shortcuts', 12, [
                createTemplateBlock('Shortcuts', [
                    createTemplateLink('Size guide', { icon: 'ruler', description: 'Find the right fit' }),
                    createTemplateLink('Care guide', { icon: 'scissors', description: 'How to care for prints' }),
                    createTemplateLink('Inspiration and blog', { icon: 'palette', description: 'Ideas, trends, interviews' }),
                    createTemplateLink('Personalization', { icon: 'pencil', description: 'Create your own design' }),
                ], { component_variant: 'footer_actions', style_radius: '12px' }),
            ], { component_variant: 'showcase_footer_column' });
        default:
            return createNode({ type: 'custom', label: 'New item', link: '#', children: [] });
    }
}

function createCategoryNodeFromCatalogItem(item = {}, overrides = {}) {
    return createNode({
        type: 'category',
        label: item.name || 'Category',
        link: item.url || '#',
        entity_id: String(item.id || ''),
        product_count: Number(item.product_count || 0),
        children: [],
        ...overrides,
    });
}

function createDefaultTree() {
    return [createNode({ label: ROOT_LABEL, children: [createLayoutTemplateNode('layout-row')] })];
}

function createRetailShowcaseTree() {
    const showcaseImages = {
        tshirt: '/1-default_lg/hummingbird-printed-t-shirt.jpg',
        sweater: '/21-default_lg/brown-bear-printed-sweater.jpg',
        graphic: '/1-default_lg/hummingbird-printed-t-shirt.jpg',
        mug: '/6-default_lg/mug-the-best-is-yet-to-come.jpg',
        notebook: '/18-default_lg/mountain-fox-notebook.jpg',
        poster: '/3-default_lg/the-best-is-yet-to-come-framed-poster.jpg',
        map: '/modules/cci_nice_menu/views/img/showcase-map.svg',
    };
    const link = (label, overrides = {}) => createNode({
        type: 'custom',
        label,
        link: '#',
        children: [],
        ...overrides,
    });
    const map = (label, query, overrides = {}) => createNode({
        type: 'map',
        label,
        link: '',
        map_query: query,
        map_zoom: 15,
        image_url: showcaseImages.map,
        children: [],
        ...overrides,
    });
    const category = (id, label, overrides = {}) => createNode({
        type: 'category',
        label,
        link: '#',
        entity_id: String(id),
        source_label: label,
        source_url: '#',
        children: [],
        ...overrides,
    });
    const categoryTree = (id, label, overrides = {}) => createNode({
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
    const product = (id, label, overrides = {}) => createNode({
        type: 'product',
        label,
        link: '#',
        entity_id: String(id),
        source_label: label,
        source_url: '#',
        children: [],
        ...overrides,
    });
    const productTile = (id, label, overrides = {}) => createNode({
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
    const cms = (id, label, overrides = {}) => createNode({
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
    const text = (label, description, overrides = {}) => createNode({
        type: 'text',
        label,
        link: '',
        description,
        children: [],
        ...overrides,
    });
    const banner = (label, description, overrides = {}) => createNode({
        type: 'banner',
        label,
        link: '#',
        description,
        children: [],
        ...overrides,
    });
    const image = (label, imageUrl, overrides = {}) => createNode({
        type: 'image',
        label,
        link: '#',
        image_url: imageUrl,
        children: [],
        ...overrides,
    });
    const video = (label, overrides = {}) => createNode({
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
    const hook = (hookName, label = 'PrestaShop hook', overrides = {}) => createNode({
        type: 'hook',
        label,
        link: '',
        hook_name: hookName,
        children: [],
        ...overrides,
    });
    const blogPost = (label, description, overrides = {}) => createNode({
        type: 'blog_post',
        label,
        link: '#',
        description,
        children: [],
        ...overrides,
    });
    const blogCollection = (type, label, description, overrides = {}) => createNode({
        type,
        label,
        link: '',
        description,
        item_count: 4,
        children: [],
        ...overrides,
    });
    const block = (label, children = [], overrides = {}) => createNode({
        type: 'block',
        label,
        link: '',
        children,
        ...overrides,
    });
    const column = (label, span, children = [], overrides = {}) => createNode({
        type: 'column',
        label,
        link: '',
        column_span: span,
        children,
        ...overrides,
    });
    const row = (label, children = [], overrides = {}) => createNode({
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

        return hasDirectColumns && !hasRows
            ? [row(`${label} row`, safeChildren)]
            : safeChildren;
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
    const showcaseHeaderColumn = (label, description, icon) => column(label, 12, [
        block(label, [
            text(label, description, {
                icon,
                component_variant: 'showcase_header',
            }),
        ], { component_variant: 'showcase_header_block', hide_heading: true }),
    ], { component_variant: 'showcase_header_column' });
    const showcaseCardListColumn = (label, icon, children = []) => column(label, 3, [
        block(label, children, {
            component_variant: 'showcase_card_list',
            icon,
        }),
    ], { component_variant: 'showcase_action_column' });
    const showcaseBenefitsColumn = (label, children = []) => column(label, 12, [
        block(label, children, {
            component_variant: 'benefits_strip',
            style_radius: '12px',
            hide_heading: true,
        }),
    ], { component_variant: 'showcase_footer_column' });
    const showcaseMediaColumn = (label, children = []) => column(label, 3, [
        block(label, children, {
            component_variant: 'showcase_media_block',
        }),
    ], {
        component_variant: 'showcase_media_column',
    });
    const bestsellerItem = (_id, label, imageUrl = '', overrides = {}) => link(label, {
        image_url: imageUrl,
        ...overrides,
    });
    const showcaseCardAction = (label) => link(label, {
        component_variant: 'card_list_action',
    });
    const dealItem = (label, badge = '', _tone = '') => link(label, {
        badge,
    });
    const railService = (label, description, icon, overrides = {}) => link(label, {
        icon,
        description,
        component_variant: 'showcase_rail_service',
        ...overrides,
    });
    const tabGroup = (label, tabs = [], orientation = 'vertical', railExtras = [], overrides = {}) => column(label, 12, [
        block(label, [...tabs, ...railExtras], { component_variant: 'showcase_tabs_block' }),
    ], {
        layout_role: 'tabs',
        tabs_orientation: orientation,
        component_variant: 'showcase_tabs_column',
        ...overrides,
    });
    const promotionsShowcaseTab = () => tab(__('Promotions and deals', 'cci-nice-menu'), [
        row(__('Promotion intro', 'cci-nice-menu'), [
            showcaseHeaderColumn(
                __('Promotion studio', 'cci-nice-menu'),
                __('Product bundles, timed campaigns and discount-driven merchandising blocks.', 'cci-nice-menu'),
                'tag'
            ),
        ]),
        row(__('Featured promotion row', 'cci-nice-menu'), [
            column(__('Deal spotlight', 'cci-nice-menu'), 4, [
                block(__('Deal spotlight', 'cci-nice-menu'), [
                    banner(
                        __('Summer print kit', 'cci-nice-menu'),
                        __('T-shirt, mug and poster bundle with limited campaign pricing.', 'cci-nice-menu'),
                        {
                            cta_label: __('Shop the kit', 'cci-nice-menu'),
                            banner_eyebrow: __('Bundle -25%', 'cci-nice-menu'),
                            image_url: showcaseImages.tshirt,
                            style_background: '#fff4e6',
                            style_background_2: '#ffe4c2',
                            style_text: '#14233d',
                        }
                    ),
                    text(__('Code PRINT25', 'cci-nice-menu'), __('Apply at checkout before Sunday night.', 'cci-nice-menu'), {
                        icon: 'ticket',
                        component_variant: 'showcase_store_status',
                    }),
                ], {
                    component_variant: 'showcase_media_block',
                    description: __('Hero promotion with product image, CTA and coupon code.', 'cci-nice-menu'),
                }),
            ], { component_variant: 'showcase_media_column' }),
            column(__('Promoted products', 'cci-nice-menu'), 8, [
                block(__('Promoted products', 'cci-nice-menu'), [
                    productTile(1, __('Hummingbird printed t-shirt', 'cci-nice-menu'), {
                        label_override: __('Hummingbird printed t-shirt', 'cci-nice-menu'),
                        description: __('Campaign product with active catalog pricing.', 'cci-nice-menu'),
                    }),
                    productTile(2, __('Hummingbird printed sweater', 'cci-nice-menu'), {
                        label_override: __('Hummingbird printed sweater', 'cci-nice-menu'),
                        description: __('Second promoted product in the same visual grid.', 'cci-nice-menu'),
                    }),
                    productTile(6, __('Mug deal', 'cci-nice-menu'), {
                        label_override: __('Mug deal', 'cci-nice-menu'),
                        description: __('Accessory item promoted next to apparel.', 'cci-nice-menu'),
                    }),
                ], {
                    component_variant: 'showcase_product_grid_two',
                    description: __('Theme-rendered product cards for discount campaigns.', 'cci-nice-menu'),
                    heading_link: '/',
                    heading_link_label: __('View all deals', 'cci-nice-menu'),
                    heading_link_icon: 'arrow-right',
                }),
            ], { component_variant: 'showcase_products_column' }),
        ]),
        row(__('Merchandising row', 'cci-nice-menu'), [
            column(__('Discount product rail', 'cci-nice-menu'), 4, [
                block(__('Discount product rail', 'cci-nice-menu'), [
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
                ], {
                    component_variant: 'showcase_compact_list',
                    description: __('Compact product rows for quick promotion scanning.', 'cci-nice-menu'),
                    heading_link: '/',
                    heading_link_label: __('View discounted products', 'cci-nice-menu'),
                    heading_link_icon: 'arrow-right',
                }),
            ], { component_variant: 'showcase_bottom_list_column' }),
            column(__('Campaign paths', 'cci-nice-menu'), 4, [
                block(__('Campaign paths', 'cci-nice-menu'), [
                    dealItem(__('Flash deals', 'cci-nice-menu'), __('Today only', 'cci-nice-menu')),
                    dealItem(__('Bundles', 'cci-nice-menu'), __('Save more', 'cci-nice-menu')),
                    dealItem(__('Outlet picks', 'cci-nice-menu'), __('Up to 50% off', 'cci-nice-menu')),
                    link(__('Gift-ready sets', 'cci-nice-menu'), {
                        icon: 'gift',
                        description: __('Curated sets for quick seasonal shopping.', 'cci-nice-menu'),
                    }),
                    dealItem(__('Back to school sets', 'cci-nice-menu'), __('-30%', 'cci-nice-menu')),
                    showcaseCardAction(__('Open campaign landing', 'cci-nice-menu')),
                ], {
                    component_variant: 'showcase_card_list',
                    icon: 'sparkles',
                    description: __('Campaign links with badges and clear calls to action.', 'cci-nice-menu'),
                }),
            ], { component_variant: 'showcase_action_column' }),
            column(__('Promotion media', 'cci-nice-menu'), 4, [
                block(__('Promotion media', 'cci-nice-menu'), [
                    banner(__('Gift bundle builder', 'cci-nice-menu'), __('A visual shortcut to product sets and campaign pages.', 'cci-nice-menu'), {
                        cta_label: __('Build a bundle', 'cci-nice-menu'),
                        banner_eyebrow: __('Campaign', 'cci-nice-menu'),
                        image_url: showcaseImages.sweater,
                        banner_layout: 'vertical',
                        style_background: '#f2fbec',
                        style_background_2: '#e2f8cf',
                        style_text: '#14233d',
                    }),
                ], {
                    component_variant: 'showcase_media_block',
                    description: __('Vertical promotion banner using the shared banner component.', 'cci-nice-menu'),
                }),
            ], { component_variant: 'showcase_media_column' }),
        ]),
        row(__('Promotion shortcuts row', 'cci-nice-menu'), [
            showcaseBenefitsColumn(__('Promotion shortcuts', 'cci-nice-menu'), [
                text(__("Today's deals", 'cci-nice-menu'), __('New deals every 24h', 'cci-nice-menu'), { icon: 'tag' }),
                text(__('2-for-1 offers', 'cci-nice-menu'), __('Double the value', 'cci-nice-menu'), { icon: 'percent' }),
                text(__('Free shipping offers', 'cci-nice-menu'), __('On orders over 150 zł', 'cci-nice-menu'), { icon: 'truck' }),
                text(__('Last chance', 'cci-nice-menu'), __('Deals ending soon', 'cci-nice-menu'), { icon: 'clock' }),
            ]),
        ]),
    ], {
        icon: 'tag',
        description: __('Product promotion examples, bundles and limited-time campaign blocks.', 'cci-nice-menu'),
    });

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
                tabGroup('Store categories', [
                    categoryTab(3, 'Clothes', [
                        column('Clothing', 2, [
                            block('Clothing', [
                                link('T-shirts', { component_variant: 'showcase_current_link' }),
                                link('Sweatshirts and hoodies'),
                                link('Polo shirts'),
                                link('Shirts'),
                                link('Tank tops'),
                            ], { component_variant: 'showcase_link_block' }),
                            block('Accessories', [
                                link('Caps and beanies'),
                                link('Bags and backpacks'),
                                link('Socks'),
                                link('Jewelry'),
                                link('Cases and accessories'),
                            ], { component_variant: 'showcase_secondary_link_block' }),
                            block('Special collections', [
                                link('New arrivals'),
                                link('Bestsellers'),
                                link('Sale'),
                            ], { component_variant: 'showcase_secondary_link_block' }),
                        ], { component_variant: 'showcase_link_column' }),
                        column('T-shirts - recommended for you', 7, [
                            block('T-shirts - recommended for you', [
                                productTile(1, 'Hummingbird printed t-shirt'),
                                productTile(2, 'Hummingbird printed sweater'),
                                productTile(9, 'Mountain fox cushion'),
                                productTile(11, 'Hummingbird cushion'),
                            ], { component_variant: 'showcase_product_grid', heading_link: '/', heading_link_label: __('View all', 'cci-nice-menu'), heading_link_icon: 'arrow-right' }),
                            block('Benefits', [
                                text('Premium quality', 'Best materials', { icon: 'shield' }),
                                text('HD prints', 'Long-lasting and vivid', { icon: 'palette' }),
                                text('Easy returns', 'Up to 30 days', { icon: 'rotate' }),
                                text('Secure payments', 'Encrypted transactions', { icon: 'lock' }),
                            ], { component_variant: 'benefits_strip', style_radius: '12px', hide_heading: true }),
                        ], { component_variant: 'showcase_products_column' }),
                        column('Campaign', 3, [
                            block('Summer sale', [
                                banner('Summer sale', '-20% on everything. Until May 31 only', { cta_label: 'Sale', image_url: showcaseImages.tshirt, style_background: '#fff2e8', style_background_2: '#ffe2d5' }),
                                banner('New collection 2024', 'Stand out. See what is new', { cta_label: 'Explore', image_url: showcaseImages.sweater, style_background: '#f2fbec', style_background_2: '#e4f7d7' }),
                                video('See how our catalog works', { label_override: '' }),
                            ], { component_variant: 'showcase_media_block' }),
                        ], { component_variant: 'showcase_media_column' }),
                    ], {
                        icon: 'shirt',
                        product_count: 2,
                        description: 'T-shirts, hoodies, shirts and more',
                    }),
                    categoryTab(6, 'Accessories', [
                        column('Bestsellers', 6, [
                            block('Bestsellers', [
                                productTile(15, 'Pack Mug + Framed poster'),
                                productTile(16, 'Mountain fox notebook'),
                                productTile(17, 'Brown bear notebook'),
                            ], { component_variant: 'showcase_product_grid_three' }),
                        ], { component_variant: 'showcase_products_column' }),
                        column('Quick actions', 3, [
                            block('Quick actions', [
                                link('Sale', { icon: 'tag' }),
                                cms(1, 'Delivery terms', { icon: 'truck', label_override: 'Delivery terms' }),
                                cms(5, 'Secure shopping', { icon: 'shield', label_override: 'Secure shopping' }),
                                cms(4, 'Contact an advisor', { icon: 'phone', label_override: 'Contact an advisor' }),
                            ], { component_variant: 'showcase_card_list' }),
                        ], { component_variant: 'showcase_action_column' }),
                        column('Featured offer', 3, [
                            block('Featured offer', [
                                banner('Express yourself', 'Wear what you love. Unique designs that say more than words.', { cta_label: 'View collection', image_url: showcaseImages.graphic, style_background: '#16266b', style_background_2: '#0d6efd', style_text: '#ffffff' }),
                                productTile(19, 'Customizable mug'),
                            ], { component_variant: 'showcase_media_block' }),
                        ], { component_variant: 'showcase_media_column' }),
                    ], {
                        icon: 'gift',
                        product_count: 11,
                        description: 'Accessories, gadgets, stickers',
                    }),
                    categoryTab(9, 'Art', [
                        column('Video story', 5, [
                            block('Video story', [
                                video('Creative process', {
                                    description: 'Responsive YouTube video with controls and lazy loading.',
                                    component_variant: 'showcase_video_feature',
                                }),
                            ], { component_variant: 'showcase_video_block' }),
                        ], { component_variant: 'showcase_video_column' }),
                        column('Poster collection', 4, [
                            block('Poster collection', [
                                product(3, "The best is yet to come' Framed poster", { icon: 'tag' }),
                                product(4, 'The adventure begins Framed poster', { icon: 'tag' }),
                                product(5, 'Today is a good day Framed poster', { icon: 'tag' }),
                                productTile(12, 'Mountain fox - Vector graphics'),
                            ], { component_variant: 'showcase_card_list' }),
                        ], { component_variant: 'showcase_collection_column' }),
                        column('Quick actions', 3, [
                            block('Quick actions', [
                                link('Sale', { icon: 'tag' }),
                                cms(4, 'Contact us', { icon: 'phone', label_override: 'Contact us' }),
                                cms(5, 'Secure shopping', { icon: 'shield', label_override: 'Secure shopping' }),
                            ], { component_variant: 'showcase_card_list' }),
                        ], { component_variant: 'showcase_action_column' }),
                    ], {
                        icon: 'palette',
                        product_count: 7,
                        description: 'Graphics, posters, wall art',
                    }),
                    tab(__('Category Browser', 'cci-nice-menu'), [
                        column(__('Shop categories', 'cci-nice-menu'), 12, [
                            block(__('Category browser header', 'cci-nice-menu'), [
                                text(__('Shop categories', 'cci-nice-menu'), __('Explore all product groups and find what you love.', 'cci-nice-menu'), {
                                    icon: 'shopping-bag',
                                    component_variant: 'category_browser_header',
                                }),
                            ], { component_variant: 'category_browser_header_block', hide_heading: true }),
                        ], { component_variant: 'category_browser_header_column' }),
                        column(__('Category Browser', 'cci-nice-menu'), 9, [
                            block(__('Category tree', 'cci-nice-menu'), [
                                categoryTree(2, __('All categories', 'cci-nice-menu'), { icon: 'folder-tree' }),
                            ], { component_variant: 'category_browser_tree_block', hide_heading: true }),
                        ], { component_variant: 'category_browser_tree_column' }),
                        column(__('Featured collection', 'cci-nice-menu'), 3, [
                            block(__('Featured collection banner', 'cci-nice-menu'), [
                                banner(__('Express yourself', 'cci-nice-menu'), __('Unique designs that say more than words.', 'cci-nice-menu'), {
                                    cta_label: __('View collection', 'cci-nice-menu'),
                                    banner_eyebrow: __('Featured collection', 'cci-nice-menu'),
                                    image_url: showcaseImages.tshirt,
                                    banner_layout: 'vertical',
                                    style_background: '#f3f8ff',
                                    style_background_2: '#eaf4ff',
                                    style_text: '#111827',
                                }),
                            ], { component_variant: 'showcase_media_block', hide_heading: true }),
                        ], { component_variant: 'showcase_media_column' }),
                    ], {
                        icon: 'folder-tree',
                        description: __('Browse all categories', 'cci-nice-menu'),
                    }),
                ], 'vertical', [
                    createReassuranceHookBlock(),
                ]),
        row('Bottom row', [
                    column('Express yourself', 4, [
                        block('Express yourself', [
                            banner('Express yourself', 'Wear what you love. Unique designs that say more than words.', { cta_label: 'View collection', image_url: showcaseImages.tshirt, style_background: '#16266b', style_background_2: '#0d6efd', style_text: '#ffffff' }),
                        ], { component_variant: 'hero_strip' }),
                    ], { component_variant: 'bottom_hero_column' }),
                    column('Bestsellers', 2, [
                        block('Bestsellers', [
                            product(2, 'Astronaut graphic tee', { icon: 'chevron-right', description: '27,90 zł' }),
                            product(1, 'Hummingbird printed t-shirt', { icon: 'chevron-right', description: '23,52 zł' }),
                            product(14, 'Cool cat t-shirt', { icon: 'chevron-right', description: '25,90 zł' }),
                        ], { component_variant: 'showcase_compact_list', description: __('Demo: selected products', 'cci-nice-menu'), heading_link: '/', heading_link_label: __('View all', 'cci-nice-menu'), heading_link_icon: 'arrow-right' }),
                    ], { component_variant: 'showcase_bottom_list_column' }),
                    column('New arrivals', 2, [
                        block('New arrivals', [
                            product(18, 'Hummingbird hoodie', { icon: 'chevron-right', description: '89,90 zł' }),
                            product(17, 'Wave cap', { icon: 'chevron-right', description: '49,90 zł' }),
                            product(16, 'Art socks', { icon: 'chevron-right', description: '19,90 zł' }),
                        ], { component_variant: 'showcase_compact_list', description: __('Demo: selected products', 'cci-nice-menu'), heading_link: '/', heading_link_label: __('View all', 'cci-nice-menu'), heading_link_icon: 'arrow-right' }),
                    ], { component_variant: 'showcase_bottom_list_column' }),
                    column(__('Find us', 'cci-nice-menu'), 4, [
                        block(__('Find us', 'cci-nice-menu'), [
                            map(__('Store map', 'cci-nice-menu'), 'Warsaw, Poland', { component_variant: 'showcase_map_card' }),
                            text('Cool Cat Ideas Store', '10 Creative Street, 00-001 Warsaw', { icon: 'map-pin' }),
                            link('+48 123 456 789', { icon: 'phone', link: 'tel:+48123456789', description: __('Customer support', 'cci-nice-menu') }),
                            link('hello@coolcatideas.com', { icon: 'envelope', link: 'mailto:hello@coolcatideas.com', description: __('Email us', 'cci-nice-menu') }),
                            text('Open 9:00 - 17:00', '', { icon: 'clock', component_variant: 'showcase_store_status' }),
                        ], { component_variant: 'showcase_store_card', columns: 2, heading_link: '/', heading_link_label: __('View store', 'cci-nice-menu'), heading_link_icon: 'arrow-right' }),
                    ], { component_variant: 'showcase_store_column' }),
                    column('Shortcuts', 12, [
                        block('Shortcuts', [
                            link('Size guide', { icon: 'ruler', description: 'Find the right fit' }),
                            link('Care guide', { icon: 'scissors', description: 'How to care for prints' }),
                            link('Inspiration and blog', { icon: 'palette', description: 'Ideas, trends, interviews' }),
                            link('Personalization', { icon: 'pencil', description: 'Create your own design' }),
                        ], { component_variant: 'footer_actions', style_radius: '12px' }),
                    ], { component_variant: 'showcase_footer_column' }),
                ], { component_variant: 'showcase_secondary_row' }),
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
                    'trophy'
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
                        }
                    ),
                ]),
                showcaseBenefitsColumn(__('Bestsellers highlights', 'cci-nice-menu'), [
                    text(__('Top rated', 'cci-nice-menu'), __('4.8+ average rating', 'cci-nice-menu'), { icon: 'star' }),
                    text(__('Most purchased', 'cci-nice-menu'), __('Our top-selling items', 'cci-nice-menu'), { icon: 'shopping-bag' }),
                    text(__('Trending now', 'cci-nice-menu'), __("What's hot this week", 'cci-nice-menu'), { icon: 'chart-line' }),
                    text(__('Back in stock', 'cci-nice-menu'), __('Fan favorites return', 'cci-nice-menu'), { icon: 'cube' }),
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
                    __('Discover creative ideas, media and every content block available in the menu.', 'cci-nice-menu'),
                    'compass'
                ),
                tabGroup(__('Inspiration library', 'cci-nice-menu'), [
                    tab(__('Content types', 'cci-nice-menu'), [
                        column(__('Links and sources', 'cci-nice-menu'), 4, [
                            block(__('Navigation sources', 'cci-nice-menu'), [
                                link(__('Custom link', 'cci-nice-menu'), {
                                    icon: 'link',
                                    description: __('Manual label, icon, badge, URL and optional description.', 'cci-nice-menu'),
                                }),
                                cms(4, __('CMS page link', 'cci-nice-menu'), {
                                    icon: 'file-text',
                                    label_override: __('CMS page link', 'cci-nice-menu'),
                                    description: __('PrestaShop CMS page selected from catalog data.', 'cci-nice-menu'),
                                }),
                                category(3, __('Category link', 'cci-nice-menu'), {
                                    icon: 'folder',
                                    label_override: __('Category link', 'cci-nice-menu'),
                                    description: __('Single category link with live URL and product count fallback.', 'cci-nice-menu'),
                                }),
                                categoryTree(0, __('Category tree source', 'cci-nice-menu'), {
                                    icon: 'folder-tree',
                                    description: __('Category tree node; select a category to generate a live browser.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_card_list',
                                icon: 'link',
                                description: __('Manual, CMS and catalog-backed navigation entries.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_action_column' }),
                        column(__('Utility content', 'cci-nice-menu'), 4, [
                            block(__('Text and utility blocks', 'cci-nice-menu'), [
                                text(__('Text card', 'cci-nice-menu'), __('Icon, title and supporting copy for short guidance.', 'cci-nice-menu'), { icon: 'info' }),
                                text(__('Status badge', 'cci-nice-menu'), __('Non-clickable status pill used for opening hours or timers.', 'cci-nice-menu'), {
                                    icon: 'clock',
                                    component_variant: 'showcase_store_status',
                                }),
                                map(__('Map block', 'cci-nice-menu'), 'Warsaw, Poland', {
                                    description: __('Map placeholder from a query, address or configured embed URL.', 'cci-nice-menu'),
                                }),
                                hook('displayReassurance', __('Native hook', 'cci-nice-menu'), {
                                    description: __('PrestaShop module output rendered by hook name.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_card_list',
                                icon: 'settings',
                                description: __('Text, status, map and native module content.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_action_column' }),
                        column(__('Media content', 'cci-nice-menu'), 4, [
                            block(__('Media types', 'cci-nice-menu'), [
                                image(__('Image block', 'cci-nice-menu'), showcaseImages.poster, {
                                    description: __('Standalone image with optional caption and link.', 'cci-nice-menu'),
                                }),
                                banner(__('Banner block', 'cci-nice-menu'), __('Image, gradient background, copy and CTA.', 'cci-nice-menu'), {
                                    cta_label: __('Open banner', 'cci-nice-menu'),
                                    banner_eyebrow: __('Banner', 'cci-nice-menu'),
                                    image_url: showcaseImages.tshirt,
                                    style_background: '#f3f8ff',
                                    style_background_2: '#eaf4ff',
                                }),
                                video(__('Video block', 'cci-nice-menu'), {
                                    description: __('YouTube or file video with poster, aspect ratio and lazy loading.', 'cci-nice-menu'),
                                    cta_label: __('Watch', 'cci-nice-menu'),
                                    component_variant: 'showcase_video_feature',
                                }),
                            ], {
                                component_variant: 'showcase_media_block',
                                description: __('Image, banner and video content in one media stack.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_media_column' }),
                    ], {
                        icon: 'layout-grid',
                        description: __('All base content nodes available in the builder.', 'cci-nice-menu'),
                    }),
                    tab(__('Catalog products', 'cci-nice-menu'), [
                        column(__('Product grid', 'cci-nice-menu'), 6, [
                            block(__('Product grid', 'cci-nice-menu'), [
                                productTile(1, __('Theme product tile', 'cci-nice-menu'), {
                                    label_override: __('Theme product tile', 'cci-nice-menu'),
                                    description: __('Product tile rendered by the shop theme inside product grids.', 'cci-nice-menu'),
                                }),
                                productTile(2, __('Grid product tile', 'cci-nice-menu'), {
                                    label_override: __('Grid product tile', 'cci-nice-menu'),
                                    description: __('Second product tile proves the shared grid layout.', 'cci-nice-menu'),
                                }),
                                productTile(9, __('Two-column product grid', 'cci-nice-menu'), {
                                    label_override: __('Two-column product grid', 'cci-nice-menu'),
                                    description: __('Grid can be switched between available product presets.', 'cci-nice-menu'),
                                }),
                                productTile(6, __('Catalog product card', 'cci-nice-menu'), {
                                    label_override: __('Catalog product card', 'cci-nice-menu'),
                                    description: __('Catalog-backed product with theme image and price.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_product_grid_two',
                                description: __('Theme-rendered product cards for visual merchandising.', 'cci-nice-menu'),
                                heading_link: '/',
                                heading_link_label: __('View all', 'cci-nice-menu'),
                                heading_link_icon: 'arrow-right',
                            }),
                        ], { component_variant: 'showcase_products_column' }),
                        column(__('Compact list', 'cci-nice-menu'), 3, [
                            block(__('Compact product list', 'cci-nice-menu'), [
                                product(1, __('Compact product row', 'cci-nice-menu'), {
                                    label_override: __('Compact product row', 'cci-nice-menu'),
                                    description: __('Small product row with image, description and price.', 'cci-nice-menu'),
                                }),
                                product(2, __('Product row with price', 'cci-nice-menu'), {
                                    label_override: __('Product row with price', 'cci-nice-menu'),
                                    description: __('Useful for bestsellers, new arrivals and manual selections.', 'cci-nice-menu'),
                                }),
                                product(6, __('Accessory product row', 'cci-nice-menu'), {
                                    label_override: __('Accessory product row', 'cci-nice-menu'),
                                    description: __('Same compact component works for other catalog products.', 'cci-nice-menu'),
                                }),
                                product(3, __('Poster product row', 'cci-nice-menu'), {
                                    label_override: __('Poster product row', 'cci-nice-menu'),
                                    description: __('Extra row keeps compact list focused on product content.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_compact_list',
                                description: __('Selected products demo; replace with dynamic product data later.', 'cci-nice-menu'),
                                heading_link: '/',
                                heading_link_label: __('View all', 'cci-nice-menu'),
                                heading_link_icon: 'arrow-right',
                            }),
                        ], { component_variant: 'showcase_bottom_list_column' }),
                        column(__('Manual cards', 'cci-nice-menu'), 3, [
                            block(__('Manual product cards', 'cci-nice-menu'), [
                                product(19, __('Product link', 'cci-nice-menu'), {
                                    icon: 'shopping-bag',
                                    label_override: __('Product link', 'cci-nice-menu'),
                                    description: __('Compact product row when a full grid is not needed.', 'cci-nice-menu'),
                                }),
                                productTile(19, __('Product tile fallback', 'cci-nice-menu'), {
                                    label_override: __('Product tile fallback', 'cci-nice-menu'),
                                    description: __('Lightweight product card outside product grids.', 'cci-nice-menu'),
                                    use_fallback_product_tile: true,
                                }),
                                link(__('Manual collection link', 'cci-nice-menu'), {
                                    icon: 'sparkles',
                                    badge: __('New', 'cci-nice-menu'),
                                    description: __('Manual link can sit next to product content.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_card_list',
                                icon: 'shopping-bag',
                                description: __('Product link, fallback tile and manual merchandising link.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_action_column' }),
                    ], {
                        icon: 'shopping-bag',
                        description: __('Product grids, compact rows and manual product cards.', 'cci-nice-menu'),
                    }),
                    promotionsShowcaseTab(),
                    tab(__('Media and promos', 'cci-nice-menu'), [
                        column(__('Campaign banners', 'cci-nice-menu'), 4, [
                            block(__('Horizontal banner', 'cci-nice-menu'), [
                                banner(__('Horizontal promo banner', 'cci-nice-menu'), __('Wide banner with shared CTA, media and gradient logic.', 'cci-nice-menu'), {
                                    cta_label: __('View collection', 'cci-nice-menu'),
                                    banner_eyebrow: __('Campaign', 'cci-nice-menu'),
                                    image_url: showcaseImages.tshirt,
                                    style_background: '#eaf3ff',
                                    style_background_2: '#d7eaff',
                                    style_text: '#14233d',
                                }),
                            ], {
                                component_variant: 'showcase_media_block',
                                description: __('Horizontal banner component for wide content zones.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_media_column' }),
                        column(__('Vertical feature', 'cci-nice-menu'), 4, [
                            block(__('Vertical banner', 'cci-nice-menu'), [
                                banner(__('Vertical promo banner', 'cci-nice-menu'), __('Tall banner variant using the same banner CTA and hover styles.', 'cci-nice-menu'), {
                                    cta_label: __('Explore', 'cci-nice-menu'),
                                    banner_eyebrow: __('Feature', 'cci-nice-menu'),
                                    image_url: showcaseImages.sweater,
                                    banner_layout: 'vertical',
                                    style_background: '#f2fbec',
                                    style_background_2: '#e3f7d6',
                                    style_text: '#14233d',
                                }),
                            ], {
                                component_variant: 'showcase_media_block',
                                description: __('Vertical layout of the same shared banner block.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_media_column' }),
                        column(__('Rich media stack', 'cci-nice-menu'), 4, [
                            block(__('Image and video stack', 'cci-nice-menu'), [
                                image(__('Linked image tile', 'cci-nice-menu'), showcaseImages.mug, {
                                    description: __('Image content can be used as a visual shortcut.', 'cci-nice-menu'),
                                }),
                                video(__('Video feature', 'cci-nice-menu'), {
                                    description: __('Embedded video block with CTA and poster fallback.', 'cci-nice-menu'),
                                    cta_label: __('Watch guide', 'cci-nice-menu'),
                                    component_variant: 'showcase_video_feature',
                                }),
                                text(__('Media caption', 'cci-nice-menu'), __('Text cards can explain media content without custom markup.', 'cci-nice-menu'), { icon: 'captions' }),
                            ], {
                                component_variant: 'showcase_media_block',
                                description: __('Shared media stack for images, video and supporting copy.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_media_column' }),
                    ], {
                        icon: 'image',
                        description: __('Banner orientations, image tiles and video blocks.', 'cci-nice-menu'),
                    }),
                    tab(__('Reusable blocks', 'cci-nice-menu'), [
                        row(__('Lists row', 'cci-nice-menu'), [
                            column(__('Primary links', 'cci-nice-menu'), 3, [
                                block(__('Link list', 'cci-nice-menu'), [
                                    link(__('Primary link', 'cci-nice-menu'), { description: __('Default text link in a shared list block.', 'cci-nice-menu') }),
                                    link(__('Highlighted link', 'cci-nice-menu'), { component_variant: 'showcase_current_link', description: __('Current/selected link state for navigation.', 'cci-nice-menu') }),
                                    link(__('Link with badge', 'cci-nice-menu'), { badge: __('Hot', 'cci-nice-menu'), description: __('Badge appears next to the label when configured.', 'cci-nice-menu') }),
                                    showcaseCardAction(__('View link list', 'cci-nice-menu')),
                                ], {
                                    component_variant: 'showcase_link_block',
                                    description: __('Compact navigation list for category groups.', 'cci-nice-menu'),
                                }),
                            ], { component_variant: 'showcase_link_column' }),
                            column(__('Secondary links', 'cci-nice-menu'), 3, [
                                block(__('Secondary link list', 'cci-nice-menu'), [
                                    link(__('Secondary link', 'cci-nice-menu'), { description: __('Quieter link list for supporting navigation.', 'cci-nice-menu') }),
                                    link(__('Support link', 'cci-nice-menu'), { description: __('Same block with reduced visual weight.', 'cci-nice-menu') }),
                                    link(__('Resource link', 'cci-nice-menu'), { description: __('Reusable for manuals, guides and collections.', 'cci-nice-menu') }),
                                    showcaseCardAction(__('View resources', 'cci-nice-menu')),
                                ], {
                                    component_variant: 'showcase_secondary_link_block',
                                    description: __('Secondary link block uses the same list mechanics.', 'cci-nice-menu'),
                                }),
                            ], { component_variant: 'showcase_link_column' }),
                            column(__('Card list', 'cci-nice-menu'), 3, [
                                block(__('Card list', 'cci-nice-menu'), [
                                    link(__('Card item with icon', 'cci-nice-menu'), {
                                        icon: 'star',
                                        description: __('Icon, label, description and chevron in one row.', 'cci-nice-menu'),
                                    }),
                                    dealItem(__('Badge item', 'cci-nice-menu'), __('Best value', 'cci-nice-menu')),
                                    link(__('Image item', 'cci-nice-menu'), {
                                        image_url: showcaseImages.notebook,
                                        description: __('Card list also supports configured thumbnails.', 'cci-nice-menu'),
                                    }),
                                    showcaseCardAction(__('Open card list', 'cci-nice-menu')),
                                ], {
                                    component_variant: 'showcase_card_list',
                                    icon: 'layout-list',
                                    description: __('General purpose card list for mixed content rows.', 'cci-nice-menu'),
                                }),
                            ], { component_variant: 'showcase_action_column' }),
                            column(__('Rail services', 'cci-nice-menu'), 3, [
                                block(__('Rail service cards', 'cci-nice-menu'), [
                                    railService(__('Fast setup', 'cci-nice-menu'), __('Short service item for tab rails.', 'cci-nice-menu'), 'zap'),
                                    railService(__('Editor friendly', 'cci-nice-menu'), __('Label and description come from data.', 'cci-nice-menu'), 'edit-3'),
                                    railService(__('Reusable style', 'cci-nice-menu'), __('Same component in different menu sections.', 'cci-nice-menu'), 'refresh-cw'),
                                ], {
                                    component_variant: 'showcase_card_list',
                                    icon: 'sparkles',
                                    description: __('Rail service item pattern used by tab support content.', 'cci-nice-menu'),
                                }),
                            ], { component_variant: 'showcase_action_column' }),
                        ]),
                        row(__('Strips row', 'cci-nice-menu'), [
                            showcaseBenefitsColumn(__('Benefits strip', 'cci-nice-menu'), [
                                text(__('Benefit item', 'cci-nice-menu'), __('Icon plus short value proposition.', 'cci-nice-menu'), { icon: 'shield' }),
                                text(__('Feature item', 'cci-nice-menu'), __('Works as a horizontal supporting strip.', 'cci-nice-menu'), { icon: 'palette' }),
                                text(__('Trust item', 'cci-nice-menu'), __('Consistent icon, title and description rhythm.', 'cci-nice-menu'), { icon: 'lock' }),
                                text(__('Service item', 'cci-nice-menu'), __('Reusable for reassurance and highlights.', 'cci-nice-menu'), { icon: 'truck' }),
                            ]),
                            column(__('Footer actions', 'cci-nice-menu'), 12, [
                                block(__('Footer actions', 'cci-nice-menu'), [
                                    link(__('Size guide', 'cci-nice-menu'), { icon: 'ruler', description: __('Find the right fit.', 'cci-nice-menu') }),
                                    link(__('Care guide', 'cci-nice-menu'), { icon: 'scissors', description: __('How to care for prints.', 'cci-nice-menu') }),
                                    link(__('Inspiration and blog', 'cci-nice-menu'), { icon: 'palette', description: __('Ideas, trends and interviews.', 'cci-nice-menu') }),
                                    link(__('Personalization', 'cci-nice-menu'), { icon: 'pencil', description: __('Create your own design.', 'cci-nice-menu') }),
                                ], {
                                    component_variant: 'footer_actions',
                                    style_radius: '12px',
                                    description: __('Full-width shortcut strip for helpful links.', 'cci-nice-menu'),
                                }),
                            ], { component_variant: 'showcase_footer_column' }),
                        ]),
                    ], {
                        icon: 'blocks',
                        description: __('Reusable list, card, strip and rail block variants.', 'cci-nice-menu'),
                    }),
                    tab(__('Store and hooks', 'cci-nice-menu'), [
                        column(__('Store card', 'cci-nice-menu'), 6, [
                            block(__('Store card', 'cci-nice-menu'), [
                                map(__('Store map', 'cci-nice-menu'), '10 Creative Street, Warsaw', {
                                    description: __('Map spans the card width and keeps contact data grouped.', 'cci-nice-menu'),
                                }),
                                text(__('Cool Cat Ideas Store', 'cci-nice-menu'), __('10 Creative Street, 00-001 Warsaw', 'cci-nice-menu'), { icon: 'map-pin' }),
                                link('+48 123 456 789', {
                                    link: 'tel:+48123456789',
                                    icon: 'phone',
                                    description: __('Customer support phone link.', 'cci-nice-menu'),
                                }),
                                link('hello@coolcatideas.com', {
                                    link: 'mailto:hello@coolcatideas.com',
                                    icon: 'mail',
                                    description: __('Email link rendered from menu data.', 'cci-nice-menu'),
                                }),
                                text(__('Open 9:00 - 17:00', 'cci-nice-menu'), __('Non-clickable opening status.', 'cci-nice-menu'), {
                                    icon: 'clock',
                                    component_variant: 'showcase_store_status',
                                }),
                            ], {
                                component_variant: 'showcase_store_card',
                                columns: 2,
                                description: __('Map, address, contact links and status in one shared store block.', 'cci-nice-menu'),
                                heading_link: '/',
                                heading_link_label: __('View store', 'cci-nice-menu'),
                                heading_link_icon: 'arrow-right',
                            }),
                        ], { component_variant: 'showcase_store_column' }),
                        column(__('Native module output', 'cci-nice-menu'), 3, [
                            block(__('Customer reassurance hook', 'cci-nice-menu'), [
                                hook('displayReassurance', __('Customer reassurance', 'cci-nice-menu'), {
                                    description: __('Native PrestaShop reassurance module output.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_card_list',
                                icon: 'shield',
                                description: __('Hook content is rendered from the module, not copied HTML.', 'cci-nice-menu'),
                            }),
                            block(__('Hook reference', 'cci-nice-menu'), [
                                text(__('Search bar hook', 'cci-nice-menu'), __('Use displaySearch / ps_searchbar as a hook block when search is needed.', 'cci-nice-menu'), { icon: 'search' }),
                                text(__('Hook fallback', 'cci-nice-menu'), __('Widget modules can render through a conscious hook fallback.', 'cci-nice-menu'), { icon: 'plug' }),
                            ], {
                                component_variant: 'showcase_card_list',
                                icon: 'plug',
                                description: __('Notes for native module blocks available in the builder.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_action_column' }),
                        column(__('Standalone map', 'cci-nice-menu'), 3, [
                            block(__('Map card', 'cci-nice-menu'), [
                                map(__('Map card', 'cci-nice-menu'), 'Warsaw, Poland', {
                                    description: __('Standalone map block for contact or pickup sections.', 'cci-nice-menu'),
                                }),
                                link(__('Open map', 'cci-nice-menu'), {
                                    icon: 'external-link',
                                    description: __('Action link can sit below the map.', 'cci-nice-menu'),
                                }),
                            ], {
                                component_variant: 'showcase_map_card',
                                description: __('Map and action link without the full store card wrapper.', 'cci-nice-menu'),
                            }),
                        ], { component_variant: 'showcase_store_column' }),
                    ], {
                        icon: 'map-pin',
                        description: __('Store card, map blocks and native PrestaShop hooks.', 'cci-nice-menu'),
                    }),
                ], 'vertical', [], {
                    tabs_content_height: '680px',
                    tabs_content_height_tablet: '620px',
                    tabs_content_height_mobile: '72vh',
                }),
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
                    'file-text'
                ),
                row(__('Blog content', 'cci-nice-menu'), [
                    column(__('Featured article', 'cci-nice-menu'), 4, [
                        block(__('Featured guide', 'cci-nice-menu'), [
                            blogPost(__('Featured article', 'cci-nice-menu'), __('A hand-picked article displayed as a sticky menu card.', 'cci-nice-menu')),
                        ], {
                            component_variant: 'showcase_card_list',
                            description: __('Single selected article block for editorial navigation.', 'cci-nice-menu'),
                        }),
                    ], { component_variant: 'showcase_action_column' }),
                    column(__('Latest articles', 'cci-nice-menu'), 4, [
                        block(__('Latest articles', 'cci-nice-menu'), [
                            blogCollection('blog_list', __('Latest blog list', 'cci-nice-menu'), __('Newest active blog posts from CCI Blog.', 'cci-nice-menu'), {
                                component_variant: 'showcase_blog_list',
                            }),
                        ], {
                            component_variant: 'showcase_card_list',
                            description: __('Automatically rendered newest posts.', 'cci-nice-menu'),
                        }),
                    ], { component_variant: 'showcase_action_column' }),
                    column(__('Popular reads', 'cci-nice-menu'), 4, [
                        block(__('Popular reads', 'cci-nice-menu'), [
                            blogCollection('blog_popular', __('Popular posts', 'cci-nice-menu'), __('Popular articles ordered by the blog view counter.', 'cci-nice-menu'), {
                                component_variant: 'showcase_blog_popular',
                            }),
                        ], {
                            component_variant: 'showcase_card_list',
                            description: __('Articles sorted by collected view statistics.', 'cci-nice-menu'),
                        }),
                    ], { component_variant: 'showcase_action_column' }),
                ]),
                row(__('More from the blog', 'cci-nice-menu'), [
                    column(__('Article carousel', 'cci-nice-menu'), 8, [
                        block(__('Article carousel', 'cci-nice-menu'), [
                            blogCollection('blog_carousel', __('Blog carousel', 'cci-nice-menu'), __('Carousel block sourced from published blog posts.', 'cci-nice-menu'), {
                                component_variant: 'showcase_blog_carousel',
                                item_count: 6,
                                carousel_items: 3,
                                carousel_margin: 16,
                                carousel_autoplay: true,
                                carousel_autoplay_timeout: 4500,
                            }),
                        ], {
                            component_variant: 'showcase_card_list',
                            description: __('A horizontal rail for recent or curated articles.', 'cci-nice-menu'),
                        }),
                    ], { component_variant: 'showcase_bottom_list_column' }),
                    column(__('Blog categories', 'cci-nice-menu'), 4, [
                        block(__('Blog categories', 'cci-nice-menu'), [
                            blogCollection('blog_categories', __('Blog categories', 'cci-nice-menu'), __('Automatic category listing from CCI Blog.', 'cci-nice-menu'), {
                                component_variant: 'showcase_blog_categories',
                                icon: 'folder-tree',
                                item_count: 8,
                                blog_category_mode: 'all',
                                blog_category_hide_empty: true,
                                blog_category_sort: 'position',
                                blog_category_show_count: true,
                                blog_category_media_mode: 'auto',
                            }),
                        ], {
                            component_variant: 'showcase_card_list',
                            description: __('Automatic or selected category list with post counts.', 'cci-nice-menu'),
                        }),
                    ], { component_variant: 'showcase_action_column' }),
                ], { component_variant: 'showcase_secondary_row' }),
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
            description: __('Native PrestaShop search output from displaySearch / ps_searchbar.', 'cci-nice-menu'),
            top_level_placement: 'right',
            top_level_column_start: 10,
            column_span: 3,
        }),
    ];

    return [
        row(__('Top navigation row', 'cci-nice-menu'), [
            column(__('Primary navigation', 'cci-nice-menu'), 9, topItems.slice(0, 6).map(topLink), {
                component_variant: 'top_navigation_column',
            }),
            column(__('Search', 'cci-nice-menu'), 3, topItems.slice(6).map(topLink), {
                component_variant: 'top_navigation_search_column',
                top_level_placement: 'right',
            }),
        ], {
            component_variant: 'top_navigation_row',
        }),
    ];
}

function normalizeMenu(menu = {}) {
    return {
        id_menu: Number(menu.id_menu || 0),
        code: menu.code || 'main',
        name: menu.name || 'Main menu',
        hook_name: menu.hook_name || 'displayTop',
        is_active: Number(menu.is_active ?? 1),
        position: Number(menu.position || 1),
        created_at: menu.created_at || '',
        updated_at: menu.updated_at || '',
        settings: {
            ...DEFAULT_COLOR_SETTINGS,
            category_tab_media_mode: 'auto',
            top_level_layout: 'flow',
            ...pluginData.defaultSettings,
            ...(menu.settings || {}),
        },
        tree: Array.isArray(menu.tree) && menu.tree.length ? menu.tree.map(normalizeNode) : createDefaultTree(),
    };
}

function formatMenuDate(menu = {}) {
    return menu.updated_at || menu.created_at || '—';
}

function pathsEqual(left = [], right = []) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function pathStartsWith(path = [], prefix = []) {
    return Array.isArray(path)
        && Array.isArray(prefix)
        && path.length >= prefix.length
        && prefix.every((value, index) => path[index] === value);
}

function findTopMenuEntryIndexByPath(entries = [], path = []) {
    if (!Array.isArray(path) || !path.length) {
        return 0;
    }

    const exactIndex = entries.findIndex((entry) => pathsEqual(entry.path, path));
    if (exactIndex >= 0) {
        return exactIndex;
    }

    const parentIndex = entries.findIndex((entry) => pathStartsWith(path, entry.path));
    if (parentIndex >= 0) {
        return parentIndex;
    }

    return 0;
}

function getNodeAtPath(nodes = [], path = []) {
    return path.reduce((current, index) => {
        if (!current) {
            return null;
        }

        return Array.isArray(current) ? current[index] : current.children?.[index];
    }, nodes);
}

function updateNodeAtPath(nodes = [], path = [], updater) {
    if (!path.length) {
        return nodes;
    }

    const [index, ...rest] = path;

    return nodes.map((node, nodeIndex) => {
        if (nodeIndex !== index) {
            return node;
        }

        if (!rest.length) {
            return updater(node);
        }

        return {
            ...node,
            children: updateNodeAtPath(node.children || [], rest, updater),
        };
    });
}

function appendChildAtPath(nodes = [], path = [], child) {
    if (!path.length) {
        return [...nodes, child];
    }

    return updateNodeAtPath(nodes, path, (node) => ({
        ...node,
        children: [...(node.children || []), child],
    }));
}

function removeNodeAtPath(nodes = [], path = []) {
    if (path.length === 1) {
        return nodes.filter((_, index) => index !== path[0]);
    }

    const [index, ...rest] = path;

    return nodes.map((node, nodeIndex) => {
        if (nodeIndex !== index) {
            return node;
        }

        return {
            ...node,
            children: removeNodeAtPath(node.children || [], rest),
        };
    });
}

function readInitialPayload() {
    const node = document.getElementById('cci-nice-menu-initial-state');

    if (!node) {
        return { menus: [], activeMenu: normalizeMenu() };
    }

    try {
        const parsed = JSON.parse(node.textContent || '{}');
        return {
            menus: Array.isArray(parsed.menus) ? parsed.menus.map(normalizeMenu) : [],
            activeMenu: normalizeMenu(parsed.activeMenu || {}),
        };
    } catch (error) {
        return { menus: [], activeMenu: normalizeMenu() };
    }
}

function NumberInputWithUnit({ value, unit, min = 0, onChange }) {
    return (
        <InputGroup>
            <InputGroupInput
                type='number'
                min={min}
                value={value}
                onChange={(event) => onChange(Number(event.target.value || 0))}
            />
            <InputGroupAddon align='inline-end'>
                <InputGroupText>{unit}</InputGroupText>
            </InputGroupAddon>
        </InputGroup>
    );
}

function ToggleField({ checked, label, icon, onChange }) {
    return <CheckboxField checked={checked} icon={icon} onCheckedChange={(value) => onChange(value === true)}>{label}</CheckboxField>;
}

function TypeBadge({ type, labelOverride = '' }) {
    const meta = contentTypes.find((item) => item.value === type);
    const label = labelOverride || meta?.label || (type === 'row' ? 'Row' : type === 'column' ? 'Column' : type === 'block' ? 'Block' : 'Item');

    return (
        <span className='tw-inline-flex tw-h-6 tw-items-center tw-rounded-full tw-border tw-border-solid tw-border-slate-300 tw-bg-white tw-px-2 tw-text-xs tw-font-semibold tw-tracking-normal tw-text-slate-700'>
            {label}
        </span>
    );
}

function getAdminNodeTypeDisplayLabel(node = {}, displayLabel = '') {
    const type = node?.type || 'custom';
    const typeLabel = type === 'block'
        ? getBlockComponentDisplayLabel(node)
        : getNodeTypeLabel(type);

    return normalizeComparableLabel(displayLabel) !== normalizeComparableLabel(typeLabel) ? typeLabel : '';
}

function ElementContextPanel({ type, label, description, node = null }) {
    const meta = contentTypes.find((item) => item.value === type);
    const Icon = meta?.icon || (type === 'row' ? Layers : type === 'column' ? Columns3 : type === 'block' ? Boxes : Link2);
    const displayLabel = type === 'block'
        ? getBlockHeaderLabel(node || { type, label }, 0, 1, '')
        : (label || getNodeTypeLabel(type));
    const typeLabel = getAdminNodeTypeDisplayLabel(node || { type, label }, displayLabel);

    return (
        <div className='tw-grid tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4'>
            <span className='tw-inline-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm'>
                <Icon aria-hidden='true' className='tw-h-4 tw-w-4' />
            </span>
            <span className='tw-min-w-0'>
                <span className='tw-flex tw-flex-wrap tw-items-center tw-gap-2'>
                    <strong className='tw-min-w-0 tw-truncate tw-text-base tw-font-semibold tw-leading-5 tw-text-cci-nm-text'>{displayLabel}</strong>
                    {typeLabel ? <TypeBadge type={type} labelOverride={typeLabel} /> : null}
                </span>
                {description ? (
                    <span className='tw-mt-1 tw-block tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>{description}</span>
                ) : null}
            </span>
        </div>
    );
}

function EditorPanel({ title, description = '', defaultOpen = true, children }) {
    const [open, setOpen] = React.useState(defaultOpen);
    const previousTitleRef = React.useRef(title);

    React.useEffect(() => {
        if (previousTitleRef.current !== title) {
            previousTitleRef.current = title;
            setOpen(defaultOpen);
        }
    }, [defaultOpen, title]);

    return (
        <section className='tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-slate-300 tw-bg-slate-50'>
            <Button
                variant='unstyled'
                type='button'
                className='tw-flex tw-w-full tw-cursor-pointer tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-bg-slate-50 tw-px-4 tw-py-3 tw-text-left tw-shadow-none hover:tw-bg-slate-100'
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
            >
                <span className='tw-min-w-0'>
                    <strong className='tw-block tw-text-[15px] tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-900'>{title}</strong>
                    {description ? <span className='tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{description}</span> : null}
                </span>
                <ChevronDown aria-hidden='true' className={`tw-h-4 tw-w-4 tw-shrink-0 tw-text-cci-nm-muted tw-transition-transform ${open ? 'tw-rotate-180' : ''}`} />
            </Button>
            {open ? (
                <div className='tw-grid tw-gap-4 tw-border-0 tw-border-t tw-border-solid tw-border-slate-200 tw-bg-white tw-p-4'>
                    {children}
                </div>
            ) : null}
        </section>
    );
}

function getNodeTypeLabel(type) {
    return contentTypes.find((item) => item.value === type)?.label || (type === 'row' ? 'Row' : type === 'column' ? 'Column' : type === 'block' ? 'Block' : 'Item');
}

function getNodeSummary(node = {}, children = []) {
    const type = node.type || 'custom';
    const cleanDescription = String(node.description || '').trim();
    const cleanPrice = String(node.price || '').trim();
    const cleanHook = String(node.hook_name || '').trim();
    const cleanMap = String(node.map_query || '').trim();
    const cleanVideo = String(node.video_url || '').trim();
    const cleanLink = String(node.link || '').trim();

    if (cleanPrice && cleanDescription) {
        return `${cleanPrice} · ${cleanDescription}`;
    }
    if (cleanPrice) {
        return cleanPrice;
    }
    if (cleanDescription) {
        return cleanDescription;
    }
    if (cleanHook) {
        return `Hook: ${cleanHook}`;
    }
    if (cleanMap) {
        return cleanMap;
    }
    if (cleanVideo) {
        return type === 'video' ? 'Video source configured' : cleanVideo;
    }
    if (cleanLink && cleanLink !== '#') {
        return cleanLink;
    }
    if (Number(node.entity_id || 0) > 0) {
        return `${getNodeTypeLabel(type)} ID ${node.entity_id}`;
    }
    if (children.length) {
        return `${children.length} nested item${children.length === 1 ? '' : 's'}`;
    }

    return getNodeTypeLabel(type);
}

function normalizeComparableLabel(value) {
    return String(value || '').trim().toLowerCase();
}

const blockComponentDisplayLabels = {
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

function getBlockVariantDisplayLabel(value) {
    const rawVariant = String(value || '').trim().replace(/^component:/i, '');
    const variant = normalizeComponentVariant(rawVariant);

    if (!variant) {
        return '';
    }

    return blockComponentDisplayLabels[variant] || '';
}

function getBlockChildrenDisplayLabel(children = []) {
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

function getBlockComponentDisplayLabel(block = {}) {
    return getBlockVariantDisplayLabel(block.component_variant || '')
        || getBlockChildrenDisplayLabel(block.children || [])
        || 'Block';
}

function isGenericBlockDisplayLabel(value) {
    const normalized = normalizeComparableLabel(value).replace(/\s+/g, ' ');

    return normalized === ''
        || normalized === 'links block'
        || /^(block|blok)\s*\d*$/.test(normalized);
}

function getDefaultBlockDisplayLabel(blockIndex = 0, blockCount = 1) {
    return 'Block';
}

function getBlockHeaderLabel(block = {}, blockIndex = 0, blockCount = 1, parentLabel = '') {
    const label = String(block.label || '').trim();
    const normalizedLabel = normalizeComparableLabel(label);
    const normalizedParent = normalizeComparableLabel(parentLabel);
    const children = Array.isArray(block.children) ? block.children : [];
    const onlyChildLabel = children.length === 1 ? normalizeComparableLabel(children[0]?.label) : '';
    const duplicatesContext = normalizedLabel && (
        normalizedLabel === normalizedParent
        || normalizedLabel === onlyChildLabel
    );

    if (isGenericBlockDisplayLabel(label) || duplicatesContext) {
        return getBlockComponentDisplayLabel(block) || getDefaultBlockDisplayLabel(blockIndex, blockCount);
    }

    return label;
}

function getAdminNodeDisplayLabel(node = {}, blockIndex = 0, blockCount = 1, parentLabel = '') {
    const type = node?.type || 'custom';

    if (type === 'block') {
        return getBlockHeaderLabel(node, blockIndex, blockCount, parentLabel);
    }

    return String(node?.label || '').trim() || getNodeTypeLabel(type);
}

function NodeMiniCard({ node, path, selectedPath, onSelect, onEdit, onDelete, onAddChild, sortScope = '', sortIndex = null, onMove = null, onMoveChild = null }) {
    const selected = pathsEqual(path, selectedPath);
    const type = node.type || 'custom';
    const children = Array.isArray(node.children) ? node.children : [];
    const Icon = type === 'product' || type === 'product_tile'
        ? ShoppingBag
        : type === 'category' || type === 'category_tree'
            ? FolderTree
            : type === 'row'
                ? Layers
            : type === 'banner' || type === 'image'
                ? Image
                : type === 'video'
                    ? Video
                    : type === 'map'
                        ? MapPin
                        : type === 'text'
                            ? FileText
                            : Link2;
    const dragSort = useDragSort();
    const sortable = Boolean(sortScope && Number.isInteger(Number(sortIndex)) && typeof onMove === 'function');
    const summary = getNodeSummary(node, children);
    const displayLabel = getAdminNodeDisplayLabel(node);
    const typeLabel = getAdminNodeTypeDisplayLabel(node, displayLabel);
    const canAddNestedContent = Boolean(onAddChild && canShowNestedAddButton(node, path));

    return (
        <div
            className={[
                'cci-nice-menu-node-mini-card tw-group tw-relative tw-rounded-md tw-border tw-border-solid tw-transition-colors tw-duration-150',
                selected ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-transparent tw-bg-white tw-shadow-sm hover:tw-border-cci-nm-brandBorder',
                sortable ? dragSort.getDragClass(sortScope, Number(sortIndex)) : '',
            ].filter(Boolean).join(' ')}
            {...(sortable ? dragSort.getDragProps(sortScope, Number(sortIndex), onMove) : {})}
        >
            <Button
                variant="unstyled"
                type='button'
                className={['cci-nice-menu-node-mini-main', sortable ? 'cci-nice-menu-state-sortable' : ''].filter(Boolean).join(' ')}
                onClick={() => onSelect(path)}
            >
                {sortable ? <GripVertical aria-hidden='true' className='cci-nice-menu-sort-handle tw-mt-2 tw-h-4 tw-w-4 tw-shrink-0' /> : null}
                <span className='cci-nice-menu-node-mini-icon'>
                    <NodeIconPreview node={node} fallback={Icon} className='tw-h-4 tw-w-4' />
                </span>
                <span className='cci-nice-menu-node-mini-copy'>
                    {typeLabel ? <span className='cci-nice-menu-node-mini-type'>{typeLabel}</span> : null}
                    <strong className='cci-nice-menu-node-mini-title'>
                        {displayLabel}
                    </strong>
                    {summary ? <span className='cci-nice-menu-node-mini-summary'>{summary}</span> : null}
                </span>
            </Button>
            <div className='cci-nice-menu-node-mini-actions' data-no-drag='true'>
                {canAddNestedContent ? (
                    <AddIconButton
                        label={__( 'Add an element inside ', 'cci-nice-menu' ) + displayLabel}
                        onClick={(event) => {
                            event.stopPropagation();
                            onAddChild(path);
                        }}
                    />
                ) : null}
                <Button
                    variant="builder"
                    size='iconXs'
                    type='button'
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(path);
                    }}
                    aria-label={ __( 'Edit item', 'cci-nice-menu' ) }
                >
                    <Pencil aria-hidden='true' />
                </Button>
                <Button
                    variant="danger"
                    size='iconXs'
                    type='button'
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete(path);
                    }}
                    aria-label={ __( 'Delete item', 'cci-nice-menu' ) }
                >
                    <Trash2 aria-hidden='true' />
                </Button>
            </div>
            {children.length ? (
                <div className='cci-nice-menu-node-children tw-mb-2 tw-ml-10 tw-mr-2 tw-grid tw-gap-2 tw-border-0 tw-border-l tw-border-solid tw-border-cci-nm-border tw-pl-3'>
                    {children.map((child, childIndex) => (
                        <NodeMiniCard
                            key={child.id || childIndex}
                            node={child}
                            path={[...path, childIndex]}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            sortScope={path.join('.')}
                            sortIndex={childIndex}
                            onMove={(fromIndex, toIndex) => onMoveChild?.(path, fromIndex, toIndex)}
                            onMoveChild={onMoveChild}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function CatalogResultPicker({ type, items, loading, selectedId = '', onPick }) {
    if (loading) {
        return (
            <div className='tw-grid tw-min-h-36 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4 tw-text-center'>
                <div>
                    <PackageSearch aria-hidden='true' className='tw-mx-auto tw-mb-2 tw-h-6 tw-w-6 tw-animate-pulse tw-text-cci-nm-brand' />
                    <p className='tw-m-0 tw-text-sm tw-text-cci-nm-muted'>{ __( 'Loading suggestions...', 'cci-nice-menu' ) }</p>
                </div>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className='tw-grid tw-min-h-36 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4 tw-text-center'>
                <div>
                    <PackageSearch aria-hidden='true' className='tw-mx-auto tw-mb-2 tw-h-6 tw-w-6 tw-text-cci-nm-muted' />
                    <p className='tw-m-0 tw-text-sm tw-text-cci-nm-muted'>{ __( 'No suggestions yet. Try filtering by name.', 'cci-nice-menu' ) }</p>
                </div>
            </div>
        );
    }

    if (type === 'product' || type === 'product_tile' || type === 'cms_page' || type === 'blog_post') {
        const Icon = type === 'product' || type === 'product_tile' ? ShoppingBag : FileText;

        return (
            <div className='tw-grid tw-max-h-80 tw-gap-2 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-2'>
                {items.map((item) => {
                    const selected = String(item.id) === String(selectedId || '');

                    return (
                        <Button variant="unstyled"
                            key={`${item.type || type}-${item.id}`}
                            type='button'
                            className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)_auto] tw-items-center tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-sm tw-transition-colors hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft ${selected ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white'}`}
                            onClick={() => onPick(item)}
                        >
                            <span className='tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm'>
                                <Icon aria-hidden='true' className='tw-h-4 tw-w-4' />
                            </span>
                            <span className='tw-min-w-0'>
                                <strong className='tw-block tw-truncate tw-text-sm tw-font-semibold tw-text-cci-nm-text'>{item.name}</strong>
                                <span className='tw-block tw-truncate tw-text-xs tw-text-cci-nm-muted'>
                                    {type === 'blog_post'
                                        ? `${Number(item.views || 0)} views${item.reference ? ` · ${item.reference}` : ''}`
                                        : item.price ? `${item.price}${item.reference ? ` · ${item.reference}` : ''}` : item.reference ? `Reference: ${item.reference}` : item.url}
                                </span>
                            </span>
                            <span className='tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-cci-nm-muted'>#{item.id}</span>
                        </Button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className='tw-grid tw-max-h-80 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-1'>
            {items.map((item) => {
                const depth = Math.max(0, Number(item.level || 0) - 2);
                const selected = String(item.id) === String(selectedId || '');
                const productCount = Number(item.product_count || 0);

                return (
                    <Button variant="unstyled"
                        key={`${item.type || 'category'}-${item.id}`}
                        type='button'
                        className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)_auto_auto] tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-px-2 tw-py-2 tw-text-left tw-transition-colors hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft ${selected ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-transparent tw-bg-transparent'}`}
                        style={{ paddingLeft: `${10 + depth * 18}px` }}
                        onClick={() => onPick(item)}
                    >
                        <span className='tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand'>
                            <FolderTree aria-hidden='true' className='tw-h-4 tw-w-4' />
                        </span>
                        <span className='tw-min-w-0'>
                            <strong className='tw-block tw-truncate tw-text-sm tw-font-semibold tw-text-cci-nm-text'>{item.name}</strong>
                            <span className='tw-block tw-truncate tw-text-xs tw-text-cci-nm-muted'>{item.url}</span>
                        </span>
                        <span className={`tw-rounded-full tw-border tw-border-solid tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold ${productCount > 0 ? 'tw-border-emerald-100 tw-bg-emerald-50 tw-text-emerald-700' : 'tw-border-slate-200 tw-bg-slate-50 tw-text-slate-500'}`}>
                            { __( 'Products: %count%', 'cci-nice-menu' ).replace( '%count%', String( productCount ) ) }
                        </span>
                        <span className='tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold tw-text-cci-nm-muted'>#{item.id}</span>
                    </Button>
                );
            })}
        </div>
    );
}

function reorderItems(items = [], fromIndex, toIndex) {
    if (!Array.isArray(items) || fromIndex === toIndex) {
        return items;
    }

    const nextItems = [...items];
    const [moved] = nextItems.splice(fromIndex, 1);

    if (!moved) {
        return items;
    }

    nextItems.splice(toIndex, 0, moved);
    return nextItems;
}

function remapMovedIndex(index, fromIndex, toIndex) {
    if (index === fromIndex) {
        return toIndex;
    }

    if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
        return index - 1;
    }

    if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
        return index + 1;
    }

    return index;
}


const SORT_MIME_TYPE = 'application/x-cci-nice-menu-sort';
let activeSortPayload = null;

function normalizeSortScope(scope) {
    return Array.isArray(scope) ? scope.join('.') : String(scope || '');
}

function beginSortDrag(event, scope, index) {
    const payload = { scope: normalizeSortScope(scope), index: Number(index) };
    activeSortPayload = payload;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(SORT_MIME_TYPE, JSON.stringify(payload));
    event.dataTransfer.setData('text/plain', payload.scope + ':' + payload.index);
    return payload;
}

function readSortPayload(event, scope) {
    const normalizedScope = normalizeSortScope(scope);

    if (activeSortPayload && activeSortPayload.scope === normalizedScope) {
        return activeSortPayload;
    }

    try {
        const payload = JSON.parse(event.dataTransfer.getData(SORT_MIME_TYPE) || '{}');
        return payload.scope === normalizedScope && Number.isInteger(Number(payload.index))
            ? { scope: payload.scope, index: Number(payload.index) }
            : null;
    } catch (error) {
        return null;
    }
}

function useDragSort() {
    const [state, setState] = React.useState({ scope: '', index: null, overScope: '', overIndex: null });

    const clear = React.useCallback(() => {
        activeSortPayload = null;
        setState({ scope: '', index: null, overScope: '', overIndex: null });
    }, []);

    const getDragClass = React.useCallback((scope, index) => {
        const normalizedScope = normalizeSortScope(scope);
        return [
            'cci-nice-menu-sortable',
            state.scope === normalizedScope && state.index === index ? 'cci-nice-menu-state-dragging' : '',
            state.overScope === normalizedScope && state.overIndex === index ? 'cci-nice-menu-state-drag-over' : '',
        ].filter(Boolean).join(' ');
    }, [state]);

    const getDragProps = React.useCallback((scope, index, onMove, options = {}) => {
        const normalizedScope = normalizeSortScope(scope);
        const disabled = options.disabled || !normalizedScope || typeof onMove !== 'function' || !Number.isInteger(Number(index));

        if (disabled) {
            return {};
        }

        return {
            draggable: true,
            onDragStart: (event) => {
                const target = event.target;
                const isInteractive = target?.closest?.('[data-no-drag="true"], button, a, input, select, textarea, label');

                if (isInteractive && !target?.closest?.('.cci-nice-menu-sort-handle, .cci-nice-menu-menu-item-grip')) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }

                beginSortDrag(event, normalizedScope, Number(index));
                setState({ scope: normalizedScope, index: Number(index), overScope: '', overIndex: null });
            },
            onDragOver: (event) => {
                const payload = readSortPayload(event, normalizedScope);

                if (!payload || payload.index === Number(index)) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = 'move';
                setState((current) => ({ ...current, overScope: normalizedScope, overIndex: Number(index) }));
            },
            onDragLeave: (event) => {
                if (event.currentTarget.contains(event.relatedTarget)) {
                    return;
                }

                setState((current) => (
                    current.overScope === normalizedScope && current.overIndex === Number(index)
                        ? { ...current, overScope: '', overIndex: null }
                        : current
                ));
            },
            onDrop: (event) => {
                const payload = readSortPayload(event, normalizedScope);

                if (!payload) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                if (payload.index !== Number(index)) {
                    onMove(payload.index, Number(index));
                }

                clear();
            },
            onDragEnd: clear,
        };
    }, [clear]);

    return { getDragClass, getDragProps };
}

function remapPathAfterMove(path = [], parentPath = [], fromIndex, toIndex) {
    if (!Array.isArray(path) || !Array.isArray(parentPath) || path.length <= parentPath.length) {
        return path;
    }

    if (!pathsEqual(path.slice(0, parentPath.length), parentPath)) {
        return path;
    }

    return [
        ...parentPath,
        remapMovedIndex(path[parentPath.length], fromIndex, toIndex),
        ...path.slice(parentPath.length + 1),
    ];
}

function TopLevelLayoutPanel({ tree = [], entries = [], activeIndex, selectedPath, settings = {}, onSettingsChange = () => {}, onActivate, onSelect, onEdit, onDelete, onAddRow, onAddColumn, onAddItemToColumn, onAddHookToColumn, onMoveChild }) {
    const dragSort = useDragSort();
    const canvasWidth = getEditorCanvasWidth(settings);
    const itemGap = Math.max(0, Math.min(30, Number(settings.item_gap || 8)));

    const activateEntry = (path) => {
        const nextIndex = findTopMenuEntryIndexByPath(entries, path);
        onActivate(nextIndex);
        onSelect(path);
    };
    const layoutRows = tree
        .map((node, index) => ({ node, index }))
        .filter(({ node }) => node?.type === 'row' || node?.type === 'column')
        .slice(0, 1);
    const primaryLayout = layoutRows[0] || null;
    const primaryRowPath = primaryLayout ? [primaryLayout.index] : null;
    const canAddColumnToPrimaryRow = primaryLayout?.node?.type === 'row';

    return (
        <section className='cci-nice-menu-menu-items-section cci-nice-menu-top-navigation-section' aria-label={ __( 'Top-level menu layout', 'cci-nice-menu' ) }>
            <div className='cci-nice-menu-menu-items-header'>
                <div className='tw-min-w-0'>
                    <h3 className='cci-nice-menu-menu-items-title'>{__('Header navigation bar', 'cci-nice-menu')}</h3>
                    <p className='cci-nice-menu-menu-items-description'>{__('Build the first storefront navigation row with columns, links and native hooks.', 'cci-nice-menu')}</p>
                    <div className='cci-nice-menu-storefront-meta'>
                        <span>{canvasWidth}px bar</span>
                        <span>{__('12-column grid', 'cci-nice-menu')}</span>
                        <span>{itemGap}px {__('item gap', 'cci-nice-menu')}</span>
                    </div>
                </div>
                <Button
                    variant='add'
                    size='sm'
                    type='button'
                    onClick={() => (canAddColumnToPrimaryRow ? onAddColumn(primaryRowPath) : onAddRow())}
                >
                    <Plus aria-hidden='true' />
                    {canAddColumnToPrimaryRow ? __( 'Add column', 'cci-nice-menu' ) : __( 'Create layout', 'cci-nice-menu' )}
                </Button>
            </div>

            <div className='cci-nice-menu-top-layout-controls'>
                <Field label={__('Item gap', 'cci-nice-menu')}>
                    <NumberInputWithUnit
                        value={itemGap}
                        unit='px'
                        onChange={(value) => onSettingsChange({ item_gap: Math.max(0, Math.min(30, Number(value || 0))) })}
                    />
                </Field>
            </div>

            <div className='cci-nice-menu-menu-items-body tw-grid tw-gap-3'>
                {layoutRows.length ? layoutRows.map(({ node: rowNode, index: rowIndex }) => {
                    const rowPath = [rowIndex];
                    const isRow = rowNode?.type === 'row';
                    const columns = isRow
                        ? (rowNode.children || []).map((node, index) => ({ node, index })).filter((entry) => entry.node?.type === 'column')
                        : rowNode?.type === 'column'
                            ? [{ node: rowNode, index: rowIndex, rootColumn: true }]
                            : [];

                    if (!isRow && rowNode?.type !== 'column') {
                        const entryIndex = findTopMenuEntryIndexByPath(entries, rowPath);
                        const active = entryIndex === activeIndex;
                        const selected = pathsEqual(rowPath, selectedPath);

                        return (
                            <div key={rowNode.id || rowIndex} className={['cci-nice-menu-menu-item-pill', active ? 'cci-nice-menu-state-active' : '', selected ? 'cci-nice-menu-state-selected' : ''].filter(Boolean).join(' ')}>
                                <button type='button' className='cci-nice-menu-menu-item-main' onClick={() => activateEntry(rowPath)}>
                                    <GripVertical aria-hidden='true' className='cci-nice-menu-menu-item-grip' />
                                    <span className='cci-nice-menu-menu-item-label'>{rowNode.label || `Menu item ${rowIndex + 1}`}</span>
                                </button>
                                <div className='cci-nice-menu-menu-item-actions'>
                                    <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(rowPath)} aria-label={ __( 'Edit top menu item', 'cci-nice-menu' ) }>
                                        <Pencil aria-hidden='true' />
                                    </Button>
                                    <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(rowPath)} aria-label={ __( 'Delete top menu item', 'cci-nice-menu' ) }>
                                        <Trash2 aria-hidden='true' />
                                    </Button>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <StorefrontEditorFrame key={rowNode.id || rowIndex} width={canvasWidth} className='cci-nice-menu-storefront-scroll-top-navigation' bodyClassName='cci-nice-menu-storefront-grid-top-navigation'>
                            <div className='cci-nice-menu-mm-card cci-nice-menu-mm-top-row-card tw-rounded-md'>
                                <div className='cci-nice-menu-mm-row-body'>
                                    <div className='cci-nice-menu-mm-row-grid'>
                                        {columns.map(({ node: column, index, rootColumn }) => {
                                            const columnPath = rootColumn ? [index] : [...rowPath, index];
                                            const columnItems = (column.children || []).map((item, itemIndex) => ({ item, itemIndex })).filter(({ item }) => !isTopNavigationStructureNode(item));
                                            const columnSelected = pathsEqual(columnPath, selectedPath);

                                            return (
                                                <div key={column.id || index} className={['cci-nice-menu-mm-column-card tw-rounded-md tw-border tw-border-solid', getColumnWidthStateClass(column), columnSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(rowPath.join('.'), index)].filter(Boolean).join(' ')} style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }} {...(!rootColumn ? dragSort.getDragProps(rowPath.join('.'), index, (fromIndex, toIndex) => onMoveChild?.(rowPath, fromIndex, toIndex)) : {})}>
                                                    <div className='cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                                        <Button variant='unstyled' type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(columnPath)}>
                                                            <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                            <span className='tw-truncate'>{column.label || `Column ${index + 1}`}</span>
                                                            <ColumnDimensionBadge column={column} canvasWidth={canvasWidth} />
                                                        </Button>
                                                        <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                            <AddDropdown
                                                                label='Add'
                                                                compact
                                                                actions={[
                                                                    { label: __( 'Menu item', 'cci-nice-menu' ), icon: Plus, onClick: () => onAddItemToColumn(columnPath) },
                                                                    { label: __( 'Hook block', 'cci-nice-menu' ), icon: Layers, onClick: () => onAddHookToColumn(columnPath) },
                                                                ]}
                                                            />
                                                            <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(columnPath)} aria-label={ __( 'Edit column', 'cci-nice-menu' ) }>
                                                                <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                            </Button>
                                                            <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(columnPath)} aria-label={ __( 'Delete column', 'cci-nice-menu' ) }>
                                                                <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className='tw-grid tw-gap-2 tw-bg-white tw-p-3'>
                                                        {columnItems.length ? columnItems.map(({ item, itemIndex }) => {
                                                            const itemPath = [...columnPath, itemIndex];
                                                            const entryIndex = findTopMenuEntryIndexByPath(entries, itemPath);
                                                            const active = entryIndex === activeIndex;
                                                            const selected = pathsEqual(itemPath, selectedPath);

                                                            return (
                                                                <div key={item.id || itemIndex} className={['cci-nice-menu-menu-item-pill', active ? 'cci-nice-menu-state-active' : '', selected ? 'cci-nice-menu-state-selected' : '', dragSort.getDragClass(columnPath.join('.'), itemIndex)].filter(Boolean).join(' ')} {...dragSort.getDragProps(columnPath.join('.'), itemIndex, (fromIndex, toIndex) => onMoveChild?.(columnPath, fromIndex, toIndex))}>
                                                                    <button type='button' className='cci-nice-menu-menu-item-main' onClick={() => activateEntry(itemPath)}>
                                                                        <GripVertical aria-hidden='true' className='cci-nice-menu-menu-item-grip' />
                                                                        <span className='cci-nice-menu-menu-item-label'>{item.label || `Menu item ${itemIndex + 1}`}</span>
                                                                    </button>
                                                                    <div className='cci-nice-menu-menu-item-actions' data-no-drag='true'>
                                                                        <Button variant='builder' size='iconXs' type='button' onClick={() => {
                                                                            activateEntry(itemPath);
                                                                            onEdit(itemPath);
                                                                        }} aria-label={ __( 'Edit menu item', 'cci-nice-menu' ) }>
                                                                            <Pencil aria-hidden='true' />
                                                                        </Button>
                                                                        <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(itemPath)} aria-label={ __( 'Delete menu item', 'cci-nice-menu' ) }>
                                                                            <Trash2 aria-hidden='true' />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }) : (
                                                            <Button variant='unstyled' type='button' className='tw-flex tw-min-h-14 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddItemToColumn(columnPath)}>
                                                                <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                                { __( 'Add first link', 'cci-nice-menu' ) }
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </StorefrontEditorFrame>
                    );
                }) : (
                    <div className='tw-grid tw-min-h-28 tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-white tw-p-6 tw-text-center'>
                        <Button variant='add' type='button' onClick={onAddRow}>
                            <Plus aria-hidden='true' />
                            { __( 'Create top navigation layout', 'cci-nice-menu' ) }
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}

function getManualFlyoutModel(activeTop, activeTopIndex, selectedPath = []) {
    const topChildren = activeTop?.children || [];
    const tabsEntry = topChildren
        .map((node, index) => ({ node, index }))
        .find((entry) => isTabsColumn(entry.node));

    if (!tabsEntry) {
        return null;
    }

    const tabsBlocks = tabsEntry.node.children || [];
    const tabsBlockEntry = tabsBlocks
        .map((node, index) => ({ node, index }))
        .find((entry) => entry.node.type === 'block');

    if (!tabsBlockEntry) {
        return null;
    }

    const tabsBlockPath = [activeTopIndex, tabsEntry.index, tabsBlockEntry.index];
    const allEntries = (tabsBlockEntry.node.children || []).map((node, index) => ({ node, index }));
    const mainEntries = allEntries.filter((entry) => !isTabsSupportNode(entry.node));
    const supportEntries = allEntries.filter((entry) => isTabsSupportNode(entry.node));
    const selectedMainIndex = selectedPath[0] === activeTopIndex
        && selectedPath[1] === tabsEntry.index
        && selectedPath[2] === tabsBlockEntry.index
        && typeof selectedPath[3] === 'number'
        ? selectedPath[3]
        : null;
    const activeMainEntry = mainEntries.find((entry) => entry.index === selectedMainIndex) || mainEntries[0] || null;
    const activeMainPath = activeMainEntry ? [...tabsBlockPath, activeMainEntry.index] : null;

    return {
        railPath: [activeTopIndex, tabsEntry.index],
        railBlockPath: tabsBlockPath,
        tabsPath: [activeTopIndex, tabsEntry.index],
        tabsBlockPath,
        tabsOrientation: normalizeTabsOrientation(tabsEntry.node.tabs_orientation || 'vertical'),
        mainEntries,
        supportEntries,
        activeMainEntry,
        activeMainPath,
    };
}

const EDITOR_GRID_COLUMNS = 12;
const EDITOR_GRID_GAP = 16;

function clampGridSpan(value, fallback = 4) {
    const span = Number(value || fallback);

    return Math.max(1, Math.min(EDITOR_GRID_COLUMNS, Number.isFinite(span) ? span : fallback));
}

function getColumnWidthStateClass(column, fallback = 4) {
    return clampGridSpan(column?.column_span, fallback) <= 2 ? 'cci-nice-menu-mm-column-card-narrow' : '';
}

function getEditorCanvasWidth(settings = {}) {
    const configuredWidth = Number(settings.container_width || 0);
    const fallback = settings.container_mode === 'compact' ? 1180 : 1440;
    const width = configuredWidth > 0 ? configuredWidth : fallback;

    return Math.max(960, Math.min(1920, Math.round(width)));
}

function getColumnPixelWidth(span, canvasWidth) {
    const safeSpan = clampGridSpan(span);
    const safeWidth = Math.max(960, Number(canvasWidth || 1440));
    const totalGap = EDITOR_GRID_GAP * (EDITOR_GRID_COLUMNS - 1);
    const trackWidth = (safeWidth - totalGap) / EDITOR_GRID_COLUMNS;

    return Math.max(80, Math.round((trackWidth * safeSpan) + (EDITOR_GRID_GAP * (safeSpan - 1))));
}

function ColumnDimensionBadge({ column, canvasWidth, fallback = 4 }) {
    const span = clampGridSpan(column?.column_span, fallback);

    return (
        <span className='cci-nice-menu-mm-column-size' title={`Column width: ${span} of ${EDITOR_GRID_COLUMNS}`}>
            <span>{span}/{EDITOR_GRID_COLUMNS}</span>
            <em>~{getColumnPixelWidth(span, canvasWidth)}px</em>
        </span>
    );
}

function GridRuler({ width }) {
    return (
        <div className='cci-nice-menu-storefront-ruler' aria-label={`12 column grid, ${width}px canvas`}>
            {Array.from({ length: EDITOR_GRID_COLUMNS }).map((_, index) => (
                <span key={index}>{index + 1}</span>
            ))}
        </div>
    );
}

function StorefrontEditorFrame({ width, children, className = '', bodyClassName = '', mirrorScrollbar = false }) {
    const mirrorScrollRef = React.useRef(null);
    const contentScrollRef = React.useRef(null);
    const syncingScrollRef = React.useRef(false);
    const [mirrorWidth, setMirrorWidth] = React.useState(() => Math.max(960, Number(width || 0)));
    const [showMirrorScrollbar, setShowMirrorScrollbar] = React.useState(false);

    const syncHorizontalScroll = React.useCallback((source, target) => {
        if (!source || !target || syncingScrollRef.current) {
            return;
        }

        syncingScrollRef.current = true;
        target.scrollLeft = source.scrollLeft;
        window.requestAnimationFrame(() => {
            syncingScrollRef.current = false;
        });
    }, []);

    React.useEffect(() => {
        const contentScroll = contentScrollRef.current;

        if (!contentScroll || !mirrorScrollbar) {
            return undefined;
        }

        let frameId = 0;
        const measure = () => {
            setMirrorWidth(Math.max(Number(width || 0), contentScroll.scrollWidth));
            setShowMirrorScrollbar(contentScroll.scrollWidth > contentScroll.clientWidth + 1);
            if (mirrorScrollRef.current) {
                mirrorScrollRef.current.scrollLeft = contentScroll.scrollLeft;
            }
        };
        const scheduleMeasure = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(measure);
        };

        scheduleMeasure();
        window.addEventListener('resize', scheduleMeasure);

        let observer = null;
        if (typeof window.ResizeObserver !== 'undefined') {
            observer = new window.ResizeObserver(scheduleMeasure);
            observer.observe(contentScroll);
            if (contentScroll.firstElementChild) {
                observer.observe(contentScroll.firstElementChild);
            }
        }

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', scheduleMeasure);
            observer?.disconnect();
        };
    }, [mirrorScrollbar, width]);

    return (
        <div className='cci-nice-menu-storefront-frame'>
            {mirrorScrollbar && showMirrorScrollbar ? (
                <div
                    ref={mirrorScrollRef}
                    className='cci-nice-menu-storefront-scroll-x'
                    data-no-drag='true'
                    aria-label={ __( 'Horizontal editor scroll', 'cci-nice-menu' ) }
                    onScroll={() => syncHorizontalScroll(mirrorScrollRef.current, contentScrollRef.current)}
                >
                    <div className='cci-nice-menu-storefront-scroll-x-inner' style={{ width: `${mirrorWidth}px` }} />
                </div>
            ) : null}
            <div
                ref={contentScrollRef}
                className={['cci-nice-menu-storefront-scroll', className].filter(Boolean).join(' ')}
                onScroll={() => syncHorizontalScroll(contentScrollRef.current, mirrorScrollRef.current)}
            >
                <div className='cci-nice-menu-storefront-stage' style={{ width: `${width}px` }}>
                    <GridRuler width={width} />
                    <div className={['cci-nice-menu-storefront-grid', bodyClassName].filter(Boolean).join(' ')}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabsSupportList({ entries = [], parentPath = [], selectedPath = [], onSelect, onEdit, onDelete, onAddBlock }) {
    return (
        <div className='cci-nice-menu-tabs-support' data-no-drag='true'>
            <div className='cci-nice-menu-tabs-support-header'>
                <span>{ __( 'Below tabs', 'cci-nice-menu' ) }</span>
                <div className='cci-nice-menu-tabs-support-header-actions'>
                    <strong>{entries.length}</strong>
                    <AddIconButton label='Add block below tabs' onClick={() => onAddBlock?.(parentPath)} />
                </div>
            </div>
            <div className='cci-nice-menu-tabs-support-list'>
	                {entries.length ? entries.map(({ node, index }) => {
	                    const path = [...parentPath, index];
	                    const selected = pathsEqual(path, selectedPath);
	                    const displayLabel = getAdminNodeDisplayLabel(node);
	                    const supportTypeLabel = getAdminNodeTypeDisplayLabel(node, displayLabel);

	                    return (
	                        <div key={node.id || index} className={['cci-nice-menu-tabs-support-item', selected ? 'cci-nice-menu-state-selected' : ''].filter(Boolean).join(' ')}>
	                            <Button variant='unstyled' type='button' className='cci-nice-menu-tabs-support-button' onClick={() => onSelect(path)}>
	                                <NodeIconPreview node={node} fallback={Boxes} className='tw-h-4 tw-w-4' />
	                                <span className='cci-nice-menu-tabs-support-copy'>
	                                    <strong>{displayLabel}</strong>
	                                    {supportTypeLabel ? <small>{supportTypeLabel}</small> : null}
	                                </span>
	                            </Button>
                            <div className='cci-nice-menu-tabs-support-actions'>
                                <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(path)} aria-label={ __( 'Edit below-tabs block', 'cci-nice-menu' ) }>
                                    <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                </Button>
                                <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(path)} aria-label={ __( 'Delete below-tabs block', 'cci-nice-menu' ) }>
                                    <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                </Button>
                            </div>
                        </div>
                    );
                }) : (
                    <Button variant='unstyled' type='button' className='cci-nice-menu-tabs-support-empty' onClick={() => onAddBlock?.(parentPath)}>
                        <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                        { __( 'Add block below tabs', 'cci-nice-menu' ) }
                    </Button>
                )}
            </div>
        </div>
    );
}

function ManualFlyoutCanvas({ activeTop, activeTopIndex, selectedPath, model, onSelect, onEdit, onDelete, onAddColumn, onAddBlock, onAddContent, onAddBelowTabsBlock, onAddChild, onMoveChild, settings = {} }) {
    const activeMain = model.activeMainEntry?.node || null;
    const activeMainPath = model.activeMainPath;
    const tabsOrientation = model.tabsOrientation || 'vertical';
    const isHorizontalTabs = tabsOrientation === 'horizontal';
    const layoutEntries = activeMain
        ? (activeMain.children || []).map((node, index) => ({ node, index })).filter((entry) => isLayoutEntry(entry.node))
        : [];
    const looseEntries = activeMain
        ? (activeMain.children || []).map((node, index) => ({ node, index })).filter((entry) => !isLayoutEntry(entry.node))
        : [];
    const dragSort = useDragSort();
    const canvasWidth = getEditorCanvasWidth(settings);

    return (
        <section className='tw-min-w-0 tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white'>
            <div className='cci-nice-menu-tabs-content-header'>
                <div className='tw-min-w-0'>
                    <strong className='tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand'>
                        <FolderTree aria-hidden='true' />
                        { __( 'Mega menu tabs', 'cci-nice-menu' ) }
                    </strong>
                    <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                        { __( 'Build the catalog like in the shop: tabs control which columns and blocks are visible.', 'cci-nice-menu' ) }
                    </p>
                </div>
                <AddIconButton label='Add tab' size='iconSm' onClick={() => onAddContent(model.railBlockPath)} />
            </div>

            <div className={`cci-nice-menu-tabs-workspace ${isHorizontalTabs ? 'cci-nice-menu-tabs-workspace-horizontal' : 'cci-nice-menu-tabs-workspace-vertical'} tw-grid tw-min-h-[560px]`}>
                <aside className={`cci-nice-menu-tabs-rail ${isHorizontalTabs ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical'}`}>
                    <div className='cci-nice-menu-tabs-rail-header'>
                        <div className='tw-min-w-0'>
                            <strong>{ __( 'Tabs', 'cci-nice-menu' ) }</strong>
                            <p>{ __( 'Visible under', 'cci-nice-menu' ) } {activeTop?.label || __( 'the top menu item', 'cci-nice-menu' )}.</p>
                        </div>
                        <Button variant='builder' size='sm' type='button' className='tw-shrink-0' onClick={() => onEdit(model.railPath)}>
                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                            { __( 'Edit tabs', 'cci-nice-menu' ) }
                        </Button>
                    </div>
                    <div className={isHorizontalTabs ? 'cci-nice-menu-tabs-list cci-nice-menu-state-horizontal' : 'cci-nice-menu-tabs-list cci-nice-menu-state-vertical'}>
                        {model.mainEntries.length ? model.mainEntries.map(({ node, index }) => {
                            const itemPath = [...model.railBlockPath, index];
                            const active = activeMainPath && pathsEqual(itemPath, activeMainPath);

                            return (
                                <div key={node.id || index} className={['cci-nice-menu-tabs-list-item', isHorizontalTabs ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical', active ? 'cci-nice-menu-state-active cci-nice-menu-mm-tab-active' : '', dragSort.getDragClass((model.railBlockPath || []).join('.'), index)].filter(Boolean).join(' ')} {...dragSort.getDragProps((model.railBlockPath || []).join('.'), index, (fromIndex, toIndex) => onMoveChild?.(model.railBlockPath, fromIndex, toIndex))}>
                                    <Button variant="unstyled" type='button' className='cci-nice-menu-tabs-list-button' onClick={() => onSelect(itemPath)}>
                                        <strong className='cci-nice-menu-tabs-list-label'>{node.label || `Item ${index + 1}`}</strong>
                                        <span className='cci-nice-menu-tabs-list-count'>{countLayoutChildren(node.children)}</span>
                                    </Button>
                                    <div className='tw-flex tw-pr-2' data-no-drag='true'>
                                        <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(itemPath)} aria-label={ __( 'Edit left item', 'cci-nice-menu' ) }>
                                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                        </Button>
                                        <Button variant='danger' size='iconXs' type='button' className='tw-ml-1' onClick={() => onDelete(itemPath)} aria-label={ __( 'Delete left item', 'cci-nice-menu' ) }>
                                            <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                        </Button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <Button variant="unstyled" type='button' className='tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(model.railBlockPath)}>
                                <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                { __( 'Add first tab', 'cci-nice-menu' ) }
                            </Button>
                        )}
                    </div>
                    <TabsSupportList
                        entries={model.supportEntries || []}
                        parentPath={model.railBlockPath}
                        selectedPath={selectedPath}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddBlock={onAddBelowTabsBlock}
                    />
                </aside>

                <div className='cci-nice-menu-tabs-content-panel'>
                    <div className='tw-flex tw-items-start tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-4 tw-py-4'>
                        <div className='tw-min-w-0'>
                            <strong className='tw-block tw-truncate tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>
                                {activeMain ? activeMain.label : __( 'Select a left item', 'cci-nice-menu' )}
                            </strong>
                            <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                { __( 'Columns and blocks shown here open when this tab is hovered.', 'cci-nice-menu' ) }
                            </p>
                        </div>
                        {activeMainPath ? (
                            <AddDropdown
                                label='Add'
                                compact
                                actions={[
                                    { label: __( 'Add column', 'cci-nice-menu' ), icon: Columns3, onClick: () => onAddColumn(activeMainPath) },
                                    { label: __( 'Add child', 'cci-nice-menu' ), icon: Plus, onClick: () => onAddContent(activeMainPath) },
                                ]}
                            />
                        ) : null}
                    </div>

                    <div className='cci-nice-menu-tabs-content-body tw-min-h-[460px]'>
                        {activeMainPath && layoutEntries.length ? (
                            <StorefrontEditorFrame width={canvasWidth} className='cci-nice-menu-storefront-scroll-tabs' mirrorScrollbar>
                                {layoutEntries.map(({ node: layoutNode, index }) => {
                                    const layoutPath = [...activeMainPath, index];

                                    if (isRowWrapper(layoutNode)) {
                                        return (
                                            <RowCard
                                                key={layoutNode.id || index}
                                                row={layoutNode}
                                                rowPath={layoutPath}
                                                selectedPath={selectedPath}
                                                onSelect={onSelect}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onAddColumn={onAddColumn}
                                                onAddBlock={onAddBlock}
                                                onAddContent={onAddContent}
                                                onAddChild={onAddChild}
                                                onMoveChild={onMoveChild}
                                                canvasWidth={canvasWidth}
                                            />
                                        );
                                    }

                                    const column = layoutNode;
                                    const columnPath = layoutPath;
                                    const blocks = column.children || [];
                                    const selected = pathsEqual(columnPath, selectedPath);

                                    return (
                                        <div
                                            key={column.id || index}
                                            className={['cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-bg-white tw-shadow-sm', getColumnWidthStateClass(column), selected ? 'tw-border-cci-nm-brandBorder tw-ring-2 tw-ring-cci-nm-brand/10' : 'tw-border-transparent', dragSort.getDragClass((activeMainPath || []).join('.'), index)].filter(Boolean).join(' ')}
                                            style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }}
                                            {...dragSort.getDragProps((activeMainPath || []).join('.'), index, (fromIndex, toIndex) => onMoveChild?.(activeMainPath, fromIndex, toIndex))}
                                        >
                                            <div className='cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-3 tw-py-2.5'>
                                                <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(columnPath)}>
                                                    <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                    <span className='tw-truncate'>{column.label || `Column ${index + 1}`}</span>
                                                    <ColumnDimensionBadge column={column} canvasWidth={canvasWidth} />
                                                </Button>
                                                <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                    <AddIconButton label='Add block' onClick={() => onAddBlock(columnPath)} />
                                                    <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(columnPath)} aria-label={ __( 'Edit column', 'cci-nice-menu' ) }>
                                                        <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                    </Button>
                                                    <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(columnPath)} aria-label={ __( 'Delete column', 'cci-nice-menu' ) }>
                                                        <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className='tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3'>
                                                {blocks.length ? blocks.map((block, blockIndex) => {
                                                    const blockPath = [...columnPath, blockIndex];

                                                    return (
                                                        <div key={block.id || blockIndex} className={['cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-transparent tw-bg-white tw-shadow-sm', isImplicitLinksBlock(block) ? 'cci-nice-menu-mm-block-card-implicit' : '', dragSort.getDragClass(columnPath.join('.'), blockIndex)].filter(Boolean).join(' ')} {...dragSort.getDragProps(columnPath.join('.'), blockIndex, (fromIndex, toIndex) => onMoveChild?.(columnPath, fromIndex, toIndex))}>
                                                            <div className='cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-3 tw-py-2.5'>
                                                                <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(blockPath)}>
                                                                    <Boxes aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                                    <span className='tw-truncate'>{getBlockHeaderLabel(block, blockIndex, blocks.length, column.label)}</span>
                                                                </Button>
                                                                <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                                    <AddIconButton label='Add content' onClick={() => onAddContent(blockPath)} />
                                                                    <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(blockPath)} aria-label={ __( 'Edit block', 'cci-nice-menu' ) }>
                                                                        <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                    </Button>
                                                                    <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(blockPath)} aria-label={ __( 'Delete block', 'cci-nice-menu' ) }>
                                                                        <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className='tw-grid tw-gap-2 tw-bg-white tw-p-3'>
                                                                {(block.children || []).length ? block.children.map((item, itemIndex) => (
                                                                    <NodeMiniCard key={item.id || itemIndex} node={item} path={[...blockPath, itemIndex]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={blockPath.join('.')} sortIndex={itemIndex} onMove={(fromIndex, toIndex) => onMoveChild?.(blockPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                                                                )) : (
                                                                    <Button variant="unstyled" type='button' className='tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(blockPath)}>
                                                                        <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                                        { __( 'Add content', 'cci-nice-menu' ) }
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <Button variant="unstyled" type='button' className='tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddBlock(columnPath)}>
                                                        <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                        { __( 'Add block', 'cci-nice-menu' ) }
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </StorefrontEditorFrame>
                        ) : activeMainPath ? (
                            <div className='tw-grid tw-min-h-[360px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-8 tw-text-center'>
                                <div className='tw-max-w-md'>
                                    <Columns3 aria-hidden='true' className='tw-mx-auto tw-mb-3 tw-h-8 tw-w-8 tw-text-cci-nm-brand' />
                                    <h3 className='tw-m-0 tw-text-lg tw-font-semibold tw-text-cci-nm-text'>{ __( 'No columns for this item yet', 'cci-nice-menu' ) }</h3>
                                    <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Add columns to build the submenu content for this tab.', 'cci-nice-menu' ) }</p>
                                    <Button className='tw-mt-4' variant='add' size='sm' type='button' onClick={() => onAddColumn(activeMainPath)}>
                                        <Plus aria-hidden='true' />
                                        { __( 'Add first column', 'cci-nice-menu' ) }
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className='tw-grid tw-min-h-[360px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-8 tw-text-center'>
                                <Button variant='add' size='sm' type='button' onClick={() => onAddContent(model.railBlockPath)}>
                                    <Plus aria-hidden='true' />
                                    { __( 'Add first tab', 'cci-nice-menu' ) }
                                </Button>
                            </div>
                        )}

                        {looseEntries.length && activeMainPath ? (
                            <div className='tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3'>
                                <strong className='tw-text-sm tw-font-semibold tw-text-amber-900'>{ __( 'Direct children outside columns', 'cci-nice-menu' ) }</strong>
                                <div className='tw-mt-2 tw-grid tw-gap-2'>
                                    {looseEntries.map(({ node, index }) => (
                                        <NodeMiniCard key={node.id || index} node={node} path={[...activeMainPath, index]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={(activeMainPath || []).join('.')} sortIndex={index} onMove={(fromIndex, toIndex) => onMoveChild?.(activeMainPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

function getTabsGroupModelFromColumn(activeTopPath = [], columnIndex, column, selectedPath = []) {
    const blockEntry = (column.children || [])
        .map((node, index) => ({ node, index }))
        .find((entry) => entry.node.type === 'block');

    if (!blockEntry) {
        return {
            tabsPath: [...activeTopPath, columnIndex],
            tabsBlockPath: null,
            tabEntries: [],
            supportEntries: [],
            activeTabEntry: null,
            activeTabPath: null,
            tabsOrientation: normalizeTabsOrientation(column.tabs_orientation || 'vertical'),
        };
    }

    const tabsBlockPath = [...activeTopPath, columnIndex, blockEntry.index];
    const allEntries = (blockEntry.node.children || []).map((node, index) => ({ node, index }));
    const tabEntries = allEntries.filter((entry) => !isTabsSupportNode(entry.node));
    const supportEntries = allEntries.filter((entry) => isTabsSupportNode(entry.node));
    const selectedTabIndex = pathStartsWith(selectedPath, tabsBlockPath)
        && typeof selectedPath[tabsBlockPath.length] === 'number'
        ? selectedPath[tabsBlockPath.length]
        : null;
    const activeTabEntry = tabEntries.find((entry) => entry.index === selectedTabIndex) || tabEntries[0] || null;
    const activeTabPath = activeTabEntry ? [...tabsBlockPath, activeTabEntry.index] : null;

    return {
        tabsPath: [...activeTopPath, columnIndex],
        tabsBlockPath,
        tabEntries,
        supportEntries,
        activeTabEntry,
        activeTabPath,
        tabsOrientation: normalizeTabsOrientation(column.tabs_orientation || 'vertical'),
    };
}

function TabsGroupCard({ column, columnPath, model, selectedPath, onSelect, onEdit, onDelete, onAddColumn, onAddBlock, onAddContent, onAddBelowTabsBlock, onAddChild, onMoveChild, canvasWidth = 1440 }) {
    const activeTab = model.activeTabEntry?.node || null;
    const activeTabPath = model.activeTabPath;
    const isHorizontal = model.tabsOrientation === 'horizontal';
    const tabLayoutEntries = activeTab
        ? (activeTab.children || []).map((node, index) => ({ node, index })).filter((entry) => isLayoutEntry(entry.node))
        : [];
    const looseEntries = activeTab
        ? (activeTab.children || []).map((node, index) => ({ node, index })).filter((entry) => !isLayoutEntry(entry.node))
        : [];
    const dragSort = useDragSort();
    const columnSortScope = columnPath.slice(0, -1).join('.');
    const columnSortIndex = columnPath[columnPath.length - 1];
    const tabFrameWidth = Math.max(960, getColumnPixelWidth(clampGridSpan(column.column_span, 12), canvasWidth));

    return (
        <div
            className={['cci-nice-menu-mm-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid xl:tw-col-span-2 2xl:tw-col-span-3', dragSort.getDragClass(columnSortScope, columnSortIndex)].filter(Boolean).join(' ')}
            style={{ gridColumn: `span ${Math.max(1, Math.min(12, Number(column.column_span || 12)))}` }}
            {...dragSort.getDragProps(columnSortScope, columnSortIndex, (fromIndex, toIndex) => onMoveChild?.(columnPath.slice(0, -1), fromIndex, toIndex))}
        >
            <div className='cci-nice-menu-mm-card-header tw-flex tw-items-start tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-4 tw-py-3'>
                <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-shadow-none' onClick={() => onSelect(columnPath)}>
                    <Layers aria-hidden='true' className='tw-h-5 tw-w-5 tw-shrink-0' />
                    <span className='tw-min-w-0'>
                        <strong className='tw-block tw-truncate tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text'>{column.label || __( 'Tabs group', 'cci-nice-menu' )}</strong>
                        <span className='tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-xs tw-font-medium tw-text-cci-nm-muted'>
                            {isHorizontal ? __( 'Horizontal tabs', 'cci-nice-menu' ) : __( 'Vertical tabs', 'cci-nice-menu' )}
                            <ColumnDimensionBadge column={column} canvasWidth={canvasWidth} fallback={12} />
                        </span>
                    </span>
                </Button>
                <div className='tw-flex tw-flex-wrap tw-justify-end tw-gap-1'>
                    {model.tabsBlockPath ? (
                        <AddIconButton label='Add tab' size='iconSm' onClick={() => onAddContent(model.tabsBlockPath)} />
                    ) : (
                        <AddIconButton label='Add tabs block' size='iconSm' onClick={() => onAddBlock(columnPath)} />
                    )}
                    <Button variant='builder' size='iconSm' type='button' onClick={() => onEdit(columnPath)} aria-label={ __( 'Edit tabs group', 'cci-nice-menu' ) }>
                        <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                    </Button>
                    <Button variant='danger' size='iconSm' type='button' onClick={() => onDelete(columnPath)} aria-label={ __( 'Delete tabs group', 'cci-nice-menu' ) }>
                        <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                    </Button>
                </div>
            </div>

            {!model.tabsBlockPath ? (
                <div className='tw-grid tw-min-h-40 tw-place-items-center tw-bg-slate-50 tw-p-6 tw-text-center'>
                    <Button variant='add' size='sm' type='button' onClick={() => onAddBlock(columnPath)}>
                        <Plus aria-hidden='true' />
                        { __( 'Add tabs block', 'cci-nice-menu' ) }
                    </Button>
                </div>
            ) : (
                <div className={`cci-nice-menu-tabs-workspace ${isHorizontal ? 'cci-nice-menu-tabs-workspace-horizontal' : 'cci-nice-menu-tabs-workspace-vertical'}`}>
                    <aside className={`cci-nice-menu-tabs-rail ${isHorizontal ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical'}`}>
                        <div className='cci-nice-menu-tabs-rail-header'>
                            <div>
                                <strong>{ __( 'Tabs', 'cci-nice-menu' ) }</strong>
                                <p>{isHorizontal ? __( 'Horizontal navigation', 'cci-nice-menu' ) : __( 'Vertical navigation', 'cci-nice-menu' )}</p>
                            </div>
                            <span className='cci-nice-menu-tabs-total'>{model.tabEntries.length}</span>
                        </div>
                        <div className={isHorizontal ? 'cci-nice-menu-tabs-list cci-nice-menu-state-horizontal' : 'cci-nice-menu-tabs-list cci-nice-menu-state-vertical'}>
                            {model.tabEntries.length ? model.tabEntries.map(({ node, index }) => {
                                const tabPath = [...model.tabsBlockPath, index];
                                const active = activeTabPath && pathsEqual(tabPath, activeTabPath);

                                return (
                                    <div key={node.id || index} className={['cci-nice-menu-tabs-list-item', isHorizontal ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical', active ? 'cci-nice-menu-state-active cci-nice-menu-mm-tab-active' : '', dragSort.getDragClass((model.tabsBlockPath || []).join('.'), index)].filter(Boolean).join(' ')} {...dragSort.getDragProps((model.tabsBlockPath || []).join('.'), index, (fromIndex, toIndex) => onMoveChild?.(model.tabsBlockPath, fromIndex, toIndex))}>
                                        <Button variant="unstyled" type='button' className='tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-px-3 tw-py-3 tw-text-left tw-shadow-none' onClick={() => onSelect(tabPath)}>
                                            <strong className='cci-nice-menu-tabs-list-label'>{node.label || `Tab ${index + 1}`}</strong>
                                            <span className='cci-nice-menu-tabs-list-count'>{countLayoutChildren(node.children)}</span>
                                        </Button>
                                        <div className='tw-flex tw-pr-2' data-no-drag='true'>
                                            <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(tabPath)} aria-label={ __( 'Edit tab', 'cci-nice-menu' ) }>
                                                <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                            </Button>
                                            <Button variant='danger' size='iconXs' type='button' className='tw-ml-1' onClick={() => onDelete(tabPath)} aria-label={ __( 'Delete tab', 'cci-nice-menu' ) }>
                                                <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <Button variant="unstyled" type='button' className='tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(model.tabsBlockPath)}>
                                    <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                    { __( 'Add first tab', 'cci-nice-menu' ) }
                                </Button>
                            )}
                        </div>
                        <TabsSupportList
                            entries={model.supportEntries || []}
                            parentPath={model.tabsBlockPath}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddBlock={onAddBelowTabsBlock}
                        />
                    </aside>

                    <div className='cci-nice-menu-tabs-content-panel cci-nice-menu-mm-content-panel'>
                        <div className='cci-nice-menu-tabs-content-header'>
                            <div className='tw-min-w-0'>
                                <strong className='tw-block tw-truncate tw-text-base tw-font-semibold tw-text-cci-nm-text'>{activeTab ? activeTab.label : __( 'Select a tab', 'cci-nice-menu' )}</strong>
                                <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{ __( 'This is the content opened by the selected tab.', 'cci-nice-menu' ) }</p>
                            </div>
                            {activeTabPath ? (
                                <AddDropdown
                                    label='Add'
                                    compact
                                    actions={[
                                        { label: __( 'Add column', 'cci-nice-menu' ), icon: Columns3, onClick: () => onAddColumn(activeTabPath) },
                                        { label: __( 'Add child', 'cci-nice-menu' ), icon: Plus, onClick: () => onAddContent(activeTabPath) },
                                    ]}
                                />
                            ) : null}
                        </div>

                        <div className='cci-nice-menu-tabs-content-body tw-min-h-[300px]'>
                            {activeTabPath && tabLayoutEntries.length ? (
                                <StorefrontEditorFrame width={tabFrameWidth} className='cci-nice-menu-storefront-scroll-nested' mirrorScrollbar>
                                    {tabLayoutEntries.map(({ node: layoutNode, index }) => {
                                        const layoutPath = [...activeTabPath, index];

                                        if (isRowWrapper(layoutNode)) {
                                            return (
                                                <RowCard
                                                    key={layoutNode.id || index}
                                                    row={layoutNode}
                                                    rowPath={layoutPath}
                                                    selectedPath={selectedPath}
                                                    onSelect={onSelect}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                    onAddColumn={onAddColumn}
                                                    onAddBlock={onAddBlock}
                                                    onAddContent={onAddContent}
                                                    onAddChild={onAddChild}
                                                    onMoveChild={onMoveChild}
                                                    canvasWidth={tabFrameWidth}
                                                />
                                            );
                                        }

                                        const childColumn = layoutNode;
                                        const childColumnPath = layoutPath;
                                        const blocks = childColumn.children || [];

                                        return (
                                            <div
                                                key={childColumn.id || index}
                                                className={['cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', getColumnWidthStateClass(childColumn), pathsEqual(childColumnPath, selectedPath) ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass((activeTabPath || []).join('.'), index)].filter(Boolean).join(' ')}
                                                style={{ gridColumn: `span ${clampGridSpan(childColumn.column_span, 4)}` }}
                                                {...dragSort.getDragProps((activeTabPath || []).join('.'), index, (fromIndex, toIndex) => onMoveChild?.(activeTabPath, fromIndex, toIndex))}
                                            >
                                                <div className='cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                                    <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(childColumnPath)}>
                                                            <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                            <span className='tw-truncate'>{childColumn.label || `Column ${index + 1}`}</span>
                                                            <ColumnDimensionBadge column={childColumn} canvasWidth={tabFrameWidth} />
                                                    </Button>
                                                    <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                        <AddIconButton label='Add block' onClick={() => onAddBlock(childColumnPath)} />
                                                        <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(childColumnPath)} aria-label={ __( 'Edit tab column', 'cci-nice-menu' ) }>
                                                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                        </Button>
                                                        <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(childColumnPath)} aria-label={ __( 'Delete tab column', 'cci-nice-menu' ) }>
                                                            <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className='tw-grid tw-gap-2 tw-bg-white tw-p-3'>
                                                    {blocks.length ? blocks.map((block, blockIndex) => {
                                                        const blockPath = [...childColumnPath, blockIndex];

                                                        return (
                                                            <div key={block.id || blockIndex} className={['cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', isImplicitLinksBlock(block) ? 'cci-nice-menu-mm-block-card-implicit' : '', dragSort.getDragClass(childColumnPath.join('.'), blockIndex)].filter(Boolean).join(' ')} {...dragSort.getDragProps(childColumnPath.join('.'), blockIndex, (fromIndex, toIndex) => onMoveChild?.(childColumnPath, fromIndex, toIndex))}>
                                                                <div className='cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-2 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2'>
                                                                    <Button variant="unstyled" type='button' className='tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(blockPath)}>
                                                                        <span className='tw-truncate'>{getBlockHeaderLabel(block, blockIndex, blocks.length, childColumn.label)}</span>
                                                                    </Button>
                                                                    <div className='tw-flex tw-gap-1' data-no-drag='true'>
                                                                        <AddIconButton label='Add content' onClick={() => onAddContent(blockPath)} />
                                                                        <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(blockPath)} aria-label={ __( 'Edit block', 'cci-nice-menu' ) }>
                                                                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                        </Button>
                                                                        <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(blockPath)} aria-label={ __( 'Delete block', 'cci-nice-menu' ) }>
                                                                            <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className='tw-grid tw-gap-2 tw-p-3'>
                                                                    {(block.children || []).length ? block.children.map((item, itemIndex) => (
                                                                        <NodeMiniCard key={item.id || itemIndex} node={item} path={[...blockPath, itemIndex]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={blockPath.join('.')} sortIndex={itemIndex} onMove={(fromIndex, toIndex) => onMoveChild?.(blockPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                                                                    )) : (
                                                                        <Button variant="unstyled" type='button' className='tw-flex tw-min-h-16 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(blockPath)}>
                                                                            <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                                            { __( 'Add content', 'cci-nice-menu' ) }
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <Button variant="unstyled" type='button' className='tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddBlock(childColumnPath)}>
                                                            <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                            { __( 'Add block', 'cci-nice-menu' ) }
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </StorefrontEditorFrame>
                            ) : activeTabPath ? (
                                <div className='tw-grid tw-min-h-[220px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-6 tw-text-center'>
                                    <Button variant='add' size='sm' type='button' onClick={() => onAddColumn(activeTabPath)}>
                                        <Plus aria-hidden='true' />
                                        { __( 'Add first column', 'cci-nice-menu' ) }
                                    </Button>
                                </div>
                            ) : (
                                <div className='tw-grid tw-min-h-[220px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-6 tw-text-center'>
                                    <Button variant='add' size='sm' type='button' onClick={() => onAddContent(model.tabsBlockPath)}>
                                        <Plus aria-hidden='true' />
                                        { __( 'Add first tab', 'cci-nice-menu' ) }
                                    </Button>
                                </div>
                            )}

                            {looseEntries.length && activeTabPath ? (
                                <div className='tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3'>
                                    <strong className='tw-text-sm tw-font-semibold tw-text-amber-900'>{ __( 'Direct children outside columns', 'cci-nice-menu' ) }</strong>
                                    <div className='tw-mt-2 tw-grid tw-gap-2'>
                                        {looseEntries.map(({ node, index }) => (
                                            <NodeMiniCard key={node.id || index} node={node} path={[...activeTabPath, index]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={(activeTabPath || []).join('.')} sortIndex={index} onMove={(fromIndex, toIndex) => onMoveChild?.(activeTabPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RowCard({ row, rowPath, selectedPath, onSelect, onEdit, onDelete, onAddColumn, onAddBlock, onAddContent, onAddChild, onMoveChild, canvasWidth = 1440 }) {
    const nestedEntries = (row.children || []).map((node, index) => ({ node, index }));
    const nestedColumns = nestedEntries.filter((entry) => entry.node.type === 'column');
    const looseEntries = nestedEntries.filter((entry) => entry.node.type !== 'column');
    const dragSort = useDragSort();
    const parentPath = rowPath.slice(0, -1);
    const rowIndex = rowPath[rowPath.length - 1];
    const sortScope = parentPath.join('.');
    const rowCanvasWidth = Math.max(960, getColumnPixelWidth(clampGridSpan(row.column_span, 12), canvasWidth));
    const selected = pathsEqual(rowPath, selectedPath);

    return (
        <div
            className={['cci-nice-menu-mm-row-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', selected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(sortScope, rowIndex)].filter(Boolean).join(' ')}
            style={{ gridColumn: `span ${clampGridSpan(row.column_span, 12)}` }}
            {...dragSort.getDragProps(sortScope, rowIndex, (fromIndex, toIndex) => onMoveChild?.(parentPath, fromIndex, toIndex))}
        >
            <div className='cci-nice-menu-mm-row-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(rowPath)}>
                    <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                    <span className='tw-truncate'>{row.label || 'Row'}</span>
                    <ColumnDimensionBadge column={row} canvasWidth={canvasWidth} fallback={12} />
                    <span className='cci-nice-menu-mm-row-count'>{ __( 'Columns: %count%', 'cci-nice-menu' ).replace( '%count%', String( nestedColumns.length ) ) }</span>
                </Button>
                <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                    <AddIconButton label={ __( 'Add column', 'cci-nice-menu' ) } onClick={() => onAddColumn(rowPath)} />
                    <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(rowPath)} aria-label={ __( 'Edit row', 'cci-nice-menu' ) }>
                        <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                    </Button>
                    <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(rowPath)} aria-label={ __( 'Delete row', 'cci-nice-menu' ) }>
                        <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                    </Button>
                </div>
            </div>

            <div className='cci-nice-menu-mm-row-body'>
                <div className='cci-nice-menu-mm-row-grid'>
                    {nestedColumns.map(({ node: childColumn, index }) => {
                        const childColumnPath = [...rowPath, index];
                        const blocks = childColumn.children || [];
                        const childSelected = pathsEqual(childColumnPath, selectedPath);

                        return (
                            <div
                                key={childColumn.id || index}
                                className={['cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', getColumnWidthStateClass(childColumn), childSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(rowPath.join('.'), index)].filter(Boolean).join(' ')}
                                style={{ gridColumn: `span ${clampGridSpan(childColumn.column_span, 4)}` }}
                                {...dragSort.getDragProps(rowPath.join('.'), index, (fromIndex, toIndex) => onMoveChild?.(rowPath, fromIndex, toIndex))}
                            >
                                <div className='cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                    <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(childColumnPath)}>
                                        <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                        <span className='tw-truncate'>{childColumn.label || `Column ${index + 1}`}</span>
                                        <ColumnDimensionBadge column={childColumn} canvasWidth={rowCanvasWidth} />
                                    </Button>
                                    <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                        <AddIconButton label='Add block' onClick={() => onAddBlock(childColumnPath)} />
                                        <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(childColumnPath)} aria-label={ __( 'Edit column', 'cci-nice-menu' ) }>
                                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                        </Button>
                                        <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(childColumnPath)} aria-label={ __( 'Delete column', 'cci-nice-menu' ) }>
                                            <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                        </Button>
                                    </div>
                                </div>
                                <div className='tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3'>
                                    {blocks.length ? blocks.map((block, blockIndex) => {
                                        const blockPath = [...childColumnPath, blockIndex];
                                        const blockSelected = pathsEqual(blockPath, selectedPath);

                                        return (
                                            <div key={block.id || blockIndex} className={['cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', isImplicitLinksBlock(block) ? 'cci-nice-menu-mm-block-card-implicit' : '', blockSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(childColumnPath.join('.'), blockIndex)].filter(Boolean).join(' ')} {...dragSort.getDragProps(childColumnPath.join('.'), blockIndex, (fromIndex, toIndex) => onMoveChild?.(childColumnPath, fromIndex, toIndex))}>
                                                <div className='cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                                    <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(blockPath)}>
                                                        <Boxes aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                        <span className='tw-truncate'>{getBlockHeaderLabel(block, blockIndex, blocks.length, childColumn.label)}</span>
                                                    </Button>
                                                    <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                        <AddIconButton label='Add content' onClick={() => onAddContent(blockPath)} />
                                                        <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(blockPath)} aria-label={ __( 'Edit block', 'cci-nice-menu' ) }>
                                                            <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                        </Button>
                                                        <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(blockPath)} aria-label={ __( 'Delete block', 'cci-nice-menu' ) }>
                                                            <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className='tw-grid tw-gap-2 tw-bg-white tw-p-3'>
                                                    {(block.children || []).length ? block.children.map((item, itemIndex) => (
                                                        <NodeMiniCard
                                                            key={item.id || itemIndex}
                                                            node={item}
                                                            path={[...blockPath, itemIndex]}
                                                            selectedPath={selectedPath}
                                                            onSelect={onSelect}
                                                            onEdit={onEdit}
                                                            onDelete={onDelete}
                                                            onAddChild={onAddChild}
                                                            sortScope={blockPath.join('.')}
                                                            sortIndex={itemIndex}
                                                            onMove={(fromIndex, toIndex) => onMoveChild?.(blockPath, fromIndex, toIndex)}
                                                        />
                                                    )) : (
                                                        <Button variant="unstyled" type='button' className='tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(blockPath)}>
                                                            <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                            { __( 'Add content', 'cci-nice-menu' ) }
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <Button variant="unstyled" type='button' className='tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddBlock(childColumnPath)}>
                                            <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                            { __( 'Add block', 'cci-nice-menu' ) }
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {looseEntries.length ? (
                    <div className='tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3'>
                        <div className='tw-mb-2 tw-flex tw-items-center tw-justify-between tw-gap-3'>
                                    <strong className='tw-text-sm tw-font-semibold tw-text-amber-900'>{ __( 'Items outside nested columns', 'cci-nice-menu' ) }</strong>
                            <span className='tw-text-xs tw-text-amber-700'>{ __( 'These items are inside the row wrapper but not inside a column.', 'cci-nice-menu' ) }</span>
                        </div>
                        <div className='tw-grid tw-gap-2'>
                            {looseEntries.map(({ node, index }) => (
                                <NodeMiniCard key={node.id || index} node={node} path={[...rowPath, index]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={rowPath.join('.')} sortIndex={index} onMove={(fromIndex, toIndex) => onMoveChild?.(rowPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function MegaCanvas({ activeTop, activeTopPath = [], selectedPath, onSelect, onEdit, onDelete, onAddRow = () => {}, onAddColumn, onAddTabsGroup, onAddBlock, onAddContent, onAddBelowTabsBlock, onAddChild, onCreateManualFlyout, onMoveChild, settings = {} }) {
    const children = activeTop?.children || [];
    const dynamicCategoryFlyout = activeTop?.type === 'category_tree' && Number(activeTop?.entity_id || 0) > 0 && !children.length;
    const layoutEntries = children.map((node, index) => ({ node, index })).filter((entry) => isLayoutEntry(entry.node));
    const looseEntries = children.map((node, index) => ({ node, index })).filter((entry) => !isLayoutEntry(entry.node));
    const dragSort = useDragSort();
    const canvasWidth = getEditorCanvasWidth(settings);

    return (
        <section className='tw-min-w-0 tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white'>
            <div className='tw-flex tw-items-start tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-4 tw-py-4'>
                <div className='tw-min-w-0'>
                    <strong className='tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>
                        {dynamicCategoryFlyout ? __('Dynamic category flyout', 'cci-nice-menu') : __('Dropdown content editor', 'cci-nice-menu')}
                    </strong>
                    <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                        {dynamicCategoryFlyout
                            ? __( 'This catalog dropdown is generated from live PrestaShop categories.', 'cci-nice-menu' )
                            : `Build the dropdown panel for the selected top navigation item. Editing canvas uses a ${canvasWidth}px storefront width.`}
                    </p>
                    {!dynamicCategoryFlyout ? (
                        <div className='cci-nice-menu-storefront-meta'>
                            <span>{canvasWidth}px canvas</span>
                            <span>{ __( '12-column grid', 'cci-nice-menu' ) }</span>
                            <span>{EDITOR_GRID_GAP}px gap</span>
                        </div>
                    ) : null}
                </div>
                {dynamicCategoryFlyout ? (
                    <div className='tw-flex tw-flex-wrap tw-justify-end tw-gap-2'>
                        <Button variant='secondary' size='sm' type='button' onClick={() => onEdit(activeTopPath)}>
                            <Pencil aria-hidden='true' />
                            { __( 'Edit source category', 'cci-nice-menu' ) }
                        </Button>
                        <Button variant='accent' size='sm' type='button' onClick={onCreateManualFlyout}>
                            <Columns3 aria-hidden='true' />
                            { __( 'Convert to manual', 'cci-nice-menu' ) }
                        </Button>
                    </div>
                ) : (
                    <AddDropdown
                        label='Add'
                        compact
                        actions={[
                            { label: __( 'Add row', 'cci-nice-menu' ), icon: Layers, onClick: onAddRow },
                            { label: __( 'Add tabs group', 'cci-nice-menu' ), icon: Layers, onClick: onAddTabsGroup },
                        ]}
                    />
                )}
            </div>

            <div className='tw-min-h-[520px] tw-bg-transparent tw-p-4'>
                {dynamicCategoryFlyout ? (
                    <div className='tw-grid tw-min-h-[420px] tw-content-start tw-gap-4 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-5'>
                        <div className='tw-flex tw-items-start tw-justify-between tw-gap-4 tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4'>
                            <div className='tw-min-w-0'>
                                <div className='tw-flex tw-items-center tw-gap-3'>
                                    <span className='tw-inline-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-white tw-text-cci-nm-brand tw-shadow-sm'>
                                        <FolderTree aria-hidden='true' className='tw-h-5 tw-w-5' />
                                    </span>
                                    <div className='tw-min-w-0'>
                                        <h3 className='tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>{activeTop?.label || __( 'KATALOG PRODUKTOW', 'cci-nice-menu' )}</h3>
                                        <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                            { __( 'Source category #', 'cci-nice-menu' ) }{activeTop?.entity_id}{ __( '. The storefront reads its current children directly from the PrestaShop category tables.', 'cci-nice-menu' ) }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <TypeBadge type='category_tree' />
                        </div>

                        <div className='tw-grid tw-gap-4 xl:tw-grid-cols-3'>
                            <div className='tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4'>
                                <strong className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                    <span className='tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white'>1</span>
                                    { __( 'Vertical tabs', 'cci-nice-menu' ) }
                                </strong>
                                <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                    { __( 'Direct child categories of the selected source become tabs controlling the catalog content.', 'cci-nice-menu' ) }
                                </p>
                            </div>
                            <div className='tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4'>
                                <strong className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                    <span className='tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white'>2</span>
                                    { __( 'Hover category', 'cci-nice-menu' ) }
                                </strong>
                                <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                    { __( 'Hovering a main category opens its panel on the right, like the shop example.', 'cci-nice-menu' ) }
                                </p>
                            </div>
                            <div className='tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4'>
                                <strong className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                    <span className='tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white'>3</span>
                                    { __( 'Auto columns', 'cci-nice-menu' ) }
                                </strong>
                                <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                    { __( 'Subcategories become grouped columns. You do not maintain these generated columns manually.', 'cci-nice-menu' ) }
                                </p>
                            </div>
                        </div>
                    </div>
                ) : !layoutEntries.length && !looseEntries.length ? (
                    <div className='tw-grid tw-min-h-[420px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-white tw-p-8 tw-text-center'>
                        <div className='tw-max-w-md'>
                            <div className='tw-mx-auto tw-mb-4 tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand'>
                                <Layers aria-hidden='true' className='tw-h-6 tw-w-6' />
                            </div>
                            <h3 className='tw-m-0 tw-text-lg tw-font-semibold tw-text-cci-nm-text'>{ __( 'Start with a row', 'cci-nice-menu' ) }</h3>
                            <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                { __( 'Rows hold columns. Add reusable blocks inside columns, then add categories, products, banners or links.', 'cci-nice-menu' ) }
                            </p>
                            <div className='tw-mt-4 tw-flex tw-justify-center'>
                                <AddDropdown
                                    label='Add first element'
                                    actions={[
                                        { label: __( 'Add first row', 'cci-nice-menu' ), icon: Layers, onClick: onAddRow },
                                        { label: __( 'Add tabs group', 'cci-nice-menu' ), icon: Layers, onClick: onAddTabsGroup },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='tw-grid tw-gap-4'>
                        <StorefrontEditorFrame width={canvasWidth} className='cci-nice-menu-storefront-scroll-viewport'>
                            {layoutEntries.map(({ node: column, index }) => {
                                const columnPath = [...activeTopPath, index];
                                const blocks = column.children || [];
                                const selected = pathsEqual(columnPath, selectedPath);

                                if (isTabsColumn(column)) {
                                    return (
                                        <TabsGroupCard
                                            key={column.id || index}
                                            column={column}
                                            columnPath={columnPath}
                                            model={getTabsGroupModelFromColumn(activeTopPath, index, column, selectedPath)}
                                            selectedPath={selectedPath}
                                            onSelect={onSelect}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onAddColumn={onAddColumn}
                                            onAddBlock={onAddBlock}
                                            onAddContent={onAddContent}
                                            onAddBelowTabsBlock={onAddBelowTabsBlock}
                                            onAddChild={onAddChild}
                                            onMoveChild={onMoveChild}
                                            canvasWidth={canvasWidth}
                                        />
                                    );
                                }

                                if (isRowWrapper(column)) {
                                    return (
                                        <RowCard
                                            key={column.id || index}
                                            row={column}
                                            rowPath={columnPath}
                                            selectedPath={selectedPath}
                                            onSelect={onSelect}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onAddColumn={onAddColumn}
                                            onAddBlock={onAddBlock}
                                            onAddContent={onAddContent}
                                            onAddChild={onAddChild}
                                            onMoveChild={onMoveChild}
                                            canvasWidth={canvasWidth}
                                        />
                                    );
                                }

                                return (
                                    <div
                                        key={column.id || index}
                                        className={['cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', getColumnWidthStateClass(column), selected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(activeTopPath.join('.'), index)].filter(Boolean).join(' ')}
                                        style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }}
                                        {...dragSort.getDragProps(activeTopPath.join('.'), index, (fromIndex, toIndex) => onMoveChild?.(activeTopPath, fromIndex, toIndex))}
                                    >
                                        <div className='cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                            <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(columnPath)}>
                                                <GripVertical aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                <span className='tw-truncate'>{column.label || `Column ${index + 1}`}</span>
                                                <ColumnDimensionBadge column={column} canvasWidth={canvasWidth} />
                                            </Button>
                                            <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                <AddIconButton label='Add block' onClick={() => onAddBlock(columnPath)} />
                                                <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(columnPath)} aria-label={ __( 'Edit column', 'cci-nice-menu' ) }>
                                                    <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                </Button>
                                                <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(columnPath)} aria-label={ __( 'Delete column', 'cci-nice-menu' ) }>
                                                    <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className='tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3'>
                                            {blocks.length ? blocks.map((block, blockIndex) => {
                                                const blockPath = [...columnPath, blockIndex];
                                                const blockSelected = pathsEqual(blockPath, selectedPath);

                                                return (
                                                    <div key={block.id || blockIndex} className={['cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid', isImplicitLinksBlock(block) ? 'cci-nice-menu-mm-block-card-implicit' : '', blockSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '', dragSort.getDragClass(columnPath.join('.'), blockIndex)].filter(Boolean).join(' ')} {...dragSort.getDragProps(columnPath.join('.'), blockIndex, (fromIndex, toIndex) => onMoveChild?.(columnPath, fromIndex, toIndex))}>
                                                        <div className='cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5'>
                                                            <Button variant="unstyled" type='button' className='tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none' onClick={() => onSelect(blockPath)}>
                                                                <Boxes aria-hidden='true' className='tw-h-4 tw-w-4 tw-shrink-0' />
                                                                <span className='tw-truncate'>{getBlockHeaderLabel(block, blockIndex, blocks.length, column.label)}</span>
                                                            </Button>
                                                            <div className='tw-flex tw-items-center tw-gap-1' data-no-drag='true'>
                                                                <AddIconButton label='Add content' onClick={() => onAddContent(blockPath)} />
                                                                <Button variant='builder' size='iconXs' type='button' onClick={() => onEdit(blockPath)} aria-label={ __( 'Edit block', 'cci-nice-menu' ) }>
                                                                    <Pencil aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                </Button>
                                                                <Button variant='danger' size='iconXs' type='button' onClick={() => onDelete(blockPath)} aria-label={ __( 'Delete block', 'cci-nice-menu' ) }>
                                                                    <Trash2 aria-hidden='true' className='tw-h-3.5 tw-w-3.5' />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className='tw-grid tw-gap-2 tw-bg-white tw-p-3'>
                                                            {(block.children || []).length ? block.children.map((item, itemIndex) => (
                                                                <NodeMiniCard
                                                                    key={item.id || itemIndex}
                                                                    node={item}
                                                                    path={[...blockPath, itemIndex]}
                                                                    selectedPath={selectedPath}
                                                                    onSelect={onSelect}
                                                                    onEdit={onEdit}
                                                                    onDelete={onDelete}
                                                                    onAddChild={onAddChild}
                                                                    sortScope={blockPath.join('.')}
                                                                    sortIndex={itemIndex}
                                                                    onMove={(fromIndex, toIndex) => onMoveChild?.(blockPath, fromIndex, toIndex)}
                                                                />
                                                            )) : (
                                                                <Button variant="unstyled" type='button' className='tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddContent(blockPath)}>
                                                                    <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                                    { __( 'Add content', 'cci-nice-menu' ) }
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }) : (
                                                <Button variant="unstyled" type='button' className='tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft' onClick={() => onAddBlock(columnPath)}>
                                                    <Plus aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                    { __( 'Add block', 'cci-nice-menu' ) }
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </StorefrontEditorFrame>

                        {looseEntries.length ? (
                            <div className='tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3'>
                                <div className='tw-mb-2 tw-flex tw-items-center tw-justify-between tw-gap-3'>
                                    <strong className='tw-text-sm tw-font-semibold tw-text-amber-900'>{ __( 'Items outside columns', 'cci-nice-menu' ) }</strong>
                                    <span className='tw-text-xs tw-text-amber-700'>{ __( 'These came from the older structure. Rebuild them into columns when needed.', 'cci-nice-menu' ) }</span>
                                </div>
                                <div className='tw-grid tw-gap-2'>
                                    {looseEntries.map(({ node, index }) => (
                                        <NodeMiniCard key={node.id || index} node={node} path={[...activeTopPath, index]} selectedPath={selectedPath} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} sortScope={activeTopPath.join('.')} sortIndex={index} onMove={(fromIndex, toIndex) => onMoveChild?.(activeTopPath, fromIndex, toIndex)} onMoveChild={onMoveChild} />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </section>
    );
}

function ConfirmDeleteModal({ open, itemLabel, onCancel, onConfirm }) {
    if (!open) {
        return null;
    }

    return (
        <div className='tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4' role='presentation'>
            <div className='tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl' role='dialog' aria-modal='true' aria-labelledby='cci-nice-menu-delete-dialog-title'>
                <div className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-4'>
                    <h2 id='cci-nice-menu-delete-dialog-title' className='tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>
                        { __( 'Delete menu item?', 'cci-nice-menu' ) }
                    </h2>
                    <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                        { __( 'This removes', 'cci-nice-menu' ) } {itemLabel ? <strong className='tw-text-cci-nm-text'>{itemLabel}</strong> : __( 'this item', 'cci-nice-menu' )} { __( 'and all child elements from the current menu draft.', 'cci-nice-menu' ) }
                    </p>
                </div>
                <div className='tw-flex tw-justify-end tw-gap-2 tw-p-5'>
                    <Button variant='secondary' type='button' onClick={onCancel}>{ __( 'Cancel', 'cci-nice-menu' ) }</Button>
                    <Button variant='danger' type='button' onClick={onConfirm}>
                        <Trash2 aria-hidden='true' />
                        { __( 'Delete item', 'cci-nice-menu' ) }
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ConfirmDeleteMenuModal({ open, menu, deleting = false, onCancel, onConfirm }) {
    if (!open) {
        return null;
    }

    return (
        <div className='tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4' role='presentation'>
            <div className='tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl' role='dialog' aria-modal='true' aria-labelledby='cci-nice-menu-delete-menu-dialog-title'>
                <div className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-4'>
                    <h2 id='cci-nice-menu-delete-menu-dialog-title' className='tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>
                        { __( 'Delete menu?', 'cci-nice-menu' ) }
                    </h2>
                    <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                        { __( 'This permanently removes', 'cci-nice-menu' ) } <strong className='tw-text-cci-nm-text'>{menu?.name || __( 'this menu', 'cci-nice-menu' )}</strong> { __( 'from CCI Nice Menu.', 'cci-nice-menu' ) }
                    </p>
                </div>
                <div className='tw-flex tw-justify-end tw-gap-2 tw-p-5'>
                    <Button variant='secondary' type='button' onClick={onCancel} disabled={deleting}>{ __( 'Cancel', 'cci-nice-menu' ) }</Button>
                    <Button variant='danger' type='button' onClick={onConfirm} disabled={deleting}>
                        <Trash2 aria-hidden='true' />
                        {deleting ? __( 'Deleting...', 'cci-nice-menu' ) : __( 'Delete menu', 'cci-nice-menu' )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function AddContentModal({ open, mode = 'add', parentLabel, initialNode = null, initialType = 'custom', allowStructurePresets = true, isTopLevel = false, onCancel, onAdd, onSave, onOpenSettings }) {
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

        const nextType = mode === 'edit' ? sanitizeNodeType(initialNode?.type || 'custom') : sanitizeNodeType(initialType || 'custom');
        const initialDisplayOptions = mode === 'edit' ? getNodeDisplayOptions(initialNode || {}) : DEFAULT_DISPLAY_OPTIONS;
        setType(nextType);
        const initialTypeIsCatalogBacked = isCatalogBackedType(nextType);
        const initialLabel = mode === 'edit' ? initialNode?.label || 'New item' : getDefaultContentLabel(nextType);
        const initialLink = mode === 'edit' ? initialNode?.link || '#' : getDefaultContentLink(nextType);
        setLabel(initialLabel);
        setLink(initialLink);
        setHeadingLink(mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link || '') : '');
        setHeadingLinkLabel(mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link_label || '') : '');
        setHeadingLinkIcon(mode === 'edit' && nextType === 'block' ? String(initialNode?.heading_link_icon || '') : '');
        setHideHeading(mode === 'edit' && nextType === 'block' ? Boolean(initialNode?.hide_heading) : false);
        setEntityId(mode === 'edit' ? String(initialNode?.entity_id || '') : '');
        setLabelOverride(mode === 'edit' ? String(initialNode?.label_override || '') : '');
        setUrlOverride(mode === 'edit' ? String(initialNode?.url_override || '') : '');
        setSourceLabel(mode === 'edit' ? String(initialNode?.source_label || (initialTypeIsCatalogBacked ? initialLabel : '')) : '');
        setSourceUrl(mode === 'edit' ? String(initialNode?.source_url || (initialTypeIsCatalogBacked ? initialLink : '')) : '');
        setHookName(mode === 'edit' ? String(initialNode?.hook_name || 'displaySearch') : 'displaySearch');
        setProductCount(mode === 'edit' ? Number(initialNode?.product_count || 0) : 0);
        setImageUrl(mode === 'edit' ? initialNode?.image_url || '' : nextType === 'map' ? '/modules/cci_nice_menu/views/img/showcase-map.svg' : '');
        setMapQuery(mode === 'edit' ? String(initialNode?.map_query || '') : '');
        setMapEmbedUrl(mode === 'edit' ? String(initialNode?.map_embed_url || '') : '');
        setMapZoom(mode === 'edit' ? Number(initialNode?.map_zoom || 15) : 15);
        setDescription(mode === 'edit' ? initialNode?.description || '' : '');
        setPrice(mode === 'edit' ? initialNode?.price || '' : '');
        setUseFallbackProductTile(mode === 'edit' ? Boolean(initialNode?.use_fallback_product_tile) : false);
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
        setIcon(mode === 'edit' ? initialNode?.icon || '' : nextType === 'blog_categories' ? 'folder-tree' : '');
        setIconOnly(mode === 'edit' ? Boolean(initialNode?.icon_only) : false);
        setBadge(mode === 'edit' && !['banner', 'video'].includes(nextType) ? initialNode?.badge || '' : '');
        setCtaLabel(mode === 'edit' && ['banner', 'video'].includes(nextType) ? String(initialNode?.cta_label || initialNode?.badge || '') : '');
        setBannerEyebrow(mode === 'edit' && nextType === 'banner' ? String(initialNode?.banner_eyebrow || '') : '');
        setBannerLayout(mode === 'edit' && nextType === 'banner' ? normalizeBannerLayout(initialNode?.banner_layout || 'horizontal') : 'horizontal');
        setStyleBackground(mode === 'edit' ? initialNode?.style_background || '' : '');
        setStyleBackground2(mode === 'edit' ? initialNode?.style_background_2 || '' : '');
        setStyleText(mode === 'edit' ? initialNode?.style_text || '' : '');
        setStyleIcon(mode === 'edit' ? initialNode?.style_icon || '' : '');
        setStyleBorder(mode === 'edit' ? initialNode?.style_border || '' : '');
        setStyleRadius(mode === 'edit' ? initialNode?.style_radius || '' : '');
        setStyleBadgeBackground(mode === 'edit' ? initialNode?.style_badge_background || '' : '');
        setStyleBadgeText(mode === 'edit' ? initialNode?.style_badge_text || '' : '');
        setTabsContentHeight(mode === 'edit' ? initialNode?.tabs_content_height || '' : '');
        setTabsContentHeightTablet(mode === 'edit' ? initialNode?.tabs_content_height_tablet || '' : '');
        setTabsContentHeightMobile(mode === 'edit' ? initialNode?.tabs_content_height_mobile || '' : '');
        setHideOnDesktop(Boolean(initialDisplayOptions.hide_desktop));
        setHideOnTablet(Boolean(initialDisplayOptions.hide_tablet));
        setHideOnMobile(Boolean(initialDisplayOptions.hide_mobile));
        setTopLevelPlacement(isTopLevel && mode === 'edit' && initialNode?.top_level_placement === 'right' ? 'right' : '');
        setTopLevelColumnStart(isTopLevel && mode === 'edit' ? Math.max(0, Math.min(12, Number(initialNode?.top_level_column_start || 0))) : 0);
        setLayoutRole(mode === 'edit' ? normalizeLayoutRole(initialNode?.layout_role || '') : '');
        setComponentVariant(mode === 'edit' ? normalizeComponentVariant(initialNode?.component_variant || '') || inferComponentVariantFromClass(initialNode?.css_class || '') : '');
        setTabsOrientation(mode === 'edit' ? normalizeTabsOrientation(initialNode?.tabs_orientation || 'vertical') : 'vertical');
        setColumns(mode === 'edit' ? Number(initialNode?.columns || 1) : 1);
        setColumnSpan(mode === 'edit' ? Number(initialNode?.column_span || 0) : 0);
        setItemCount(mode === 'edit' ? Number(initialNode?.item_count || initialNode?.product_count || 4) : 4);
        setCarouselItems(mode === 'edit' ? Number(initialNode?.carousel_items || 3) : 3);
        setCarouselMargin(mode === 'edit' ? Number(initialNode?.carousel_margin || 12) : 12);
        setCarouselAutoplay(mode === 'edit' ? Boolean(initialNode?.carousel_autoplay) : false);
        setCarouselAutoplayTimeout(mode === 'edit' ? Number(initialNode?.carousel_autoplay_timeout || 4500) : 4500);
        setBlogCategoryMode(mode === 'edit' ? String(initialNode?.blog_category_mode || 'all') : 'all');
        setBlogCategoryIds(mode === 'edit' ? normalizeBlogCategoryIds(initialNode?.blog_category_ids || []) : []);
        setBlogCategoryHideEmpty(mode === 'edit' ? Boolean(initialNode?.blog_category_hide_empty ?? true) : true);
        setBlogCategorySort(mode === 'edit' ? normalizeBlogCategorySort(initialNode?.blog_category_sort || 'position') : 'position');
        setBlogCategoryShowCount(mode === 'edit' ? Boolean(initialNode?.blog_category_show_count ?? true) : true);
        setBlogCategoryMediaMode(mode === 'edit' ? normalizeBlogCategoryMediaMode(initialNode?.blog_category_media_mode || 'icon') : 'icon');
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
        if (!open || !['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'].includes(type)) {
            return;
        }

        setLoading(true);
        setError('');
        apiFetch(type === 'blog_post' ? '/blog/posts' : type === 'product' || type === 'product_tile' ? '/catalog/products' : type === 'cms_page' ? '/catalog/cms-pages' : '/catalog/categories', {
            method: 'POST',
            body: JSON.stringify({ query: '' }),
        }).then((response) => {
            setResults(response.items || []);
        }).catch((requestError) => {
            setError(requestError.message || 'Catalog suggestions failed.');
        }).finally(() => setLoading(false));
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
        }).then((response) => {
            setBlogCategoryResults(response.items || []);
        }).catch((requestError) => {
            setBlogCategoryError(requestError.message || 'Blog category suggestions failed.');
        }).finally(() => setBlogCategoryLoading(false));
    }, [open, type, blogCategoryQuery]);

    if (!open) {
        return null;
    }

    const needsCatalog = ['category', 'category_tree', 'product', 'product_tile', 'cms_page', 'blog_post'].includes(type);
    const isProductType = type === 'product' || type === 'product_tile';
    const isBlogPostType = type === 'blog_post';
    const isBlogCollectionType = ['blog_list', 'blog_carousel', 'blog_popular'].includes(type);
    const isBlogCategoryType = type === 'blog_categories';
    const isCatalogBacked = isCatalogBackedType(type);
    const entityCopy = type === 'cms_page'
        ? { name: 'CMS page title', url: 'CMS page URL' }
        : type === 'blog_post'
            ? { name: 'blog post title', url: 'blog post URL' }
        : type === 'category' || type === 'category_tree'
            ? { name: 'category name', url: 'category URL' }
            : type === 'product' || type === 'product_tile'
                ? { name: 'product name', url: 'product URL' }
                : { name: 'item label', url: 'item URL' };
    const selectedMeta = contentTypes.find((item) => item.value === type) || contentTypes[0];
    const selectedLayoutTemplate = layoutTemplates.find((item) => item.value === selectedTemplate) || null;
    const isEdit = mode === 'edit';
    const isStructure = ['row', 'column', 'block'].includes(type);
    const allowsActionLabel = ['banner', 'video'].includes(type);
    const allowsMenuBadge = !['product', 'product_tile', 'banner', 'video'].includes(type);
    const allowsBadgeColors = allowsMenuBadge || allowsActionLabel;
    const isHook = type === 'hook';
    const supportsLinkMode = !isStructure && !isHook && !['banner', 'video', 'map', 'text', 'blog_list', 'blog_carousel', 'blog_popular', 'blog_categories'].includes(type);
    const iconLibrary = pluginData.moduleSettings?.iconLibrary || 'none';
    const iconPlaceholder = iconLibrary === 'fontawesome'
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
            examples: ['user', 'house', 'cart-shopping', 'magnifying-glass', 'bars', 'tag', 'phone', 'envelope'],
        },
        tabler: {
            label: 'Tabler Icons',
            description: `Tabler Icons are ${iconSource === 'cdn' ? 'loaded from the vendor CDN' : 'loaded from local module files'}. Type a short icon name or a full Tabler class.`,
            catalogUrl: 'https://tabler.io/icons',
            examples: ['user', 'home', 'shopping-cart', 'search', 'menu-2', 'tag', 'phone', 'mail'],
        },
        theme: {
            label: 'Theme icons',
            description: 'No extra icon font is loaded. Use an icon token that the active theme already exposes.',
            catalogUrl: '',
            examples: [],
        },
        none: {
            label: 'No icon library selected',
            description: 'No icon font is loaded. Choose Font Awesome or Tabler in Settings before adding icons.',
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
        ? isBlogPostType ? (isEdit ? 'Blog source' : 'Choose blog post') : isEdit ? 'Catalog source' : 'Choose catalog source'
        : isStructure ? 'Structure settings' : selectedMeta.label;
    const primaryPanelDescription = needsCatalog
        ? isBlogPostType ? 'Select a published article from CCI Blog.' : isEdit ? 'Keep the current source or choose another catalog item.' : selectedMeta.description
        : isStructure ? 'Layout, width and heading options for this structural element.' : selectedMeta.description;
    const hasAppearanceOverrides = Boolean(
        icon
        || badge
        || styleBackground
        || styleBackground2
        || styleText
        || styleIcon
        || styleBorder
        || styleRadius
        || styleBadgeBackground
        || styleBadgeText
        || tabsContentHeight
        || tabsContentHeightTablet
        || tabsContentHeightMobile
        || hideOnDesktop
        || hideOnTablet
        || hideOnMobile
        || (type === 'banner' && bannerEyebrow)
        || (type === 'banner' && bannerLayout !== 'horizontal')
        || target
        || linkMode !== 'link'
        || iconOnly
        || Number(columns || 1) > 1
        || (isBlogCollectionType && Number(itemCount || 4) !== 4)
        || (type === 'blog_carousel' && (Number(carouselItems || 3) !== 3 || Number(carouselMargin || 12) !== 12 || carouselAutoplay || Number(carouselAutoplayTimeout || 4500) !== 4500))
        || (isBlogCategoryType && (blogCategoryMode !== 'all' || blogCategoryIds.length > 0 || !blogCategoryHideEmpty || blogCategorySort !== 'position' || !blogCategoryShowCount || blogCategoryMediaMode !== 'icon' || Number(itemCount || 8) !== 8))
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
        setHookName(item.value === 'hook' ? (item.hookName || 'displaySearch') : 'displaySearch');
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
        setItemCount(['blog_list', 'blog_carousel', 'blog_popular'].includes(item.value) ? 4 : item.value === 'blog_categories' ? 8 : 1);
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
        setCtaLabel(['banner', 'video'].includes(node.type) ? String(node.cta_label || node.badge || '') : '');
        setBannerEyebrow(node.type === 'banner' ? String(node.banner_eyebrow || '') : '');
        setBannerLayout(node.type === 'banner' ? normalizeBannerLayout(node.banner_layout || 'horizontal') : 'horizontal');
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
        setTopLevelColumnStart(isTopLevel ? Math.max(0, Math.min(12, Number(node.top_level_column_start || 0))) : 0);
        setLayoutRole(normalizeLayoutRole(node.layout_role || ''));
        setComponentVariant(normalizeComponentVariant(node.component_variant || '') || inferComponentVariantFromClass(node.css_class || ''));
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
        setBlogCategoryMediaMode(normalizeBlogCategoryMediaMode(node.blog_category_media_mode || 'icon'));
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
            ? (cleanLabelOverride || cleanSourceLabel || label || selectedMeta.label)
            : (label || selectedMeta.label);
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
                ? (cleanUrlOverride || cleanSourceUrl || link || '#')
                : (link || '#');

        return {
            type,
            label: effectiveLabel,
            link: effectiveLink,
            entity_id: entityId,
            label_override: isCatalogBacked ? cleanLabelOverride : '',
            url_override: isCatalogBacked ? cleanUrlOverride : '',
            source_label: isCatalogBacked ? (cleanSourceLabel || label || selectedMeta.label) : '',
            source_url: isCatalogBacked ? (cleanSourceUrl || link || '#') : '',
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
            tabs_content_height: layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeight, '680px') : '',
            tabs_content_height_tablet: layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeightTablet, '620px') : '',
            tabs_content_height_mobile: layoutRole === 'tabs' ? normalizeOptionalNodeLength(tabsContentHeightMobile, '72vh') : '',
            display_options: {
                hide_desktop: hideOnDesktop,
                hide_tablet: hideOnTablet,
                hide_mobile: hideOnMobile,
            },
            top_level_placement: isTopLevel ? topLevelPlacement : '',
            top_level_column_start: isTopLevel ? Math.max(0, Math.min(12, Number(topLevelColumnStart || 0))) : 0,
            layout_role: layoutRole,
            tabs_orientation: layoutRole === 'tabs' ? tabsOrientation : 'vertical',
            columns: Number(columns || 1),
            column_span: Number(columnSpan || 0),
            item_count: isBlogCollectionType || isBlogCategoryType ? Number(itemCount || (isBlogCategoryType ? 8 : 4)) : 1,
            carousel_items: type === 'blog_carousel' ? Math.max(1, Math.min(6, Number(carouselItems || 3))) : 3,
            carousel_margin: type === 'blog_carousel' ? Math.max(0, Math.min(48, Number(carouselMargin || 12))) : 12,
            carousel_autoplay: type === 'blog_carousel' ? Boolean(carouselAutoplay) : false,
            carousel_autoplay_timeout: type === 'blog_carousel' ? Math.max(1000, Math.min(20000, Number(carouselAutoplayTimeout || 4500))) : 4500,
            blog_category_mode: isBlogCategoryType ? (blogCategoryMode === 'selected' ? 'selected' : 'all') : 'all',
            blog_category_ids: isBlogCategoryType ? blogCategoryIds : [],
            blog_category_hide_empty: isBlogCategoryType ? blogCategoryHideEmpty : true,
            blog_category_sort: isBlogCategoryType ? normalizeBlogCategorySort(blogCategorySort) : 'position',
            blog_category_show_count: isBlogCategoryType ? blogCategoryShowCount : true,
            blog_category_media_mode: isBlogCategoryType ? normalizeBlogCategoryMediaMode(blogCategoryMediaMode) : 'icon',
            product_count: Number(productCount || 0),
        };
    };

    const searchCatalog = () => {
        if (!needsCatalog) {
            return;
        }

        setLoading(true);
        setError('');
        apiFetch(type === 'blog_post' ? '/blog/posts' : type === 'product' || type === 'product_tile' ? '/catalog/products' : type === 'cms_page' ? '/catalog/cms-pages' : '/catalog/categories', {
            method: 'POST',
            body: JSON.stringify({ query }),
        }).then((response) => {
            setResults(response.items || []);
        }).catch((requestError) => {
            setError(requestError.message || 'Catalog search failed.');
        }).finally(() => setLoading(false));
    };

    const addManual = () => {
        if (isEdit) {
            onSave?.(buildPatch());
            return;
        }

        const templateNode = selectedLayoutTemplate ? createLayoutTemplateNode(selectedLayoutTemplate.value) : null;

        onAdd(createNode({
            ...(templateNode || {}),
            ...buildPatch(),
            children: templateNode?.children || [],
        }));
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
            description: type === 'blog_post' ? (item.intro || item.reference || '') : item.reference || '',
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
            item_count: isBlogCollectionType || isBlogCategoryType ? Number(itemCount || (isBlogCategoryType ? 8 : 4)) : 1,
            carousel_items: type === 'blog_carousel' ? Math.max(1, Math.min(6, Number(carouselItems || 3))) : 3,
            carousel_margin: type === 'blog_carousel' ? Math.max(0, Math.min(48, Number(carouselMargin || 12))) : 12,
            carousel_autoplay: type === 'blog_carousel' ? Boolean(carouselAutoplay) : false,
            carousel_autoplay_timeout: type === 'blog_carousel' ? Math.max(1000, Math.min(20000, Number(carouselAutoplayTimeout || 4500))) : 4500,
        };

        setCatalogSelectionState(patch);
    };

    return (
        <div className='tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4' role='presentation'>
            <div className='tw-grid tw-max-h-[92vh] tw-w-full tw-max-w-5xl tw-grid-rows-[auto_minmax(0,1fr)_auto] tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl' role='dialog' aria-modal='true' aria-labelledby='cci-nice-menu-add-content-title'>
                <div className='tw-flex tw-shrink-0 tw-items-start tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-6 tw-py-5'>
                    <div>
                        <h2 id='cci-nice-menu-add-content-title' className='tw-m-0 tw-text-xl tw-font-semibold tw-leading-tight tw-tracking-normal tw-text-cci-nm-text'>{dialogTitle}</h2>
                        <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                            {dialogDescription}
                        </p>
                    </div>
                    <Button variant="unstyled" type='button' className='tw-inline-flex tw-h-8 tw-w-8 tw-cursor-pointer tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-muted hover:tw-bg-slate-50' onClick={onCancel} aria-label={ __( 'Close add content modal', 'cci-nice-menu' ) }>
                        <X aria-hidden='true' className='tw-h-4 tw-w-4' />
                    </Button>
                </div>

                <div className={modalBodyClass}>
                    {!isEdit ? (
                        <div className='tw-grid tw-content-start tw-gap-4'>
                            {contentTypeGroups.map((group) => {
                                const groupItems = group.values
                                    .map((value) => contentTypes.find((item) => item.value === value))
                                    .filter(Boolean);

                                return (
                                    <div key={group.label} className='tw-grid tw-gap-2'>
                                        <div className='tw-px-1 tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700'>{group.label}</div>
                                        {groupItems.map((item) => {
                                            const Icon = item.icon;
                                            const active = !selectedTemplate && item.value === type;

                                            return (
                                                <Button variant="unstyled"
                                                    key={item.value}
                                                    type='button'
                                                    className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-none tw-transition-colors ${active ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white hover:tw-border-cci-nm-brandBorder hover:tw-bg-slate-50'}`}
                                                    onClick={() => selectContentType(item)}
                                                >
                                                    <span className='tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-cci-nm-brand tw-shadow-sm'>
                                                        <Icon aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                    </span>
                                                    <span className='tw-min-w-0'>
                                                        <strong className='tw-block tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text'>{item.label}</strong>
                                                        <span className='tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{item.description}</span>
                                                    </span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {allowStructurePresets ? ([    
                                { label: __( 'Structure presets', 'cci-nice-menu' ), items: structureTemplates },
                            ].map((section) => (
                                <div key={section.label} className='tw-grid tw-gap-2'>
                                    <div className='tw-px-1 tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700'>{section.label}</div>
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = selectedTemplate === item.value;

                                        return (
                                            <Button variant="unstyled"
                                                key={item.value}
                                                type='button'
                                                className={`tw-grid tw-cursor-pointer tw-grid-cols-[auto_minmax(0,1fr)] tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-p-3 tw-text-left tw-shadow-none tw-transition-colors ${active ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-cci-nm-border tw-bg-white hover:tw-border-cci-nm-brandBorder hover:tw-bg-slate-50'}`}
                                                onClick={() => selectLayoutTemplate(item)}
                                            >
                                                <span className='tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand tw-shadow-sm'>
                                                    <Icon aria-hidden='true' className='tw-h-4 tw-w-4' />
                                                </span>
                                                <span className='tw-min-w-0'>
                                                    <strong className='tw-block tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text'>{item.label}</strong>
                                                    <span className='tw-mt-0.5 tw-block tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{item.description}</span>
                                                </span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            ))) : null}
                        </div>
                    ) : null}

                    <div className='tw-grid tw-content-start tw-gap-4'>
                        {isEdit ? (
                            <ElementContextPanel type={type} label={label || initialNode?.label} description={editContextDescription} node={initialNode} />
                        ) : null}

                        {type === 'category_tree' ? (
                            <div className='tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4'>
                                <strong className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                    <FolderTree aria-hidden='true' className='tw-h-4 tw-w-4 tw-text-cci-nm-brand' />
                                    { __( 'Dynamic catalog mode', 'cci-nice-menu' ) }
                                </strong>
                                <p className='tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                    { __( 'Pick the source category. On the storefront, its direct child categories become vertical tabs, and each hovered category builds its right-side columns from live subcategories.', 'cci-nice-menu' ) }
                                </p>
                            </div>
                        ) : null}

                        <EditorPanel title={primaryPanelTitle} description={primaryPanelDescription}>
                        {needsCatalog ? (
                            <div className='tw-grid tw-gap-3'>
                                <Field label={isBlogPostType ? __( 'Filter blog posts', 'cci-nice-menu' ) : isProductType ? __( 'Filter products', 'cci-nice-menu' ) : type === 'cms_page' ? __( 'Filter CMS pages', 'cci-nice-menu' ) : __( 'Filter categories', 'cci-nice-menu' )}>
                                    <div className='tw-flex tw-gap-2'>
                                        <Input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.preventDefault();
                                                    searchCatalog();
                                                }
                                            }}
                                            placeholder={isBlogPostType ? __( 'Filter posts by title, intro or slug', 'cci-nice-menu' ) : isProductType ? __( 'Filter latest products by name or reference', 'cci-nice-menu' ) : type === 'cms_page' ? __( 'Filter CMS pages by title', 'cci-nice-menu' ) : __( 'Filter the category tree', 'cci-nice-menu' )}
                                        />
                                        <Button variant='secondary' type='button' onClick={searchCatalog} disabled={loading}>
                                            <PackageSearch aria-hidden='true' />
                                            {loading ? __( 'Loading...', 'cci-nice-menu' ) : 'Filter'}
                                        </Button>
                                    </div>
                                </Field>
                                {error ? <p className='tw-m-0 tw-text-sm tw-text-red-600'>{error}</p> : null}
                                <div className='tw-grid tw-gap-2'>
                                    <div className='tw-flex tw-items-center tw-justify-between tw-gap-3'>
                                        <strong className='tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                            {isBlogPostType ? __( 'Published posts', 'cci-nice-menu' ) : isProductType ? __( 'Latest products', 'cci-nice-menu' ) : type === 'cms_page' ? __( 'CMS pages', 'cci-nice-menu' ) : __( 'Category tree', 'cci-nice-menu' )}
                                        </strong>
                                        <span className='tw-text-xs tw-font-medium tw-text-cci-nm-muted'>
                                            { __( 'Available: %count%', 'cci-nice-menu' ).replace( '%count%', String( results.length ) ) }
                                        </span>
                                    </div>
                                    <CatalogResultPicker type={type} items={results} loading={loading} selectedId={entityId} onPick={addCatalogItem} />
                                </div>
                                {isEdit || entityId ? (
                                    <FieldGroup>
                                        <Field label='Source label'>
                                            <Input value={sourceLabel || label} disabled />
                                        </Field>
                                        <Field label='Source URL'>
                                            <Input value={sourceUrl || link} disabled />
                                        </Field>
                                        <Field label='Custom label override'>
                                            <Input
                                                value={labelOverride}
                                                onChange={(event) => setLabelOverride(event.target.value)}
                                                placeholder={`Leave empty to use the current ${entityCopy.name}`}
                                            />
                                        </Field>
                                        {linkMode !== 'span' ? (
                                            <Field label='Custom URL override'>
                                                <Input
                                                    value={urlOverride}
                                                    onChange={(event) => setUrlOverride(event.target.value)}
                                                    placeholder={`Leave empty to generate the current ${entityCopy.url}`}
                                                />
                                            </Field>
                                        ) : null}
                                        <Field label={__('Description', 'cci-nice-menu')}>
                                            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                                        </Field>
                                        {['category', 'cms_page', 'product', 'product_tile', 'blog_post'].includes(type) ? (
                                            <Field label={type === 'category' ? __('Category image URL', 'cci-nice-menu') : isProductType ? __('Product image URL', 'cci-nice-menu') : isBlogPostType ? __('Blog cover image URL', 'cci-nice-menu') : __('Item image URL', 'cci-nice-menu')}>
                                                <LocalMediaUrlInput
                                                    value={imageUrl}
                                                    onChange={setImageUrl}
                                                    placeholder={isBlogPostType ? __('Leave empty to use the current blog cover image', 'cci-nice-menu') : __('Leave empty to use the current catalog image', 'cci-nice-menu')}
                                                />
                                                <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                                                    {__('Optional media shown next to the item label. It is not the click target URL.', 'cci-nice-menu')}
                                                </p>
                                            </Field>
                                        ) : null}
                                        {isProductType ? (
                                            <Field label={__('Product price', 'cci-nice-menu')}>
                                                <Input
                                                    value={price}
                                                    onChange={(event) => setPrice(event.target.value)}
                                                    placeholder={__('Leave empty to use the current shop price', 'cci-nice-menu')}
                                                />
                                            </Field>
                                        ) : null}
                                        {type === 'product_tile' ? (
                                            <div className='md:tw-col-span-2'>
                                                <ToggleField checked={useFallbackProductTile} label={__('Use editable product card', 'cci-nice-menu')} onChange={setUseFallbackProductTile} />
                                            </div>
                                        ) : null}
                                        {entityId ? (
                                            <div className='tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-3 tw-text-xs tw-font-semibold tw-text-cci-nm-muted'>
                                                <span>{ __( 'Selected ID: #', 'cci-nice-menu' ) }{entityId}</span>
                                                {['category', 'category_tree'].includes(type) ? <span>{ __( 'Products: %count%', 'cci-nice-menu' ).replace( '%count%', String( productCount ) ) }</span> : null}
                                            </div>
                                        ) : null}
                                    </FieldGroup>
                                ) : null}
                            </div>
                        ) : (
                            <FieldGroup>
                                <Field label='Label'>
                                    <Input value={label} onChange={(event) => setLabel(event.target.value)} />
                                </Field>
                                {isBlogCollectionType ? (
                                    <Field label={__('Item count', 'cci-nice-menu')}>
                                        <NumberInputWithUnit value={itemCount} unit='posts' min={1} onChange={(value) => setItemCount(Math.max(1, Math.min(24, Number(value || 4))))} />
                                    </Field>
                                ) : null}
                                {type === 'blog_carousel' ? (
                                    <>
                                        <Field label={__('Carousel items', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={carouselItems} unit='visible' min={1} onChange={(value) => setCarouselItems(Math.max(1, Math.min(6, Number(value || 3))))} />
                                        </Field>
                                        <Field label={__('Carousel margin', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={carouselMargin} unit='px' min={0} onChange={(value) => setCarouselMargin(Math.max(0, Math.min(48, Number(value || 12))))} />
                                        </Field>
                                        <Field label={__('Autoplay delay', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={carouselAutoplayTimeout} unit='ms' min={1000} onChange={(value) => setCarouselAutoplayTimeout(Math.max(1000, Math.min(20000, Number(value || 4500))))} />
                                        </Field>
                                        <div className='tw-flex tw-items-end'>
                                            <ToggleField checked={carouselAutoplay} label={__('Autoplay carousel', 'cci-nice-menu')} onChange={setCarouselAutoplay} />
                                        </div>
                                    </>
                                ) : null}
                                {isBlogCategoryType ? (
                                    <>
                                        <Field label={__('Category source', 'cci-nice-menu')}>
                                            <Select
                                                value={blogCategoryMode === 'selected' ? 'selected' : 'all'}
                                                onValueChange={(value) => setBlogCategoryMode(value === 'selected' ? 'selected' : 'all')}
                                                options={[
                                                    { value: 'all', label: __('All categories automatically', 'cci-nice-menu') },
                                                    { value: 'selected', label: __('Selected categories only', 'cci-nice-menu') },
                                                ]}
                                            />
                                        </Field>
                                        <Field label={__('Item count', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={itemCount} unit='categories' min={1} onChange={(value) => setItemCount(Math.max(1, Math.min(24, Number(value || 8))))} />
                                        </Field>
                                        <Field label={__('Sort categories', 'cci-nice-menu')}>
                                            <Select
                                                value={blogCategorySort}
                                                onValueChange={(value) => setBlogCategorySort(normalizeBlogCategorySort(value))}
                                                options={blogCategorySortOptions}
                                            />
                                        </Field>
                                        <Field label={__('Category media', 'cci-nice-menu')}>
                                            <Select
                                                value={blogCategoryMediaMode}
                                                onValueChange={(value) => setBlogCategoryMediaMode(normalizeBlogCategoryMediaMode(value))}
                                                options={blogCategoryMediaOptions}
                                            />
                                        </Field>
                                        <div className='tw-grid tw-gap-2 md:tw-col-span-2'>
                                            <ToggleField checked={blogCategoryHideEmpty} label={__('Hide empty categories', 'cci-nice-menu')} onChange={setBlogCategoryHideEmpty} />
                                            <ToggleField checked={blogCategoryShowCount} label={__('Show post count', 'cci-nice-menu')} onChange={setBlogCategoryShowCount} />
                                        </div>
                                        {blogCategoryMode === 'selected' ? (
                                            <div className='tw-grid tw-gap-3 md:tw-col-span-2'>
                                                <Field label={__('Select blog categories', 'cci-nice-menu')}>
                                                    <Input
                                                        value={blogCategoryQuery}
                                                        onChange={(event) => setBlogCategoryQuery(event.target.value)}
                                                        placeholder={__('Search categories by title or slug', 'cci-nice-menu')}
                                                    />
                                                </Field>
                                                {blogCategoryError ? <p className='tw-m-0 tw-text-sm tw-text-red-600'>{blogCategoryError}</p> : null}
                                                <div className='tw-grid tw-max-h-64 tw-gap-1 tw-overflow-auto tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-cci-nm-surfaceSoft tw-p-3'>
                                                    {blogCategoryLoading ? (
                                                        <span className='tw-p-2 tw-text-sm tw-text-cci-nm-muted'>{__('Loading categories...', 'cci-nice-menu')}</span>
                                                    ) : visibleBlogCategoryRows.length ? visibleBlogCategoryRows.map((item) => {
                                                        const itemId = item.id;
                                                        const checked = selectedBlogCategoryIds.has(itemId);
                                                        const isCollapsed = collapsedBlogCategoryIds.has(itemId);
                                                        const ToggleIcon = isCollapsed ? ChevronRight : ChevronDown;
                                                        const toggleChecked = (nextChecked) => {
                                                            setBlogCategoryIds((current) => {
                                                                const normalized = normalizeBlogCategoryIds(current);
                                                                if (nextChecked) {
                                                                    return normalized.includes(itemId) ? normalized : [...normalized, itemId];
                                                                }

                                                                return normalized.filter((id) => id !== itemId);
                                                            });
                                                        };

                                                        return (
                                                            <div
                                                                key={itemId}
                                                                data-cci-nice-menu-blog-category-row='true'
                                                                data-cci-nice-menu-blog-category-depth={item.depth}
                                                                className={[
                                                                    'tw-grid tw-min-h-10 tw-grid-cols-[auto_auto_minmax(0,1fr)_auto] tw-items-center tw-gap-2.5 tw-rounded-md tw-border tw-border-solid tw-py-1.5 tw-pr-3 tw-text-sm tw-leading-5 tw-transition-colors',
                                                                    checked ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft' : 'tw-border-transparent tw-bg-transparent hover:tw-border-cci-nm-border hover:tw-bg-white',
                                                                ].join(' ')}
                                                                style={{ paddingLeft: `${10 + item.depth * 20}px` }}
                                                            >
                                                                <button
                                                                    type='button'
                                                                    className={[
                                                                        'tw-inline-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-p-0 tw-shadow-none tw-transition-colors',
                                                                        item.hasChildren ? 'tw-cursor-pointer tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-muted hover:tw-border-cci-nm-brandBorder hover:tw-bg-cci-nm-brandSoft hover:tw-text-cci-nm-brand' : 'tw-cursor-default tw-border-transparent tw-bg-transparent tw-text-transparent',
                                                                    ].join(' ')}
                                                                    disabled={!item.hasChildren}
                                                                    aria-label={isCollapsed ? __('Expand category', 'cci-nice-menu') : __('Collapse category', 'cci-nice-menu')}
                                                                    aria-expanded={item.hasChildren ? !isCollapsed : undefined}
                                                                    onClick={() => item.hasChildren && toggleBlogCategoryCollapsed(itemId)}
                                                                >
                                                                    {item.hasChildren ? <ToggleIcon aria-hidden='true' className='tw-h-4 tw-w-4' /> : null}
                                                                </button>
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onCheckedChange={(nextChecked) => toggleChecked(nextChecked === true)}
                                                                />
                                                                <button
                                                                    type='button'
                                                                    className='tw-grid tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-left'
                                                                    onClick={() => toggleChecked(!checked)}
                                                                >
                                                                    <span className={`tw-block tw-truncate tw-text-sm tw-leading-5 tw-text-cci-nm-text ${item.hasChildren ? 'tw-font-semibold' : 'tw-font-medium'}`}>{item.name}</span>
                                                                    <span className='tw-block tw-truncate tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{item.reference || item.url || ''}</span>
                                                                </button>
                                                                <span className='tw-rounded-full tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-2 tw-py-0.5 tw-text-xs tw-font-semibold tw-text-cci-nm-muted'>
                                                                    {Number(item.post_count || 0)}
                                                                </span>
                                                            </div>
                                                        );
                                                    }) : (
                                                        <span className='tw-p-2 tw-text-sm tw-text-cci-nm-muted'>{__('No categories found.', 'cci-nice-menu')}</span>
                                                    )}
                                                </div>
                                                <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                                                    {blogCategoryIds.length
                                                        ? __('Selected categories stay in their tree position.', 'cci-nice-menu')
                                                        : __('Select at least one category or switch the source back to automatic.', 'cci-nice-menu')}
                                                </p>
                                            </div>
                                        ) : null}
                                    </>
                                ) : null}
                                {type === 'row' ? (
                                    <Field label='Row preset'>
                                        <Select
                                            value={getLayoutPresetValue(componentVariant)}
                                            onValueChange={(value) => {
                                                if (value === '__generic__') {
                                                    setComponentVariant('');
                                                    return;
                                                }

                                                if (value.startsWith('component:')) {
                                                    setComponentVariant(normalizeComponentVariant(value.replace('component:', '')));
                                                    return;
                                                }

                                                setComponentVariant('');
                                            }}
                                            options={rowLayoutOptions}
                                        />
                                    </Field>
                                ) : null}
                                {type === 'column' ? (
                                    <Field label='Column layout'>
                                        <Select
                                            value={getLayoutPresetValue(componentVariant)}
                                            onValueChange={(value) => {
                                                if (value === '__generic__') {
                                                    setComponentVariant('');
                                                    return;
                                                }

                                                if (value.startsWith('component:')) {
                                                    setComponentVariant(normalizeComponentVariant(value.replace('component:', '')));
                                                    return;
                                                }

                                                setComponentVariant('');
                                            }}
                                            options={columnLayoutOptions}
                                        />
                                    </Field>
                                ) : null}
                                {type === 'block' ? (
                                    <Field label='Block preset'>
                                        <Select
                                            value={getBlockLayoutValue(componentVariant)}
                                            onValueChange={(value) => {
                                                if (value === '__generic__') {
                                                    setComponentVariant('');
                                                    return;
                                                }

                                                if (value.startsWith('component:')) {
                                                    setComponentVariant(normalizeComponentVariant(value.replace('component:', '')));
                                                    return;
                                                }

                                                setComponentVariant('');
                                            }}
                                            options={blockLayoutOptions}
                                        />
                                    </Field>
                                ) : null}
                                {type === 'block' ? (
                                    <div className='md:tw-col-span-2'>
                                        <ToggleField checked={hideHeading} label={__('Hide block heading', 'cci-nice-menu')} onChange={setHideHeading} />
                                    </div>
                                ) : null}
                                {type === 'block' ? (
                                    <Field label='Heading link'>
                                        <Input
                                            value={headingLink}
                                            onChange={(event) => setHeadingLink(event.target.value)}
                                            placeholder='e.g. /category or https://...'
                                        />
                                    </Field>
                                ) : null}
                                {type === 'block' ? (
                                    <Field label='Heading action label'>
                                        <Input
                                            value={headingLinkLabel}
                                            onChange={(event) => setHeadingLinkLabel(event.target.value)}
                                            placeholder={ __( 'e.g. View all', 'cci-nice-menu' ) }
                                        />
                                    </Field>
                                ) : null}
                                {type === 'block' ? (
                                    <Field label={__('Heading action icon', 'cci-nice-menu')}>
                                        <div className='tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-gap-2'>
                                            <Input
                                                value={headingLinkIcon}
                                                onChange={(event) => setHeadingLinkIcon(event.target.value)}
                                                placeholder={iconPlaceholder}
                                            />
                                            <span className='tw-inline-flex tw-h-10 tw-min-w-10 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-brand'>
                                                {headingLinkIcon ? (
                                                    <span aria-hidden='true' className={`tw-inline-flex tw-h-5 tw-w-5 tw-items-center tw-justify-center tw-text-lg tw-leading-none ${normalizeIconClass(headingLinkIcon)}`} />
                                                ) : (
                                                    <Link2 aria-hidden='true' className='tw-h-4 tw-w-4 tw-text-cci-nm-muted' />
                                                )}
                                            </span>
                                        </div>
                                    </Field>
                                ) : null}
                                {type === 'block' ? (
                                    <Field label={__('Description', 'cci-nice-menu')}>
                                        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                                    </Field>
                                ) : null}
                                {isHook ? (
                                    <>
                                        <Field label='Hook name'>
                                            <Select
                                                value={hookName}
                                                onValueChange={setHookName}
                                                options={buildHookNameOptions(hookName)}
                                            />
                                        </Field>
                                        <Field label='Custom hook name'>
                                            <Input
                                                value={hookName}
                                                onChange={(event) => setHookName(event.target.value)}
                                                placeholder='displayCustomHook'
                                            />
                                        </Field>
                                        <InfoCallout title={ __( 'PrestaShop hook output', 'cci-nice-menu' ) }>
                                            { __( 'The storefront renders modules currently attached to this hook. Menu display hooks are blocked to avoid recursive menu rendering.', 'cci-nice-menu' ) }
                                        </InfoCallout>
                                    </>
                                ) : null}
                                {type === 'row' ? (
                                    <Field label='Row width'>
                                        <NumberInputWithUnit value={columnSpan} unit='of 12' min={0} onChange={(value) => setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))} />
                                        <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Use 12 for a full-width row. Nested rows can use a smaller width when needed.', 'cci-nice-menu' ) }</p>
                                    </Field>
                                ) : null}
                                {type === 'column' ? (
                                    <>
                                        <Field label='Column behavior'>
                                            <Select
                                                value={layoutRole === 'tabs' ? `tabs_${tabsOrientation}` : 'content'}
                                                onValueChange={(value) => {
                                                    if (value === 'content') {
                                                        setLayoutRole('');
                                                        setTabsOrientation('vertical');
                                                        return;
                                                    }

                                                    setLayoutRole('tabs');
                                                    setTabsOrientation(value === 'tabs_horizontal' ? 'horizontal' : 'vertical');
                                                }}
                                                options={[
                                                    { value: 'content', label: __( 'Content column', 'cci-nice-menu' ) },
                                                    { value: 'tabs_vertical', label: __( 'Tabs - vertical', 'cci-nice-menu' ) },
                                                    { value: 'tabs_horizontal', label: __( 'Tabs - horizontal', 'cci-nice-menu' ) },
                                                ]}
                                            />
                                        </Field>
                                        <Field label='Column width'>
                                            <NumberInputWithUnit value={columnSpan} unit='of 12' min={0} onChange={(value) => setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))} />
                                            <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Use 0 for auto width. Example: 6, 3, 3 fills one 12-column row.', 'cci-nice-menu' ) }</p>
                                        </Field>
                                        {layoutRole === 'tabs' ? (
                                            <div className='tw-grid tw-gap-3 md:tw-col-span-2 md:tw-grid-cols-3'>
                                                <OptionalNodeLengthInput
                                                    label='Tabs content height'
                                                    value={tabsContentHeight}
                                                    fallback='680px'
                                                    onChange={setTabsContentHeight}
                                                />
                                                <OptionalNodeLengthInput
                                                    label='Tablet height'
                                                    value={tabsContentHeightTablet}
                                                    fallback='620px'
                                                    onChange={setTabsContentHeightTablet}
                                                />
                                                <OptionalNodeLengthInput
                                                    label='Mobile height'
                                                    value={tabsContentHeightMobile}
                                                    fallback='72vh'
                                                    onChange={setTabsContentHeightMobile}
                                                />
                                                <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted md:tw-col-span-3'>
                                                    { __( 'Optional. Leave empty for natural height. When set, the tab content area scrolls within that height on the matching breakpoint.', 'cci-nice-menu' ) }
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
                                        <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                                            {linkMode === 'span'
                                                ? __('Renders a non-clickable span on the storefront.', 'cci-nice-menu')
                                                : __('Renders a clickable anchor on the storefront.', 'cci-nice-menu')}
                                        </p>
                                    </Field>
                                ) : null}
                                {!isStructure && linkMode !== 'span' && !['video', 'map', 'blog_categories'].includes(type) && !isHook ? (
                                    <Field label='URL'>
                                        <Input value={link} onChange={(event) => setLink(event.target.value)} />
                                    </Field>
                                ) : null}
                                {type === 'custom' ? (
                                    <Field label={__('Item image URL', 'cci-nice-menu')}>
                                        <LocalMediaUrlInput value={imageUrl} onChange={setImageUrl} />
                                        <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                                            {__('Optional media shown next to the item label. It is not the click target URL.', 'cci-nice-menu')}
                                        </p>
                                    </Field>
                                ) : null}
                                {type === 'banner' ? (
                                    <Field label='CTA label'>
                                        <Input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} />
                                    </Field>
                                ) : null}
                                {type === 'banner' ? (
                                    <Field label={__('Banner eyebrow', 'cci-nice-menu')}>
                                        <Input value={bannerEyebrow} onChange={(event) => setBannerEyebrow(event.target.value)} />
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
                                    <div className='md:tw-col-span-2'>
                                        <ToggleField checked={target} label='Open heading link in new tab' onChange={setTarget} />
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
                                        <Field label='Map location'>
                                            <Input
                                                value={mapQuery}
                                                onChange={(event) => setMapQuery(event.target.value)}
                                                placeholder={ __( 'Address, place name or lat,lng', 'cci-nice-menu' ) }
                                            />
                                        </Field>
                                        <Field label='Map zoom'>
                                            <NumberInputWithUnit value={mapZoom} unit='zoom' min={1} onChange={(value) => setMapZoom(Math.max(1, Math.min(20, Number(value || 15))))} />
                                        </Field>
                                        <Field label='Custom embed URL'>
                                            <Input
                                                value={mapEmbedUrl}
                                                onChange={(event) => setMapEmbedUrl(event.target.value)}
                                                placeholder={ __( 'Optional Google Maps or OpenStreetMap embed URL', 'cci-nice-menu' ) }
                                            />
                                        </Field>
                                        <Field label={__('Fallback image URL', 'cci-nice-menu')}>
                                            <LocalMediaUrlInput
                                                value={imageUrl}
                                                onChange={setImageUrl}
                                                placeholder='/modules/cci_nice_menu/views/img/showcase-map.svg'
                                            />
                                        </Field>
                                        <InfoCallout title={ __( 'Dynamic map', 'cci-nice-menu' ) }>
                                            { __( 'If a custom embed URL is empty, the storefront builds a map iframe from the location field. The fallback image is used only when no location is provided.', 'cci-nice-menu' ) }
                                        </InfoCallout>
                                    </>
                                ) : null}
                                {!isStructure && !isHook && type !== 'video' && type !== 'block' ? (
                                    <Field label={__('Description', 'cci-nice-menu')}>
                                        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                                    </Field>
                                ) : null}
                                {type === 'video' ? (
                                    <>
                                        <Field label='Video source'>
                                            <Select
                                                value={videoProvider}
                                                onValueChange={setVideoProvider}
                                                options={[
                                                    { value: 'youtube', label: 'YouTube' },
                                                    { value: 'file', label: __( 'Self-hosted file', 'cci-nice-menu' ) },
                                                ]}
                                            />
                                        </Field>
                                        <Field label={videoProvider === 'youtube' ? __( 'YouTube URL or ID', 'cci-nice-menu' ) : __( 'Video file URL', 'cci-nice-menu' )}>
                                            <Input
                                                value={videoUrl}
                                                onChange={(event) => setVideoUrl(event.target.value)}
                                                placeholder={videoProvider === 'youtube' ? 'https://www.youtube.com/watch?v=... or video ID' : 'https://.../video.mp4'}
                                            />
                                        </Field>
                                        <Field label='CTA link'>
                                            <Input
                                                value={link}
                                                onChange={(event) => setLink(event.target.value)}
                                                placeholder='/ or https://...'
                                            />
                                        </Field>
                                        <Field label='CTA label'>
                                            <Input
                                                value={ctaLabel}
                                                onChange={(event) => setCtaLabel(event.target.value)}
                                                placeholder={ __( 'Optional', 'cci-nice-menu' ) }
                                            />
                                        </Field>
                                        <div className='tw-flex tw-items-end'>
                                            <ToggleField checked={target} label='Open CTA link in new tab' onChange={setTarget} />
                                        </div>
                                        <Field label={__('Poster image URL', 'cci-nice-menu')}>
                                            <LocalMediaUrlInput
                                                value={videoPoster}
                                                onChange={setVideoPoster}
                                                placeholder={videoProvider === 'youtube' ? __( 'Optional custom thumbnail', 'cci-nice-menu' ) : __( 'Recommended for self-hosted videos', 'cci-nice-menu' )}
                                            />
                                        </Field>
                                        <Field label='Aspect ratio'>
                                            <Select
                                                value={videoAspect}
                                                onValueChange={setVideoAspect}
                                                options={[
                                                    { value: '16:9', label: __( '16:9 widescreen', 'cci-nice-menu' ) },
                                                    { value: '21:9', label: __( '21:9 cinematic', 'cci-nice-menu' ) },
                                                    { value: '4:3', label: __( '4:3 standard', 'cci-nice-menu' ) },
                                                    { value: '1:1', label: __( '1:1 square', 'cci-nice-menu' ) },
                                                    { value: '9:16', label: __( '9:16 vertical', 'cci-nice-menu' ) },
                                                ]}
                                            />
                                        </Field>
                                        <Field label='Video size'>
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
                                        <Field label='Caption / description'>
                                            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                                        </Field>
                                        <Field label='Start at'>
                                            <InputGroup>
                                                <InputGroupInput
                                                    type='number'
                                                    min='0'
                                                    value={videoStart}
                                                    onChange={(event) => setVideoStart(event.target.value)}
                                                    placeholder='0'
                                                />
                                                <InputGroupAddon align='inline-end'>
                                                    <InputGroupText>sec</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Field>
                                        <Field label='End at'>
                                            <InputGroup>
                                                <InputGroupInput
                                                    type='number'
                                                    min='0'
                                                    value={videoEnd}
                                                    onChange={(event) => setVideoEnd(event.target.value)}
                                                    placeholder={ __( 'Optional', 'cci-nice-menu' ) }
                                                />
                                                <InputGroupAddon align='inline-end'>
                                                    <InputGroupText>sec</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Field>
                                        <div className='tw-grid tw-gap-2 md:tw-col-span-2 md:tw-grid-cols-2'>
                                            <ToggleField
                                                checked={videoAutoplay}
                                                label='Autoplay'
                                                onChange={(checked) => {
                                                    setVideoAutoplay(checked);
                                                    if (checked) {
                                                        setVideoMuted(true);
                                                    }
                                                }}
                                            />
                                            <ToggleField checked={videoMuted} label='Muted' onChange={setVideoMuted} />
                                            <ToggleField checked={videoLoop} label='Loop' onChange={setVideoLoop} />
                                            <ToggleField checked={videoControls} label='Show controls' onChange={setVideoControls} />
                                            <ToggleField checked={videoLazy} label='Lazy load' onChange={setVideoLazy} />
                                        </div>
                                        <InfoCallout title={ __( 'Video behaviour', 'cci-nice-menu' ) }>
                                            { __( 'Autoplay is saved as muted by default because modern browsers block autoplay with sound. YouTube embeds use privacy-friendly youtube-nocookie URLs.', 'cci-nice-menu' ) }
                                        </InfoCallout>
                                    </>
                                ) : null}
                            </FieldGroup>
                        )}
                        </EditorPanel>

                        <EditorPanel
                            title={ __( 'Appearance and behaviour', 'cci-nice-menu' ) }
                            description='Optional styling, icon, badge and advanced display settings.'
                            defaultOpen={!isEdit || hasAppearanceOverrides}
                        >
                            <div className='tw-grid tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 md:tw-grid-cols-2'>
                                {!isStructure ? (
                                    <Field label='Icon class' className='md:tw-col-span-2'>
                                        <div className='tw-grid tw-grid-cols-[minmax(0,1fr)_auto] tw-gap-2'>
                                            <Input value={icon} onChange={(event) => setIcon(event.target.value)} placeholder={iconPlaceholder} />
                                            <span className='tw-inline-flex tw-h-10 tw-min-w-10 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-text-cci-nm-brand'>
                                                {icon ? (
                                                    <span aria-hidden='true' className={`tw-inline-flex tw-h-5 tw-w-5 tw-items-center tw-justify-center tw-text-lg tw-leading-none ${normalizeIconClass(icon)}`} />
                                                ) : (
                                                    <Link2 aria-hidden='true' className='tw-h-4 tw-w-4 tw-text-cci-nm-muted' />
                                                )}
                                            </span>
                                        </div>
                                        <div className='tw-mt-2 tw-space-y-2'>
                                            <InfoCallout
                                                title={iconHelp.label}
                                                actions={
                                                    iconLibrary === 'none' && onOpenSettings ? (
                                                        <Button type='button' variant='secondary' size='xs' onClick={onOpenSettings}>
                                                            { __( 'Open Settings', 'cci-nice-menu' ) }
                                                        </Button>
                                                    ) : null
                                                }
                                            >
                                                {iconHelp.description}
                                            </InfoCallout>
                                            {iconHelp.examples.length ? (
                                                <div className='tw-grid tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-3 tw-text-xs tw-leading-relaxed tw-text-cci-nm-muted'>
                                                    <div className='tw-grid tw-gap-2'>
                                                        <span className='tw-text-xs tw-font-semibold tw-leading-5 tw-tracking-normal tw-text-slate-700'>{ __( 'Examples', 'cci-nice-menu' ) }</span>
                                                        <div className='tw-flex tw-flex-wrap tw-gap-2'>
                                                        {iconHelp.examples.map((example) => (
                                                            <Button
                                                                key={example}
                                                                type='button'
                                                                variant='secondary'
                                                                size='sm'
                                                                className='!tw-h-8 !tw-rounded-md !tw-border-cci-nm-border !tw-bg-white !tw-px-2.5 tw-font-mono tw-text-[12px] hover:!tw-border-cci-nm-brandBorder hover:!tw-bg-cci-nm-brandSoft hover:!tw-text-cci-nm-brandStrong'
                                                                onClick={() => setIcon(example)}
                                                            >
                                                                {example}
                                                            </Button>
                                                        ))}
                                                        </div>
                                                    </div>
                                                    {iconHelp.catalogUrl ? (
                                                        <Button
                                                            asChild
                                                            variant='outlineAccent'
                                                            size='sm'
                                                            className='tw-w-fit'
                                                        >
                                                            <a href={iconHelp.catalogUrl} target='_blank' rel='noreferrer'>
                                                                <ExternalLink aria-hidden='true' />
                                                                { __( 'Open icon catalog', 'cci-nice-menu' ) }
                                                            </a>
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </div>
                                    </Field>
                                ) : null}
                                {allowsMenuBadge && !isStructure ? (
                                    <Field label='Badge'>
                                        <Input value={badge} onChange={(event) => setBadge(event.target.value)} />
                                    </Field>
                                ) : null}
                                {isTopLevel ? (
                                    <div className='tw-grid tw-gap-3 md:tw-col-span-2 md:tw-grid-cols-3'>
                                        <Field label={__('Top-level placement', 'cci-nice-menu')}>
                                            <Select
                                                value={topLevelPlacement || 'normal'}
                                                onValueChange={(value) => setTopLevelPlacement(value === 'right' ? 'right' : '')}
                                                options={[
                                                    { value: 'normal', label: __('Normal flow', 'cci-nice-menu') },
                                                    { value: 'right', label: __('Push to right', 'cci-nice-menu') },
                                                ]}
                                            />
                                        </Field>
                                        <Field label={__('Column start', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={topLevelColumnStart} unit={__('of 12', 'cci-nice-menu')} min={0} onChange={(value) => setTopLevelColumnStart(Math.max(0, Math.min(12, Number(value || 0))))} />
                                            <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{__('Use 0 for automatic placement.', 'cci-nice-menu')}</p>
                                        </Field>
                                        <Field label={__('Top-level width', 'cci-nice-menu')}>
                                            <NumberInputWithUnit value={columnSpan} unit={__('of 12', 'cci-nice-menu')} min={0} onChange={(value) => setColumnSpan(Math.max(0, Math.min(12, Number(value || 0))))} />
                                            <p className='tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{__('Use 0 for automatic width.', 'cci-nice-menu')}</p>
                                        </Field>
                                    </div>
                                ) : null}
                                <div className='tw-grid tw-gap-2 md:tw-col-span-2'>
                                    <div>
                                        <FieldLabel>{__('Storefront visibility', 'cci-nice-menu')}</FieldLabel>
                                        <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                                            {__('Hide this element on selected viewport groups without removing it from the menu structure.', 'cci-nice-menu')}
                                        </p>
                                    </div>
                                    <div className='tw-grid tw-gap-2 md:tw-grid-cols-3'>
                                        <ToggleField checked={hideOnDesktop} label={__('Hide on desktop', 'cci-nice-menu')} onChange={setHideOnDesktop} />
                                        <ToggleField checked={hideOnTablet} label={__('Hide on tablet', 'cci-nice-menu')} onChange={setHideOnTablet} />
                                        <ToggleField checked={hideOnMobile} label={__('Hide on mobile', 'cci-nice-menu')} onChange={setHideOnMobile} />
                                    </div>
                                </div>
                                <OptionalNodeColorInput
                                    label='Background'
                                    value={styleBackground}
                                    fallback='#f3f8ff'
                                    onChange={setStyleBackground}
                                />
                                <OptionalNodeColorInput
                                    label='Background 2'
                                    value={styleBackground2}
                                    fallback='#ffffff'
                                    onChange={setStyleBackground2}
                                />
                                <OptionalNodeColorInput
                                    label='Text color'
                                    value={styleText}
                                    fallback='#111827'
                                    onChange={setStyleText}
                                />
                                <OptionalNodeColorInput
                                    label={__('Icon color', 'cci-nice-menu')}
                                    value={styleIcon}
                                    fallback='#0d6efd'
                                    onChange={setStyleIcon}
                                />
                                <OptionalNodeColorInput
                                    label='Border'
                                    value={styleBorder}
                                    fallback='#dbe7f3'
                                    onChange={setStyleBorder}
                                />
                                <OptionalNodeLengthInput
                                    label='Rounded'
                                    value={styleRadius}
                                    fallback='12px'
                                    units={radiusLengthUnits}
                                    onChange={setStyleRadius}
                                />
                                {allowsBadgeColors && !isStructure ? (
                                    <>
                                        <OptionalNodeColorInput
                                            label={allowsActionLabel ? __( 'CTA background', 'cci-nice-menu' ) : __( 'Badge background', 'cci-nice-menu' )}
                                            value={styleBadgeBackground}
                                            fallback='#0d6efd'
                                            onChange={setStyleBadgeBackground}
                                        />
                                        <OptionalNodeColorInput
                                            label={allowsActionLabel ? __( 'CTA text', 'cci-nice-menu' ) : __( 'Badge text', 'cci-nice-menu' )}
                                            value={styleBadgeText}
                                            fallback='#ffffff'
                                            onChange={setStyleBadgeText}
                                        />
                                    </>
                                ) : null}
                                {!isStructure ? (
                                    <>
                                        {!isTopLevel ? (
                                            <Field label='Columns'>
                                                <NumberInputWithUnit value={columns} unit='cols' min={1} onChange={setColumns} />
                                            </Field>
                                        ) : null}
                                        <div className='md:tw-col-span-2'>
                                            <ToggleField checked={target} label='Open in new tab' icon={ExternalLink} onChange={setTarget} />
                                        </div>
                                        <div className='md:tw-col-span-2'>
                                            <ToggleField checked={iconOnly} label='Icon only on storefront' onChange={setIconOnly} />
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </EditorPanel>
                    </div>
                </div>

                <div className='tw-flex tw-shrink-0 tw-justify-end tw-gap-2 tw-border-0 tw-border-t tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-4'>
                    <Button variant='secondary' type='button' onClick={onCancel}>{ __( 'Cancel', 'cci-nice-menu' ) }</Button>
                    {isEdit ? (
                        <Button variant='save' type='button' onClick={addManual}>
                            <Check aria-hidden='true' />
                            { __( 'Save changes', 'cci-nice-menu' ) }
                        </Button>
                    ) : !needsCatalog ? (
                        <Button variant='save' type='button' onClick={addManual}>
                            <Plus aria-hidden='true' />
                            { __( 'Add content', 'cci-nice-menu' ) }
                        </Button>
                    ) : (
                        <Button variant='save' type='button' onClick={addManual} disabled={!canSaveCatalogSelection}>
                            <Plus aria-hidden='true' />
                            { __( 'Add content', 'cci-nice-menu' ) }
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function MultistoreMenuCopy({ context, menuId, saving, onCopy }) {
    const targetShops = React.useMemo(
        () => (Array.isArray(context?.shops) ? context.shops : []).filter((shop) => !shop.current && shop.active !== false),
        [context]
    );
    const [selectedShopIds, setSelectedShopIds] = React.useState([]);

    React.useEffect(() => {
        setSelectedShopIds([]);
    }, [menuId, context?.currentShopId]);

    if (!context?.enabled || !context?.featureActive || targetShops.length === 0 || typeof onCopy !== 'function') {
        return null;
    }

    const toggleShop = (shopId, checked) => {
        setSelectedShopIds((current) => checked
            ? Array.from(new Set([...current, shopId]))
            : current.filter((id) => id !== shopId));
    };
    const copy = () => {
        if (!menuId || selectedShopIds.length === 0) {
            return;
        }

        Promise.resolve(onCopy(selectedShopIds))
            .then(() => setSelectedShopIds([]))
            .catch(() => {});
    };

    return (
        <section className='tw-grid tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-4 lg:tw-grid-cols-[minmax(180px,0.65fr)_minmax(0,1fr)_auto] lg:tw-items-center'>
            <div>
                <strong className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                    <Copy aria-hidden='true' className='tw-h-4 tw-w-4 tw-text-cci-nm-brand' />
                    { __( 'Multistore', 'cci-nice-menu' ) }
                </strong>
                <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>
                    {menuId
                        ? __( 'Create independent copies in additional shops. Existing menus are not overwritten.', 'cci-nice-menu' )
                        : __( 'Save this menu before copying it to another shop.', 'cci-nice-menu' )}
                </p>
            </div>
            <div className='tw-flex tw-flex-wrap tw-gap-2'>
                {targetShops.map((shop) => {
                    const shopId = Number(shop.id || 0);
                    const checked = selectedShopIds.includes(shopId);

                    return (
                        <label key={shopId} className='tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-cci-nm-text'>
                            <Checkbox checked={checked} onCheckedChange={(value) => toggleShop(shopId, value === true)} />
                            <span>{shop.name || `#${shopId}`}</span>
                        </label>
                    );
                })}
            </div>
            <Button variant='outlineAccent' type='button' disabled={saving || !menuId || selectedShopIds.length === 0} onClick={copy}>
                <Copy aria-hidden='true' />
                {saving ? __( 'Copying...', 'cci-nice-menu' ) : __( 'Copy to shops', 'cci-nice-menu' )}
            </Button>
        </section>
    );
}

export default function MenuBuilderPanel({ isPro, onLicenseNotice, setNotice: pushNotice, onOpenSettings, onEditorStateChange }) {
    const initial = React.useMemo(readInitialPayload, []);
    const [menus, setMenus] = React.useState(initial.menus);
    const [working, setWorking] = React.useState(initial.activeMenu);
    const [tab, setTab] = React.useState('general');
    const [view, setView] = React.useState('list');
    const [activeTopIndex, setActiveTopIndex] = React.useState(0);
    const [selectedPath, setSelectedPath] = React.useState([0]);
    const [saving, setSaving] = React.useState(false);
    const [inlineNotice, setInlineNotice] = React.useState(null);
    const notify = React.useCallback((nextNotice) => {
        if (pushNotice) {
            pushNotice(nextNotice);
            return;
        }

        setInlineNotice(nextNotice);
    }, [pushNotice]);
    const [jsonImport, setJsonImport] = React.useState('');
    const [pendingDeletePath, setPendingDeletePath] = React.useState(null);
    const [pendingDeleteMenu, setPendingDeleteMenu] = React.useState(null);
    const [deletingMenu, setDeletingMenu] = React.useState(false);
    const [addContentTarget, setAddContentTarget] = React.useState(null);
    const [addContentPreset, setAddContentPreset] = React.useState('custom');
    const [editPath, setEditPath] = React.useState(null);
    const rawExport = React.useMemo(() => JSON.stringify(working, null, 2), [working]);
    const topMenuEntries = React.useMemo(() => collectTopMenuEntries(working.tree), [working.tree]);
    const safeTopIndex = Math.min(Math.max(activeTopIndex, 0), Math.max(topMenuEntries.length - 1, 0));
    const activeTopEntry = topMenuEntries[safeTopIndex] || topMenuEntries[0] || null;
    const activeTop = activeTopEntry?.node || null;
    const activeTopPath = activeTopEntry?.path || [];
    const menuList = React.useMemo(() => {
        const keyed = new Map();

        [...menus, working].forEach((menu) => {
            const normalized = normalizeMenu(menu);
            keyed.set(normalized.id_menu ? `id:${normalized.id_menu}` : `draft:${normalized.code}`, normalized);
        });

        return [...keyed.values()];
    }, [menus, working]);

    React.useEffect(() => {
        if (safeTopIndex !== activeTopIndex) {
            setActiveTopIndex(safeTopIndex);
        }
    }, [safeTopIndex, activeTopIndex]);

    React.useEffect(() => {
        if (typeof onEditorStateChange !== 'function') {
            return undefined;
        }

        onEditorStateChange(view === 'editor');

        return () => onEditorStateChange(false);
    }, [onEditorStateChange, view]);

    const changeMenu = (patch) => setWorking((current) => ({ ...current, ...patch }));
    const changeSettings = (patch) => setWorking((current) => ({ ...current, settings: { ...current.settings, ...patch } }));

    const createTopNavigationRow = (rowIndex = 0) => createNode({
        type: 'row',
        label: rowIndex > 0 ? `Top navigation row ${rowIndex + 1}` : 'Top navigation row',
        link: '',
        column_span: 12,
        children: [createColumn(1)],
    });

    const addTopRow = () => {
        setWorking((current) => {
            const existingRowIndex = current.tree.findIndex((node) => node?.type === 'row');
            if (existingRowIndex >= 0) {
                setSelectedPath([existingRowIndex]);
                setActiveTopIndex(0);
                return current;
            }

            const flatTopItems = current.tree.filter((node) => node && !isTopNavigationStructureNode(node));
            const row = createTopNavigationRow(0);
            const nextRow = flatTopItems.length
                ? {
                    ...row,
                    children: [{
                        ...row.children[0],
                        label: 'Primary navigation',
                        column_span: 12,
                        children: flatTopItems,
                    }],
                }
                : row;
            const nextTree = [nextRow];

            setSelectedPath([0]);
            setActiveTopIndex(0);
            return { ...current, tree: nextTree };
        });
    };

    const moveChildNode = (parentPath, fromIndex, toIndex) => {
        const targetPath = Array.isArray(parentPath) ? parentPath : [];
        const from = Number(fromIndex);
        const to = Number(toIndex);

        if (!Number.isInteger(from) || !Number.isInteger(to) || from === to) {
            return;
        }

        setWorking((current) => {
            const parentNode = targetPath.length ? getNodeAtPath(current.tree, targetPath) : null;
            const children = targetPath.length ? parentNode?.children || [] : current.tree;

            if (from < 0 || to < 0 || from >= children.length || to >= children.length) {
                return current;
            }

            const nextTree = targetPath.length
                ? updateNodeAtPath(current.tree, targetPath, (node) => ({ ...node, children: reorderItems(node.children || [], from, to) }))
                : reorderItems(current.tree, from, to);
            const nextSelectedPath = remapPathAfterMove(selectedPath, targetPath, from, to);
            const nextEntries = collectTopMenuEntries(nextTree);

            setSelectedPath(nextSelectedPath);
            setActiveTopIndex(findTopMenuEntryIndexByPath(nextEntries, nextSelectedPath));

            return { ...current, tree: nextTree };
        });
    };

    const addColumn = (parentPath = null) => {
        if (!activeTop && !Array.isArray(parentPath)) {
            return;
        }

        const targetPath = Array.isArray(parentPath) ? parentPath : activeTopPath;
        setWorking((current) => {
            const parentNode = getNodeAtPath(current.tree, targetPath);
            const children = parentNode?.children || [];
            const columnCount = children.filter((child) => child.type === 'column').length;
            const childIndex = children.length;
            const nextTree = appendChildAtPath(current.tree, targetPath, createColumn(columnCount + 1));
            setSelectedPath([...targetPath, childIndex]);
            return { ...current, tree: nextTree };
        });
    };

    const addRow = () => {
        if (!activeTop) {
            return;
        }

        setWorking((current) => {
            const targetPath = activeTopPath;
            const parentNode = getNodeAtPath(current.tree, targetPath);
            const children = parentNode?.children || [];
            const childIndex = children.length;
            const rowCount = children.filter((child) => isRowWrapper(child)).length;
            const row = createLayoutTemplateNode('layout-row');
            const nextTree = appendChildAtPath(current.tree, targetPath, {
                ...row,
                label: `Row ${rowCount + 1}`,
            });

            setSelectedPath([...targetPath, childIndex]);
            return { ...current, tree: nextTree };
        });
    };

    const addTabsGroup = () => {
        if (!activeTop) {
            return;
        }

        setWorking((current) => {
            const targetPath = activeTopPath;
            const parentNode = getNodeAtPath(current.tree, targetPath);
            const children = parentNode?.children || [];
            const tabsCount = children.filter((child) => isTabsColumn(child)).length;
            const childIndex = children.length;
            const nextTree = appendChildAtPath(current.tree, targetPath, createTabsGroup(tabsCount + 1));
            setSelectedPath([...targetPath, childIndex]);
            return { ...current, tree: nextTree };
        });
    };

    const addBlock = (columnPath) => {
        setWorking((current) => {
            const column = getNodeAtPath(current.tree, columnPath);
            const children = column?.children || [];
            const childIndex = children.length;
            const nextTree = appendChildAtPath(current.tree, columnPath, createNode({
                type: 'block',
                label: 'Block',
                link: '',
                hide_heading: true,
                children: [],
            }));
            setSelectedPath([...columnPath, childIndex]);
            return { ...current, tree: nextTree };
        });
    };

    const openAddContentAtTarget = React.useCallback((targetPath, preset = 'custom') => {
        if (!Array.isArray(targetPath)) {
            return;
        }

        if (!canOpenAddContentAtPath(working.tree, targetPath)) {
            return;
        }

        setAddContentTarget(targetPath);
        setAddContentPreset(preset);
    }, [working.tree]);

    const addBelowTabsBlock = React.useCallback((targetPath) => {
        openAddContentAtTarget(targetPath, 'block');
    }, [openAddContentAtTarget]);

    const getPreferredContentTarget = React.useCallback(() => {
        if (!activeTop) {
            return null;
        }

        const fallback = activeTopPath;
        const selectedNode = selectedPath.length ? getNodeAtPath(working.tree, selectedPath) : null;

        if (!selectedNode) {
            return fallback;
        }

        if (pathsEqual(selectedPath, activeTopPath) || selectedNode.type === 'block' || isTabsControllerPath(working.tree, selectedPath) || isTopNavigationColumnPath(working.tree, selectedPath)) {
            return selectedPath;
        }

        const parentPath = selectedPath.slice(0, -1);

        return parentPath.length ? parentPath : fallback;
    }, [activeTop, activeTopPath, selectedPath, working.tree]);

    const convertDynamicCatalogToManual = () => {
        if (!activeTop) {
            return;
        }

        const sourceCategoryId = Number(activeTop.entity_id || 0);
        if (!sourceCategoryId) {
            notify(createNotice('warning', 'Pick a source category first, then convert the catalog to manual mode.'));
            return;
        }

        notify(createNotice('info', 'Building manual catalog from PrestaShop categories...'));
        apiFetch('/catalog/categories', {
            method: 'POST',
            body: JSON.stringify({ query: '' }),
        }).then((response) => {
            const categories = Array.isArray(response.items) ? response.items : [];
            const byParent = new Map();

            categories.forEach((item) => {
                const parentId = Number(item.parent_id || 0);
                const bucket = byParent.get(parentId) || [];
                bucket.push(item);
                byParent.set(parentId, bucket);
            });

            const mainCategories = byParent.get(sourceCategoryId) || [];
            const mainNodes = mainCategories.map((mainCategory) => {
                const subCategories = byParent.get(Number(mainCategory.id || 0)) || [];
                const columns = subCategories.map((subCategory, columnIndex) => {
                    const leafCategories = byParent.get(Number(subCategory.id || 0)) || [];
                    const blockChildren = leafCategories.length
                        ? leafCategories.map((leaf) => createCategoryNodeFromCatalogItem(leaf))
                        : [createCategoryNodeFromCatalogItem(subCategory)];

                    return createNode({
                        type: 'column',
                        label: subCategory.name || `Column ${columnIndex + 1}`,
                        link: '',
                        component_variant: 'showcase_link_column',
                        children: [
                            createNode({
                                type: 'block',
                                label: leafCategories.length ? subCategory.name || 'Block' : '',
                                link: '',
                                component_variant: 'showcase_link_block',
                                children: blockChildren,
                            }),
                        ],
                    });
                });

                const layoutChildren = columns.length
                    ? [createTemplateRow(`${mainCategory.name || 'Category'} row`, columns)]
                    : [];

                return createCategoryNodeFromCatalogItem(mainCategory, {
                    columns: Math.max(1, layoutChildren.length),
                    children: layoutChildren,
                });
            });

            const manualTree = [
                createNode({
                    type: 'column',
                    label: 'Category tabs',
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
                            children: mainNodes,
                        }),
                    ],
                }),
            ];

            setWorking((current) => ({
                ...current,
                tree: updateNodeAtPath(current.tree, activeTopPath, (node) => ({
                    ...node,
                    type: 'custom',
                    link: node.link || '#',
                    entity_id: 0,
                    children: manualTree,
                })),
            }));
            setSelectedPath(mainNodes.length ? [...activeTopPath, 0, 0, 0] : [...activeTopPath, 0, 0]);
            notify(createNotice('success', `Manual catalog created from ${mainNodes.length} main categories. You can now edit tabs, columns, blocks and nested items.`));
        }).catch((error) => {
            notify(createNotice('error', error.message || 'Could not build manual catalog from categories.'));
        });
    };

    const addContentToTarget = (node) => {
        if (!addContentTarget) {
            return;
        }

        setWorking((current) => {
            const parent = addContentTarget.length ? getNodeAtPath(current.tree, addContentTarget) : current.tree;
            const parentChildren = Array.isArray(parent) ? parent : parent?.children || [];
            const childIndex = parentChildren.length || 0;
            const nextTree = appendChildAtPath(current.tree, addContentTarget, node);
            const nextPath = [...addContentTarget, childIndex];
            setSelectedPath(nextPath);
            setActiveTopIndex(findTopMenuEntryIndexByPath(collectTopMenuEntries(nextTree), nextPath));
            return { ...current, tree: nextTree };
        });
        setAddContentTarget(null);
        setAddContentPreset('custom');
    };

    const openEditElement = (path) => {
        setSelectedPath(path);
        setActiveTopIndex(findTopMenuEntryIndexByPath(topMenuEntries, path));
        setEditPath(path);
    };

    const saveEditedElement = (patch) => {
        if (!editPath) {
            return;
        }

        setWorking((current) => ({
            ...current,
            tree: updateNodeAtPath(current.tree, editPath, (node) => ({
                ...node,
                ...patch,
                children: node.children || [],
            })),
        }));
        setEditPath(null);
    };

    const deleteNode = (path) => {
        setWorking((current) => {
            const nextTree = removeNodeAtPath(current.tree, path);
            const safeTree = nextTree.length ? nextTree : createDefaultTree();
            const nextEntries = collectTopMenuEntries(safeTree);
            const nextPath = nextEntries[0]?.path || [0];
            setActiveTopIndex(0);
            setSelectedPath(nextPath);
            return { ...current, tree: safeTree };
        });
    };

    const pendingDeleteNode = pendingDeletePath ? getNodeAtPath(working.tree, pendingDeletePath) : null;
    const requestDeleteNode = (path) => setPendingDeletePath(path);
    const confirmDeleteNode = () => {
        if (pendingDeletePath) {
            deleteNode(pendingDeletePath);
        }

        setPendingDeletePath(null);
    };

    const saveMenu = () => {
        setSaving(true);
        apiFetch('/menu/save', {
            method: 'POST',
            body: JSON.stringify(working),
        }).then((response) => {
            const nextMenu = normalizeMenu(response.menu || working);
            setWorking(nextMenu);
            setMenus((current) => {
                const exists = current.some((menu) => Number(menu.id_menu) === Number(nextMenu.id_menu));
                return exists
                    ? current.map((menu) => (Number(menu.id_menu) === Number(nextMenu.id_menu) ? nextMenu : menu))
                    : [...current, nextMenu];
            });
            notify(createNotice('success', 'Menu saved.'));
        }).catch((error) => {
            notify(createNotice('error', error.message || 'Save failed.'));
        }).finally(() => setSaving(false));
    };

    const copyMenuToShops = (shopIds) => {
        setSaving(true);

        return apiFetch('/multistore/menus/copy', {
            method: 'POST',
            body: JSON.stringify({ id_menu: working.id_menu, shopIds }),
        }).then((response) => {
            const failed = Array.isArray(response.results)
                ? response.results.filter((result) => !result.success).length
                : 0;
            const copied = Array.isArray(response.results)
                ? response.results.filter((result) => result.success).length
                : shopIds.length;

            notify(createNotice(
                failed ? 'warning' : 'success',
                failed
                    ? `Menu copied to ${copied} shop(s); ${failed} target(s) failed.`
                    : `Menu copied to ${copied} shop(s).`
            ));

            return response;
        }).catch((error) => {
            const partialResults = Array.isArray(error.data?.results) ? error.data.results : [];
            if (partialResults.length > 0) {
                const copied = partialResults.filter((result) => result.success).length;
                const failed = partialResults.length - copied;
                notify(createNotice('warning', `Menu copied to ${copied} shop(s); ${failed} target(s) failed.`));
                return error.data;
            }

            notify(createNotice('error', error.message || 'Copy failed.'));
            throw error;
        }).finally(() => setSaving(false));
    };

    const duplicateMenu = (menu) => {
        const source = normalizeMenu(menu);
        const duplicate = normalizeMenu({
            ...source,
            id_menu: 0,
            name: `${source.name || 'Menu'} copy`,
            code: `${source.code || 'menu'}-copy`,
            position: menuList.length + 1,
        });

        setWorking(duplicate);
        setActiveTopIndex(0);
        setSelectedPath([0]);
        setTab('general');
        notify(createNotice('info', 'Menu duplicated as a draft. Save it to create a new menu.'));
        setView('editor');
    };

    const requestDeleteMenu = (menu) => {
        if (!Number(menu?.id_menu || 0)) {
            notify(createNotice('warning', 'Save the menu before deleting it from the database.'));
            return;
        }

        setPendingDeleteMenu(menu);
    };

    const confirmDeleteMenu = () => {
        const menuId = Number(pendingDeleteMenu?.id_menu || 0);

        if (!menuId) {
            setPendingDeleteMenu(null);
            return;
        }

        setDeletingMenu(true);
        apiFetch('/menu/delete', {
            method: 'POST',
            body: JSON.stringify({ id_menu: menuId }),
        }).then(() => {
            setMenus((current) => current.filter((menu) => Number(menu.id_menu) !== menuId));
            if (Number(working.id_menu) === menuId) {
                const nextMenu = menuList.find((menu) => Number(menu.id_menu) !== menuId) || normalizeMenu({ id_menu: 0, name: 'Main menu', hook_name: pluginData.hooks[0] || 'displayTop' });
                setWorking(nextMenu);
            }
            notify(createNotice('success', 'Menu deleted.'));
            setPendingDeleteMenu(null);
            setView('list');
        }).catch((error) => {
            notify(createNotice('error', error.message || 'Delete failed.'));
        }).finally(() => setDeletingMenu(false));
    };

    const createMenu = () => {
        setWorking(normalizeMenu({
            id_menu: 0,
            name: 'Main menu',
            hook_name: pluginData.hooks[0] || 'displayTop',
            tree: createDefaultTree(),
        }));
        setActiveTopIndex(0);
        setSelectedPath([0]);
        setTab('general');
        setView('editor');
    };

    const loadRetailShowcase = () => {
        setWorking((current) => normalizeMenu({
            ...current,
            name: current.name || 'Showcase Mega Menu',
            hook_name: current.hook_name || 'displayTop',
            is_active: 1,
            settings: {
                ...current.settings,
                layout: 'mega',
                theme: 'clean-light',
                container_mode: 'full',
                container_width: 1760,
                mobile_breakpoint: 900,
                animation: 'fade',
                columns: 12,
                top_level_layout: 'grid',
                open_on: 'hover',
                show_counts: true,
                hide_empty_categories: false,
                item_gap: 8,
                top_level_icon_mode: 'all',
                category_tab_media_mode: 'thumbnail',
                show_shadow: true,
                drop_shadow: true,
                ...getThemeColorPatch('clean-light'),
            },
            tree: createRetailShowcaseTree(),
        }));
        setActiveTopIndex(0);
        setSelectedPath([0, 0, 0, 0]);
        setTab('general');
        notify(createNotice('info', 'Retail showcase layout loaded. Save the menu to publish it.'));
    };

    const importJson = () => {
        try {
            const parsed = JSON.parse(jsonImport);
            setWorking(normalizeMenu(parsed));
            setActiveTopIndex(0);
            setSelectedPath([0]);
            notify(createNotice('success', 'JSON imported.'));
        } catch (error) {
            notify(createNotice('error', 'Invalid JSON.'));
        }
    };

    const openMenu = (menu) => {
        setWorking(normalizeMenu(menu));
        setActiveTopIndex(0);
        setSelectedPath([0]);
        setTab('general');
        setView('editor');
    };

    const selectedNode = selectedPath.length ? getNodeAtPath(working.tree, selectedPath) : null;
    const addContentTargetNode = addContentTarget ? getNodeAtPath(working.tree, addContentTarget) : null;
    const addTargetAllowsStructure = Boolean(addContentTarget && (
        !addContentTarget.length
        || addContentTarget.length === 1
        || isTabsControllerPath(working.tree, addContentTarget)
        || ['row', 'column'].includes(addContentTargetNode?.type)
    ));
    const preferredAddTarget = getPreferredContentTarget();
    const preferredAddTargetNode = preferredAddTarget ? getNodeAtPath(working.tree, preferredAddTarget) : null;
    const preferredAddTargetLabel = preferredAddTargetNode?.label || activeTop?.label || '';
    const editingNode = editPath ? getNodeAtPath(working.tree, editPath) : null;
    const themeOptions = React.useMemo(getThemeOptions, []);
    const listStats = {
        total: menuList.length,
        active: menuList.filter((menu) => Number(menu.is_active) === 1).length,
        hooks: new Set(menuList.map((menu) => menu.hook_name).filter(Boolean)).size,
        topItems: menuList.reduce((sum, menu) => sum + (Array.isArray(menu.tree) ? menu.tree.length : 0), 0),
    };

    if (view === 'list') {
        return (
            <MenusList
                menus={menuList}
                stats={listStats}
                onCreate={createMenu}
                onOpen={openMenu}
                onDuplicate={duplicateMenu}
                onDelete={requestDeleteMenu}
                formatDate={formatMenuDate}
                setNotice={notify}
                deleteModal={(
                    <ConfirmDeleteMenuModal
                        open={Boolean(pendingDeleteMenu)}
                        menu={pendingDeleteMenu}
                        deleting={deletingMenu}
                        onCancel={() => setPendingDeleteMenu(null)}
                        onConfirm={confirmDeleteMenu}
                    />
                )}
            />
        );
    }    return (
        <Card className={['cci-nice-menu-menu-editor-card tw-overflow-hidden', tab === 'general' ? 'cci-nice-menu-state-general-tab' : ''].filter(Boolean).join(' ')}>
            <CardHeader className='tw-flex tw-min-h-16 tw-flex-row tw-items-center tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-4'>
                <Button variant='ghost' type='button' onClick={() => setView('list')}>
                    <ArrowLeft aria-hidden='true' />
                    { __( 'Back to all menus', 'cci-nice-menu' ) }
                </Button>
                <div className='tw-flex tw-flex-wrap tw-justify-end tw-gap-2'>
                    <Button variant='outlineAccent' type='button' onClick={loadRetailShowcase}>
                        <Layers aria-hidden='true' />
                        { __( 'Load showcase', 'cci-nice-menu' ) }
                    </Button>
                    <Button variant='save' type='button' onClick={saveMenu} disabled={saving}>
                        <Save aria-hidden='true' />
                        {saving ? __( 'Saving...', 'cci-nice-menu' ) : 'Save'}
                    </Button>
                </div>
            </CardHeader>

            <div className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-3'>
                <Input
                    className='tw-h-12 tw-text-base tw-font-semibold'
                    value={working.name}
                    onChange={(event) => changeMenu({ name: event.target.value })}
                    placeholder={ __( 'Menu name', 'cci-nice-menu' ) }
                />
            </div>

            <MultistoreMenuCopy
                context={pluginData.multistore}
                menuId={Number(working.id_menu || 0)}
                saving={saving}
                onCopy={copyMenuToShops}
            />

            <Tabs value={tab} onValueChange={setTab} className='tw-grid tw-gap-0'>
                <div className='tw-h-14 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-4'>
                    <TabsList flush className='tw-h-full tw-gap-6'>
                        {editorTabs.map((item) => {
                            const Icon = item.icon;
                            return (
                                <TabsTrigger key={item.value} value={item.value} className='cci-nice-menu-tab-trigger !tw-h-full tw-mb-[-1px] tw-gap-2 tw-rounded-none tw-border-0 tw-border-b-2 tw-border-solid tw-border-transparent tw-bg-transparent tw-px-0 data-[state=active]:tw-border-cci-nm-brand data-[state=active]:tw-bg-transparent data-[state=active]:tw-text-cci-nm-brand'>
                                    <Icon aria-hidden='true' />
                                    {item.label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                <CardContent className={tab === 'general' ? 'cci-nice-menu-editor-general-content tw-bg-transparent tw-p-0' : 'tw-bg-slate-50 tw-p-4'}>
                    <TabsPanel value='general' className='cci-nice-menu-general-tab-panel tw-m-0 tw-border-0 tw-bg-transparent'>
                        <div className='tw-grid tw-gap-4 tw-p-4'>
                            <section className='tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-4'>
                                <div className='tw-grid tw-gap-3 lg:tw-grid-cols-[minmax(180px,0.65fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.85fr)] lg:tw-items-end'>
                                    <div className='tw-self-center'>
                                        <strong className='tw-block tw-text-base tw-font-semibold tw-leading-5 tw-text-cci-nm-text'>{ __( 'Menu settings', 'cci-nice-menu' ) }</strong>
                                        <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Placement and storefront behaviour.', 'cci-nice-menu' ) }</p>
                                    </div>
                                    <Field label='Hook'>
                                        <Select
                                            value={working.hook_name}
                                            onValueChange={(value) => changeMenu({ hook_name: value })}
                                            options={(pluginData.hooks || ['displayTop']).map((hook) => ({ value: hook, label: hook }))}
                                        />
                                    </Field>
                                    <Field label='Open submenu'>
                                        <Select
                                            value={working.settings.open_on || 'click'}
                                            onValueChange={(value) => changeSettings({ open_on: value })}
                                            options={[
                                                { value: 'click', label: 'Click' },
                                                { value: 'hover', label: 'Hover' },
                                            ]}
                                        />
                                    </Field>
                                    <ToggleField
                                        checked={Number(working.is_active) === 1}
                                        label='Enabled on storefront'
                                        onChange={(checked) => changeMenu({ is_active: checked ? 1 : 0 })}
                                    />
                                </div>
                            </section>

                            <div className='cci-nice-menu-builder-canvas cci-nice-menu-builder-canvas-full'>
                                <TopLevelLayoutPanel
                                    tree={working.tree}
                                    entries={topMenuEntries}
                                    activeIndex={safeTopIndex}
                                    selectedPath={selectedPath}
                                    settings={working.settings}
                                    onSettingsChange={changeSettings}
                                    onActivate={setActiveTopIndex}
                                    onSelect={setSelectedPath}
                                    onEdit={openEditElement}
                                    onAddRow={addTopRow}
                                    onAddColumn={addColumn}
                                    onAddItemToColumn={(columnPath) => openAddContentAtTarget(columnPath, 'custom')}
                                    onAddHookToColumn={(columnPath) => openAddContentAtTarget(columnPath, 'hook')}
                                    onDelete={requestDeleteNode}
                                    onMoveChild={moveChildNode}
                                />
                                <MegaCanvas
                                    activeTop={activeTop}
                                    activeTopPath={activeTopPath}
                                    selectedPath={selectedPath}
                                    onSelect={setSelectedPath}
                                    onEdit={openEditElement}
                                    onDelete={requestDeleteNode}
                                    onAddRow={addRow}
                                    onAddColumn={addColumn}
                                    onAddTabsGroup={addTabsGroup}
                                    onAddBlock={addBlock}
                                    onAddContent={openAddContentAtTarget}
                                    onAddBelowTabsBlock={addBelowTabsBlock}
                                    onAddChild={openAddContentAtTarget}
                                    onCreateManualFlyout={convertDynamicCatalogToManual}
                                    onMoveChild={moveChildNode}
                                    settings={working.settings}
                                />
                            </div>
                        </div>
                    </TabsPanel>

                    <TabsPanel value='design' className='tw-m-0 tw-border-0 tw-bg-transparent'>
                        <div className='tw-grid tw-grid-cols-1 tw-gap-4 2xl:tw-grid-cols-[420px_minmax(0,1fr)]'>
                            <EditorPanel title={ __( 'Menu appearance', 'cci-nice-menu' ) } description='Use compact settings copied from the WP builder style.'>
                                <FieldGroup>
                                    <Field label='Layout preset'>
                                        <Select
                                            value={working.settings.layout || 'classic'}
                                            onValueChange={(value) => changeSettings({ layout: value })}
                                            options={[
                                                { value: 'classic', label: 'Classic' },
                                                { value: 'mega', label: __( 'Mega grid', 'cci-nice-menu' ) },
                                                { value: 'dropdown', label: 'Dropdown' },
                                            ]}
                                        />
                                    </Field>
                                    <Field label='Visual theme'>
                                        <Select
                                            value={working.settings.theme || 'night-glass'}
                                            onValueChange={(value) => changeSettings({ theme: value, ...getThemeColorPatch(value) })}
                                            options={themeOptions}
                                        />
                                    </Field>
                                    <ToggleField checked={Boolean(working.settings.show_shadow ?? working.settings.drop_shadow)} label='Drop shadow' onChange={(checked) => changeSettings({ show_shadow: checked, drop_shadow: checked })} />
                                    <ToggleField checked={Boolean(working.settings.show_counts)} label='Show category counts on storefront' onChange={(checked) => changeSettings({ show_counts: checked })} />
                                    <ToggleField checked={Boolean(working.settings.hide_empty_categories)} label='Hide empty categories on storefront' onChange={(checked) => changeSettings({ hide_empty_categories: checked })} />
                                </FieldGroup>
                                <div className='tw-mt-4 tw-grid tw-gap-3'>
                                    <div className='tw-flex tw-items-center tw-justify-between tw-gap-3'>
                                        <strong className='tw-text-sm tw-font-semibold tw-text-cci-nm-text'>{ __( 'Palette', 'cci-nice-menu' ) }</strong>
                                        <Button
                                            variant='secondary'
                                            size='xs'
                                            type='button'
                                            onClick={() => changeSettings(getThemeColorPatch(working.settings.theme || 'night-glass'))}
                                        >
                                            { __( 'Reset from theme', 'cci-nice-menu' ) }
                                        </Button>
                                    </div>
                                    <FieldGroup>
                                        {colorSettingFields.map((field) => (
                                            <ColorSettingInput
                                                key={field.key}
                                                label={field.label}
                                                value={working.settings[field.key] || DEFAULT_COLOR_SETTINGS[field.key]}
                                                fallback={DEFAULT_COLOR_SETTINGS[field.key]}
                                                onChange={(value) => changeSettings({ [field.key]: value })}
                                            />
                                        ))}
                                    </FieldGroup>
                                </div>
                            </EditorPanel>

                            <section className='tw-min-w-0'>
                                <div className='tw-grid tw-min-h-full tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white'>
                                    <div className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-4'>
                                        <strong className='tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand'>
                                            <Palette aria-hidden='true' />
                                            { __( 'Layout details', 'cci-nice-menu' ) }
                                        </strong>
                                        <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Match the menu container, spacing and mobile breakpoint.', 'cci-nice-menu' ) }</p>
                                    </div>
                                    <div className='tw-grid tw-gap-4 tw-p-4'>
                                        <div className='tw-grid tw-gap-3 md:tw-grid-cols-3'>
                                            <Field label='Container mode'>
                                                <Select
                                                    value={working.settings.container_mode || 'boxed'}
                                                    onValueChange={(value) => changeSettings({ container_mode: value })}
                                                    options={[
                                                        { value: 'boxed', label: 'Boxed' },
                                                        { value: 'wide', label: 'Wide' },
                                                        { value: 'full', label: __( 'Full page', 'cci-nice-menu' ) },
                                                    ]}
                                                />
                                            </Field>
                                            <Field label='Container width'>
                                                <NumberInputWithUnit value={working.settings.container_width || 1320} unit='px' onChange={(value) => changeSettings({ container_width: value })} />
                                            </Field>
                                            <Field label='Item gap'>
                                                <NumberInputWithUnit value={working.settings.item_gap || 8} unit='px' onChange={(value) => changeSettings({ item_gap: value })} />
                                            </Field>
                                        </div>
                                        <div className='tw-grid tw-gap-3 md:tw-grid-cols-4'>
                                            <Field label='Mobile breakpoint'>
                                                <NumberInputWithUnit value={working.settings.mobile_breakpoint || 900} unit='px' onChange={(value) => changeSettings({ mobile_breakpoint: value })} />
                                            </Field>
                                            <Field label='Top-level icons'>
                                                <Select
                                                    value={working.settings.top_level_icon_mode || 'first'}
                                                    onValueChange={(value) => changeSettings({ top_level_icon_mode: value })}
                                                    options={[
                                                        { value: 'first', label: __( 'First item only', 'cci-nice-menu' ) },
                                                        { value: 'all', label: __( 'All items', 'cci-nice-menu' ) },
                                                        { value: 'none', label: __( 'No icons', 'cci-nice-menu' ) },
                                                    ]}
                                                />
                                            </Field>
                                            <Field label={__('Category tab media', 'cci-nice-menu')}>
                                                <Select
                                                    value={working.settings.category_tab_media_mode || 'auto'}
                                                    onValueChange={(value) => changeSettings({ category_tab_media_mode: value })}
                                                    options={categoryTabMediaOptions}
                                                />
                                            </Field>
                                        </div>
                                        <div className='tw-grid tw-gap-3 md:tw-grid-cols-2'>
                                            <Field label='Animation'>
                                                <Select
                                                    value={working.settings.animation || 'fade'}
                                                    onValueChange={(value) => changeSettings({ animation: value })}
                                                    options={[
                                                        { value: 'fade', label: 'Fade' },
                                                        { value: 'slide', label: 'Slide' },
                                                        { value: 'none', label: 'None' },
                                                    ]}
                                                />
                                            </Field>
                                            <Field label='Open submenu'>
                                                <Select
                                                    value={working.settings.open_on || 'click'}
                                                    onValueChange={(value) => changeSettings({ open_on: value })}
                                                    options={[
                                                        { value: 'click', label: 'Click' },
                                                        { value: 'hover', label: 'Hover' },
                                                    ]}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </TabsPanel>

                    <TabsPanel value='tools' className='tw-m-0 tw-border-0 tw-bg-transparent'>
                        <div className='tw-grid tw-grid-cols-1 tw-gap-4 2xl:tw-grid-cols-[420px_minmax(0,1fr)]'>
                            <EditorPanel title={ __( 'JSON import', 'cci-nice-menu' ) } description='Paste exported menu JSON and replace the current working configuration.'>
                                <FieldGroup>
                                    <Field label='Import payload'>
                                        <Textarea className='tw-min-h-40' value={jsonImport} onChange={(event) => setJsonImport(event.target.value)} placeholder={ __( 'Paste exported JSON here', 'cci-nice-menu' ) } />
                                    </Field>
                                    <div>
                                        <Button variant='save' size='sm' type='button' onClick={importJson}>{ __( 'Import and save', 'cci-nice-menu' ) }</Button>
                                    </div>
                                </FieldGroup>
                            </EditorPanel>

                            <section className='tw-min-w-0'>
                                <div className='tw-grid tw-min-h-full tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white'>
                                    <div className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-4'>
                                        <strong className='tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand'>
                                            <Check aria-hidden='true' />
                                            { __( 'JSON export snapshot', 'cci-nice-menu' ) }
                                        </strong>
                                        <p className='tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>{ __( 'Copy or download the current menu configuration.', 'cci-nice-menu' ) }</p>
                                    </div>
                                    <div className='tw-grid tw-gap-4 tw-p-4'>
                                        <Textarea className='tw-min-h-64 tw-font-mono tw-text-xs' readOnly value={rawExport} />
                                        <div className='tw-flex tw-flex-wrap tw-gap-2'>
                                            <Button
                                                variant='accent'
                                                size='sm'
                                                type='button'
                                                onClick={() => {
                                                    const blob = new Blob([rawExport], { type: 'application/json' });
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `${working.code || 'menu'}.json`;
                                                    link.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                            >
                                                { __( 'Download JSON', 'cci-nice-menu' ) }
                                            </Button>
                                            <Button variant='secondary' size='sm' type='button' onClick={() => navigator.clipboard?.writeText(rawExport)}>{ __( 'Copy JSON', 'cci-nice-menu' ) }</Button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </TabsPanel>
                </CardContent>
            </Tabs>

            {inlineNotice ? (
                <div
                    className={`tw-mx-5 tw-mb-5 tw-rounded-md tw-border tw-border-solid tw-px-3 tw-py-2 tw-text-xs tw-leading-5 ${alertToneClasses[inlineNotice.type] || alertToneClasses.info}`}
                    role={inlineNotice.type === 'error' ? 'alert' : 'status'}
                    aria-live='polite'
                >
                    {inlineNotice.message}
                </div>
            ) : null}
            <ConfirmDeleteModal open={Boolean(pendingDeletePath)} itemLabel={pendingDeleteNode?.label || ''} onCancel={() => setPendingDeletePath(null)} onConfirm={confirmDeleteNode} />
            <AddContentModal
                open={Boolean(addContentTarget)}
                parentLabel={addContentTargetNode?.label || ''}
                initialType={addContentPreset}
                allowStructurePresets={addTargetAllowsStructure}
                isTopLevel={Boolean(addContentTarget && addContentTarget.length === 0)}
                onCancel={() => {
                    setAddContentTarget(null);
                    setAddContentPreset('custom');
                }}
                onAdd={addContentToTarget}
                onOpenSettings={onOpenSettings}
            />
            <AddContentModal
                open={Boolean(editPath && editingNode)}
                mode='edit'
                initialNode={editingNode}
                isTopLevel={Boolean(editPath && editPath.length === 1)}
                onCancel={() => setEditPath(null)}
                onSave={saveEditedElement}
                onOpenSettings={onOpenSettings}
            />
        </Card>
    );
}
