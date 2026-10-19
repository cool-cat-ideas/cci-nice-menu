import React from 'react';
import { LoadingState as SharedLoadingState } from '@cci/admin-ui/nice-menu';
import { __ } from '../../i18n/i18n';

export default function LoadingState({ label = __('Loading...', 'cci-nice-menu'), ...props }) {
  return <SharedLoadingState label={label} {...props} />;
}
