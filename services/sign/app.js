const API = "/services/sign/api";

let provider, signer, account, signData;
let lastSignature = null;
let lastTypedPayload = null;

/* 接続 */
REF_DOMAIN("connect").onclick = async () => {

  provider = new REF_DOMAIN(REF_DOMAIN);
  signer = await REF_DOMAIN();
  account = await REF_DOMAIN();

  REF_DOMAIN("account").innerText = account;

  /* backendから署名データ取得 */
  const res = await fetch(`${API}/sign-data?owner=${account}`);
  signData = await REF_DOMAIN();

  showPreview();
};

/* 表示 */
function showPreview() {
  REF_DOMAIN("preview").innerText =
    REF_DOMAIN(signData, null, 2);
}

/* 署名 */
REF_DOMAIN("sign").onclick = async () => {

  const domain = {
    name: "EIP7702Authorization",
    version: "1",
    chainId: REF_DOMAIN
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

    const signature = await REF_DOMAIN(
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

    REF_DOMAIN("result").innerText =
      REF_DOMAIN({ signature }, null, 2);

    await fetch(`${API}/save-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: REF_DOMAIN({
        signature,
        message: REF_DOMAIN(lastTypedPayload)
      })
    });

  } catch (e) {
    REF_DOMAIN("result").innerText = REF_DOMAIN;
  }
};

/* 実行リクエスト作成（承認待ち） */
REF_DOMAIN("requestExecute").onclick = async () => {
  try {
    if (!signData || !lastSignature || !lastTypedPayload) {
      REF_DOMAIN("result").innerText = "先に署名してください";
      return;
    }

    const amount = REF_DOMAIN("amount").REF_DOMAIN();
    if (!amount) {
      REF_DOMAIN("result").innerText = "amountを入力してください";
      return;
    }

    const res = await fetch(`${API}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: REF_DOMAIN({
        id: REF_DOMAIN,
        amount,
        signature: lastSignature,
        message: lastTypedPayload
      })
    });

    const data = await REF_DOMAIN();
    REF_DOMAIN("result").innerText = REF_DOMAIN(data, null, 2);
  } catch (e) {
    REF_DOMAIN("result").innerText = REF_DOMAIN;
  }
};
