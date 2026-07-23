const stats = [
  ['01', 'Un clic pour jouer'],
  ['∞', 'Des matchs à suivre'],
  ['100 %', 'Pièces fictives'],
]

export function IntroStrip() {
  return (
    <section className="border-b border-white/8 bg-[#15171e] text-white">
      <div data-aos="fade-up" className="mx-auto grid max-w-[1120px] grid-cols-3 divide-x divide-white/10 px-5 py-7 sm:px-8 sm:py-9">
        {stats.map(([value, label]) => (
          <div key={label} className="px-3 text-center sm:px-8">
            <div className="text-lg font-black text-white sm:text-2xl">{value}</div>
            <div className="mt-1 text-[10px] font-bold tracking-[0.12em] text-[#8f94a3] uppercase sm:text-xs">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
