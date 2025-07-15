import { DashboardProvider } from '../context/DashboardContext';

function AppRoutes() {
  return (
    <DashboardProvider>
      {/* ...all your routes/components... */}
    </DashboardProvider>
  );
}

export default AppRoutes; 