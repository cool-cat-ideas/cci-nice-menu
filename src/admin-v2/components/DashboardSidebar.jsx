import { ProductNavigation } from "@cci/admin-ui/product-panels";
import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Menu as MenuIcon,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { apiFetch, isCciNiceMenuProLicenseActive, pluginData } from "../api";
import { __, coreString } from "../i18n";
import { cn } from "../lib/cn";
import { compactLicenseError } from "../utils";
import ProductLogo from "./ProductLogo";
import ProBadge from "./ProBadge";
import ConfirmLicenseDeactivateModal from "./ConfirmLicenseDeactivateModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
  const [licenseKey, setLicenseKey] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [error, setError] = React.useState("");
  const [deactivateModalOpen, setDeactivateModalOpen] = React.useState(false);
  const apiBase = license?.apiBase || "";
  const licenseLabel =
    license?.label || (isPro ? "PRO" : coreString("inactive", "Inactive"));
  const licensedSite = license?.domain || license?.customerEmail || "";
  const environmentLabel = license?.environment
    ? String(license.environment)
    : "";
  const mascotUrl = pluginData.modulePath
    ? `${pluginData.modulePath}views/img/cci-working.png`
    : "";
  const boxStyle = mascotUrl
    ? {
        backgroundImage: `linear-gradient(115deg, rgba(255,255,255,0.99) 0%, rgba(255,255,255,0.96) 58%, rgba(255,255,255,0.62) 100%), url("${mascotUrl}")`,
        backgroundPosition: "right -1.25rem top 3.25rem",
        backgroundRepeat: "no-repeat",
        backgroundSize: "6.75rem auto",
      }
    : undefined;

  const validateLicenseKey = (key) => {
    const value = key.trim();

    if (!value) {
      return __("Enter your license key.", "cci-nice-menu");
    }

    if (value.length < 8) {
      return __("License key looks too short.", "cci-nice-menu");
    }

    return "";
  };

  const applyLicense = (nextLicense) => {
    const normalized = nextLicense || {};

    pluginData.license = normalized;
    pluginData.isPro = isCciNiceMenuProLicenseActive(normalized);

    if (onLicenseChange) {
      onLicenseChange(normalized);
    }
  };

  const sendLicenseRequest = (endpoint, body = {}, successMessage = "") => {
    setSaving(true);

    apiFetch(`${apiBase}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((response) => {
        applyLicense(response.license);
        setError(response.warning || "");

        if (response.license?.status === "active") {
          setLicenseKey("");
        }

        if (successMessage && setNotice) {
          setNotice({
            type: response.warning ? "warning" : "success",
            message: successMessage,
            details: response.warning || "",
          });
        }
      })
      .catch((requestError) => {
        const message = compactLicenseError(
          requestError,
          __(
            "License server is temporarily unavailable. Please try again later.",
            "cci-nice-menu",
          ),
          __("License request failed.", "cci-nice-menu"),
        );

        setError(message);

        if (setNotice) {
          setNotice({
            type: "error",
            message: __("License request failed.", "cci-nice-menu"),
            details: message,
          });
        }
      })
      .finally(() => setSaving(false));
  };

  const activateLicense = () => {
    const validationError = validateLicenseKey(licenseKey);

    setTouched(true);
    setError(validationError);

    if (validationError) {
      return;
    }

    sendLicenseRequest(
      "/license/activate",
      { licenseKey: licenseKey.trim() },
      __("Pro license was activated.", "cci-nice-menu"),
    );
  };

  const deactivateLicense = () => {
    setDeactivateModalOpen(true);
  };

  const confirmDeactivateLicense = () => {
    setDeactivateModalOpen(false);
    sendLicenseRequest(
      "/license/deactivate",
      {},
      __("Pro license was deactivated.", "cci-nice-menu"),
    );
  };

  return (
    <div
      className={cn(
        "tw-relative tw-grid tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-bg-white tw-p-3.5",
        isPro
          ? "tw-border-cci-nm-brandBorder tw-bg-cci-nm-brandSoft"
          : "tw-border-amber-200 tw-bg-gradient-to-br tw-from-amber-50 tw-via-white tw-to-white",
      )}
      style={boxStyle}
    >
      <ConfirmLicenseDeactivateModal
        open={deactivateModalOpen}
        saving={saving}
        onCancel={() => setDeactivateModalOpen(false)}
        onConfirm={confirmDeactivateLicense}
      />
      <div className="tw-relative tw-z-10 tw-flex tw-items-start tw-gap-2.5">
        <span
          className={cn(
            "tw-inline-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid [&_svg]:tw-h-4 [&_svg]:tw-w-4",
            isPro
              ? "tw-border-amber-200 tw-bg-amber-50 tw-text-amber-700"
              : "tw-border-amber-200 tw-bg-amber-50 tw-text-amber-700",
          )}
          aria-hidden="true"
        >
          {isPro ? <Crown /> : <ShieldCheck />}
        </span>
        <div className="tw-min-w-0">
          <strong className="tw-block tw-text-sm tw-font-semibold tw-leading-tight tw-text-cci-nm-text">
            {__("CCI Nice Menu Pro", "cci-nice-menu")}
          </strong>
          <span className="tw-mt-1 tw-inline-flex tw-rounded-full tw-border tw-border-solid tw-border-amber-200 tw-bg-white tw-px-2 tw-py-0.5 tw-text-[10px] tw-font-bold tw-uppercase tw-leading-none tw-text-amber-700">
            {isPro ? licenseLabel : __("Pro upgrade", "cci-nice-menu")}
          </span>
        </div>
      </div>

      {isPro ? (
        <div className="tw-relative tw-z-10 tw-grid tw-gap-2">
          <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
            {__("Premium features are active on this site.", "cci-nice-menu")}
          </p>
          {(licensedSite || environmentLabel) && (
            <div className="tw-grid tw-gap-1.5 tw-rounded-md tw-border tw-border-solid tw-border-cci-nm-brandBorder tw-bg-white/70 tw-p-2.5 tw-text-xs">
              {licensedSite && (
                <span className="tw-flex tw-justify-between tw-gap-2">
                  <span className="tw-text-cci-nm-muted">
                    {__("Site", "cci-nice-menu")}
                  </span>
                  <strong className="tw-truncate tw-text-cci-nm-text">
                    {licensedSite}
                  </strong>
                </span>
              )}
              {environmentLabel && (
                <span className="tw-flex tw-justify-between tw-gap-2">
                  <span className="tw-text-cci-nm-muted">
                    {__("Environment", "cci-nice-menu")}
                  </span>
                  <strong className="tw-text-cci-nm-text">
                    {environmentLabel}
                  </strong>
                </span>
              )}
            </div>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={deactivateLicense}
            disabled={saving}
          >
            {saving
              ? __("Deactivating...", "cci-nice-menu")
              : __("Deactivate license", "cci-nice-menu")}
          </Button>
        </div>
      ) : (
        <div className="tw-relative tw-z-10 tw-grid tw-gap-2.5">
          <p className="tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-muted">
            {__(
              "Enter your license key to unlock Pro add-ons on this domain.",
              "cci-nice-menu",
            )}
          </p>
          <label className="tw-grid tw-gap-1.5">
            <span className="tw-text-[11px] tw-font-semibold tw-leading-none tw-text-slate-600">
              {__("License key", "cci-nice-menu")}
            </span>
            <Input
              type="password"
              value={licenseKey}
              placeholder="CCI-XXXX-XXXX"
              invalid={Boolean(error)}
              aria-invalid={Boolean(error)}
              onBlur={() => {
                setTouched(true);
                setError(validateLicenseKey(licenseKey));
              }}
              onChange={(event) => {
                const nextValue = event.target.value;

                setLicenseKey(nextValue);

                if (touched) {
                  setError(validateLicenseKey(nextValue));
                }
              }}
            />
          </label>
          <Button
            variant="primary"
            size="sm"
            className="cci-nice-menu-state-full"
            onClick={activateLicense}
            disabled={saving}
          >
            {saving
              ? __("Activating...", "cci-nice-menu")
              : __("Activate license", "cci-nice-menu")}
          </Button>
          <p className="tw-m-0 tw-text-[11px] tw-leading-4 tw-text-cci-nm-muted">
            {__(
              "Already have a key? Paste it here and activate Pro in seconds.",
              "cci-nice-menu",
            )}
          </p>
        </div>
      )}

      {error && (
        <p className="tw-relative tw-z-10 tw-m-0 tw-text-xs tw-leading-5 tw-text-cci-nm-danger">
          {error}
        </p>
      )}
    </div>
  );
}
