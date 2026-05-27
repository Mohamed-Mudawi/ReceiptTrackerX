import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

type Receipt = {
  id: string;
  merchantName?: string;
  total?: number;
  transactionDate?: string;
  status?: string;
};

export default function App() {
  const { instance, accounts } = useMsal();
  const [file, setFile] = useState<File | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getToken = async () => {
    const tokenResponse = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    return tokenResponse.accessToken;
  };

  const loadReceipts = async () => {
    setLoading(true);
    setMessage("Loading receipts...");

    const token = await getToken();

    const response = await fetch("http://localhost:5279/receipts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    setReceipts(data);
    setMessage("");
    setLoading(false);
  };

  const loadSummary = async () => {
    setLoading(true);
    setMessage("Loading summary...");

    const token = await getToken();

    const response = await fetch("http://localhost:5279/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    setSummary(JSON.stringify(data, null, 2));
    setMessage("");
    setLoading(false);
  };

  const uploadReceipt = async () => {
    if (!file) {
      setMessage("Choose an image first.");
      return;
    }

    setLoading(true);
    setMessage("Creating upload URL...");

    const token = await getToken();

    const sasResponse = await fetch("http://localhost:5279/uploads/sas", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const sasData = await sasResponse.json();

    setMessage("Uploading receipt image...");

    const uploadResponse = await fetch(sasData.uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "image/png",
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      setMessage("Upload failed.");
      setLoading(false);
      return;
    }

    setMessage("Uploaded. Processing receipt...");

    setTimeout(async () => {
      await loadReceipts();
      await loadSummary();
      setMessage("Done.");
      setLoading(false);
    }, 4000);
  };

  const logout = async () => {
    await instance.logoutRedirect();
  };

  if (accounts.length === 0) {
    return (
      <main style={{ padding: 32 }}>
        <h1>ReceiptTrackerX</h1>
        <button onClick={() => instance.loginRedirect(loginRequest)}>
          Log in with Microsoft
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 32, maxWidth: 900 }}>
      <h1>ReceiptTrackerX</h1>
      <p>Logged in as {accounts[0].username}</p>

      <section style={{ marginBottom: 24 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button onClick={uploadReceipt} disabled={loading}>
          Upload Receipt
        </button>

        <button onClick={loadReceipts} disabled={loading}>
          Refresh Receipts
        </button>

        <button onClick={loadSummary} disabled={loading}>
          Load Summary
        </button>

        <button onClick={logout}>Log out</button>
      </section>

      {message && <p>{message}</p>}

      {summary && (
        <section
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid gray",
            borderRadius: 8,
          }}
        >
          <h2>Summary</h2>
          <pre>{summary}</pre>
        </section>
      )}

      <h2>Receipts</h2>

      {receipts.length === 0 ? (
        <p>No receipts yet.</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td>{receipt.merchantName ?? "Unknown"}</td>
                <td>{receipt.total ?? "—"}</td>
                <td>{receipt.transactionDate ?? "—"}</td>
                <td>{receipt.status ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}