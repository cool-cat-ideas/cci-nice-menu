import { ResourceListHeader } from '@cci/admin-ui';
import React from 'react';
import { CheckCircle2, FilePenLine, Layers3, } from 'lucide-react';
import { __, coreString } from '../../i18n/i18n';
import { cn } from '../../lib/cn';
import MetricCard from '../feedback/MetricCard';
import ReviewPrompt from '../feedback/ReviewPrompt';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export default function MenusList({
    menus,
    stats,
    onCreate,
    onOpen,
    onDuplicate,
    onDelete,
    formatDate,
    setNotice,
    deleteModal,
}) {
    const inactiveCount = Math.max(0, stats.total - stats.active);

    return (
        <>
            <div className='tw-grid tw-content-start tw-gap-4'>
                <div className='tw-grid tw-grid-cols-1 tw-gap-3 lg:tw-grid-cols-3'>
                    <MetricCard
                        icon={Layers3}
                        label={__('Total menus', 'cci-nice-menu')}
                        value={stats.total}
                        description={__('All saved configurations', 'cci-nice-menu')}
                        tone='primary'
                    />
                    <MetricCard
                        icon={CheckCircle2}
                        label={coreString('active', 'Active')}
                        value={stats.active}
                        description={__('Enabled menu definitions', 'cci-nice-menu')}
                    />
                    <MetricCard
                        icon={FilePenLine}
                        label={coreString('inactive', 'Inactive')}
                        value={inactiveCount}
                        description={__('Disabled menu definitions', 'cci-nice-menu')}
                    />
                </div>

                <ReviewPrompt setNotice={setNotice} />

                <Card>
                    <ResourceListHeader title={__('Menus', 'cci-nice-menu')}
                        description={__('Create, edit and assign menu definitions to storefront hooks.', 'cci-nice-menu')}
                        createLabel={__('New menu', 'cci-nice-menu')} onCreate={onCreate} />

                    <div className='tw-overflow-x-auto'>
                        <table className='tw-w-full tw-min-w-[760px] tw-border-collapse'>
                            <thead className='tw-bg-cci-nm-surfaceSoft'>
                                <tr>
                                    <th className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-bold tw-uppercase tw-text-cci-nm-muted'>
                                        {coreString('title', 'Title')}
                                    </th>
                                    <th className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-bold tw-uppercase tw-text-cci-nm-muted'>
                                        {__('Hook', 'cci-nice-menu')}
                                    </th>
                                    <th className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-bold tw-uppercase tw-text-cci-nm-muted'>
                                        {coreString('status', 'Status')}
                                    </th>
                                    <th className='tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-4 tw-py-3 tw-text-left tw-text-xs tw-font-bold tw-uppercase tw-text-cci-nm-muted'>
                                        {coreString('date', 'Date')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {menus.map((menu) => (
                                    <tr
                                        key={menu.id_menu || menu.code}
                                        className='tw-group tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border last:tw-border-b-0'
                                    >
                                        <td className='tw-px-4 tw-py-4 tw-align-middle'>
                                            <Button variant="unstyled"
                                                type='button'
                                                className='tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-left tw-font-semibold tw-text-cci-nm-text tw-underline tw-decoration-transparent tw-underline-offset-4 hover:tw-text-cci-nm-brandStrong hover:tw-decoration-current'
                                                onClick={() => onOpen(menu)}
                                            >
                                                {menu.name || __('(no title)', 'cci-nice-menu')}
                                            </Button>
                                            <div
                                                className='tw-mt-1 tw-flex tw-flex-wrap tw-items-center tw-leading-5 tw-opacity-100 tw-transition-opacity md:tw-opacity-0 md:group-hover:tw-opacity-100 md:group-focus-within:tw-opacity-100'
                                                aria-label={__('Menu actions', 'cci-nice-menu')}
                                            >
                                                <Button variant="unstyled"
                                                    type='button'
                                                    className='tw-inline-flex tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-[13px] tw-font-medium tw-text-cci-nm-brandStrong tw-underline tw-decoration-transparent tw-underline-offset-[3px] hover:tw-text-cci-nm-brand hover:tw-decoration-current after:tw-mx-2 after:tw-text-cci-nm-muted after:tw-content-["|"]'
                                                    onClick={() => onOpen(menu)}
                                                >
                                                    {coreString('edit', 'Edit')}
                                                </Button>
                                                <Button variant="unstyled"
                                                    type='button'
                                                    className='tw-inline-flex tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-[13px] tw-font-medium tw-text-cci-nm-brandStrong tw-underline tw-decoration-transparent tw-underline-offset-[3px] hover:tw-text-cci-nm-brand hover:tw-decoration-current after:tw-mx-2 after:tw-text-cci-nm-muted after:tw-content-["|"]'
                                                    onClick={() => onDuplicate(menu)}
                                                >
                                                    {coreString('duplicate', 'Duplicate')}
                                                </Button>
                                                <Button variant="unstyled"
                                                    type='button'
                                                    className='tw-inline-flex tw-cursor-pointer tw-border-0 tw-bg-transparent tw-p-0 tw-text-[13px] tw-font-medium tw-text-cci-nm-danger tw-underline tw-decoration-transparent tw-underline-offset-[3px] hover:tw-text-cci-nm-dangerText hover:tw-decoration-current'
                                                    onClick={() => onDelete(menu)}
                                                >
                                                    {coreString('delete', 'Delete')}
                                                </Button>
                                            </div>
                                        </td>
                                        <td className='tw-px-4 tw-py-5 tw-align-middle'>
                                            <span className='tw-inline-flex tw-items-center tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-border tw-bg-cci-nm-surfaceSoft tw-px-2.5 tw-py-1.5 tw-font-mono tw-text-[12px] tw-font-semibold tw-leading-none tw-text-cci-nm-text'>
                                                {menu.hook_name || 'displayTop'}
                                            </span>
                                        </td>
                                        <td className='tw-px-4 tw-py-5 tw-align-middle'>
                                            <MenuStatusBadge active={Number(menu.is_active) === 1} />
                                        </td>
                                        <td className='tw-whitespace-nowrap tw-px-4 tw-py-5 tw-align-middle tw-text-cci-nm-muted'>
                                            {formatDate(menu)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {menus.length === 0 && (
                            <div className='tw-grid tw-min-h-52 tw-place-items-center tw-gap-2 tw-p-8 tw-text-center'>
                                <strong className='tw-text-sm tw-font-semibold tw-text-cci-nm-text'>
                                    {__('No menus yet.', 'cci-nice-menu')}
                                </strong>
                                <p className='tw-m-0 tw-text-sm tw-text-cci-nm-muted'>
                                    {__('Create your first menu and assign it to a storefront hook.', 'cci-nice-menu')}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {menus.length > 0 && (
                    <div className='tw-flex tw-items-center tw-justify-center tw-gap-3 tw-border-0 tw-px-5 tw-pt-0 tw-pb-4 tw-text-center'>
                        <p className='tw-m-0 tw-text-sm tw-leading-5 tw-text-cci-nm-muted'>
                            {__('That is all for now. Create your next menu or edit an existing storefront navigation.', 'cci-nice-menu')}
                        </p>
                    </div>
                )}
            </div>
            {deleteModal}
        </>
    );
}

function MenuStatusBadge({ active }) {
    return (
        <span
            className={cn(
                'tw-inline-flex tw-rounded-full tw-border tw-border-solid tw-px-2 tw-py-1 tw-text-[11px] tw-font-bold tw-uppercase tw-leading-none',
                active
                    ? 'tw-border-cci-nm-successBorder tw-bg-cci-nm-successBg tw-text-cci-nm-successText'
                    : 'tw-border-cci-nm-border tw-bg-cci-nm-surfaceMuted tw-text-cci-nm-muted'
            )}
        >
            {active ? coreString('active', 'Active') : coreString('inactive', 'Inactive')}
        </span>
    );
}
