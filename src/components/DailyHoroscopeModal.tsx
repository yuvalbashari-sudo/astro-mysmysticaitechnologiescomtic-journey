import CinematicModalShell from "./CinematicModalShell";
import DailyHoroscopeCard from "./DailyHoroscopeCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DailyHoroscopeModal = ({ isOpen, onClose }: Props) => {
  return (
    <CinematicModalShell isOpen={isOpen} onClose={onClose} hideAdvisor>
      <div className="max-w-lg mx-auto py-6 px-2">
        <DailyHoroscopeCard />
      </div>
    </CinematicModalShell>
  );
};

export default DailyHoroscopeModal;
