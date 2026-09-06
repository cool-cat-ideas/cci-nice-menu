import React from 'react';
import { ProBadge as SharedProBadge } from '@cci/admin-ui/nice-menu';
import { __ } from '../i18n';

export default function ProBadge({ children, ...props }) {
    return <SharedProBadge {...props}>{children || __('Pro', 'cci-nice-menu')}</SharedProBadge>;
}
