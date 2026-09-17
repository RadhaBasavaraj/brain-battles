export interface AuthLayoutProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}