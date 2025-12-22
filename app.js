/* =========================================
   AE Coin (AEC) — Web3 Wallet & Buy USDT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------- CONFIG -------- */
  const CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL"; // AEC token
  const DECIMALS = 6;

  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT TRC20
  const TREASURY = "TTZyeQR1fBpmhn2Y4Pcrj2Nw3WpioRtScU";       // Wallet Treasury
  const RATE_USDT = 0.272; // 1 AEC = 1 AED ≈ 0.272 USDT

  let tronWeb, user;

  /* -------- WAIT TRONLINK INJECT -------- */
  async function waitForTronWeb() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(interval);
          resolve(window.tronWeb);
        }
      }, 300);
    });
  }

  /* -------- CONNECT WALLET -------- */
  async function connectWallet() {
    try {
      tronWeb = await waitForTronWeb();
      user = tronWeb.defaultAddress.base58;

      document.getElementById("walletStatus").innerText = "Connected";
      document.getElementById("walletAddress").innerText = user;

      loadBalance();
    } catch (err) {
      alert("TronLink / Trust Wallet not detected!");
      console.error(err);
    }
  }

  /* -------- LOAD AEC BALANCE -------- */
  async function loadBalance() {
    try {
      if (!tronWeb || !user) {
        document.getElementById("aecBalance").innerText = "Connect wallet first";
        return;
      }

      const contract = await tronWeb.contract().at(CONTRACT);
      const bal = await contract.balanceOf(user).call();

      document.getElementById("aecBalance").innerText =
        (bal / (10 ** DECIMALS)).toLocaleString(undefined, {minimumFractionDigits: 2});
    } catch (err) {
      console.error("Load balance error:", err);
      document.getElementById("aecBalance").innerText = "Error";
    }
  }

  /* -------- SEND AEC TOKEN -------- */
  async function sendToken() {
    const to = document.getElementById("sendTo").value;
    const amt = Number(document.getElementById("sendAmount").value);

    if (!to || amt <= 0) {
      alert("Invalid address or amount");
      return;
    }

    try {
      const contract = await tronWeb.contract().at(CONTRACT);
      await contract.transfer(to, amt * (10 ** DECIMALS)).send();

      document.getElementById("txStatus").innerText =
        "✅ Transaction sent!";
      loadBalance();
    } catch (err) {
      console.error(err);
      document.getElementById("txStatus").innerText =
        "❌ Transaction failed";
    }
  }

  /* -------- BUY AE COIN WITH USDT -------- */
  document.getElementById("buyAmount").addEventListener("input", () => {
    const aec = Number(document.getElementById("buyAmount").value || 0);
    document.getElementById("usdtAmount").innerText =
      (aec * RATE_USDT).toFixed(2);
  });

  document.getElementById("buyBtn").onclick = async () => {
    if (!tronWeb) {
      alert("Connect wallet first");
      return;
    }

    const aec = Number(document.getElementById("buyAmount").value);
    if (aec <= 0) return alert("Invalid amount");

    const totalUSDT = aec * RATE_USDT;

    try {
      document.getElementById("buyStatus").innerText = "Waiting for confirmation...";

      const usdt = await tronWeb.contract().at(USDT_CONTRACT);

      // Transfer USDT ke Treasury
      await usdt.transfer(TREASURY, tronWeb.toSun(totalUSDT)).send();

      document.getElementById("buyStatus").innerText =
        "✅ Purchase successful! USDT sent to treasury.";

      // Optional: Load balance AEC jika token dikirim otomatis
      loadBalance();

    } catch (err) {
      console.error(err);
      document.getElementById("buyStatus").innerText =
        "❌ Transaction cancelled or failed.";
    }
  };

  /* -------- INIT -------- */
  document.getElementById("connectBtn").onclick = connectWallet;
  document.getElementById("sendBtn").onclick = sendToken;
  document.getElementById("year").innerText = new Date().getFullYear();

});
<script src="app.js"></script>