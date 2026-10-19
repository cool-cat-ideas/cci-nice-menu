import { createCatalogComponents } from '@cci/admin-ui';
import { __ } from '../../i18n/i18n';

export const { CatalogEmptyState, CatalogGrid, CatalogProductCard } = createCatalogComponents(
  'niceMenu',
  {
    labels: {
      author: __('Author', 'cci-nice-menu'),
      requiresPro: __('Requires Pro', 'cci-nice-menu'),
      installed: __('Installed', 'cci-nice-menu'),
      available: __('Available', 'cci-nice-menu'),
      viewInStore: __('View in store', 'cci-nice-menu'),
      comingSoon: __('Coming soon', 'cci-nice-menu'),
      tags: __('Tags', 'cci-nice-menu'),
    },
  },
);
