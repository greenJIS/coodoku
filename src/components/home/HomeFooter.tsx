export const SOURCE_URL = 'https://github.com/greenJIS/coodoku';

const LINK =
  'cursor-pointer underline decoration-edge underline-offset-[3px] transition-colors hover:text-user hover:decoration-brand-500';

export function HomeFooter({ onAbout }: { onAbout: () => void }) {
  return (
    <footer
      className="
      flex justify-center gap-4.5 text-[17px] text-slate-500
    "
    >
      <button type="button" onClick={onAbout} className={LINK}>
        About
      </button>
      <button type="button" onClick={onAbout} className={LINK}>
        Credits
      </button>
      <a href={SOURCE_URL} target="_blank" rel="noreferrer" className={LINK}>
        Source
      </a>
    </footer>
  );
}
