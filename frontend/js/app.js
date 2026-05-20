/**
 * Frontend Application Logic for ManualToken
 * Uses ethers.js v6 (injected globally via CDN script in app.html as `ethers`)
 */

// Application State
const appState = {
    provider: null,
    signer: null,
    contract: null,
    userAddress: null,
    tokenDecimals: 18 // Default, will update after fetch
};

// UI Elements
const ui = {
    btnConnect: document.getElementById('connect-wallet-btn'),
    badgeNetwork: document.getElementById('network-badge'),

    valName: document.getElementById('token-name'),
    valSymbol: document.getElementById('token-symbol'),
    valSupply: document.getElementById('token-supply'),
    valBalance: document.getElementById('user-balance'),

    formTransfer: document.getElementById('transfer-form'),
    formApprove: document.getElementById('approve-form'),
    formTransferFrom: document.getElementById('transferFrom-form'),

    btnTransfer: document.getElementById('transfer-btn'),
    btnApprove: document.getElementById('approve-btn'),
    btnTransferFrom: document.getElementById('transferFrom-btn'),

    notificationArea: document.getElementById('notification-area')
};

/**
 * Initializes the application by checking for an injected provider
 */
async function initApp() {
    console.log("Initializing App...");

    if (window.ethereum) {
        // Setup Ethers v6 Provider pointing to MetaMask/Injected
        appState.provider = new ethers.BrowserProvider(window.ethereum);

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

        try {
            // Check if already connected
            const accounts = await appState.provider.listAccounts();
            if (accounts.length > 0) {
                await connectWallet();
            } else {
                // Read-only contract instantiation
                appState.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, TOKEN_ABI, appState.provider);
                await fetchTokenMeta();
            }
        } catch (error) {
            console.error("Initialization check failed:", error);
        }
    } else {
        showNotification("Please install MetaMask or a compatible Web3 wallet.", "error");
        disableForms();
    }

    // Bind Event Listeners
    ui.btnConnect.addEventListener('click', connectWallet);
    ui.formTransfer.addEventListener('submit', handleTransfer);
    ui.formApprove.addEventListener('submit', handleApprove);
    ui.formTransferFrom.addEventListener('submit', handleTransferFrom);
}

/**
 * Connects the wallet and updates UI and internal state
 */
async function connectWallet() {
    try {
        if (!window.ethereum) throw new Error("No crypto wallet found");

        showNotification("Connecting to wallet...", "info");

        // Request account access
        await appState.provider.send("eth_requestAccounts", []);
        appState.signer = await appState.provider.getSigner();
        appState.userAddress = await appState.signer.getAddress();

        // Connect contract with signer for write operations
        appState.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, TOKEN_ABI, appState.signer);

        // Update UI
        const network = await appState.provider.getNetwork();
        const chainId = Number(network.chainId);
        const networkName = CONFIG.NETWORKS[chainId] || `Chain ID: ${chainId}`;

        ui.badgeNetwork.textContent = `${shortenAddress(appState.userAddress)} | ${networkName}`;
        ui.badgeNetwork.classList.add('connected');
        ui.btnConnect.style.display = 'none';

        await fetchTokenMeta();
        await fetchUserBalance();

        showNotification("Wallet connected successfully!", "success");
        setTimeout(() => hideNotification(), 3000);

    } catch (error) {
        console.error("Connection Error:", error);
        showNotification(error.message || "Failed to connect wallet.", "error");
    }
}

/**
 * Handles account switching from MetaMask
 * @param {Array} accounts 
 */
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // Disconnected
        window.location.reload();
    } else if (accounts[0] !== appState.userAddress) {
        appState.userAddress = ethers.getAddress(accounts[0]);
        appState.signer = await appState.provider.getSigner();
        appState.contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, TOKEN_ABI, appState.signer);

        ui.badgeNetwork.textContent = `${shortenAddress(appState.userAddress)}`;
        await fetchUserBalance();
        showNotification("Account switched.", "info");
        setTimeout(() => hideNotification(), 3000);
    }
}

/**
 * Fetches and displays token metadata (Name, Symbol, Decimals, Total Supply)
 */
async function fetchTokenMeta() {
    try {
        if (!appState.contract) return;

        const [name, symbol, decimals, totalSupply] = await Promise.all([
            appState.contract.name(),
            appState.contract.symbol(),
            appState.contract.decimals(),
            appState.contract.totalSupply()
        ]);

        appState.tokenDecimals = Number(decimals);

        ui.valName.textContent = name;
        ui.valSymbol.textContent = symbol;
        ui.valSupply.textContent = ethers.formatUnits(totalSupply, appState.tokenDecimals);

    } catch (error) {
        console.error("Error fetching meta:", error);
        ui.valName.textContent = "Error";
    }
}

/**
 * Fetches and displays the connected user's token balance
 */
async function fetchUserBalance() {
    try {
        if (!appState.contract || !appState.userAddress) return;

        const balance = await appState.contract.balanceOf(appState.userAddress);
        ui.valBalance.textContent = ethers.formatUnits(balance, appState.tokenDecimals);

    } catch (error) {
        console.error("Error fetching balance:", error);
        ui.valBalance.textContent = "Error";
    }
}

