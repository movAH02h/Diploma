// components/ui/ModelSelector.tsx
'use client';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <label className="block text-sm font-semibold text-slate-600 mb-3">
        Choose the model version:
      </label>
      <div className="bg-slate-100 rounded-full p-1 flex">
        <label
          className={`flex-1 text-center py-2 px-4 rounded-full cursor-pointer font-medium transition ${
            value === 'base'
              ? 'bg-blue-500 text-white shadow'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <input
            type="radio"
            name="model_type"
            value="base"
            checked={value === 'base'}
            onChange={(e) => onChange(e.target.value)}
            className="hidden"
          />
          Base
        </label>
        <label
          className={`flex-1 text-center py-2 px-4 rounded-full cursor-pointer font-medium transition ${
            value === 'pro'
              ? 'bg-blue-500 text-white shadow'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <input
            type="radio"
            name="model_type"
            value="pro"
            checked={value === 'pro'}
            onChange={(e) => onChange(e.target.value)}
            className="hidden"
          />
          Pro
        </label>
      </div>
    </div>
  );
}