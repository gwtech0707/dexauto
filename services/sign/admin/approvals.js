const API = "/services/sign/api";
const $ = (id) => document.getElementById(id);
const out = (v) => ($("out").textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2));

let currentRows = [];
let selectedRequestId = null;
let currentMeta = {};

function shortAddr(a) {
  if (!a || typeof a !== "string") return "-";
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "x-admin-token": $("adminToken").value.trim(),
  };
}

function renderTable(rows) {
  const body = $("pendingBody");
  body.innerHTML = "";

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="9" class="muted">承認待ちはありません</td></tr>`;
    return;
  }

  const payer = currentMeta?.payerAddress || "-";

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const token = r.tokenSymbol || (r.token ? "UNKNOWN" : "ETH");
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "-";
    const amountBase = r.max_amount ?? "∞";

    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.auth_id}</td>
      <td>${token}</td>
      <td title="${r.owner}">${shortAddr(r.owner)}</td>
      <td title="${payer}">${shortAddr(payer)}</td>
      <td title="${r.contract_address || ""}">${shortAddr(r.contract_address || "-")}</td>
      <td>${amountBase}</td>
      <td>${date}</td>
      <td class="actions"><button data-id="${r.id}">詳細</button></td>
    `;

    body.appendChild(tr);
  });

  body.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.getAttribute("data-id"));
      openDetail(id);
    };
  });
}

function openDetail(id) {
  const row = currentRows.find((r) => Number(r.id) === Number(id));
  if (!row) return;

  selectedRequestId = Number(id);
  $("detailModal").style.display = "flex";
  $("approveAmount").value = row.amount && row.amount !== "0" ? row.amount : "";

  const tokenKey = (row.token || "").toLowerCase();
  const tokenMeta = currentMeta?.tokenBalances?.[tokenKey];
  const tokenSym = row.tokenSymbol || (row.token ? "UNKNOWN" : "ETH");
  const tokenBal = tokenKey ? (tokenMeta?.formatted ?? "-") : "-";
  const ethBal = currentMeta?.payerEthBalance ?? "-";
  const payer = currentMeta?.payerAddress || "-";

  $("detailMeta").innerHTML = `
    <b>owner:</b> ${row.owner}<br>
    <b>contract:</b> ${row.contract_address || "-"}<br>
    <b>token:</b> ${tokenSym}<br>
    <b>PAYER (Rayer):</b> ${payer}
  `;

  $("payerBalance").innerHTML = `
    <b>ETH:</b> ${ethBal}<br>
    <b>USDT:</b> ${tokenSym === "USDT" ? tokenBal : "-"}
  `;

  let msgObj = row.message;
  try {
    if (typeof msgObj === "string") msgObj = JSON.parse(msgObj);
  } catch (_) {}

  $("detailJson").textContent = JSON.stringify(msgObj, null, 2);
}

async function loadPending() {
  try {
    const res = await fetch(`${API}/execute/pending`, { headers: headers() });
    const data = await res.json();

    if (!res.ok || !data.success) {
      out(data);
      renderTable([]);
      return;
    }

    currentRows = data.data || [];
    currentMeta = data.meta || {};
    renderTable(currentRows);
  } catch (e) {
    out(e.message);
  }
}

$("approveBtn").onclick = async () => {
  try {
    if (!selectedRequestId) {
      out("先に詳細を開いてください");
      return;
    }

    const amount = $("approveAmount").value.trim();

    const res = await fetch(`${API}/execute/approve`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ requestId: selectedRequestId, amount }),
    });

    const data = await res.json();
    out(data);

    if (data.success) {
      $("detailModal").style.display = "none";
      selectedRequestId = null;
      await loadPending();
    }
  } catch (e) {
    out(e.message);
  }
};

$("closeModal").onclick = () => {
  $("detailModal").style.display = "none";
};

$("detailModal").onclick = (e) => {
  if (e.target.id === "detailModal") {
    $("detailModal").style.display = "none";
  }
};

$("loadPending").onclick = loadPending;
