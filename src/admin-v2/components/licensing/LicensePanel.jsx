import { ProductStatusPanel } from '@cci/admin-ui/product-panels';
import React from 'react';
import { ArrowRight, CheckCircle2, Crown } from 'lucide-react';
import { isCciNiceMenuProLicenseActive, pluginData } from '../../api/api';
import { __ } from '../../i18n/i18n';
import { readableValue, useMarketplaceJson } from '../../catalog/marketplace';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function LicensePanel({ license: controlledLicense }) {
    const productFeed = useMarketplaceJson(pluginData.marketplaceFeedEndpoint, {
        enabled: Boolean(pluginData.marketplaceFeedEndpoint),
    });
    const license = controlledLicense || pluginData.license || {};
    const isPro = isCciNiceMenuProLicenseActive(license);
    const hasProductFeed = Boolean(productFeed.data?.product) && productFeed.data?._meta?.source !== 'empty';
    const product = hasProductFeed ? productFeed.data?.product || {} : {};
    const upgradeUrl = readableValue(product?.pro?.url || pluginData.upgradeUrl);
    const installedVersion = readableValue(pluginData.pluginVersion);
    const latestVersion = readableValue(product?.latestVersion || product?.free?.version);
    const updateUrl = readableValue(
        product?.free?.urls?.download || product?.free?.urls?.wordpress || product?.pro?.url || pluginData.upgradeUrl
    );
    const ctaLabel = __('See CCI Nice Menu Pro', 'cci-nice-menu');
    const ctaIcon = <ArrowRight aria-hidden='true' />;
    return (
        <div className='tw-grid tw-content-start tw-gap-4 tw-self-start'>
            <ProductStatusPanel t={text => __(({ Pro: 'License active', Installed: 'Installed version', Latest: 'Latest version' })[text] || text, 'cci-nice-menu')} isPro={isPro} licenseStatus={license.status} licenseMessage={license.message} installedVersion={installedVersion} latestVersion={latestVersion} versionFeedStale={Boolean(productFeed.error || productFeed.data?._meta?.stale)} updateUrl={updateUrl}
                description={latestVersion && latestVersion === installedVersion ? __('Your installed version is current.', 'cci-nice-menu') : undefined}
                checkedAt={license.checkedAt} nextCheckAt={license.nextCheckAt} adminDate={pluginData.adminDate} expires={license.expires} />

            {!isPro && (
                <Card className='tw-overflow-hidden tw-border-cci-nm-brandBorder tw-bg-white'>
                    <div className='tw-grid tw-gap-4 tw-p-4'>
                        <div className='tw-flex tw-items-start tw-gap-3'>
                            <span className='tw-inline-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-amber-200 tw-bg-amber-50 tw-text-amber-700 [&_svg]:tw-h-5 [&_svg]:tw-w-5' aria-hidden='true'>
                                <Crown />
                            </span>
                            <div className='tw-grid tw-min-w-0 tw-gap-1'>
                                <span className='tw-text-sm tw-font-semibold tw-leading-5 tw-text-amber-700'>
                                    {__('CCI Nice Menu Pro', 'cci-nice-menu')}
                                </span>
                                <span className='tw-m-0 tw-block tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text'>
                                    {__('Build menus around what customers are looking for', 'cci-nice-menu')}
                                </span>
                            </div>
                        </div>
                        <p className='tw-m-0 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                            {__(
                                'Show products, blog posts and media directly in the menu. Reuse the same setup across stores.',
                                'cci-nice-menu'
                            )}
                        </p>
                        <ul className='tw-m-0 tw-grid tw-list-none tw-gap-2.5 tw-border-0 tw-p-0'>
                            {[
                                __('Place products and categories inside menus', 'cci-nice-menu'),
                                __('Show blog posts and media blocks', 'cci-nice-menu'),
                                __('Create more menu layouts', 'cci-nice-menu'),
                                __('Reuse menus across stores', 'cci-nice-menu'),
                            ].map((feature) => (
                                <li key={feature} className='tw-grid tw-grid-cols-[auto_minmax(0,1fr)] tw-items-start tw-gap-2 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                                    <CheckCircle2 className='tw-mt-0.5 tw-h-4 tw-w-4 tw-text-amber-500' aria-hidden='true' />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {upgradeUrl ? (
                            <Button variant='primary' className='cci-nice-menu-state-full' asChild>
                                <a href={upgradeUrl} target='_blank' rel='noreferrer'>
                                    {ctaLabel}
                                    {ctaIcon}
                                </a>
                            </Button>
                        ) : (
                            <Button variant='primary' className='cci-nice-menu-state-full' disabled>
                                {ctaLabel}
                                {ctaIcon}
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
