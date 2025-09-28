// PhishGuard AI - popup.js

document.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('report-btn');
    const allowlistBtn = document.getElementById('allowlist-btn');
    const allowlistInput = document.getElementById('allowlist-input');
    const addToAllowlistBtn = document.getElementById('add-to-allowlist-btn');
    const allowlistUl = document.getElementById('allowlist-ul');
    const messageBox = document.getElementById('message-box');

    // Load the allowlist on popup open.
    loadAllowlist();

    reportBtn.addEventListener('click', () => {
        chrome.storage.local.get('blockedSiteInfo', (data) => {
            if (data.blockedSiteInfo) {
                const reportedUrl = data.blockedSiteInfo.url;
                chrome.runtime.sendMessage({ action: 'reportUrl', url: reportedUrl }, (response) => {
                    if (response && response.status === 'URL reported') {
                        showMessage('Website reported successfully. It will be re-evaluated.', 'success');
                        // Re-trigger URL analysis to block again if still a threat
                        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                            if (tabs[0].url === chrome.runtime.getURL('blocked.html')) {
                                chrome.tabs.update(tabs[0].id, { url: reportedUrl }, () => {
                                    chrome.runtime.sendMessage({ action: 'reanalyzeUrl', url: reportedUrl });
                                });
                            }
                        });
                    } else {
                        showMessage('Failed to report website. Please try again.', 'error');
                        console.error('Report failed:', response);
                    }
                });
            } else {
                showMessage('No blocked website to report.', 'error');
                console.error('No blockedSiteInfo found in storage.');
            }
        });
    });

    // allowlistBtn.addEventListener('click', () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         const url = tabs[0].url;
    //         addUrlToAllowlist(new URL(url).hostname);
    //     });
    // });


    allowlistBtn.addEventListener('click', () => {
        chrome.storage.local.get('blockedSiteInfo', (data) => {//Arre actually previous code was using chrome.tab.query but i replaced it with chrome.storage.local abhi thik hai 
            if (data.blockedSiteInfo) {
                const blockedUrl = data.blockedSiteInfo.url;
                addUrlToAllowlist(new URL(blockedUrl).hostname);
            } else {
                console.error('No blocked site info found in storage.');
            }
        });
    });

    addToAllowlistBtn.addEventListener('click', () => {
        const domain = allowlistInput.value.trim();
        if (domain) {
            addUrlToAllowlist(domain);
            allowlistInput.value = '';
        }
    });

    async function addUrlToAllowlist(domain) {
        const { allowlist = [] } = await chrome.storage.local.get('allowlist');
        if (!allowlist.includes(domain)) {
            allowlist.push(domain);
            await chrome.storage.local.set({ allowlist });
            loadAllowlist();
            showMessage(`${domain} added to allowlist.`, 'success');
        } else {
            showMessage(`${domain} is already on the allowlist.`, 'info');
        }
    }

    async function loadAllowlist() {
        const { allowlist = [] } = await chrome.storage.local.get('allowlist');
        allowlistUl.innerHTML = '';
        allowlist.forEach(domain => {
            const li = document.createElement('li');
            li.textContent = domain;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.onclick = async () => {
                const { allowlist = [] } = await chrome.storage.local.get('allowlist');
                const updatedList = allowlist.filter(d => d !== domain);
                await chrome.storage.local.set({ allowlist: updatedList });
                loadAllowlist();
                showMessage(`${domain} removed from allowlist.`, 'info');
            };
            li.appendChild(removeBtn);
            allowlistUl.appendChild(li);
        });
    }

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.classList.remove('hidden');
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 3000);
    }
});