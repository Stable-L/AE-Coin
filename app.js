const CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
const DECIMALS = 6;

let tronWeb, user;

async function connectWallet(){
  if(window.tronWeb && tronWeb.ready){
    tronWeb = window.tronWeb;
    user = tronWeb.defaultAddress.base58;
    document.getElementById("walletStatus").innerText = "Connected";
    document.getElementById("walletAddress").innerText = user;
    loadBalance();
  }else{
    alert("Please install TronLink or Trust Wallet");
  }
}

async function loadBalance(){
  const c = await tronWeb.contract().at(CONTRACT);
  const bal = await c.balanceOf(user).call();
  document.getElementById("aecBalance").innerText =
    bal / (10**DECIMALS);
}

async function sendToken(){
  const to = document.getElementById("sendTo").value;
  const amt = document.getElementById("sendAmount").value;
  const c = await tronWeb.contract().at(CONTRACT);
  await c.transfer(to, amt * (10**DECIMALS)).send();
}

async function loadTicker(){
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
  );
  const data = await res.json();
  const el = document.getElementById("tickerContent");
  el.innerHTML="";
  data.forEach(c=>{
    el.innerHTML += `
      <div class="ticker-item">
        <img src="${c.image}">
        ${c.symbol.toUpperCase()} $${c.current_price}
      </div>
    `;
  });
}

async function loadNews(){
  const res = await fetch(
    "https://api.allorigins.win/raw?url=https://www.coindesk.com/arc/outboundfeeds/rss/"
  );
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text,"text/xml");
  const items = xml.querySelectorAll("item");
  const box = document.getElementById("newsContainer");
  box.innerHTML="";
  items.forEach((i,n)=>{
    if(n<5){
      box.innerHTML += `
        <div class="card">
          <a href="${i.querySelector("link").textContent}" target="_blank">
            ${i.querySelector("title").textContent}
          </a>
        </div>`;
    }
  });
}

document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("sendBtn").onclick = sendToken;
document.getElementById("year").innerText = new Date().getFullYear();

loadTicker();
loadNews();
