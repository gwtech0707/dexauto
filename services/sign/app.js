const API = "/services/sign/api";

let provider, signer, account, signData;
let lastSignature = null;
let lastTypedPayload = null;

/* 接続 */
document.getElementById("connect").onclick = async () => {

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  account = await signer.getAddress();

  document.getElementById("account").innerText = account;

  /* backendから署名データ取得 */
  const res = await fetch(`${API}/sign-data?owner=${account}`);
  signData = await res.json();

  showPreview();
};

/* 表示 */
function showPreview() {
  document.getElementById("preview").innerText =
    JSON.stringify(signData, null, 2);
}

/* 署名 */
document.getElementById("sign").onclick = async () => {

  const domain = {
    name: "EIP7702Authorization",
    version: "1",
    chainId: signData.chainId
  };

  const types = {
    Authorization: [
      { name: "chainId", type: "uint256" },
      { name: "contractAddress", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "maxAmount", type: "uint256" },
      { name: "to", type: "address" },
      { name: "data", type: "bytes" },
      { name: "value", type: "uint256" }
    ]
  };

  try {

    const signature = await signer.signTypedData(
      domain,
      types,
      signData
    );

    lastSignature = signature;
    lastTypedPayload = {
      domain,
      types,
      message: signData
    };

    document.getElementById("result").innerText =
      JSON.stringify({ signature }, null, 2);

    await fetch(`${API}/save-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature,
        message: JSON.stringify(lastTypedPayload)
      })
    });

  } catch (e) {
    document.getElementById("result").innerText = e.message;
  }
};

/* 実行リクエスト作成(承認待ち) */
document.getElementById("requestExecute").onclick = async () => {
  try {
    if (!signData || !lastSignature || !lastTypedPayload) {
      document.getElementById("result").innerText = "先に署名してください";
      return;
    }

    const amount = document.getElementById("amount").value.trim();
    if (!amount) {
      document.getElementById("result").innerText = "amountを入力してください";
      return;
    }

    const res = await fetch(`${API}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: signData.authId,
        amount,
        signature: lastSignature,
        message: lastTypedPayload
      })
    });

    const data = await res.json();
    document.getElementById("result").innerText = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById("result").innerText = e.message;
  }
};
