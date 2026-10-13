import { Modal } from "../components/Modal";

type Props = {
  shortcut: string;
  searchShortcut: string;
  onClose: () => void;
};

export function HelpModal({ shortcut, searchShortcut, onClose }: Props) {
  return (
    <Modal onClose={onClose} className="help-modal" label="Help">
      <section className="help-modal-content">
        <div className="help-modal-header">
          <div>
            <div className="help-title-row">
              <span className="help-logo">T</span>
              <div>
                <p className="eyebrow">QUIBBLE BYTE / WORKNEST</p>
                <h2 id="help-title">Your command center</h2>
              </div>
            </div>
            <p>
              A quick guide to the daily rhythm of your POS and ERP workspace.
            </p>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </button>
        </div>
        <div className="help-shortcuts">
          <span>Quick commands</span>
          <div>
            <kbd>{shortcut}</kbd>
            <small>Open help</small>
          </div>
          <div>
            <kbd>{searchShortcut}</kbd>
            <small>Quick search</small>
          </div>
          <div>
            <kbd>Esc</kbd>
            <small>Close dialog</small>
          </div>
        </div>
        <div className="help-grid">
          <article>
            <span className="help-number">01</span>
            <div>
              <h3>Sell with confidence</h3>
              <p>
                Open Sell, search for a product or scan its barcode, adjust
                quantities, choose payment, then charge the order. Hold orders to
                recall them later and print receipts.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">02</span>
            <div>
              <h3>Keep stock current</h3>
              <p>
                Use Inventory to add products, edit price and stock inline, sort
                and filter, search by SKU or barcode, and delete with
                confirmation.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">03</span>
            <div>
              <h3>Run every branch</h3>
              <p>
                Open Branches and create your main location first. Add a code,
                manager, contact details, and address. Switch branches from the
                top bar.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">04</span>
            <div>
              <h3>Understand the numbers</h3>
              <p>
                Reports groups completed bills by month from first use. Export
                the billing ledger as a spreadsheet CSV. Manage customers and
                tune tax settings.
              </p>
            </div>
          </article>
        </div>
        <div className="help-modal-footer">
          <div>
            <span className="help-status-dot" /> WorkNest is ready for your next
            move
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Back to workspace <span>→</span>
          </button>
        </div>
      </section>
    </Modal>
  );
}
