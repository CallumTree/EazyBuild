
import React from 'react';
import { useGlobalStore, computeTotals } from '../store/globalStore';
import { NumberInput } from '../components/NumberInput';
import { Home, Plus, Trash2 } from 'lucide-react';

export const LayoutPage: React.FC = () => {
  const { project, updateProject } = useGlobalStore();
  const totals = computeTotals(project);

  const addHouseType = () => {
    const newType = {
      id: Date.now().toString(),
      name: `House Type ${project.layout.houseTypes.length + 1}`,
      giaSqft: 1000,
      buildPerSqft: 120,
      salePerSqft: 300,
    };
    
    updateProject({
      layout: {
        ...project.layout,
        houseTypes: [...project.layout.houseTypes, newType],
        unitMix: [...project.layout.unitMix, { houseTypeId: newType.id, count: 0 }]
      }
    });
  };

  const updateHouseType = (id: string, updates: any) => {
    updateProject({
      layout: {
        ...project.layout,
        houseTypes: project.layout.houseTypes.map(type =>
          type.id === id ? { ...type, ...updates } : type
        )
      }
    });
  };

  const updateUnitCount = (houseTypeId: string, count: number) => {
    updateProject({
      layout: {
        ...project.layout,
        unitMix: project.layout.unitMix.map(mix =>
          mix.houseTypeId === houseTypeId ? { ...mix, count } : mix
        )
      }
    });
  };

  const removeHouseType = (id: string) => {
    updateProject({
      layout: {
        ...project.layout,
        houseTypes: project.layout.houseTypes.filter(type => type.id !== id),
        unitMix: project.layout.unitMix.filter(mix => mix.houseTypeId !== id)
      }
    });
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <Home className="text-brand-400" size={24} />
          <h2 className="card-title">Unit Mix & Layout</h2>
        </div>
        <div className="card-body">
          <p className="text-slate-400 mb-4">
            Configure house types, counts, and pricing assumptions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-slate-400">Total Units</div>
              <div className="kpi">{project.layout.unitMix.reduce((sum, mix) => sum + mix.count, 0)}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-slate-400">Gross GDV</div>
              <div className={totals.gdv >= 0 ? 'kpi-green' : 'kpi-red'}>
                £{totals.gdv.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-slate-400">Build Cost</div>
              <div className="kpi">£{totals.build.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* House Types */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">House Types</h3>
          <button onClick={addHouseType} className="btn ml-auto">
            <Plus size={16} />
            Add Type
          </button>
        </div>
        <div className="card-body space-y-6">
          {project.layout.houseTypes.map((houseType, index) => {
            const unitMix = project.layout.unitMix.find(mix => mix.houseTypeId === houseType.id) || { count: 0 };
            const totalGDV = unitMix.count * houseType.giaSqft * houseType.salePerSqft;
            const totalBuild = unitMix.count * houseType.giaSqft * houseType.buildPerSqft;

            return (
              <div key={houseType.id} className="bg-slate-900/30 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={houseType.name}
                    onChange={(e) => updateHouseType(houseType.id, { name: e.target.value })}
                    className="input flex-1 mr-4"
                  />
                  <button
                    onClick={() => removeHouseType(houseType.id)}
                    className="btn-ghost text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">Count</label>
                    <NumberInput
                      value={unitMix.count}
                      onChange={(value) => updateUnitCount(houseType.id, value)}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">GIA (sq ft)</label>
                    <NumberInput
                      value={houseType.giaSqft}
                      onChange={(value) => updateHouseType(houseType.id, { giaSqft: value })}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Build £/sq ft</label>
                    <NumberInput
                      value={houseType.buildPerSqft}
                      onChange={(value) => updateHouseType(houseType.id, { buildPerSqft: value })}
                      className="input"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="label">Sale £/sq ft</label>
                    <NumberInput
                      value={houseType.salePerSqft}
                      onChange={(value) => updateHouseType(houseType.id, { salePerSqft: value })}
                      className="input"
                      min={0}
                    />
                  </div>
                </div>

                {unitMix.count > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                    <div>
                      <div className="text-sm text-slate-400">Type GDV</div>
                      <div className="font-semibold text-emerald-400">£{totalGDV.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Type Build Cost</div>
                      <div className="font-semibold">£{totalBuild.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {project.layout.houseTypes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-500 mb-4">No house types configured</div>
              <button onClick={addHouseType} className="btn">
                <Plus size={16} />
                Add Your First House Type
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
