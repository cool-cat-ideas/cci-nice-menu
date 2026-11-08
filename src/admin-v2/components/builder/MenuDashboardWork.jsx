import React from 'react';
import { ResourceListHeader } from '@cci/admin-ui';
import { __ } from '../../i18n/i18n';
import { Button } from '../ui/button';
import { Card, CardHeader } from '../ui/card';

export default function MenuDashboardWork({ menus, onCreate, onOpen, onManage, formatDate }) {
  const saved = menus.filter((menu) => Number(menu.id_menu) > 0);
  const recent = [...saved]
    .sort(
      (a, b) =>
        String(b.date_upd || '').localeCompare(String(a.date_upd || '')) ||
        Number(b.id_menu) - Number(a.id_menu),
    )
    .slice(0, 5);
  const hooks = [
    ...saved.reduce((map, menu) => {
      const hook = menu.hook_name || '';
      map.set(hook, (map.get(hook) || 0) + 1);
      return map;
    }, new Map()),
  ].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return (
    <>
      <Card>
        <ResourceListHeader
          title={__('Recently edited menus', 'cci-nice-menu')}
          createLabel={__('New menu', 'cci-nice-menu')}
          onCreate={onCreate}
        />
        <ul className="tw-m-0 tw-list-none tw-p-0">
          {recent.map((menu) => (
            <li
              key={menu.id_menu}
              className="tw-grid tw-min-w-0 tw-gap-1 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-3 last:tw-border-b-0"
            >
              <Button
                variant="unstyled"
                className="tw-w-fit tw-max-w-full tw-whitespace-normal !tw-border-0 !tw-bg-transparent tw-p-0 tw-text-left !tw-text-sm !tw-font-semibold !tw-leading-5 tw-text-cci-nm-text hover:tw-text-cci-nm-brandStrong hover:tw-underline"
                onClick={() => onOpen(menu)}
              >
                {menu.name || __('(no title)', 'cci-nice-menu')}
              </Button>
              <span className="tw-break-words tw-text-xs tw-text-cci-nm-muted">
                {menu.hook_name || __('Not assigned', 'cci-nice-menu')} ·{' '}
                {formatDate(menu.date_upd)}
              </span>
            </li>
          ))}
        </ul>
        {!recent.length && (
          <p className="tw-m-0 tw-p-5 tw-text-sm tw-text-cci-nm-muted">
            {__('No menus yet.', 'cci-nice-menu')}
          </p>
        )}
        <div className="tw-border-0 tw-border-t tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-3">
          <Button variant="secondary" onClick={onManage}>
            {__('View all menus', 'cci-nice-menu')}
          </Button>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="!tw-m-0 !tw-text-lg !tw-font-semibold !tw-leading-6">
            {__('Hook assignments', 'cci-nice-menu')}
          </h2>
        </CardHeader>
        <dl className="tw-m-0 tw-grid tw-gap-3 tw-p-5">
          {hooks.map(([hook, count]) => (
            <div
              key={hook}
              className="tw-flex tw-min-w-0 tw-items-baseline tw-justify-between tw-gap-4"
            >
              <dt className="tw-min-w-0 tw-break-all tw-text-sm">
                {hook || __('Not assigned', 'cci-nice-menu')}
              </dt>
              <dd className="tw-m-0 tw-font-semibold">{count}</dd>
            </div>
          ))}
        </dl>
        {!hooks.length && (
          <p className="tw-m-0 tw-px-5 tw-pb-5 tw-text-sm tw-text-cci-nm-muted">
            {__('No menus yet.', 'cci-nice-menu')}
          </p>
        )}
      </Card>
    </>
  );
}
