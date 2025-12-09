// GA4 Analytics utility functions

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

/**
 * Send a custom event to Google Analytics 4
 * @param eventName - The name of the event (e.g., 'nav_click', 'lp_modal_open')
 * @param params - Optional parameters to include with the event
 */
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
};

/**
 * Track navigation clicks
 */
export const trackNavClick = (linkName: string, destinationUrl: string, destinationPage: string) => {
    trackEvent('nav_click', {
        link_name: linkName,
        destination_url: destinationUrl,
        destination_page: destinationPage,
    });
};

/**
 * Track external link clicks
 */
export const trackExternalLink = (linkName: string, url: string) => {
    trackEvent('external_link_click', {
        link_name: linkName,
        link_url: url,
    });
};

/**
 * Track LP modal opens
 */
export const trackLpModalOpen = (modalId: string) => {
    trackEvent('lp_modal_open', {
        modal_id: modalId,
    });
};

/**
 * Track LP CTA clicks
 */
export const trackLpCtaClick = (destination: string) => {
    trackEvent('lp_cta_click', {
        destination: destination,
    });
};

/**
 * Track tutorial step changes
 */
export const trackTutorialStepChange = (stepId: number, stepTitle: string, direction: 'next' | 'prev' | 'jump') => {
    trackEvent('tutorial_step_change', {
        step_id: stepId,
        step_title: stepTitle,
        direction: direction,
    });
};

/**
 * Track tutorial completion
 */
export const trackTutorialComplete = () => {
    trackEvent('tutorial_complete');
};

/**
 * Track guide card clicks
 */
export const trackGuideCardClick = (title: string, category: string, path: string) => {
    trackEvent('guide_card_click', {
        title: title,
        category: category,
        path: path,
    });
};

/**
 * Track guide CTA clicks
 */
export const trackGuideCtaClick = (ctaType: string) => {
    trackEvent('guide_cta_click', {
        cta_type: ctaType,
    });
};

/**
 * Track mobile menu toggle
 */
export const trackMobileMenuToggle = (action: 'open' | 'close') => {
    trackEvent('mobile_menu_toggle', {
        action: action,
    });
};
