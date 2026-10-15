/** Esqueleto do perfil: mesmo desenho da página, para a troca ser imediata e sem "pulo". */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-32 pt-6 md:px-6" aria-busy="true" aria-label="Carregando local">
      <div className="mb-6 flex flex-col gap-3"><div className="skeleton h-12 w-96 max-w-full" /><div className="skeleton h-5 w-64" /></div>
      <div className="grid h-[300px] grid-cols-4 grid-rows-2 gap-2 md:h-[460px]">
        <div className="skeleton col-span-4 row-span-2 rounded-3xl md:col-span-2" />
        <div className="skeleton hidden md:block" /><div className="skeleton hidden md:block" />
        <div className="skeleton hidden md:block" /><div className="skeleton hidden md:block" />
      </div>
      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="skeleton h-8 w-2/3" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-20" />)}</div>
          <div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-11/12" /><div className="skeleton h-4 w-4/5" />
        </div>
        <div className="skeleton h-96 rounded-3xl lg:w-[360px]" />
      </div>
    </div>
  );
}
