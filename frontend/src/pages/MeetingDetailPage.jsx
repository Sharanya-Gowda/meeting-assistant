import { useParams } from 'react-router-dom';
export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  return <div className="p-6"><h1 className="text-2xl font-bold">Historical Session Audit View ({meetingId})</h1></div>;
}