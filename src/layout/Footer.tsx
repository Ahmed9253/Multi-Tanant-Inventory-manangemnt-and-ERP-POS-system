type Props = {
  shortcut: string;
  onOpenHelp: () => void;
};

export function Footer({ shortcut, onOpenHelp }: Props) {
  return (
    <footer>
      <span>Quibble Byte · WorkNest POS and ERP</span>
      <span>
        <i className="status-dot" /> All systems operational
      </span>
      <span>
        <button className="help-trigger" onClick={onOpenHelp}>
          Need help? <b>{shortcut}</b>
        </button>
      </span>
    </footer>
  );
}
