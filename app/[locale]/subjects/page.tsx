'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type Evaluation = {
  id: string;
  name: string;
  weight: number;
  grade: number | '';
};

type Subject = {
  id: string;
  name: string;
  credits: number;
  goalGrade: number;
  evaluations: Evaluation[];
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
  evaluations: [
    {
      id: 'new-eval-1',
      name: '',
      weight: 100,
      grade: '',
    },
  ],
};

function loadSubjects() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem('clearup_subjects');
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Subject[]) : [];
  } catch {
    return [];
  }
}

function loadProfile() {
  if (typeof window === 'undefined') {
    return {
      name: '',
      semester: '',
      globalGoal: '',
    };
  }

  try {
    const stored = window.localStorage.getItem('clearup_profile');
    if (!stored) {
      return {
        name: '',
        semester: '',
        globalGoal: '',
      };
    }

    return JSON.parse(stored) as Profile;
  } catch {
    return {
      name: '',
      semester: '',
      globalGoal: '',
    };
  }
}

export default function SubjectsPage() {
  const t = useTranslations('Subjects');
  const tNav = useTranslations('Navigation');

  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [editing, setEditing] = useState<Subject>(EMPTY_SUBJECT);

  const totalCredits = useMemo(
    () => subjects.reduce((sum, subject) => sum + (Number.isFinite(subject.credits) ? subject.credits : 0), 0),
    [subjects]
  );

  const projectedAverage = useMemo(() => {
    const weightedCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);

    if (weightedCredits === 0) {
      return 0;
    }

    const weightedProjected = subjects.reduce(
      (sum, subject) => sum + calculateProjectedGrade(subject) * subject.credits,
      0
    );

    return weightedProjected / weightedCredits;
  }, [subjects]);

  function persistSubjects(nextSubjects: Subject[]) {
    setSubjects(nextSubjects);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('clearup_subjects', JSON.stringify(nextSubjects));
    }
  }

  function persistProfile(nextProfile: Profile) {
    setProfile(nextProfile);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('clearup_profile', JSON.stringify(nextProfile));
    }
  }

  function handleEdit(subject?: Subject) {
    if (subject) {
      setEditing({
        ...subject,
        evaluations: subject.evaluations.length > 0 ? subject.evaluations : EMPTY_SUBJECT.evaluations,
      });
      return;
    }

    setEditing({
      ...EMPTY_SUBJECT,
      id: crypto.randomUUID(),
      evaluations: [
        {
          id: crypto.randomUUID(),
          name: '',
          weight: 100,
          grade: '',
        },
      ],
    });
  }

  function handleSave() {
    if (!editing.name.trim()) {
      return;
    }

    const normalizedEvaluations = editing.evaluations
      .map((evaluation) => ({
        ...evaluation,
        name: evaluation.name.trim(),
        weight: Number(evaluation.weight) || 0,
      }))
      .filter((evaluation) => evaluation.name && evaluation.weight > 0);

    const subjectToSave: Subject = {
      ...editing,
      evaluations:
        normalizedEvaluations.length > 0
          ? normalizedEvaluations
          : [
              {
                id: crypto.randomUUID(),
                name: t('defaults.finalExam'),
                weight: 100,
                grade: '',
              },
            ],
    };

    const exists = subjects.find((subject) => subject.id === subjectToSave.id);
    persistSubjects(
      exists
        ? subjects.map((subject) => (subject.id === subjectToSave.id ? subjectToSave : subject))
        : [...subjects, subjectToSave]
    );
    setEditing(EMPTY_SUBJECT);
  }

  function handleDelete(id: string) {
    persistSubjects(subjects.filter((subject) => subject.id !== id));
    if (editing.id === id) {
      setEditing(EMPTY_SUBJECT);
    }
  }

  function updateEvaluation(
    evaluationId: string,
    field: 'name' | 'weight' | 'grade',
    value: string
  ) {
    setEditing((current) => ({
      ...current,
      evaluations: current.evaluations.map((evaluation) =>
        evaluation.id === evaluationId
          ? {
              ...evaluation,
              [field]:
                field === 'name' ? value : value === '' ? '' : Number(value),
            }
          : evaluation
      ),
    }));
  }

  function addEvaluation() {
    setEditing((current) => ({
      ...current,
      evaluations: [
        ...current.evaluations,
        {
          id: crypto.randomUUID(),
          name: '',
          weight: 0,
          grade: '',
        },
      ],
    }));
  }

  function removeEvaluation(evaluationId: string) {
    setEditing((current) => ({
      ...current,
      evaluations:
        current.evaluations.length === 1
          ? current.evaluations
          : current.evaluations.filter((evaluation) => evaluation.id !== evaluationId),
    }));
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{tNav('subjects')}</h1>
          <p className="mt-2 text-lg text-zinc-500">{t('intro')}</p>
        </div>
        <div className="min-w-[260px] rounded-2xl bg-zinc-900 p-4 text-zinc-50">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-70">
            {t('profileCard.title')}
          </p>
          <p className="truncate font-bold">{profile.name || t('profileCard.defaultName')}</p>
          <p className="mt-1 text-xs opacity-80">
            {t('profileCard.semester')} <span className="font-semibold">{profile.semester || t('profileCard.undefined')}</span>
          </p>
          <p className="mt-1 text-xs opacity-80">
            {t('profileCard.goal')} <span className="font-semibold">{profile.globalGoal || t('profileCard.noGoal')}</span>
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('summary.subjects')} value={String(subjects.length)} detail={t('summary.subjectsDetail')} />
        <MetricCard label={t('summary.credits')} value={String(totalCredits)} detail={t('summary.creditsDetail')} />
        <MetricCard label={t('summary.projectedAverage')} value={projectedAverage > 0 ? projectedAverage.toFixed(2) : '0.00'} detail={t('summary.projectedAverageDetail')} />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-2 rounded-full bg-blue-600" />
              {t('listTitle')}
            </h2>
            <span className="text-xs text-zinc-500">
              {subjects.length} {t('summary.subjectsLabel')} · {totalCredits} {t('summary.creditsLabel')}
            </span>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <h3 className="text-xl font-bold text-zinc-900">{t('empty.title')}</h3>
              <p className="mt-2 text-sm text-zinc-500">{t('empty.body')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subjects.map((subject) => {
                const projected = calculateProjectedGrade(subject);
                const needed = calculateNeededGrade(subject);
                const completedWeight = getCompletedWeight(subject);
                const remainingWeight = Math.max(100 - completedWeight, 0);

                return (
                  <article key={subject.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">{subject.name}</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {subject.credits} {t('summary.creditsLabel')} · {t('simulatorMeta.goal')} {subject.goalGrade.toFixed(1)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(subject)}
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-blue-500 hover:text-blue-600"
                        >
                          {t('actions.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(subject.id)}
                          className="rounded-full border border-red-100 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          {t('actions.delete')}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                      <MiniCard label={t('simulatorMeta.current')} value={calculateCurrentGrade(subject).toFixed(2)} />
                      <MiniCard label={t('simulatorMeta.projected')} value={projected.toFixed(2)} />
                      <MiniCard
                        label={t('simulatorMeta.needed')}
                        value={needed === null ? t('simulatorMeta.completed') : needed > 5 ? t('simulatorMeta.unreachable') : needed.toFixed(2)}
                      />
                    </div>

                    <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
                        <span>{t('simulatorMeta.weightCompleted')}</span>
                        <span>{completedWeight.toFixed(0)}% / 100%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white">
                        <div className="h-3 rounded-full bg-blue-500" style={{ width: `${Math.min(completedWeight, 100)}%` }} />
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">
                        {t('simulatorMeta.remaining')} {remainingWeight.toFixed(0)}%
                      </p>
                    </div>

                    <div className="mt-5 space-y-2">
                      {subject.evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-sm">
                          <span className="font-medium text-zinc-700">{evaluation.name}</span>
                          <span className="text-zinc-500">
                            {evaluation.weight}% · {evaluation.grade === '' ? t('simulatorMeta.pendingGrade') : Number(evaluation.grade).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-2 rounded-full bg-emerald-500" />
              {t('profileSection')}
            </h2>

            <div className="mt-4 grid gap-3">
              <input
                type="text"
                placeholder={t('profilePlaceholders.name')}
                value={profile.name}
                onChange={(event) => persistProfile({ ...profile, name: event.target.value })}
                className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder={t('profilePlaceholders.semester')}
                value={profile.semester}
                onChange={(event) => persistProfile({ ...profile, semester: event.target.value })}
                className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
              <textarea
                placeholder={t('profilePlaceholders.goal')}
                value={profile.globalGoal}
                onChange={(event) => persistProfile({ ...profile, globalGoal: event.target.value })}
                className="min-h-[90px] rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{editing.id ? t('form.editTitle') : t('form.createTitle')}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t('form.description')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleEdit()}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {t('actions.newSubject')}
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                type="text"
                placeholder={t('form.subjectName')}
                value={editing.name}
                onChange={(event) => setEditing((current) => ({ ...current, name: event.target.value }))}
                className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={editing.credits}
                  onChange={(event) =>
                    setEditing((current) => ({ ...current, credits: Number(event.target.value) || 0 }))
                  }
                  className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder={t('form.credits')}
                />
                <input
                  type="number"
                  min={0}
                  max={5}
                  step="0.1"
                  value={editing.goalGrade}
                  onChange={(event) =>
                    setEditing((current) => ({ ...current, goalGrade: Number(event.target.value) || 0 }))
                  }
                  className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                  placeholder={t('form.goalGrade')}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">{t('simulator')}</h3>
                <button
                  type="button"
                  onClick={addEvaluation}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:border-blue-500 hover:text-blue-600"
                >
                  {t('actions.addEvaluation')}
                </button>
              </div>

              {editing.evaluations.map((evaluation) => (
                <div key={evaluation.id} className="grid gap-2 rounded-2xl border border-zinc-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1.6fr_0.8fr_0.8fr_auto]">
                    <input
                      type="text"
                      placeholder={t('form.evaluationName')}
                      value={evaluation.name}
                      onChange={(event) => updateEvaluation(evaluation.id, 'name', event.target.value)}
                      className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={evaluation.weight}
                      onChange={(event) => updateEvaluation(evaluation.id, 'weight', event.target.value)}
                      className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder={t('form.weight')}
                    />
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step="0.1"
                      value={evaluation.grade}
                      onChange={(event) => updateEvaluation(evaluation.id, 'grade', event.target.value)}
                      className="rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm"
                      placeholder={t('form.grade')}
                    />
                    <button
                      type="button"
                      onClick={() => removeEvaluation(evaluation.id)}
                      className="rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      {t('actions.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {editing.id && (
                <button
                  type="button"
                  onClick={() => setEditing(EMPTY_SUBJECT)}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-xs text-zinc-500 hover:bg-zinc-50"
                >
                  {t('actions.cancel')}
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!editing.name.trim()}
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
              >
                {editing.id && subjects.find((subject) => subject.id === editing.id)
                  ? t('actions.saveChanges')
                  : t('actions.saveSubject')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function calculateCurrentGrade(subject: Subject) {
  return subject.evaluations.reduce((total, evaluation) => {
    if (evaluation.grade === '') {
      return total;
    }

    return total + (Number(evaluation.grade) * evaluation.weight) / 100;
  }, 0);
}

function getCompletedWeight(subject: Subject) {
  return subject.evaluations.reduce((total, evaluation) => {
    if (evaluation.grade === '') {
      return total;
    }

    return total + evaluation.weight;
  }, 0);
}

function calculateProjectedGrade(subject: Subject) {
  const completedContribution = calculateCurrentGrade(subject);
  const missingEvaluations = subject.evaluations.filter((evaluation) => evaluation.grade === '');
  const remainingWeight = missingEvaluations.reduce((total, evaluation) => total + evaluation.weight, 0);

  if (remainingWeight === 0) {
    return completedContribution;
  }

  const projectedMissing = missingEvaluations.reduce((total, evaluation) => total + (subject.goalGrade * evaluation.weight) / 100, 0);
  return completedContribution + projectedMissing;
}

function calculateNeededGrade(subject: Subject) {
  const completedContribution = calculateCurrentGrade(subject);
  const remainingWeight = subject.evaluations
    .filter((evaluation) => evaluation.grade === '')
    .reduce((total, evaluation) => total + evaluation.weight, 0);

  if (remainingWeight === 0) {
    return null;
  }

  return ((subject.goalGrade - completedContribution) * 100) / remainingWeight;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-zinc-900">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-zinc-900">{value}</p>
    </div>
  );
}
