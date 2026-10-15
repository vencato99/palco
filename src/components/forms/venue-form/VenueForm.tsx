'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { VenueStatus } from '@prisma/client';
import { zodFields } from '@/lib/zod-fields';
import { venueAudienceSchema, venueBasicsSchema, venueContactsSchema } from '@/lib/validators';
import { VENUE_STATUS } from '@/lib/constants';
import { Badge, Button, Modal, Stepper, useToast } from '@/components/ui';
import { FormError, useApi } from '../useApi';
import { StepAudience, StepBasics, StepContacts, StepPhotos, StepStructure } from './steps';
import { emptyDraft, toPayload, type VenueDraft } from './types';

const STEPS = ['Básico', 'Público e negócio', 'Estrutura', 'Fotos', 'Contatos e revisão'];
const VIEWS = [StepBasics, StepAudience, StepStructure, StepPhotos, StepContacts];

/** Valida no cliente com os MESMOS schemas do servidor — sem regras duplicadas. */
function validateStep(step: number, d: VenueDraft) {
  const p = toPayload(d, 'draft');
  const schema = step === 0 ? venueBasicsSchema : step === 1 ? venueAudienceSchema : step === 4 ? venueContactsSchema : null;
  if (!schema) return {};
  const r = schema.safeParse(p);
  return r.success ? {} : zodFields(r.error);
}
const STEP_OF: Record<string, number> = { name: 0, city: 0, state: 0, capacity: 1, acceptsRental: 1, contactEmail: 4 };

export function VenueForm({ venueId, initial, status }: { venueId?: string; initial?: VenueDraft; status?: VenueStatus }) {
  const router = useRouter();
  const toast = useToast();
  const { call, loading, error, fields, setFields } = useApi();
  const [d, setD] = useState<VenueDraft>(initial ?? emptyDraft());
  const [step, setStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = useCallback((patch: Partial<VenueDraft>) => { setD((cur) => ({ ...cur, ...patch })); setDirty(true); setFields({}); }, [setFields]);

  // Aviso nativo do navegador ao fechar a aba com alterações pendentes.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  function go(target: number) {
    if (target <= step) return setStep(target);
    for (let s = step; s < target; s++) {
      const e = validateStep(s, d);
      if (Object.keys(e).length) { setFields(e); setStep(s); return; }
    }
    setStep(target);
  }

  async function save(intent: 'draft' | 'publish') {
    for (const s of [0, 1, 4]) {
      const e = validateStep(s, d);
      if (Object.keys(e).length) { setFields(e); setStep(s); setConfirmLeave(false); return; }
    }
    const r = await call<{ id: string; name: string; status: VenueStatus }>(venueId ? `/api/venues/${venueId}` : '/api/venues', venueId ? 'PATCH' : 'POST', toPayload(d, intent));
    if (!r.ok) {
      const first = Object.keys(r.fields)[0];
      if (first && STEP_OF[first] !== undefined) setStep(STEP_OF[first]!);
      return;
    }
    setDirty(false);
    const st = VENUE_STATUS[r.data.status].label.toLowerCase();
    toast({ message: venueId ? `Alterações em “${r.data.name}” salvas.` : `“${r.data.name}” salvo como ${st}.` });
    router.push('/minha-conta/locais');
    router.refresh();
  }

  async function remove() {
    if (!venueId) return;
    const r = await call(`/api/venues/${venueId}`, 'DELETE');
    if (!r.ok) return;
    setDirty(false);
    toast({
      message: `“${d.name}” excluído.`,
      action: { label: 'Desfazer', onClick: async () => { await fetch(`/api/venues/${venueId}/restore`, { method: 'POST' }); router.refresh(); } },
    });
    router.push('/minha-conta/locais');
    router.refresh();
  }

  const View = VIEWS[step]!;
  const publishLabel = status === 'PUBLISHED' ? 'Salvar alterações' : 'Salvar e publicar';

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" onClick={() => (dirty ? setConfirmLeave(true) : router.push('/minha-conta/locais'))} className="py-2 text-sm text-mute hover:text-paper">← Voltar para Meus locais</button>
          <h1 className="font-display text-3xl font-bold">{venueId ? `Editar · ${d.name || 'local'}` : 'Cadastrar novo local'}</h1>
        </div>
        <div className="flex gap-2">
          {status ? <Badge tone={VENUE_STATUS[status].tone}>{VENUE_STATUS[status].label}</Badge> : null}
          {dirty ? <Badge tone="warn">Alterações não salvas</Badge> : null}
        </div>
      </div>

      <Stepper steps={STEPS} current={step} onGo={go} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-6 rounded-3xl border border-line bg-ink-2 p-5 md:p-7">
          <h2 className="font-display text-xl font-bold">{STEPS[step]}</h2>
          <FormError message={error && !Object.keys(fields).length ? error : null} />
          <View d={d} set={set} errors={fields} />
          {venueId && step === STEPS.length - 1 ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="self-start py-2 text-sm font-semibold text-stage lg:hidden">Excluir este local</button>
          ) : null}
          <div className="fixed inset-x-0 bottom-[60px] z-30 flex justify-between gap-3 border-t border-line bg-ink-2 px-4 py-3 md:static md:border-0 md:p-0 md:pt-4">
            <Button variant="ghost" onClick={() => setStep(step - 1)} className={step === 0 ? 'invisible' : ''}>Anterior</Button>
            {step < STEPS.length - 1
              ? <Button onClick={() => go(step + 1)} variant="light">Próximo</Button>
              : <Button onClick={() => save('publish')} loading={loading}>{publishLabel}</Button>}
          </div>
        </section>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-ink-2 p-5">
            <p className="font-bold">Salvar</p>
            <p className="text-sm text-mute">{status ? `Status atual: ${VENUE_STATUS[status].label}` : 'Novo local, ainda não salvo.'} Ao publicar, nossa equipe revisa antes de entrar no ar.</p>
            <Button variant="secondary" onClick={() => save('draft')} loading={loading}>Salvar rascunho</Button>
            <Button onClick={() => save('publish')} loading={loading}>{publishLabel}</Button>
          </div>
          {venueId ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-stage/40 p-5">
              <p className="font-bold text-stage">Excluir local</p>
              <p className="text-sm text-mute">Sai da busca e das turnês. Avaliações e histórico ficam ocultos.</p>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>Excluir este local</Button>
            </div>
          ) : null}
        </aside>
      </div>

      <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Sair sem salvar?" size="sm"
        footer={<>
          <Button variant="ghost" className="text-stage" onClick={() => { setDirty(false); router.push('/minha-conta/locais'); }}>Descartar</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmLeave(false)}>Continuar editando</Button>
            <Button variant="light" onClick={() => save('draft')} loading={loading}>Salvar rascunho</Button>
          </div>
        </>}>
        <p>Você tem alterações não salvas neste local.</p>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Excluir “${d.name}”?`} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button variant="danger" loading={loading} onClick={remove}>Excluir local</Button>
        </>}>
        <p>O local sai da busca e das turnês de outros produtores. Você poderá desfazer logo em seguida.</p>
      </Modal>
    </div>
  );
}
