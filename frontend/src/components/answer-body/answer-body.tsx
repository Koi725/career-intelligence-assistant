import type { AnswerBodyProps } from "./answer-body.types";

export function AnswerBody({ sections }: AnswerBodyProps) {
  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, index) => (
        <div key={index} className="flex flex-col gap-2">
          {section.heading && (
            <h3 className="font-heading text-lg font-semibold uppercase tracking-wide text-fg">
              {section.heading}
            </h3>
          )}
          {section.paragraph && (
            <p className="text-sm leading-7 text-fg-body text-pretty">{section.paragraph}</p>
          )}
          {section.bullets.length > 0 && (
            <ul className="flex flex-col gap-2">
              {section.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex} className="flex gap-2 text-sm leading-6">
                  <span className="text-accent flex-none">—</span>
                  <span className="text-fg-body">
                    <strong className="font-semibold text-fg">{bullet.lead}</strong>
                    {" "}{bullet.continuation}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
