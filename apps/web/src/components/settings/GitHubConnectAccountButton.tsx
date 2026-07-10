export function GitHubConnectAccountButton({
  label,
  action,
}: {
  label: string;
  action: () => Promise<void>;
}) {
  return (
    <form action={action}>
      <button type="submit" className="btn btn-primary btn-sm">
        {label}
      </button>
    </form>
  );
}
