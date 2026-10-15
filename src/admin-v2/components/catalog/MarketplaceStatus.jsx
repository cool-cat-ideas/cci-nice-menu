import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { __ } from '../../i18n/i18n';
import { Button } from '../ui/button';

export default function MarketplaceStatus({
    error = '',
    retrying = false,
    onRefresh,
    label,
    description = '',
    retryingDescription = '',
    showDetails = true,
}) {
    if (!error && !retrying) {
        return null;
    }

    const message = retrying
        ? retryingDescription ||
          __('Trying again in the background without interrupting your work.', 'cci-nice-menu')
        : description ||
          __('The plugin will retry automatically. Installed items remain available.', 'cci-nice-menu');

    return (
        <div
            className='tw-grid tw-grid-cols-[auto_minmax(0,1fr)] tw-items-start tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-infoBorder tw-bg-cci-nm-infoBg tw-p-3 tw-text-cci-nm-infoText'
            role='status'
            aria-live='polite'
        >
            <AlertCircle className='tw-mt-0.5 tw-h-4 tw-w-4' aria-hidden='true' />
            <div>
                <strong className='tw-text-sm tw-font-semibold'>
                    {label || __('Store data is temporarily unavailable.', 'cci-nice-menu')}
                </strong>
                <p className='tw-m-0 tw-mt-1 tw-text-xs tw-leading-5'>{message}</p>
                {showDetails && error && <small className='tw-mt-1 tw-block tw-text-xs tw-leading-5'>{error}</small>}
            </div>
            {onRefresh && (
                <Button className='tw-col-span-2' onClick={onRefresh}>
                    <RefreshCw aria-hidden='true' />
                    {__('Retry now', 'cci-nice-menu')}
                </Button>
            )}
        </div>
    );
}
