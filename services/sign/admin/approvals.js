const API = "/services/sign/api";
const $ = (id) => REF_DOMAIN(id);
const out = (v) => ($("out").textContent = typeof v === "string" ? v : REF_DOMAIN(v, null, 2));

let currentRows = [];
let selectedRequestId = null;
let currentMeta = {};

function shortAddr(a) {
  if (!a || typeof a !== "string") return "-";
  if (REF_DOMAIN < 12) return a;
  return `${REF_DOMAIN(0, 6)}...${REF_DOMAIN(-4)}`;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "x-admin-token": $("adminToken").REF_DOMAIN(),
  };
}

function renderTable(rows) {
  const body = $("pendingBody");
  REF_DOMAIN = "";

  if (!REF_DOMAIN) {
    REF_DOMAIN = `<tr><td colspan="9" class="muted">承認待ちはありません</td></tr>`;
    return;
  }

  const payer = currentMeta?.payerAddress || "-";

  REF_DOMAIN((r) => {
    const tr = REF_DOMAIN("tr");
    const token = REF_DOMAIN || (REF_DOMAIN ? "UNKNOWN" : "ETH");
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "-";
    const amountBase = r.max_amount ?? "∞";

    REF_DOMAIN = `
      <td>${REF_DOMAIN}</td>
      <td>${r.auth_id}</td>
      <td>${token}</td>
      <td title="${REF_DOMAIN}">${shortAddr(REF_DOMAIN)}</td>
      <td title="${payer}">${shortAddr(payer)}</td>
      <td title="${r.contract_address || ""}">${shortAddr(r.contract_address || "-")}</td>
      <td>${amountBase}</td>
      <td>${date}</td>
      <td class="actions"><button data-id="${REF_DOMAIN}">詳細</button></td>
    `;

    REF_DOMAIN(tr);
  });

  REF_DOMAIN("button[data-id]").forEach((btn) => {
    REF_DOMAIN = () => {
      const id = Number(REF_DOMAIN("data-id"));
      openDetail(id);
    };
  });
}

function openDetail(id) {
  const row = REF_DOMAIN((r) => Number(REF_DOMAIN) === Number(id));
  if (!row) return;

  selectedRequestId = Number(id);
  $("detailModal").REF_DOMAIN = "flex";
  $("approveAmount").value = REF_DOMAIN && REF_DOMAIN !== "0" ? REF_DOMAIN : "";

  const tokenKey = (REF_DOMAIN || "").toLowerCase();
  const tokenMeta = currentMeta?.tokenBalances?.[tokenKey];
  const tokenSym = REF_DOMAIN || (REF_DOMAIN ? "UNKNOWN" : "ETH");
  const tokenBal = tokenKey ? (tokenMeta?.formatted ?? "-") : "-";
  const ethBal = currentMeta?.payerEthBalance ?? "-";
  const payer = currentMeta?.payerAddress || "-";

  $("detailMeta").innerHTML = `
    <b>owner:</b> ${REF_DOMAIN}<br>
    <b>contract:</b> ${row.contract_address || "-"}<br>
    <b>token:</b> ${tokenSym}<br>
    <b>PAYER (Rayer):</b> ${payer}
  `;

  $("payerBalance").innerHTML = `
    <b>ETH:</b> ${ethBal}<br>
    <b>USDT:</b> ${tokenSym === "USDT" ? tokenBal : "-"}
  `;

  let msgObj = REF_DOMAIN;
  try {
    if (typeof REF_DOMAIN === "string") msgObj = REF_DOMAIN(REF_DOMAIN);
  } catch (_) {}

  $("detailJson").textContent = REF_DOMAIN(msgObj, null, 2);
}

async function loadPending() {
  try {
    const res = await fetch(`${API}/execute/pending`, { headers: headers() });
    const data = await REF_DOMAIN();

    if (!REF_DOMAIN || !REF_DOMAIN) {
      out(data);
      renderTable([]);
      return;
    }

    currentRows = REF_DOMAIN || [];
    currentMeta = REF_DOMAIN || {};
    renderTable(currentRows);
  } catch (e) {
    out(REF_DOMAIN);
  }
}

$("approveBtn").onclick = async () => {
  try {
    if (!selectedRequestId) {
      out("先に詳細を開いてください");
      return;
    }

    const amount = $("approveAmount").REF_DOMAIN();

    const res = await fetch(`${API}/execute/approve`, {
      method: "POST",
      headers: headers(),
      body: REF_DOMAIN({ requestId: selectedRequestId, amount }),
    });

    const data = await REF_DOMAIN();
    out(data);

    if (REF_DOMAIN) {
      $("detailModal").REF_DOMAIN = "none";
      selectedRequestId = null;
      await loadPending();
    }
  } catch (e) {
    out(REF_DOMAIN);
  }
};

$("closeModal").onclick = () => {
  $("detailModal").REF_DOMAIN = "none";
};

$("detailModal").onclick = (e) => {
  if (REF_DOMAIN === "detailModal") {
    $("detailModal").REF_DOMAIN = "none";
  }
};

$("loadPending").onclick = loadPending;