/**
 * Executes a token transfer
 * @param {Event} e 
 */
async function handleTransfer(e) {
    e.preventDefault();
    if (!requireConnection()) return;

    const to = document.getElementById('transfer-to').value.trim();
    const amount = document.getElementById('transfer-amount').value.trim();

    try {
        setButtonLoading(ui.btnTransfer, true);
        showNotification("Initiating transfer...", "info");

        const parsedAmount = ethers.parseUnits(amount, appState.tokenDecimals);

        const tx = await appState.contract.transfer(to, parsedAmount);
        showNotification(`Transaction pending: ${tx.hash}`, "info");

        await tx.wait();

        showNotification("Transfer successful!", "success");
        e.target.reset();
        await fetchUserBalance();

    } catch (error) {
        console.error("Transfer Error:", error);
        showNotification(extractErrorMessage(error), "error");
    } finally {
        setButtonLoading(ui.btnTransfer, false, "Send MTK");
    }
}

/**
 * Executes an approval transaction
 * @param {Event} e 
 */
async function handleApprove(e) {
    e.preventDefault();
    if (!requireConnection()) return;

    const spender = document.getElementById('approve-spender').value.trim();
    const amount = document.getElementById('approve-amount').value.trim();

    try {
        setButtonLoading(ui.btnApprove, true);
        showNotification("Initiating approval...", "info");

        const parsedAmount = ethers.parseUnits(amount, appState.tokenDecimals);

        const tx = await appState.contract.approve(spender, parsedAmount);
        showNotification(`Transaction pending: ${tx.hash}`, "info");

        await tx.wait();

        showNotification("Approval successful!", "success");
        e.target.reset();

    } catch (error) {
        console.error("Approve Error:", error);
        showNotification(extractErrorMessage(error), "error");
    } finally {
        setButtonLoading(ui.btnApprove, false, "Approve");
    }
}

/**
 * Executes a delegated transfer (transferFrom)
 * @param {Event} e 
 */
async function handleTransferFrom(e) {
    e.preventDefault();
    if (!requireConnection()) return;

    const from = document.getElementById('transferFrom-from').value.trim();
    const to = document.getElementById('transferFrom-to').value.trim();
    const amount = document.getElementById('transferFrom-amount').value.trim();

    try {
        setButtonLoading(ui.btnTransferFrom, true);
        showNotification("Initiating delegated transfer...", "info");

        const parsedAmount = ethers.parseUnits(amount, appState.tokenDecimals);

        const tx = await appState.contract.transferFrom(from, to, parsedAmount);
        showNotification(`Transaction pending: ${tx.hash}`, "info");

        await tx.wait();

        showNotification("Delegated transfer successful!", "success");
        e.target.reset();
        await fetchUserBalance();

    } catch (error) {
        console.error("TransferFrom Error:", error);
        showNotification(extractErrorMessage(error), "error");
    } finally {
        setButtonLoading(ui.btnTransferFrom, false, "Transfer From");
    }
}

/**
 * Helper: Validates if wallet is connected before an action
 */
function requireConnection() {
    if (!appState.signer) {
        showNotification("Please connect your wallet first.", "error");
        return false;
    }
    return true;
}

/**
 * Helper: Disables form buttons if wallet not found
 */
function disableForms() {
    ui.btnTransfer.disabled = true;
    ui.btnApprove.disabled = true;
    ui.btnTransferFrom.disabled = true;
}

/**
 * Helper: Shows a notification message
 * @param {string} msg 
 * @param {string} type - 'success', 'error', 'info'
 */
function showNotification(msg, type) {
    ui.notificationArea.textContent = msg;
    ui.notificationArea.className = `notification ${type}`;
    ui.notificationArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideNotification() {
    ui.notificationArea.className = 'notification hidden';
}

/**
 * Helper: Sets button loading state
 * @param {HTMLElement} btn 
 * @param {boolean} isLoading 
 * @param {string} originalText 
 */
function setButtonLoading(btn, isLoading, originalText = "") {
    if (isLoading) {
        btn.disabled = true;
        btn.textContent = "Processing...";
    } else {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Helper: Extracts user-friendly error message from ethers errors
 * @param {Error} error 
 * @returns {string}
 */
function extractErrorMessage(error) {
    if (error.reason) return error.reason;
    if (error.info && error.info.error && error.info.error.message) return error.info.error.message;
    if (error.message) {
        // Ethers v6 errors can be very verbose, try to extract the core revert reason if possible
        const revertMatch = error.message.match(/execution reverted: (.*?)"/);
        if (revertMatch) return revertMatch[1];

        // Handle user rejection
        if (error.message.includes("user rejected") || error.message.includes("User denied")) return "Transaction was rejected by the user.";

        return "An error occurred. See console for details.";
    }
    return "Unknown error occurred.";
}

/**
 * Helper: Shortens an Ethereum address for display
 * @param {string} address 
 * @returns {string}
 */
function shortenAddress(address) {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', initApp);
