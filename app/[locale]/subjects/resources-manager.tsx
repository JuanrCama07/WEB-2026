'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthSession } from '@/lib/auth/client';
import { type Resource, type ResourceType, getResourcesBySubject, addResource, deleteResource } from '@/lib/resources-store';

type ResourcesManagerProps = {
  subjectId: string;
};

export function ResourcesManager({ subjectId }: ResourcesManagerProps) {
  const t = useTranslations('Resources');
  const session = useAuthSession();
  const userId = session?.id;
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', type: 'link' as ResourceType });

  useEffect(() => {
    setResources(getResourcesBySubject(subjectId, userId));
  }, [subjectId, userId]);

  const handleAddResource = () => {
    if (formData.title.trim() && formData.url.trim()) {
      const newResource = addResource({
        title: formData.title,
        url: formData.url,
        type: formData.type,
        subjectId,
      }, userId);
      setResources([...resources, newResource]);
      setFormData({ title: '', url: '', type: 'link' });
      setShowForm(false);
    }
  };

  const handleDeleteResource = (resourceId: string) => {
    deleteResource(resourceId, userId);
    setResources(resources.filter(r => r.id !== resourceId));
  };

  const handleOpenResource = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t('title')}</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-[linear-gradient(135deg,#0f6cbd,#0b4f8a)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,108,189,0.2)] transition hover:brightness-105"
        >
          {showForm ? 'Cancelar' : t('addResource')}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[1.6rem] border border-blue-200 bg-[linear-gradient(135deg,#eff6ff,#f8fbff)] p-4 space-y-3">
          <input
            type="text"
            placeholder={t('resourceTitle')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="app-input text-sm"
          />
          <input
            type="text"
            placeholder={t('resourceUrl')}
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="app-input text-sm"
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
            className="app-input text-sm"
          >
            <option value="link">{t('link')}</option>
            <option value="document">{t('document')}</option>
            <option value="note">{t('note')}</option>
          </select>
          <button
            onClick={handleAddResource}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#0f6cbd,#0b4f8a)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {t('saveResource')}
          </button>
        </div>
      )}

      {resources.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 py-6 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('noResources')}</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3"
            >
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white text-sm">{resource.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{resource.type}</p>
              </div>
              <div className="flex gap-2">
                {resource.url.startsWith('http') && (
                  <button
                    onClick={() => handleOpenResource(resource.url)}
                    className="px-3 py-1 rounded text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    {t('open')}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteResource(resource.id)}
                  className="px-3 py-1 rounded text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
