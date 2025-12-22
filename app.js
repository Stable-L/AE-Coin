/* ================================
   AE COIN — FIXED APP.JS
   ================================ */

const CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
const DECIMALS = 6;

let tronWeb, user;

/* WAIT TRONLINK INJECT */
function waitForTronWeb() {
  return new Promise(resolve => {
    const check = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        clearInterval(check);
        resolve(window.tronWeb);
      }
    }, 300);
  });
}

/* CONNECT WALLET */
async function connectWallet() {
  tronWeb = await waitForTronWeb();
  user = tronWeb.defaultAddress.base58;

  document.getElementById("walletStatus").innerText = "Connected";
  document.getElementById("walletAddress").innerText = user;

  loadBalance();
}

/* LOAD AEC BALANCE */
async function loadBalance() {
  const c = await tronWeb.contract().at(CONTRACT);
  const bal = await c.balanceOf(user).call();

  document.getElementById("aecBalance").innerText =
    bal / (10 ** DECIMALS);
}

/* SEND TOKEN */
async function sendToken() {
  const to = document.getElementById("sendTo").value;
  const amt = Number(document.getElementById("sendAmount").value);

  if (!to || amt <= 0) {
    alert("Invalid address or amount");
    return;
  }

  const c = await tronWeb.contract().at(CONTRACT);
  await c.transfer(
    to,
    amt * (10 ** DECIMALS)
  ).send();

  document.getElementById("txStatus").innerText =
    "✅ Transaction sent";
}

/* TICKER */
async function loadTicker() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20&page=1"
  );
  const data = await res.json();

  const el = document.getElementById("tickerContent");
  el.innerHTML = "";

  data.forEach(c => {
    el.innerHTML += `
      <div class="ticker-item">
        <img src="${c.image}" width="16">
        ${c.symbol.toUpperCase()} $${c.current_price}
      </div>
    `;
  });
}

/* NEWS */
async function loadNews() {
  const res = await fetch(
    "https://api.allorigins.win/raw?url=https://www.coindesk.com/arc/outboundfeeds/rss/"
  );
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");

  const box = document.getElementById("newsContainer");
  box.i

