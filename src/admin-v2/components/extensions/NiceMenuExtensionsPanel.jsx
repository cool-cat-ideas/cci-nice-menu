import React, { useEffect, useMemo, useState } from 'react';
import { CountBadge as Counter, reconcileCatalogItems } from '@cci/admin-ui';
import { BadgeCheck, ShoppingBag } from 'lucide-react';
import { pluginData } from '../../api/api';
import { __ } from '../../i18n/i18n';
import {
  collectionFromResponse,
  isPaidProduct,
  mediaUrl,
  normalizeTags,
  productUrl,
  readableValue,
  useMarketplaceJson,
} from '../../catalog/marketplace';
import { CatalogEmptyState, CatalogGrid, CatalogProductCard } from '../catalog/CatalogCards';
import LoadingState from '../feedback/LoadingState';
import LicensePanel from '../licensing/LicensePanel';
import MarketplaceStatus from '../catalog/MarketplaceStatus';
import MetricCard from '../feedback/MetricCard';
import ProUpgradeModal from '../licensing/ProUpgradeModal';
import ReviewPrompt from '../feedback/ReviewPrompt';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const installedTab = 'installed';
const storeTab = 'store';

export default function NiceMenuExtensionsPanel({
  license,
  onLicenseChange,
  onOpenSettings,
  setNotice,
}) {
  const [activeTab, setActiveTab] = useState(installedTab);
  const [storeExtensions, setStoreExtensions] = useState([]);
  const [proFeature, setProFeature] = useState(null);
  const installedExtensions = useMemo(() => normalizeInstalledExtensions(pluginData), []);
  const extensionStoreEndpoint = pluginData.extensionStoreEndpoint || '';
  const storeFeed = useMarketplaceJson(extensionStoreEndpoint, {
    enabled: Boolean(extensionStoreEndpoint),
  });

  useEffect(() => {
    if (!storeFeed.data) {
      setStoreExtensions([]);
      return;
    }

    const extensions = collectionFromResponse(storeFeed.data, [
      'extensions',
      'addons',
      'modules',
      'productCatalogItems',
      'catalogItems',
      'items',
    ]);

    setStoreExtensions(extensions.map(normalizeStoreExtension).filter(Boolean));
  }, [storeFeed.data]);

  const reconciledStoreExtensions = useMemo(
    () => reconcileCatalogItems(storeExtensions, installedExtensions),
    [installedExtensions, storeExtensions],
  );
  const installedCount = installedExtensions.length;
  const storeCount = reconciledStoreExtensions.length;
  const activeExtensions =
    activeTab === installedTab ? installedExtensions : reconciledStoreExtensions;
  const storeLoading = activeTab === storeTab && storeFeed.loading;
  const storeStatus = (
    <MarketplaceStatus
      error={storeFeed.error}
      retrying={storeFeed.retrying}
      label={__('Extension store is temporarily unavailable.', 'cci-nice-menu')}
      description={__(
        'The module will retry automatically. No bundled module features will be shown as installed extensions.',
        'cci-nice-menu',
      )}
      showDetails={false}
    />
  );

  return (
    <div className="tw-grid tw-grid-cols-1 tw-items-start tw-gap-4 xl:tw-grid-cols-[minmax(0,1fr)_320px]">
      <div className="tw-grid tw-content-start tw-gap-4 tw-self-start">
        <div className="tw-grid tw-grid-cols-1 tw-gap-3 lg:tw-grid-cols-2">
          <MetricCard
            icon={BadgeCheck}
            label={__('Installed', 'cci-nice-menu')}
            value={installedCount}
            description={__('Registered through installed add-ons', 'cci-nice-menu')}
            tone="primary"
          />
          <MetricCard
            icon={ShoppingBag}
            label={__('Store', 'cci-nice-menu')}
            value={storeFeed.loading ? '-' : storeCount}
            description={
              extensionStoreEndpoint
                ? __('Loaded from your store', 'cci-nice-menu')
                : __('Connect a store endpoint', 'cci-nice-menu')
            }
          />
        </div>

        <ReviewPrompt section="extensions" setNotice={setNotice} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList aria-label={__('Extension sections', 'cci-nice-menu')}>
            <TabsTrigger value={installedTab}>
              <BadgeCheck aria-hidden="true" />
              {__('Installed extensions', 'cci-nice-menu')}
              <Counter>{installedCount}</Counter>
            </TabsTrigger>
            <TabsTrigger value={storeTab}>
              <ShoppingBag aria-hidden="true" />
              {__('Available in store', 'cci-nice-menu')}
              <Counter>{storeCount}</Counter>
            </TabsTrigger>
          </TabsList>

          <Card as="div" transparent>
            {storeLoading ? (
              <LoadingState
                label={__('Loading store extensions...', 'cci-nice-menu')}
                variant="block"
                rows={4}
              />
            ) : (
              <ExtensionGrid
                extensions={activeExtensions}
                mode={activeTab}
                notice={activeTab === storeTab ? storeStatus : null}
                hasStoreEndpoint={Boolean(extensionStoreEndpoint)}
                onGoToStore={() => setActiveTab(storeTab)}
                onLockedExtension={setProFeature}
              />
            )}
          </Card>
        </Tabs>
      </div>

      <aside className="tw-grid tw-content-start tw-gap-4 tw-self-start">
        <LicensePanel license={license} />
      </aside>
      <ProUpgradeModal
        open={Boolean(proFeature)}
        featureName={proFeature?.featureName || ''}
        description={proFeature?.description || ''}
        productUrl={proFeature?.productUrl || ''}
        benefits={[
          __('Unlock installed and store add-ons for this domain.', 'cci-nice-menu'),
          __('Keep the core module lighter and extend it only when needed.', 'cci-nice-menu'),
        ]}
        onActivateLicense={() => {
          setProFeature(null);
          onOpenSettings?.();
        }}
        onClose={() => setProFeature(null)}
      />
    </div>
  );
}

