import { ReactNode } from "react";

interface PageContainerProps {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function PageContainer({
  title,
  children,
  action,
}: PageContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {(title || action) && (
          <div className="flex items-center justify-between mb-6">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
