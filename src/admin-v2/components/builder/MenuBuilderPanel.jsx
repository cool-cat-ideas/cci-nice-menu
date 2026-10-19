import React from 'react';
import { formatAdminDateTime } from '@cci/admin-ui';
import {
  ArrowLeft,
  Boxes,
  Check,
  ChevronDown,
  Columns3,
  Copy,
  FileText,
  FolderTree,
  Image,
  Layers,
  Link2,
  MapPin,
  Palette,
  Pencil,
  Plus,
  Save,
  Settings2,
  ShoppingBag,
  Trash2,
  Upload,
  Video,
} from 'lucide-react';
import { apiFetch, pluginData } from '../../api/api';
import { __ } from '../../i18n/i18n';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

import { Field, FieldGroup } from '../ui/field';

import { Input, Textarea } from '../ui/input';

import { Select } from '../ui/select';
import { Tabs, TabsList, TabsPanel, TabsTrigger } from '../ui/tabs';
import MenusList from './MenusList';

import {
  BuilderItem,
  BuilderItemMain,
  BuilderGrip,
  BuilderItemCopy,
  BuilderItemTitle,
  BuilderItemDescription,
  BuilderActions,
  BuilderPanel,
  BuilderHeader,
  BuilderHeading,
  BuilderMetric,
  BuilderCanvas,
  BuilderRuler,
} from './components/BuilderPrimitives.jsx';
import {
  normalizeTabsOrientation,
  normalizeComponentVariant,
  inferComponentVariantFromClass,
  isTabsColumn,
  isRowWrapper,
  normalizeNode,
  createNode,
  createColumn,
  createTabsGroup,
} from './model/node.js';
import { createTemplateRow, createLayoutTemplateNode } from './presets/layout-templates.js';
import { createRetailShowcaseTree } from './presets/retail-showcase.js';
import {
  normalizeHexColor,
  normalizeIconClass,
  NumberInputWithUnit,
  ToggleField,
  TypeBadge,
  getAdminNodeTypeDisplayLabel,
  EditorPanel,
  getNodeTypeLabel,
  getBlockVariantDisplayLabel,
  getBlockChildrenDisplayLabel,
  getBlockHeaderLabel,
  AddContentModal,
} from './editor/AddContentModal.jsx';

const ROOT_LABEL = 'Catalog';

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

const editorTabs = [
  { value: 'general', label: 'General', icon: Settings2 },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'tools', label: 'Import / Export', icon: Upload },
];

const categoryTabMediaOptions = [
  { value: 'auto', label: __('Auto: icon, then thumbnail', 'cci-nice-menu') },
  { value: 'icon', label: __('Icon only', 'cci-nice-menu') },
  { value: 'thumbnail', label: __('Category thumbnail', 'cci-nice-menu') },
  { value: 'none', label: __('No media', 'cci-nice-menu') },
];

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
    const fallback =
      field.key === 'color_icon'
        ? preset.color_icon || preset.color_accent || DEFAULT_COLOR_SETTINGS.color_icon
        : DEFAULT_COLOR_SETTINGS[field.key];
    patch[field.key] = normalizeHexColor(preset[field.key], fallback);
    return patch;
  }, {});
}

function ColorSettingInput({ label, value, fallback, onChange }) {
  const colorValue = normalizeHexColor(value, fallback);

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
          value={String(value || '')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onChange(normalizeHexColor(event.target.value, fallback))}
          placeholder={fallback}
        />
      </div>
    </Field>
  );
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
      variant="add"
      size={size}
      type="button"
      className={className}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Plus aria-hidden="true" />
    </Button>
  );
}