function ExtensionGrid({
  extensions,
  mode,
  notice,
  hasStoreEndpoint,
  onGoToStore,
  onLockedExtension,
}) {
  return (
    <CatalogGrid notice={notice}>
      {!extensions.length ? (
        <CatalogEmptyState
          embedded
          icon={ShoppingBag}
          title={
            mode === storeTab && !hasStoreEndpoint
              ? __('Extension store is not connected yet.', 'cci-nice-menu')
              : mode === installedTab
                ? __('No menu extensions are installed for this site yet.', 'cci-nice-menu')
                : __('No extensions found.', 'cci-nice-menu')
          }
          description={
            mode === storeTab && !hasStoreEndpoint
              ? __(
                  'Connect the store endpoint to browse menu add-ons. Built-in module features are available in the builder, not listed here.',
                  'cci-nice-menu',
                )
              : mode === installedTab
                ? __(
                    'External menu extensions registered by installed add-ons will appear here.',
                    'cci-nice-menu',
                  )
                : __('Extensions from your store will appear here.', 'cci-nice-menu')
          }
          actionLabel={
            mode === installedTab && onGoToStore && hasStoreEndpoint
              ? __('Go to available extensions', 'cci-nice-menu')
              : ''
          }
          onAction={mode === installedTab && hasStoreEndpoint ? onGoToStore : null}
        />
      ) : (
        extensions.map((extension) => (
          <ExtensionCard
            key={extension.id}
            extension={extension}
            mode={mode}
            onLockedExtension={onLockedExtension}
          />
        ))
      )}
    </CatalogGrid>
  );
}

