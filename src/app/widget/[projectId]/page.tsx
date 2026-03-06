import ChatWidgetPage from '@/components/chat/ChatWidgetPage'

export default async function WidgetRoute({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  return <ChatWidgetPage projectId={projectId} />
}
