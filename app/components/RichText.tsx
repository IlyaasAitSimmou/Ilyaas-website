/**
 * Renders `**emphasis**` inside a plain string as brighter text, so copy in
 * data/copy.ts can highlight a phrase without embedding JSX or HTML.
 */

type Props = {
  text: string;
  /** Class applied to the emphasised runs. */
  strongClassName?: string;
};

const RichText = ({ text, strongClassName }: Props) => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        // Odd indices are the captured groups, i.e. the emphasised runs.
        i % 2 === 1 ? (
          <strong key={i} className={strongClassName}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
};

export default RichText;
