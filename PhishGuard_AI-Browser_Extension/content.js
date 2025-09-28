// PhishGuard AI - content.js

// This script is injected into all pages.
// Its primary role is to display the blocking page information.

(async () => {
    // Check if this is the blocked page.
    if (window.location.href.includes('blocked.html')) {
        const data = await chrome.storage.local.get('blockedSiteInfo');
        if (data.blockedSiteInfo) {
            const { url, reasons } = data.blockedSiteInfo;
            document.getElementById('blocked-url').textContent = url;
            const reasonsList = document.getElementById('reasons-list');
            reasons.forEach(reason => {
                const li = document.createElement('li');
                li.textContent = reason;
                reasonsList.appendChild(li);
            });

            document.getElementById('go-back').onclick = () => {
                window.location.assign('https://www.google.com');
            };

            document.getElementById('proceed').onclick = async () => {
                // Add to allowlist and proceed.
                await chrome.storage.local.get('allowlist', (data) => {
                    const allowlist = data.allowlist || [];
                    const hostname = new URL(url).hostname;
                    if (!allowlist.includes(hostname)) {
                        allowlist.push(hostname);
                        chrome.storage.local.set({ allowlist });
                    }
                });
                window.location.href = url;
            };
        }
    }

})();
