console.log(typeof ethers !== 'undefined' ? 'Ethers.js loaded successfully!' : 'Ethers.js is not defined!');


// Global variables
let provider;
let signer;
let contract;
const contractAddress = 'YOUR_CONTRACT_ADDRESS';  // Replace with your contract's address
const contractABI = [
    // Add your contract's ABI here (must include claimFaucet, checkEligibility, etc.)
];

// Initialize on window load
window.onload = function () {
    initialize();
};

// Initialize the app
async function initialize() {
    setupEventListeners();
}

// Event listeners for buttons
function setupEventListeners() {
    const connectWalletButton = document.getElementById('connectWallet');
    const claimFaucetButton = document.getElementById('claimFaucet');

    connectWalletButton.addEventListener('click', connectWallet);
    claimFaucetButton.addEventListener('click', claimTokens);
}

// Connect MetaMask Wallet
async function connectWallet() {
    const statusDisplay = document.getElementById('status');

    try {
        if (!window.ethereum) {
            statusDisplay.textContent = 'MetaMask is not installed. Please install MetaMask and refresh the page.';
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);

        signer = provider.getSigner();
        const walletAddress = await signer.getAddress();

        // Display wallet address and enable the claim button
        document.getElementById('walletAddress').textContent = `Wallet: ${walletAddress}`;
        document.getElementById('connectWallet').textContent = 'Wallet Connected';
        document.getElementById('claimFaucet').disabled = false;

        // Instantiate the contract
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Check eligibility to claim
        const isEligible = await contract.checkEligibility(walletAddress);
        if (!isEligible) {
            statusDisplay.textContent = 'You are not eligible to claim tokens yet. Try again later!';
        } else {
            statusDisplay.textContent = '';
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        statusDisplay.textContent = 'Failed to connect wallet. Please try again.';
    }
}

// Claim Faucet Tokens
async function claimTokens() {
    const statusDisplay = document.getElementById('status');

    try {
        statusDisplay.textContent = 'Processing transaction...';

        const tx = await contract.claimFaucet();
        await tx.wait();

        statusDisplay.textContent = 'Tokens claimed successfully!';
    } catch (error) {
        console.error('Transaction failed:', error);
        statusDisplay.textContent = 'Transaction failed. Please try again later.';
    }
}
