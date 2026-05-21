import { useParams } from 'react-router-dom';
export default function ResultPage() {
  const { meetingId } = useParams();
  return <div className="p-6"><h1 className="text-2xl font-bold">AI Result Analysis View ({meetingId})</h1></div>;
}