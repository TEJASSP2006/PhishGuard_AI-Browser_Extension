// PhishGuard AI - background.js

// --- Configuration ---
const APIVOID_API_KEY = 'Uws7TLN0F4Vpmvt6Mage3yFpUbs6fYssl1QYrXOiLF0lS5NztmEMDQMU-BMeFNPV'; // Replace with your actual key
const GEMINI_API_KEY = 'AIzaSyDYog88wo0xpR79bqiNbovRaDNAW1zIeeM'; // Replace with your actual key

// --- Event Listeners ---

// Listen for tab updates to check URLs in real-time.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Ensure the URL is a valid, checkable URL.
    if (tab.url.startsWith('http')) {
      analyzeUrl(tabId, tab.url);
    }
  }
});

// Listen for messages from the popup or content scripts.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reportUrl') {
    handleUrlReport(request.url);
    sendResponse({ status: 'URL reported' });
  }
  return true;
});

// --- Core URL Analysis Logic ---

async function analyzeUrl(tabId, url) {
  try {
    // 1. Check if the URL is in the allowlist using the checker function.
    const isAllowed = await checker(url);
    if (isAllowed) {
      console.log(`URL is on the allowlist: ${url}`);
      return;
    }

    // 2. Perform multiple checks in parallel for efficiency.
    const [domainReputation, aiAnalysis, sslVerification] = await Promise.all([
      checkDomainReputation(url),
      getAIAnalysis(url),
      verifySsl(url)
    ]);

    // 3. Aggregate results and determine if the site is a threat.
    let isPhishing = false;
    let reasons = [];

    if (domainReputation.isBlacklisted) {
      isPhishing = true;
      reasons.push(`Domain is blacklisted by ${domainReputation.engine}.`);
    }

    if (aiAnalysis.isPhishing) {
      isPhishing = true;
      reasons.push(`AI analysis detected potential phishing activity: ${aiAnalysis.reason}`);
      console.log("AI analysis is working");
    }

    if (!sslVerification.isValid) {
      isPhishing = true;
      reasons.push(`SSL certificate is invalid or suspicious: ${sslVerification.error}`);
      console.log("SSL detection is working");
    }

    // 4. If a threat is detected, block the site and alert the user.
    if (isPhishing) {
      await blockAndAlert(tabId, url, reasons);
    }

  } catch (error) {
    console.error('Error analyzing URL:', error);
  }
}

// --- API Integrations & Checks ---

async function checkDomainReputation(url) {
  try {
    const hostname = new URL(url).hostname;
    const response = await fetch(`https://endpoint.apivoid.com/domainbl/v1/pay-as-you-go/?key=${APIVOID_API_KEY}&host=${hostname}`);
    const data = await response.json();

    if (data.data && data.data.report.blacklists.detections > 0) {
      return {
        isBlacklisted: true,
        engine: data.data.report.blacklists.engines[0].engine
      };
    }
    return { isBlacklisted: false };
  } catch (error) {
    console.error('Error with APIVoid:', error);
    return { isBlacklisted: false };
  }
}

async function getAIAnalysis(url) {
  try {
    const prompt = `Analyze the following URL for signs of phishing. Consider the domain name, subdomains, path, and query parameters. Is this URL likely to be a phishing attempt? Respond in JSON format with two keys: "isPhishing" (boolean) and "reason" (string, explaining your conclusion). URL: ${url}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText.replace(/```json|```/g, '').trim());
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    return { isPhishing: false, reason: "AI analysis could not be completed." };
  }
}

async function verifySsl(url) {
  try {
    if (!url.startsWith('https://')) {
      return { isValid: false, error: 'The site is not using HTTPS.' };
    }

    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      return { isValid: false, error: 'Could not establish a secure connection.' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Could not establish a secure connection. This could be due to an invalid SSL certificate.' };
  }
}

// --- User Actions & Notifications ---

async function blockAndAlert(tabId, url, reasons) {
  await chrome.storage.local.set({
    blockedSiteInfo: { url, reasons }
  });

  chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Phishing Site Blocked!',
    message: `PhishGuard AI has blocked access to a potentially malicious website: ${new URL(url).hostname}`,
    priority: 2
  });
}

async function handleUrlReport(url) {
  console.log(`URL reported by user: ${url}`);
  await addUrlToList(url, 'reported');
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'URL Reported',
    message: 'Thank you for helping to keep the web safe!',
    priority: 1
  });
}

// --- Utility Functions ---

async function addUrlToList(url, listName) {
  const data = await chrome.storage.local.get(listName);
  const list = data[listName] || [];
  const hostname = new URL(url).hostname;
  if (!list.includes(hostname)) {
    list.push(hostname);
    await chrome.storage.local.set({ [listName]: list });
  }
}

async function isUrlInList(url, listName) {
  const data = await chrome.storage.local.get(listName);
  const list = data[listName] || [];
  const hostname = new URL(url).hostname;
  return list.includes(hostname);
}

// Checker function to verify if the URL is in the allowlist
async function checker(url) {
  try {
    const data = await chrome.storage.local.get('allowlist');
    const allowlist = data.allowlist || [];
    const hostname = new URL(url).hostname;
    return allowlist.includes(hostname);
  } catch (error) {
    console.error('Error in checker function:', error);
    return false;
  }
}


////////...........................
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reportUrl') {
    handleUrlReport(request.url);
    sendResponse({ status: 'URL reported' });
  } else if (request.action === 'addToAllowlist') {
    addUrlToAllowlist(request.url);
    sendResponse({ status: 'URL added to allowlist' });
  } else if (request.action === 'reanalyzeUrl') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) analyzeUrl(tabs[0].id, request.url);
    });
    sendResponse({ status: 'URL reanalysis triggered' });
  }
  return true;
});