interface ComingSoonProps {
  title: string;
  description: string;
}

function ComingSoon({
  title,
  description,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
          Network Monitor
        </p>

        <h1 className="mt-3 text-2xl font-bold text-slate-100">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default ComingSoon;