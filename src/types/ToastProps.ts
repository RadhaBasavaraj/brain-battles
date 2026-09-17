export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface Toast extends ToastProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ToastState {
  toasts: Toast[];
}