function AddDropdown({ label = 'Add', size = 'sm', actions = [], compact = false }) {
  const [open, setOpen] = React.useState(false);
  const compactSize =
    size === 'xs'
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
        variant="add"
        size={compact ? compactSize : size}
        type="button"
        onClick={action.onClick}
        aria-label={compact ? action.label : undefined}
        title={compact ? action.label : undefined}
      >
        <Icon aria-hidden="true" />
        {compact ? null : action.label}
      </Button>
    );
  }

  return (
    <div
      className="cci-nice-menu-add-dropdown tw-relative tw-inline-flex"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Button
        className="cci-nice-menu-add-dropdown-trigger"
        variant="add"
        size={compact ? compactSize : size}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? label : undefined}
        title={compact ? label : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <Plus aria-hidden="true" />
        {compact ? null : label}
        {compact ? null : (
          <ChevronDown
            aria-hidden="true"
            className={open ? 'tw-rotate-180 tw-transition-transform' : 'tw-transition-transform'}
          />
        )}
      </Button>
      {open ? (
        <div className="cci-nice-menu-add-dropdown-menu" role="menu">
          {actions.map((action) => {
            const Icon = action.icon || Plus;

            return (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                className="cci-nice-menu-add-dropdown-item"
                onClick={() => {
                  setOpen(false);
                  action.onClick?.();
                }}
              >
                <Icon aria-hidden="true" />
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

function NodeIconPreview({
  node = {},
  fallback: FallbackIcon = Link2,
  className = 'tw-h-4 tw-w-4',
}) {
  const iconClass = normalizeIconClass(node.icon);

  if (iconClass) {
    return (
      <span
        aria-hidden="true"
        className={`tw-inline-flex tw-items-center tw-justify-center tw-text-base tw-leading-none ${className} ${iconClass}`}
      />
    );
  }

  return <FallbackIcon aria-hidden="true" className={className} />;
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
  const parentVariant =
    normalizeComponentVariant(parent?.component_variant || '') ||
    inferComponentVariantFromClass(parent?.css_class || '');

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

  return (
    path.length === 1 ||
    isTopNavigationColumnPath(tree, path) ||
    node.type === 'block' ||
    isTabsControllerPath(tree, path)
  );
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
              entries.push({
                node: item,
                path: [rootIndex, columnIndex, itemIndex],
                columnPath: [rootIndex, columnIndex],
              });
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

function isTabsSupportNode(node = {}) {
  const variant =
    normalizeComponentVariant(node.component_variant || '') ||
    inferComponentVariantFromClass(node.css_class || '');

  return (
    node.type === 'block' ||
    node.type === 'hook' ||
    variant === 'rail_links' ||
    variant === 'showcase_rail_hook' ||
    (node.type === 'hook' && String(node.hook_name || '') === 'displayReassurance')
  );
}

function isImplicitLinksBlock(node = {}) {
  if (node?.type !== 'block') {
    return false;
  }

  const label = String(node.label || '')
    .trim()
    .toLowerCase();
  const children = Array.isArray(node.children) ? node.children.filter(Boolean) : [];
  const hasRecognizedBlockComponent = Boolean(
    getBlockVariantDisplayLabel(node.component_variant || '') ||
    getBlockChildrenDisplayLabel(children),
  );

  if (!children.length || hasRecognizedBlockComponent) {
    return false;
  }

  return label === '' || label === 'links block' || /^(block|blok)\s*\d*$/.test(label);
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
    tree:
      Array.isArray(menu.tree) && menu.tree.length
        ? menu.tree.map(normalizeNode)
        : createDefaultTree(),
  };
}

function formatMenuDate(menu = {}) {
  return formatAdminDateTime(menu.updated_at || menu.created_at, pluginData.adminDate) || '—';
}

function pathsEqual(left = [], right = []) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function pathStartsWith(path = [], prefix = []) {
  return (
    Array.isArray(path) &&
    Array.isArray(prefix) &&
    path.length >= prefix.length &&
    prefix.every((value, index) => path[index] === value)
  );
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

function getAdminNodeDisplayLabel(node = {}, blockIndex = 0, blockCount = 1, parentLabel = '') {
  const type = node?.type || 'custom';

  if (type === 'block') {
    return getBlockHeaderLabel(node, blockIndex, blockCount, parentLabel);
  }

  return String(node?.label || '').trim() || getNodeTypeLabel(type);
}

function NodeMiniCard({
  node,
  path,
  selectedPath,
  onSelect,
  onEdit,
  onDelete,
  onAddChild,
  sortScope = '',
  sortIndex = null,
  onMove = null,
  onMoveChild = null,
}) {
  const selected = pathsEqual(path, selectedPath);
  const type = node.type || 'custom';
  const children = Array.isArray(node.children) ? node.children : [];
  const Icon =
    type === 'product' || type === 'product_tile'
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
  const sortable = Boolean(
    sortScope && Number.isInteger(Number(sortIndex)) && typeof onMove === 'function',
  );
  const nodeSummary = getNodeSummary(node, children);
  const displayLabel = getAdminNodeDisplayLabel(node);
  const typeLabel = getAdminNodeTypeDisplayLabel(node, displayLabel);
  const summary =
    nodeSummary.trim().toLowerCase() ===
    String(typeLabel || '')
      .trim()
      .toLowerCase()
      ? ''
      : nodeSummary;
  const canAddNestedContent = Boolean(onAddChild && canShowNestedAddButton(node, path));

  return (
    <BuilderItem
      className={[
        'cci-nice-menu-node-mini-card tw-group tw-relative tw-rounded-md tw-border tw-border-solid tw-transition-colors tw-duration-150',
        selected
          ? 'tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft'
          : 'tw-border-transparent tw-bg-white tw-shadow-sm hover:tw-border-cci-nm-brandBorder',
        sortable ? dragSort.getDragClass(sortScope, Number(sortIndex)) : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-selected={selected}
      {...(sortable ? dragSort.getDragProps(sortScope, Number(sortIndex), onMove) : {})}
    >
      <BuilderItemMain
        variant="unstyled"
        type="button"
        className={['cci-nice-menu-node-mini-main', sortable ? 'cci-nice-menu-state-sortable' : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onSelect(path)}
        aria-pressed={pathsEqual(path, selectedPath)}
      >
        {sortable ? (
          <BuilderGrip
            aria-hidden="true"
            className="cci-nice-menu-sort-handle tw-mt-2 tw-h-4 tw-w-4 tw-shrink-0"
          />
        ) : null}
        <span className="cci-nice-menu-node-mini-icon">
          <NodeIconPreview node={node} fallback={Icon} className="tw-h-4 tw-w-4" />
        </span>
        <BuilderItemCopy className="cci-nice-menu-node-mini-copy">
          <BuilderItemTitle className="cci-nice-menu-node-mini-title">
            {displayLabel}
          </BuilderItemTitle>
          {typeLabel ? (
            <BuilderItemDescription className="cci-nice-menu-node-mini-type">
              {typeLabel}
            </BuilderItemDescription>
          ) : null}
          {summary ? (
            <BuilderItemDescription className="cci-nice-menu-node-mini-summary">
              {summary}
            </BuilderItemDescription>
          ) : null}
        </BuilderItemCopy>
      </BuilderItemMain>
      <BuilderActions className="cci-nice-menu-node-mini-actions" data-no-drag="true">
        {canAddNestedContent ? (
          <AddIconButton
            label={__('Add an element inside ', 'cci-nice-menu') + displayLabel}
            onClick={(event) => {
              event.stopPropagation();
              onAddChild(path);
            }}
          />
        ) : null}
        <Button
          variant="builder"
          size="iconXs"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(path);
          }}
          aria-label={__('Edit item', 'cci-nice-menu')}
          title={__('Edit item', 'cci-nice-menu')}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          variant="danger"
          size="iconXs"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(path);
          }}
          aria-label={__('Delete item', 'cci-nice-menu')}
          title={__('Delete item', 'cci-nice-menu')}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </BuilderActions>
      {children.length ? (
        <div className="cci-nice-menu-node-children tw-mb-2 tw-ml-10 tw-mr-2 tw-grid tw-gap-2 tw-border-0 tw-border-l tw-border-solid tw-border-cci-nm-border tw-pl-3">
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
    </BuilderItem>
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
  const [state, setState] = React.useState({
    scope: '',
    index: null,
    overScope: '',
    overIndex: null,
  });

  const clear = React.useCallback(() => {
    activeSortPayload = null;
    setState({ scope: '', index: null, overScope: '', overIndex: null });
  }, []);

  const getDragClass = React.useCallback(
    (scope, index) => {
      const normalizedScope = normalizeSortScope(scope);
      return [
        'cci-nice-menu-sortable',
        state.scope === normalizedScope && state.index === index
          ? 'cci-nice-menu-state-dragging'
          : '',
        state.overScope === normalizedScope && state.overIndex === index
          ? 'cci-nice-menu-state-drag-over'
          : '',
      ]
        .filter(Boolean)
        .join(' ');
    },
    [state],
  );

  const getDragProps = React.useCallback(
    (scope, index, onMove, options = {}) => {
      const normalizedScope = normalizeSortScope(scope);
      const disabled =
        options.disabled ||
        !normalizedScope ||
        typeof onMove !== 'function' ||
        !Number.isInteger(Number(index));

      if (disabled) {
        return {};
      }

      return {
        draggable: true,
        onDragStart: (event) => {
          const target = event.target;
          const isInteractive = target?.closest?.(
            '[data-no-drag="true"], button, a, input, select, textarea, label',
          );

          if (
            isInteractive &&
            !target?.closest?.('.cci-nice-menu-sort-handle, .cci-nice-menu-menu-item-grip')
          ) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          beginSortDrag(event, normalizedScope, Number(index));
          setState({
            scope: normalizedScope,
            index: Number(index),
            overScope: '',
            overIndex: null,
          });
        },
        onDragOver: (event) => {
          const payload = readSortPayload(event, normalizedScope);

          if (!payload || payload.index === Number(index)) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = 'move';
          setState((current) => ({
            ...current,
            overScope: normalizedScope,
            overIndex: Number(index),
          }));
        },
        onDragLeave: (event) => {
          if (event.currentTarget.contains(event.relatedTarget)) {
            return;
          }

          setState((current) =>
            current.overScope === normalizedScope && current.overIndex === Number(index)
              ? { ...current, overScope: '', overIndex: null }
              : current,
          );
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
    },
    [clear],
  );

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

function TopLevelLayoutPanel({
  tree = [],
  entries = [],
  activeIndex,
  selectedPath,
  settings = {},
  onSettingsChange = () => {},
  onActivate,
  onSelect,
  onEdit,
  onDelete,
  onAddRow,
  onAddColumn,
  onAddItemToColumn,
  onAddHookToColumn,
  onMoveChild,
}) {
  const dragSort = useDragSort();
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
    <section
      className="cci-nice-menu-menu-items-section cci-nice-menu-top-navigation-section"
      aria-label={__('Top-level menu layout', 'cci-nice-menu')}
    >
      <div className="cci-nice-menu-menu-items-header">
        <div className="tw-min-w-0">
          <h3 className="cci-nice-menu-menu-items-title">
            {__('Header navigation bar', 'cci-nice-menu')}
          </h3>
          <p className="cci-nice-menu-menu-items-description">
            {__(
              'Build the first storefront navigation row with columns, links and native hooks.',
              'cci-nice-menu',
            )}
          </p>
        </div>
        <Button
          variant="add"
          size="sm"
          type="button"
          onClick={() => (canAddColumnToPrimaryRow ? onAddColumn(primaryRowPath) : onAddRow())}
        >
          <Plus aria-hidden="true" />
          {canAddColumnToPrimaryRow
            ? __('Add column', 'cci-nice-menu')
            : __('Create layout', 'cci-nice-menu')}
        </Button>
      </div>

      <div className="cci-nice-menu-top-layout-controls">
        <Field label={__('Item gap', 'cci-nice-menu')}>
          <NumberInputWithUnit
            value={itemGap}
            unit="px"
            onChange={(value) =>
              onSettingsChange({ item_gap: Math.max(0, Math.min(30, Number(value || 0))) })
            }
          />
        </Field>
      </div>

      <div className="cci-nice-menu-menu-items-body tw-grid tw-gap-3">
        {layoutRows.length ? (
          layoutRows.map(({ node: rowNode, index: rowIndex }) => {
            const rowPath = [rowIndex];
            const isRow = rowNode?.type === 'row';
            const columns = isRow
              ? (rowNode.children || [])
                  .map((node, index) => ({ node, index }))
                  .filter((entry) => entry.node?.type === 'column')
              : rowNode?.type === 'column'
                ? [{ node: rowNode, index: rowIndex, rootColumn: true }]
                : [];

            if (!isRow && rowNode?.type !== 'column') {
              const entryIndex = findTopMenuEntryIndexByPath(entries, rowPath);
              const active = entryIndex === activeIndex;
              const selected = pathsEqual(rowPath, selectedPath);

              return (
                <BuilderItem
                  key={rowNode.id || rowIndex}
                  className={[
                    'cci-nice-menu-menu-item-pill',
                    active ? 'cci-nice-menu-state-active' : '',
                    selected ? 'cci-nice-menu-state-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <BuilderItemMain
                    aria-pressed={active}
                    type="button"
                    className="cci-nice-menu-menu-item-main"
                    onClick={() => activateEntry(rowPath)}
                  >
                    <BuilderGrip aria-hidden="true" className="cci-nice-menu-menu-item-grip" />
                    <BuilderItemTitle className="cci-nice-menu-menu-item-label">
                      {rowNode.label || `Menu item ${rowIndex + 1}`}
                    </BuilderItemTitle>
                  </BuilderItemMain>
                  <BuilderActions className="cci-nice-menu-menu-item-actions">
                    <Button
                      variant="builder"
                      size="iconXs"
                      type="button"
                      onClick={() => onEdit(rowPath)}
                      aria-label={__('Edit top menu item', 'cci-nice-menu')}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      variant="danger"
                      size="iconXs"
                      type="button"
                      onClick={() => onDelete(rowPath)}
                      aria-label={__('Delete top menu item', 'cci-nice-menu')}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </BuilderActions>
                </BuilderItem>
              );
            }

            return (
              <StorefrontEditorFrame
                key={rowNode.id || rowIndex}
                className="cci-nice-menu-storefront-scroll-top-navigation"
                bodyClassName="cci-nice-menu-storefront-grid-top-navigation"
              >
                <BuilderPanel className="cci-nice-menu-mm-card cci-nice-menu-mm-top-row-card tw-rounded-md">
                  <div className="cci-nice-menu-mm-row-body">
                    <div className="cci-nice-menu-mm-row-grid">
                      {columns.map(({ node: column, index, rootColumn }) => {
                        const columnPath = rootColumn ? [index] : [...rowPath, index];
                        const columnItems = (column.children || [])
                          .map((item, itemIndex) => ({ item, itemIndex }))
                          .filter(({ item }) => !isTopNavigationStructureNode(item));
                        const columnSelected = pathsEqual(columnPath, selectedPath);

                        return (
                          <BuilderPanel
                            key={column.id || index}
                            className={[
                              'cci-nice-menu-mm-column-card tw-rounded-md tw-border tw-border-solid',
                              getColumnWidthStateClass(column),
                              columnSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
                              dragSort.getDragClass(rowPath.join('.'), index),
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }}
                            {...(!rootColumn
                              ? dragSort.getDragProps(
                                  rowPath.join('.'),
                                  index,
                                  (fromIndex, toIndex) =>
                                    onMoveChild?.(rowPath, fromIndex, toIndex),
                                )
                              : {})}
                          >
                            <BuilderHeader className="cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                              <BuilderHeading
                                variant="unstyled"
                                type="button"
                                className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                                onClick={() => onSelect(columnPath)}
                                aria-pressed={pathsEqual(columnPath, selectedPath)}
                              >
                                <BuilderGrip
                                  aria-hidden="true"
                                  className="tw-h-4 tw-w-4 tw-shrink-0"
                                />
                                <span className="tw-truncate">
                                  {column.label || `Column ${index + 1}`}
                                </span>
                                <ColumnDimensionBadge column={column} />
                              </BuilderHeading>
                              <BuilderActions
                                className="tw-flex tw-items-center tw-gap-1"
                                data-no-drag="true"
                              >
                                <AddDropdown
                                  label="Add"
                                  compact
                                  actions={[
                                    {
                                      label: __('Menu item', 'cci-nice-menu'),
                                      icon: Plus,
                                      onClick: () => onAddItemToColumn(columnPath),
                                    },
                                    {
                                      label: __('Hook block', 'cci-nice-menu'),
                                      icon: Layers,
                                      onClick: () => onAddHookToColumn(columnPath),
                                    },
                                  ]}
                                />
                                <Button
                                  variant="builder"
                                  size="iconXs"
                                  type="button"
                                  onClick={() => onEdit(columnPath)}
                                  aria-label={__('Edit column', 'cci-nice-menu')}
                                  title={__('Edit column', 'cci-nice-menu')}
                                >
                                  <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="iconXs"
                                  type="button"
                                  onClick={() => onDelete(columnPath)}
                                  aria-label={__('Delete column', 'cci-nice-menu')}
                                  title={__('Delete column', 'cci-nice-menu')}
                                >
                                  <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                </Button>
                              </BuilderActions>
                            </BuilderHeader>
                            <div className="tw-grid tw-gap-2 tw-bg-white tw-p-3">
                              {columnItems.length ? (
                                columnItems.map(({ item, itemIndex }) => {
                                  const itemPath = [...columnPath, itemIndex];
                                  const entryIndex = findTopMenuEntryIndexByPath(entries, itemPath);
                                  const active = entryIndex === activeIndex;
                                  const selected = pathsEqual(itemPath, selectedPath);

                                  return (
                                    <BuilderItem
                                      key={item.id || itemIndex}
                                      className={[
                                        'cci-nice-menu-menu-item-pill',
                                        active ? 'cci-nice-menu-state-active' : '',
                                        selected ? 'cci-nice-menu-state-selected' : '',
                                        dragSort.getDragClass(columnPath.join('.'), itemIndex),
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                      {...dragSort.getDragProps(
                                        columnPath.join('.'),
                                        itemIndex,
                                        (fromIndex, toIndex) =>
                                          onMoveChild?.(columnPath, fromIndex, toIndex),
                                      )}
                                    >
                                      <BuilderItemMain
                                        aria-pressed={active}
                                        type="button"
                                        className="cci-nice-menu-menu-item-main"
                                        onClick={() => activateEntry(itemPath)}
                                      >
                                        <BuilderGrip
                                          aria-hidden="true"
                                          className="cci-nice-menu-menu-item-grip"
                                        />
                                        <BuilderItemTitle className="cci-nice-menu-menu-item-label">
                                          {item.label || `Menu item ${itemIndex + 1}`}
                                        </BuilderItemTitle>
                                      </BuilderItemMain>
                                      <BuilderActions
                                        className="cci-nice-menu-menu-item-actions"
                                        data-no-drag="true"
                                      >
                                        <Button
                                          variant="builder"
                                          size="iconXs"
                                          type="button"
                                          onClick={() => {
                                            activateEntry(itemPath);
                                            onEdit(itemPath);
                                          }}
                                          aria-label={__('Edit menu item', 'cci-nice-menu')}
                                        >
                                          <Pencil aria-hidden="true" />
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="iconXs"
                                          type="button"
                                          onClick={() => onDelete(itemPath)}
                                          aria-label={__('Delete menu item', 'cci-nice-menu')}
                                        >
                                          <Trash2 aria-hidden="true" />
                                        </Button>
                                      </BuilderActions>
                                    </BuilderItem>
                                  );
                                })
                              ) : (
                                <Button
                                  variant="unstyled"
                                  type="button"
                                  className="tw-flex tw-min-h-14 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                                  onClick={() => onAddItemToColumn(columnPath)}
                                >
                                  <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                                  {__('Add first link', 'cci-nice-menu')}
                                </Button>
                              )}
                            </div>
                          </BuilderPanel>
                        );
                      })}
                    </div>
                  </div>
                </BuilderPanel>
              </StorefrontEditorFrame>
            );
          })
        ) : (
          <div className="tw-grid tw-min-h-28 tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-white tw-p-6 tw-text-center">
            <Button variant="add" type="button" onClick={onAddRow}>
              <Plus aria-hidden="true" />
              {__('Create top navigation layout', 'cci-nice-menu')}
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
  const selectedMainIndex =
    selectedPath[0] === activeTopIndex &&
    selectedPath[1] === tabsEntry.index &&
    selectedPath[2] === tabsBlockEntry.index &&
    typeof selectedPath[3] === 'number'
      ? selectedPath[3]
      : null;
  const activeMainEntry =
    mainEntries.find((entry) => entry.index === selectedMainIndex) || mainEntries[0] || null;
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
  return clampGridSpan(column?.column_span, fallback) <= 2
    ? 'cci-nice-menu-mm-column-card-narrow'
    : '';
}

function ColumnDimensionBadge({ column, fallback = 4 }) {
  const span = clampGridSpan(column?.column_span, fallback);

  return (
    <BuilderMetric
      className="cci-nice-menu-mm-column-size"
      title={`Column width: ${span} of ${EDITOR_GRID_COLUMNS}`}
    >
      <span>
        {span}/{EDITOR_GRID_COLUMNS}
      </span>
    </BuilderMetric>
  );
}

function GridRuler() {
  return (
    <BuilderRuler
      className="cci-nice-menu-storefront-ruler"
      aria-label={__('12-column grid', 'cci-nice-menu')}
    />
  );
}

function StorefrontEditorFrame({
  children,
  className = '',
  bodyClassName = '',
  mirrorScrollbar = false,
}) {
  const mirrorScrollRef = React.useRef(null);
  const contentScrollRef = React.useRef(null);
  const syncingScrollRef = React.useRef(false);
  const [mirrorWidth, setMirrorWidth] = React.useState(0);
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
      setMirrorWidth(contentScroll.scrollWidth);
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
  }, [mirrorScrollbar]);

  return (
    <div className="cci-nice-menu-storefront-frame">
      {mirrorScrollbar && showMirrorScrollbar ? (
        <div
          ref={mirrorScrollRef}
          className="cci-nice-menu-storefront-scroll-x"
          data-no-drag="true"
          aria-label={__('Horizontal editor scroll', 'cci-nice-menu')}
          onScroll={() => syncHorizontalScroll(mirrorScrollRef.current, contentScrollRef.current)}
        >
          <div
            className="cci-nice-menu-storefront-scroll-x-inner"
            style={{ width: `${mirrorWidth}px` }}
          />
        </div>
      ) : null}
      <div
        ref={contentScrollRef}
        className={['cci-nice-menu-storefront-scroll', className].filter(Boolean).join(' ')}
        onScroll={() => syncHorizontalScroll(contentScrollRef.current, mirrorScrollRef.current)}
      >
        <div className="cci-nice-menu-storefront-stage">
          <GridRuler />
          <div
            className={['cci-nice-menu-storefront-grid', bodyClassName].filter(Boolean).join(' ')}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabsSupportList({
  entries = [],
  parentPath = [],
  selectedPath = [],
  onSelect,
  onEdit,
  onDelete,
  onAddBlock,
}) {
  return (
    <div className="cci-nice-menu-tabs-support" data-no-drag="true">
      <div className="cci-nice-menu-tabs-support-header">
        <span>{__('Below tabs', 'cci-nice-menu')}</span>
        <div className="cci-nice-menu-tabs-support-header-actions">
          <strong>{entries.length}</strong>
          <AddIconButton label="Add block below tabs" onClick={() => onAddBlock?.(parentPath)} />
        </div>
      </div>
      <div className="cci-nice-menu-tabs-support-list">
        {entries.length ? (
          entries.map(({ node, index }) => {
            const path = [...parentPath, index];
            const selected = pathsEqual(path, selectedPath);
            const displayLabel = getAdminNodeDisplayLabel(node);
            const supportTypeLabel = getAdminNodeTypeDisplayLabel(node, displayLabel);

            return (
              <div
                key={node.id || index}
                className={[
                  'cci-nice-menu-tabs-support-item',
                  selected ? 'cci-nice-menu-state-selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Button
                  variant="unstyled"
                  type="button"
                  className="cci-nice-menu-tabs-support-button"
                  onClick={() => onSelect(path)}
                  aria-pressed={pathsEqual(path, selectedPath)}
                >
                  <NodeIconPreview node={node} fallback={Boxes} className="tw-h-4 tw-w-4" />
                  <span className="cci-nice-menu-tabs-support-copy">
                    <strong>{displayLabel}</strong>
                    {supportTypeLabel ? <small>{supportTypeLabel}</small> : null}
                  </span>
                </Button>
                <div className="cci-nice-menu-tabs-support-actions">
                  <Button
                    variant="builder"
                    size="iconXs"
                    type="button"
                    onClick={() => onEdit(path)}
                    aria-label={__('Edit below-tabs block', 'cci-nice-menu')}
                  >
                    <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                  </Button>
                  <Button
                    variant="danger"
                    size="iconXs"
                    type="button"
                    onClick={() => onDelete(path)}
                    aria-label={__('Delete below-tabs block', 'cci-nice-menu')}
                  >
                    <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <Button
            variant="unstyled"
            type="button"
            className="cci-nice-menu-tabs-support-empty"
            onClick={() => onAddBlock?.(parentPath)}
          >
            <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
            {__('Add block below tabs', 'cci-nice-menu')}
          </Button>
        )}
      </div>
    </div>
  );
}

function ManualFlyoutCanvas({
  activeTop,
  activeTopIndex,
  selectedPath,
  model,
  onSelect,
  onEdit,
  onDelete,
  onAddColumn,
  onAddBlock,
  onAddContent,
  onAddBelowTabsBlock,
  onAddChild,
  onMoveChild,
  settings = {},
}) {
  const activeMain = model.activeMainEntry?.node || null;
  const activeMainPath = model.activeMainPath;
  const tabsOrientation = model.tabsOrientation || 'vertical';
  const isHorizontalTabs = tabsOrientation === 'horizontal';
  const layoutEntries = activeMain
    ? (activeMain.children || [])
        .map((node, index) => ({ node, index }))
        .filter((entry) => isLayoutEntry(entry.node))
    : [];
  const looseEntries = activeMain
    ? (activeMain.children || [])
        .map((node, index) => ({ node, index }))
        .filter((entry) => !isLayoutEntry(entry.node))
    : [];
  const dragSort = useDragSort();

  return (
    <section className="tw-min-w-0 tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white">
      <div className="cci-nice-menu-tabs-content-header">
        <div className="tw-min-w-0">
          <strong className="tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand">
            <FolderTree aria-hidden="true" />
            {__('Mega menu tabs', 'cci-nice-menu')}
          </strong>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {__(
              'Build the catalog like in the shop: tabs control which columns and blocks are visible.',
              'cci-nice-menu',
            )}
          </p>
        </div>
        <AddIconButton
          label="Add tab"
          size="iconSm"
          onClick={() => onAddContent(model.railBlockPath)}
        />
      </div>

      <div
        className={`cci-nice-menu-tabs-workspace ${isHorizontalTabs ? 'cci-nice-menu-tabs-workspace-horizontal' : 'cci-nice-menu-tabs-workspace-vertical'} tw-grid tw-min-h-[560px]`}
      >
        <aside
          className={`cci-nice-menu-tabs-rail ${isHorizontalTabs ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical'}`}
        >
          <div className="cci-nice-menu-tabs-rail-header">
            <div className="tw-min-w-0">
              <strong>{__('Tabs', 'cci-nice-menu')}</strong>
              <p>
                {__('Visible under', 'cci-nice-menu')}{' '}
                {activeTop?.label || __('the top menu item', 'cci-nice-menu')}.
              </p>
            </div>
            <Button
              variant="builder"
              size="sm"
              type="button"
              className="tw-shrink-0"
              onClick={() => onEdit(model.railPath)}
            >
              <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
              {__('Edit tabs', 'cci-nice-menu')}
            </Button>
          </div>
          <div
            className={
              isHorizontalTabs
                ? 'cci-nice-menu-tabs-list cci-nice-menu-state-horizontal'
                : 'cci-nice-menu-tabs-list cci-nice-menu-state-vertical'
            }
          >
            {model.mainEntries.length ? (
              model.mainEntries.map(({ node, index }) => {
                const itemPath = [...model.railBlockPath, index];
                const active = activeMainPath && pathsEqual(itemPath, activeMainPath);

                return (
                  <div
                    key={node.id || index}
                    className={[
                      'cci-nice-menu-tabs-list-item',
                      isHorizontalTabs
                        ? 'cci-nice-menu-state-horizontal'
                        : 'cci-nice-menu-state-vertical',
                      active ? 'cci-nice-menu-state-active cci-nice-menu-mm-tab-active' : '',
                      dragSort.getDragClass((model.railBlockPath || []).join('.'), index),
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    {...dragSort.getDragProps(
                      (model.railBlockPath || []).join('.'),
                      index,
                      (fromIndex, toIndex) =>
                        onMoveChild?.(model.railBlockPath, fromIndex, toIndex),
                    )}
                  >
                    <Button
                      variant="unstyled"
                      type="button"
                      className="cci-nice-menu-tabs-list-button"
                      onClick={() => onSelect(itemPath)}
                    >
                      <strong className="cci-nice-menu-tabs-list-label">
                        {node.label || `Item ${index + 1}`}
                      </strong>
                      <span className="cci-nice-menu-tabs-list-count">
                        {countLayoutChildren(node.children)}
                      </span>
                    </Button>
                    <div className="tw-flex tw-pr-2" data-no-drag="true">
                      <Button
                        variant="builder"
                        size="iconXs"
                        type="button"
                        onClick={() => onEdit(itemPath)}
                        aria-label={__('Edit left item', 'cci-nice-menu')}
                      >
                        <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                      </Button>
                      <Button
                        variant="danger"
                        size="iconXs"
                        type="button"
                        className="tw-ml-1"
                        onClick={() => onDelete(itemPath)}
                        aria-label={__('Delete left item', 'cci-nice-menu')}
                      >
                        <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <Button
                variant="unstyled"
                type="button"
                className="tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                onClick={() => onAddContent(model.railBlockPath)}
              >
                <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                {__('Add first tab', 'cci-nice-menu')}
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

        <div className="cci-nice-menu-tabs-content-panel">
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-4 tw-py-4">
            <div className="tw-min-w-0">
              <strong className="tw-block tw-truncate tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text">
                {activeMain ? activeMain.label : __('Select a left item', 'cci-nice-menu')}
              </strong>
              <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                {__(
                  'Columns and blocks shown here open when this tab is hovered.',
                  'cci-nice-menu',
                )}
              </p>
            </div>
            {activeMainPath ? (
              <AddDropdown
                label="Add"
                compact
                actions={[
                  {
                    label: __('Add column', 'cci-nice-menu'),
                    icon: Columns3,
                    onClick: () => onAddColumn(activeMainPath),
                  },
                  {
                    label: __('Add child', 'cci-nice-menu'),
                    icon: Plus,
                    onClick: () => onAddContent(activeMainPath),
                  },
                ]}
              />
            ) : null}
          </div>

          <div className="cci-nice-menu-tabs-content-body tw-min-h-[460px]">
            {activeMainPath && layoutEntries.length ? (
              <StorefrontEditorFrame
                className="cci-nice-menu-storefront-scroll-tabs"
                mirrorScrollbar
              >
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
                      />
                    );
                  }

                  const column = layoutNode;
                  const columnPath = layoutPath;
                  const blocks = column.children || [];
                  const selected = pathsEqual(columnPath, selectedPath);

                  return (
                    <BuilderPanel
                      key={column.id || index}
                      className={[
                        'cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-bg-white tw-shadow-sm',
                        getColumnWidthStateClass(column),
                        selected
                          ? 'tw-border-cci-nm-brandBorder tw-ring-2 tw-ring-cci-nm-brand/10'
                          : 'tw-border-transparent',
                        dragSort.getDragClass((activeMainPath || []).join('.'), index),
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }}
                      {...dragSort.getDragProps(
                        (activeMainPath || []).join('.'),
                        index,
                        (fromIndex, toIndex) => onMoveChild?.(activeMainPath, fromIndex, toIndex),
                      )}
                    >
                      <BuilderHeader className="cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-3 tw-py-2.5">
                        <BuilderHeading
                          variant="unstyled"
                          type="button"
                          className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                          onClick={() => onSelect(columnPath)}
                          aria-pressed={pathsEqual(columnPath, selectedPath)}
                        >
                          <BuilderGrip aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                          <span className="tw-truncate">
                            {column.label || `Column ${index + 1}`}
                          </span>
                          <ColumnDimensionBadge column={column} />
                        </BuilderHeading>
                        <BuilderActions
                          className="tw-flex tw-items-center tw-gap-1"
                          data-no-drag="true"
                        >
                          <AddIconButton label="Add block" onClick={() => onAddBlock(columnPath)} />
                          <Button
                            variant="builder"
                            size="iconXs"
                            type="button"
                            onClick={() => onEdit(columnPath)}
                            aria-label={__('Edit column', 'cci-nice-menu')}
                            title={__('Edit column', 'cci-nice-menu')}
                          >
                            <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                          </Button>
                          <Button
                            variant="danger"
                            size="iconXs"
                            type="button"
                            onClick={() => onDelete(columnPath)}
                            aria-label={__('Delete column', 'cci-nice-menu')}
                            title={__('Delete column', 'cci-nice-menu')}
                          >
                            <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                          </Button>
                        </BuilderActions>
                      </BuilderHeader>
                      <div className="tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3">
                        {blocks.length ? (
                          blocks.map((block, blockIndex) => {
                            const blockPath = [...columnPath, blockIndex];

                            return (
                              <BuilderPanel
                                key={block.id || blockIndex}
                                className={[
                                  'cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-transparent tw-bg-white tw-shadow-sm',
                                  isImplicitLinksBlock(block)
                                    ? 'cci-nice-menu-mm-block-card-implicit'
                                    : '',
                                  dragSort.getDragClass(columnPath.join('.'), blockIndex),
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                {...dragSort.getDragProps(
                                  columnPath.join('.'),
                                  blockIndex,
                                  (fromIndex, toIndex) =>
                                    onMoveChild?.(columnPath, fromIndex, toIndex),
                                )}
                              >
                                <BuilderHeader className="cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-3 tw-py-2.5">
                                  <BuilderHeading
                                    variant="unstyled"
                                    type="button"
                                    className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                                    onClick={() => onSelect(blockPath)}
                                    aria-pressed={pathsEqual(blockPath, selectedPath)}
                                  >
                                    <Boxes
                                      aria-hidden="true"
                                      className="tw-h-4 tw-w-4 tw-shrink-0"
                                    />
                                    <span className="tw-truncate">
                                      {getBlockHeaderLabel(
                                        block,
                                        blockIndex,
                                        blocks.length,
                                        column.label,
                                      )}
                                    </span>
                                  </BuilderHeading>
                                  <BuilderActions
                                    className="tw-flex tw-items-center tw-gap-1"
                                    data-no-drag="true"
                                  >
                                    <AddIconButton
                                      label="Add content"
                                      onClick={() => onAddContent(blockPath)}
                                    />
                                    <Button
                                      variant="builder"
                                      size="iconXs"
                                      type="button"
                                      onClick={() => onEdit(blockPath)}
                                      aria-label={__('Edit block', 'cci-nice-menu')}
                                      title={__('Edit block', 'cci-nice-menu')}
                                    >
                                      <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="iconXs"
                                      type="button"
                                      onClick={() => onDelete(blockPath)}
                                      aria-label={__('Delete block', 'cci-nice-menu')}
                                      title={__('Delete block', 'cci-nice-menu')}
                                    >
                                      <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                    </Button>
                                  </BuilderActions>
                                </BuilderHeader>
                                <div className="tw-grid tw-gap-2 tw-bg-white tw-p-3">
                                  {(block.children || []).length ? (
                                    block.children.map((item, itemIndex) => (
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
                                        onMove={(fromIndex, toIndex) =>
                                          onMoveChild?.(blockPath, fromIndex, toIndex)
                                        }
                                        onMoveChild={onMoveChild}
                                      />
                                    ))
                                  ) : (
                                    <Button
                                      variant="unstyled"
                                      type="button"
                                      className="tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                                      onClick={() => onAddContent(blockPath)}
                                    >
                                      <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                                      {__('Add content', 'cci-nice-menu')}
                                    </Button>
                                  )}
                                </div>
                              </BuilderPanel>
                            );
                          })
                        ) : (
                          <Button
                            variant="unstyled"
                            type="button"
                            className="tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                            onClick={() => onAddBlock(columnPath)}
                          >
                            <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                            {__('Add block', 'cci-nice-menu')}
                          </Button>
                        )}
                      </div>
                    </BuilderPanel>
                  );
                })}
              </StorefrontEditorFrame>
            ) : activeMainPath ? (
              <div className="tw-grid tw-min-h-[360px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-8 tw-text-center">
                <div className="tw-max-w-md">
                  <Columns3
                    aria-hidden="true"
                    className="tw-mx-auto tw-mb-3 tw-h-8 tw-w-8 tw-text-cci-nm-brand"
                  />
                  <h3 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-cci-nm-text">
                    {__('No columns for this item yet', 'cci-nice-menu')}
                  </h3>
                  <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                    {__('Add columns to build the submenu content for this tab.', 'cci-nice-menu')}
                  </p>
                  <Button
                    className="tw-mt-4"
                    variant="add"
                    size="sm"
                    type="button"
                    onClick={() => onAddColumn(activeMainPath)}
                  >
                    <Plus aria-hidden="true" />
                    {__('Add first column', 'cci-nice-menu')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="tw-grid tw-min-h-[360px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-8 tw-text-center">
                <Button
                  variant="add"
                  size="sm"
                  type="button"
                  onClick={() => onAddContent(model.railBlockPath)}
                >
                  <Plus aria-hidden="true" />
                  {__('Add first tab', 'cci-nice-menu')}
                </Button>
              </div>
            )}

            {looseEntries.length && activeMainPath ? (
              <div className="tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3">
                <strong className="tw-text-sm tw-font-semibold tw-text-amber-900">
                  {__('Direct children outside columns', 'cci-nice-menu')}
                </strong>
                <div className="tw-mt-2 tw-grid tw-gap-2">
                  {looseEntries.map(({ node, index }) => (
                    <NodeMiniCard
                      key={node.id || index}
                      node={node}
                      path={[...activeMainPath, index]}
                      selectedPath={selectedPath}
                      onSelect={onSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                      sortScope={(activeMainPath || []).join('.')}
                      sortIndex={index}
                      onMove={(fromIndex, toIndex) =>
                        onMoveChild?.(activeMainPath, fromIndex, toIndex)
                      }
                      onMoveChild={onMoveChild}
                    />
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
  const selectedTabIndex =
    pathStartsWith(selectedPath, tabsBlockPath) &&
    typeof selectedPath[tabsBlockPath.length] === 'number'
      ? selectedPath[tabsBlockPath.length]
      : null;
  const activeTabEntry =
    tabEntries.find((entry) => entry.index === selectedTabIndex) || tabEntries[0] || null;
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

function TabsGroupCard({
  column,
  columnPath,
  model,
  selectedPath,
  onSelect,
  onEdit,
  onDelete,
  onAddColumn,
  onAddBlock,
  onAddContent,
  onAddBelowTabsBlock,
  onAddChild,
  onMoveChild,
}) {
  const activeTab = model.activeTabEntry?.node || null;
  const activeTabPath = model.activeTabPath;
  const isHorizontal = model.tabsOrientation === 'horizontal';
  const tabLayoutEntries = activeTab
    ? (activeTab.children || [])
        .map((node, index) => ({ node, index }))
        .filter((entry) => isLayoutEntry(entry.node))
    : [];
  const looseEntries = activeTab
    ? (activeTab.children || [])
        .map((node, index) => ({ node, index }))
        .filter((entry) => !isLayoutEntry(entry.node))
    : [];
  const dragSort = useDragSort();
  const columnSortScope = columnPath.slice(0, -1).join('.');
  const columnSortIndex = columnPath[columnPath.length - 1];

  return (
    <BuilderPanel
      className={[
        'cci-nice-menu-mm-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid xl:tw-col-span-2 2xl:tw-col-span-3',
        dragSort.getDragClass(columnSortScope, columnSortIndex),
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ gridColumn: `span ${Math.max(1, Math.min(12, Number(column.column_span || 12)))}` }}
      {...dragSort.getDragProps(columnSortScope, columnSortIndex, (fromIndex, toIndex) =>
        onMoveChild?.(columnPath.slice(0, -1), fromIndex, toIndex),
      )}
    >
      <BuilderHeader className="cci-nice-menu-mm-card-header tw-flex tw-items-start tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-4 tw-py-3">
        <BuilderHeading
          variant="unstyled"
          type="button"
          className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-shadow-none"
          onClick={() => onSelect(columnPath)}
          aria-pressed={pathsEqual(columnPath, selectedPath)}
        >
          <Layers aria-hidden="true" className="tw-h-5 tw-w-5 tw-shrink-0" />
          <span className="tw-min-w-0">
            <strong className="tw-block tw-truncate tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
              {column.label || __('Tabs group', 'cci-nice-menu')}
            </strong>
            <span className="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-xs tw-font-medium tw-text-cci-nm-muted">
              {isHorizontal
                ? __('Horizontal tabs', 'cci-nice-menu')
                : __('Vertical tabs', 'cci-nice-menu')}
              <ColumnDimensionBadge column={column} fallback={12} />
            </span>
          </span>
        </BuilderHeading>
        <BuilderActions className="tw-flex tw-flex-wrap tw-justify-end tw-gap-1">
          {model.tabsBlockPath ? (
            <AddIconButton
              label="Add tab"
              size="iconSm"
              onClick={() => onAddContent(model.tabsBlockPath)}
            />
          ) : (
            <AddIconButton
              label="Add tabs block"
              size="iconSm"
              onClick={() => onAddBlock(columnPath)}
            />
          )}
          <Button
            variant="builder"
            size="iconSm"
            type="button"
            onClick={() => onEdit(columnPath)}
            aria-label={__('Edit tabs group', 'cci-nice-menu')}
          >
            <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="iconSm"
            type="button"
            onClick={() => onDelete(columnPath)}
            aria-label={__('Delete tabs group', 'cci-nice-menu')}
          >
            <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
          </Button>
        </BuilderActions>
      </BuilderHeader>

      {!model.tabsBlockPath ? (
        <div className="tw-grid tw-min-h-40 tw-place-items-center tw-bg-slate-50 tw-p-6 tw-text-center">
          <Button variant="add" size="sm" type="button" onClick={() => onAddBlock(columnPath)}>
            <Plus aria-hidden="true" />
            {__('Add tabs block', 'cci-nice-menu')}
          </Button>
        </div>
      ) : (
        <div
          className={`cci-nice-menu-tabs-workspace ${isHorizontal ? 'cci-nice-menu-tabs-workspace-horizontal' : 'cci-nice-menu-tabs-workspace-vertical'}`}
        >
          <aside
            className={`cci-nice-menu-tabs-rail ${isHorizontal ? 'cci-nice-menu-state-horizontal' : 'cci-nice-menu-state-vertical'}`}
          >
            <div className="cci-nice-menu-tabs-rail-header">
              <div>
                <strong>{__('Tabs', 'cci-nice-menu')}</strong>
                <p>
                  {isHorizontal
                    ? __('Horizontal navigation', 'cci-nice-menu')
                    : __('Vertical navigation', 'cci-nice-menu')}
                </p>
              </div>
              <span className="cci-nice-menu-tabs-total">{model.tabEntries.length}</span>
            </div>
            <div
              className={
                isHorizontal
                  ? 'cci-nice-menu-tabs-list cci-nice-menu-state-horizontal'
                  : 'cci-nice-menu-tabs-list cci-nice-menu-state-vertical'
              }
            >
              {model.tabEntries.length ? (
                model.tabEntries.map(({ node, index }) => {
                  const tabPath = [...model.tabsBlockPath, index];
                  const active = activeTabPath && pathsEqual(tabPath, activeTabPath);

                  return (
                    <div
                      key={node.id || index}
                      className={[
                        'cci-nice-menu-tabs-list-item',
                        isHorizontal
                          ? 'cci-nice-menu-state-horizontal'
                          : 'cci-nice-menu-state-vertical',
                        active ? 'cci-nice-menu-state-active cci-nice-menu-mm-tab-active' : '',
                        dragSort.getDragClass((model.tabsBlockPath || []).join('.'), index),
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      {...dragSort.getDragProps(
                        (model.tabsBlockPath || []).join('.'),
                        index,
                        (fromIndex, toIndex) =>
                          onMoveChild?.(model.tabsBlockPath, fromIndex, toIndex),
                      )}
                    >
                      <Button
                        variant="unstyled"
                        type="button"
                        className="tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-px-3 tw-py-3 tw-text-left tw-shadow-none"
                        onClick={() => onSelect(tabPath)}
                      >
                        <strong className="cci-nice-menu-tabs-list-label">
                          {node.label || `Tab ${index + 1}`}
                        </strong>
                        <span className="cci-nice-menu-tabs-list-count">
                          {countLayoutChildren(node.children)}
                        </span>
                      </Button>
                      <div className="tw-flex tw-pr-2" data-no-drag="true">
                        <Button
                          variant="builder"
                          size="iconXs"
                          type="button"
                          onClick={() => onEdit(tabPath)}
                          aria-label={__('Edit tab', 'cci-nice-menu')}
                        >
                          <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          size="iconXs"
                          type="button"
                          className="tw-ml-1"
                          onClick={() => onDelete(tabPath)}
                          aria-label={__('Delete tab', 'cci-nice-menu')}
                        >
                          <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Button
                  variant="unstyled"
                  type="button"
                  className="tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                  onClick={() => onAddContent(model.tabsBlockPath)}
                >
                  <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                  {__('Add first tab', 'cci-nice-menu')}
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

          <div className="cci-nice-menu-tabs-content-panel cci-nice-menu-mm-content-panel">
            <div className="cci-nice-menu-tabs-content-header">
              <div className="tw-min-w-0">
                <strong className="tw-block tw-truncate tw-text-base tw-font-semibold tw-text-cci-nm-text">
                  {activeTab ? activeTab.label : __('Select a tab', 'cci-nice-menu')}
                </strong>
                <p className="tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                  {__('This is the content opened by the selected tab.', 'cci-nice-menu')}
                </p>
              </div>
              {activeTabPath ? (
                <AddDropdown
                  label="Add"
                  compact
                  actions={[
                    {
                      label: __('Add column', 'cci-nice-menu'),
                      icon: Columns3,
                      onClick: () => onAddColumn(activeTabPath),
                    },
                    {
                      label: __('Add child', 'cci-nice-menu'),
                      icon: Plus,
                      onClick: () => onAddContent(activeTabPath),
                    },
                  ]}
                />
              ) : null}
            </div>

            <div className="cci-nice-menu-tabs-content-body tw-min-h-[300px]">
              {activeTabPath && tabLayoutEntries.length ? (
                <StorefrontEditorFrame
                  className="cci-nice-menu-storefront-scroll-nested"
                  mirrorScrollbar
                >
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
                        />
                      );
                    }

                    const childColumn = layoutNode;
                    const childColumnPath = layoutPath;
                    const blocks = childColumn.children || [];

                    return (
                      <BuilderPanel
                        key={childColumn.id || index}
                        className={[
                          'cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                          getColumnWidthStateClass(childColumn),
                          pathsEqual(childColumnPath, selectedPath)
                            ? 'tw-ring-2 tw-ring-cci-nm-brand/10'
                            : '',
                          dragSort.getDragClass((activeTabPath || []).join('.'), index),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ gridColumn: `span ${clampGridSpan(childColumn.column_span, 4)}` }}
                        {...dragSort.getDragProps(
                          (activeTabPath || []).join('.'),
                          index,
                          (fromIndex, toIndex) => onMoveChild?.(activeTabPath, fromIndex, toIndex),
                        )}
                      >
                        <BuilderHeader className="cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                          <BuilderHeading
                            variant="unstyled"
                            type="button"
                            className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                            onClick={() => onSelect(childColumnPath)}
                            aria-pressed={pathsEqual(childColumnPath, selectedPath)}
                          >
                            <BuilderGrip aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                            <span className="tw-truncate">
                              {childColumn.label || `Column ${index + 1}`}
                            </span>
                            <ColumnDimensionBadge column={childColumn} />
                          </BuilderHeading>
                          <BuilderActions
                            className="tw-flex tw-items-center tw-gap-1"
                            data-no-drag="true"
                          >
                            <AddIconButton
                              label="Add block"
                              onClick={() => onAddBlock(childColumnPath)}
                            />
                            <Button
                              variant="builder"
                              size="iconXs"
                              type="button"
                              onClick={() => onEdit(childColumnPath)}
                              aria-label={__('Edit tab column', 'cci-nice-menu')}
                            >
                              <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                            </Button>
                            <Button
                              variant="danger"
                              size="iconXs"
                              type="button"
                              onClick={() => onDelete(childColumnPath)}
                              aria-label={__('Delete tab column', 'cci-nice-menu')}
                            >
                              <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                            </Button>
                          </BuilderActions>
                        </BuilderHeader>
                        <div className="tw-grid tw-gap-2 tw-bg-white tw-p-3">
                          {blocks.length ? (
                            blocks.map((block, blockIndex) => {
                              const blockPath = [...childColumnPath, blockIndex];

                              return (
                                <BuilderPanel
                                  key={block.id || blockIndex}
                                  className={[
                                    'cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                                    isImplicitLinksBlock(block)
                                      ? 'cci-nice-menu-mm-block-card-implicit'
                                      : '',
                                    dragSort.getDragClass(childColumnPath.join('.'), blockIndex),
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  {...dragSort.getDragProps(
                                    childColumnPath.join('.'),
                                    blockIndex,
                                    (fromIndex, toIndex) =>
                                      onMoveChild?.(childColumnPath, fromIndex, toIndex),
                                  )}
                                >
                                  <BuilderHeader className="cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-2 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2">
                                    <BuilderHeading
                                      variant="unstyled"
                                      type="button"
                                      className="tw-min-w-0 tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                                      onClick={() => onSelect(blockPath)}
                                      aria-pressed={pathsEqual(blockPath, selectedPath)}
                                    >
                                      <span className="tw-truncate">
                                        {getBlockHeaderLabel(
                                          block,
                                          blockIndex,
                                          blocks.length,
                                          childColumn.label,
                                        )}
                                      </span>
                                    </BuilderHeading>
                                    <BuilderActions
                                      className="tw-flex tw-gap-1"
                                      data-no-drag="true"
                                    >
                                      <AddIconButton
                                        label="Add content"
                                        onClick={() => onAddContent(blockPath)}
                                      />
                                      <Button
                                        variant="builder"
                                        size="iconXs"
                                        type="button"
                                        onClick={() => onEdit(blockPath)}
                                        aria-label={__('Edit block', 'cci-nice-menu')}
                                        title={__('Edit block', 'cci-nice-menu')}
                                      >
                                        <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="iconXs"
                                        type="button"
                                        onClick={() => onDelete(blockPath)}
                                        aria-label={__('Delete block', 'cci-nice-menu')}
                                        title={__('Delete block', 'cci-nice-menu')}
                                      >
                                        <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                      </Button>
                                    </BuilderActions>
                                  </BuilderHeader>
                                  <div className="tw-grid tw-gap-2 tw-p-3">
                                    {(block.children || []).length ? (
                                      block.children.map((item, itemIndex) => (
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
                                          onMove={(fromIndex, toIndex) =>
                                            onMoveChild?.(blockPath, fromIndex, toIndex)
                                          }
                                          onMoveChild={onMoveChild}
                                        />
                                      ))
                                    ) : (
                                      <Button
                                        variant="unstyled"
                                        type="button"
                                        className="tw-flex tw-min-h-16 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                                        onClick={() => onAddContent(blockPath)}
                                      >
                                        <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                                        {__('Add content', 'cci-nice-menu')}
                                      </Button>
                                    )}
                                  </div>
                                </BuilderPanel>
                              );
                            })
                          ) : (
                            <Button
                              variant="unstyled"
                              type="button"
                              className="tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                              onClick={() => onAddBlock(childColumnPath)}
                            >
                              <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                              {__('Add block', 'cci-nice-menu')}
                            </Button>
                          )}
                        </div>
                      </BuilderPanel>
                    );
                  })}
                </StorefrontEditorFrame>
              ) : activeTabPath ? (
                <div className="tw-grid tw-min-h-[220px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-6 tw-text-center">
                  <Button
                    variant="add"
                    size="sm"
                    type="button"
                    onClick={() => onAddColumn(activeTabPath)}
                  >
                    <Plus aria-hidden="true" />
                    {__('Add first column', 'cci-nice-menu')}
                  </Button>
                </div>
              ) : (
                <div className="tw-grid tw-min-h-[220px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-6 tw-text-center">
                  <Button
                    variant="add"
                    size="sm"
                    type="button"
                    onClick={() => onAddContent(model.tabsBlockPath)}
                  >
                    <Plus aria-hidden="true" />
                    {__('Add first tab', 'cci-nice-menu')}
                  </Button>
                </div>
              )}

              {looseEntries.length && activeTabPath ? (
                <div className="tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3">
                  <strong className="tw-text-sm tw-font-semibold tw-text-amber-900">
                    {__('Direct children outside columns', 'cci-nice-menu')}
                  </strong>
                  <div className="tw-mt-2 tw-grid tw-gap-2">
                    {looseEntries.map(({ node, index }) => (
                      <NodeMiniCard
                        key={node.id || index}
                        node={node}
                        path={[...activeTabPath, index]}
                        selectedPath={selectedPath}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onAddChild={onAddChild}
                        sortScope={(activeTabPath || []).join('.')}
                        sortIndex={index}
                        onMove={(fromIndex, toIndex) =>
                          onMoveChild?.(activeTabPath, fromIndex, toIndex)
                        }
                        onMoveChild={onMoveChild}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </BuilderPanel>
  );
}

function RowCard({
  row,
  rowPath,
  selectedPath,
  onSelect,
  onEdit,
  onDelete,
  onAddColumn,
  onAddBlock,
  onAddContent,
  onAddChild,
  onMoveChild,
}) {
  const nestedEntries = (row.children || []).map((node, index) => ({ node, index }));
  const nestedColumns = nestedEntries.filter((entry) => entry.node.type === 'column');
  const looseEntries = nestedEntries.filter((entry) => entry.node.type !== 'column');
  const dragSort = useDragSort();
  const parentPath = rowPath.slice(0, -1);
  const rowIndex = rowPath[rowPath.length - 1];
  const sortScope = parentPath.join('.');
  const selected = pathsEqual(rowPath, selectedPath);

  return (
    <BuilderPanel
      className={[
        'cci-nice-menu-mm-row-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
        selected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
        dragSort.getDragClass(sortScope, rowIndex),
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ gridColumn: `span ${clampGridSpan(row.column_span, 12)}` }}
      {...dragSort.getDragProps(sortScope, rowIndex, (fromIndex, toIndex) =>
        onMoveChild?.(parentPath, fromIndex, toIndex),
      )}
    >
      <BuilderHeader className="cci-nice-menu-mm-row-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
        <BuilderHeading
          variant="unstyled"
          type="button"
          className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
          onClick={() => onSelect(rowPath)}
          aria-pressed={pathsEqual(rowPath, selectedPath)}
        >
          <BuilderGrip aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
          <span className="tw-truncate">{row.label || 'Row'}</span>
          <ColumnDimensionBadge column={row} fallback={12} />
          <BuilderMetric kind="count" className="cci-nice-menu-mm-row-count">
            {__('Columns: %count%', 'cci-nice-menu').replace(
              '%count%',
              String(nestedColumns.length),
            )}
          </BuilderMetric>
        </BuilderHeading>
        <BuilderActions className="tw-flex tw-items-center tw-gap-1" data-no-drag="true">
          <AddIconButton
            label={__('Add column', 'cci-nice-menu')}
            onClick={() => onAddColumn(rowPath)}
          />
          <Button
            variant="builder"
            size="iconXs"
            type="button"
            onClick={() => onEdit(rowPath)}
            aria-label={__('Edit row', 'cci-nice-menu')}
            title={__('Edit row', 'cci-nice-menu')}
          >
            <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="iconXs"
            type="button"
            onClick={() => onDelete(rowPath)}
            aria-label={__('Delete row', 'cci-nice-menu')}
            title={__('Delete row', 'cci-nice-menu')}
          >
            <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
          </Button>
        </BuilderActions>
      </BuilderHeader>

      <div className="cci-nice-menu-mm-row-body">
        <div className="cci-nice-menu-mm-row-grid">
          {nestedColumns.map(({ node: childColumn, index }) => {
            const childColumnPath = [...rowPath, index];
            const blocks = childColumn.children || [];
            const childSelected = pathsEqual(childColumnPath, selectedPath);

            return (
              <BuilderPanel
                key={childColumn.id || index}
                className={[
                  'cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                  getColumnWidthStateClass(childColumn),
                  childSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
                  dragSort.getDragClass(rowPath.join('.'), index),
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ gridColumn: `span ${clampGridSpan(childColumn.column_span, 4)}` }}
                {...dragSort.getDragProps(rowPath.join('.'), index, (fromIndex, toIndex) =>
                  onMoveChild?.(rowPath, fromIndex, toIndex),
                )}
              >
                <BuilderHeader className="cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                  <BuilderHeading
                    variant="unstyled"
                    type="button"
                    className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                    onClick={() => onSelect(childColumnPath)}
                    aria-pressed={pathsEqual(childColumnPath, selectedPath)}
                  >
                    <BuilderGrip aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                    <span className="tw-truncate">
                      {childColumn.label || `Column ${index + 1}`}
                    </span>
                    <ColumnDimensionBadge column={childColumn} />
                  </BuilderHeading>
                  <BuilderActions className="tw-flex tw-items-center tw-gap-1" data-no-drag="true">
                    <AddIconButton label="Add block" onClick={() => onAddBlock(childColumnPath)} />
                    <Button
                      variant="builder"
                      size="iconXs"
                      type="button"
                      onClick={() => onEdit(childColumnPath)}
                      aria-label={__('Edit column', 'cci-nice-menu')}
                      title={__('Edit column', 'cci-nice-menu')}
                    >
                      <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="iconXs"
                      type="button"
                      onClick={() => onDelete(childColumnPath)}
                      aria-label={__('Delete column', 'cci-nice-menu')}
                      title={__('Delete column', 'cci-nice-menu')}
                    >
                      <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                    </Button>
                  </BuilderActions>
                </BuilderHeader>
                <div className="tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3">
                  {blocks.length ? (
                    blocks.map((block, blockIndex) => {
                      const blockPath = [...childColumnPath, blockIndex];
                      const blockSelected = pathsEqual(blockPath, selectedPath);

                      return (
                        <BuilderPanel
                          key={block.id || blockIndex}
                          className={[
                            'cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                            isImplicitLinksBlock(block)
                              ? 'cci-nice-menu-mm-block-card-implicit'
                              : '',
                            blockSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
                            dragSort.getDragClass(childColumnPath.join('.'), blockIndex),
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          {...dragSort.getDragProps(
                            childColumnPath.join('.'),
                            blockIndex,
                            (fromIndex, toIndex) =>
                              onMoveChild?.(childColumnPath, fromIndex, toIndex),
                          )}
                        >
                          <BuilderHeader className="cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                            <BuilderHeading
                              variant="unstyled"
                              type="button"
                              className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                              onClick={() => onSelect(blockPath)}
                              aria-pressed={pathsEqual(blockPath, selectedPath)}
                            >
                              <Boxes aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                              <span className="tw-truncate">
                                {getBlockHeaderLabel(
                                  block,
                                  blockIndex,
                                  blocks.length,
                                  childColumn.label,
                                )}
                              </span>
                            </BuilderHeading>
                            <BuilderActions
                              className="tw-flex tw-items-center tw-gap-1"
                              data-no-drag="true"
                            >
                              <AddIconButton
                                label="Add content"
                                onClick={() => onAddContent(blockPath)}
                              />
                              <Button
                                variant="builder"
                                size="iconXs"
                                type="button"
                                onClick={() => onEdit(blockPath)}
                                aria-label={__('Edit block', 'cci-nice-menu')}
                                title={__('Edit block', 'cci-nice-menu')}
                              >
                                <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                              </Button>
                              <Button
                                variant="danger"
                                size="iconXs"
                                type="button"
                                onClick={() => onDelete(blockPath)}
                                aria-label={__('Delete block', 'cci-nice-menu')}
                                title={__('Delete block', 'cci-nice-menu')}
                              >
                                <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                              </Button>
                            </BuilderActions>
                          </BuilderHeader>
                          <div className="tw-grid tw-gap-2 tw-bg-white tw-p-3">
                            {(block.children || []).length ? (
                              block.children.map((item, itemIndex) => (
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
                                  onMove={(fromIndex, toIndex) =>
                                    onMoveChild?.(blockPath, fromIndex, toIndex)
                                  }
                                />
                              ))
                            ) : (
                              <Button
                                variant="unstyled"
                                type="button"
                                className="tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                                onClick={() => onAddContent(blockPath)}
                              >
                                <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                                {__('Add content', 'cci-nice-menu')}
                              </Button>
                            )}
                          </div>
                        </BuilderPanel>
                      );
                    })
                  ) : (
                    <Button
                      variant="unstyled"
                      type="button"
                      className="tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                      onClick={() => onAddBlock(childColumnPath)}
                    >
                      <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                      {__('Add block', 'cci-nice-menu')}
                    </Button>
                  )}
                </div>
              </BuilderPanel>
            );
          })}
        </div>

        {looseEntries.length ? (
          <div className="tw-mt-4 tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3">
            <div className="tw-mb-2 tw-flex tw-items-center tw-justify-between tw-gap-3">
              <strong className="tw-text-sm tw-font-semibold tw-text-amber-900">
                {__('Items outside nested columns', 'cci-nice-menu')}
              </strong>
              <span className="tw-text-xs tw-text-amber-700">
                {__(
                  'These items are inside the row wrapper but not inside a column.',
                  'cci-nice-menu',
                )}
              </span>
            </div>
            <div className="tw-grid tw-gap-2">
              {looseEntries.map(({ node, index }) => (
                <NodeMiniCard
                  key={node.id || index}
                  node={node}
                  path={[...rowPath, index]}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  sortScope={rowPath.join('.')}
                  sortIndex={index}
                  onMove={(fromIndex, toIndex) => onMoveChild?.(rowPath, fromIndex, toIndex)}
                  onMoveChild={onMoveChild}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </BuilderPanel>
  );
}

function MegaCanvas({
  activeTop,
  activeTopPath = [],
  selectedPath,
  onSelect,
  onEdit,
  onDelete,
  onAddRow = () => {},
  onAddColumn,
  onAddTabsGroup,
  onAddBlock,
  onAddContent,
  onAddBelowTabsBlock,
  onAddChild,
  onCreateManualFlyout,
  onMoveChild,
  settings = {},
}) {
  const children = activeTop?.children || [];
  const dynamicCategoryFlyout =
    activeTop?.type === 'category_tree' &&
    Number(activeTop?.entity_id || 0) > 0 &&
    !children.length;
  const layoutEntries = children
    .map((node, index) => ({ node, index }))
    .filter((entry) => isLayoutEntry(entry.node));
  const looseEntries = children
    .map((node, index) => ({ node, index }))
    .filter((entry) => !isLayoutEntry(entry.node));
  const dragSort = useDragSort();

  return (
    <section className="tw-min-w-0 tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white">
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-4 tw-py-4">
        <div className="tw-min-w-0">
          <strong className="tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text">
            {dynamicCategoryFlyout
              ? __('Dynamic category flyout', 'cci-nice-menu')
              : __('Dropdown content editor', 'cci-nice-menu')}
          </strong>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {dynamicCategoryFlyout
              ? __(
                  'This catalog dropdown is generated from live PrestaShop categories.',
                  'cci-nice-menu',
                )
              : __(
                  'Build the dropdown panel for the selected top navigation item.',
                  'cci-nice-menu',
                )}
          </p>
        </div>
        {dynamicCategoryFlyout ? (
          <div className="tw-flex tw-flex-wrap tw-justify-end tw-gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => onEdit(activeTopPath)}
            >
              <Pencil aria-hidden="true" />
              {__('Edit source category', 'cci-nice-menu')}
            </Button>
            <Button variant="accent" size="sm" type="button" onClick={onCreateManualFlyout}>
              <Columns3 aria-hidden="true" />
              {__('Convert to manual', 'cci-nice-menu')}
            </Button>
          </div>
        ) : (
          <AddDropdown
            label="Add"
            compact
            actions={[
              { label: __('Add row', 'cci-nice-menu'), icon: Layers, onClick: onAddRow },
              {
                label: __('Add tabs group', 'cci-nice-menu'),
                icon: Layers,
                onClick: onAddTabsGroup,
              },
            ]}
          />
        )}
      </div>

      <div className="tw-min-h-[520px] tw-bg-transparent tw-p-4">
        {dynamicCategoryFlyout ? (
          <div className="tw-grid tw-min-h-[420px] tw-content-start tw-gap-4 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-5">
            <div className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft tw-p-4">
              <div className="tw-min-w-0">
                <div className="tw-flex tw-items-center tw-gap-3">
                  <span className="tw-inline-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-lg tw-bg-white tw-text-cci-nm-brand tw-shadow-sm">
                    <FolderTree aria-hidden="true" className="tw-h-5 tw-w-5" />
                  </span>
                  <div className="tw-min-w-0">
                    <h3 className="tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text">
                      {activeTop?.label || __('KATALOG PRODUKTOW', 'cci-nice-menu')}
                    </h3>
                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                      {__('Source category #', 'cci-nice-menu')}
                      {activeTop?.entity_id}
                      {__(
                        '. The storefront reads its current children directly from the PrestaShop category tables.',
                        'cci-nice-menu',
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <TypeBadge type="category_tree" />
            </div>

            <div className="tw-grid tw-gap-4 xl:tw-grid-cols-3">
              <div className="tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4">
                <strong className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                  <span className="tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white">
                    1
                  </span>
                  {__('Vertical tabs', 'cci-nice-menu')}
                </strong>
                <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                  {__(
                    'Direct child categories of the selected source become tabs controlling the catalog content.',
                    'cci-nice-menu',
                  )}
                </p>
              </div>
              <div className="tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4">
                <strong className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                  <span className="tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white">
                    2
                  </span>
                  {__('Hover category', 'cci-nice-menu')}
                </strong>
                <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                  {__(
                    'Hovering a main category opens its panel on the right, like the shop example.',
                    'cci-nice-menu',
                  )}
                </p>
              </div>
              <div className="tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-p-4">
                <strong className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                  <span className="tw-inline-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brand tw-text-xs tw-text-white">
                    3
                  </span>
                  {__('Auto columns', 'cci-nice-menu')}
                </strong>
                <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                  {__(
                    'Subcategories become grouped columns. You do not maintain these generated columns manually.',
                    'cci-nice-menu',
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : !layoutEntries.length && !looseEntries.length ? (
          <div className="tw-grid tw-min-h-[420px] tw-place-items-center tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-white tw-p-8 tw-text-center">
            <div className="tw-max-w-md">
              <div className="tw-mx-auto tw-mb-4 tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-rounded-full tw-bg-cci-nm-brandSoft tw-text-cci-nm-brand">
                <Layers aria-hidden="true" className="tw-h-6 tw-w-6" />
              </div>
              <h3 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-cci-nm-text">
                {__('Start with a row', 'cci-nice-menu')}
              </h3>
              <p className="tw-m-0 tw-mt-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                {__(
                  'Rows hold columns. Add reusable blocks inside columns, then add categories, products, banners or links.',
                  'cci-nice-menu',
                )}
              </p>
              <div className="tw-mt-4 tw-flex tw-justify-center">
                <AddDropdown
                  label="Add first element"
                  actions={[
                    {
                      label: __('Add first row', 'cci-nice-menu'),
                      icon: Layers,
                      onClick: onAddRow,
                    },
                    {
                      label: __('Add tabs group', 'cci-nice-menu'),
                      icon: Layers,
                      onClick: onAddTabsGroup,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="tw-grid tw-gap-4">
            <StorefrontEditorFrame className="cci-nice-menu-storefront-scroll-viewport">
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
                      model={getTabsGroupModelFromColumn(
                        activeTopPath,
                        index,
                        column,
                        selectedPath,
                      )}
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
                    />
                  );
                }

                return (
                  <BuilderPanel
                    key={column.id || index}
                    className={[
                      'cci-nice-menu-mm-column-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                      getColumnWidthStateClass(column),
                      selected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
                      dragSort.getDragClass(activeTopPath.join('.'), index),
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ gridColumn: `span ${clampGridSpan(column.column_span, 4)}` }}
                    {...dragSort.getDragProps(
                      activeTopPath.join('.'),
                      index,
                      (fromIndex, toIndex) => onMoveChild?.(activeTopPath, fromIndex, toIndex),
                    )}
                  >
                    <BuilderHeader className="cci-nice-menu-mm-column-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                      <BuilderHeading
                        variant="unstyled"
                        type="button"
                        className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                        onClick={() => onSelect(columnPath)}
                        aria-pressed={pathsEqual(columnPath, selectedPath)}
                      >
                        <BuilderGrip aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                        <span className="tw-truncate">{column.label || `Column ${index + 1}`}</span>
                        <ColumnDimensionBadge column={column} />
                      </BuilderHeading>
                      <BuilderActions
                        className="tw-flex tw-items-center tw-gap-1"
                        data-no-drag="true"
                      >
                        <AddIconButton label="Add block" onClick={() => onAddBlock(columnPath)} />
                        <Button
                          variant="builder"
                          size="iconXs"
                          type="button"
                          onClick={() => onEdit(columnPath)}
                          aria-label={__('Edit column', 'cci-nice-menu')}
                          title={__('Edit column', 'cci-nice-menu')}
                        >
                          <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                        </Button>
                        <Button
                          variant="danger"
                          size="iconXs"
                          type="button"
                          onClick={() => onDelete(columnPath)}
                          aria-label={__('Delete column', 'cci-nice-menu')}
                          title={__('Delete column', 'cci-nice-menu')}
                        >
                          <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                        </Button>
                      </BuilderActions>
                    </BuilderHeader>

                    <div className="tw-grid tw-gap-3 tw-bg-cci-nm-surfaceSoft tw-p-3">
                      {blocks.length ? (
                        blocks.map((block, blockIndex) => {
                          const blockPath = [...columnPath, blockIndex];
                          const blockSelected = pathsEqual(blockPath, selectedPath);

                          return (
                            <BuilderPanel
                              key={block.id || blockIndex}
                              className={[
                                'cci-nice-menu-mm-block-card tw-overflow-hidden tw-rounded-md tw-border tw-border-solid',
                                isImplicitLinksBlock(block)
                                  ? 'cci-nice-menu-mm-block-card-implicit'
                                  : '',
                                blockSelected ? 'tw-ring-2 tw-ring-cci-nm-brand/10' : '',
                                dragSort.getDragClass(columnPath.join('.'), blockIndex),
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              {...dragSort.getDragProps(
                                columnPath.join('.'),
                                blockIndex,
                                (fromIndex, toIndex) =>
                                  onMoveChild?.(columnPath, fromIndex, toIndex),
                              )}
                            >
                              <BuilderHeader className="cci-nice-menu-mm-block-header tw-flex tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-px-3 tw-py-2.5">
                                <BuilderHeading
                                  variant="unstyled"
                                  type="button"
                                  className="tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-text-sm tw-font-semibold tw-text-cci-nm-text tw-shadow-none"
                                  onClick={() => onSelect(blockPath)}
                                  aria-pressed={pathsEqual(blockPath, selectedPath)}
                                >
                                  <Boxes aria-hidden="true" className="tw-h-4 tw-w-4 tw-shrink-0" />
                                  <span className="tw-truncate">
                                    {getBlockHeaderLabel(
                                      block,
                                      blockIndex,
                                      blocks.length,
                                      column.label,
                                    )}
                                  </span>
                                </BuilderHeading>
                                <BuilderActions
                                  className="tw-flex tw-items-center tw-gap-1"
                                  data-no-drag="true"
                                >
                                  <AddIconButton
                                    label="Add content"
                                    onClick={() => onAddContent(blockPath)}
                                  />
                                  <Button
                                    variant="builder"
                                    size="iconXs"
                                    type="button"
                                    onClick={() => onEdit(blockPath)}
                                    aria-label={__('Edit block', 'cci-nice-menu')}
                                    title={__('Edit block', 'cci-nice-menu')}
                                  >
                                    <Pencil aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="iconXs"
                                    type="button"
                                    onClick={() => onDelete(blockPath)}
                                    aria-label={__('Delete block', 'cci-nice-menu')}
                                    title={__('Delete block', 'cci-nice-menu')}
                                  >
                                    <Trash2 aria-hidden="true" className="tw-h-3.5 tw-w-3.5" />
                                  </Button>
                                </BuilderActions>
                              </BuilderHeader>
                              <div className="tw-grid tw-gap-2 tw-bg-white tw-p-3">
                                {(block.children || []).length ? (
                                  block.children.map((item, itemIndex) => (
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
                                      onMove={(fromIndex, toIndex) =>
                                        onMoveChild?.(blockPath, fromIndex, toIndex)
                                      }
                                    />
                                  ))
                                ) : (
                                  <Button
                                    variant="unstyled"
                                    type="button"
                                    className="tw-flex tw-min-h-20 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                                    onClick={() => onAddContent(blockPath)}
                                  >
                                    <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                                    {__('Add content', 'cci-nice-menu')}
                                  </Button>
                                )}
                              </div>
                            </BuilderPanel>
                          );
                        })
                      ) : (
                        <Button
                          variant="unstyled"
                          type="button"
                          className="tw-flex tw-min-h-24 tw-cursor-pointer tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-border tw-border-dashed tw-border-cci-nm-border tw-bg-slate-50 tw-p-3 tw-text-sm tw-font-semibold tw-text-cci-nm-brand hover:tw-bg-cci-nm-brandSoft"
                          onClick={() => onAddBlock(columnPath)}
                        >
                          <Plus aria-hidden="true" className="tw-h-4 tw-w-4" />
                          {__('Add block', 'cci-nice-menu')}
                        </Button>
                      )}
                    </div>
                  </BuilderPanel>
                );
              })}
            </StorefrontEditorFrame>

            {looseEntries.length ? (
              <div className="tw-rounded-md tw-border tw-border-dashed tw-border-amber-200 tw-bg-amber-50 tw-p-3">
                <div className="tw-mb-2 tw-flex tw-items-center tw-justify-between tw-gap-3">
                  <strong className="tw-text-sm tw-font-semibold tw-text-amber-900">
                    {__('Items outside columns', 'cci-nice-menu')}
                  </strong>
                  <span className="tw-text-xs tw-text-amber-700">
                    {__(
                      'These came from the older structure. Rebuild them into columns when needed.',
                      'cci-nice-menu',
                    )}
                  </span>
                </div>
                <div className="tw-grid tw-gap-2">
                  {looseEntries.map(({ node, index }) => (
                    <NodeMiniCard
                      key={node.id || index}
                      node={node}
                      path={[...activeTopPath, index]}
                      selectedPath={selectedPath}
                      onSelect={onSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onAddChild={onAddChild}
                      sortScope={activeTopPath.join('.')}
                      sortIndex={index}
                      onMove={(fromIndex, toIndex) =>
                        onMoveChild?.(activeTopPath, fromIndex, toIndex)
                      }
                      onMoveChild={onMoveChild}
                    />
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
    <div
      className="tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4"
      role="presentation"
    >
      <div
        className="tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cci-nice-menu-delete-dialog-title"
      >
        <div className="tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-4">
          <h2
            id="cci-nice-menu-delete-dialog-title"
            className="tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text"
          >
            {__('Delete menu item?', 'cci-nice-menu')}
          </h2>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {__('This removes', 'cci-nice-menu')}{' '}
            {itemLabel ? (
              <strong className="tw-text-cci-nm-text">{itemLabel}</strong>
            ) : (
              __('this item', 'cci-nice-menu')
            )}{' '}
            {__('and all child elements from the current menu draft.', 'cci-nice-menu')}
          </p>
        </div>
        <div className="tw-flex tw-justify-end tw-gap-2 tw-p-5">
          <Button variant="secondary" type="button" onClick={onCancel}>
            {__('Cancel', 'cci-nice-menu')}
          </Button>
          <Button variant="danger" type="button" onClick={onConfirm}>
            <Trash2 aria-hidden="true" />
            {__('Delete item', 'cci-nice-menu')}
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
    <div
      className="tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4"
      role="presentation"
    >
      <div
        className="tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cci-nice-menu-delete-menu-dialog-title"
      >
        <div className="tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-4">
          <h2
            id="cci-nice-menu-delete-menu-dialog-title"
            className="tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text"
          >
            {__('Delete menu?', 'cci-nice-menu')}
          </h2>
          <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
            {__('This permanently removes', 'cci-nice-menu')}{' '}
            <strong className="tw-text-cci-nm-text">
              {menu?.name || __('this menu', 'cci-nice-menu')}
            </strong>{' '}
            {__('from CCI Nice Menu.', 'cci-nice-menu')}
          </p>
        </div>
        <div className="tw-flex tw-justify-end tw-gap-2 tw-p-5">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={deleting}>
            {__('Cancel', 'cci-nice-menu')}
          </Button>
          <Button variant="danger" type="button" onClick={onConfirm} disabled={deleting}>
            <Trash2 aria-hidden="true" />
            {deleting ? __('Deleting...', 'cci-nice-menu') : __('Delete menu', 'cci-nice-menu')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MultistoreMenuCopy({ context, menuId, saving, onCopy }) {
  const targetShops = React.useMemo(
    () =>
      (Array.isArray(context?.shops) ? context.shops : []).filter(
        (shop) => !shop.current && shop.active !== false,
      ),
    [context],
  );
  const [selectedShopIds, setSelectedShopIds] = React.useState([]);

  React.useEffect(() => {
    setSelectedShopIds([]);
  }, [menuId, context?.currentShopId]);

  if (
    !context?.enabled ||
    !context?.featureActive ||
    targetShops.length === 0 ||
    typeof onCopy !== 'function'
  ) {
    return null;
  }

  const toggleShop = (shopId, checked) => {
    setSelectedShopIds((current) =>
      checked ? Array.from(new Set([...current, shopId])) : current.filter((id) => id !== shopId),
    );
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
    <section className="tw-grid tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-4 lg:tw-grid-cols-[minmax(180px,0.65fr)_minmax(0,1fr)_auto] lg:tw-items-center">
      <div>
        <strong className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-semibold tw-text-cci-nm-text">
          <Copy aria-hidden="true" className="tw-h-4 tw-w-4 tw-text-cci-nm-brand" />
          {__('Multistore', 'cci-nice-menu')}
        </strong>
        <p className="tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
          {menuId
            ? __(
                'Create independent copies in additional shops. Existing menus are not overwritten.',
                'cci-nice-menu',
              )
            : __('Save this menu before copying it to another shop.', 'cci-nice-menu')}
        </p>
      </div>
      <div className="tw-flex tw-flex-wrap tw-gap-2">
        {targetShops.map((shop) => {
          const shopId = Number(shop.id || 0);
          const checked = selectedShopIds.includes(shopId);

          return (
            <label
              key={shopId}
              className="tw-flex tw-cursor-pointer tw-items-center tw-gap-2 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-slate-50 tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-cci-nm-text"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => toggleShop(shopId, value === true)}
              />
              <span>{shop.name || `#${shopId}`}</span>
            </label>
          );
        })}
      </div>
      <Button
        variant="outlineAccent"
        type="button"
        disabled={saving || !menuId || selectedShopIds.length === 0}
        onClick={copy}
      >
        <Copy aria-hidden="true" />
        {saving ? __('Copying...', 'cci-nice-menu') : __('Copy to shops', 'cci-nice-menu')}
      </Button>
    </section>
  );
}

export default function MenuBuilderPanel({
  isPro,
  onLicenseNotice,
  setNotice: pushNotice,
  onOpenSettings,
  onEditorStateChange,
}) {
  const initial = React.useMemo(readInitialPayload, []);
  const [menus, setMenus] = React.useState(initial.menus);
  const [working, setWorking] = React.useState(initial.activeMenu);
  const [tab, setTab] = React.useState('general');
  const [view, setView] = React.useState('list');
  const [activeTopIndex, setActiveTopIndex] = React.useState(0);
  const [selectedPath, setSelectedPath] = React.useState([0]);
  const [saving, setSaving] = React.useState(false);
  const [inlineNotice, setInlineNotice] = React.useState(null);
  const notify = React.useCallback(
    (nextNotice) => {
      if (pushNotice) {
        pushNotice(nextNotice);
        return;
      }

      setInlineNotice(nextNotice);
    },
    [pushNotice],
  );
  const [jsonImport, setJsonImport] = React.useState('');
  const [pendingDeletePath, setPendingDeletePath] = React.useState(null);
  const [pendingDeleteMenu, setPendingDeleteMenu] = React.useState(null);
  const [deletingMenu, setDeletingMenu] = React.useState(false);
  const [addContentTarget, setAddContentTarget] = React.useState(null);
  const [addContentPreset, setAddContentPreset] = React.useState('custom');
  const [editPath, setEditPath] = React.useState(null);
  const rawExport = React.useMemo(() => JSON.stringify(working, null, 2), [working]);
  const topMenuEntries = React.useMemo(() => collectTopMenuEntries(working.tree), [working.tree]);
  const safeTopIndex = Math.min(
    Math.max(activeTopIndex, 0),
    Math.max(topMenuEntries.length - 1, 0),
  );
  const activeTopEntry = topMenuEntries[safeTopIndex] || topMenuEntries[0] || null;
  const activeTop = activeTopEntry?.node || null;
  const activeTopPath = activeTopEntry?.path || [];
  const menuList = React.useMemo(() => {
    const keyed = new Map();

    [...menus, working].forEach((menu) => {
      const normalized = normalizeMenu(menu);
      keyed.set(
        normalized.id_menu ? `id:${normalized.id_menu}` : `draft:${normalized.code}`,
        normalized,
      );
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
  const changeSettings = (patch) =>
    setWorking((current) => ({ ...current, settings: { ...current.settings, ...patch } }));

  const createTopNavigationRow = (rowIndex = 0) =>
    createNode({
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

      const flatTopItems = current.tree.filter(
        (node) => node && !isTopNavigationStructureNode(node),
      );
      const row = createTopNavigationRow(0);
      const nextRow = flatTopItems.length
        ? {
            ...row,
            children: [
              {
                ...row.children[0],
                label: 'Primary navigation',
                column_span: 12,
                children: flatTopItems,
              },
            ],
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
        ? updateNodeAtPath(current.tree, targetPath, (node) => ({
            ...node,
            children: reorderItems(node.children || [], from, to),
          }))
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
      const nextTree = appendChildAtPath(
        current.tree,
        columnPath,
        createNode({
          type: 'block',
          label: 'Block',
          link: '',
          hide_heading: true,
          children: [],
        }),
      );
      setSelectedPath([...columnPath, childIndex]);
      return { ...current, tree: nextTree };
    });
  };

  const openAddContentAtTarget = React.useCallback(
    (targetPath, preset = 'custom') => {
      if (!Array.isArray(targetPath)) {
        return;
      }

      if (!canOpenAddContentAtPath(working.tree, targetPath)) {
        return;
      }

      setAddContentTarget(targetPath);
      setAddContentPreset(preset);
    },
    [working.tree],
  );

  const addBelowTabsBlock = React.useCallback(
    (targetPath) => {
      openAddContentAtTarget(targetPath, 'block');
    },
    [openAddContentAtTarget],
  );

  const getPreferredContentTarget = React.useCallback(() => {
    if (!activeTop) {
      return null;
    }

    const fallback = activeTopPath;
    const selectedNode = selectedPath.length ? getNodeAtPath(working.tree, selectedPath) : null;

    if (!selectedNode) {
      return fallback;
    }

    if (
      pathsEqual(selectedPath, activeTopPath) ||
      selectedNode.type === 'block' ||
      isTabsControllerPath(working.tree, selectedPath) ||
      isTopNavigationColumnPath(working.tree, selectedPath)
    ) {
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
      notify(
        createNotice(
          'warning',
          'Pick a source category first, then convert the catalog to manual mode.',
        ),
      );
      return;
    }

    notify(createNotice('info', 'Building manual catalog from PrestaShop categories...'));
    apiFetch('/catalog/categories', {
      method: 'POST',
      body: JSON.stringify({ query: '' }),
    })
      .then((response) => {
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
        notify(
          createNotice(
            'success',
            `Manual catalog created from ${mainNodes.length} main categories. You can now edit tabs, columns, blocks and nested items.`,
          ),
        );
      })
      .catch((error) => {
        notify(
          createNotice('error', error.message || 'Could not build manual catalog from categories.'),
        );
      });
  };

  const addContentToTarget = (node) => {
    if (!addContentTarget) {
      return;
    }

    setWorking((current) => {
      const parent = addContentTarget.length
        ? getNodeAtPath(current.tree, addContentTarget)
        : current.tree;
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

  const pendingDeleteNode = pendingDeletePath
    ? getNodeAtPath(working.tree, pendingDeletePath)
    : null;
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
    })
      .then((response) => {
        const nextMenu = normalizeMenu(response.menu || working);
        setWorking(nextMenu);
        setMenus((current) => {
          const exists = current.some((menu) => Number(menu.id_menu) === Number(nextMenu.id_menu));
          return exists
            ? current.map((menu) =>
                Number(menu.id_menu) === Number(nextMenu.id_menu) ? nextMenu : menu,
              )
            : [...current, nextMenu];
        });
        notify(createNotice('success', 'Menu saved.'));
      })
      .catch((error) => {
        notify(createNotice('error', error.message || 'Save failed.'));
      })
      .finally(() => setSaving(false));
  };

  const copyMenuToShops = (shopIds) => {
    setSaving(true);

    return apiFetch('/multistore/menus/copy', {
      method: 'POST',
      body: JSON.stringify({ id_menu: working.id_menu, shopIds }),
    })
      .then((response) => {
        const failed = Array.isArray(response.results)
          ? response.results.filter((result) => !result.success).length
          : 0;
        const copied = Array.isArray(response.results)
          ? response.results.filter((result) => result.success).length
          : shopIds.length;

        notify(
          createNotice(
            failed ? 'warning' : 'success',
            failed
              ? `Menu copied to ${copied} shop(s); ${failed} target(s) failed.`
              : `Menu copied to ${copied} shop(s).`,
          ),
        );

        return response;
      })
      .catch((error) => {
        const partialResults = Array.isArray(error.data?.results) ? error.data.results : [];
        if (partialResults.length > 0) {
          const copied = partialResults.filter((result) => result.success).length;
          const failed = partialResults.length - copied;
          notify(
            createNotice(
              'warning',
              `Menu copied to ${copied} shop(s); ${failed} target(s) failed.`,
            ),
          );
          return error.data;
        }

        notify(createNotice('error', error.message || 'Copy failed.'));
        throw error;
      })
      .finally(() => setSaving(false));
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
    })
      .then(() => {
        setMenus((current) => current.filter((menu) => Number(menu.id_menu) !== menuId));
        if (Number(working.id_menu) === menuId) {
          const nextMenu =
            menuList.find((menu) => Number(menu.id_menu) !== menuId) ||
            normalizeMenu({
              id_menu: 0,
              name: 'Main menu',
              hook_name: pluginData.hooks[0] || 'displayTop',
            });
          setWorking(nextMenu);
        }
        notify(createNotice('success', 'Menu deleted.'));
        setPendingDeleteMenu(null);
        setView('list');
      })
      .catch((error) => {
        notify(createNotice('error', error.message || 'Delete failed.'));
      })
      .finally(() => setDeletingMenu(false));
  };

  const createMenu = () => {
    setWorking(
      normalizeMenu({
        id_menu: 0,
        name: 'Main menu',
        hook_name: pluginData.hooks[0] || 'displayTop',
        tree: createDefaultTree(),
      }),
    );
    setActiveTopIndex(0);
    setSelectedPath([0]);
    setTab('general');
    setView('editor');
  };

  const loadRetailShowcase = () => {
    setWorking((current) =>
      normalizeMenu({
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
      }),
    );
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
  const addContentTargetNode = addContentTarget
    ? getNodeAtPath(working.tree, addContentTarget)
    : null;
  const addTargetAllowsStructure = Boolean(
    addContentTarget &&
    (!addContentTarget.length ||
      addContentTarget.length === 1 ||
      isTabsControllerPath(working.tree, addContentTarget) ||
      ['row', 'column'].includes(addContentTargetNode?.type)),
  );
  const preferredAddTarget = getPreferredContentTarget();
  const preferredAddTargetNode = preferredAddTarget
    ? getNodeAtPath(working.tree, preferredAddTarget)
    : null;
  const preferredAddTargetLabel = preferredAddTargetNode?.label || activeTop?.label || '';
  const editingNode = editPath ? getNodeAtPath(working.tree, editPath) : null;
  const themeOptions = React.useMemo(getThemeOptions, []);
  const listStats = {
    total: menuList.length,
    active: menuList.filter((menu) => Number(menu.is_active) === 1).length,
    hooks: new Set(menuList.map((menu) => menu.hook_name).filter(Boolean)).size,
    topItems: menuList.reduce(
      (sum, menu) => sum + (Array.isArray(menu.tree) ? menu.tree.length : 0),
      0,
    ),
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
        deleteModal={
          <ConfirmDeleteMenuModal
            open={Boolean(pendingDeleteMenu)}
            menu={pendingDeleteMenu}
            deleting={deletingMenu}
            onCancel={() => setPendingDeleteMenu(null)}
            onConfirm={confirmDeleteMenu}
          />
        }
      />
    );
  }
  return (
    <Card
      className={[
        'cci-nice-menu-menu-editor-card tw-overflow-hidden',
        tab === 'general' ? 'cci-nice-menu-state-general-tab' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <CardHeader className="tw-flex tw-min-h-16 tw-flex-row tw-items-center tw-justify-between tw-gap-4 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-4">
        <Button variant="ghost" type="button" onClick={() => setView('list')}>
          <ArrowLeft aria-hidden="true" />
          {__('Back to all menus', 'cci-nice-menu')}
        </Button>
        <div className="tw-flex tw-flex-wrap tw-justify-end tw-gap-2">
          <Button variant="outlineAccent" type="button" onClick={loadRetailShowcase}>
            <Layers aria-hidden="true" />
            {__('Load showcase', 'cci-nice-menu')}
          </Button>
          <Button
            variant="save"
            type="button"
            onClick={saveMenu}
            disabled={saving}
            aria-busy={saving}
          >
            <Save aria-hidden="true" />
            {saving ? __('Saving...', 'cci-nice-menu') : __('Save', 'cci-nice-menu')}
          </Button>
        </div>
      </CardHeader>

      <div className="tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-bg-white tw-px-5 tw-py-3">
        <Input
          className="tw-h-12 tw-text-base tw-font-semibold"
          value={working.name}
          onChange={(event) => changeMenu({ name: event.target.value })}
          placeholder={__('Menu name', 'cci-nice-menu')}
        />
      </div>

      <MultistoreMenuCopy
        context={pluginData.multistore}
        menuId={Number(working.id_menu || 0)}
        saving={saving}
        onCopy={copyMenuToShops}
      />

      <Tabs value={tab} onValueChange={setTab} className="tw-grid tw-gap-0">
        <TabsList>
          {editorTabs.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={item.value} value={item.value}>
                <Icon aria-hidden="true" />
                {item.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <CardContent
          className={
            tab === 'general'
              ? 'cci-nice-menu-editor-general-content tw-bg-transparent tw-p-0'
              : 'tw-bg-slate-50 tw-p-4'
          }
        >
          <TabsPanel
            value="general"
            className="cci-nice-menu-general-tab-panel tw-m-0 tw-border-0 tw-bg-transparent"
          >
            <div className="tw-grid tw-gap-4 tw-p-4">
              <section className="tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-p-4">
                <div className="tw-grid tw-gap-3 lg:tw-grid-cols-[minmax(180px,0.65fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.85fr)] lg:tw-items-end">
                  <div className="tw-self-center">
                    <strong className="tw-block tw-text-base tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
                      {__('Menu settings', 'cci-nice-menu')}
                    </strong>
                    <p className="tw-m-0 tw-mt-1 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
                      {__('Placement and storefront behaviour.', 'cci-nice-menu')}
                    </p>
                  </div>
                  <Field label="Hook">
                    <Select
                      value={working.hook_name}
                      onValueChange={(value) => changeMenu({ hook_name: value })}
                      options={(pluginData.hooks || ['displayTop']).map((hook) => ({
                        value: hook,
                        label: hook,
                      }))}
                    />
                  </Field>
                  <Field label="Open submenu">
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
                    label="Enabled on storefront"
                    onChange={(checked) => changeMenu({ is_active: checked ? 1 : 0 })}
                  />
                </div>
              </section>

              <BuilderCanvas className="cci-nice-menu-builder-canvas cci-nice-menu-builder-canvas-full">
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
              </BuilderCanvas>
            </div>
          </TabsPanel>

          <TabsPanel value="design" className="tw-m-0 tw-border-0 tw-bg-transparent">
            <div className="tw-grid tw-grid-cols-1 tw-gap-4 2xl:tw-grid-cols-[420px_minmax(0,1fr)]">
              <EditorPanel
                title={__('Menu appearance', 'cci-nice-menu')}
                description="Use compact settings copied from the WP builder style."
              >
                <FieldGroup>
                  <Field label="Layout preset">
                    <Select
                      value={working.settings.layout || 'classic'}
                      onValueChange={(value) => changeSettings({ layout: value })}
                      options={[
                        { value: 'classic', label: 'Classic' },
                        { value: 'mega', label: __('Mega grid', 'cci-nice-menu') },
                        { value: 'dropdown', label: 'Dropdown' },
                      ]}
                    />
                  </Field>
                  <Field label="Visual theme">
                    <Select
                      value={working.settings.theme || 'night-glass'}
                      onValueChange={(value) =>
                        changeSettings({ theme: value, ...getThemeColorPatch(value) })
                      }
                      options={themeOptions}
                    />
                  </Field>
                  <ToggleField
                    checked={Boolean(working.settings.show_shadow ?? working.settings.drop_shadow)}
                    label="Drop shadow"
                    onChange={(checked) =>
                      changeSettings({ show_shadow: checked, drop_shadow: checked })
                    }
                  />
                  <ToggleField
                    checked={Boolean(working.settings.show_counts)}
                    label="Show category counts on storefront"
                    onChange={(checked) => changeSettings({ show_counts: checked })}
                  />
                  <ToggleField
                    checked={Boolean(working.settings.hide_empty_categories)}
                    label="Hide empty categories on storefront"
                    onChange={(checked) => changeSettings({ hide_empty_categories: checked })}
                  />
                </FieldGroup>
                <div className="tw-mt-4 tw-grid tw-gap-3">
                  <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
                    <strong className="tw-text-sm tw-font-semibold tw-text-cci-nm-text">
                      {__('Palette', 'cci-nice-menu')}
                    </strong>
                    <Button
                      variant="secondary"
                      size="xs"
                      type="button"
                      onClick={() =>
                        changeSettings(getThemeColorPatch(working.settings.theme || 'night-glass'))
                      }
                    >
                      {__('Reset from theme', 'cci-nice-menu')}
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

              <section className="tw-min-w-0">
                <div className="tw-grid tw-min-h-full tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white">
                  <div className="tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-4">
                    <strong className="tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand">
                      <Palette aria-hidden="true" />
                      {__('Layout details', 'cci-nice-menu')}
                    </strong>
                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                      {__(
                        'Match the menu container, spacing and mobile breakpoint.',
                        'cci-nice-menu',
                      )}
                    </p>
                  </div>
                  <div className="tw-grid tw-gap-4 tw-p-4">
                    <div className="tw-grid tw-gap-3 md:tw-grid-cols-3">
                      <Field label="Container mode">
                        <Select
                          value={working.settings.container_mode || 'boxed'}
                          onValueChange={(value) => changeSettings({ container_mode: value })}
                          options={[
                            { value: 'boxed', label: 'Boxed' },
                            { value: 'wide', label: 'Wide' },
                            { value: 'full', label: __('Full page', 'cci-nice-menu') },
                          ]}
                        />
                      </Field>
                      <Field label="Container width">
                        <NumberInputWithUnit
                          value={working.settings.container_width || 1320}
                          unit="px"
                          onChange={(value) => changeSettings({ container_width: value })}
                        />
                      </Field>
                      <Field label="Item gap">
                        <NumberInputWithUnit
                          value={working.settings.item_gap || 8}
                          unit="px"
                          onChange={(value) => changeSettings({ item_gap: value })}
                        />
                      </Field>
                    </div>
                    <div className="tw-grid tw-gap-3 md:tw-grid-cols-4">
                      <Field label="Mobile breakpoint">
                        <NumberInputWithUnit
                          value={working.settings.mobile_breakpoint || 900}
                          unit="px"
                          onChange={(value) => changeSettings({ mobile_breakpoint: value })}
                        />
                      </Field>
                      <Field label="Top-level icons">
                        <Select
                          value={working.settings.top_level_icon_mode || 'first'}
                          onValueChange={(value) => changeSettings({ top_level_icon_mode: value })}
                          options={[
                            { value: 'first', label: __('First item only', 'cci-nice-menu') },
                            { value: 'all', label: __('All items', 'cci-nice-menu') },
                            { value: 'none', label: __('No icons', 'cci-nice-menu') },
                          ]}
                        />
                      </Field>
                      <Field label={__('Category tab media', 'cci-nice-menu')}>
                        <Select
                          value={working.settings.category_tab_media_mode || 'auto'}
                          onValueChange={(value) =>
                            changeSettings({ category_tab_media_mode: value })
                          }
                          options={categoryTabMediaOptions}
                        />
                      </Field>
                    </div>
                    <div className="tw-grid tw-gap-3 md:tw-grid-cols-2">
                      <Field label="Animation">
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
                      <Field label="Open submenu">
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

          <TabsPanel value="tools" className="tw-m-0 tw-border-0 tw-bg-transparent">
            <div className="tw-grid tw-grid-cols-1 tw-gap-4 2xl:tw-grid-cols-[420px_minmax(0,1fr)]">
              <EditorPanel
                title={__('JSON import', 'cci-nice-menu')}
                description="Paste exported menu JSON and replace the current working configuration."
              >
                <FieldGroup>
                  <Field label="Import payload">
                    <Textarea
                      className="tw-min-h-40"
                      value={jsonImport}
                      onChange={(event) => setJsonImport(event.target.value)}
                      placeholder={__('Paste exported JSON here', 'cci-nice-menu')}
                    />
                  </Field>
                  <div>
                    <Button variant="save" size="sm" type="button" onClick={importJson}>
                      <Save aria-hidden="true" />
                      {__('Import and save', 'cci-nice-menu')}
                    </Button>
                  </div>
                </FieldGroup>
              </EditorPanel>

              <section className="tw-min-w-0">
                <div className="tw-grid tw-min-h-full tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white">
                  <div className="tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-4">
                    <strong className="tw-inline-flex tw-items-center tw-gap-2 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text [&_svg]:tw-h-5 [&_svg]:tw-w-5 [&_svg]:tw-text-cci-nm-brand">
                      <Check aria-hidden="true" />
                      {__('JSON export snapshot', 'cci-nice-menu')}
                    </strong>
                    <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
                      {__('Copy or download the current menu configuration.', 'cci-nice-menu')}
                    </p>
                  </div>
                  <div className="tw-grid tw-gap-4 tw-p-4">
                    <Textarea
                      className="tw-min-h-64 tw-font-mono tw-text-xs"
                      readOnly
                      value={rawExport}
                    />
                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        type="button"
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
                        {__('Download JSON', 'cci-nice-menu')}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(rawExport)}
                      >
                        {__('Copy JSON', 'cci-nice-menu')}
                      </Button>
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
          aria-live="polite"
        >
          {inlineNotice.message}
        </div>
      ) : null}
      <ConfirmDeleteModal
        open={Boolean(pendingDeletePath)}
        itemLabel={pendingDeleteNode?.label || ''}
        onCancel={() => setPendingDeletePath(null)}
        onConfirm={confirmDeleteNode}
      />
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
        mode="edit"
        initialNode={editingNode}
        isTopLevel={Boolean(editPath && editPath.length === 1)}
        onCancel={() => setEditPath(null)}
        onSave={saveEditedElement}
        onOpenSettings={onOpenSettings}
      />
    </Card>
  );
}
