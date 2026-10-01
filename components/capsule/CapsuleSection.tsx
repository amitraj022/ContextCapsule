type CapsuleSectionProps = {
  title: string;
  content: string[] | string;
};

export function CapsuleSection({ title, content }: CapsuleSectionProps) {
  const list = Array.isArray(content) ? content : [content];

  return (
    <section className="glass-card rounded-[22px] border p-4 sm:p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted-strong)]">
        {list.map((item, index) => (
          <div key={`${title}-${index}`}>
            {item.startsWith("- ") ? item : item}
          </div>
        ))}
      </div>
    </section>
  );
}
