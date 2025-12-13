interface StatCardProps {
  value: string | number;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

export default StatCard;
