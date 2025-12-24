/* =====================================================
   AE Coin (AEC) — SunSwap Swap (TronLink Only)
   FINAL CLEAN & STABLE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */
  const AEC_CONTRACT   = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
  const USDT_CONTRACT  = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const SUNSWAP_ROUTER = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";

  const DECIMALS = 6;

  let tronWeb = null;
  let userAddress = null;

  /* ================= ELEMENTS ================= */
  const connectBtn     = document.getElementById("connectBtn");
  const disconnectBtn  = document.getElementById("disconnectBtn");
  const walletStatus   = document.getElementById("walletStatus");
  const walletAddress  = document.getElementById("walletAddress");
  const aecBalance     = document.getElementById("aecBalance");

  const swapFromAmount = document.getElementById("swapFromAmount");
  const swapFromToken  = document.getElementById("swapFromToken");
  const swapToAmount   = document.getElementById("swapToAmount");
  const swapToToken    = document.getElementById("swapToToken");
  const swapBtn        = document.getElementById("swapBtn");
  const swapStatus     = document.getElementById("swapStatus");

  const year           = document.getElementById("year");

  /* ================= WALLET HELPERS ================= */
  async function waitTronLink() {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const timer = setInterval(() => {
        if (window.tronWeb && window.tronWeb.ready) {
          clearInterval(timer);
          resolve(window.tronWeb);
        }
        if (++tries > 20) {
          clearInterval(timer);
          reject();
        }
      }, 300);
    });
  }

  function requireWallet() {
    if (!tronWeb || !userAddress) {
      alert("Connect wallet first");
      return false;
    }
    return true;
  }

  /* ================= CONNECT ================= */
  async function connectWallet() {
    try {
      tronWeb = await waitTronLink();
      await tronWeb.request({ method: "tron_requestAccounts" });

      userAddress = tronWeb.defaultAddress.base58;
      if (!userAddress) throw 0;

      walletStatus.innerText = "Connected";
      walletAddress.innerText = userAddress;
      connectBtn.style.display = "none";
      disconnectBtn.style.display = "inline-block";

      loadBalance();

    } catch {
      alert("Please open with TronLink wallet");
    }
  }

  /* ================= DISCONNECT (UI) ================= */
  function disconnectWallet() {
    tronWeb = null;
    userAddress = null;

    walletStatus.innerText = "Not connected";
    walletAddress.innerText = "—";
    aecBalance.innerText = "—";

    connectBtn.style.display = "inline-block";
    disconnectBtn.style.display = "none";
  }

  /* ================= AUTO DISCONNECT ================= */
  if (window.tronWeb && window.tronWeb.on) {
    window.tronWeb.on("addressChanged", () => {
      disconnectWallet();
    });
  }

  /* ================= LOAD BALANCE ================= */
  async function loadBalance() {
    if (!requireWallet()) return;

    try {
      const contract = await tronWeb.contract().at(AEC_CONTRACT);
      const bal = await contract.balanceOf(userAddress).call();
      aecBalance.innerText =
        (Number(bal) / 10 ** DECIMALS).toLocaleString() + " AEC";
    } catch {
      aecBalance.innerText = "—";
    }
  }

  /* ================= PRICE ESTIMATE ================= */
  async function estimateSwap() {
    if (!tronWeb) return;

    const amount = Number(swapFromAmount.value);
    if (amount <= 0) {
      swapToAmount.value = "";
      return;
    }

    try {
      const router = await tronWeb.contract().at(SUNSWAP_ROUTER);

      const path =
        swapFromToken.value === "USDT"
          ? [USDT_CONTRACT, AEC_CONTRACT]
          : [AEC_CONTRACT, USDT_CONTRACT];

      const amountIn =
        swapFromToken.value === "USDT"
          ? amount * 1e6
          : amount * 10 ** DECIMALS;

      const result = await router
        .getAmountsOut(amountIn, path)
        .call();

      const out =
        swapToToken.value === "USDT"
          ? result[1] / 1e6
          : result[1] / 10 ** DECIMALS;

      swapToAmount.value = out.toFixed(6);

    } catch {
      swapToAmount.value = "";
    }
  }

  /* ================= SWAP ================= */
  async function swap() {
    if (!requireWallet()) return;

    const amount = Number(swapFromAmount.value);
    if (amount <= 0) return;

    try {
      swapStatus.innerText = "Approving...";

      const fromUSDT = swapFromToken.value === "USDT";
      const amountIn = fromUSDT
        ? amount * 1e6
        : amount * 10 ** DECIMALS;

      const tokenIn = fromUSDT ? USDT_CONTRACT : AEC_CONTRACT;
      const path = fromUSDT
        ? [USDT_CONTRACT, AEC_CONTRACT]
        : [AEC_CONTRACT, USDT_CONTRACT];

      const token = await tronWeb.contract().at(tokenIn);
      const router = await tronWeb.contract().at(SUNSWAP_ROUTER);

      await token.approve(SUNSWAP_ROUTER, amountIn).send();

      swapStatus.innerText = "Swapping...";

      await router.swapExactTokensForTokens(
        amountIn,
        0,
        path,
        userAddress,
        Math.floor(Date.now() / 1000) + 600
      ).send();

      swapStatus.innerText = "✅ Swap successful";
      loadBalance();

    } catch (err) {
      console.error(err);
      swapStatus.innerText = "❌ Swap failed";
    }
  }

  /* ================= EVENTS ================= */
  connectBtn.onclick    = connectWallet;
  disconnectBtn.onclick = disconnectWallet;
  swapBtn.onclick       = swap;

  swapFromAmount.oninput = estimateSwap;
  swapFromToken.onchange = estimateSwap;
  swapToToken.onchange   = estimateSwap;

  year.innerText = new Date().getFullYear();

});


