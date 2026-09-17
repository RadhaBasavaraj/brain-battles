import {TriangleAlert} from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
   return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <TriangleAlert className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Something went wrong!</h1>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
        {/* <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {message}
        </div> */}
        {message && (
          <p className="mb-4 p-3 text-center rounded-lg bg-destructive/10 text-destructive text-sm">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;