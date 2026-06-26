import './Toggle.css';

export default function Toggle({ id, label, checked, onChange, disabled, className }) {
  const switchId = id || `switch-${label}`;

  return (
    <div
      className={[
        'toggle',
        disabled ? 'disabled' : '',
        className || '',
      ].filter(Boolean).join(' ')}
    >
      <div className="onoffswitch">
        <input
          type="checkbox"
          className="onoffswitch-checkbox"
          id={switchId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <label className="onoffswitch-label" htmlFor={switchId}>
          <span className="onoffswitch-inner" />
          <span className="onoffswitch-switch" />
        </label>
      </div>
      <span className="label">{label}</span>
    </div>
  );
}
