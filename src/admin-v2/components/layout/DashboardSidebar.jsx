import { ActiveLicenseCard, InactiveLicenseCard } from '@cci/admin-ui';
import { ProductNavigation } from "@cci/admin-ui/product-panels";
import React from "react";
import {
  Menu as MenuIcon,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { apiFetch, isCciNiceMenuProLicenseActive, pluginData } from "../../api/api";
import { __, coreString } from "../../i18n/i18n";
import { compactLicenseError } from "../../lib/utils";
import ProductLogo from "./ProductLogo";
import ConfirmLicenseDeactivateModal from "../licensing/ConfirmLicenseDeactivateModal";

const items = [
  { id: "dashboard", label: "Menus", icon: MenuIcon, core: true },
  { id: "extensions", label: "Extensions", icon: ShoppingBag, core: true },
  { id: "settings", label: "Settings", icon: Settings, core: true },
];

export default function DashboardSidebar({
  activeSection,
  collapsed = false,
  onCollapsedChange,
  onSelect,
  isPro,
  license,
  onLicenseChange,
  setNotice,
}) {
  const showLicenseBox = Boolean(
    license?.canManage && license?.proModuleAvailable && license?.apiBase,
  );
  const showUpgradeBanner = !showLicenseBox && !isPro;
  return (
    <ProductNavigation
      collapsed={collapsed}
      activeSection={activeSection}
      onSelect={onSelect}
      onCollapsedChange={onCollapsedChange}
      labels={{
        menu: coreString("menu", "Menu"),
        expand: __("Expand sidebar", "cci-nice-menu"),
        collapse: __("Collapse sidebar", "cci-nice-menu"),
      }}
      items={items.map((item) => ({
        ...item,
        label: item.core
          ? coreString(item.id, item.label)
          : __(item.label, "cci-nice-menu"),
      }))}
      logo={
        <ProductLogo
          compact={collapsed}
          onClick={(event) => {
            event.preventDefault();
            onSelect("dashboard");
          }}
        />
      }
    >
      {!collapsed && showLicenseBox && (
        <SidebarLicenseBox
          isPro={isPro}
          license={license}
          onLicenseChange={onLicenseChange}
          setNotice={setNotice}
        />
      )}
      {!collapsed && showUpgradeBanner && (
        <div className="tw-mt-2 tw-grid tw-gap-3 tw-rounded-md tw-border tw-border-solid tw-border-amber-200 tw-bg-gradient-to-br tw-from-amber-50 tw-via-white tw-to-white tw-p-3.5 tw-text-cci-nm-text">
          <div className="tw-grid tw-gap-1.5">
            <strong className="tw-text-sm tw-font-semibold tw-leading-5 tw-text-cci-nm-text">
              {__("Need more menu options?", "cci-nice-menu")}
            </strong>
            <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
              {__(
                "This shop is using the base module. After you install CCI Nice Menu Pro, license activation will appear here.",
                "cci-nice-menu",
              )}
            </p>
          </div>
        </div>
      )}
    </ProductNavigation>
  );
}

function SidebarLicenseBox({ isPro, license, onLicenseChange, setNotice }) {
  const [licenseKey, setLicenseKey] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [error, setError] = React.useState('');
  const [errorTone, setErrorTone] = React.useState('error');
  const [fieldError, setFieldError] = React.useState('');
  const [deactivateModalOpen, setDeactivateModalOpen] = React.useState(false);
  const apiBase = license?.apiBase || '';
  const licensedSite = license?.domain || license?.customerEmail || '';
  const environmentLabel = license?.environment ? String(license.environment) : '';
  const validateLicenseKey = (key) => {
    const value = key.trim();

    if (!value) {
      return __('Enter your license key.', 'cci-nice-menu');
    }

    if (value.length < 8) {
      return __('License key looks too short.', 'cci-nice-menu');
    }

    return '';
  };

  const applyLicense = (nextLicense) => {
    const normalized = nextLicense || {};

    pluginData.license = normalized;
    pluginData.isPro = isCciNiceMenuProLicenseActive(normalized);

    if (onLicenseChange) {
      onLicenseChange(normalized);
    }
  };

  const sendLicenseRequest = (endpoint, body = {}, successMessage = '') => {
    setSaving(true);

    apiFetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
      .then((response) => {
        applyLicense(response.license);
        setError(response.warning || '');
        setErrorTone(response.warning ? 'warning' : 'error');

        if (response.license?.status === 'active') {
          setLicenseKey('');
        }

        if (successMessage && setNotice) {
          setNotice({
            type: response.warning ? 'warning' : 'success',
            message: __(response.warning || successMessage, 'cci-nice-menu'),
            details: '',
          });
        }
      })
      .catch((requestError) => {
        const message = compactLicenseError(
          requestError,
          __('License server is temporarily unavailable. Please try again later.', 'cci-nice-menu'),
          __('License request failed.', 'cci-nice-menu'),
        );

        setError(__(message, 'cci-nice-menu'));
        setErrorTone('error');

        if (setNotice) {
          setNotice({
            type: 'error',
            message,
            details: '',
          });
        }
      })
      .finally(() => setSaving(false));
  };

  const activateLicense = () => {
    const validationError = validateLicenseKey(licenseKey);

    setTouched(true);
    setError('');
    setFieldError(validationError);

    if (validationError) {
      setNotice?.({ type: 'error', message: validationError, details: '' });
      return false;
    }

    sendLicenseRequest(
      '/license/activate',
      { licenseKey: licenseKey.trim() },
      __('Pro license was activated.', 'cci-nice-menu'),
    );
  };

  const deactivateLicense = () => {
    setDeactivateModalOpen(true);
  };

  const confirmDeactivateLicense = () => {
    setDeactivateModalOpen(false);
    sendLicenseRequest('/license/deactivate', {}, __('Pro license was deactivated.', 'cci-nice-menu'));
  };

  if (isPro) {
    return (
      <ActiveLicenseCard
        t={(text) => __(text, 'cci-nice-menu')}
        productName={__('CCI Nice Menu Pro', 'cci-nice-menu')}
        site={licensedSite}
        environment={environmentLabel}
        saving={saving}
        onDeactivate={deactivateLicense}
        error={__(error, 'cci-nice-menu')}
        errorTone={errorTone}
      >
        <ConfirmLicenseDeactivateModal
          open={deactivateModalOpen}
          saving={saving}
          onCancel={() => setDeactivateModalOpen(false)}
          onConfirm={confirmDeactivateLicense}
        />
      </ActiveLicenseCard>
    );
  }

  return (
    <InactiveLicenseCard
      t={(text) => __(text, 'cci-nice-menu')}
      productName={__('CCI Nice Menu Pro', 'cci-nice-menu')}
      licenseKey={licenseKey}
      saving={saving}
      onActivate={activateLicense}
      onKeyBlur={() => {
        setTouched(true);
        setFieldError(validateLicenseKey(licenseKey));
      }}
      onKeyChange={(nextValue) => {
        setLicenseKey(nextValue);
        setError('');

        if (touched) {
          setFieldError(validateLicenseKey(nextValue));
        }
      }}
      error={__(error, 'cci-nice-menu')}
      errorTone={errorTone}
      fieldError={fieldError}
    />
  );
}
