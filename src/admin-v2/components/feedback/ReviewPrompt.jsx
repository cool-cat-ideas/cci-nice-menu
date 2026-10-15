import React from 'react';
import { ReviewPrompt as SharedReviewPrompt } from '@cci/admin-ui/nice-menu';
import { apiFetch, pluginData } from '../../api/api';
import { __ } from '../../i18n/i18n';

const copy = {
    quickFeedback: __('Quick feedback', 'cci-nice-menu'),
    title: __('How is CCI Nice Menu working for you?', 'cci-nice-menu'),
    description: __(
        'If this module helps your store, a short review helps us keep improving it.',
        'cci-nice-menu'
    ),
    addReview: __('Add review', 'cci-nice-menu'),
    openReviewPage: __('Open review page', 'cci-nice-menu'),
    close: __('Close', 'cci-nice-menu'),
    dialogTitle: __('Share your CCI Nice Menu feedback', 'cci-nice-menu'),
    dialogDescription: __('Your review will be sent for moderation. It will not be published automatically.', 'cci-nice-menu'),
    rating: __('Rating', 'cci-nice-menu'),
    setRating: __('Set rating', 'cci-nice-menu'),
    ratingHelp: __('Choose a rating from 1 to 5 stars.', 'cci-nice-menu'),
    shortReview: __('Short review', 'cci-nice-menu'),
    placeholder: __('What worked well? What should we improve?', 'cci-nice-menu'),
    consentRequired: __('Required consent', 'cci-nice-menu'),
    alsoOpenReviewPage: __('Also open review page', 'cci-nice-menu'),
    alsoOpenReviewPageDescription: __(
        'If checked, we will open the public review page after saving your feedback.',
        'cci-nice-menu'
    ),
    cancel: __('Cancel', 'cci-nice-menu'),
    saveFeedback: __('Save feedback', 'cci-nice-menu'),
    saving: __('Saving...', 'cci-nice-menu'),
    thankYou: __('Thank you for your feedback.', 'cci-nice-menu'),
    openingReviewPage: __('Opening the review page.', 'cci-nice-menu'),
    failed: __('Failed saving your feedback.', 'cci-nice-menu'),
    tryAgain: __('Please try again in a moment.', 'cci-nice-menu'),
};

export default function ReviewPrompt(props) {
    const consent = {
        codeName: 'productReviewPublication',
        content: 'I agree to send this rating and review to Cool Cat Ideas for moderation and possible publication on the product page. The review will not be published automatically.',
        locale: 'en',
        version: 1,
    };

    return (
        <SharedReviewPrompt
            {...props}
            apiFetch={apiFetch}
            mascotUrl={pluginData.modulePath ? `${pluginData.modulePath}views/img/cci-hello.png` : ''}
            reviewEndpoint={pluginData.reviewEndpoint || pluginData.reviewFeedbackEndpoint || '/review-feedback'}
            reviewUrl={
                pluginData.reviewUrl ||
                pluginData.wordpressReviewUrl ||
                pluginData.documentationUrl ||
                '#'
            }
            copy={copy}
            consent={consent}
        />
    );
}
