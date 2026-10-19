<?php

/**
 * CCI Nice Menu - React admin shell.
 */

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

class AdminCciNiceMenuConfigurationController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true;
        parent::__construct();
        $this->meta_title = $this->module->trans('CCI Nice Menu', [], 'Modules.CciNiceMenu.Admin');
    }

    public function setMedia($isNewTheme = false): void
    {
        parent::setMedia($isNewTheme);

        $cssPath = _PS_MODULE_DIR_ . $this->module->name . '/views/css/cci_nice_menu_admin.css';
        $version = (string) (@filemtime($cssPath) ?: $this->module->version);

        if (method_exists($this, 'registerStylesheet')) {
            $this->registerStylesheet(
                'cci-nice-menu-admin',
                'modules/' . $this->module->name . '/views/css/cci_nice_menu_admin.css?v=' . rawurlencode($version),
                ['media' => 'all', 'priority' => 230]
            );

            return;
        }

        $this->addCSS($this->module->getPathUri() . 'views/css/cci_nice_menu_admin.css?v=' . rawurlencode($version), 'all');
    }

    public function initContent(): void
    {
        if ($this->controller_name === 'AdminCciNiceMenuConfiguration' && !Tools::isSubmit('ajax')) {
            Tools::redirectAdmin($this->context->link->getAdminLink('AdminCciNiceMenu'));
        }

        if (Tools::isSubmit('ajax')) {
            $this->module->getContent();

            return;
        }

        $this->content = $this->module->renderAdminContent($this->controller_name);

        parent::initContent();
    }
}
