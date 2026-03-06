import ChatWidgetPage from '@/components/chat/ChatWidgetPage'

export default function WidgetRoute({
  params,
}: {
  params: { projectId: string }
}) {
  return <ChatWidgetPage projectId={params.projectId} />
}
