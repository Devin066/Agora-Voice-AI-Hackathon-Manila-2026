const urgencyStyles = {
  LOW: "bg-green-100 text-green-800 border-green-300",
  MEDIUM: "bg-orange-100 text-orange-800 border-orange-300",
  HIGH: "bg-red-100 text-red-800 border-red-300",
};

function UrgencyBadge({ urgency = "LOW" }) {
  const level = urgency?.toUpperCase() || "LOW";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${
        urgencyStyles[level] || urgencyStyles.LOW
      }`}
    >
      {level}
    </span>
  );
}

export default UrgencyBadge;
