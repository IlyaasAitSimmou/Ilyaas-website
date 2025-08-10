'use client'

import { useEffect } from 'react'

const ScrollReset = () => {
    useEffect(() => {
        // Reset scroll position to top on any page load/reload
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
            // Disable automatic scroll restoration by the browser
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
        }
    }, []);

    return null; // This component doesn't render anything
};

export default ScrollReset
