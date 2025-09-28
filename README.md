# PhishGuard AI - AI-Powered Phishing Detection Browser Extension

PhishGuard AI is an advanced browser extension designed to actively detect and block phishing websites in real-time. It provides a robust security layer for users by integrating multiple detection mechanisms, including AI-based URL analysis, domain reputation checks, and SSL verification. 

## ✨ Key Features

  * **Multi-Layered Protection:** Employs a three-pronged approach for high-accuracy threat detection:
      * **AI-Powered URL Analysis:** Utilizes the Gemini API to analyze URLs for sophisticated phishing patterns and zero-day threats. 
      * **Domain Reputation Checks:** Integrates with the APIVoid API to check URLs against known blacklists of malicious domains. 
      * **SSL Certificate Verification:** Ensures websites are using secure HTTPS connections and flags sites with invalid SSL certificates. 
  * **Real-Time Monitoring:** The extension's background service worker actively monitors URLs as you browse, analyzing them in real-time without impacting performance. 
  * **Intuitive User Interface:** A clean and simple popup allows users to view their protection status, report suspicious sites, and manage a personal allowlist. 
  * **Clear Warning & Blocking:** When a threat is detected, the user is redirected to a clear, informative blocked page detailing the URL and the specific reasons for the block. 
  * **User-Managed Allowlist:** Provides full control to the user (or an administrator/parent) to add, view, and remove trusted domains from an allowlist, bypassing the scanner for those sites. 
  * **Low Performance Overhead:** Designed to be lightweight, with an average URL check time of under 500ms and minimal CPU and memory usage. 

## 🚀 How It Works

The extension operates on a modular architecture built on Chrome's Manifest V3 framework. 

1.  **URL Interception:** The `background.js` service worker listens for tab updates and intercepts new URLs as they are loading.
2.  **Allowlist Check:** It first checks if the domain is on the user's allowlist. If so, the analysis is skipped.
3.  **Parallel Analysis:** For unknown URLs, it performs three checks in parallel for maximum efficiency:
      * It queries the **APIVoid API** to check the domain's reputation.
      * It sends a carefully crafted prompt with the URL to the **Gemini API** for an AI-based phishing assessment.
      * It verifies the site's **SSL/TLS certificate** to ensure a secure connection.
4.  **Blocking Action:** If any of the checks flag the URL as a potential threat, the extension triggers the `blockAndAlert` function. This saves the malicious URL and the reasons for the block to local storage and redirects the user to the `blocked.html` page.
5.  **User Interaction:** The `content.js` script populates the `blocked.html` page with the relevant details. The user can then choose to go back to safety or proceed to the site (which automatically adds it to the allowlist). The popup interface (`popup2.html` and `popup2.js`) handles user actions like reporting and manual allowlist management.

## 🛠️ Tech Stack

  * **Framework:** Chrome Extension Manifest V3 
  * **Core Logic:** JavaScript 
  * **APIs:**
      * Google Gemini API for AI-based analysis 
      * APIVoid API for domain blacklist reputation 
      * Chrome Extension API (`tabs`, `storage`, `notifications`, `webRequest`)
  * **Frontend:** HTML5 & CSS3

## 📸 Screenshots

**Popup Interface**
*The popup allows users to report sites and manage their allowlist.* 
**Blocked Page**
*A clear warning page is displayed when a phishing attempt is detected, showing the URL and the reasons.* 

## ⚙️ Installation and Setup

To install and run this extension locally:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/PhishGuard-AI.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd PhishGuard-AI
    ```
3.  **Add API Keys:**
      * Open the `background.js` file.
      * Replace the placeholder values for `APIVOID_API_KEY` and `GEMINI_API_KEY` with your actual API keys.
4.  **Load the extension in Chrome:**
      * Open Google Chrome and navigate to `chrome://extensions`.
      * Enable **"Developer mode"** using the toggle in the top-right corner.
      * Click on the **"Load unpacked"** button.
      * Select the cloned `PhishGuard-AI` project folder.

The extension icon should now appear in your browser's toolbar.

## 📂 Project Structure

```
PhishGuard-AI/
│
├── manifest.json         # Configures the extension, permissions, and scripts
├── background.js         # Core service worker for URL analysis and API calls
├── popup.html            # Main popup window (entry point)
├── popup2.html           # Secondary popup for admin/allowlist functionality
├── popup2.js             # Handles logic for the popup interface
├── blocked.html          # The warning page shown to users for blocked sites
├── content.js            # Injected script to manage the blocked page content
├── style.css             # Styles for the popup and blocked page
└── icons/                # Extension icons (16x16, 48x48, 128x128)
```

## ⚠️ Limitations

  * **API Dependency:** The extension's functionality relies on external APIs (Google Gemini and APIVoid). 
  * **Browser Specific:** Currently developed and tested for Google Chrome and Chromium-based browsers only. 
  * **Potential False Positives:** While highly accurate, the AI analysis may occasionally produce false positives. 

## 🔮 Future Enhancements

  * **Cross-Browser Support:** Adapt the extension to work with other browsers like Firefox and Edge.
  * **Local AI Models:** Explore the use of local, on-device AI models to reduce dependency on external APIs and improve privacy. 
  * **Advanced Heuristics:** Implement additional heuristic checks to further improve the detection of zero-day phishing attacks. 

## 👨‍💻 Authors

This project was developed by:

  * Tejas Santosh Paithankar (24BCY10104) 
  * Ashwin C (24BCY10218)
  * Sudhanshu Singh (24BCY10410)
  * Aashish Kumar Singh (24BCY10182) 
  * Niyati Agarwal (24BCY10293)  