/* =========================================
   COINGECKO TOP 100 ALTCOIN TICKER
   ========================================= */

async function loadTopCoinsTicker() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    );

    const coins = await res.json();
    const ticker = document.getElementById("tickerContent");

    ticker.innerHTML = ""; // kosongkan dulu

    coins.forEach(c => {
      const item = document.createElement("div");
      item.className = "ticker-item";
      item.innerHTML = `
        <img src="${c.image}" alt="${c.symbol}">
        ${c.symbol.toUpperCase()}
        <span>$${c.current_price.toLocaleString()}</span>
      `;
      ticker.appendChild(item);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("tickerContent").innerText =
      "Failed to load market data";
  }
}

/* LOAD SAAT PAGE DIBUKA */
loadTopCoinsTicker();

/* REFRESH SETIAP 2 MENIT (AMAN API) */
setInterval(loadTopCoinsTicker, 120000);


/* ===========================
   BACKGROUND MUSIC (FIXED)
=========================== */

document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("musicBtn");

  if (!music || !btn) {
    console.warn("Music element not found");
    return;
  }

  // setting awal
  music.volume = 0.25;
  music.muted = true;

  // 🔥 PAKSA PLAY (muted = boleh oleh browser)
  const tryPlay = () => {
    music.play().then(() => {
      console.log("Music autoplay success");
    }).catch(err => {
      console.warn("Autoplay blocked, waiting user interaction");
    });
  };

  tryPlay();

  // toggle mute / unmute
  btn.innerText = "🔇";
  btn.addEventListener("click", () => {
    music.muted = !music.muted;
    btn.innerText = music.muted ? "🔇" : "🔊";

    // pastikan play saat unmute
    if (!music.muted && music.paused) {
      music.play().catch(() => {});
    }
  });

  // fallback keras: klik apa saja di body
  document.body.addEventListener(
    "click",
    () => {
      if (music.paused) {
        music.play().catch(() => {});
      }
    },
    { once: true }
  );
});
document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bgMusic");
  const gate = document.getElementById("soundGate");
  const btn = document.getElementById("musicBtn");

  if (!music) return;

  music.volume = 0.25;
  music.muted = true;

  // play muted (izin browser)
  music.play().catch(() => {});

  // enable sound setelah klik
  if (gate) {
    gate.addEventListener("click", () => {
      music.muted = false;
      music.play().catch(() => {});
      gate.remove();
      if (btn) btn.innerText = "🔊";
    });
  }

  if (btn) {
    btn.addEventListener("click", () => {
      music.muted = !music.muted;
      btn.innerText = music.muted ? "🔇" : "🔊";
    });
  }
});

async function loadCryptoNews() {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/"
    );
    const data = await res.json();

    const container = document.getElementById("newsContainer");
    container.innerHTML = "";

    data.items.slice(0, 6).forEach(item => {
      container.innerHTML += `
        <div class="news-card">
          <h4>${item.title}</h4>
          <a href="${item.link}" target="_blank">Read more →</a>
        </div>
      `;
    });

  } catch (err) {
    console.error("News error:", err);
    document.getElementById("newsContainer").innerText =
      "Failed to load crypto news";
  }
}

/* LOAD SAAT PAGE DIBUKA */
loadCryptoNews();

/* AUTO REFRESH SETIAP 5 MENIT */
setInterval(loadCryptoNews, 300000);


/* ========= SUNSWAP SWAP BOX ========= */

const SUNSWAP_ROUTER = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax";
const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const AEC  = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";

async function getAmountsOut(amountIn, path) {
  const router = await tronWeb.contract().at(SUNSWAP_ROUTER);
  return await router.getAmountsOut(amountIn, path).call();
}

document.getElementById("swapFromAmount").addEventListener("input", async () => {
  if (!tronWeb || !userAddress) return;

  const amt = Number(document.getElementById("swapFromAmount").value);
  if (amt <= 0) return;

  const from = document.getElementById("swapFromToken").value;
  const to   = document.getElementById("swapToToken").value;

  const path =
    from === "USDT" ? [USDT, AEC] : [AEC, USDT];

  const decimals = from === "USDT" ? 6 : 6;
  const amountIn = Math.floor(amt * 10 ** decimals);

  try {
    const amounts = await getAmountsOut(amountIn, path);
    const out = amounts[1] / 10 ** decimals;
    document.getElementById("swapToAmount").value =
      out.toFixed(6);
  } catch {
    document.getElementById("swapToAmount").value = "-";
  }
});

/* ========= EXECUTE SWAP ========= */
document.getElementById("swapBtn").onclick = async () => {
  if (!tronWeb || !userAddress) {
    alert("Connect TronLink first");
    return;
  }

  const amt = Number(document.getElementById("swapFromAmount").value);
  if (amt <= 0) return;

  const from = document.getElementById("swapFromToken").value;
  const path =
    from === "USDT" ? [USDT, AEC] : [AEC, USDT];

  const tokenIn = await tronWeb.contract().at(path[0]);
  const router  = await tronWeb.contract().at(SUNSWAP_ROUTER);

  const amountIn = Math.floor(amt * 1e6);

  try {
    document.getElementById("swapStatus").innerText = "Approving...";

    await tokenIn.approve(SUNSWAP_ROUTER, amountIn).send();

    document.getElementById("swapStatus").innerText = "Swapping...";

    await router.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      userAddress,
      Math.floor(Date.now() / 1000) + 600
    ).send();

    document.getElementById("swapStatus").innerText = "✅ Swap successful";

  } catch (err) {
    console.error(err);
    document.getElementById("swapStatus").innerText =
      "❌ Swap failed or cancelled";
  }
};







