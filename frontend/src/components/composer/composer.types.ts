export interface ComposerProps {
  scopeLabel: string;
  onSubmit: (message: string) => void;
  disabled?: boolean;
}
