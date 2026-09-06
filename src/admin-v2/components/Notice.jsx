import React from 'react';
import { Notice as SharedNotice } from '@cci/admin-ui/nice-menu';
import { __ } from '../i18n';

export default function Notice({ closeLabel = __('Close notification', 'cci-nice-menu'), ...props }) {
    return <SharedNotice closeLabel={closeLabel} {...props} />;
}
