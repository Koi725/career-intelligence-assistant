export interface ErrorMessageProps {
  userMessage: string;
  onRetry: () => void;
  detail?: string;
}
