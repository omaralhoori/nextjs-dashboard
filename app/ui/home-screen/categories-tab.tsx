'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { TableSkeleton } from '@/app/ui/data-table';
import {
  fetchHomeCategoriesAction, createHomeCategoryAction, updateHomeCategoryAction,
  deleteHomeCategoryAction, reorderHomeCategoriesAction,
} from '@/app/lib/functions/home-sections';
import { fetchActiveItemGroupsAction } from '@/app/lib/functions/item-groups';
import type { CreateHomeCategoryDto, HomeCategory } from '@/app/lib/definitions/home-screen';
import { Modal, StatusToggle, ActionIcon, EmptyState, inputCls, labelCls } from './shared';

/** Icon keys understood by the Flutter app (mapped to its own icon set). */
const ICON_KEYS = ['pill', 'globe', 'syringe', 'baby', 'sparkles', 'capsule', 'tablet', 'heart', 'drop', 'bandage', 'leaf', 'tooth'];

type GroupOption = { id: string; name: string };

function CategoryForm({
  category, groups, loading, onSubmit, onClose,
}: {
  category?: HomeCategory;
  groups: GroupOption[];
  loading: boolean;
  onSubmit: (dto: CreateHomeCategoryDto) => void;
  onClose: () => void;
}) {
  const [nameAr, setNameAr] = useState(category?.name_ar ?? '');
  const [nameEn, setNameEn] = useState(category?.name_en ?? '');
  const [iconKey, setIconKey] = useState(category?.icon_key ?? 'pill');
  const [groupIds, setGroupIds] = useState<string[]>(category?.filter?.item_group_ids ?? []);
  const [drugClass, setDrugClass] = useState(category?.filter?.drug_class ?? '');
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  const toggleGroup = (id: string) =>
    setGroupIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          name_ar: nameAr,
          name_en: nameEn || null,
          icon_key: iconKey,
          filter: {
            item_group_ids: groupIds,
            ...(drugClass && { drug_class: drugClass as 'OTC' | 'RX' | 'Controlled' }),
            ...(category?.filter?.manufacturer_ids?.length && { manufacturer_ids: category.filter.manufacturer_ids }),
          },
          is_active: isActive,
        });
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name (Arabic) *</label>
          <input required dir="rtl" value={nameAr} onChange={e => setNameAr(e.target.value)} className={inputCls} placeholder="أدوية وطنية" />
        </div>
        <div>
          <label className={labelCls}>Name (English)</label>
          <input value={nameEn} onChange={e => setNameEn(e.target.value)} className={inputCls} placeholder="Local medicines" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Icon</label>
        <select value={iconKey} onChange={e => setIconKey(e.target.value)} className={inputCls}>
          {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Item groups in this category</label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-2">
          {groups.length === 0 && <span className="text-xs text-gray-400">No item groups</span>}
          {groups.map(g => (
            <button
              type="button"
              key={g.id}
              onClick={() => toggleGroup(g.id)}
              className={`rounded-full px-3 py-1 text-xs ring-1 ${groupIds.includes(g.id) ? 'bg-[#007476] text-white ring-[#007476]' : 'bg-white text-gray-600 ring-gray-200'}`}
              dir="rtl"
            >
              {g.name}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400">Tapping the category in the app opens search filtered by these groups. Leave empty to show all items.</p>
      </div>
      <div>
        <label className={labelCls}>Drug class (optional)</label>
        <select value={drugClass} onChange={e => setDrugClass(e.target.value as typeof drugClass)} className={inputCls}>
          <option value="">— Any —</option>
          <option value="OTC">OTC</option>
          <option value="RX">RX</option>
          <option value="Controlled">Controlled</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
        Active (visible in the app)
      </label>
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={loading || !nameAr} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}>
          {loading ? 'Saving…' : category ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

export default function CategoriesTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ category?: HomeCategory } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchHomeCategoriesAction();
    setLoading(false);
    if ('error' in res) onError('Failed to load categories');
    else setCategories(res.categories);
  }, [onError]);

  useEffect(() => {
    load();
    fetchActiveItemGroupsAction().then(res => {
      if (!('error' in res)) setGroups(res.itemGroups.map(g => ({ id: g.id, name: g.name })));
    });
  }, [load]);

  const groupName = (id: string) => groups.find(g => g.id === id)?.name ?? '(inactive group)';

  const submit = async (dto: CreateHomeCategoryDto) => {
    setSaving(true);
    const res = modal?.category ? await updateHomeCategoryAction(modal.category.id, dto) : await createHomeCategoryAction(dto);
    setSaving(false);
    if (res.success) { onSuccess(res.message); setModal(null); load(); } else onError(res.message);
  };

  const run = async (id: string, fn: () => Promise<{ success: boolean; message: string }>) => {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (res.success) load(); else onError(res.message);
  };

  const move = (index: number, delta: number) => {
    const ids = categories.map(c => c.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(ids[index], () => reorderHomeCategoriesAction(ids));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">The category strip under the banner. Order here = order in the app.</p>
        <button onClick={() => setModal({})} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}>
          <PlusIcon className="h-4 w-4" /> New Category
        </button>
      </div>

      {loading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : categories.length === 0 ? (
        <EmptyState icon={<Squares2X2Icon className="h-8 w-8" />} label="No categories" sub="Create the categories shown on the pharmacy home page" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
                {['Order', 'Name', 'Icon', 'Item groups', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/90 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <button onClick={() => move(i, -1)} disabled={i === 0 || !!busyId} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUpIcon className="h-3.5 w-3.5" /></button>
                    <button onClick={() => move(i, 1)} disabled={i === categories.length - 1 || !!busyId} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDownIcon className="h-3.5 w-3.5" /></button>
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900" dir="rtl">{c.name_ar}</p>
                    <p className="text-xs text-gray-400">{c.name_en}</p>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">{c.icon_key}</td>
                  <td className="px-4 py-2 text-xs text-gray-600" dir="rtl">
                    {c.filter?.item_group_ids?.length ? c.filter.item_group_ids.map(groupName).join('، ') : <span className="text-gray-400">All items</span>}
                    {c.filter?.drug_class && <span className="ml-1 text-gray-400">· {c.filter.drug_class}</span>}
                  </td>
                  <td className="px-4 py-2">
                    <StatusToggle active={c.is_active} loading={busyId === c.id} onToggle={() => run(c.id, () => updateHomeCategoryAction(c.id, { is_active: !c.is_active }))} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1">
                      <ActionIcon icon={<PencilIcon className="h-4 w-4" />} label="Edit" color="blue" onClick={() => setModal({ category: c })} />
                      <ActionIcon
                        icon={<TrashIcon className="h-4 w-4" />}
                        label="Delete"
                        color="red"
                        onClick={() => { if (window.confirm('Delete this category?')) run(c.id, () => deleteHomeCategoryAction(c.id)); }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.category ? 'Edit Category' : 'New Category'} onClose={() => setModal(null)}>
          <CategoryForm category={modal.category} groups={groups} loading={saving} onSubmit={submit} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
