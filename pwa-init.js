/**
 * Universal Flashcards PWA - Initialization Script
 * Version: 3.0.0
 * Handles service worker registration and install prompt
 */

// PWA Install Variables
let deferredPrompt = null;
let installButton = null;

/**
 * Register Service Worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('✅ Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('🔄 New service worker installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
}

/**
 * Handle Install Prompt
 */
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 Install prompt available');
    e.preventDefault();
    deferredPrompt = e;

    // Show install button
    showInstallButton();
});

/**
 * Show Install Button
 */
function showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById('pwa-install-button')) {
        const button = document.createElement('button');
        button.id = 'pwa-install-button';
        button.className = 'pwa-install-btn';
        button.innerHTML = '📱 Install App';
        button.onclick = installApp;

        // Add to page (after h1 title)
        const title = document.querySelector('h1');
        if (title && title.parentNode) {
            const container = document.createElement('div');
            container.style.textAlign = 'center';
            container.style.marginBottom = '20px';
            container.appendChild(button);
            title.parentNode.insertBefore(container, title.nextSibling);
        }
    }

    installButton = document.getElementById('pwa-install-button');
    if (installButton) {
        installButton.style.display = 'inline-block';
    }
}

/**
 * Install App
 */
async function installApp() {
    if (!deferredPrompt) {
        console.log('❌ Install prompt not available');
        return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📊 User response to install prompt: ${outcome}`);

    if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        hideInstallButton();
    } else {
        console.log('❌ User dismissed the install prompt');
    }

    // Clear the deferred prompt
    deferredPrompt = null;
}

/**
 * Hide Install Button
 */
function hideInstallButton() {
    if (installButton) {
        installButton.style.display = 'none';
    }
}

/**
 * Handle App Installed
 */
window.addEventListener('appinstalled', () => {
    console.log('🎉 PWA was installed successfully');
    hideInstallButton();
    deferredPrompt = null;

    // Optional: Show thank you message
    showInstallThankYou();
});

/**
 * Show Update Notification
 */
function showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'pwa-update-banner';
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
        <div class="pwa-update-content">
            <span>🔄 New version available!</span>
            <button onclick="reloadApp()" class="pwa-update-btn">Update Now</button>
            <button onclick="dismissUpdate()" class="pwa-dismiss-btn">×</button>
        </div>
    `;
    document.body.appendChild(updateBanner);
}

/**
 * Reload App (Apply Update)
 */
function reloadApp() {
    navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    });
    window.location.reload();
}

/**
 * Dismiss Update Notification
 */
function dismissUpdate() {
    const banner = document.getElementById('pwa-update-banner');
    if (banner) {
        banner.remove();
    }
}

/**
 * Show Install Thank You Message
 */
function showInstallThankYou() {
    const message = document.createElement('div');
    message.className = 'pwa-toast';
    message.textContent = '🎉 App installed successfully! You can now use it offline.';
    document.body.appendChild(message);

    setTimeout(() => {
        message.classList.add('pwa-toast-show');
    }, 100);

    setTimeout(() => {
        message.classList.remove('pwa-toast-show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

/**
 * Check if app is installed
 */
function isAppInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }

    // Check for iOS standalone
    if (window.navigator.standalone === true) {
        return true;
    }

    return false;
}

/**
 * Initialize PWA features
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide install button if already installed
    if (isAppInstalled()) {
        console.log('✅ App is running in installed mode');
        hideInstallButton();
    }

    // Add connection status indicator
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
});

/**
 * Update Connection Status
 */
function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    console.log(`🌐 Connection status: ${isOnline ? 'Online' : 'Offline'}`);

    // Optional: Show connection indicator
    let indicator = document.getElementById('pwa-connection-indicator');

    if (!indicator && !isOnline) {
        indicator = document.createElement('div');
        indicator.id = 'pwa-connection-indicator';
        indicator.className = 'pwa-offline-indicator';
        indicator.textContent = '📡 Offline Mode';
        document.body.appendChild(indicator);
    } else if (indicator && isOnline) {
        indicator.remove();
    }
}

// Make functions globally available
window.reloadApp = reloadApp;
window.dismissUpdate = dismissUpdate;

console.log('✅ PWA initialized - version 3.0.0');