function ExtensionCard({ extension, mode, onLockedExtension }) {
  return (
    <CatalogProductCard
      item={{
        title: extension.title,
        version: extension.version,
        author: extension.author,
        description: extension.description || __('Menu extension.', 'cci-nice-menu'),
        screenshot: extension.screenshot,
        tags: extension.tags,
        pro: extension.pro,
        locked: extension.locked,
        lockedMessage:
          extension.availabilityMessage ||
          __(
            'This extension requires an active CCI Nice Menu Pro license for this domain.',
            'cci-nice-menu',
          ),
        metaSecondary: extension.price,
        url: extension.url,
        installed: extension.installed || mode !== storeTab,
      }}
      mode={mode}
      fallbackIcon={ShoppingBag}
      lockedActionUrl={pluginData.upgradeUrl}
      lockedActionLabel={__('Requires Pro', 'cci-nice-menu')}
      installedLabel={__('Installed', 'cci-nice-menu')}
      availableLabel={__('Available', 'cci-nice-menu')}
      storeLabel={__('View in store', 'cci-nice-menu')}
      onLockedClick={onLockedExtension}
    />
  );
}

function normalizeInstalledExtensions(data) {
  const extensions = Array.isArray(data.extensions)
    ? data.extensions
    : Array.isArray(data.menuExtensions)
      ? data.menuExtensions
      : Array.isArray(data.installedExtensions)
        ? data.installedExtensions
        : [];

  return uniqueById(extensions.map(normalizeInstalledExtension).filter(Boolean));
}

function normalizeInstalledExtension(extension) {
  if (!extension || typeof extension !== 'object') {
    return null;
  }

  const title = readableValue(
    extension.title || extension.name || extension.moduleName || extension.module,
  );
  if (!title) {
    return null;
  }

  const blocks = Array.isArray(extension.blocks)
    ? extension.blocks
        .map((block) =>
          readableValue(block.label || block.title || block.name || block.blockName || block.block),
        )
        .filter(Boolean)
    : [];

  return {
    id: extension.id || extension.slug || title.toLowerCase().replace(/[\s_]+/g, '-'),
    title,
    description: readableValue(
      extension.description,
      __('External menu features registered by this add-on.', 'cci-nice-menu'),
    ),
    version: readableValue(extension.version),
    author: readableValue(
      extension.author || extension.vendor || extension.moduleName || extension.module,
    ),
    tags: normalizeTags(extension.tags || blocks),
    price: readableValue(extension.price),
    pro: Boolean(extension.pro || extension.premium || extension.requiresPro),
    locked: Boolean(extension.locked),
    availabilityMessage: readableValue(extension.availability?.message),
    screenshot: mediaUrl(
      extension.screenshot || extension.image || extension.thumbnail || extension.media,
    ),
    url: productUrl(extension),
    installed: true,
  };
}

function normalizeStoreExtension(extension) {
  if (!extension || typeof extension !== 'object') {
    return null;
  }

  const title = readableValue(
    extension.title || extension.name || extension.moduleName || extension.module,
  );
  const price = readableValue(
    extension.priceFormatted ||
      extension.priceLabel ||
      extension.price ||
      extension.regularPrice ||
      extension.pricing?.price,
  );
  const pro = Boolean(extension.requiresPro) || isPaidProduct(extension);

  return {
    id: extension.id || extension.slug || extension.name || title,
    title: title || __('Untitled extension', 'cci-nice-menu'),
    description: readableValue(
      extension.description || extension.excerpt || extension.summary || extension.shortDescription,
    ),
    version: readableValue(extension.version),
    author: readableValue(extension.author || extension.vendor),
    tags: normalizeTags(extension.tags || extension.categories),
    price,
    pro,
    locked: false,
    screenshot: mediaUrl(
      extension.screenshot ||
        extension.image ||
        extension.cover ||
        extension.thumbnail ||
        extension.preview ||
        extension.featuredImage ||
        extension.media,
    ),
    url: productUrl(extension),
  };
}

function uniqueById(extensions) {
  const seen = new Set();

  return extensions.filter((extension) => {
    if (!extension?.id || seen.has(extension.id)) {
      return false;
    }

    seen.add(extension.id);
    return true;
  });
}
