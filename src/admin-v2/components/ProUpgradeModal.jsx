import React from 'react';
import { ProUpgradeModal as SharedProUpgradeModal } from '@cci/admin-ui/nice-menu';
import { pluginData } from '../api';
import { __ } from '../i18n';

export default function ProUpgradeModal({
    featureName,
    description,
    benefits = [],
    productUrl = '',
    open,
    onClose,
    onActivateLicense,
}) {
    const label = featureName || __('Pro feature', 'cci-nice-menu');
    const canManageLicense = Boolean(
        pluginData.license?.canManage && pluginData.license?.proModuleAvailable
    );

    return (
        <SharedProUpgradeModal
            open={open}
            productName='CCI Nice Menu'
            featureName={label}
            description={description}
            benefits={benefits}
            productUrl={productUrl || pluginData.upgradeUrl || ''}
            productUrlLabel={__('View product page', 'cci-nice-menu')}
            activateLabel={__('Activate license here', 'cci-nice-menu')}
            cancelLabel={__('Maybe later', 'cci-nice-menu')}
            title={`${__('Available in Pro', 'cci-nice-menu')}: ${label}`}
            message={__('Upgrade CCI Nice Menu to unlock this workflow in the menu builder.', 'cci-nice-menu')}
            licenseHint={
                canManageLicense
                    ? __('Already have a license? Activate it here in the module settings to unlock Pro features on this domain.', 'cci-nice-menu')
                    : __('Install and enable CCI Nice Menu Pro before activating a license on this site.', 'cci-nice-menu')
            }
            onActivateLicense={canManageLicense ? onActivateLicense : undefined}
            onClose={onClose}
        />
    );
}
