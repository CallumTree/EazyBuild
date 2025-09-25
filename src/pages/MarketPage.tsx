
import React from 'react';
import { useGlobalStore } from '../store/globalStore';
import { NumberInput } from '../components/NumberInput';
import { TrendingUp, Plus } from 'lucide-react';

export const MarketPage: React.FC = () => {
  const { project, updateProject } = useGlobalStore();

  const addComp = () => {
    const newComp = {
      id: Date.now().toString(),
      address: '',
      price: 0,
      sqft: 0,
      pricePerSqft: 0,
    };

    updateProject({
      market: {
        ...project.market,
        comps: [...project.market.comps, newComp]
      }
    });
  };

  const updateComp = (id: string, updates: any) => {
    updateProject({
      market: {
        ...project.market,
        comps: project.market.comps.map(comp =>
          comp.id === id ? { ...comp, ...updates } : comp
        )
      }
    });
  };

  const removeComp = (id: string) => {
    updateProject({
      market: {
        ...project.market,
        comps: project.market.comps.filter(comp => comp.id !== id)
      }
    });
  };

  const averagePricePerSqft = project.market.comps.length > 0 
    ? project.market.comps.reduce((sum, comp) => sum + comp.pricePerSqft, 0) / project.market.comps.length
    : 0;

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <TrendingUp className="text-brand-400" size={24} />
          <h2 className="card-title">Market Evidence</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-400 mb-4">
            Add comparable sales to determine market values.
          </p>
          
          {averagePricePerSqft > 0 && (
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-slate-400">Average £/sq ft</div>
              <div className="kpi">£{averagePricePerSqft.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Market Rate Override */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Market Rate</h3>
        </div>
        <div className="card-body">
          <div>
            <label className="label">Override £/sq ft (if different from comps)</label>
            <NumberInput
              value={project.market.perSqftDerived}
              onChange={(value) => updateProject({
                market: { ...project.market, perSqftDerived: value }
              })}
              className="input"
              placeholder={averagePricePerSqft > 0 ? `Auto: £${averagePricePerSqft.toFixed(0)}` : 'Enter rate'}
            />
          </div>
        </div>
      </div>

      {/* Comparables */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Comparable Sales</h3>
          <button onClick={addComp} className="btn ml-auto">
            <Plus size={16} />
            Add Comparable
          </button>
        </div>
        <div className="card-body space-y-4">
          {project.market.comps.map((comp) => (
            <div key={comp.id} className="bg-slate-900/30 rounded-xl p-4 space-y-4">
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  value={comp.address}
                  onChange={(e) => updateComp(comp.id, { address: e.target.value })}
                  className="input"
                  placeholder="Property address"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Sale Price (£)</label>
                  <NumberInput
                    value={comp.price}
                    onChange={(value) => {
                      const pricePerSqft = comp.sqft > 0 ? value / comp.sqft : 0;
                      updateComp(comp.id, { price: value, pricePerSqft });
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Floor Area (sq ft)</label>
                  <NumberInput
                    value={comp.sqft}
                    onChange={(value) => {
                      const pricePerSqft = value > 0 ? comp.price / value : 0;
                      updateComp(comp.id, { sqft: value, pricePerSqft });
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">£/sq ft</label>
                  <div className="input bg-slate-800 text-slate-400">
                    {comp.pricePerSqft > 0 ? `£${comp.pricePerSqft.toFixed(0)}` : '-'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeComp(comp.id)}
                className="btn-ghost text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}

          {project.market.comps.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-500 mb-4">No comparables added yet</div>
              <button onClick={addComp} className="btn">
                <Plus size={16} />
                Add Your First Comparable
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
