interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
