'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Subject = {
  id: string;
  name: string;
  credits: number;
  goalGrade: number;
};

type Profile = {
  name: string;
  semester: string;
  globalGoal: string;
};

const EMPTY_SUBJECT: Subject = {
  id: '',
  name: '',
  credits: 3,
  goalGrade: 4.0,
};

export default function SubjectsPage() {
  const t = useTranslations('Subjects');
  const tNav = useTranslations('Navigation');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    semester: '',
    globalGoal: '',
  });
  const [editing, setEditing] = useState<Subject>(EMPTY_SUBJECT);

  useEffect(() => {
    try {
      const storedSubjects = localStorage.getItem('clearup_subjects');
      const storedProfile = localStorage.getItem('clearup_profile');
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects) as Subject[]);
      } else {
        setSubjects([
          { id: '1', name: 'Sistemas y Computación', credits: 4, goalGrade: 4.0 },
          { id: '2', name: 'Redes de Datos', credits: 3, goalGrade: 4.2 },
        ]);
      }
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as Profile);
      } else {
        setProfile({
          name: 'Estudiante ClearUp',
          semester: '2025-1',
          globalGoal: 'Mantener promedio ≥ 4.0',
        });
      }
    } catch {
      // ignoramos errores de parseo
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('clearup_subjects', JSON.stringify(subjects));
    } catch {
      // ignoramos errores de escritura
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem('clearup_profile', JSON.stringify(profile));
    } catch {
      // ignoramos errores de escritura
    }
  }, [profile]);

  const handleEdit = (subject?: Subject) => {
    if (subject) {
      setEditing(subject);
    } else {
      setEditing({ ...EMPTY_SUBJECT, id: crypto.randomUUID() });
    }
  };

  const handleSave = () => {
    if (!editing.name.trim()) return;
    setSubjects((prev) => {
      const exists = prev.find((s) => s.id === editing.id);
      if (exists) {
        return prev.map((s) => (s.id === editing.id ? editing : s));
      }
      return [...prev, editing];
    });
    setEditing(EMPTY_SUBJECT);
  };

  const handleDelete = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (editing.id === id) setEditing(EMPTY_SUBJECT);
  };

  const totalCredits = subjects.reduce((sum, s) => sum + (Number.isFinite(s.credits) ? s.credits : 0), 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {tNav('subjects')}
          </h1>
          <p className="text-lg text-zinc-500 mt-2">
            Centraliza tus cursos del semestre y alinea la app con tus metas.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-900 min-w-[240px]">
          <p className="text-xs uppercase tracking-widest font-semibold opacity-70 mb-1">
            Perfil del semestre
          </p>
          <p className="font-bold truncate">{profile.name || 'Estudiante ClearUp'}</p>
          <p className="text-xs mt-1 opacity-80">
            Semestre: <span className="font-semibold">{profile.semester || 'Sin definir'}</span>
          </p>
          <p className="text-xs mt-1 opacity-80">
            Meta: <span className="font-semibold">{profile.globalGoal || 'Configura tu objetivo'}</span>
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Listado y edición de materias (HU-11) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              Mis cursos del semestre
            </h2>
            <span className="text-xs text-zinc-500">
              {subjects.length} cursos · {totalCredits} créditos
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((curso) => (
              <div
                key={curso.id}
                className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 transition-colors group flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold group-hover:text-blue-600">{curso.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      {curso.credits} créditos · Meta {curso.goalGrade.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(curso)}
                      className="px-2 py-1 text-[10px] rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-200 hover:border-blue-500 hover:text-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(curso.id)}
                      className="px-2 py-1 text-[10px] rounded-full border border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 italic">
                  Esta materia aparecerá en tu planificación y sugerencias de carga.
                </p>
              </div>
            ))}
          </div>

          {/* Formulario inline para nueva materia / edición */}
          <div className="mt-4 p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {editing.id ? 'Editar materia' : 'Agregar nueva materia'}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Nombre de la materia"
                value={editing.name}
                onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))}
                className="sm:col-span-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editing.credits}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      credits: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-1/2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
                  placeholder="Créditos"
                />
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={editing.goalGrade}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      goalGrade: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-1/2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
                  placeholder="Meta"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editing.id && (
                <button
                  type="button"
                  onClick={() => setEditing(EMPTY_SUBJECT)}
                  className="px-3 py-1.5 text-xs rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 text-xs rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40"
                disabled={!editing.name.trim()}
              >
                {editing.id && subjects.find((s) => s.id === editing.id) ? 'Guardar cambios' : 'Agregar materia'}
              </button>
            </div>
          </div>
        </div>

        {/* Perfil y metas personales */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full" />
            Mi perfil y metas
          </h2>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Semestre actual (ej. 2025-1)"
                value={profile.semester}
                onChange={(e) => setProfile((prev) => ({ ...prev, semester: e.target.value }))}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Meta académica / personal para este semestre"
                value={profile.globalGoal}
                onChange={(e) => setProfile((prev) => ({ ...prev, globalGoal: e.target.value }))}
                className="min-h-[80px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm resize-none"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Esta información se usará para personalizar tu dashboard, sugerencias y planificación
              semanal.
            </p>
          </div>

          {/* Simulador simple / recordatorio de metas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
              {t('simulator')}
            </h3>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
              <p className="text-sm text-emerald-900/80 dark:text-emerald-200 mb-2">
                {profile.globalGoal || 'Define una meta para que ClearUp te recuerde hacia dónde vas.'}
              </p>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/80">
                A medida que avances en tus cursos, podrás conectar esta meta con tus notas,
                hábitos y tiempo de estudio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}