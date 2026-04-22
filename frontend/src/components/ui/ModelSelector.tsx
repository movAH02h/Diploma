'use client';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#3d3d3d]">
      <label className="block text-xs text-[#888] mb-2">
        Model:
      </label>
      <div className="flex bg-[#252525] rounded-lg p-1">
        <button
          type="button"
          onClick={() => onChange('base')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
            value === 'base'
              ? 'bg-[#89dceb] text-[#1a1a1a]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          Base
        </button>
        <button
          type="button"
          onClick={() => onChange('pro')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
            value === 'pro'
              ? 'bg-[#89dceb] text-[#1a1a1a]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          Pro
        </button>
      </div>
    </div>
  );
}