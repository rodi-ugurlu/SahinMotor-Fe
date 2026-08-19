import { useId, type ReactNode } from 'react';
import './WorkflowSpotlight.css';

interface WorkflowSpotlightProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function WorkflowSpotlight({
  icon,
  title,
  description,
  children,
  actions,
  className = '',
}: WorkflowSpotlightProps) {
  const titleId = useId();
  const classes = ['workflow-spotlight', className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-labelledby={titleId}>
      <div className="workflow-spotlight__brand">
        <span className="workflow-spotlight__icon" aria-hidden="true">
          {icon}
        </span>
        <h1 id={titleId} className="workflow-spotlight__title">{title}</h1>
        <div className="workflow-spotlight__description">{description}</div>
      </div>

      <div className="workflow-spotlight__content">{children}</div>

      <div
        className="workflow-spotlight__actions"
        aria-hidden={actions ? undefined : true}
      >
        {actions}
      </div>
    </section>
  );
}
