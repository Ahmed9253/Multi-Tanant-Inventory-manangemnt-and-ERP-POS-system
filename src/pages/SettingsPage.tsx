import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";

export function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [storeName, setStoreName] = useState(settings.storeName);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRate, setTaxRate] = useState(String(Math.round(settings.taxRate * 100)));

  const handleSave = () => {
    void updateSettings({
      storeName: storeName.trim() || "WorkNest",
      currency: currency.trim() || "$",
      taxRate: Math.max(0, Math.min(1, Number(taxRate) / 100 || 0)),
    });
  };

  return (
    <main className="module-page settings-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">CONFIGURATION</p>
          <h1>Settings</h1>
          <p className="subheading">
            Tune your workspace identity, currency, and tax rate.
          </p>
        </div>
      </div>
      <section className="settings-card">
        <div className="settings-section">
          <p className="eyebrow">STORE IDENTITY</p>
          <h2>Branding</h2>
          <label>
            Store name
            <input
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="WorkNest"
            />
          </label>
          <label>
            Currency symbol
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="$"
              maxLength={3}
            />
          </label>
        </div>
        <div className="settings-section">
          <p className="eyebrow">TAX</p>
          <h2>Sales tax</h2>
          <label>
            Tax rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              placeholder="8"
            />
          </label>
          <p className="settings-hint">
            Applied to every order subtotal at checkout. Stored in MongoDB so it
            persists across devices.
          </p>
        </div>
        <Button onClick={handleSave} className="settings-save">
          Save settings <span>→</span>
        </Button>
      </section>
    </main>
  );
}
