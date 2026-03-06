export default function PageHeader({ title, description }) {
  return (
    <div className="page-header fade-in-up">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  )
}
