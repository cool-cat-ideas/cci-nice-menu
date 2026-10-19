import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import { __ } from '../../i18n/i18n';
import { Button } from '../ui/button';

export default function ConfirmLicenseDeactivateModal({
  open,
  saving = false,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  const modal = (
    <div
      className="tw-fixed tw-inset-0 tw-z-[100000] tw-grid tw-place-items-center tw-bg-slate-950/35 tw-p-4"
      role="presentation"
    >
      <div
        className="tw-w-full tw-max-w-md tw-overflow-hidden tw-rounded-lg tw-border tw-border-solid tw-border-cci-nm-border tw-bg-white tw-shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cci-nice-menu-deactivate-license-title"
      >
        <div className="tw-grid tw-gap-3 tw-border-0 tw-border-b tw-border-solid tw-border-cci-nm-border tw-px-5 tw-py-4">
          <span
            className="tw-inline-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-amber-200 tw-bg-amber-50 tw-text-amber-700 [&_svg]:tw-h-5 [&_svg]:tw-w-5"
            aria-hidden="true"
          >
            <AlertTriangle />
          </span>
          <div>
            <h2
              id="cci-nice-menu-deactivate-license-title"
              className="tw-m-0 tw-text-lg tw-font-semibold tw-leading-tight tw-text-cci-nm-text"
            >
              {__('Deactivate Pro license?', 'cci-nice-menu')}
            </h2>
            <p className="tw-m-0 tw-mt-1 tw-text-sm tw-leading-5 tw-text-cci-nm-muted">
              {__(
                'Pro features will stop working on this site until the license is activated again.',
                'cci-nice-menu',
              )}
            </p>
          </div>
        </div>
        <div className="tw-flex tw-justify-end tw-gap-2 tw-p-5">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={saving}>
            {__('Cancel', 'cci-nice-menu')}
          </Button>
          <Button variant="danger" type="button" onClick={onConfirm} disabled={saving}>
            {saving
              ? __('Deactivating...', 'cci-nice-menu')
              : __('Deactivate license', 'cci-nice-menu')}
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined' || !document.body) {
    return modal;
  }

  return createPortal(modal, document.body);
}
