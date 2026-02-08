interface BadgeProps {
  status:
    | "pending"
    | "downloading"
    | "paused"
    | "injecting"
    | "completed"
    | "failed";
}

const styles: Record<BadgeProps["status"], string> = {
  pending: "bg-gray-100 text-gray-700",
  downloading: "bg-blue-100 text-blue-700",
  paused: "bg-yellow-100 text-yellow-700",
  injecting: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const labels: Record<BadgeProps["status"], string> = {
  pending: "Pending",
  downloading: "Downloading",
  paused: "Paused",
  injecting: "Injecting",
  completed: "Completed",
  failed: "Failed",
};

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
