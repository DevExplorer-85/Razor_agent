'use client';

import { useState } from 'react';

const CODE_SNIPPETS = {
  python: {
    label: 'Python SDK / REST Client',
    filename: 'reconcile_client.py',
    code: `# Finance Controller Agent — Python REST API Integration
import requests

API_BASE = "http://localhost:8000"

# 1. Trigger Full Automated Reconciliation Engine
def run_reconciliation():
    response = requests.post(f"{API_BASE}/api/reconcile", json={"batch_id": "SETTL_2026_08"})
    report = response.json()
    
    print(f"Match Rate: {report['match_rate']}%")
    print(f"Total Matched Records: {report['total_matched']}")
    print(f"Validation Exceptions: {len(report['exceptions'])}")
    return report

# 2. Query AI Settlement Q&A Agent with Provenance
def ask_finance_agent(question: str):
    qa_res = requests.post(f"{API_BASE}/api/qa/query", json={
        "query": question,
        "n_context": 5
    })
    data = qa_res.json()
    print("AI Answer:", data["answer"])
    print("Source Records:", [p["id"] for p in data.get("provenance", [])])

if __name__ == "__main__":
    run_reconciliation()
    ask_finance_agent("Which settlements failed validation due to GSTIN mismatch?")`,
  },
  webhook: {
    label: 'Razorpay Webhook Handler',
    filename: 'webhook_server.py',
    code: `# FastAPI Webhook Endpoint for Automatic Ingestion & Trust Signature Check
from fastapi import FastAPI, Request, Header, HTTPException
import hmac, hashlib

app = FastAPI()
RAZORPAY_WEBHOOK_SECRET = "sec_live_984f18a204"

@app.post("/webhooks/razorpay")
async def handle_razorpay_webhook(request: Request, x_razorpay_signature: str = Header(...)):
    body = await request.body()
    
    # 1. Cryptographic Trust Verification
    expected_sig = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected_sig, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid cryptographic signature")

    payload = await request.json()
    event = payload.get("event")

    # 2. Ingest Settlement Event into Finance Controller Engine
    if event == "settlement.processed":
        settlement_id = payload["payload"]["settlement"]["entity"]["id"]
        amount = payload["payload"]["settlement"]["entity"]["amount"]
        print(f"Auto-ingesting Settlement {settlement_id} (₹{amount/100:.2f}) into Reconciliation Engine")

    return {"status": "success", "verified": True}`,
  },
  js: {
    label: 'JavaScript / Node.js API',
    filename: 'financeAgent.js',
    code: `// Finance Controller Agent Node.js / React Integration Client
const API_BASE = 'http://localhost:8000';

export async function executeTaxMatching() {
  const response = await fetch(\`\${API_BASE}/api/tax/match\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await response.json();
  console.log(\`Tax Match Rate: \${result.match_rate}%\`);
  console.log(\`Fake Invoices (GSTIN Mismatches): \${result.gstin_mismatches}\`);
  return result;
}

export async function fetch7DayCashForecast() {
  const response = await fetch(\`\${API_BASE}/api/forecast\`);
  const forecastData = await response.json();
  console.log(\`Clean Records Used: \${forecastData.clean_records}\`);
  console.log(\`Excluded Tainted Records: \${forecastData.excluded_records}\`);
  return forecastData;
}`,
  },
};

export default function DeveloperSDK() {
  const [activeTab, setActiveTab] = useState('python');
  const [copied, setCopied] = useState(false);

  const currentSnippet = CODE_SNIPPETS[activeTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="developer-sdk-section">
      <div className="section-title-wrapper">
        <span className="section-badge">Developer & API Platform</span>
        <h2>Integrate Finance Controller API & Webhooks</h2>
        <p>Connect your backend, Razorpay webhooks, and ERP pipelines into our autonomous reconciliation engine.</p>
      </div>

      <div className="code-window-card glassmorphism-panel">
        <div className="code-window-header">
          <div className="window-controls">
            <span className="control red"></span>
            <span className="control yellow"></span>
            <span className="control green"></span>
            <span className="filename-tag" style={{ color: '#FFB800' }}>{currentSnippet.filename}</span>
          </div>

          <div className="sdk-tabs">
            {Object.keys(CODE_SNIPPETS).map((key) => (
              <button
                key={key}
                className={`sdk-tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{
                  background: activeTab === key ? 'rgba(246, 133, 27, 0.2)' : 'transparent',
                  color: activeTab === key ? '#FFB800' : '#9CA3AF',
                  border: activeTab === key ? '1px solid rgba(246, 133, 27, 0.4)' : '1px solid transparent'
                }}
              >
                {CODE_SNIPPETS[key].label}
              </button>
            ))}
          </div>

          <button className="copy-code-btn" onClick={handleCopyCode} style={{ background: '#10B981', color: '#FFFFFF', fontWeight: '700' }}>
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="code-body" style={{ background: '#0D0E12' }}>
          <pre>
            <code style={{ color: '#E5E7EB', fontSize: '0.88rem', fontFamily: 'Fira Code, monospace' }}>
              {currentSnippet.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
